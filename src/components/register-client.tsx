"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { sendSmsCode, verifySmsCode } from "@/lib/actions";
import { User, Phone, Hash, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { translations, Language } from "@/lib/translations";

export default function RegisterPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | any 
}) {
  // We need to fetch the language on the client side since this is a "use client" file
  // or pass it from a parent. Let's make it simpler and use a small helper or hook.
  // Actually, I'll pass it from a server wrapper.
  return null; // This will be overwritten by the server component pattern
}

export function RegisterClient({ lang }: { lang: Language }) {
  const t = translations[lang].auth;
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ name: "", phone: "", pinfl: "" });
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      pinfl: formData.get("pinfl") as string,
    };
    setUserData(data);
    try {
      await sendSmsCode(data.phone);
      setStep(2);
    } catch (error) {
      console.error("SMS sending failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await verifySmsCode(userData.phone, code, userData);
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
              {step === 1 ? <User size={32} /> : <ShieldCheck size={32} />}
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              {step === 1 ? t.registerTitle : t.verifyTitle}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {step === 1 
                ? (lang === 'uz' ? "Platformamizga xush kelibsiz! Ma'lumotlaringizni kiriting." : "Добро пожаловать на платформу! Введите свои данные.")
                : (lang === 'uz' ? `Biz ${userData.phone} raqamiga tasdiqlash kodini yubordik.` : `Мы отправили код подтверждения на номер ${userData.phone}.`)}
            </p>
          </div>

          <div className="mb-10 flex items-center justify-center gap-2">
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 1 ? "bg-primary" : "bg-white/10"}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 2 ? "bg-primary" : "bg-white/10"}`} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendCode}
                className="space-y-5"
              >
                <div className="group relative">
                  <User className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                  <input
                    name="name"
                    required
                    placeholder={t.namePlaceholder}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="group relative">
                  <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="group relative">
                  <Hash className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                  <input
                    name="pinfl"
                    required
                    placeholder={t.pinflPlaceholder}
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

        </div>
      </motion.div>
    </div>
  );
}
