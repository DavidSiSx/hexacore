"use server";

import { prisma } from "@/lib/db";

export interface SmogonUsageStat {
  rank: number;
  pokemon: string;
  usage: number; // Porcentaje de uso (0-100)
  abilities: Record<string, number>;
  items: Record<string, number>;
  moves: Record<string, number>;
  teammates: Record<string, number>;
  spreads: Record<string, number>; // "Nature:HP/Atk/Def/SpA/SpD/Spe" -> usage
  spriteUrl: string;
}

export interface MetagameData {
  format: string;
  totalBattles: number;
  pokemonList: SmogonUsageStat[];
}

/**
 * Intenta descargar los datos de Smogon probando diferentes ratings y meses si es necesario.
 */
async function fetchSmogonChaos(format: string): Promise<{ data: any; info: any } | null> {
  const now = new Date();
  
  // Probamos los últimos 2 meses (el actual puede estar vacío)
  const monthsToTry = [0, 1].map(offset => {
    const d = new Date();
    d.setMonth(d.getMonth() - offset);
    const adjusted = new Date(d.getFullYear(), d.getMonth() - 1);
    return {
      year: adjusted.getFullYear(),
      month: String(adjusted.getMonth() + 1).padStart(2, '0')
    };
  });

  const cutoffs = (format.includes("ou") || format.includes("nationaldex")) 
    ? [1695, 1630, 1825, 1760, 1500, 0] 
    : [1630, 1760, 1500, 0];

  for (const { year, month } of monthsToTry) {
    for (const cutoff of cutoffs) {
      const url = `https://www.smogon.com/stats/${year}-${month}/chaos/${format}-${cutoff}.json`;
      try {
        // Desactivamos el data cache nativo de Next.js (cache: "no-store") porque Smogon chaos files superan los 18MB
        // y Next.js tiene un límite estricto de 2MB por objeto guardado en su caché de disco.
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) {
          const raw = await response.json();
          if (raw.data && raw.info) return raw;
        }
      } catch (e) {
        continue;
      }
    }
  }
  return null;
}

interface MemoryCacheEntry {
  data: MetagameData;
  timestamp: number;
}

// Caché en memoria para evitar descargar y procesar archivos masivos en cada petición
const metagameCache: Record<string, MemoryCacheEntry> = {};
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

export async function getMetagameStats(format: string = "gen9ou"): Promise<MetagameData> {
  // Blindaje preventivo contra SSRF y manipulación de rutas externas
  if (!/^[a-z0-9-]+$/.test(format)) {
    throw new Error("Invalid format parameter.");
  }

  const ahora = Date.now();
  const cached = metagameCache[format];
  if (cached && (ahora - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[MetagameStats] Retornando datos procesados desde caché de memoria RAM para: ${format}`);
    return cached.data;
  }

  try {
    const rawData = await fetchSmogonChaos(format);
    
    if (!rawData) {
      throw new Error(`No data found for format ${format} in recent Smogon stats.`);
    }

    const { info, data } = rawData;

    // 2. Procesar y ordenar por uso
    const processed: SmogonUsageStat[] = await Promise.all(
      Object.entries(data)
        .map(async ([name, stats]: [string, any]) => {
          const pokemon = await prisma.criatura.findFirst({
            where: { nombre: name },
            select: { nombre: true, atributos_de_combate: true }
          });

          const attrs = (pokemon?.atributos_de_combate as any) || {};
          const rawCount = stats["Raw count"] || 1;
          
          const normalize = (record: Record<string, number>) => {
            const result: Record<string, number> = {};
            if (!record) return result;
            Object.entries(record).forEach(([k, v]) => {
              result[k] = (v / rawCount) * 100;
            });
            return result;
          };

          return {
            rank: 0,
            pokemon: name,
            usage: (stats.usage || 0) * 100,
            abilities: normalize(stats.Abilities),
            items: normalize(stats.Items),
            moves: normalize(stats.Moves),
            teammates: normalize(stats.Teammates),
            spreads: normalize(stats.Spreads),
            spriteUrl: attrs.spriteUrl || `https://play.pokemonshowdown.com/sprites/gen5/${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.png`
          };
        })
    );

    const sorted = processed
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 100)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const resultData: MetagameData = {
      format: info.metagame || format,
      totalBattles: info["number of battles"] || 0,
      pokemonList: sorted
    };

    // Guardamos en el caché de memoria
    metagameCache[format] = {
      data: resultData,
      timestamp: ahora
    };

    return resultData;

  } catch (error) {
    console.error("Error fetching metagame stats:", error);
    return {
      format,
      totalBattles: 0,
      pokemonList: []
    };
  }
}

export interface StandardSet {
  ability: string;
  item: string;
  nature: string;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  moves: string[];
}

/**
 * Obtiene el set más común para un Pokémon específico.
 */
export async function getStandardSet(pokemonName: string, format: string = "gen9ou"): Promise<StandardSet | null> {
  const stats = await getMetagameStats(format);
  const p = stats.pokemonList.find(x => x.pokemon === pokemonName);
  if (!p) return null;

  const getTop = (record: Record<string, number>) => 
    Object.entries(record).sort((a, b) => b[1] - a[1])[0]?.[0];

  const topSpreadStr = getTop(p.spreads);
  let nature = "Hardy";
  let evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

  if (topSpreadStr) {
    const [n, e] = topSpreadStr.split(":");
    nature = n;
    const parts = e.split("/").map(Number);
    evs = { hp: parts[0], atk: parts[1], def: parts[2], spa: parts[3], spd: parts[4], spe: parts[5] };
  }

  return {
    ability: getTop(p.abilities) || "None",
    item: getTop(p.items) || "None",
    nature,
    evs,
    moves: Object.entries(p.moves).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0])
  };
}
