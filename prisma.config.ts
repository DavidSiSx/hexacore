import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Redirigir automáticamente de forma dinámica el puerto del pooler de transacciones (6543)
    // al puerto de sesión/conexión directa (5432) para evitar bloqueos en operaciones DDL.
    url: process.env.DATABASE_URL?.replace("6543", "5432"),
  },
});
