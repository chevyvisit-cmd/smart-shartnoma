"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Language } from "@/lib/translations";

const VIDEO_SRC  = "/videos/shartnoma-2-scrub.mp4";
const STEP_COUNT = 6;

export function ScrollScrubB({ lang }: { lang: Language }) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const [ready, setReady]           = useState(false);
  const [isDesktop, setIsDesktop]   = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  /* Responsive */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Never autoplay scrub video */
  useEffect(() => {
    videoRef.current?.pause();
  }, []);

  /* Scroll → currentTime + activeStep */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActiveStep(Math.min(STEP_COUNT - 1, Math.floor(p * STEP_COUNT)));
    if (isDesktop && ready) {
      const v = videoRef.current;
      if (v?.duration) v.currentTime = p * v.duration;
    }
  });

  const uz = lang === "uz";

  const steps = uz ? [
    { num: "01", title: "Ro'yxatdan o'tish",        desc: "Faqat JShShIR va telefon raqami kifoya" },
    { num: "02", title: "Shartnoma matnini tanlash", desc: "Tayyor shablon yoki o'zingiznikini yozish" },
    { num: "03", title: "Ikkinchi tomonga yuborish", desc: "Telefon raqami yoki ID orqali" },
    { num: "04", title: "SMS-OTP tasdiqlash",        desc: "Ikki tomon ham tasdiqlaydi" },
    { num: "05", title: "Elektron imzo",             desc: "Qonuniy kuchga ega bo'ladi" },
    { num: "06", title: "Tarix va nazorat",          desc: "Istalgan vaqt ko'rish, yuklab olish" },
  ] : [
    { num: "01", title: "Регистрация",              desc: "Только ИНН и номер телефона" },
    { num: "02", title: "Выбор текста договора",    desc: "Готовый шаблон или свой вариант" },
    { num: "03", title: "Отправка второй стороне",  desc: "По номеру телефона или ID" },
    { num: "04", title: "Подтверждение SMS-OTP",    desc: "Обе стороны подтверждают" },
    { num: "05", title: "Электронная подпись",      desc: "Получает юридическую силу" },
    { num: "06", title: "История и контроль",       desc: "Просмотр и загрузка в любое время" },
  ];

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: "300vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0a1410]">

        {/* ── VIDEO BACKGROUND ── */}
        {!videoError && (
          <>
            {/* Mobile: autoplay loop */}
            <video
              autoPlay muted loop playsInline
              preload="none"
              onError={() => setVideoError(true)}
              className="md:hidden absolute inset-0 h-full w-full object-cover"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>

            {/* Desktop: scrubbed */}
            <video
              ref={videoRef}
              muted playsInline
              preload="auto"
              onLoadedMetadata={() => {
                setReady(true);
                videoRef.current?.pause();
              }}
              onError={() => setVideoError(true)}
              className="hidden md:block absolute inset-0 h-full w-full object-cover"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
          </>
        )}

        {/* Fallback gradient */}
        {videoError && (
          <div className="absolute inset-0 bg-linear-to-br from-[#0a1410] via-primary/8 to-[#0a1410]" />
        )}

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,20,16,0.70)" }}
        />

        {/* ── CONTENT ── */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-20 xl:px-28">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 lg:mb-12"
          >
            <div className="mb-2 text-[10px] font-black tracking-[0.3em] text-primary uppercase">
              {uz ? "Jarayon" : "Процесс"}
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {uz ? "Shartnoma tuzish qulayliklari" : "Удобство оформления договора"}
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="max-w-lg lg:max-w-xl xl:max-w-2xl">
            {steps.map((step, i) => {
              const active = i === activeStep;
              return (
                <div
                  key={step.num}
                  className="relative flex items-start gap-5 border-b border-white/10 last:border-0"
                  style={{ paddingTop: 14, paddingBottom: 14 }}
                >
                  {/* Active left bar */}
                  <motion.div
                    animate={{ scaleY: active ? 1 : 0, opacity: active ? 1 : 0 }}
                    transition={{ duration: 0.28 }}
                    className="absolute left-0 top-3 bottom-3 w-0.5 origin-center bg-primary"
                  />

                  {/* Number */}
                  <div className="pl-4 shrink-0 pt-0.5">
                    <motion.span
                      animate={{ color: active ? "#2D6A4F" : "rgba(255,255,255,0.25)" }}
                      transition={{ duration: 0.28 }}
                      className="font-mono text-[11px] font-black tracking-widest"
                    >
                      {step.num}
                    </motion.span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <motion.p
                      animate={{
                        color: active ? "#ffffff" : "rgba(255,255,255,0.38)",
                        fontSize: active ? "1.0625rem" : "0.9375rem",
                      }}
                      transition={{ duration: 0.28 }}
                      className="font-black tracking-tight leading-snug"
                    >
                      {step.title}
                    </motion.p>

                    {/* Desc: only visible when active */}
                    <motion.div
                      animate={{ maxHeight: active ? 40 : 0, opacity: active ? 0.55 : 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-1 text-sm text-white leading-relaxed">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-8 flex items-center gap-3 max-w-lg lg:max-w-xl xl:max-w-2xl">
            <div className="h-px flex-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((activeStep + 1) / STEP_COUNT) * 100}%` }}
                transition={{ duration: 0.35 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <span className="text-[10px] font-black tracking-widest text-white/30 font-mono shrink-0">
              {String(activeStep + 1).padStart(2, "0")} / {String(STEP_COUNT).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
