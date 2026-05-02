import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback keeps `prisma generate` working in build environments without DB secrets.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});