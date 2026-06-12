"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, PenTool } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 -z-10 h-full w-full bg-background">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Smart-Shartnoma v1.0 (MVP)
          </span>
          <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
            Freelance shartnomalar <br />
            <span className="text-primary">tez va xavfsiz</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground opacity-80">
            JShShIR va telefon raqami orqali qonuniy shartnomalar tuzing. 
            Frilanserlar va mijozlar uchun eng sodda platforma.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95"
            >
              Boshlash <ArrowRight size={20} />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-8 py-4 font-bold text-primary transition-colors hover:bg-primary/10"
            >
              Qanday ishlaydi?
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="mt-32 grid gap-8 sm:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="group relative rounded-2xl border border-primary/10 bg-card p-8 transition-all hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold">Xavfsiz Tranzaksiya</h3>
            <p className="mt-2 text-sm opacity-60">ID-karta orqali shaxsni tasdiqlash va qonuniy himoya.</p>
          </div>

          <div className="group relative rounded-2xl border border-primary/10 bg-card p-8 transition-all hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold">Tezkor Yaratish</h3>
            <p className="mt-2 text-sm opacity-60">Shartnomani 2 daqiqada tayyorlang va imzolang.</p>
          </div>

          <div className="group relative rounded-2xl border border-primary/10 bg-card p-8 transition-all hover:border-primary/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PenTool size={28} />
            </div>
            <h3 className="text-xl font-bold">Raqamli Imzo</h3>
            <p className="mt-2 text-sm opacity-60">SMS kod orqali masofadan turib imzolash imkoniyati.</p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
