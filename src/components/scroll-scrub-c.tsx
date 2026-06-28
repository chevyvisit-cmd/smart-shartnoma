"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Language } from "@/lib/translations";

const VIDEO_SRC = "/videos/shartnoma-3-scrub.mp4";

/* Each phrase: appears when scrollYProgress >= threshold */
const PHRASES = {
  uz: [
    {
      threshold: 0.04,
      words: ["Shartnoma", "tuzish"],
      big: true,
      accent: -1,
    },
    {
      threshold: 0.16,
      words: ["endi", "oson."],
      big: true,
      accent: 1,
    },
    {
      threshold: 0.30,
      words: ["100%", "xavfsiz"],
      big: false,
      accent: 0,
    },
    {
      threshold: 0.40,
      words: ["va", "qonuniy."],
      big: false,
      accent: 1,
    },
    {
      threshold: 0.54,
      words: ["Frilanserlar", "uchun"],
      big: false,
      accent: -1,
    },
    {
      threshold: 0.66,
      words: ["eng", "yaxshi", "platforma."],
      big: false,
      accent: 2,
    },
  ],
  ru: [
    {
      threshold: 0.04,
      words: ["Договор", "создать"],
      big: true,
      accent: -1,
    },
    {
      threshold: 0.16,
      words: ["теперь", "просто."],
      big: true,
      accent: 1,
    },
    {
      threshold: 0.30,
      words: ["100%", "безопасно"],
      big: false,
      accent: 0,
    },
    {
      threshold: 0.40,
      words: ["и", "законно."],
      big: false,
      accent: 1,
    },
    {
      threshold: 0.54,
      words: ["Для", "фрилансеров"],
      big: false,
      accent: -1,
    },
    {
      threshold: 0.66,
      words: ["лучшая", "платформа."],
      big: false,
      accent: 1,
    },
  ],
};

export function ScrollScrubC({ lang }: { lang: Language }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [ready, setReady]           = useState(false);
  const [isDesktop, setIsDesktop]   = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress]     = useState(0);

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
    setProgress(p);
    if (isDesktop && ready) {
      const v = videoRef.current;
      if (v?.duration) v.currentTime = p * v.duration;
    }
  });

  const phrases = PHRASES[lang];

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: "320vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#060e0a]">

        {/* ── Desktop: scrubbed video ── */}
        {!videoError && (
          <video
            ref={videoRef}
            muted playsInline preload="auto"
            onLoadedMetadata={() => { setReady(true); videoRef.current?.pause(); }}
            onError={() => setVideoError(true)}
            className="hidden md:block absolute inset-0 h-full w-full object-cover"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        )}

        {/* ── Mobile: autoplay loop ── */}
        {!videoError && (
          <video autoPlay muted loop playsInline preload="none"
            onError={() => setVideoError(true)}
            className="md:hidden absolute inset-0 h-full w-full object-cover"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        )}

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(6,14,10,0.82) 0%, rgba(6,14,10,0.65) 100%)" }}
        />

        {/* ── Phrase reveal ── */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="w-full max-w-5xl space-y-5">
            {phrases.map((phrase, pi) => {
              const visible = progress >= phrase.threshold;
              return (
                <div
                  key={pi}
                  className="flex flex-wrap justify-center gap-x-4 gap-y-1"
                >
                  {phrase.words.map((word, wi) => {
                    const isAccent = phrase.accent === wi;
                    return (
                      <motion.span
                        key={wi}
                        animate={{
                          opacity: visible ? 1 : 0,
                          y:       visible ? 0 : 36,
                          filter:  visible ? "blur(0px)" : "blur(10px)",
                        }}
                        transition={{
                          duration: 0.55,
                          delay:    visible ? wi * 0.09 : 0,
                          ease:     [0.21, 0.45, 0.15, 1.0],
                        }}
                        className={[
                          "font-black tracking-tighter leading-[0.92] select-none",
                          phrase.big
                            ? "text-[clamp(3rem,9vw,7.5rem)]"
                            : "text-[clamp(1.8rem,5vw,4.2rem)]",
                          isAccent ? "text-primary" : "text-white",
                        ].join(" ")}
                      >
                        {word}
                      </motion.span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Progress dots ── */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {phrases.map((phrase, i) => (
            <motion.div
              key={i}
              animate={{
                width:           progress >= phrase.threshold ? 22 : 6,
                opacity:         progress >= phrase.threshold ? 1 : 0.25,
                backgroundColor: progress >= phrase.threshold ? "#2D6A4F" : "#ffffff",
              }}
              transition={{ duration: 0.28 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        {/* Fade into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #060e0a)" }}
        />
      </div>
    </div>
  );
}
