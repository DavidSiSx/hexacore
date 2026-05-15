import { GoogleGenerativeAI } from "@google/generative-ai";
import { EmbeddingService } from "../../application/ports/KnowledgeVaultPorts";

/**
 * Adaptador de infraestructura para la generación de incrustaciones vectoriales (embeddings)
 * utilizando el SDK oficial de Google Generative AI.
 */
export class GoogleEmbeddingService implements EmbeddingService {
  private readonly genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("La clave de API de Gemini no está configurada en las variables de entorno.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Genera un vector numérico a partir de un texto utilizando el modelo text-embedding-004.
   */
  public async embedText(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      // En caso de error, retornamos un vector vacío o lanzamos la excepción según política.
      // Aquí lanzamos para que el seeder pueda registrar el fallo mediante el Logger.
      throw new Error(`Fallo al generar embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
