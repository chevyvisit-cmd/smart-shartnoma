// ─── Freemium sozlamalari ─────────────────────────────────────────────────
// .env.local yoki environment variable orqali o'zgartiring
export const FREE_CONTRACTS_LIMIT = parseInt(process.env.FREE_CONTRACTS_LIMIT ?? "2", 10);
export const PRICE_PER_CONTRACT   = parseInt(process.env.PRICE_PER_CONTRACT   ?? "10000", 10);

// ─── To'lov provayderlari ─────────────────────────────────────────────────
export const CLICK_SERVICE_ID   = process.env.CLICK_SERVICE_ID   ?? "";
export const CLICK_MERCHANT_ID  = process.env.CLICK_MERCHANT_ID  ?? "";
export const CLICK_SECRET_KEY   = process.env.CLICK_SECRET_KEY   ?? "";

export const PAYME_MERCHANT_ID  = process.env.PAYME_MERCHANT_ID  ?? "";
export const PAYME_SECRET_KEY   = process.env.PAYME_SECRET_KEY   ?? "";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ─── Kvota tekshiruvi (sof funksiya — test qilish uchun qulay) ───────────
export function checkQuota(
  freeContractsUsed: number,
  paidContractCredits: number,
): { allowed: true; type: "free" | "paid" } | { allowed: false } {
  if (freeContractsUsed < FREE_CONTRACTS_LIMIT) return { allowed: true, type: "free" };
  if (paidContractCredits > 0)                  return { allowed: true, type: "paid" };
  return { allowed: false };
}
