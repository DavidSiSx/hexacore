"use server";

import { prisma } from "@/lib/db";

// ── MOVES ────────────────────────────────────────────────
export interface MoveResult {
  id: string;
  nombre: string;
  nombres?: any;
  tipo: string;
  categoria: string;
  potencia: number;
  precision: number;
  descripciones?: any;
  atributos: any;
}

export interface MoveFilters {
  tipo?: string;
  categoria?: string;
}

export async function searchMoves(query: string, limit = 50): Promise<MoveResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const moves = await prisma.movimiento.findMany({
    where: {
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { nombres: { path: ["es"], string_contains: q } },
        { nombres: { path: ["en"], string_contains: q } }
      ]
    },
    take: limit,
    orderBy: { nombre: "asc" },
  });
  return moves.map(m => ({ ...m, atributos: m.atributos as any }));
}

export async function getAllMoves(page = 1, perPage = 60, filters?: MoveFilters & { searchQuery?: string; lang?: string }): Promise<{ moves: MoveResult[]; total: number }> {
  const where: any = {};
  if (filters?.tipo) where.tipo = filters.tipo;
  if (filters?.categoria) where.categoria = filters.categoria;
  
  if (filters?.searchQuery) {
    const q = filters.searchQuery.trim().toLowerCase();
    const lang = filters.lang || "en";
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { nombres: { path: [lang], string_contains: q } },
      { nombres: { path: ["es"], string_contains: q } }
    ];
  }

  const [moves, total] = await Promise.all([
    prisma.movimiento.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { nombre: "asc" } }),
    prisma.movimiento.count({ where }),
  ]);
  return { total, moves: moves.map(m => ({ ...m, atributos: m.atributos as any })) };
}

export async function getMoveBySlug(slug: string): Promise<MoveResult | null> {
  const m = await prisma.movimiento.findUnique({
    where: { slug }
  });
  return m ? { ...m, atributos: m.atributos as any } : null;
}

// ── ABILITIES ────────────────────────────────────────────
export interface AbilityResult {
  id: string;
  nombre: string;
  nombres?: any;
  descripciones?: any;
  atributos: any;
}

export async function searchAbilities(query: string, limit = 50): Promise<AbilityResult[]> {
  if (!query || query.trim().length < 2) return [];
  const abs = await prisma.habilidad.findMany({
    where: { nombre: { contains: query.trim(), mode: "insensitive" } },
    take: limit,
    orderBy: { nombre: "asc" },
  });
  return abs.map(a => ({ ...a, atributos: a.atributos as any }));
}

export async function getAllAbilities(page = 1, perPage = 60, filters?: { searchQuery?: string; lang?: string }): Promise<{ abilities: AbilityResult[]; total: number }> {
  const where: any = {};
  
  if (filters?.searchQuery) {
    const q = filters.searchQuery.trim().toLowerCase();
    const lang = filters.lang || "en";
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { nombres: { path: [lang], string_contains: q } },
      { nombres: { path: ["es"], string_contains: q } }
    ];
  }

  const [abs, total] = await Promise.all([
    prisma.habilidad.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { nombre: "asc" } }),
    prisma.habilidad.count({ where }),
  ]);
  return { total, abilities: abs.map(a => ({ ...a, atributos: a.atributos as any })) };
}

export async function getAbilityBySlug(slug: string): Promise<AbilityResult | null> {
  const a = await prisma.habilidad.findUnique({
    where: { slug }
  });
  return a ? { ...a, atributos: a.atributos as any } : null;
}

// ── ITEMS ────────────────────────────────────────────────
export interface ItemResult {
  id: string;
  nombre: string;
  nombres?: any;
  descripciones?: any;
  sprite_url: string | null;
  atributos: any;
}

export async function searchItems(query: string, limit = 50): Promise<ItemResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const items = await prisma.objeto.findMany({
    where: {
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { nombres: { path: ["es"], string_contains: q } },
        { nombres: { path: ["en"], string_contains: q } }
      ]
    },
    take: limit,
    orderBy: { nombre: "asc" },
  });
  return items.map(i => ({ ...i, atributos: i.atributos as any }));
}

export async function getAllItems(page = 1, perPage = 60, filters?: { searchQuery?: string; lang?: string }): Promise<{ items: ItemResult[]; total: number }> {
  const where: any = {};

  if (filters?.searchQuery) {
    const q = filters.searchQuery.trim().toLowerCase();
    const lang = filters.lang || "en";
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { nombres: { path: [lang], string_contains: q } },
      { nombres: { path: ["es"], string_contains: q } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.objeto.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { nombre: "asc" } }),
    prisma.objeto.count({ where }),
  ]);
  return { total, items: items.map(i => ({ ...i, atributos: i.atributos as any })) };
}

export async function getItemBySlug(slug: string): Promise<ItemResult | null> {
  const i = await prisma.objeto.findUnique({
    where: { slug }
  });
  return i ? { ...i, atributos: i.atributos as any } : null;
}
