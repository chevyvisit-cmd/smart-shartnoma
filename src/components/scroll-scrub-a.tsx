"use client";

import { motion } from "framer-motion";
import { Language } from "@/lib/translations";

const VIDEO_SRC = "/videos/shartnoma-1-scrub.mp4";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.21, 0.45, 0.15, 1.0] as const } },
};

export function ScrollScrubA({ lang }: { lang: Language }) {
  const uz = lang === "uz";

  return (
    <section className="relative h-screen overflow-hidden bg-[#0a1410]" style={{ willChange: "transform" }}>

      {/* Full-screen background video */}
      <video
        autoPlay muted loop playsInline preload="none"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(10,20,16,0.55) 0%, rgba(10,20,16,0.78) 100%)" }}
      />

      {/* Top fade — blends with hero above */}
      <div
        className="absolute top-0 left-0 right-0 h-36 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #0a1410 0%, transparent 100%)" }}
      />

      {/* Bottom fade — blends into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #0a1410)" }}
      />

      {/* Centered stagger-animated text */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
        {/* Label */}
        <motion.div variants={fadeUp} className="mb-7 text-[11px] font-black tracking-[0.32em] text-primary uppercase">
          Smart-Shartnoma
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          className="text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[1.05] tracking-tight"
        >
          {uz ? (
            <>Har bir shartnoma —<br /><span className="text-primary">ishonchga</span><br />asoslangan kelishuv</>
          ) : (
            <>Каждый договор —<br /><span className="text-primary">в основе</span><br />доверие</>
          )}
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="mt-8 max-w-xl text-[clamp(1rem,2.2vw,1.25rem)] leading-relaxed text-white/60"
        >
          {uz
            ? "Yozma kelishuv ikki tomon o'rtasida qonuniy bog'liqlik yaratadi va nizoli vaziyatlarda huquqingizni himoya qiladi."
            : "Письменное соглашение создаёт правовую связь между сторонами и защищает ваши права в спорных ситуациях."}
        </motion.p>
      </motion.div>
    </section>
  );
}
