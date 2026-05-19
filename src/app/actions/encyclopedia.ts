"use server";

import { prisma } from "@/lib/db";

// ── MOVES ────────────────────────────────────────────────
export interface MoveResult {
  id: string;
  nombre: string;
  slug: string;
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
  
  const allMoves = await prisma.movimiento.findMany({
    orderBy: { nombre: "asc" }
  });

  const filtered = allMoves.filter(m => {
    const nombres = m.nombres as any;
    return (
      m.nombre.toLowerCase().includes(q) ||
      m.slug.toLowerCase().includes(q) ||
      (nombres?.es && nombres.es.toLowerCase().includes(q)) ||
      (nombres?.en && nombres.en.toLowerCase().includes(q))
    );
  });

  return filtered.slice(0, limit).map(m => ({ ...m, atributos: m.atributos as any }));
}

export async function getAllMoves(page = 1, perPage = 60, filters?: MoveFilters & { searchQuery?: string; lang?: string }): Promise<{ moves: MoveResult[]; total: number }> {
  const where: any = {};
  if (filters?.tipo) where.tipo = filters.tipo;
  if (filters?.categoria) where.categoria = filters.categoria;
  
  let moves = await prisma.movimiento.findMany({
    where,
    orderBy: { nombre: "asc" }
  });

  if (filters?.searchQuery) {
    const q = filters.searchQuery.trim().toLowerCase();
    const cleanLang = (filters.lang === "es" || filters.lang === "en") ? filters.lang : "en";
    moves = moves.filter(m => {
      const nombres = m.nombres as any;
      return (
        m.nombre.toLowerCase().includes(q) ||
        (nombres?.[cleanLang] && nombres[cleanLang].toLowerCase().includes(q)) ||
        (nombres?.es && nombres.es.toLowerCase().includes(q))
      );
    });
  }

  const total = moves.length;
  const paginatedMoves = moves.slice((page - 1) * perPage, page * perPage);

  return { total, moves: paginatedMoves.map(m => ({ ...m, atributos: m.atributos as any })) };
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
  slug: string;
  nombres?: any;
  descripciones?: any;
  atributos: any;
}

export async function searchAbilities(query: string, limit = 50): Promise<AbilityResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  const allAbilities = await prisma.habilidad.findMany({
    orderBy: { nombre: "asc" }
  });

  const filtered = allAbilities.filter(a => {
    const nombres = a.nombres as any;
    return (
      a.nombre.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      (nombres?.es && nombres.es.toLowerCase().includes(q)) ||
      (nombres?.en && nombres.en.toLowerCase().includes(q))
    );
  });

  return filtered.slice(0, limit).map(a => ({ ...a, atributos: a.atributos as any }));
}

export async function getAllAbilities(page = 1, perPage = 60, filters?: { searchQuery?: string; lang?: string }): Promise<{ abilities: AbilityResult[]; total: number }> {
  let abs = await prisma.habilidad.findMany({
    orderBy: { nombre: "asc" }
  });

  if (filters?.searchQuery) {
    const q = filters.searchQuery.trim().toLowerCase();
    const cleanLang = (filters.lang === "es" || filters.lang === "en") ? filters.lang : "en";
    abs = abs.filter(a => {
      const nombres = a.nombres as any;
      return (
        a.nombre.toLowerCase().includes(q) ||
        (nombres?.[cleanLang] && nombres[cleanLang].toLowerCase().includes(q)) ||
        (nombres?.es && nombres.es.toLowerCase().includes(q))
      );
    });
  }

  const total = abs.length;
  const paginatedAbs = abs.slice((page - 1) * perPage, page * perPage);

  return { total, abilities: paginatedAbs.map(a => ({ ...a, atributos: a.atributos as any })) };
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
  slug: string;
  nombres?: any;
  descripciones?: any;
  sprite_url: string | null;
  atributos: any;
}

export async function searchItems(query: string, limit = 50): Promise<ItemResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  const allItems = await prisma.objeto.findMany({
    orderBy: { nombre: "asc" }
  });

  const filtered = allItems.filter(i => {
    const nombres = i.nombres as any;
    return (
      i.nombre.toLowerCase().includes(q) ||
      i.slug.toLowerCase().includes(q) ||
      (nombres?.es && nombres.es.toLowerCase().includes(q)) ||
      (nombres?.en && nombres.en.toLowerCase().includes(q))
    );
  });

  return filtered.slice(0, limit).map(i => ({ ...i, atributos: i.atributos as any }));
}

export async function getAllItems(page = 1, perPage = 60, filters?: { searchQuery?: string; lang?: string }): Promise<{ items: ItemResult[]; total: number }> {
  let items = await prisma.objeto.findMany({
    orderBy: { nombre: "asc" }
  });

  if (filters?.searchQuery) {
    const q = filters.searchQuery.trim().toLowerCase();
    const cleanLang = (filters.lang === "es" || filters.lang === "en") ? filters.lang : "en";
    items = items.filter(i => {
      const nombres = i.nombres as any;
      return (
        i.nombre.toLowerCase().includes(q) ||
        (nombres?.[cleanLang] && nombres[cleanLang].toLowerCase().includes(q)) ||
        (nombres?.es && nombres.es.toLowerCase().includes(q))
      );
    });
  }

  const total = items.length;
  const paginatedItems = items.slice((page - 1) * perPage, page * perPage);

  return { total, items: paginatedItems.map(i => ({ ...i, atributos: i.atributos as any })) };
}

export async function getItemBySlug(slug: string): Promise<ItemResult | null> {
  const i = await prisma.objeto.findUnique({
    where: { slug }
  });
  return i ? { ...i, atributos: i.atributos as any } : null;
}

