"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRelevantContext } from "@/lib/ai/rag";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const chatMessageSchema = z.object({
  role: z.enum(["user", "model", "assistant"]),
  content: z.string(),
});

const chatHistorySchema = z.array(chatMessageSchema);

export async function chatAssistantAction(
  message: string,
  history: Array<{ role: "user" | "model" | "assistant"; content: string }>
): Promise<{ success: true; response: string } | { success: false; error: string }> {
  try {
    // 1. Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Acceso denegado. Inicia sesión para chatear con el Coach." };
    }

    // 2. Validar entradas
    if (!message || message.trim().length < 2) {
      return { success: false, error: "El mensaje es demasiado corto." };
    }
    const cleanMessage = message.trim();

    const historyValidation = chatHistorySchema.safeParse(history);
    const validatedHistory = historyValidation.success ? historyValidation.data : [];

    // 3. Sanitizar historial: Gemini requiere que el primer Content tenga role "user"
    // Eliminar mensajes "model" iniciales que preceden al primer mensaje "user"
    const firstUserIndex = validatedHistory.findIndex(m => m.role === "user");
    const sanitizedHistory = firstUserIndex >= 0
      ? validatedHistory.slice(firstUserIndex)
      : [];

    // 4. Clasificación semántica de intención (Intent Classification)
    const models = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-1.5-flash"
    ];

    let lastModelError: Error | null = null;

    for (const modelName of models) {
    try {
    const classificationModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "text/plain",
        temperature: 0.1,
      },
    });

    const classificationPrompt = `
Clasifica la intención de este mensaje de chat de Pokémon Competitivo. Devuelve ÚNICAMENTE una de las siguientes palabras clave sin espacios ni signos de puntuación adicionales:
- defense_suggestion : El usuario está buscando contramedidas, counters, o cómo defenderse de un Pokémon / amenaza específica.
- information_request : El usuario solicita datos técnicos sobre un Pokémon, stats, movimientos legales, habilidades o explicaciones teóricas.
- squad_build : El usuario pide cambios, adiciones, consejos de sinergia, reparto de EVs o modificaciones específicas para su equipo de 6.
- none : Dudas generales, saludos o conversación casual.

Mensaje del usuario: "${cleanMessage}"
Intención:`;

    const classificationResult = await classificationModel.generateContent(classificationPrompt);
    const intent = classificationResult.response.text().trim().toLowerCase();

    // 4. Recuperar contexto RAG si el intent es técnico
    let ragContext = "";
    if (intent === "defense_suggestion" || intent === "information_request" || intent === "squad_build") {
      try {
        ragContext = await getRelevantContext(cleanMessage, 5);
      } catch (e) {
        console.error("Fallo RAG en chatAssistantAction:", e);
      }
    }

    // 6. Generar respuesta estratégica con el Coach de Hexacore
    const coachModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const systemInstruction = `
Eres Hexacore strategic coach AI, un Coach de Pokémon de 15 años de experiencia, GDE & MVP, apasionado y extremadamente directo.
Te preocupas profundamente por el crecimiento del usuario. Si comete errores de fundamentos (ej. poner un objeto absurdo, malas sinergias o repartos de EVs ineficientes), ¡CORRÍGELO CON PASIÓN pero con total cariño pedagógico! Queremos que aprenda.

### TU ESTILO DE COMUNICACIÓN:
- Usa un tono cálido, profesional y apasionadamente directo (incluso un poco frustrado si ves un error básico, ¡porque te importa!).
- Respóndele en el mismo idioma en el que te escribe.
- Explica los CONCEPTOS antes que dar solo el código. A los novatos les das el fundamento técnico.
- Usa ejemplos concretos de daño o sinergia para ilustrar.

### INFORMACIÓN Y CONTEXTO RAG DE LA BÓVEDA (Si está disponible):
${ragContext}

### DETECCIÓN DE INTENCIÓN SEMÁNTICA:
La intención clasificada del usuario es: [${intent}]. Adapta tu enfoque según esto:
- Si es defense_suggestion: Aporta counters específicos, cálculos de daño rápidos sugeridos, y estrategias de switch-in.
- Si es information_request: Explica stats base, habilidades viables competitivamente, y naturalezas clave.
- Si es squad_build: Analiza la sinergia, cores clásicos (como FWG, Fantasy Core) y sugiere repartos eficientes de EVs.
`;

    // Preparar el formato de chat para Gemini
    // Convertimos "assistant" a "model" y usamos el historial sanitizado
    const geminiHistory = sanitizedHistory.map(h => ({
      role: h.role === "assistant" ? "model" as const : h.role as "user" | "model",
      parts: [{ text: h.content }],
    }));

    const chatSession = coachModel.startChat({
      history: geminiHistory,
      systemInstruction: systemInstruction,
    });

    const chatResult = await chatSession.sendMessage(cleanMessage);
    const responseText = chatResult.response.text();

    return { success: true, response: responseText };
    } catch (modelError) {
      console.warn(`[Coach] Falló con modelo ${modelName}:`, modelError);
      lastModelError = modelError instanceof Error ? modelError : new Error(String(modelError));
      // Continuar al siguiente modelo en la rotación
    }
    } // end for

    // Si todos los modelos fallaron
    const errorMsg = lastModelError?.message || "Error inesperado al chatear con el Coach.";
    console.error("[Coach] Todos los modelos fallaron. Último error:", errorMsg);
    return { success: false, error: errorMsg };
  } catch (error) {
    console.error("Error en chatAssistantAction:", error);
    const errorMessage = error instanceof Error ? error.message : "Error inesperado al chatear con el Coach.";
    return { success: false, error: errorMessage };
  }
}
