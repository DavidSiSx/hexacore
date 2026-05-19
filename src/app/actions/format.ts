"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Esquema de validación estricta para las reglas personalizadas
const customRulesSchema = z.object({
  speciesClause: z.boolean().default(true),
  itemClause: z.boolean().default(false),
  allowMega: z.boolean().default(true),
  allowZMove: z.boolean().default(true),
  allowTera: z.boolean().default(true),
  maxLevel: z.number().int().min(1).max(100).default(100),
  minLevel: z.number().int().min(1).max(100).default(1),
  bans: z.object({
    pokemon: z.array(z.string()).default([]),
    items: z.array(z.string()).default([]),
    moves: z.array(z.string()).default([]),
    abilities: z.array(z.string()).default([]),
  }).default({ pokemon: [], items: [], moves: [], abilities: [] }),
});

const customFormatSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(40, "El nombre no puede superar los 40 caracteres."),
  descripcion: z.string().max(200, "La descripción no puede superar los 200 caracteres.").default(""),
  reglas: customRulesSchema,
});

export type CustomRulesPayload = z.infer<typeof customRulesSchema>;

export async function getCustomFormatsAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false as const, error: "Acceso denegado. Inicia sesión para cargar tus formatos personalizados." };
    }

    const formats = await prisma.formatoPersonalizado.findMany({
      where: { usuarioId: user.id },
      orderBy: { created_at: "desc" },
    });

    return { success: true as const, formats };
  } catch (error) {
    console.error("Error en getCustomFormatsAction:", error);
    return { success: false as const, error: "Error inesperado al recuperar formatos personalizados." };
  }
}

export async function saveCustomFormatAction(
  nombre: string,
  descripcion: string,
  reglas: CustomRulesPayload,
  id?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false as const, error: "Acceso denegado. Inicia sesión para guardar formatos personalizados." };
    }

    // Validar datos de entrada
    const validation = customFormatSchema.safeParse({ nombre, descripcion, reglas });
    if (!validation.success) {
      return { success: false as const, error: validation.error.issues[0].message };
    }

    const { nombre: cleanNombre, descripcion: cleanDescripcion, reglas: cleanReglas } = validation.data;

    if (id) {
      // Editar formato existente
      const existing = await prisma.formatoPersonalizado.findFirst({
        where: { id, usuarioId: user.id },
      });

      if (!existing) {
        return { success: false as const, error: "Formato personalizado no encontrado o no autorizado." };
      }

      const updated = await prisma.formatoPersonalizado.update({
        where: { id },
        data: {
          nombre: cleanNombre,
          descripcion: cleanDescripcion,
          reglas: cleanReglas,
        },
      });

      return { success: true as const, format: updated, message: "Formato actualizado con éxito." };
    } else {
      // Crear nuevo formato: comprobar límite de 6
      const count = await prisma.formatoPersonalizado.count({
        where: { usuarioId: user.id },
      });

      if (count >= 6) {
        return { success: false as const, error: "Límite alcanzado: Solo puedes guardar hasta 6 formatos personalizados competitivos." };
      }

      const created = await prisma.formatoPersonalizado.create({
        data: {
          nombre: cleanNombre,
          descripcion: cleanDescripcion,
          reglas: cleanReglas,
          usuarioId: user.id,
        },
      });

      return { success: true as const, format: created, message: "Formato personalizado guardado con éxito." };
    }
  } catch (error) {
    console.error("Error en saveCustomFormatAction:", error);
    return { success: false as const, error: "Error inesperado al guardar el formato personalizado." };
  }
}

export async function deleteCustomFormatAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false as const, error: "Acceso denegado. Inicia sesión para eliminar formatos." };
    }

    const existing = await prisma.formatoPersonalizado.findFirst({
      where: { id, usuarioId: user.id },
    });

    if (!existing) {
      return { success: false as const, error: "Formato personalizado no encontrado o no autorizado." };
    }

    await prisma.formatoPersonalizado.delete({
      where: { id },
    });

    return { success: true as const, message: "Formato eliminado con éxito." };
  } catch (error) {
    console.error("Error en deleteCustomFormatAction:", error);
    return { success: false as const, error: "Error inesperado al eliminar el formato personalizado." };
  }
}
