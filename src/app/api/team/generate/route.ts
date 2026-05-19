import { NextRequest } from "next/server";
import { getRelevantHybridContext } from "@/lib/ai/rag";
import { generateTeamWithGemini } from "@/lib/ai/gemini";
import { TeamGenerationOptions, TeamGenerationOptionsSchema } from "@/lib/schemas/team";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.string()
  .min(3, "La petición es demasiado corta. Escribe al menos 3 caracteres.")
  .max(500, "La petición supera el límite permitido de 500 caracteres para evitar abusos.");

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // 1. Obtener y verificar al usuario autenticado mediante cookies seguras (Supabase SSR)
        send({ type: "log", message: "🔒 Autenticando usuario y verificando credenciales..." });
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          send({ type: "error", error: "Acceso denegado. Inicia sesión para usar el constructor con IA." });
          controller.close();
          return;
        }

        // 2. Leer el cuerpo de la petición
        const body = await req.json();
        const { query, options } = body;

        // 3. Validar la consulta del usuario con Zod
        send({ type: "log", message: "⚙️ Validando tu consulta competitiva y filtros..." });
        const validation = querySchema.safeParse(query);
        if (!validation.success) {
          send({ type: "error", error: validation.error.issues[0].message });
          controller.close();
          return;
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

        if (cleanOptions && cleanOptions.format) {
          // Intentar buscar si es un formato personalizado del usuario
          try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanOptions.format);
            if (isUuid) {
              const formatoPersonalizado = await prisma.formatoPersonalizado.findFirst({
                where: {
                  id: cleanOptions.format,
                  usuarioId: user.id,
                }
              });
              if (formatoPersonalizado) {
                const reglas = formatoPersonalizado.reglas as any;
                cleanOptions.customRules = {
                  speciesClause: reglas?.speciesClause ?? true,
                  itemClause: reglas?.itemClause ?? false,
                  allowMega: reglas?.allowMega ?? true,
                  allowZMove: reglas?.allowZMove ?? true,
                  allowTera: reglas?.allowTera ?? true,
                  minLevel: reglas?.minLevel ?? 1,
                  maxLevel: reglas?.maxLevel ?? 100,
                  bans: reglas?.bans ?? { pokemon: [], items: [], moves: [], abilities: [] },
                };
              }
            }
          } catch (e) {
            console.error("Error al buscar formato personalizado:", e);
          }
        }

        // 4. Control de Tasa (Rate Limiting) persistido en PostgreSQL mediante Prisma
        send({ type: "log", message: "🛡️ Verificando límites seguros de tasa de peticiones..." });
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
            await prisma.rateLimit.update({
              where: { id: rateLimit.id },
              data: {
                peticiones: 1,
                resetAt: new Date(ahora.getTime() + ventanaTiempoMs),
              },
            });
          } else {
            if (rateLimit.peticiones >= limiteGeneraciones) {
              const minutosRestantes = Math.ceil((resetAt.getTime() - ahora.getTime()) / (60 * 1000));
              send({ 
                type: "error", 
                error: `Has alcanzado el límite seguro de ${limiteGeneraciones} generaciones por hora. Podrás generar otro equipo en ${minutosRestantes} minutos.` 
              });
              controller.close();
              return;
            }

            await prisma.rateLimit.update({
              where: { id: rateLimit.id },
              data: {
                peticiones: rateLimit.peticiones + 1,
              },
            });
          }
        }

        // 5. RAG Híbrido: Consultar vectores de pgvector potenciados con Smogon Chaos Cores
        send({ type: "log", message: "📡 Consultando la base de datos vectorial de Hexacore (Hybrid RAG)..." });
        let formatStr = "gen9ou";
        if (cleanOptions?.format) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanOptions.format);
          if (isUuid) {
            if (cleanOptions.customRules?.allowMega || cleanOptions.customRules?.allowZMove) {
              formatStr = "gen9nationaldexou";
            } else {
              formatStr = "gen9ou";
            }
          } else {
            formatStr = cleanOptions.format;
          }
        }
        
        // Enriquecer la consulta RAG
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
        
        const ragContext = await getRelevantHybridContext(ragQuery, formatStr, 8);
        send({ type: "log", message: "⚙️ Cores y sinergias del metajuego mapeados con éxito desde Smogon Chaos..." });

        // 6. Generación con IA y rotación de modelos
        send({ type: "log", message: "🧠 Invocando al Agente de IA y analizando afinidades de tipos..." });
        const teamData = await generateTeamWithGemini(cleanQuery, ragContext, cleanOptions);

        // 7. Enviar resultado exitoso final
        send({ type: "log", message: "✨ ¡Equipo ensamblado de forma óptima!" });
        send({ type: "result", team: teamData });

      } catch (err: any) {
        console.error("Error en API de generación:", err);
        send({ type: "error", error: err.message || "Ocurrió un error inesperado al generar el equipo." });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    }
  });
}
