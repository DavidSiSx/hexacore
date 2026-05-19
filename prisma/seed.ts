import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaKnowledgeRepository } from '../src/core/infrastructure/database/PrismaKnowledgeRepository';
import { GoogleEmbeddingService } from '../src/core/infrastructure/ai/GoogleEmbeddingService';
import { PkmnDexProvider } from '../src/core/infrastructure/external/PkmnDexProvider';
import { ConsoleLogger } from '../src/core/infrastructure/logging/ConsoleLogger';
import { SeedKnowledgeVaultUseCase } from '../src/core/application/usecases/SeedKnowledgeVaultUseCase';

process.env.SKIP_POKEAPI = 'true';

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const PRISMA = new PrismaClient({ adapter });

/**
 * Punto de entrada principal para el proceso de siembra y RAG de Hexacore.
 * Actúa estrictamente como raíz de composición (Composition Root), conectando
 * adaptadores concretos con los puertos definidos por la capa de aplicación.
 */
async function main(): Promise<void> {
  // 1. Instanciación de adaptadores de infraestructura
  const logger = new ConsoleLogger();
  const repository = new PrismaKnowledgeRepository(PRISMA);
  const embeddingService = new GoogleEmbeddingService(process.env.GEMINI_API_KEY || '');
  const dexProvider = new PkmnDexProvider(logger);

  // 2. Inyección de dependencias en el caso de uso principal
  const useCase = new SeedKnowledgeVaultUseCase(
    repository,
    embeddingService,
    dexProvider,
    logger
  );

  // 3. Ejecución orquestada
  logger.info('Iniciando proceso de siembra de Bóveda de Conocimiento...');
  await useCase.execute();
  logger.info('Siembra completada con éxito.');
}

main()
  .catch((err: unknown) => {
    const stack = err instanceof Error ? err.stack : String(err);
    process.stderr.write(`[FATAL] ${stack}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await PRISMA.$disconnect();
  });
