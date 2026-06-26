export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const dbUrl = process.env.DATABASE_URL ?? "";
  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("wss://")) return;

  // Initialize SQLite schema on cold start (for ephemeral /tmp on Vercel)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    const dbFile = process.env.VERCEL ? "/tmp/dev.db" : "./dev.db";
    const sqlite = new Database(dbFile);
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "uid" TEXT UNIQUE,
        "name" TEXT,
        "phone" TEXT UNIQUE NOT NULL,
        "pinfl" TEXT UNIQUE,
        "image" TEXT,
        "freeContractsUsed" INTEGER NOT NULL DEFAULT 0,
        "paidContractCredits" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "orderId" TEXT UNIQUE NOT NULL,
        "amount" REAL NOT NULL,
        "provider" TEXT NOT NULL,
        "transactionId" TEXT,
        "performTime" DATETIME,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id")
      );
      CREATE TABLE IF NOT EXISTS "Contract" (
        "id" TEXT PRIMARY KEY,
        "cid" TEXT UNIQUE,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "amount" REAL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "creatorId" TEXT NOT NULL,
        "recipientId" TEXT,
        "recipientPhone" TEXT,
        "recipientPinfl" TEXT,
        "terms" TEXT DEFAULT '[]',
        "sentAt" DATETIME,
        "acceptedAt" DATETIME,
        "rejectedAt" DATETIME,
        "rejectionReason" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("creatorId") REFERENCES "User"("id"),
        FOREIGN KEY ("recipientId") REFERENCES "User"("id")
      );
    `);
    sqlite.close();
  } catch {
    // DB init failure is non-fatal; app continues
  }
}
