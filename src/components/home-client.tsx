"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Zap, FileText, Play, Scale, Banknote, ClipboardList, Handshake, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Language, translations } from "@/lib/translations";
import { HeroBackground } from "@/components/motion/hero-background";
import { ScrollScrubA } from "@/components/scroll-scrub-a";
import { ScrollScrubB } from "@/components/scroll-scrub-b";
import { ScrollCursor } from "@/components/motion/scroll-cursor";

const VIDEO_IDS = {
  uz: "xXcMtqop4xQ",
  ru: "bCXzUPGEfRg",
};

export function HomeClient({ isAuthenticated, lang }: { isAuthenticated: boolean, lang: Language }) {
  const t = translations[lang].home;
  const [videoLang, setVideoLang] = useState<"uz" | "ru">(lang === "ru" ? "ru" : "uz");
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative min-h-screen">
      <ScrollCursor />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">

        {/* z-0 → z-2: video, overlay, grid, sweep, top line */}
        <HeroBackground />

        {/* z-2: Corner brackets ⌐ */}
        <div className="absolute top-8 left-8 hidden lg:block" style={{ zIndex: 2 }}>
          <div className="w-7 h-0.5 bg-primary/60" />
          <div className="h-7 w-0.5 bg-primary/60" />
        </div>
        <div className="absolute top-8 right-8 hidden lg:block" style={{ zIndex: 2 }}>
          <div className="w-7 h-0.5 bg-primary/60 ml-auto" />
          <div className="h-7 w-0.5 bg-primary/60 ml-auto" />
        </div>

        {/* z-3: All foreground content */}
        <div className="relative flex flex-col items-center text-center" style={{ zIndex: 3 }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-[11px] font-black tracking-[0.2em] text-primary uppercase backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {t.tag}
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.21, 0.45, 0.15, 1.0] }}
            className="text-[clamp(3rem,10vw,9rem)] font-black leading-[0.88] tracking-tighter uppercase text-white drop-shadow-lg"
          >
            {lang === "uz" ? (
              <>Raqamli<br /><span className="text-primary">Shartnoma</span></>
            ) : (
              <>Цифровой<br /><span className="text-primary">Контракт</span></>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mx-auto mt-8 max-w-lg text-sm font-medium leading-relaxed text-white/60 sm:text-base"
          >
            {t.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-9 py-4 text-base font-black text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isAuthenticated ? t.toDashboard : t.start}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>

            <Link
              href="/about"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-9 py-4 text-base font-black text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/15"
            >
              {t.howItWorks}
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator (z-3) */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-white/30"
          style={{ zIndex: 3 }}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.35em]">scroll</span>
          <ChevronDown size={14} />
        </motion.div>

        {/* Side rule lines (z-2) */}
        <div
          className="absolute left-8 top-1/2 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex"
          style={{ zIndex: 2 }}
        >
          {[18, 7, 14, 7, 10].map((w, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1 + i * 0.06, duration: 0.4 }}
              style={{ width: w }}
              className="h-px origin-left bg-primary/50"
            />
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20 sm:px-6">
        <div className="grid gap-5 sm:gap-8 md:grid-cols-3">
          {t.features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-left transition-all hover:border-primary/40 hover:bg-secondary"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6">
                {i === 0 ? <ShieldCheck size={28} /> : i === 1 ? <Zap size={28} /> : <FileText size={28} />}
              </div>
              <h3 className="text-xl font-black tracking-tight sm:text-2xl">{feature.title}</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{feature.desc}</p>
              <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/20" />
            </motion.div>
          ))}
        </div>

      </section>

      {/* ── SCROLL SCRUB A: Ishonchga asoslangan kelishuv ──────── */}
      <ScrollScrubA lang={lang} />

      {/* ── SCROLL SCRUB B: Shartnoma tuzish qulayliklari ─────── */}
      <ScrollScrubB lang={lang} />

      <section className="container mx-auto px-4 sm:px-6">
        {/* ── VIDEO SECTION ──────────────────────────────────────── */}
        <div className="mt-28 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-left"
          >
            <h2 className="text-4xl font-black tracking-tight sm:text-6xl">
              {lang === "uz" ? "Nima uchun shartnoma?" : "Зачем нужен контракт?"}
            </h2>
            <p className="mt-4 max-w-2xl text-lg font-medium text-muted-foreground sm:text-2xl">
              {lang === "uz"
                ? "Qisqa video orqali shartnomaning ahamiyatini bilib oling."
                : "Узнайте о важности контракта с помощью короткого видео."}
            </p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-2 items-start">
            {/* Player */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
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

              <div className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl" style={{ aspectRatio: "16/9" }}>
                {playing ? (
                  <iframe
                    key={videoLang}
                    src={`https://www.youtube-nocookie.com/embed/${VIDEO_IDS[videoLang]}?autoplay=1&rel=0&modestbranding=1`}
                    title={videoLang === "uz" ? "Shartnoma haqida video" : "Видео о контракте"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <img
                      src={`https://img.youtube.com/vi/${VIDEO_IDS[videoLang]}/maxresdefault.jpg`}
                      alt="video thumbnail"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${VIDEO_IDS[videoLang]}/hqdefault.jpg`; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <button
                        onClick={() => setPlaying(true)}
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
            </motion.div>

            {/* Key points */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {(lang === "uz" ? [
                { Icon: Scale,        num: "01", title: "Huquqiy himoya",      desc: "Shartnoma qonun kuchiga ega hujjat bo'lib, nizoli vaziyatlarda sudda asosiy dalil sifatida qabul qilinadi." },
                { Icon: Banknote,     num: "02", title: "To'lov kafolati",     desc: "Ish hajmi, narxi va to'lov muddatlari oldindan yozma belgilanadi va huquqingiz himoyalanadi." },
                { Icon: ClipboardList,num: "03", title: "Aniq majburiyatlar",  desc: "Kim, nima, qachon va qancha bajarishi — barchasi hujjatda ko'rsatiladi." },
                { Icon: Handshake,    num: "04", title: "Ishonchli hamkorlik", desc: "Yozma kelishuv professional munosabat o'rnatadi va uzoq muddatli hamkorlik uchun poydevor bo'ladi." },
              ] : [
                { Icon: Scale,        num: "01", title: "Правовая защита",        desc: "Договор имеет юридическую силу и является основным доказательством в суде при спорных ситуациях." },
                { Icon: Banknote,     num: "02", title: "Гарантия оплаты",        desc: "Объём работ, стоимость и сроки оплаты фиксируются заранее в письменной форме." },
                { Icon: ClipboardList,num: "03", title: "Чёткие обязательства",   desc: "Кто, что, когда и в каком объёме должен сделать — всё прописывается в документе." },
                { Icon: Handshake,    num: "04", title: "Надёжное партнёрство",   desc: "Письменное соглашение устанавливает профессиональные отношения между сторонами." },
              ]).map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group relative flex gap-6 border-b border-border/60 py-8 last:border-0 transition-all hover:border-primary/30"
                >
                  <div className="absolute left-0 top-8 bottom-8 w-px origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100" />

                  {/* Icon */}
                  <div className="flex shrink-0 flex-col items-center gap-2 pl-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary text-primary/70 transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                      <point.Icon size={22} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-muted-foreground/40 transition-colors group-hover:text-primary/50">{point.num}</span>
                  </div>

                  {/* Text */}
                  <div className="pt-1">
                    <p className="mb-2 text-base font-black tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">{point.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── TEMPLATES ─────────────────────────────────────────── */}
        <div className="mt-24 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-left"
          >
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">{t.templates.title}</h2>
            <p className="mt-3 max-w-2xl text-base font-medium text-muted-foreground sm:text-xl">{t.templates.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {t.templates.items.map((item, i) => {
              const images = [
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
              const params = new URLSearchParams({
                t: String(i),
                title: item.name,
                amount: item.amount,
                content: item.content,
                terms: JSON.stringify(item.terms),
              });
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:rounded-[28px]"
                >
                  <div className="relative h-36 overflow-hidden sm:h-52">
                    <img
                      src={images[i] ?? images[i % images.length]}
                      alt={item.name}
                      className="h-full w-full object-cover grayscale-60"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-card via-card/30 to-transparent" />
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    <h4 className="text-sm font-black leading-tight">{item.name}</h4>
                    <p className="mt-0.5 text-[11px] font-bold text-primary">{Number(item.amount).toLocaleString()} UZS</p>
                    <Link
                      href={`/contracts/new?${params.toString()}`}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition-all hover:bg-primary/90 active:scale-95"
                    >
                      {lang === "uz" ? "Tanlash" : "Выбрать"}
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
