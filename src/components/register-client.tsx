"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendSmsCode, verifySmsCode } from "@/lib/actions";
import {
  User, Phone, Hash, ChevronRight, ArrowLeft,
  ShieldCheck, CheckCircle2, Mail, RefreshCw, AlertCircle,
} from "lucide-react";
import { Language } from "@/lib/translations";
import Link from "next/link";

export function RegisterClient({ lang }: { lang: Language }) {
  const uz = lang === "uz";

  const [step, setStep]               = useState<1 | 2>(1);
  const [isExisting, setIsExisting]   = useState(false);
  const [userData, setUserData]       = useState({ name: "", phone: "", pinfl: "", email: "" });
  const [code, setCode]               = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendCooldown, setResendCooldown] = useState(0);

  /* ── Client-side field validation ── */
  function validateFields(data: typeof userData): Record<string, string> {
    const errs: Record<string, string> = {};
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 12) {
      errs.phone = uz
        ? "Telefon raqami noto'g'ri (9–12 ta raqam)"
        : "Неверный номер телефона (9–12 цифр)";
    }
    if (data.pinfl && data.pinfl.replace(/\D/g, "").length !== 14) {
      errs.pinfl = uz
        ? "JShShIR aniq 14 ta raqamdan iborat bo'lishi kerak"
        : "ПИНФЛ должен содержать ровно 14 цифр";
    }
    if (data.pinfl && /\D/.test(data.pinfl)) {
      errs.pinfl = uz ? "JShShIR faqat raqamlardan iborat" : "ПИНФЛ содержит только цифры";
    }
    if (!data.email.includes("@")) {
      errs.email = uz ? "Email manzil noto'g'ri" : "Неверный email адрес";
    }
    return errs;
  }

  /* ── Step 1: send OTP ── */
  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const data = {
      name:  (form.elements.namedItem("name")  as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      pinfl: (form.elements.namedItem("pinfl") as HTMLInputElement)?.value.replace(/\D/g, "") ?? "",
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim().toLowerCase(),
    };

    const errs = validateFields(data);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setUserData(data);
    setIsLoading(true);

    try {
      const res = await sendSmsCode(data.phone, data.email);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setIsExisting(res.isExistingUser);
      setStep(2);
      startResendCooldown();
    } catch {
      setError(uz ? "Xatolik yuz berdi. Qayta urining." : "Произошла ошибка. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 2: verify code ── */
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await verifySmsCode(userData.phone, code, userData);
    setIsLoading(false);

    if (result && "error" in result && result.error) {
      setError(result.error);
    } else {
      window.location.href = "/dashboard";
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    await sendSmsCode(userData.phone, userData.email);
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
        className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-border/50 dark:border-white/10 bg-background/80 dark:bg-background/40 backdrop-blur-2xl shadow-2xl"
      >
        <div className="p-5 sm:p-8 md:p-12">

          {/* Header */}
          <div className="mb-8 sm:mb-10 text-center">
            <motion.div
              key={step}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              {step === 1 ? <User size={32} /> : <ShieldCheck size={32} />}
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight md:text-4xl">
              {step === 1
                ? (uz ? "Ro'yxatdan o'tish" : "Регистрация")
                : isExisting
                  ? (uz ? "Xush kelibsiz!" : "Добро пожаловать!")
                  : (uz ? "Emailni tekshiring" : "Проверьте email")}
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              {step === 1
                ? (uz ? "Ma'lumotlaringizni kiriting" : "Введите ваши данные")
                : isExisting
                  ? (uz ? `${userData.phone} raqami bilan hisobingiz topildi` : `Аккаунт с номером ${userData.phone} найден`)
                  : (uz ? `Kod ${userData.email} manziliga yuborildi` : `Код отправлен на ${userData.email}`)}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 1 ? "bg-primary" : "bg-border"}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
          </div>

          {/* Top-level error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
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
                <Field
                  icon={<User size={18} />}
                  name="name"
                  placeholder={uz ? "To'liq ismingiz" : "Полное имя"}
                  required
                />

                <FieldWithError
                  icon={<Phone size={18} />}
                  name="phone"
                  type="tel"
                  placeholder="+998 XX XXX XX XX"
                  required
                  inputMode="tel"
                  error={fieldErrors.phone}
                  onInput={(e) => {
                    const el = e.target as HTMLInputElement;
                    el.value = el.value.replace(/[^\d\s\+\-\(\)]/g, "");
                  }}
                />

                {/* Gmail label */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-1">
                    <Mail size={13} className="text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                      Gmail — {uz ? "kod shu manzilga yuboriladi" : "код придёт на этот адрес"}
                    </span>
                  </div>
                  <FieldWithError
                    icon={<Mail size={18} />}
                    name="email"
                    type="email"
                    placeholder="yourname@gmail.com"
                    required
                    inputMode="email"
                    error={fieldErrors.email}
                  />
                </div>

                <FieldWithError
                  icon={<Hash size={18} />}
                  name="pinfl"
                  placeholder={uz ? "JShShIR — 14 ta raqam (ixtiyoriy)" : "ПИНФЛ — 14 цифр (необязательно)"}
                  required={false}
                  inputMode="numeric"
                  maxLength={14}
                  error={fieldErrors.pinfl}
                  onInput={(e) => {
                    const el = e.target as HTMLInputElement;
                    el.value = el.value.replace(/\D/g, "").slice(0, 14);
                  }}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading
                      ? (uz ? "Yuklanmoqda..." : "Загрузка...")
                      : (uz ? "Kodni Gmailga yuborish" : "Отправить код на Gmail")}
                    {!isLoading && <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />}
                  </span>
                  <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  {uz ? "Allaqachon hisob bormi?" : "Уже есть аккаунт?"}{" "}
                  <Link href="/login" className="font-bold text-primary hover:underline">
                    {uz ? "Kirish" : "Войти"}
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
                {/* Email card */}
                <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/8 px-5 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground">
                      {uz ? "Gmail xatingizni oching" : "Откройте Gmail"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{userData.email}</p>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  {uz
                    ? "Gmailga kelgan 4 xonali kodni kiriting"
                    : "Введите 4-значный код из Gmail"}
                </p>

                {/* Code input */}
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
                      : (uz ? "Tasdiqlash va kirish" : "Подтвердить и войти")}
                    <CheckCircle2 size={18} />
                  </button>
                </form>

                {/* Resend + back */}
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

/* ── Simple field ─────────────────────────────────────────── */
function Field({
  icon, name, placeholder, type = "text", required = true, inputMode,
}: {
  icon: React.ReactNode; name: string; placeholder: string;
  type?: string; required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="group relative">
      <div className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
        {icon}
      </div>
      <input
        name={name} type={type} required={required}
        placeholder={placeholder} inputMode={inputMode}
        className="w-full rounded-2xl border border-border dark:border-white/10 bg-secondary/50 dark:bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/10"
      />
    </div>
  );
}

/* ── Field with inline error ──────────────────────────────── */
function FieldWithError({
  icon, name, placeholder, type = "text", required = true,
  inputMode, maxLength, error, onInput,
}: {
  icon: React.ReactNode; name: string; placeholder: string;
  type?: string; required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number; error?: string;
  onInput?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="group relative">
        <div className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
          {icon}
        </div>
        <input
          name={name} type={type} required={required}
          placeholder={placeholder} inputMode={inputMode}
          maxLength={maxLength} onInput={onInput}
          className={`w-full rounded-2xl border bg-secondary/50 dark:bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
            error
              ? "border-destructive/60 focus:border-destructive"
              : "border-border dark:border-white/10 focus:border-primary/50 focus:bg-white/8"
          }`}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 pl-2 text-xs font-medium text-destructive"
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
