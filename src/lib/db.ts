import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Singleton: evitar múltiples instancias en desarrollo (hot-reload de Next.js)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Prisma 7 requiere que se configure el driver adapter pasándole la URL de SQLite
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
