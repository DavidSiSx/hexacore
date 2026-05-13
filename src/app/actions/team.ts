"use server";

import { getRelevantContext } from "@/lib/ai/rag";
import { generateTeamWithGemini } from "@/lib/ai/gemini";
import { Team } from "@/lib/schemas/team";

export async function buildTeamAction(userQuery: string): Promise<{ success: true; team: Team } | { success: false; error: string }> {
  try {
    if (!userQuery || userQuery.trim().length === 0) {
      return { success: false, error: "La petición no puede estar vacía." };
    }

    // 1. Recuperar contexto RAG de Supabase
    // Buscar los documentos semánticamente más similares al prompt del usuario
    console.log("[Hexacore] Buscando contexto RAG para:", userQuery);
    const ragContext = await getRelevantContext(userQuery, 8); // Top 8 documentos
    
    // 2. Generar el equipo con Gemini usando Structured Outputs
    console.log("[Hexacore] Contexto recuperado. Generando JSON con Gemini 2.5...");
    const teamData = await generateTeamWithGemini(userQuery, ragContext);

    console.log("[Hexacore] Equipo generado con éxito:", teamData.teamName);
    return { success: true, team: teamData };
  } catch (error: any) {
    console.error("[Hexacore] Error en buildTeamAction:", error);
    return { success: false, error: error.message || "Ocurrió un error inesperado al generar el equipo." };
  }
}
