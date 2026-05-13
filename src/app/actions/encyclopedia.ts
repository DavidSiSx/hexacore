"use server";

import { prisma } from "@/lib/db";

export interface MoveResult {
  id: string;
  nombre: string;
  tipo: string;
  categoria: string;
  potencia: number;
  precision: number;
  descripcion: string;
  atributos: any;
}

export async function searchMoves(query: string, limit = 50): Promise<MoveResult[]> {
  if (!query || query.trim().length < 2) return [];
  const moves = await prisma.movimiento.findMany({
    where: { nombre: { contains: query.trim(), mode: "insensitive" } },
    take: limit,
    orderBy: { nombre: "asc" },
  });
  return moves.map(m => ({ ...m, atributos: m.atributos as any }));
}

export async function getAllMoves(page = 1, perPage = 60): Promise<{ moves: MoveResult[]; total: number }> {
  const [moves, total] = await Promise.all([
    prisma.movimiento.findMany({ skip: (page - 1) * perPage, take: perPage, orderBy: { nombre: "asc" } }),
    prisma.movimiento.count(),
  ]);
  return { total, moves: moves.map(m => ({ ...m, atributos: m.atributos as any })) };
}

export async function getMoveByName(name: string): Promise<MoveResult | null> {
  const m = await prisma.movimiento.findFirst({ where: { nombre: { equals: name, mode: "insensitive" } } });
  return m ? { ...m, atributos: m.atributos as any } : null;
}

export interface AbilityResult {
  id: string;
  nombre: string;
  descripcion: string;
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

export async function getAllAbilities(page = 1, perPage = 60): Promise<{ abilities: AbilityResult[]; total: number }> {
  const [abs, total] = await Promise.all([
    prisma.habilidad.findMany({ skip: (page - 1) * perPage, take: perPage, orderBy: { nombre: "asc" } }),
    prisma.habilidad.count(),
  ]);
  return { total, abilities: abs.map(a => ({ ...a, atributos: a.atributos as any })) };
}

export async function getAbilityByName(name: string): Promise<AbilityResult | null> {
  const a = await prisma.habilidad.findFirst({ where: { nombre: { equals: name, mode: "insensitive" } } });
  return a ? { ...a, atributos: a.atributos as any } : null;
}
