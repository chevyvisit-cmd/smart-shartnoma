import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildClient(): PrismaClient {
  const envUrl = process.env.DATABASE_URL ?? "";

  let url: string;
  let authToken = "";

  if (envUrl.startsWith("libsql://") || envUrl.startsWith("wss://")) {
    url = envUrl;
    authToken = process.env.DATABASE_AUTH_TOKEN ?? "";
  } else {
    url = process.env.VERCEL ? "file:/tmp/dev.db" : "file:./dev.db";
  }

  return new PrismaClient({ adapter: new PrismaLibSql({ url, authToken }) });
}

export const db = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
