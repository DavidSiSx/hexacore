"use server";

import { prisma } from "@/lib/db";

export interface PokemonSearchResult {
  id: string;
  nombre: string;
  tipos: string[];
  tier: string;
  sprite_url: string;
  stats_base: Record<string, number>;
  habilidades: string[];
  pokedex_entry?: string;
}

/** Buscar Pokémon en la base de datos con validación. Solo devuelve Pokémon reales. */
export async function searchPokemon(query: string, limit: number = 30): Promise<PokemonSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const criaturas = await prisma.criatura.findMany({
    where: {
      nombre: { contains: query.trim(), mode: "insensitive" },
      es_fakemon: false,
    },
    take: limit,
    orderBy: { popularidad_score: "desc" },
  });

  return criaturas.map((c) => {
    const attrs = c.atributos_de_combate as any;
    return {
      id: c.id,
      nombre: c.nombre,
      tipos: attrs?.tipos || [],
      tier: attrs?.tier || "Unknown",
      sprite_url: attrs?.sprite_url || "",
      stats_base: attrs?.stats_base || {},
      habilidades: attrs?.habilidades || [],
      pokedex_entry: attrs?.pokedex_entry,
    };
  });
}

/** Obtener un Pokémon específico por nombre (para la página de detalle) */
export async function getPokemonByName(name: string): Promise<PokemonSearchResult | null> {
  const criatura = await prisma.criatura.findFirst({
    where: { nombre: { equals: name, mode: "insensitive" }, es_fakemon: false },
  });

  if (!criatura) return null;

  const attrs = criatura.atributos_de_combate as any;
  return {
    id: criatura.id,
    nombre: criatura.nombre,
    tipos: attrs?.tipos || [],
    tier: attrs?.tier || "Unknown",
    sprite_url: attrs?.sprite_url || "",
    stats_base: attrs?.stats_base || {},
    habilidades: attrs?.habilidades || [],
    pokedex_entry: attrs?.pokedex_entry,
    // Enriched fields
    peso: attrs?.peso,
    altura: attrs?.altura,
    generacion: attrs?.generacion,
    egg_groups: attrs?.egg_groups || [],
    learnset: attrs?.learnset || [],
    evolution_chain: attrs?.evolution_chain || [],
    weaknesses: attrs?.weaknesses || [],
    resistances: attrs?.resistances || [],
    immunities: attrs?.immunities || [],
    tags: attrs?.tags || [],
    num: attrs?.num,
  } as any;
}

/** Obtener todos los Pokémon (con paginación para el grid) */
export async function getAllPokemon(page: number = 1, perPage: number = 48): Promise<{
  pokemon: PokemonSearchResult[];
  total: number;
}> {
  const [criaturas, total] = await Promise.all([
    prisma.criatura.findMany({
      where: { es_fakemon: false },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { nombre: "asc" },
    }),
    prisma.criatura.count({ where: { es_fakemon: false } }),
  ]);

  return {
    total,
    pokemon: criaturas.map((c) => {
      const attrs = c.atributos_de_combate as any;
      return {
        id: c.id,
        nombre: c.nombre,
        tipos: attrs?.tipos || [],
        tier: attrs?.tier || "Unknown",
        sprite_url: attrs?.sprite_url || "",
        stats_base: attrs?.stats_base || {},
        habilidades: attrs?.habilidades || [],
      };
    }),
  };
}
