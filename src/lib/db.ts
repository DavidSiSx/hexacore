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

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    nombre?: string;
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export async function ensureDbUser(user: SupabaseUser) {
  try {
    const existing = await prisma.usuario.findUnique({
      where: { id: user.id },
    });

    if (!existing) {
      await prisma.usuario.create({
        data: {
          id: user.id,
          email: user.email || "",
          nombre: user.user_metadata?.nombre || user.user_metadata?.full_name || user.email?.split("@")[0] || "Entrenador",
          avatar_url: user.user_metadata?.avatar_url || null,
        },
      });
    }
  } catch (error) {
    console.error("Error al sincronizar usuario en DB local:", error);
  }
}

