"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendLoginCode, verifyLoginCode } from "@/lib/actions";
import {
  Phone, ChevronRight, ArrowLeft, ShieldCheck,
  CheckCircle2, RefreshCw, AlertCircle, LogIn,
} from "lucide-react";
import { Language } from "@/lib/translations";
import Link from "next/link";

export function LoginClient({ lang }: { lang: Language }) {
  const uz = lang === "uz";

  const [step, setStep]     = useState<1 | 2>(1);
  const [phone, setPhone]   = useState("");
  const [code, setCode]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]   = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  /* ── Step 1: request code ── */
  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await sendLoginCode(phone.trim());
    setIsLoading(false);

    if ("error" in res) {
      setError(res.error);
    } else {
      setStep(2);
      startResendCooldown();
    }
  };

  /* ── Step 2: verify code ── */
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await verifyLoginCode(phone.trim(), code);
    setIsLoading(false);

    if ("error" in res) {
      setError(res.error);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    await sendLoginCode(phone.trim());
    startResendCooldown();
  };

  function startResendCooldown(seconds = 60) {
    setResendCooldown(seconds);
    const iv = setInterval(() => {
      setResendCooldown((n) => {
        if (n <= 1) { clearInterval(iv); return 0; }
        return n - 1;
      });
    }, 1000);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-border/50 dark:border-white/10 bg-background/80 dark:bg-background/40 backdrop-blur-2xl shadow-2xl"
      >
        <div className="p-6 sm:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              key={step}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              {step === 1 ? <LogIn size={30} /> : <ShieldCheck size={30} />}
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {step === 1
                ? (uz ? "Tizimga kirish" : "Войти в систему")
                : (uz ? "Kodni kiriting" : "Введите код")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === 1
                ? (uz ? "Ro'yxatdan o'tgan telefon raqamingizni kiriting" : "Введите зарегистрированный номер телефона")
                : (uz ? `Kod ${phone} raqamiga bog'liq emailga yuborildi` : `Код отправлен на email, привязанный к ${phone}`)}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="h-1.5 w-12 rounded-full bg-primary" />
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendCode}
                className="space-y-4"
              >
                <div className="group relative">
                  <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.value = el.value.replace(/[^\d\s\+\-\(\)]/g, "");
                    }}
                    placeholder="+998 XX XXX XX XX"
                    inputMode="tel"
                    className="w-full rounded-2xl border border-border dark:border-white/10 bg-secondary/50 dark:bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.trim().length < 9}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading
                      ? (uz ? "Yuklanmoqda..." : "Загрузка...")
                      : (uz ? "Kod yuborish" : "Отправить код")}
                    {!isLoading && <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />}
                  </span>
                  <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  {uz ? "Hisob yo'qmi?" : "Нет аккаунта?"}{" "}
                  <Link href="/register" className="font-bold text-primary hover:underline">
                    {uz ? "Ro'yxatdan o'tish" : "Зарегистрироваться"}
                  </Link>
                </p>
              </motion.form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="group relative">
                    <ShieldCheck className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      required
                      inputMode="numeric"
                      placeholder={uz ? "4 xonali kod" : "4-значный код"}
                      className="w-full rounded-2xl border border-border dark:border-white/10 bg-secondary/50 dark:bg-white/5 py-4 pl-12 pr-4 text-center text-2xl font-black tracking-[0.5em] outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || code.length < 4}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading
                      ? (uz ? "Tekshirilmoqda..." : "Проверяем...")
                      : (uz ? "Kirish" : "Войти")}
                    <CheckCircle2 size={18} />
                  </button>
                </form>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setCode(""); setError(""); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft size={14} />
                    {uz ? "Orqaga" : "Назад"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary transition-opacity disabled:opacity-40"
                  >
                    <RefreshCw size={13} className={resendCooldown > 0 ? "" : "hover:rotate-180 transition-transform duration-500"} />
                    {resendCooldown > 0
                      ? `${uz ? "Qayta yuborish" : "Повторить"} (${resendCooldown}s)`
                      : (uz ? "Qayta yuborish" : "Отправить снова")}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
