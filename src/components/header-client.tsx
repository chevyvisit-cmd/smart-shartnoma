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
        className="fixed top-3 left-0 right-0 z-50 px-3 md:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-2xl border border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl">
            <div className="flex h-14 items-center justify-between px-4 md:px-6">

              {/* Logo */}
              <Link href="/" className="group flex items-center gap-2 shrink-0">
                <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-primary font-black text-white text-sm shadow-[0_0_12px_rgba(45,106,79,0.4)] transition-transform group-hover:rotate-12">
                  S
                </div>
                <span className="text-base font-black tracking-tighter text-foreground md:text-xl">
                  SMART<span className="text-primary">SHARTNOMA</span>
                </span>
              </Link>

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

              {/* Right side */}
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* Language Switcher — desktop */}
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

                {user ? (
                  <>
                    <NotificationBell pendingContracts={pendingContracts} lang={lang} />
                    <Link
                      href="/dashboard"
                      className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-foreground transition-all hover:bg-white/10"
                    >
                      <LayoutDashboard size={16} className="text-primary" />
                      <span className="hidden md:inline">{t.dashboard}</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-primary/50"
                    >
                      {user.image ? (
                        <img src={user.image} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User size={16} className="text-muted-foreground" />
                      )}
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                      title={t.logout}
                    >
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/register"
                    className="group relative hidden sm:flex items-center gap-1 overflow-hidden rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 font-black">{t.register}</span>
                    <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                  </Link>
                )}

                {/* Hamburger — always visible on mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground transition-all hover:bg-white/10 md:hidden"
                  aria-label="Menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-background/97 backdrop-blur-2xl md:hidden pt-24 px-5 overflow-y-auto"
          >
            <nav className="flex flex-col gap-3">
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
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-lg font-black text-foreground hover:bg-white/10 transition-colors"
                >
                  {item.name}
                </Link>
              ))}

              {/* Language switcher in mobile menu */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Til / Язык</span>
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
                  className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 py-4 text-sm font-black text-red-500"
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
