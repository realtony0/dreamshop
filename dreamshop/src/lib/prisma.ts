import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const databaseUrl = normalizeEnvValue(process.env.DATABASE_URL) ?? "file:./dev.db";
const databaseAuthToken =
  normalizeEnvValue(process.env.DATABASE_AUTH_TOKEN) ??
  normalizeEnvValue(process.env.TURSO_AUTH_TOKEN);
const adapter = new PrismaLibSql(
  databaseAuthToken
    ? { url: databaseUrl, authToken: databaseAuthToken }
    : { url: databaseUrl }
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
