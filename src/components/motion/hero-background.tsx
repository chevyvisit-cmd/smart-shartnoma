"use client";
import { RefObject } from "react";

interface Props {
  scrubVideoRef: RefObject<HTMLVideoElement | null>;
  onVideoReady: () => void;
  isDesktop: boolean;
}

export function HeroBackground({ scrubVideoRef, onVideoReady, isDesktop }: Props) {
  return (
    <div className="absolute inset-0">

      {/* ── 1. Light mode: solid bg ── */}
      <div className="absolute inset-0 block dark:hidden bg-[#F0F7F3]" />

      {/* ── 2. Dark mode: poster fallback (behind video) ── */}
      <div
        className="absolute inset-0 hidden dark:block bg-[#0A1410] bg-cover bg-center"
        style={{ backgroundImage: "url('/videos/hero-bg-poster.jpg')" }}
      />

      {/* ── 3. Hero video — dark mode only ── */}
      {isDesktop ? (
        /* Desktop: scroll-scrubbed, no autoplay */
        <video
          ref={scrubVideoRef}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={onVideoReady}
          className="hero-video absolute inset-0 h-full w-full object-cover hidden dark:block"
        >
          <source src="/videos/shartnoma-3-hero-scrub.mp4" type="video/mp4" />
        </video>
      ) : (
        /* Mobile: lightweight autoplay loop */
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="hero-video absolute inset-0 h-full w-full object-cover hidden dark:block"
        >
          <source src="/videos/shartnoma-3-hero-scrub.mp4" type="video/mp4" />
        </video>
      )}

      {/* ── 4. Overlays ── */}
      {/* Dark mode: dark gradient so text stays readable over video */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ background: "linear-gradient(180deg, rgba(10,20,16,0.45) 0%, rgba(10,20,16,0.82) 100%)" }}
      />
      {/* Light mode: subtle radial glow */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,106,79,0.08) 0%, transparent 70%)" }}
      />

      {/* ── 5. Moving grid (z:1) ── */}
      <div className="hero-grid absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />

      {/* ── 6. Diagonal light sweep (z:1) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div className="hero-sweep-beam" />
      </div>

      {/* ── 7. Top sliding gradient line (z:2) ── */}
      <div
        className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none"
        style={{ height: 2, zIndex: 2 }}
      >
        <div className="hero-top-line-beam absolute inset-y-0" />
      </div>

    </div>
  );
}
