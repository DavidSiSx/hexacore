import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function embedText(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada.");
  }
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Deserializa la cadena de texto del vector SQLite "[x1, x2, ...]" en un array de números.
 */
function parseVector(vecStr: string | null): number[] {
  if (!vecStr) return [];
  try {
    const cleanStr = vecStr.replace(/[\[\]]/g, '');
    return cleanStr.split(',').map(Number);
  } catch (e) {
    return [];
  }
}

/**
 * Calcula de manera robusta la similitud del coseno entre dos vectores numéricos.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    mA += a[i] * a[i];
    mB += b[i] * b[i];
  }
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

export async function getRelevantHybridContext(
  query: string,
  format: string,
  limit: number = 7
): Promise<string> {
  try {
    const vectorArray = await embedText(query);

    // 1. Recuperar todos los documentos de conocimiento en memoria
    const allDocs = await prisma.documentoConocimiento.findMany();

    // 2. Mapear y calcular la similitud en caliente
    const documentosWithSim = allDocs
      .map(doc => {
        const docVector = parseVector(doc.embedding);
        const similarity = cosineSimilarity(vectorArray, docVector);
        return {
          id: doc.id,
          doc_type: doc.doc_type,
          contenido: doc.contenido,
          metadatos: doc.metadatos,
          similarity
        };
      })
      .filter(doc => doc.similarity > 0);

    if (documentosWithSim.length === 0) {
      return "No se encontró información relevante en la base de datos.";
    }

    // Ordenar descendentemente por similitud y tomar candidatos para el contexto híbrido
    documentosWithSim.sort((a, b) => b.similarity - a.similarity);
    const candidates = documentosWithSim.slice(0, limit * 2);

    const hybridDocs = await Promise.all(
      candidates.map(async (doc) => {
        let usageBonus = 0.0;
        const meta = typeof doc.metadatos === "string" ? JSON.parse(doc.metadatos) : doc.metadatos;
        const pokemonA = meta?.pokemon_a;
        const pokemonB = meta?.pokemon_b;

        if (pokemonA && pokemonB) {
          const sinergia = await prisma.sinergiaMetagame.findFirst({
            where: {
              OR: [
                { pokemon_a: pokemonA, pokemon_b: pokemonB, formato: format },
                { pokemon_a: pokemonB, pokemon_b: pokemonA, formato: format },
              ],
            },
          });
          if (sinergia) {
            usageBonus = sinergia.usage_rate;
          }
        }

        const hybridScore = doc.similarity * (1.0 + usageBonus);

        return {
          ...doc,
          hybridScore,
          usageBonus,
        };
      })
    );

    hybridDocs.sort((a, b) => b.hybridScore - a.hybridScore);
    const selectedDocs = hybridDocs.slice(0, limit);

    let contextoStr = "--- INICIO DE CONTEXTO HÍBRIDO RECUPERADO (Semántica + Smogon Chaos Stats) ---\n\n";
    selectedDocs.forEach((doc, i) => {
      contextoStr += `Documento ${i + 1} (${doc.doc_type}) [Sinergias Recíprocas: ${(doc.usageBonus * 100).toFixed(1)}%]:\n`;
      contextoStr += `${doc.contenido}\n\n`;
    });
    contextoStr += "--- FIN DE CONTEXTO HÍBRIDO RECUPERADO ---";

    return contextoStr;
  } catch (error) {
    console.error("Error en getRelevantHybridContext:", error);
    return getRelevantContext(query, limit);
  }
}

export async function getRelevantContext(query: string, limit: number = 7): Promise<string> {
  try {
    // 1. Generar el embedding de la petición del usuario
    const vectorArray = await embedText(query);

    // 2. Recuperar todos los documentos de conocimiento en memoria
    const allDocs = await prisma.documentoConocimiento.findMany();

    // 3. Mapear y calcular la similitud en caliente
    const documentosWithSim = allDocs
      .map(doc => {
        const docVector = parseVector(doc.embedding);
        const similarity = cosineSimilarity(vectorArray, docVector);
        return {
          doc_type: doc.doc_type,
          contenido: doc.contenido,
          similarity
        };
      })
      .filter(doc => doc.similarity > 0);

    if (documentosWithSim.length === 0) {
      return "No se encontró información relevante en la base de datos.";
    }

    // Ordenar descendentemente por similitud y tomar los mejores
    documentosWithSim.sort((a, b) => b.similarity - a.similarity);
    const selectedDocs = documentosWithSim.slice(0, limit);

    let contextoStr = "--- INICIO DE CONTEXTO RECUPERADO ---\n\n";
    selectedDocs.forEach((doc, i) => {
      contextoStr += `Documento ${i + 1} (${doc.doc_type}):\n`;
      contextoStr += `${doc.contenido}\n\n`;
    });
    contextoStr += "--- FIN DE CONTEXTO RECUPERADO ---";

    return contextoStr;
  } catch (error) {
    console.error("Error en getRelevantContext:", error);
    throw new Error("Fallo al recuperar el contexto RAG de la base de datos.");
  }
}

