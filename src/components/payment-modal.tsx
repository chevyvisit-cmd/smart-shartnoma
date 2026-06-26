"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, AlertCircle, FlaskConical, Clock } from "lucide-react";
import { Language } from "@/lib/translations";

interface Props {
  open: boolean;
  price: number;
  lang: Language;
  savedFormData?: string;
  onClose: () => void;
}

export function PaymentModal({ open, price, lang, savedFormData, onClose }: Props) {
  const [loading, setLoading] = useState<"click" | "payme" | "test" | null>(null);
  const [err, setErr] = useState("");

  const uz = lang === "uz";

  async function pay(provider: "click" | "payme") {
    setLoading(provider);
    setErr("");
    if (savedFormData) sessionStorage.setItem("pending_contract_form", savedFormData);
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
    setLoading("test");
    setErr("");
    try {
      const res = await fetch("/api/payments/test", { method: "POST" });
      if (!res.ok) throw new Error();
      if (savedFormData) sessionStorage.setItem("pending_contract_form", savedFormData);
      window.location.href = "/contracts/new?payment=success&provider=test";
    } catch {
      setErr(uz ? "Test to'lov xatoligi" : "Ошибка тестовой оплаты");
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="relative w-full sm:max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[32px] border border-white/10 bg-background shadow-2xl"
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">
                    {uz ? "Shartnoma yaratish uchun to'lov" : "Оплата для создания договора"}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {uz
                      ? "Birinchi 2 ta shartnoma bepul. Keyingi har biri:"
                      : "Первые 2 договора бесплатны. Каждый следующий:"}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-6 py-4 text-center">
                <p className="text-2xl sm:text-3xl font-black text-violet-400">{price.toLocaleString()} UZS</p>
                <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">
                  {uz ? "Bir shartnoma uchun" : "За один договор"}
                </p>
              </div>

              {/* Error */}
              {err && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
                  <AlertCircle size={16} /> {err}
                </div>
              )}

              {/* Payment buttons */}
              <div className="space-y-3">
                {/* Click */}
                <button
                  onClick={() => pay("click")}
                  disabled={!!loading}
                  className="relative flex w-full items-center justify-between rounded-2xl border border-[#00CCFF]/20 bg-[#00CCFF]/5 px-5 py-4 transition-all hover:bg-[#00CCFF]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    {loading === "click" ? (
                      <Loader2 size={20} className="animate-spin text-[#00CCFF]" />
                    ) : (
                      <span className="text-lg font-black text-[#00CCFF]">Click</span>
                    )}
                    <span className="text-sm font-bold">
                      {uz ? "Click orqali to'lash" : "Оплатить через Click"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-500 uppercase tracking-wide">
                    <Clock size={9} />
                    {uz ? "tez orada" : "скоро"}
                  </span>
                </button>

                {/* Payme */}
                <button
                  onClick={() => pay("payme")}
                  disabled={!!loading}
                  className="relative flex w-full items-center justify-between rounded-2xl border border-[#1AC47D]/20 bg-[#1AC47D]/5 px-5 py-4 transition-all hover:bg-[#1AC47D]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    {loading === "payme" ? (
                      <Loader2 size={20} className="animate-spin text-[#1AC47D]" />
                    ) : (
                      <span className="text-lg font-black text-[#1AC47D]">Payme</span>
                    )}
                    <span className="text-sm font-bold">
                      {uz ? "Payme orqali to'lash" : "Оплатить через Payme"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-500 uppercase tracking-wide">
                    <Clock size={9} />
                    {uz ? "tez orada" : "скоро"}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    {uz ? "yoki test uchun" : "или для теста"}
                  </span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                {/* Test payment — always visible */}
                <button
                  onClick={payTest}
                  disabled={!!loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 py-3.5 text-sm font-black text-amber-500 transition-all hover:bg-amber-500/10 hover:border-amber-500/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "test" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FlaskConical size={16} />
                  )}
                  {loading === "test"
                    ? (uz ? "Kredit qo'shilmoqda..." : "Добавляется кредит...")
                    : (uz ? "Soxta to'lov (test)" : "Тестовая оплата")}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground/40">
                {uz
                  ? "To'lovdan keyin kredit hisobingizga qo'shiladi."
                  : "После оплаты кредит добавится на ваш счёт."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
