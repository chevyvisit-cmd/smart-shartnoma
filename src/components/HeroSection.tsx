"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  isAuthenticated?: boolean;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function phase(p: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (p - start) / (end - start)));
}

export default function HeroSection({ isAuthenticated }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onScroll = () => {
      const { top, height } = el.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      const p = scrollable > 0 ? Math.max(0, Math.min(1, -top / scrollable)) : 0;
      setProg(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Derived animation values ───────────────────────────────── */

  // Phase 0→0.18: background fades from bright to dim
  const bgOpacity   = lerp(0.55, 0.18, phase(prog, 0, 0.25));

  // Phase 0.15→0.42: big title slides up + fades in
  const titleP      = phase(prog, 0.15, 0.42);
  const titleOp     = titleP;
  const titleY      = lerp(72, 0, titleP);

  // Phase 0.42→0.62: subtitle fades in
  const subP        = phase(prog, 0.42, 0.62);
  const subOp       = subP;
  const subY        = lerp(32, 0, subP);

  // Phase 0.58→0.74: buttons fade in
  const btnOp       = phase(prog, 0.58, 0.74);

  // Phase 0.82→1: bottom fade-out (transition to next section)
  const fadeOut     = phase(prog, 0.82, 1);

  const t = "transition: opacity 80ms linear, transform 80ms linear";

  return (
    <div ref={wrapperRef} className="relative" style={{ minHeight: "280vh" }}>
      {/* ── Sticky viewport ────────────────────────────────────── */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0d1a14]">

        {/* Background video */}
        <video
          autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
          style={{ opacity: bgOpacity, transition: "opacity 80ms linear" }}
          aria-hidden
        >
          <source src="/videos/shartnoma-3-hero-scrub.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(13,26,20,${lerp(0.35, 0.75, prog)}) 0%, rgba(13,26,20,${lerp(0.5, 0.9, prog)}) 100%)`,
            transition: "background 80ms linear",
          }}
        />

        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#2d6a4f 1px, transparent 1px), linear-gradient(90deg, #2d6a4f 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* ── Foreground content ───────────────────────────────── */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">

          {/* Badge */}
          <div
            className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-[#2d6a4f]/30 bg-[#2d6a4f]/10 px-5 py-2 text-[11px] font-black tracking-[0.2em] text-[#2d6a4f] uppercase backdrop-blur-sm"
            style={{ opacity: titleOp, transform: `translateY(${titleY * 0.5}px)`, transition: t }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2d6a4f]" />
            SMART-SHARTNOMA V2.0
          </div>

          {/* Title */}
          <h1
            className="font-black uppercase leading-[0.88] tracking-tighter"
            style={{
              fontSize: "clamp(3rem, 11vw, 9.5rem)",
              opacity: titleOp,
              transform: `translateY(${titleY}px)`,
              transition: t,
            }}
          >
            <span className="text-white">Raqamli</span>
            <br />
            <span style={{ color: "#2d6a4f" }}>Shartnoma</span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mt-8 max-w-lg text-sm leading-relaxed sm:text-base"
            style={{
              color: "rgba(255,255,255,0.55)",
              opacity: subOp,
              transform: `translateY(${subY}px)`,
              transition: t,
            }}
          >
            JShShIR va telefon raqami orqali qonuniy shartnomalar tuzing.
            Frilanserlar va mijozlar uchun eng sodda va xavfsiz platforma.
          </p>

          {/* Buttons */}
          <div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            style={{ opacity: btnOp, transition: "opacity 80ms linear" }}
          >
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-9 py-4 text-base font-black text-white shadow-lg"
              style={{ background: "#2d6a4f", boxShadow: "0 8px 32px rgba(45,106,79,0.35)" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isAuthenticated ? "Dashboardga o'tish" : "Boshlash"}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>

            <Link
              href="/about"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-9 py-4 text-base font-black text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/15"
            >
              Qanday ishlaydi?
            </Link>
          </div>
        </div>

        {/* Bottom fade → next section */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 140,
            background: "linear-gradient(to bottom, transparent, #0d1a14)",
            opacity: fadeOut,
            transition: "opacity 80ms linear",
          }}
        />

        {/* Scroll hint */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25"
          style={{ opacity: Math.max(0, 1 - prog * 8), transition: "opacity 80ms linear" }}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.35em]">scroll</span>
          <div className="h-4 w-px bg-white/20" />
        </div>
      </div>
    </div>
  );
}
