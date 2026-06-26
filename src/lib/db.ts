import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? "";

  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("wss://")) {
    // Production: Turso remote database
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const client = createClient({ url: dbUrl, authToken: process.env.DATABASE_AUTH_TOKEN ?? "" });
    return new PrismaClient({ adapter: new PrismaLibSql(client) });
  }

  // Local development: SQLite via better-sqlite3
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: "./dev.db" }) });
}

export const db = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
