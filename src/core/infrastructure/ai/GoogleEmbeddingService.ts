import { GoogleGenerativeAI } from "@google/generative-ai";
import { EmbeddingService } from "../../application/ports/KnowledgeVaultPorts";

/**
 * Adaptador de infraestructura para la generación de incrustaciones vectoriales (embeddings)
 * utilizando el SDK oficial de Google Generative AI.
 */
export class GoogleEmbeddingService implements EmbeddingService {
  private readonly genAI: GoogleGenerativeAI;
  private queue: Promise<any> = Promise.resolve();
  private readonly minDelayMs = 650; // Spacing of at least 650ms guarantees <= 92 requests per minute (under the 100 RPM limit)

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("La clave de API de Gemini no está configurada en las variables de entorno.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Genera un vector numérico a partir de un texto utilizando el modelo gemini-embedding-001.
   * Cuenta con un limitador de tasa interno (serial queue con retardo) para respetar el quota gratuito (100 RPM).
   */
  public async embedText(text: string): Promise<number[]> {
    const next = this.queue.then(async () => {
      // Esperar el retraso mínimo antes de realizar la petición HTTP
      await new Promise(resolve => setTimeout(resolve, this.minDelayMs));
      try {
        const model = this.genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent(text);
        return result.embedding.values;
      } catch (error) {
        throw new Error(`Fallo al generar embedding: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    // Encadenamos el catch para evitar que un fallo en un elemento de la cola bloquee las peticiones subsiguientes
    this.queue = next.catch(() => {});
    return next;
  }
}
