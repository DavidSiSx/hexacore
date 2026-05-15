import { pipeline, env } from '@xenova/transformers';
import { EmbeddingService } from '../../application/ports/KnowledgeVaultPorts';

// Deshabilitar la búsqueda de modelos locales no empaquetados para garantizar
// la descarga o uso de caché del modelo remoto empaquetado en HuggingFace.
env.allowLocalModels = false;

/**
 * Contrato interno para la salida estructurada del pipeline de Transformers.
 */
interface TransformerOutput {
  data: Float32Array;
}

/**
 * Contrato de invocación del pipeline cargado.
 */
type FeatureExtractionPipeline = (
  text: string, 
  options: { pooling: string; normalize: boolean }
) => Promise<TransformerOutput>;

/**
 * Adaptador de infraestructura para la incrustación vectorial semántica
 * utilizando la biblioteca local @xenova/transformers con el modelo all-MiniLM-L6-v2.
 */
export class LocalTransformersService implements EmbeddingService {
  private embedder: FeatureExtractionPipeline | null = null;
  private readonly modelName = 'Xenova/all-MiniLM-L6-v2';

  /**
   * Carga perezosamente el modelo de extracción de características en memoria.
   */
  private async getEmbedder(): Promise<FeatureExtractionPipeline> {
    if (!this.embedder) {
      console.log(`Cargando modelo de embeddings (${this.modelName})...`);
      // Realizar un casteo seguro mediante 'unknown' para evitar 'any' en la firma externa
      const pipe = await pipeline('feature-extraction', this.modelName);
      this.embedder = pipe as unknown as FeatureExtractionPipeline;
    }
    return this.embedder;
  }

  /**
   * Genera el vector de incrustación normalizado a partir de una cadena de texto.
   * Utiliza la técnica de agrupación por media (mean pooling).
   * 
   * @param text Contenido textual del documento
   * @returns Array de números en coma flotante representando las 384 dimensiones
   */
  public async embedText(text: string): Promise<number[]> {
    if (!text) {
      return new Array(384).fill(0);
    }

    const embedderPipeline = await this.getEmbedder();
    const output = await embedderPipeline(text, { pooling: 'mean', normalize: true });
    
    return Array.from(output.data);
  }
}
