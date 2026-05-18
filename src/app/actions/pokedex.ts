"use server";

import { prisma } from "@/lib/db";

export interface LocalizedStrings {
  en: string;
  es: string;
}

export interface PokemonAbilityDetail {
  nombre: string;
  slug: string;
  nombres: LocalizedStrings;
  descripciones: LocalizedStrings;
}

export interface PokemonSearchResult {
  id: string;
  nombre: string;
  slug: string;
  nombres: LocalizedStrings;
  descripciones: LocalizedStrings;
  categorias: LocalizedStrings;
  tipos: string[];
  tier: string;
  sprite_url: string;
  stats_base: Record<string, number>;
  habilidades: string[];
  habilidades_detalles?: PokemonAbilityDetail[];
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
  usage_stats?: Record<string, number>;
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

/**
 * Obtiene el listado paginado de Pokémon aplicando filtros avanzados.
 * Se utiliza queryRawUnsafe debido a la complejidad de las consultas sobre campos JSONB
 * y la necesidad de filtrado condicional dinámico que el Query Builder estándar de Prisma
 * no soporta de forma eficiente para PostgreSQL.
 */
export async function getAllPokemon(
  page = 1,
  perPage = 48,
  filters?: PokemonFilters,
  sortBy: string = "num",
  sortOrder: "asc" | "desc" = "asc"
): Promise<{ pokemon: PokemonSearchResult[]; total: number }> {
  try {
    const { conditions, params, nextParamIdx } = buildWhereClause(filters);
    const where = conditions.length > 0 ? conditions.join(" AND ") : "1=1";
    const orderSql = buildOrderBy(sortBy, sortOrder);

    const [countResult, databaseRecords] = await Promise.all([
      prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) FROM "Criatura" WHERE ${where}`, 
        ...params
      ),
      prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT id, nombre, slug, nombres, descripciones, categorias, es_fakemon,
        jsonb_build_object(
          'tipos', "atributos_de_combate"->'tipos',
          'tier', "atributos_de_combate"->'tier',
          'sprite_url', "atributos_de_combate"->'sprite_url',
          'stats_base', "atributos_de_combate"->'stats_base',
          'habilidades', "atributos_de_combate"->'habilidades',
          'tags', "atributos_de_combate"->'tags',
          'generacion', "atributos_de_combate"->'generacion',
          'num', "atributos_de_combate"->'num',
          'peso', "atributos_de_combate"->'peso',
          'altura', "atributos_de_combate"->'altura',
          'usage_stats', "atributos_de_combate"->'usage_stats'
        ) AS "atributos_de_combate"
        FROM "Criatura" WHERE ${where} ORDER BY ${orderSql} LIMIT $${nextParamIdx} OFFSET $${nextParamIdx + 1}`,
        ...params, 
        perPage, 
        (page - 1) * perPage
      ),
    ]);

    return {
      total: Number(countResult[0].count),
      pokemon: databaseRecords.map(mapToSearchResult),
    };
  } catch (error) {
    throw new Error(`Failed to fetch pokedex: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function buildWhereClause(filters?: PokemonFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (!filters?.showCap) {
    conditions.push(`"es_fakemon" = false`);
  }

  if (filters?.searchQuery) {
    const query = filters.searchQuery.trim().toLowerCase();
    if (!isNaN(Number(query))) {
      conditions.push(`("atributos_de_combate"->>'num')::int = $${idx++}`);
      params.push(Number(query));
    } else {
      // Blindaje estricto de lang para evitar inyecciones en el jsonb path
      const cleanLang = (filters.lang === "es" || filters.lang === "en") ? filters.lang : "en";
      conditions.push(`(LOWER("nombres"->>'${cleanLang}') LIKE $${idx} OR LOWER("nombre") LIKE $${idx})`);
      params.push(`%${query}%`);
      idx++;
    }
  }

  if (filters?.types && filters.types.values.length > 0) {
    if (filters.types.logic === "AND") {
      conditions.push(`"atributos_de_combate"->'tipos' @> $${idx++}::jsonb`);
      params.push(JSON.stringify(filters.types.values));
    } else {
      conditions.push(`"atributos_de_combate"->'tipos' ?| ARRAY[${filters.types.values.map(() => `$${idx++}`).join(",")}]`);
      filters.types.values.forEach(value => params.push(value));
    }
  }

  if (filters?.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map(() => `"atributos_de_combate"->'tags' @> $${idx++}::jsonb`);
    conditions.push(`(${tagConditions.join(" OR ")})`);
    filters.tags.forEach(tag => params.push(JSON.stringify([tag])));
  }

  if (filters?.generations && filters.generations.length > 0) {
    conditions.push(`("atributos_de_combate"->>'generacion')::int = ANY($${idx++}::int[])`);
    params.push(filters.generations);
  }

  if (filters?.tiers && filters.tiers.length > 0) {
    conditions.push(`"atributos_de_combate"->>'tier' = ANY($${idx++}::text[])`);
    params.push(filters.tiers);
  }

  if (filters?.abilities && filters.abilities.length > 0) {
    conditions.push(`"atributos_de_combate"->'habilidades' ?| ARRAY[${filters.abilities.map(() => `$${idx++}`).join(",")}]`);
    filters.abilities.forEach(ability => params.push(ability));
  }

  if (filters?.stats) {
    for (const [stat, range] of Object.entries(filters.stats)) {
      if (!range) continue;
      // Blindar contra inyecciones SQL a través de llaves de objetos dinámicas de estadísticas
      if (stat !== "bst" && !STAT_KEYS.includes(stat)) {
        continue;
      }
      const { min, max } = range as { min?: number; max?: number };
      
      let statSql: string;
      if (stat === "bst") {
        statSql = STAT_KEYS.map(key => `("atributos_de_combate"->'stats_base'->>'${key}')::int`).join(" + ");
      } else {
        statSql = `("atributos_de_combate"->'stats_base'->>'${stat}')::int`;
      }

      if (min !== undefined) {
        conditions.push(`(${statSql}) >= $${idx++}`);
        params.push(min);
      }
      if (max !== undefined) {
        conditions.push(`(${statSql}) <= $${idx++}`);
        params.push(max);
      }
    }
  }

  if (filters?.weight) {
    const { min, max } = filters.weight;
    if (min !== undefined) {
      conditions.push(`("atributos_de_combate"->>'peso')::float >= $${idx++}`);
      params.push(min);
    }
    if (max !== undefined) {
      conditions.push(`("atributos_de_combate"->>'peso')::float <= $${idx++}`);
      params.push(max);
    }
  }

  return { conditions, params, nextParamIdx: idx };
}

function buildOrderBy(sortBy: string, sortOrder: "asc" | "desc"): string {
  const direction = sortOrder === "desc" ? "DESC" : "ASC";
  if (sortBy === "nombre") return `"nombre" ${direction}`;
  
  if (sortBy === "bst") {
    const bstSum = STAT_KEYS.map(key => `("atributos_de_combate"->'stats_base'->>'${key}')::int`).join(" + ");
    return `(${bstSum}) ${direction}, "nombre" ASC`;
  }
  
  if (STAT_KEYS.includes(sortBy)) {
    return `("atributos_de_combate"->'stats_base'->>'${sortBy}')::int ${direction}, "nombre" ASC`;
  }

  return `("atributos_de_combate"->>'num')::int ${direction}, LENGTH("nombre") ASC, "nombre" ASC`;
}

export async function getPokemonBySlug(slug: string): Promise<PokemonSearchResult | null> {
  try {
    const record = await prisma.criatura.findFirst({
      where: { slug: { equals: slug.toLowerCase() } },
    });
    if (!record) return null;

    const result = mapToSearchResult(record as unknown as Record<string, unknown>);
    
    if (result.habilidades.length > 0) {
      const details = await prisma.habilidad.findMany({
        where: { nombre: { in: result.habilidades } }
      });
      result.habilidades_detalles = details.map(detail => ({
        nombre: detail.nombre,
        slug: detail.slug,
        nombres: detail.nombres as unknown as LocalizedStrings,
        descripciones: detail.descripciones as unknown as LocalizedStrings
      }));
    }
    return result;
  } catch (error) {
    throw new Error(`Failed to get pokemon by slug: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function mapToSearchResult(record: Record<string, unknown>): PokemonSearchResult {
  const combatAttributes = (record.atributos_de_combate as Record<string, unknown>) || {};
  return {
    id: String(record.id),
    nombre: String(record.nombre),
    slug: String(record.slug || record.nombre),
    nombres: (record.nombres as unknown as LocalizedStrings) || { en: "", es: "" },
    descripciones: (record.descripciones as unknown as LocalizedStrings) || { en: "", es: "" },
    categorias: (record.categorias as unknown as LocalizedStrings) || { en: "", es: "" },
    tipos: Array.isArray(combatAttributes.tipos) ? combatAttributes.tipos.map(String) : [],
    tier: String(combatAttributes.tier || "Unknown"),
    sprite_url: String(combatAttributes.sprite_url || ""),
    stats_base: (combatAttributes.stats_base as Record<string, number>) || {},
    habilidades: Array.isArray(combatAttributes.habilidades) ? combatAttributes.habilidades.map(String) : [],
    tags: Array.isArray(combatAttributes.tags) ? combatAttributes.tags.map(String) : [],
    generacion: Number(combatAttributes.generacion) || 1,
    num: Number(combatAttributes.num) || 0,
    peso: Number(combatAttributes.peso) || 0,
    altura: Number(combatAttributes.altura) || 0,
    egg_groups: Array.isArray(combatAttributes.egg_groups) ? combatAttributes.egg_groups.map(String) : [],
    learnset: Array.isArray(combatAttributes.learnset) ? combatAttributes.learnset.map(String) : [],
    evolution_chain: Array.isArray(combatAttributes.evolution_chain) ? combatAttributes.evolution_chain.map(String) : [],
    weaknesses: Array.isArray(combatAttributes.weaknesses) ? combatAttributes.weaknesses.map(String) : [],
    resistances: Array.isArray(combatAttributes.resistances) ? combatAttributes.resistances.map(String) : [],
    immunities: Array.isArray(combatAttributes.immunities) ? combatAttributes.immunities.map(String) : [],
    usage_stats: (combatAttributes.usage_stats as Record<string, number>) || {},
  };
}

export async function getAllFakemons(): Promise<PokemonSearchResult[]> {
  try {
    const fakemons = await prisma.criatura.findMany({
      where: { es_fakemon: true },
      orderBy: { nombre: "asc" }
    });
    return fakemons.map(record => mapToSearchResult(record as unknown as Record<string, unknown>));
  } catch (error) {
    throw new Error(`Failed to fetch fakemons: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function searchPokemonSpecies(query: string, limit = 50): Promise<{ nombre: string; slug: string }[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const records = await prisma.criatura.findMany({
    where: {
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit,
    select: {
      nombre: true,
      slug: true,
    },
    orderBy: { nombre: "asc" },
  });
  return records;
}

