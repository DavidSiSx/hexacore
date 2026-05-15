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
    // Nota: Las stats de Mayo (05) se publican en Junio. 
    // Si estamos en Mayo 15, necesitamos las de Abril (04).
    const adjusted = new Date(d.getFullYear(), d.getMonth() - 1);
    return {
      year: adjusted.getFullYear(),
      month: String(adjusted.getMonth() + 1).padStart(2, '0')
    };
  });

  // Cutoffs comunes en Smogon
  const cutoffs = format.includes("ou") ? [1695, 1825, 1500, 0] : [1630, 1760, 1500, 0];

  for (const { year, month } of monthsToTry) {
    for (const cutoff of cutoffs) {
      const url = `https://www.smogon.com/stats/${year}-${month}/chaos/${format}-${cutoff}.json`;
      try {
        const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h
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

export async function getMetagameStats(format: string = "gen9ou"): Promise<MetagameData> {
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
            spriteUrl: attrs.spriteUrl || `https://play.pokemonshowdown.com/sprites/gen5/${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.png`
          };
        })
    );

    const sorted = processed
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 100)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    return {
      format: info.metagame || format,
      totalBattles: info["number of battles"] || 0,
      pokemonList: sorted
    };

  } catch (error) {
    console.error("Error fetching metagame stats:", error);
    return {
      format,
      totalBattles: 0,
      pokemonList: []
    };
  }
}
