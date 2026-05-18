import { prisma } from "@/lib/db";
import { pipeline } from "@xenova/transformers";

// Mantener la instancia del modelo en memoria durante el tiempo de vida del servidor
class EmbeddingPipeline {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = await pipeline(this.task as any, this.model);
    }
    return this.instance;
  }
}

export async function getRelevantHybridContext(
  query: string,
  format: string,
  limit: number = 7
): Promise<string> {
  try {
    const embedder = await EmbeddingPipeline.getInstance();
    const output = await embedder(query, { pooling: "mean", normalize: true });
    
    const vectorArray = Array.from(output.data);
    const formattedVector = `[${vectorArray.join(",")}]`;

    const documentos = await prisma.$queryRaw<
      Array<{
        id: string;
        doc_type: string;
        contenido: string;
        metadatos: any;
        similarity: number;
      }>
    >`
      SELECT id, doc_type, contenido, metadatos, (1 - (embedding <=> ${formattedVector}::vector)) as similarity
      FROM "DocumentoConocimiento"
      ORDER BY embedding <=> ${formattedVector}::vector
      LIMIT ${limit * 2};
    `;

    if (!documentos || documentos.length === 0) {
      return "No se encontró información relevante en la base de datos.";
    }

    const hybridDocs = await Promise.all(
      documentos.map(async (doc) => {
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
    const embedder = await EmbeddingPipeline.getInstance();
    const output = await embedder(query, { pooling: "mean", normalize: true });
    
    // Convertir a string con formato de vector PostgreSQL: "[0.1, 0.2, ...]"
    const vectorArray = Array.from(output.data);
    const formattedVector = `[${vectorArray.join(",")}]`;

    // 2. Realizar la búsqueda de similitud del coseno (<=>) en pgvector
    // Usamos <=> en lugar de <-> porque nuestros vectores están normalizados (distancia de coseno es más precisa para texto)
    const documentos = await prisma.$queryRaw<
      Array<{
        doc_type: string;
        contenido: string;
      }>
    >`
      SELECT doc_type, contenido
      FROM "DocumentoConocimiento"
      ORDER BY embedding <=> ${formattedVector}::vector
      LIMIT ${limit};
    `;

    // 3. Formatear los documentos recuperados en un solo gran bloque de texto de contexto
    if (!documentos || documentos.length === 0) {
      return "No se encontró información relevante en la base de datos.";
    }

    let contextoStr = "--- INICIO DE CONTEXTO RECUPERADO ---\n\n";
    documentos.forEach((doc, i) => {
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
