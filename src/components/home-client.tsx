"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect, RefObject } from "react";
import { ArrowRight, Play, Scale, Banknote, ClipboardList, Handshake } from "lucide-react";
import Link from "next/link";
import { Language, translations } from "@/lib/translations";
import { ScrollScrubA } from "@/components/scroll-scrub-a";
import { ScrollScrubB } from "@/components/scroll-scrub-b";
import { ScrollCursor } from "@/components/motion/scroll-cursor";
import { useAnimatedStrong, useRevealElements } from "@/hooks/use-scroll-animations";
import { useStaggerReveal } from "@/hooks/use-stagger-reveal";
import HeroSection from "@/components/HeroSection";

const VIDEO_IDS = {
  uz: "xXcMtqop4xQ",
  ru: "bCXzUPGEfRg",
};

/* ── WhySection ─────────────────────────────────────────────────────────── */

interface WhySectionProps {
  lang: Language;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  videoLang: "uz" | "ru";
  playing: boolean;
  setVideoLang: (l: "uz" | "ru") => void;
  setPlaying: (p: boolean) => void;
}

function WhySection({ lang, iframeRef, videoLang, playing, setVideoLang, setPlaying }: WhySectionProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const uz = lang === "uz";

  useStaggerReveal(cardsRef, ".stagger-item", { threshold: 0.2, staggerDelay: 150 });

  const points = uz ? [
    { Icon: Scale,        num: "01", title: "Huquqiy himoya",      desc: "Shartnoma qonun kuchiga ega hujjat bo'lib, nizoli vaziyatlarda sudda asosiy dalil sifatida qabul qilinadi." },
    { Icon: Banknote,     num: "02", title: "To'lov kafolati",     desc: "Ish hajmi, narxi va to'lov muddatlari oldindan yozma belgilanadi va huquqingiz himoyalanadi." },
    { Icon: ClipboardList,num: "03", title: "Aniq majburiyatlar",  desc: "Kim, nima, qachon va qancha bajarishi — barchasi hujjatda ko'rsatiladi." },
    { Icon: Handshake,    num: "04", title: "Ishonchli hamkorlik", desc: "Yozma kelishuv professional munosabat o'rnatadi va uzoq muddatli hamkorlik uchun poydevor bo'ladi." },
  ] : [
    { Icon: Scale,        num: "01", title: "Правовая защита",      desc: "Договор имеет юридическую силу и является основным доказательством в суде при спорных ситуациях." },
    { Icon: Banknote,     num: "02", title: "Гарантия оплаты",      desc: "Объём работ, стоимость и сроки оплаты фиксируются заранее в письменной форме." },
    { Icon: ClipboardList,num: "03", title: "Чёткие обязательства", desc: "Кто, что, когда и в каком объёме должен сделать — всё прописывается в документе." },
    { Icon: Handshake,    num: "04", title: "Надёжное партнёрство", desc: "Письменное соглашение устанавливает профессиональные отношения между сторонами." },
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6">
      <div className="mt-28 mb-20">

        {/* Heading */}
        <div className="mb-14 text-left reveal-hidden">
          <h2 className="text-4xl font-black tracking-tight sm:text-6xl animated-strong">
            {uz
              ? <>Nima uchun <strong>shartnoma</strong>?</>
              : <>Зачем нужен <strong>контракт</strong>?</>}
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-medium text-muted-foreground sm:text-2xl">
            {uz
              ? "Qisqa video orqali shartnomaning ahamiyatini bilib oling."
              : "Узнайте о важности контракта с помощью короткого видео."}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-start">

          {/* ── LEFT: Video player — untouched, no motion/scroll logic ── */}
          <div>
            <div className="mb-5 flex gap-3">
              {(["uz", "ru"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setVideoLang(l); setPlaying(false); }}
                  className={`rounded-xl px-6 py-2.5 text-sm font-black uppercase tracking-widest transition-all ${
                    videoLang === l
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {l === "uz" ? "O'zbek" : "Русский"}
                </button>
              ))}
            </div>

            <div
              className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl"
              style={{ aspectRatio: "16/9" }}
            >
              <iframe
                ref={iframeRef}
                src=""
                title={videoLang === "uz" ? "Shartnoma haqida video" : "Видео о контракте"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
                  playing ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
              {!playing && (
                <div className="relative h-full w-full">
                  <img
                    src={`https://img.youtube.com/vi/${VIDEO_IDS[videoLang]}/maxresdefault.jpg`}
                    alt="video thumbnail"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${VIDEO_IDS[videoLang]}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <button
                      onClick={() => {
                        if (iframeRef.current) {
                          iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${VIDEO_IDS[videoLang]}?autoplay=1&rel=0&modestbranding=1`;
                        }
                        setPlaying(true);
                      }}
                      className="group flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm transition-all hover:scale-110 hover:border-primary hover:bg-primary"
                    >
                      <Play size={38} className="ml-1.5 text-white transition-transform group-hover:scale-110" fill="currentColor" />
                    </button>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <span className="rounded-xl bg-black/60 px-4 py-2 text-xs font-black uppercase tracking-widest text-white backdrop-blur-sm">
                      {videoLang === "uz" ? "O'zbek tili" : "Русский язык"}
                    </span>
                    <span className="rounded-xl bg-primary/80 px-4 py-2 text-xs font-black text-white backdrop-blur-sm">
                      ▶ Play
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Key points + ambient video background ── */}
          <div className="relative overflow-hidden rounded-3xl">

            {/* Ambient video — desktop only, very low opacity, autoplay+loop */}
            <video
              autoPlay muted loop playsInline
              className="hidden md:block absolute inset-0 h-full w-full object-cover opacity-[0.18] pointer-events-none select-none"
              aria-hidden
            >
              <source src="/videos/ambient-rain-bg.mp4" type="video/mp4" />
            </video>
            {/* Edge fade so the video blends softly into the background */}
            <div
              className="hidden md:block absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 35%, var(--background) 85%)",
              }}
            />

            {/* Stagger-revealed key points list */}
            <div ref={cardsRef} className="relative z-10">
              {points.map((point, i) => (
                <div
                  key={i}
                  className="stagger-item group relative flex gap-6 border-b border-border/60 py-8 last:border-0 transition-colors hover:border-primary/30"
                >
                  <div className="absolute left-0 top-8 bottom-8 w-px origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100" />

                  <div className="flex shrink-0 flex-col items-center gap-2 pl-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary text-primary/70 transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                      <point.Icon size={22} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-muted-foreground/40 transition-colors group-hover:text-primary/50">{point.num}</span>
                  </div>

                  <div className="pt-1">
                    <p className="mb-2 text-base font-black tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">{point.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Template card constants ─────────────────────────────────────────────── */

const AMBIENT_VIDEO = "/videos/ambient-rain-bg.mp4";

const TEMPLATE_VIDEOS: (string | null)[] = [
  "/videos/templates/design.mp4",
  "/videos/templates/dev.mp4",
  "/videos/templates/marketing.mp4",
  "/videos/templates/consulting.mp4",
  "/videos/templates/photo.mp4",
  "/videos/templates/translation.mp4",
  "/videos/templates/tutoring.mp4",
  "/videos/templates/logistics.mp4",
  "/videos/templates/other.mp4",
];

const TEMPLATE_IMAGES = [
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.45, 0.15, 1.0] as const } },
};

/* ── TemplateCard ─────────────────────────────────────────────────────────── */

function TemplateCard({
  item, index, videoSrc, fallbackSrc, href, label,
}: {
  item: { name: string };
  index: number;
  videoSrc: string | null;
  fallbackSrc: string;
  href: string;
  label: string;
}) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loaded   = useRef(false);

  /* IntersectionObserver — play when card is visible, pause when not */
  useEffect(() => {
    if (!videoSrc) return;
    const video = videoRef.current;
    const card  = cardRef.current;
    if (!video || !card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!loaded.current) {
            loaded.current = true;
            video.src = videoSrc;
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [videoSrc]);

  return (
    <motion.div variants={cardVariants}>
      <div
        ref={cardRef}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-lg hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 sm:rounded-[28px] transition-shadow duration-300"
      >
        {/* Media */}
        <div className="relative h-36 overflow-hidden sm:h-52">

          {/* Static image — always visible, fallback when no video */}
          <img
            src={fallbackSrc}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover grayscale-60 transition-all duration-500 group-hover:scale-[1.06] group-hover:grayscale-0"
          />

          {/* Per-card video (autoPlay via IntersectionObserver, fallback = image shows through) */}
          {videoSrc && (
            <video
              ref={videoRef}
              muted loop playsInline preload="none"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            />
          )}

          {/* Ambient overlay on hover — always present, subtle */}
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-0 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none"
          >
            <source src={AMBIENT_VIDEO} type="video/mp4" />
          </video>

          {/* Shimmer sweep */}
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full pointer-events-none" />

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-card via-card/20 to-transparent" />

          {/* Badge */}
          <div className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-[9px] font-black text-white/60 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-2.5">
          <h4 className="text-sm font-black leading-tight transition-colors duration-200 group-hover:text-primary">
            {item.name}
          </h4>
          <Link
            href={href}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition-all duration-200 hover:bg-primary/90 active:scale-95 group-hover:shadow-md group-hover:shadow-primary/30"
          >
            {label}
            <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── HomeClient ─────────────────────────────────────────────────────────── */

const MARQUEE_LABELS = [
  "Dizayn", "Dasturlash", "Marketing", "Konsalting",
  "Fotografiya", "Tarjima", "Repetitorlik", "Logistika", "Boshqa",
];

export function HomeClient({ isAuthenticated, lang }: { isAuthenticated: boolean, lang: Language }) {
  const t = translations[lang].home;
  const [videoLang, setVideoLang] = useState<"uz" | "ru">(lang === "ru" ? "ru" : "uz");
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useAnimatedStrong();
  useRevealElements();

  return (
    <div className="relative min-h-screen">
      <ScrollCursor />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <HeroSection isAuthenticated={isAuthenticated} />

      {/* ── SCROLL SCRUB A: Ishonchga asoslangan kelishuv ──────── */}
      <ScrollScrubA lang={lang} />

      {/* ── SCROLL SCRUB B: Shartnoma tuzish qulayliklari ─────── */}
      <ScrollScrubB lang={lang} />

      {/* ── "NIMA UCHUN SHARTNOMA?" SECTION ──────────────────────── */}
      <WhySection lang={lang} iframeRef={iframeRef} videoLang={videoLang} playing={playing}
        setVideoLang={setVideoLang} setPlaying={setPlaying} />

      {/* ── TEMPLATES ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* B1: Ambient background video behind entire grid */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-[0.14] pointer-events-none select-none"
          aria-hidden
        >
          <source src={AMBIENT_VIDEO} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, var(--background) 90%)" }}
        />

        {/* Marquee strip */}
        <div className="marquee-wrapper border-y border-border/40 py-3 mb-0 relative z-10">
          <div className="marquee-track">
            {[...MARQUEE_LABELS, ...MARQUEE_LABELS].map((label, i) => (
              <span key={i} className="mx-6 text-xs font-black uppercase tracking-[0.25em] text-muted-foreground/50 whitespace-nowrap">
                {label} <span className="text-primary/40 mx-2">·</span>
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mt-14 mb-16">
            <div className="mb-14 text-left reveal-hidden">
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl animated-strong">
                {t.templates.title}
              </h2>
              <p className="mt-3 max-w-2xl text-base font-medium text-muted-foreground sm:text-xl">{t.templates.subtitle}</p>
            </div>

            <motion.div
              className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {t.templates.items.map((item, i) => {
                const params = new URLSearchParams({
                  t: String(i),
                  title: item.name,
                  amount: item.amount,
                  content: item.content,
                  terms: JSON.stringify(item.terms),
                });
                return (
                  <TemplateCard
                    key={i}
                    item={item}
                    index={i}
                    videoSrc={TEMPLATE_VIDEOS[i] ?? null}
                    fallbackSrc={TEMPLATE_IMAGES[i] ?? TEMPLATE_IMAGES[0]}
                    href={`/contracts/new?${params.toString()}`}
                    label={lang === "uz" ? "Tanlash" : "Выбрать"}
                  />
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
