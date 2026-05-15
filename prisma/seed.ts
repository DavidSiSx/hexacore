import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PrismaKnowledgeRepository } from '../src/core/infrastructure/database/PrismaKnowledgeRepository';
import { LocalTransformersService } from '../src/core/infrastructure/embedding/LocalTransformersService';
import { PkmnDexProvider } from '../src/core/infrastructure/external/PkmnDexProvider';
import { SeedKnowledgeVaultUseCase } from '../src/core/application/usecases/SeedKnowledgeVaultUseCase';

const CONNECTION_STRING = process.env.DIRECT_URL || process.env.DATABASE_URL;
const POOL = new Pool({ connectionString: CONNECTION_STRING });
const ADAPTER = new PrismaPg(POOL);
const PRISMA = new PrismaClient({ adapter: ADAPTER });

/**
 * Punto de entrada principal para el proceso de siembra y RAG de Hexacore.
 * Actúa estrictamente como raíz de composición (Composition Root), conectando
 * adaptadores concretos con los puertos definidos por la capa de aplicación.
 */
async function main(): Promise<void> {
  // 1. Instanciación de adaptadores de infraestructura
  const repository = new PrismaKnowledgeRepository(PRISMA);
  const embeddingService = new LocalTransformersService();
  const dexProvider = new PkmnDexProvider();

  // 2. Inyección de dependencias en el caso de uso principal
  const useCase = new SeedKnowledgeVaultUseCase(
    repository,
    embeddingService,
    dexProvider
  );

  // 3. Ejecución orquestada
  await useCase.execute();
}

main()
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`FATAL_ERROR: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await PRISMA.$disconnect();
  });
