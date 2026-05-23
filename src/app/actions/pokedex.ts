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
    const where: any = {};
    if (!filters?.showCap) {
      where.es_fakemon = false;
    }

    const allRecords = await prisma.criatura.findMany({
      where,
    });

    let results = allRecords.map(mapToSearchResult);

    // Apply filtering in memory
    if (filters?.searchQuery) {
      const q = filters.searchQuery.trim().toLowerCase();
      if (!isNaN(Number(q))) {
        const numQuery = Number(q);
        results = results.filter(r => r.num === numQuery);
      } else {
        const cleanLang = (filters.lang === "es" || filters.lang === "en") ? filters.lang : "en";
        results = results.filter(r => 
          r.nombre.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          (r.nombres?.[cleanLang] && r.nombres[cleanLang].toLowerCase().includes(q)) ||
          (r.nombres?.es && r.nombres.es.toLowerCase().includes(q))
        );
      }
    }

    if (filters?.types && filters.types.values.length > 0) {
      const typeVals = filters.types.values.map(v => v.toLowerCase());
      if (filters.types.logic === "AND") {
        results = results.filter(r => 
          typeVals.every(tv => r.tipos.map(t => t.toLowerCase()).includes(tv))
        );
      } else {
        results = results.filter(r => 
          typeVals.some(tv => r.tipos.map(t => t.toLowerCase()).includes(tv))
        );
      }
    }

    if (filters?.tags && filters.tags.length > 0) {
      const filterTags = filters.tags.map(t => t.toLowerCase());
      results = results.filter(r => {
        const rTags = (r.tags || []).map(t => t.toLowerCase());
        return filterTags.every(ft => rTags.includes(ft));
      });
    }

    if (filters?.generations && filters.generations.length > 0) {
      results = results.filter(r => r.generacion !== undefined && filters.generations!.includes(r.generacion));
    }

    if (filters?.tiers && filters.tiers.length > 0) {
      const filterTiers = filters.tiers.map(t => t.toLowerCase());
      results = results.filter(r => filterTiers.includes(r.tier.toLowerCase()));
    }

    if (filters?.abilities && filters.abilities.length > 0) {
      const filterAbilities = filters.abilities.map(a => a.toLowerCase());
      results = results.filter(r => 
        (r.habilidades || []).some(hab => filterAbilities.includes(hab.toLowerCase()))
      );
    }

    if (filters?.stats) {
      for (const [stat, range] of Object.entries(filters.stats)) {
        if (!range) continue;
        if (stat !== "bst" && !STAT_KEYS.includes(stat)) continue;
        const { min, max } = range as { min?: number; max?: number };

        results = results.filter(r => {
          let val = 0;
          if (stat === "bst") {
            val = STAT_KEYS.reduce((sum, key) => sum + (r.stats_base[key] || 0), 0);
          } else {
            val = r.stats_base[stat] || 0;
          }

          if (min !== undefined && val < min) return false;
          if (max !== undefined && val > max) return false;
          return true;
        });
      }
    }

    if (filters?.weight) {
      const { min, max } = filters.weight;
      results = results.filter(r => {
        const w = r.peso || 0;
        if (min !== undefined && w < min) return false;
        if (max !== undefined && w > max) return false;
        return true;
      });
    }

    // Apply sorting in memory
    results.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortBy === "nombre") {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortBy === "bst") {
        valA = STAT_KEYS.reduce((sum, key) => sum + (a.stats_base[key] || 0), 0);
        valB = STAT_KEYS.reduce((sum, key) => sum + (b.stats_base[key] || 0), 0);
      } else if (STAT_KEYS.includes(sortBy)) {
        valA = a.stats_base[sortBy] || 0;
        valB = b.stats_base[sortBy] || 0;
      } else {
        // default by num
        valA = a.num || 0;
        valB = b.num || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      
      // Secondary sorting to keep it stable
      return a.nombre.localeCompare(b.nombre);
    });

    const total = results.length;
    const paginated = results.slice((page - 1) * perPage, page * perPage);

    return {
      total,
      pokemon: paginated,
    };
  } catch (error) {
    throw new Error(`Failed to fetch pokedex: ${error instanceof Error ? error.message : String(error)}`);
  }
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
    tipos: Array.isArray(combatAttributes.types) 
      ? combatAttributes.types.map(String) 
      : (Array.isArray(combatAttributes.tipos) ? combatAttributes.tipos.map(String) : []),
    tier: String(combatAttributes.tier || "Unknown"),
    sprite_url: String(combatAttributes.spriteUrl || combatAttributes.sprite_url || ""),
    stats_base: (combatAttributes.baseStats as Record<string, number>) || (combatAttributes.stats_base as Record<string, number>) || {},
    habilidades: Array.isArray(combatAttributes.abilities) 
      ? combatAttributes.abilities.map(String) 
      : (Array.isArray(combatAttributes.habilidades) ? combatAttributes.habilidades.map(String) : []),
    tags: Array.isArray(combatAttributes.tags) ? combatAttributes.tags.map(String) : [],
    generacion: Number(combatAttributes.generation || combatAttributes.generacion) || 1,
    num: Number(combatAttributes.num) || 0,
    peso: Number(combatAttributes.weight || combatAttributes.peso) || 0,
    altura: Number(combatAttributes.height || combatAttributes.altura) || 0,
    egg_groups: Array.isArray(combatAttributes.eggGroups) 
      ? combatAttributes.eggGroups.map(String) 
      : (Array.isArray(combatAttributes.egg_groups) ? combatAttributes.egg_groups.map(String) : []),
    learnset: Array.isArray(combatAttributes.learnset) ? combatAttributes.learnset.map(String) : [],
    evolution_chain: Array.isArray(combatAttributes.evolutionChain) 
      ? combatAttributes.evolutionChain.map(String) 
      : (Array.isArray(combatAttributes.evolution_chain) ? combatAttributes.evolution_chain.map(String) : []),
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
        { nombre: { contains: q } },
        { slug: { contains: q } },
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

