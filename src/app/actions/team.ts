"use server";

import { getRelevantHybridContext } from "@/lib/ai/rag";
import { generateTeamWithGemini } from "@/lib/ai/gemini";
import { AITeam, TeamGenerationOptions, TeamGenerationOptionsSchema } from "@/lib/schemas/team";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validación de entrada estricta con Zod
const querySchema = z.string()
  .min(3, "La petición es demasiado corta. Escribe al menos 3 caracteres.")
  .max(500, "La petición supera el límite permitido de 500 caracteres para evitar abusos.");

export async function buildTeamAction(
  userQuery: string,
  options?: TeamGenerationOptions
): Promise<{ success: true; team: AITeam } | { success: false; error: string }> {
  try {
    // 1. Obtener y verificar al usuario autenticado mediante cookies seguras (Supabase SSR)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Acceso denegado. Inicia sesión para usar el constructor con IA." };
    }

    // 2. Validar la consulta del usuario con Zod
    const validation = querySchema.safeParse(userQuery);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }
    const cleanQuery = validation.data.trim();

    // Validar opciones opcionales
    let cleanOptions: TeamGenerationOptions | undefined = undefined;
    if (options) {
      const optionsValidation = TeamGenerationOptionsSchema.safeParse(options);
      if (optionsValidation.success) {
        cleanOptions = optionsValidation.data;
      }
    }

    // 3. Control de Tasa (Rate Limiting) persistido en PostgreSQL mediante Prisma
    const endpoint = "buildTeamAction";
    const limiteGeneraciones = 5;
    const ventanaTiempoMs = 60 * 60 * 1000; // 1 hora
    const ahora = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        usuarioId_endpoint: {
          usuarioId: user.id,
          endpoint,
        },
      },
    });

    if (!rateLimit) {
      // Crear registro inicial de rate limit
      await prisma.rateLimit.create({
        data: {
          usuarioId: user.id,
          endpoint,
          peticiones: 1,
          resetAt: new Date(ahora.getTime() + ventanaTiempoMs),
        },
      });
    } else {
      const resetAt = new Date(rateLimit.resetAt);
      
      if (ahora > resetAt) {
        // La ventana de tiempo ha expirado, reiniciamos el contador y la ventana
        await prisma.rateLimit.update({
          where: { id: rateLimit.id },
          data: {
            peticiones: 1,
            resetAt: new Date(ahora.getTime() + ventanaTiempoMs),
          },
        });
      } else {
        // La ventana sigue activa, comprobamos si supera el límite de abuso
        if (rateLimit.peticiones >= limiteGeneraciones) {
          const minutosRestantes = Math.ceil((resetAt.getTime() - ahora.getTime()) / (60 * 1000));
          return { 
            success: false, 
            error: `Has alcanzado el límite seguro de ${limiteGeneraciones} generaciones de equipos por hora. Podrás generar otro equipo en ${minutosRestantes} minutos.` 
          };
        }

        // Incrementar las peticiones dentro de la ventana de tiempo activa
        await prisma.rateLimit.update({
          where: { id: rateLimit.id },
          data: {
            peticiones: rateLimit.peticiones + 1,
          },
        });
      }
    }

    // 4. Recuperar contexto semántico del metajuego usando el RAG
    // Enriquecemos la consulta con las restricciones para asegurar RAG más relevante
    let ragQuery = cleanQuery;
    if (cleanOptions) {
      if (cleanOptions.forcePokemon && cleanOptions.forcePokemon.length > 0) {
        ragQuery += ` ${cleanOptions.forcePokemon.join(" ")}`;
      }
      if (cleanOptions.monotype) {
        ragQuery += ` monotype ${cleanOptions.monotype}`;
      }
      if (cleanOptions.format) {
        ragQuery += ` format ${cleanOptions.format}`;
      }
      if (cleanOptions.archetype) {
        ragQuery += ` archetype ${cleanOptions.archetype}`;
      }
    }
    const format = cleanOptions?.format || "gen9ou";
    const ragContext = await getRelevantHybridContext(ragQuery, format, 8); // Top 8 documentos con relevancia de uso híbrido
    
    // 5. Generar la estructura del equipo con Gemini
    const teamData = await generateTeamWithGemini(cleanQuery, ragContext, cleanOptions);

    return { success: true, team: teamData };
  } catch (error) {
    console.error("Error en buildTeamAction:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar la petición.";
    return { success: false, error: errorMessage };
  }
}
