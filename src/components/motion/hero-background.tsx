"use client";

import { useEffect, useRef, useState } from "react";

export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.innerWidth >= 768) {
      video.preload = "auto";
      video.load();
      video.play().catch(() => setVideoFailed(true));
    }
  }, []);

  return (
    <div className="absolute inset-0">

      {/* ── 1. LIGHT MODE: clean solid bg (no video) ── */}
      <div className="absolute inset-0 block dark:hidden bg-[#F0F7F3]" />

      {/* ── 2. DARK MODE: poster + video ── */}
      <div
        className="absolute inset-0 hidden dark:block bg-cover bg-center bg-[#0A1410]"
        style={{ backgroundImage: "url('/videos/hero-bg-poster.jpg')" }}
      />
      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/hero-bg-poster.jpg"
          preload="none"
          onError={() => setVideoFailed(true)}
          className="hero-video hidden dark:block absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* ── 3. OVERLAY ── */}
      {/* Dark mode: deep dark gradient */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ background: "linear-gradient(180deg, rgba(10,20,16,0.55) 0%, rgba(10,20,16,0.85) 100%)" }}
      />
      {/* Light mode: soft radial glow at center */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,106,79,0.08) 0%, transparent 70%)" }}
      />

      {/* ── 4. MOVING GRID ── */}
      <div className="hero-grid absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />

      {/* ── 5. LIGHT SWEEP ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div className="hero-sweep-beam" />
      </div>

      {/* ── 6. TOP LINE ── */}
      <div
        className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none"
        style={{ height: 2, zIndex: 2 }}
      >
        <div className="hero-top-line-beam absolute inset-y-0" />
      </div>

    </div>
  );
}
