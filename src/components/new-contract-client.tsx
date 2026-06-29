"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, FileText, DollarSign, Phone, FileSignature, Sparkles, CheckCircle2, Plus, Trash2, ListChecks, Percent, CreditCard, Gift } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createContract } from "@/lib/actions";
import { Language, translations } from "@/lib/translations";
import { PaymentModal } from "./payment-modal";

interface Quota { freeUsed: number; freeLimit: number; paidCredits: number; price: number }

export function NewContractClient({
  lang, creatorPhone, quota,
}: { lang: Language; creatorPhone: string; quota: Quota | null }) {
  const t = translations[lang].contracts;
  const router = useRouter();
  const params = useSearchParams();
  const uz = lang === "uz";

  // sessionStorage dan forma ma'lumotlarini tiklash (to'lovdan qaytganda)
  const getSaved = () => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(sessionStorage.getItem("pending_contract_form") ?? "null"); }
    catch { return null; }
  };

  const prefillTitle   = params.get("title")   ?? "";
  const prefillAmount  = params.get("amount")  ?? "";
  const prefillContent = params.get("content") ?? "";
  const prefillTerms   = (() => {
    try { const p = JSON.parse(params.get("terms") ?? "[]"); return Array.isArray(p) && p.length ? p : [""]; }
    catch { return [""]; }
  })();

  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentPrice, setPaymentPrice] = useState(10000);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: prefillTitle,
    amount: prefillAmount,
    recipientPhone: "",
    recipientPinfl: "",
    content: prefillContent,
    type: "KONTRAKT" as "KONTRAKT" | "DOGOVOR",
  });
  const [terms, setTerms] = useState<string[]>(prefillTerms);

  // To'lovdan qaytganda: forma ma'lumotlarini tiklash + success xabar
  useEffect(() => {
    const paymentParam = params.get("payment");
    if (paymentParam === "success") {
      setPaymentSuccess(true);
      const saved = getSaved();
      if (saved) {
        if (saved.formData) setFormData(saved.formData);
        if (saved.terms)    setTerms(saved.terms);
        sessionStorage.removeItem("pending_contract_form");
      }
      // URL dan query param ni olib tashlash
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("provider");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleAction = async (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const filteredTerms = terms.filter(t => t.trim() !== "");
    fd.set("terms", JSON.stringify(filteredTerms));
    const result = await createContract(fd);
    setIsLoading(false);

    if (!result) return;
    if ("error" in result && result.error === "payment_required") {
      // Forma ma'lumotlarini saqlab to'lov modalini ochamiz
      sessionStorage.setItem("pending_contract_form", JSON.stringify({ formData, terms: filteredTerms }));
      setPaymentPrice((result as { error: string; price: number }).price);
      setShowPayment(true);
      return;
    }
    if ("error" in result && result.error) {
      alert(result.error);
      return;
    }
    router.push("/dashboard");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTerm = () => setTerms([...terms, ""]);

  const updateTerm = (i: number, val: string) => {
    const next = [...terms];
    next[i] = val;
    setTerms(next);
  };

  const removeTerm = (i: number) => {
    if (terms.length === 1) return;
    setTerms(terms.filter((_, idx) => idx !== i));
  };

  const filledTerms = terms.filter(t => t.trim() !== "");

  // Kvota hisobi
  const freeLeft = quota ? Math.max(0, quota.freeLimit - quota.freeUsed) : 0;
  const hasCredit = (quota?.paidCredits ?? 0) > 0;
  const canCreate = freeLeft > 0 || hasCredit;

  return (
    <>
    <div className="relative min-h-screen pt-20 pb-16 px-4 md:px-8">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <Link href="/dashboard" className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> {t.backToDashboard}
          </Link>

          {/* Kvota ko'rsatkichi */}
          {quota && (
            <div className="flex items-center gap-2 flex-wrap">
              {paymentSuccess && (
                <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-black text-emerald-500">
                  <CheckCircle2 size={13} />
                  {uz ? "To'lov muvaffaqiyatli! Kredit qo'shildi." : "Оплата прошла! Кредит добавлен."}
                </span>
              )}
              {freeLeft > 0 ? (
                <span className="flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-black text-primary">
                  <Gift size={13} />
                  {uz ? `Bepul: ${freeLeft}/${quota.freeLimit} qoldi` : `Бесплатно: осталось ${freeLeft}/${quota.freeLimit}`}
                </span>
              ) : hasCredit ? (
                <span className="flex items-center gap-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-xs font-black text-violet-400">
                  <CreditCard size={13} />
                  {uz ? `${quota.paidCredits} ta to'langan kredit` : `${quota.paidCredits} платных кредита`}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-black text-amber-500">
                  <Percent size={13} />
                  {uz ? `To'lov kerak — ${quota.price.toLocaleString()} UZS` : `Требуется оплата — ${quota.price.toLocaleString()} UZS`}
                </span>
              )}
            </div>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[32px] border border-white/10 bg-background/40 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl md:p-10"
          >
            <div className="mb-6 sm:mb-8">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 sm:mb-4">
                <FileSignature size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t.newTitle}</h1>
              <p className="mt-2 text-muted-foreground font-medium">{lang === 'uz' ? "Barcha zaruriy ma'lumotlarni kiriting." : "Введите все необходимые данные."}</p>
            </div>

            <form onSubmit={handleAction} className="space-y-6">

              {/* Hujjat turi */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  {uz ? "Hujjat turi" : "Тип документа"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["KONTRAKT", "DOGOVOR"] as const).map((tp) => {
                    const isSelected = formData.type === tp;
                    return (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: tp })}
                        className={`relative rounded-2xl border px-4 py-3 text-left transition-all ${
                          isSelected
                            ? tp === "KONTRAKT"
                              ? "border-primary/60 bg-primary/10 text-primary"
                              : "border-blue-500/60 bg-blue-500/10 text-blue-400"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        <input type="hidden" name="type" value={formData.type} />
                        <p className="text-xs font-black uppercase tracking-widest">{tp}</p>
                        <p className="mt-0.5 text-[10px] opacity-70">
                          {tp === "KONTRAKT"
                            ? (uz ? "Asosiy shartnoma" : "Основной договор")
                            : (uz ? "Qo'shimcha kelishuv" : "Дополнительное соглашение")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="group space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t.titleLabel}</label>
                  <div className="relative">
                    <FileText className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <input
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder={t.titlePlaceholder}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <div className="group space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t.amountLabel}</label>
                  <div className="relative">
                    <DollarSign className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <input
                      name="amount"
                      required
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="5 000 000"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-black outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  {lang === "uz" ? "Sizning raqamingiz (Ijrochi)" : "Ваш номер (Исполнитель)"}
                </label>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-primary/50" size={18} />
                  <input
                    readOnly
                    value={creatorPhone}
                    className="w-full rounded-2xl border border-primary/20 bg-primary/5 py-4 pl-12 pr-4 text-sm font-black text-primary outline-none cursor-default"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                    {lang === "uz" ? "Mijoz telefon raqami" : "Телефон получателя"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <input
                      name="recipientPhone"
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={handleChange}
                      placeholder="+998 90 123 45 67"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <div className="group space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                    {lang === "uz" ? "Mijoz JShShIR (PINFL)" : "ПИНФЛ получателя"}
                  </label>
                  <div className="relative">
                    <FileText className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <input
                      name="recipientPinfl"
                      type="text"
                      value={formData.recipientPinfl}
                      onChange={handleChange}
                      maxLength={14}
                      placeholder="12345678901234"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/50 -mt-2 ml-1">
                {lang === "uz" ? "Telefon yoki JShShIR — biri kiritilsa shartnoma avtomatik yuboriladi" : "Телефон или ПИНФЛ — если заполнено, договор отправится автоматически"}
              </p>

              <div className="group space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t.contentLabel}</label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder={t.contentPlaceholder}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                />
              </div>

              {/* Terms section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ListChecks size={16} className="text-primary" />
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{t.termsLabel}</label>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {terms.map((term, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={term}
                          onChange={e => updateTerm(i, e.target.value)}
                          placeholder={t.termPlaceholder}
                          className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeTerm(i)}
                          disabled={terms.length === 1}
                          className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={addTerm}
                  className="flex items-center gap-2 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10"
                >
                  <Plus size={16} />
                  {t.addTerm}
                </button>
              </div>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black transition-all hover:bg-white/10"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 text-sm font-black text-white shadow-xl transition-all hover:scale-105 hover:shadow-primary/30 active:scale-95 disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? t.saving : t.createAndSend}
                    <Save size={18} />
                  </span>
                  <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block"
          >
            <div className="sticky top-28 rounded-[32px] border border-white/5 bg-white/5 p-8 backdrop-blur-md">
              <div className="mb-6 flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                <Sparkles size={16} /> {t.preview}
              </div>

              <div className="min-h-[400px] rounded-2xl bg-white/5 p-8 border border-dashed border-white/10">
                <AnimatePresence mode="wait">
                  {formData.title || formData.content || formData.amount ? (
                    <motion.div
                      key="preview-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-black tracking-tight">{formData.title || t.titleLabel}</h2>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <DollarSign size={20} />
                        <span className="text-xl">
                          {formData.amount ? Number(formData.amount).toLocaleString() : "0"} UZS
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
                          <p className="font-black uppercase tracking-widest text-primary/50 text-[10px] mb-1">
                            {lang === "uz" ? "Ijrochi" : "Исполнитель"}
                          </p>
                          <p className="font-black text-primary">{creatorPhone}</p>
                        </div>
                        {formData.recipientPhone && (
                          <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                            <p className="font-black uppercase tracking-widest text-muted-foreground/50 text-[10px] mb-1">
                              {lang === "uz" ? "Buyurtmachi" : "Заказчик"}
                            </p>
                            <p className="font-black">{formData.recipientPhone}</p>
                          </div>
                        )}
                      </div>
                      <div className="h-px bg-white/10" />
                      <p className="whitespace-pre-wrap wrap-break-word overflow-hidden text-muted-foreground leading-relaxed">
                        {formData.content || t.contentPlaceholder}
                      </p>
                      {filledTerms.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                            <ListChecks size={14} /> {t.termsLabel}
                          </div>
                          {filledTerms.map((term, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">{i + 1}</span>
                              <span className="text-sm text-muted-foreground">{term}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-12 flex items-center gap-2 text-xs font-bold text-muted-foreground/40 italic">
                        <CheckCircle2 size={14} /> {t.smsRequired}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground opacity-40">
                      <FileText size={48} strokeWidth={1} />
                      <p className="mt-4 font-bold">{t.previewEmpty}</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>

    {/* To'lov modali */}
    <PaymentModal
      open={showPayment}
      price={paymentPrice}
      lang={lang}
      savedFormData={JSON.stringify({ formData, terms })}
      onClose={() => setShowPayment(false)}
    />
    </>
  );
}
