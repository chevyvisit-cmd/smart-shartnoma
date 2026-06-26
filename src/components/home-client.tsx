"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Zap, MousePointer2, Sparkles, FileText, Play, Scale, Banknote, ClipboardList, Handshake } from "lucide-react";
import Link from "next/link";
import { Language, translations } from "@/lib/translations";

// ✏️ YouTube video ID larini shu yerga kiriting:
const VIDEO_IDS = {
  uz: "xXcMtqop4xQ",  // O'zbek tilidagi video
  ru: "bCXzUPGEfRg",  // Rus tilidagi video
};

export function HomeClient({ isAuthenticated, lang }: { isAuthenticated: boolean, lang: Language }) {
  const t = translations[lang].home;
  const [videoLang, setVideoLang] = useState<"uz" | "ru">(lang === "ru" ? "ru" : "uz");
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative min-h-screen pt-20">
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black tracking-widest text-primary uppercase"
          >
            <Sparkles size={14} />
            {t.tag}
          </motion.div>
          
          <h1 className="mt-8 text-5xl font-black tracking-tighter sm:text-8xl lg:text-9xl">
            {lang === 'uz' ? (
              <>Sizning <span className="text-primary">raqamli</span> <br className="hidden sm:block" /> shartnomangiz</>
            ) : (
              <>Ваш <span className="text-primary">цифровой</span> <br className="hidden sm:block" /> контракт</>
            )}
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-muted-foreground/80 md:text-xl">
            {t.subtitle}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gold px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-black text-gold-foreground shadow-2xl transition-all hover:scale-105 hover:bg-gold-hover hover:shadow-[0_20px_60px_rgba(212,165,55,0.35)] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isAuthenticated ? t.toDashboard : t.start} 
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
            </Link>
            
            <Link
              href="/about"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-black text-foreground transition-all hover:bg-white/10 hover:border-white/20"
            >
              {t.howItWorks}
            </Link>
          </div>
        </motion.div>

        {/* Floating Mouse Interaction Hint */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-16 flex flex-col items-center gap-2 text-muted-foreground opacity-40"
        >
          <MousePointer2 size={24} />
          <span className="text-xs font-bold uppercase tracking-widest">{t.playWithBg}</span>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          {t.features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/5 p-10 text-left backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-white/10"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6">
                {i === 0 ? <ShieldCheck size={32} /> : i === 1 ? <Zap size={32} /> : <FileText size={32} />}
              </div>
              <h3 className="text-2xl font-black tracking-tight">{feature.title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
              
              {/* Decorative accent */}
              <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/20" />
            </motion.div>
          ))}
        </div>

        {/* Video Section */}
        <div className="mt-40 mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-left">
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              {lang === "uz" ? "Nima uchun shartnoma?" : "Зачем нужен контракт?"}
            </h2>
            <p className="mt-4 text-xl text-muted-foreground font-medium max-w-2xl">
              {lang === "uz"
                ? "Qisqa video orqali shartnomaning ahamiyatini bilib oling."
                : "Узнайте о важности контракта с помощью короткого видео."}
            </p>
          </motion.div>

          <div className="grid gap-10 lg:grid-cols-2 items-start">
            {/* Player */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {/* Language tabs */}
              <div className="flex gap-2 mb-4">
                {(["uz", "ru"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setVideoLang(l); setPlaying(false); }}
                    className={`rounded-xl px-5 py-2 text-sm font-black uppercase tracking-widest transition-all ${
                      videoLang === l
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {l === "uz" ? "O'zbek" : "Русский"}
                  </button>
                ))}
              </div>

              {/* Video player */}
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-card shadow-2xl" style={{ aspectRatio: "16/9" }}>
                {playing ? (
                  <iframe
                    key={videoLang}
                    src={`https://www.youtube-nocookie.com/embed/${VIDEO_IDS[videoLang]}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=ru&hl=ru`}
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
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button
                        onClick={() => setPlaying(true)}
                        className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:scale-110 hover:bg-primary hover:border-primary shadow-2xl"
                      >
                        <Play size={32} className="text-white ml-1 transition-transform group-hover:scale-110" fill="currentColor" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="rounded-xl bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-black text-white uppercase tracking-widest">
                        {videoLang === "uz" ? "O'zbek tili" : "Русский язык"}
                      </span>
                      <span className="rounded-xl bg-primary/80 backdrop-blur-sm px-3 py-1.5 text-xs font-black text-white">
                        ▶ Play
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Key points */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:pt-12">
              {(lang === "uz" ? [
                {
                  Icon: Scale,
                  num: "01",
                  title: "Huquqiy himoya",
                  desc: "Shartnoma qonun kuchiga ega hujjat bo'lib, nizoli vaziyatlarda sudda asosiy dalil sifatida qabul qilinadi. U sizning har qanday talab va huquqlaringizni rasmiy ravishda mustahkamlaydi.",
                },
                {
                  Icon: Banknote,
                  num: "02",
                  title: "To'lov kafolati",
                  desc: "Ish hajmi, narxi va to'lov muddatlari oldindan yozma belgilanadi. Bajarilgan ish uchun to'liq haq olish huquqingiz shartnoma bilan himoyalanadi.",
                },
                {
                  Icon: ClipboardList,
                  num: "03",
                  title: "Aniq majburiyatlar",
                  desc: "Kim, nima, qachon va qancha bajarishi — barchasi hujjatda ko'rsatiladi. Bu tushunmovchilik va bahslarning oldini oladi.",
                },
                {
                  Icon: Handshake,
                  num: "04",
                  title: "Ishonchli hamkorlik",
                  desc: "Yozma kelishuv ikki tomon o'rtasida professional munosabat o'rnatadi va uzoq muddatli hamkorlik uchun poydevor bo'ladi.",
                },
              ] : [
                {
                  Icon: Scale,
                  num: "01",
                  title: "Правовая защита",
                  desc: "Договор имеет юридическую силу и является основным доказательством в суде при спорных ситуациях. Он официально закрепляет все ваши права и требования.",
                },
                {
                  Icon: Banknote,
                  num: "02",
                  title: "Гарантия оплаты",
                  desc: "Объём работ, стоимость и сроки оплаты фиксируются заранее в письменной форме. Ваше право на полную оплату за выполненную работу защищено договором.",
                },
                {
                  Icon: ClipboardList,
                  num: "03",
                  title: "Чёткие обязательства",
                  desc: "Кто, что, когда и в каком объёме должен сделать — всё это прописывается в документе. Это исключает недопонимание и споры.",
                },
                {
                  Icon: Handshake,
                  num: "04",
                  title: "Надёжное партнёрство",
                  desc: "Письменное соглашение устанавливает профессиональные отношения между сторонами и создаёт основу для долгосрочного сотрудничества.",
                },
              ]).map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group relative flex gap-5 py-6 border-b border-white/5 last:border-0 transition-all hover:border-primary/10"
                >
                  {/* Vertical accent line on hover */}
                  <div className="absolute left-0 top-6 bottom-6 w-px bg-primary scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />

                  {/* Icon box */}
                  <div className="shrink-0 flex flex-col items-center gap-2 pl-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-primary/70 transition-all group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                      <point.Icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-muted-foreground/30 group-hover:text-primary/40 transition-colors">{point.num}</span>
                  </div>

                  {/* Text */}
                  <div className="pt-1 pr-2">
                    <p className="text-sm font-black tracking-tight text-foreground mb-1.5 group-hover:text-primary transition-colors">{point.title}</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mt-40 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-left mb-16"
          >
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">{t.templates.title}</h2>
            <p className="mt-4 text-xl text-muted-foreground font-medium max-w-2xl">{t.templates.subtitle}</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {t.templates.items.map((item, i) => {
              const images = [
                "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop",   // Design
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",  // Programming
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",  // Marketing
                "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",     // Consulting
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",  // Photo/Video
                "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",  // Translation
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",  // Tutoring
                "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",  // Logistics
                "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop",  // Content
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
                  className="group relative h-72 overflow-hidden rounded-[28px] border border-white/10 shadow-2xl cursor-pointer"
                >
                  {/* Full-cover image */}
                  <img
                    src={images[i] ?? images[i % images.length]}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                  />

                  {/* Always-visible bottom bar: name + price */}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent px-5 pb-5 pt-12 transition-all duration-500 group-hover:pb-42">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">
                      {Number(item.amount).toLocaleString()} UZS
                    </p>
                    <h4 className="text-lg font-black text-white leading-tight">{item.name}</h4>
                  </div>

                  {/* Hover panel: slides up from bottom */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0 bg-card/95 backdrop-blur-sm px-5 pt-4 pb-5 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">{item.desc}</p>

                    {/* Stats */}
                    <div className="flex gap-2 mb-3">
                      {item.stats.map((s, si) => (
                        <div key={si} className="flex-1 rounded-xl bg-primary/5 border border-primary/10 px-2 py-1.5 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary/50">{s.label}</p>
                          <p className="text-[11px] font-black text-primary mt-0.5">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Terms */}
                    <div className="space-y-1 mb-4">
                      {item.terms.slice(0, 3).map((term, ti) => (
                        <div key={ti} className="flex items-start gap-1.5">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                          <span className="text-[11px] text-muted-foreground leading-relaxed">{term}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price + Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                          {lang === 'uz' ? "Boshlang'ich" : "От суммы"}
                        </p>
                        <p className="text-sm font-black">{Number(item.amount).toLocaleString()} UZS</p>
                      </div>
                      <Link
                        href={`/contracts/new?${params.toString()}`}
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white transition-all hover:bg-primary/90 active:scale-95"
                      >
                        {lang === 'uz' ? 'Tanlash' : 'Выбрать'}
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-200 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
