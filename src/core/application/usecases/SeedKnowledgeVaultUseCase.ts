import { 
  KnowledgeRepository, 
  EmbeddingService, 
  ExternalDexProvider,
  Logger
} from '../ports/KnowledgeVaultPorts';
import { DictionarySeeder } from '../services/DictionarySeeder';
import { StaticMechanicsSeeder } from '../services/StaticMechanicsSeeder';
import { StrategicSeeder } from '../services/StrategicSeeder';

/**
 * Caso de uso de aplicación puro encargado de coordinar la ingesta,
 * traducción y persistencia vectorial de toda la inteligencia competitiva.
 * Actúa como orquestador delegando la lógica específica a servicios internos.
 */
export class SeedKnowledgeVaultUseCase {
  private readonly dictionarySeeder: DictionarySeeder;
  private readonly staticSeeder: StaticMechanicsSeeder;
  private readonly strategicSeeder: StrategicSeeder;

  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly dexProvider: ExternalDexProvider,
    private readonly logger: Logger
  ) {
    this.dictionarySeeder = new DictionarySeeder(repository, embeddingService, dexProvider, logger);
    this.staticSeeder = new StaticMechanicsSeeder(repository, embeddingService, logger);
    this.strategicSeeder = new StrategicSeeder(repository, embeddingService, dexProvider, logger);
  }

  /**
   * Ejecuta la orquestación secuencial de vaciado y población.
   */
  public async execute(): Promise<void> {
    // 1. Limpieza total de las colecciones y tablas
    await this.repository.clearAllTables();

    // 2. Siembra del diccionario base (Objetos, Habilidades, Movimientos)
    await this.dictionarySeeder.seed();

    // 3. Ingesta de archivos locales de mecánicas y sinergias
    await this.staticSeeder.seed();

    // 4. Ingesta por lotes de la Enciclopedia Estratégica
    await this.strategicSeeder.seed();
  }
}
