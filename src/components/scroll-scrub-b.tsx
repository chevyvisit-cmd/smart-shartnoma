"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Language } from "@/lib/translations";

const VIDEO_SRC  = "/videos/jarayon-3d.mp4";
const STEP_COUNT = 6;
const TWEEN_MS   = 550;
const EASE = [0.21, 0.45, 0.15, 1.0] as const;

/* RAF-based smooth tween of video.currentTime */
function tweenVideoTo(
  v: HTMLVideoElement,
  targetTime: number,
  rafHandle: { current: number | null },
) {
  if (rafHandle.current !== null) {
    cancelAnimationFrame(rafHandle.current);
    rafHandle.current = null;
  }
  const startTime = v.currentTime;
  const diff      = targetTime - startTime;
  const startTS   = performance.now();

  const tick = (now: number) => {
    const t      = Math.min((now - startTS) / TWEEN_MS, 1);
    const eased  = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    v.currentTime = startTime + diff * eased;
    if (t < 1) {
      rafHandle.current = requestAnimationFrame(tick);
    } else {
      rafHandle.current = null;
    }
  };
  rafHandle.current = requestAnimationFrame(tick);
}

export function ScrollScrubB({ lang }: { lang: Language }) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const readyRef    = useRef(false);
  const prevStepRef = useRef(0);
  const rafHandle   = useRef<number | null>(null);

  const [activeStep,  setActiveStep]  = useState(0);
  const [scrollingUp, setScrollingUp] = useState(false);

  useEffect(() => () => {
    if (rafHandle.current !== null) cancelAnimationFrame(rafHandle.current);
  }, []);

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

      const v = videoRef.current;
      if (readyRef.current && v?.duration) {
        tweenVideoTo(v, (next / STEP_COUNT) * v.duration, rafHandle);
      }
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
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0a1410]">

        {/* Top fade — blends with ScrollScrubA above */}
        <div
          className="absolute top-0 left-0 right-0 h-40 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #0a1410 0%, transparent 100%)" }}
        />

        {/* ── SPLIT PANEL ── */}
        <div className="relative z-10 flex h-full flex-col md:flex-row">

          {/* ── LEFT: Text block ── */}
          <div className="flex w-full flex-col justify-center px-8 pb-4 pt-24 sm:px-12 md:w-1/2 md:py-0 lg:px-16 xl:px-24">

            {/* Eyebrow */}
            <div className="mb-8 flex items-center gap-3">
              <span className="text-[10px] font-black tracking-[0.32em] text-primary uppercase">
                {uz ? "Jarayon" : "Процесс"}
              </span>
              <div className="h-px w-12 bg-primary/40" />
            </div>

            {/* Animated step content */}
            <div className="relative" style={{ minHeight: "clamp(160px, 28vh, 340px)" }}>
              <AnimatePresence mode="sync">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: scrollingUp ? -56 : 56, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.38, ease: EASE } }}
                  exit={{ opacity: 0, y: scrollingUp ? 56 : -56, filter: "blur(8px)", transition: { duration: 0.26, ease: EASE } }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  {/* Step counter */}
                  <div className="mb-5 flex items-baseline gap-2.5">
                    <span className="font-mono text-sm font-black tracking-[0.22em] text-primary">{numStr}</span>
                    <span className="font-mono text-sm tracking-[0.22em] text-white/25">
                      / {String(STEP_COUNT).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Big title */}
                  <h2
                    className="font-black tracking-tighter text-white"
                    style={{
                      fontSize: "clamp(2.2rem, 5vw, 5rem)",
                      lineHeight: 0.94,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {steps[activeStep].title}
                  </h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.42, ease: "easeOut" }}
                    className="mt-6 max-w-xs leading-relaxed text-white/45"
                    style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.15rem)" }}
                  >
                    {steps[activeStep].desc}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="mt-10 flex items-center gap-2.5">
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

          {/* ── RIGHT: Video panel ── */}
          <div className="flex w-full shrink-0 items-center justify-center p-5 md:w-1/2 md:p-10 lg:p-14">
            <div
              className="relative w-[90%] overflow-hidden shadow-2xl"
              style={{
                aspectRatio: "4 / 3",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(45,106,79,0.07)",
              }}
            >
              {/* Desktop: scrub-controlled */}
              <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  readyRef.current = true;
                  const v = videoRef.current;
                  if (v) v.currentTime = 0;
                  v?.pause();
                }}
                className="absolute inset-0 hidden h-full w-full object-cover md:block"
              >
                <source src={VIDEO_SRC} type="video/mp4" />
              </video>

              {/* Mobile: autoplay loop */}
              <video
                autoPlay muted loop playsInline preload="none"
                className="absolute inset-0 h-full w-full object-cover md:hidden"
              >
                <source src={VIDEO_SRC} type="video/mp4" />
              </video>

              {/* Subtle inner vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 55%, rgba(10,20,16,0.45) 100%)",
                }}
              />

              {/* Step badge overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="font-mono text-[11px] font-black tracking-widest text-white/70">
                  {numStr} / 06
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade → next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
          style={{ background: "linear-gradient(to bottom, transparent, #0a1410)" }}
        />
      </div>
    </div>
  );
}
