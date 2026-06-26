export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const envUrl = process.env.DATABASE_URL ?? "";
  if (envUrl.startsWith("libsql://") || envUrl.startsWith("wss://")) return;

  const url = process.env.VERCEL ? "file:/tmp/dev.db" : "file:./dev.db";

  try {
    const { createClient } = await import("@libsql/client");
    const client = createClient({ url, authToken: "" });

    const stmts = [
      `CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY, "uid" TEXT UNIQUE, "name" TEXT,
        "phone" TEXT UNIQUE NOT NULL, "pinfl" TEXT UNIQUE, "image" TEXT,
        "freeContractsUsed" INTEGER NOT NULL DEFAULT 0,
        "paidContractCredits" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL,
        "orderId" TEXT UNIQUE NOT NULL, "amount" REAL NOT NULL,
        "provider" TEXT NOT NULL, "transactionId" TEXT, "performTime" DATETIME,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id"))`,
      `CREATE TABLE IF NOT EXISTS "Contract" (
        "id" TEXT PRIMARY KEY, "cid" TEXT UNIQUE,
        "title" TEXT NOT NULL, "content" TEXT NOT NULL, "amount" REAL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "creatorId" TEXT NOT NULL, "recipientId" TEXT,
        "recipientPhone" TEXT, "recipientPinfl" TEXT,
        "terms" TEXT DEFAULT '[]',
        "sentAt" DATETIME, "acceptedAt" DATETIME,
        "rejectedAt" DATETIME, "rejectionReason" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("creatorId") REFERENCES "User"("id"),
        FOREIGN KEY ("recipientId") REFERENCES "User"("id"))`,
    ];

    for (const sql of stmts) {
      await client.execute(sql);
    }
    client.close();
  } catch {
    // Non-fatal: Prisma will surface DB errors on first query
  }
}
