import { describe, it, expect, beforeEach } from "vitest";
import { checkQuota } from "../lib/config";

// ─── checkQuota sof funksiyasi testlari ──────────────────────────────────
describe("checkQuota", () => {

  // Test 1: Bepul limit ichida — ruxsat berilsin
  it("bepul limitda shartnoma yaratishga ruxsat beradi", () => {
    // 0 ta ishlatilgan, limit 2 — ikkalasi ham ruxsat
    expect(checkQuota(0, 0)).toEqual({ allowed: true, type: "free" });
    expect(checkQuota(1, 0)).toEqual({ allowed: true, type: "free" });
  });

  // Test 2: Bepul limit tugagan, kredit yo'q — RAD etilsin
  it("bepul limit tugab, kredit yo'q bo'lsa rad etadi", () => {
    expect(checkQuota(2, 0)).toEqual({ allowed: false });
    expect(checkQuota(5, 0)).toEqual({ allowed: false });
    expect(checkQuota(100, 0)).toEqual({ allowed: false });
  });

  // Test 3: Bepul limit tugagan lekin kredit bor — to'langan kredit ishlatilsin
  it("bepul limit tugab, kredit bor bo'lsa kredit ishlatadi", () => {
    expect(checkQuota(2, 1)).toEqual({ allowed: true, type: "paid" });
    expect(checkQuota(2, 5)).toEqual({ allowed: true, type: "paid" });
    expect(checkQuota(99, 1)).toEqual({ allowed: true, type: "paid" });
  });

  // Test 4: Bepul slot ham, kredit ham bor — bepul ustunlik qilsin
  it("bepul slot mavjud bo'lsa kreditga qaramay bepuldan foydalanadi", () => {
    expect(checkQuota(0, 10)).toEqual({ allowed: true, type: "free" });
    expect(checkQuota(1, 3)).toEqual({ allowed: true, type: "free" });
  });

  // Test 5: Chegara holati — aynan limit da
  it("freeUsed === freeLimit bo'lganda bepul slot yo'q", () => {
    // default limit = 2 (env dan olinadi, test da 2 deb hisoblaymiz)
    const result = checkQuota(2, 0);
    expect(result.allowed).toBe(false);
  });
});
