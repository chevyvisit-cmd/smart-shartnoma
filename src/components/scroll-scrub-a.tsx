"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Language } from "@/lib/translations";

const VIDEO_SRC = "/videos/shartnoma-1-scrub.mp4";

export function ScrollScrubA({ lang }: { lang: Language }) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const mobileRef   = useRef<HTMLVideoElement>(null);
  const [ready, setReady]           = useState(false);
  const [isDesktop, setIsDesktop]   = useState(false);
  const [videoError, setVideoError] = useState(false);

  /* Responsive check */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Never autoplay the scrub video */
  useEffect(() => {
    videoRef.current?.pause();
  }, []);

  /* Scroll → currentTime */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!isDesktop || !ready) return;
    const v = videoRef.current;
    if (v?.duration) v.currentTime = p * v.duration;
  });

  const uz = lang === "uz";

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: "250vh" }} data-scroll-cursor>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0a1410]">

        {/* ── MOBILE: autoplay loop ── */}
        <div className="md:hidden relative h-full w-full">
          {!videoError && (
            <video
              ref={mobileRef}
              autoPlay muted loop playsInline
              preload="none"
              onError={() => setVideoError(true)}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0" style={{ background: "rgba(10,20,16,0.75)" }} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center text-white">
            <div className="mb-4 text-[10px] font-black tracking-[0.3em] text-primary uppercase">
              Smart-Shartnoma
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              {uz ? <>Har bir shartnoma —<br /><span className="text-primary">ishonchga asoslangan</span><br />kelishuv</> : <>Каждый договор —<br /><span className="text-primary">в основе доверие</span></>}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 max-w-xs">
              {uz ? "Yozma kelishuv qonuniy bog'liqlik yaratadi va nizoli vaziyatlarda huquqingizni himoya qiladi." : "Письменное соглашение создаёт правовую связь и защищает ваши права в спорах."}
            </p>
          </div>
        </div>

        {/* ── DESKTOP: split layout with scrubbed video ── */}
        <div className="hidden md:flex h-full">

          {/* Left — text */}
          <div className="flex w-1/2 flex-col justify-center px-12 xl:px-20">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 text-[10px] font-black tracking-[0.3em] text-primary uppercase">
                Smart-Shartnoma
              </div>
              <h2 className="text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
                {uz ? (
                  <>Har bir shartnoma —<br /><span className="text-primary">ishonchga</span><br />asoslangan kelishuv</>
                ) : (
                  <>Каждый договор —<br /><span className="text-primary">в основе</span><br />доверие</>
                )}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                {uz
                  ? "Yozma kelishuv ikki tomon o'rtasida qonuniy bog'liqlik yaratadi va nizoli vaziyatlarda huquqingizni himoya qiladi."
                  : "Письменное соглашение создаёт правовую связь между сторонами и защищает ваши права в спорных ситуациях."}
              </p>
              <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground/50">
                <motion.div
                  animate={{ x: [0, 7, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-px w-10 bg-primary/60"
                />
                {uz ? "Scroll qiling" : "Прокрутите вниз"}
              </div>
            </motion.div>
          </div>

          {/* Right — scrubbed video */}
          <div className="relative w-1/2 overflow-hidden">
            {/* Fallback gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-[#0a1410] to-[#0a1410]" />

            {!videoError && (
              <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  setReady(true);
                  videoRef.current?.pause();
                }}
                onError={() => setVideoError(true)}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={VIDEO_SRC} type="video/mp4" />
              </video>
            )}

            {/* Left-edge fade so video blends into text column */}
            <div
              className="absolute inset-y-0 left-0 w-24 pointer-events-none"
              style={{ background: "linear-gradient(to right, #0a1410, transparent)" }}
            />
          </div>
        </div>
      </div>

      {/* Fade into Section B */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #0a1410)" }}
      />
    </div>
  );
}
