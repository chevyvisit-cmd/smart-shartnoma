import Link from "next/link";
import { getLanguage } from "@/lib/actions";

export async function Footer() {
  const lang = await getLanguage();
  const year = new Date().getFullYear();

  const nav = lang === "ru"
    ? [
        { href: "/",          label: "Главная" },
        { href: "/about",     label: "О нас" },
        { href: "/contracts", label: "Договоры" },
        { href: "/dashboard", label: "Панель" },
      ]
    : [
        { href: "/",          label: "Bosh sahifa" },
        { href: "/about",     label: "Biz haqimizda" },
        { href: "/contracts", label: "Shartnomalar" },
        { href: "/dashboard", label: "Panel" },
      ];

  const account = lang === "ru"
    ? [
        { href: "/login",    label: "Войти" },
        { href: "/register", label: "Регистрация" },
        { href: "/profile",  label: "Профиль" },
      ]
    : [
        { href: "/login",    label: "Kirish" },
        { href: "/register", label: "Ro'yxatdan o'tish" },
        { href: "/profile",  label: "Profil" },
      ];

  return (
    <footer className="border-t border-border bg-[#0D1A14]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2">
            <div className="text-2xl font-black tracking-tighter text-white">
              Smart<span className="text-primary">-Shartnoma</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              {lang === "ru"
                ? "Платформа для создания и подписания цифровых договоров — быстро, законно и безопасно."
                : "Raqamli shartnomalar yaratish va imzolash platformasi — tez, qonuniy va xavfsiz."}
            </p>

            {/* Status dot */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                {lang === "ru" ? "Работает" : "Ishlayapti"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              {lang === "ru" ? "Навигация" : "Navigatsiya"}
            </h4>
            <ul className="space-y-3">
              {nav.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              {lang === "ru" ? "Аккаунт" : "Hisob"}
            </h4>
            <ul className="space-y-3">
              {account.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <span className="text-xs text-white/40">
            © {year} Smart-Shartnoma.{" "}
            {lang === "ru" ? "Все права защищены." : "Barcha huquqlar himoyalangan."}
          </span>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              v2.0.0
            </span>
            <div className="h-px w-12 bg-primary/30" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              UZ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
