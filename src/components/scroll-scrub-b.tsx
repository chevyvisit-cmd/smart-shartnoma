"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Language } from "@/lib/translations";

const VIDEO_SRC  = "/videos/jarayon-3d.mp4";
const STEP_COUNT = 6;
const EASE = [0.21, 0.45, 0.15, 1.0] as const;

export function ScrollScrubB({ lang }: { lang: Language }) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);
  const [activeStep,  setActiveStep]  = useState(0);
  const [scrollingUp, setScrollingUp] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(STEP_COUNT - 1, Math.floor(p * STEP_COUNT));
    if (prevStepRef.current !== next) {
      setScrollingUp(next < prevStepRef.current);
      setActiveStep(next);
      prevStepRef.current = next;
    }
  });

  const uz = lang === "uz";

  const steps = uz ? [
    { title: "Ro'yxatdan\no'tish",          desc: "Faqat JShShIR va telefon raqami kifoya" },
    { title: "Shablon\ntanlash",             desc: "Tayyor shablon yoki o'zingiznikini yozish" },
    { title: "Ikkinchi tomonga\nyuborish",   desc: "Telefon raqami yoki ID orqali" },
    { title: "SMS-OTP\ntasdiqlash",          desc: "Ikki tomon ham bir vaqtda tasdiqlaydi" },
    { title: "Elektron\nimzo",               desc: "Qonuniy kuchga ega bo'ladi" },
    { title: "Tarix va\nnazorat",            desc: "Istalgan vaqt ko'rish, yuklab olish" },
  ] : [
    { title: "Регистра-\nция",               desc: "Только ИНН и номер телефона" },
    { title: "Выбор\nшаблона",               desc: "Готовый шаблон или свой вариант" },
    { title: "Отправка\nстороне",            desc: "По номеру телефона или ID" },
    { title: "Подтверж-\nдение OTP",         desc: "Обе стороны подтверждают" },
    { title: "Электронная\nподпись",         desc: "Получает юридическую силу" },
    { title: "История и\nконтроль",          desc: "Просмотр и загрузка в любое время" },
  ];

  const numStr   = String(activeStep + 1).padStart(2, "0");
  const totalStr = String(STEP_COUNT).padStart(2, "0");

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: "360vh" }} data-scroll-cursor>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#080f0c]">

        {/* Ambient video */}
        <video
          autoPlay muted loop playsInline preload="none"
          className="absolute inset-0 h-full w-full object-cover opacity-20 pointer-events-none select-none"
          aria-hidden
        >
          <source src="/videos/ambient-rain-bg.mp4" type="video/mp4" />
        </video>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#2d6a4f 1px, transparent 1px), linear-gradient(90deg, #2d6a4f 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Top fade */}
        <div
          className="absolute top-0 left-0 right-0 h-36 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #080f0c 0%, transparent 100%)" }}
        />

        {/* ── MAIN LAYOUT ── */}
        <div className="relative z-10 flex h-full flex-col md:flex-row items-stretch">

          {/* ── LEFT ── */}
          <div className="relative flex w-full flex-col justify-center overflow-hidden px-8 pb-8 pt-28 sm:px-12 md:w-[52%] md:py-0 lg:px-16 xl:px-20">

            {/* Huge ghost number */}
            <AnimatePresence mode="sync">
              <motion.div
                key={`ghost-${activeStep}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE } }}
                exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.3, ease: EASE } }}
                className="pointer-events-none absolute select-none font-black text-white/3"
                style={{
                  fontSize: "clamp(18rem, 38vw, 38rem)",
                  lineHeight: 1,
                  right: "-0.12em",
                  bottom: "-0.18em",
                  letterSpacing: "-0.06em",
                }}
              >
                {numStr}
              </motion.div>
            </AnimatePresence>

            {/* Eyebrow row */}
            <div className="mb-10 flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.36em] text-primary uppercase">
                  {uz ? "Jarayon" : "Процесс"}
                </span>
              </div>
              <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent max-w-20" />
              <span className="font-mono text-[11px] font-black tracking-[0.2em] text-white/20">
                {numStr} <span className="text-white/10">/ {totalStr}</span>
              </span>
            </div>

            {/* Animated step */}
            <div className="relative" style={{ minHeight: "clamp(180px, 32vh, 340px)" }}>
              <AnimatePresence mode="sync">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: scrollingUp ? -48 : 48, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.42, ease: EASE } }}
                  exit={{ opacity: 0, y: scrollingUp ? 48 : -48, filter: "blur(10px)", transition: { duration: 0.28, ease: EASE } }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  {/* Title */}
                  <h2
                    className="font-black tracking-tighter text-white"
                    style={{
                      fontSize: "clamp(2.8rem, 5.5vw, 6rem)",
                      lineHeight: 0.92,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {steps[activeStep].title}
                  </h2>

                  {/* Accent line + description */}
                  <div className="mt-7 flex items-start gap-4">
                    <div className="mt-1.5 h-8 w-px shrink-0 bg-primary/50" />
                    <motion.p
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                      className="leading-relaxed text-white/45"
                      style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
                    >
                      {steps[activeStep].desc}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress — numbered steps */}
            <div className="mt-10 flex items-center gap-3">
              {steps.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Step ${i + 1}`}
                  className="group relative flex items-center"
                >
                  <motion.div
                    animate={{
                      width:           i === activeStep ? 36 : 8,
                      opacity:         i < activeStep ? 0.35 : i === activeStep ? 1 : 0.14,
                      backgroundColor: i <= activeStep ? "#2D6A4F" : "rgba(255,255,255,0.15)",
                    }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="h-0.75 rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Video ── */}
          <div className="flex w-full shrink-0 items-center justify-center p-6 md:w-[48%] md:p-8 lg:p-10">
            <div className="relative w-full max-w-130">

              {/* Glow behind video */}
              <div
                className="absolute -inset-8 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(45,106,79,0.18) 0%, transparent 70%)",
                  filter: "blur(24px)",
                }}
              />

              {/* Video container */}
              <div
                className="relative overflow-hidden"
                style={{
                  aspectRatio: "4 / 5",
                  clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(45,106,79,0.15)",
                }}
              >
                <video
                  autoPlay muted loop playsInline preload="auto"
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  <source src={VIDEO_SRC} type="video/mp4" />
                </video>

                {/* Vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 45%, rgba(8,15,12,0.55) 100%)",
                  }}
                />

                {/* Top-left cut accent line */}
                <div
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: 40, height: 40,
                    background: "linear-gradient(135deg, rgba(45,106,79,0.6) 0%, transparent 55%)",
                  }}
                />

                {/* Badge */}
                <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 backdrop-blur-md">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="font-mono text-[11px] font-black tracking-[0.18em] text-white/60">
                    {numStr} / {totalStr}
                  </span>
                </div>
              </div>

              {/* Corner accent — bottom right */}
              <div className="absolute bottom-0 right-0 pointer-events-none" style={{ zIndex: -1 }}>
                <div className="h-12 w-px bg-linear-to-b from-primary/40 to-transparent" />
                <div className="h-px w-12 bg-linear-to-r from-primary/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-20"
          style={{ background: "linear-gradient(to bottom, transparent, #080f0c)" }}
        />
      </div>
    </div>
  );
}
