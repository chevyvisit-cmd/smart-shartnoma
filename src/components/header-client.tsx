"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { logout, setLanguage } from "@/lib/actions";
import { Language, translations } from "@/lib/translations";

export function HeaderClient({ user, lang, pendingContracts }: { user: any, lang: Language, pendingContracts: any[] }) {
  const t = translations[lang].nav;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-primary/30">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <Link href="/" className="group flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-black text-white shadow-[0_0_12px_rgba(45,106,79,0.4)] transition-transform group-hover:rotate-12">
                    S
                  </div>
                  <span className="text-lg font-black tracking-tighter text-foreground md:text-xl">
                    SMART<span className="text-primary">SHARTNOMA</span>
                  </span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { name: t.howItWorks, href: "/about" },
                  { name: t.contracts, href: "/contracts" },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:text-primary hover:bg-primary/5"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2 md:gap-3">
                {/* Desktop Language Switcher */}
                <div className="hidden sm:flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/5">
                  <button
                    onClick={() => setLanguage("uz")}
                    className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${lang === "uz" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Uz
                  </button>
                  <button
                    onClick={() => setLanguage("ru")}
                    className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${lang === "ru" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Ru
                  </button>
                </div>

                <ThemeToggle />
                <div className="hidden h-6 w-px bg-white/10 md:block" />
                
                {user ? (
                  <div className="flex items-center gap-2 md:gap-3">
                    <NotificationBell pendingContracts={pendingContracts} lang={lang} />
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-xl bg-white/5 px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-foreground transition-all hover:bg-white/10"
                    >
                      <LayoutDashboard size={18} className="text-primary" />
                      <span className="hidden sm:inline">{t.dashboard}</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-primary/50"
                    >
                      {user.image ? (
                        <img src={user.image} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User size={20} className="text-muted-foreground" />
                      )}
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                      title={t.logout}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/register"
                    className="group relative hidden sm:flex items-center gap-1 overflow-hidden rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-primary/30 active:scale-95"
                  >
                    <span className="relative z-10 font-black">{t.register}</span>
                    <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                  </Link>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-foreground transition-all hover:bg-white/10 md:hidden"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl md:hidden pt-28 px-6"
          >
            <nav className="flex flex-col gap-4 text-center">
              {[
                { name: t.howItWorks, href: "/about" },
                { name: t.contracts, href: "/contracts" },
                ...(user ? [
                  { name: t.dashboard, href: "/dashboard" },
                  { name: t.profile, href: "/profile" },
                ] : [
                  { name: t.register, href: "/register" },
                ])
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-2xl bg-white/5 py-4 text-xl font-black text-foreground"
                >
                  {item.name}
                </Link>
              ))}

              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/5">
                  <button
                    onClick={() => { setLanguage("uz"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2 text-sm font-black uppercase rounded-lg transition-all ${lang === "uz" ? "bg-primary text-white" : "text-muted-foreground"}`}
                  >
                    Uz
                  </button>
                  <button
                    onClick={() => { setLanguage("ru"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2 text-sm font-black uppercase rounded-lg transition-all ${lang === "ru" ? "bg-primary text-white" : "text-muted-foreground"}`}
                  >
                    Ru
                  </button>
                </div>
              </div>

              {user && (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-4 text-sm font-black text-red-500"
                >
                  <LogOut size={18} /> {t.logout}
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
