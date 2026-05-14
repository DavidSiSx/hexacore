"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

export interface PokemonSearchResult {
  id: string;
  nombre: string;
  nombres?: any;
  descripciones?: any;
  categorias?: any;
  tipos: string[];
  tier: string;
  sprite_url: string;
  stats_base: Record<string, number>;
  habilidades: string[];
  tags?: string[];
  generacion?: number;
  num?: number;
  peso?: number;
  altura?: number;
  egg_groups?: string[];
  learnset?: string[];
  evolution_chain?: string[];
  weaknesses?: string[];
  resistances?: string[];
  immunities?: string[];
}

export interface PokemonFilters {
  searchQuery?: string;
  lang?: string;
  types?: { values: string[]; logic: "AND" | "OR" };
  abilities?: string[];
  moves?: string[];
  tags?: string[];
  tiers?: string[];
  generations?: number[];
  stats?: {
    bst?: { min?: number; max?: number };
    hp?: { min?: number; max?: number };
    atk?: { min?: number; max?: number };
    def?: { min?: number; max?: number };
    spa?: { min?: number; max?: number };
    spd?: { min?: number; max?: number };
    spe?: { min?: number; max?: number };
  };
  weight?: { min?: number; max?: number };
  showGimmicks?: boolean;
  showCap?: boolean;
}

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];

export async function getAllPokemon(
  page = 1,
  perPage = 48,
  filters?: PokemonFilters,
  sortBy: string = "num",
  sortOrder: "asc" | "desc" = "asc"
): Promise<{ pokemon: PokemonSearchResult[]; total: number }> {
  
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  // CAPs / Fakemons
  if (!filters?.showCap) {
    conditions.push(`"es_fakemon" = false`);
  }

  // Gimmicks
  if (!filters?.showGimmicks) {
    // Exclude megas, primals, gigantamax if not explicitly asked
    conditions.push(`NOT ("atributos_de_combate"->'tags' @> '"mega"' OR "atributos_de_combate"->'tags' @> '"primal"' OR "atributos_de_combate"->'tags' @> '"gigantamax"')`);
    conditions.push(`"nombre" NOT ILIKE '%-mega%' AND "nombre" NOT ILIKE '%-gmax%' AND "nombre" NOT ILIKE '%-primal%'`);
  }

  if (filters?.searchQuery) {
    const q = filters.searchQuery.trim().toLowerCase();
    const isNum = !isNaN(Number(q));
    
    if (isNum) {
      conditions.push(`("atributos_de_combate"->>'num')::int = $${paramIdx}`);
      params.push(Number(q));
      paramIdx++;
    } else {
      const lang = filters.lang || "en";
      conditions.push(`(LOWER("nombres"->>'${lang}') LIKE $${paramIdx} OR LOWER("nombre") LIKE $${paramIdx})`);
      params.push(`%${q}%`);
      paramIdx++;
    }
  }

  if (filters?.types && filters.types.values.length > 0) {
    const typeArr = JSON.stringify(filters.types.values);
    if (filters.types.logic === "AND") {
      conditions.push(`"atributos_de_combate"->'tipos' @> $${paramIdx}::jsonb`);
      params.push(typeArr);
      paramIdx++;
    } else {
      conditions.push(`"atributos_de_combate"->'tipos' ?| ARRAY[${filters.types.values.map((_, i) => `$${paramIdx + i}`).join(",")}]`);
      filters.types.values.forEach(v => params.push(v));
      paramIdx += filters.types.values.length;
    }
  }

  if (filters?.tags && filters.tags.length > 0) {
    conditions.push(`"atributos_de_combate"->'tags' @> $${paramIdx}::jsonb`);
    params.push(JSON.stringify(filters.tags));
    paramIdx++;
  }

  if (filters?.generations && filters.generations.length > 0) {
    conditions.push(`("atributos_de_combate"->>'generacion')::int = ANY($${paramIdx}::int[])`);
    params.push(filters.generations);
    paramIdx++;
  }

  if (filters?.tiers && filters.tiers.length > 0) {
    conditions.push(`"atributos_de_combate"->>'tier' = ANY($${paramIdx}::text[])`);
    params.push(filters.tiers);
    paramIdx++;
  }

  if (filters?.abilities && filters.abilities.length > 0) {
    conditions.push(`"atributos_de_combate"->'habilidades' ?& ARRAY[${filters.abilities.map((_, i) => `$${paramIdx + i}`).join(",")}]`);
    filters.abilities.forEach(a => params.push(a));
    paramIdx += filters.abilities.length;
  }

  if (filters?.moves && filters.moves.length > 0) {
    conditions.push(`"atributos_de_combate"->'learnset' ?& ARRAY[${filters.moves.map((_, i) => `$${paramIdx + i}`).join(",")}]`);
    filters.moves.forEach(m => params.push(m));
    paramIdx += filters.moves.length;
  }

  if (filters?.stats) {
    const statsObj = filters.stats as Record<string, {min?: number, max?: number}>;
    for (const stat of STAT_KEYS) {
      if (statsObj[stat]) {
        if (statsObj[stat].min !== undefined) {
          conditions.push(`("atributos_de_combate"->'stats_base'->>'${stat}')::int >= $${paramIdx}`);
          params.push(statsObj[stat].min);
          paramIdx++;
        }
        if (statsObj[stat].max !== undefined) {
          conditions.push(`("atributos_de_combate"->'stats_base'->>'${stat}')::int <= $${paramIdx}`);
          params.push(statsObj[stat].max);
          paramIdx++;
        }
      }
    }
    // Handle BST
    if (statsObj.bst) {
      const sumQuery = STAT_KEYS.map(s => `("atributos_de_combate"->'stats_base'->>'${s}')::int`).join(" + ");
      if (statsObj.bst.min !== undefined) {
        conditions.push(`(${sumQuery}) >= $${paramIdx}`);
        params.push(statsObj.bst.min);
        paramIdx++;
      }
      if (statsObj.bst.max !== undefined) {
        conditions.push(`(${sumQuery}) <= $${paramIdx}`);
        params.push(statsObj.bst.max);
        paramIdx++;
      }
    }
  }

  if (filters?.weight) {
    if (filters.weight.min !== undefined) {
      conditions.push(`("atributos_de_combate"->>'peso')::float >= $${paramIdx}`);
      params.push(filters.weight.min);
      paramIdx++;
    }
    if (filters.weight.max !== undefined) {
      conditions.push(`("atributos_de_combate"->>'peso')::float <= $${paramIdx}`);
      params.push(filters.weight.max);
      paramIdx++;
    }
  }

  const where = conditions.length > 0 ? conditions.join(" AND ") : "1=1";
  
  let orderSql = `("atributos_de_combate"->>'num')::int ASC, LENGTH("nombre") ASC, "nombre" ASC`;
  if (sortBy === "hp" || sortBy === "atk" || sortBy === "def" || sortBy === "spa" || sortBy === "spd" || sortBy === "spe") {
    orderSql = `("atributos_de_combate"->'stats_base'->>'${sortBy}')::int ${sortOrder === "desc" ? "DESC" : "ASC"}, LENGTH("nombre") ASC, "nombre" ASC`;
  }

  const [countResult, criaturas] = await Promise.all([
    prisma.$queryRawUnsafe<[{ count: bigint }]>(`SELECT COUNT(*) FROM "Criatura" WHERE ${where}`, ...params),
    prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "Criatura" WHERE ${where} ORDER BY ${orderSql} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      ...params, perPage, (page - 1) * perPage
    ),
  ]);

  return {
    total: Number(countResult[0].count),
    pokemon: criaturas.map(mapCriatura),
  };
}

export async function getPokemonByName(name: string): Promise<PokemonSearchResult | null> {
  const c = await prisma.criatura.findFirst({
    where: { nombre: { equals: name, mode: "insensitive" } },
  });
  return c ? mapCriatura(c) : null;
}

function mapCriatura(c: any): PokemonSearchResult {
  const attrs = c.atributos_de_combate as any;
  return {
    id: c.id,
    nombre: c.nombre,
    nombres: c.nombres,
    descripciones: c.descripciones,
    categorias: c.categorias,
    tipos: attrs?.tipos || [],
    tier: attrs?.tier || "Unknown",
    sprite_url: attrs?.sprite_url || "",
    stats_base: attrs?.stats_base || {},
    habilidades: attrs?.habilidades || [],
    tags: attrs?.tags || [],
    generacion: attrs?.generacion,
    num: attrs?.num,
    peso: attrs?.peso,
    altura: attrs?.altura,
    egg_groups: attrs?.egg_groups || [],
    learnset: attrs?.learnset || [],
    evolution_chain: attrs?.evolution_chain || [],
    weaknesses: attrs?.weaknesses || [],
    resistances: attrs?.resistances || [],
    immunities: attrs?.immunities || [],
  };
}

export async function getAllFakemons(): Promise<PokemonSearchResult[]> {
  const fakemons = await prisma.criatura.findMany({
    where: { es_fakemon: true },
    orderBy: { nombre: "asc" }
  });
  return fakemons.map(mapCriatura);
}
