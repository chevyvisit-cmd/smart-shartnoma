"use client";

import { useEffect, useRef, useState } from "react";

export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Desktop only — load and play the video
    if (window.innerWidth >= 768) {
      video.preload = "auto";
      video.load();
      video.play().catch(() => setVideoFailed(true));
    }
  }, []);

  return (
    <div className="absolute inset-0">

      {/* ── 1. POSTER / DARK FALLBACK (always present) ── */}
      <div
        className="absolute inset-0 bg-[#0A1410] bg-cover bg-center"
        style={{ backgroundImage: "url('/videos/hero-bg-poster.jpg')" }}
      />

      {/* ── 2. VIDEO (desktop only, hidden on mobile) ── */}
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
          className="hero-video absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* ── 3. DARK GRADIENT OVERLAY ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,20,16,0.55) 0%, rgba(10,20,16,0.85) 100%)",
        }}
      />

      {/* ── 4. MOVING GRID (z-1) ── */}
      <div className="hero-grid absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />

      {/* ── 5. DIAGONAL LIGHT SWEEP (z-1) ── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <div className="hero-sweep-beam" />
      </div>

      {/* ── 6. TOP SLIDING GRADIENT LINE (z-2) ── */}
      <div
        className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none"
        style={{ height: 2, zIndex: 2 }}
      >
        <div className="hero-top-line-beam absolute inset-y-0" />
      </div>

    </div>
  );
}
