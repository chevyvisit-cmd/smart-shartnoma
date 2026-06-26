import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? "";

  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("wss://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const libsql = createClient({ url: dbUrl, authToken: process.env.DATABASE_AUTH_TOKEN ?? "" });
    return new PrismaClient({ adapter: new PrismaLibSql(libsql) });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const dbFile = process.env.VERCEL ? "/tmp/dev.db" : "./dev.db";
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbFile }) });
}

export const db = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
