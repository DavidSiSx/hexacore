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
