"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Language } from "@/lib/translations";

const VIDEO_SRC  = "/videos/shartnoma-2-scrub.mp4";
const STEP_COUNT = 6;
const EASE = [0.21, 0.45, 0.15, 1.0] as const;

export function ScrollScrubB({ lang }: { lang: Language }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);

  const [ready, setReady]           = useState(false);
  const [isDesktop, setIsDesktop]   = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollingUp, setScrollingUp] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => { videoRef.current?.pause(); }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(STEP_COUNT - 1, Math.floor(p * STEP_COUNT));
    setActiveStep(prev => {
      if (prev !== next) setScrollingUp(next < prev);
      return next;
    });
    if (isDesktop && ready) {
      const v = videoRef.current;
      if (v?.duration) v.currentTime = p * v.duration;
    }
  });

  const uz = lang === "uz";

  const steps = uz ? [
    { title: "Ro'yxatdan\no'tish",          desc: "Faqat JShShIR va telefon raqami kifoya" },
    { title: "Shartnoma\nmatnini tanlash",   desc: "Tayyor shablon yoki o'zingiznikini yozish" },
    { title: "Ikkinchi tomonga\nyuborish",   desc: "Telefon raqami yoki ID orqali" },
    { title: "SMS-OTP\ntasdiqlash",          desc: "Ikki tomon ham tasdiqlaydi" },
    { title: "Elektron\nimzo",               desc: "Qonuniy kuchga ega bo'ladi" },
    { title: "Tarix va\nnazorat",            desc: "Istalgan vaqt ko'rish, yuklab olish" },
  ] : [
    { title: "Регистрация",                  desc: "Только ИНН и номер телефона" },
    { title: "Выбор текста\nдоговора",       desc: "Готовый шаблон или свой вариант" },
    { title: "Отправка\nвторой стороне",     desc: "По номеру телефона или ID" },
    { title: "Подтверждение\nSMS-OTP",       desc: "Обе стороны подтверждают" },
    { title: "Электронная\nподпись",         desc: "Получает юридическую силу" },
    { title: "История и\nконтроль",          desc: "Просмотр и загрузка в любое время" },
  ];

  const numStr = String(activeStep + 1).padStart(2, "0");

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: "360vh" }} data-scroll-cursor>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#060e0a]">

        {/* ── Top fade: blends with ScrollScrubA above ── */}
        <div
          className="absolute top-0 left-0 right-0 h-40 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #0a1410 0%, transparent 100%)" }}
        />

        {/* ── VIDEO BACKGROUND ── */}
        {!videoError && (
          <>
            {/* Mobile: autoplay loop */}
            <video autoPlay muted loop playsInline preload="none"
              onError={() => setVideoError(true)}
              className="md:hidden absolute inset-0 h-full w-full object-cover"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
            {/* Desktop: scroll-scrubbed */}
            <video ref={videoRef} muted playsInline preload="auto"
              onLoadedMetadata={() => { setReady(true); videoRef.current?.pause(); }}
              onError={() => setVideoError(true)}
              className="hidden md:block absolute inset-0 h-full w-full object-cover"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
          </>
        )}
        {videoError && <div className="absolute inset-0 bg-[#060e0a]" />}

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(6,14,10,0.80)" }}
        />

        {/* ── MAIN CONTENT ── */}
        <div className="relative z-10 flex h-full flex-col justify-center px-8 sm:px-14 lg:px-20 xl:px-28">

          {/* Label */}
          <div className="mb-10 flex items-center gap-3">
            <span className="text-[10px] font-black tracking-[0.32em] text-primary uppercase">
              {uz ? "Jarayon" : "Процесс"}
            </span>
            <div className="h-px w-12 bg-primary/40" />
          </div>

          {/* ── Step display — large typography with directional AnimatePresence ── */}
          <div className="relative" style={{ minHeight: "clamp(240px,38vh,460px)" }}>
            <AnimatePresence mode="sync">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: scrollingUp ? -80 : 80, filter: "blur(10px)", scale: 0.97 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1, transition: { duration: 0.55, ease: EASE } }}
                exit={{ opacity: 0, y: scrollingUp ? 80 : -80, filter: "blur(10px)", scale: 0.97, transition: { duration: 0.38, ease: EASE } }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                {/* Ghost number — decorative large background numeral */}
                <div
                  aria-hidden
                  className="pointer-events-none select-none absolute -right-2 top-1/2 -translate-y-1/2 font-black leading-none text-white"
                  style={{ fontSize: "clamp(10rem, 26vw, 24rem)", opacity: 0.035 }}
                >
                  {numStr}
                </div>

                {/* Step counter */}
                <div className="mb-5 flex items-baseline gap-2.5">
                  <span className="font-mono text-sm font-black tracking-[0.22em] text-primary">
                    {numStr}
                  </span>
                  <span className="font-mono text-sm text-white/22 tracking-[0.22em]">
                    / {String(STEP_COUNT).padStart(2, "0")}
                  </span>
                </div>

                {/* Big title */}
                <h2
                  className="font-black tracking-tighter text-white"
                  style={{
                    fontSize: "clamp(2.8rem, 8vw, 8.5rem)",
                    lineHeight: 0.92,
                    whiteSpace: "pre-line",
                  }}
                >
                  {steps[activeStep].title}
                </h2>

                {/* Description — staggered in after title */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.30, duration: 0.55, ease: "easeOut" }}
                  className="mt-7 max-w-sm text-white/45 leading-relaxed"
                  style={{ fontSize: "clamp(1rem, 2.2vw, 1.4rem)" }}
                >
                  {steps[activeStep].desc}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Progress dots ── */}
          <div className="mt-14 flex items-center gap-2.5">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width:           i === activeStep ? 32 : 7,
                  opacity:         i < activeStep ? 0.40 : i === activeStep ? 1 : 0.16,
                  backgroundColor: i <= activeStep ? "#2D6A4F" : "rgba(255,255,255,0.18)",
                }}
                transition={{ duration: 0.38, ease: "easeInOut" }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Bottom fade → next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
          style={{ background: "linear-gradient(to bottom, transparent, #060e0a)" }}
        />
      </div>
    </div>
  );
}
