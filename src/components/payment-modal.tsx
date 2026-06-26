"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, AlertCircle, FlaskConical } from "lucide-react";
import { Language } from "@/lib/translations";

interface Props {
  open: boolean;
  price: number;
  lang: Language;
  savedFormData?: string; // JSON-stringified form snapshot
  onClose: () => void;
}

export function PaymentModal({ open, price, lang, savedFormData, onClose }: Props) {
  const [loading, setLoading] = useState<"click" | "payme" | null>(null);
  const [err, setErr] = useState("");

  const uz = lang === "uz";

  async function pay(provider: "click" | "payme") {
    setLoading(provider);
    setErr("");

    if (savedFormData) {
      sessionStorage.setItem("pending_contract_form", savedFormData);
    }

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "server_error");
      window.location.href = data.url;
    } catch {
      setErr(uz ? "Xatolik yuz berdi, qayta urinib ko'ring." : "Произошла ошибка, попробуйте ещё раз.");
      setLoading(null);
    }
  }

  async function payTest() {
    setLoading("click");
    setErr("");
    try {
      const res = await fetch("/api/payments/test", { method: "POST" });
      if (!res.ok) throw new Error();
      // Muvaffaqiyat — sahifani qayta yuklash
      if (savedFormData) sessionStorage.setItem("pending_contract_form", savedFormData);
      window.location.href = "/contracts/new?payment=success&provider=test";
    } catch {
      setErr("Test to'lov xatoligi");
      setLoading(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-background shadow-2xl"
          >
            {/* Yopish tugmasi */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
            >
              <X size={16} />
            </button>

            <div className="p-8">
              {/* Sarlavha */}
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <CreditCard size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    {uz ? "Shartnoma yaratish uchun to'lov" : "Оплата для создания договора"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {uz
                      ? "Birinchi 2 ta shartnoma bepul. Keyingi har biri:"
                      : "Первые 2 договора бесплатны. Каждый следующий:"}
                  </p>
                </div>
              </div>

              {/* Narx */}
              <div className="mb-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-6 py-4 text-center">
                <p className="text-3xl font-black text-violet-400">{price.toLocaleString()} UZS</p>
                <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">
                  {uz ? "Bir shartnoma uchun" : "За один договор"}
                </p>
              </div>

              {/* Xato */}
              {err && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
                  <AlertCircle size={16} /> {err}
                </div>
              )}

              {/* To'lov tugmalari */}
              <div className="space-y-3">
                <button
                  onClick={() => pay("click")}
                  disabled={!!loading}
                  className="flex w-full items-center justify-between rounded-2xl border border-[#00CCFF]/30 bg-[#00CCFF]/5 px-6 py-4 transition-all hover:bg-[#00CCFF]/10 hover:border-[#00CCFF]/50 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {loading === "click" ? (
                      <Loader2 size={22} className="animate-spin text-[#00CCFF]" />
                    ) : (
                      <span className="text-xl font-black text-[#00CCFF]">Click</span>
                    )}
                    <span className="text-sm font-bold text-foreground">
                      {uz ? "Click orqali to'lash" : "Оплатить через Click"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#00CCFF] uppercase tracking-widest">→</span>
                </button>

                <button
                  onClick={() => pay("payme")}
                  disabled={!!loading}
                  className="flex w-full items-center justify-between rounded-2xl border border-[#1AC47D]/30 bg-[#1AC47D]/5 px-6 py-4 transition-all hover:bg-[#1AC47D]/10 hover:border-[#1AC47D]/50 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {loading === "payme" ? (
                      <Loader2 size={22} className="animate-spin text-[#1AC47D]" />
                    ) : (
                      <span className="text-xl font-black text-[#1AC47D]">Payme</span>
                    )}
                    <span className="text-sm font-bold text-foreground">
                      {uz ? "Payme orqali to'lash" : "Оплатить через Payme"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#1AC47D] uppercase tracking-widest">→</span>
                </button>
              </div>

              {/* DEV rejimida test to'lov tugmasi */}
              {process.env.NODE_ENV !== "production" && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={payTest}
                    disabled={!!loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 py-3 text-xs font-black text-amber-500 transition-all hover:bg-amber-500/10 disabled:opacity-50"
                  >
                    {loading === "click" ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
                    TEST — Soxta to'lov (faqat dev)
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-xs text-muted-foreground/50">
                {uz
                  ? "To'lovdan keyin kredit hisobingizga qo'shiladi va shartnoma yaratishingiz mumkin bo'ladi."
                  : "После оплаты кредит будет добавлен на ваш счёт и вы сможете создать договор."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
