"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSmsCode, verifyLoginSmsCode } from "@/lib/actions";
import { Phone, ShieldCheck, ChevronRight, ArrowLeft, LogIn, CheckCircle2, Sparkles } from "lucide-react";
import { Language, translations } from "@/lib/translations";

export function LoginClient({ lang }: { lang: Language }) {
  const t = translations[lang].auth;
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await loginSmsCode(phone);
    setIsLoading(false);
    if ("error" in result && result.error) {
      alert(result.error);
    } else {
      setStep(2);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await verifyLoginSmsCode(phone, code);
    setIsLoading(false);
    if (result && "error" in result && result.error) {
      alert(result.error);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-background/40 backdrop-blur-2xl shadow-2xl"
      >
        <div className="p-8 md:p-12">
          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              {step === 1 ? <LogIn size={32} /> : <ShieldCheck size={32} />}
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              {step === 1 ? t.loginTitle : t.verifyTitle}
            </h2>
            <p className="mt-3 text-muted-foreground font-medium">
              {step === 1 
                ? (lang === 'uz' ? "Davom etish uchun telefon raqamingizni kiriting." : "Введите номер телефона, чтобы продолжить.")
                : (lang === 'uz' ? `Biz ${phone} raqamiga tasdiqlash kodini yubordik.` : `Мы отправили код подтверждения на номер ${phone}.`)}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendCode}
                className="space-y-6"
              >
                <div className="group relative">
                  <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? t.sending : t.getSms}
                    {!isLoading && <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />}
                  </span>
                  <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify}
                className="space-y-6"
              >
                <div className="group relative">
                  <ShieldCheck className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={6}
                    placeholder={t.codePlaceholder}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-center text-xl font-black tracking-[0.5em] outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? t.verifying : t.verifyAndLogin}
                    <CheckCircle2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft size={16} />
                    {t.changeData}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 border-t border-white/10 pt-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {t.noAccount}{" "}
              <Link href="/register" className="font-black text-primary hover:underline">
                {translations[lang].nav.register}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
