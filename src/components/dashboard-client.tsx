"use client";

import { motion } from "framer-motion";
import { Plus, FileText, Clock, CheckCircle, TrendingUp, Search, Filter, Gift, CreditCard, Percent } from "lucide-react";
import Link from "next/link";
import { Language, translations } from "@/lib/translations";

interface Quota { freeUsed: number; freeLimit: number; paidCredits: number; price: number }

export function DashboardClient({ contracts, stats, quota, lang }: {
  contracts: any[];
  stats: any;
  quota: Quota | null;
  lang: Language;
}) {
  const t = translations[lang].dashboard;
  const uz = lang === "uz";

  const statItems = [
    { label: t.stats.total, value: stats.total.toString(), icon: <FileText size={24} />, color: "text-primary", bg: "bg-primary/10" },
    { label: t.stats.pending, value: stats.pending.toString(), icon: <Clock size={24} />, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: t.stats.signed, value: stats.signed.toString(), icon: <CheckCircle size={24} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: t.stats.growth, value: "+0%", icon: <TrendingUp size={24} />, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="container mx-auto px-4 py-20 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">{t.title}</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground font-medium">{t.welcome}</p>
        </div>
        <Link
          href="/contracts/new"
          className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-primary px-5 py-3 sm:px-6 sm:py-4 text-sm font-black text-white shadow-xl transition-all hover:scale-105 hover:shadow-primary/30 active:scale-95 self-start md:self-auto"
        >
          <span className="relative z-10 flex items-center gap-2 font-black">
            <Plus size={20} /> {t.newContract}
          </span>
          <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
        </Link>
      </motion.div>

      {/* Kvota banneri */}
      {quota && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4
            border-primary/20 bg-primary/5"
        >
          <div className="flex items-center gap-3 flex-wrap">
            {quota.freeUsed < quota.freeLimit ? (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Gift size={18} />
                </div>
                <div>
                  <p className="text-sm font-black">
                    {uz ? "Bepul shartnomalar" : "Бесплатные договоры"}
                    <span className="ml-2 text-primary">{quota.freeUsed}/{quota.freeLimit}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uz
                      ? `Yana ${quota.freeLimit - quota.freeUsed} ta bepul shartnoma qoldi`
                      : `Осталось ещё ${quota.freeLimit - quota.freeUsed} бесплатных`}
                  </p>
                </div>
              </>
            ) : quota.paidCredits > 0 ? (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-violet-400">
                    {quota.paidCredits} {uz ? "ta to'langan kredit" : "платных кредита"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uz ? "Har kredit — 1 ta shartnoma" : "Каждый кредит — 1 договор"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Percent size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-500">
                    {uz ? "Bepul limit tugadi" : "Бесплатный лимит исчерпан"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uz
                      ? `Keyingi shartnoma uchun ${quota.price.toLocaleString()} UZS to'lov kerak`
                      : `Следующий договор требует оплаты ${quota.price.toLocaleString()} UZS`}
                  </p>
                </div>
              </>
            )}
          </div>
          <Link
            href="/contracts/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white transition-all hover:bg-primary/90"
          >
            <Plus size={14} />
            {uz ? "Yangi shartnoma" : "Новый договор"}
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-md transition-all hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} p-3 sm:p-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                {stat.icon}
              </div>
              <span className="text-2xl sm:text-3xl font-black">{stat.value}</span>
            </div>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            <div className={`absolute -bottom-4 -right-4 h-16 w-16 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20 ${stat.bg}`} />
          </motion.div>
        ))}
      </div>

      {/* Recent Contracts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-4 sm:p-8 sm:flex-row sm:items-center">
          <h3 className="text-lg sm:text-2xl font-black">{t.table.recent}</h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                placeholder="..." 
                className="rounded-xl border border-white/10 bg-white/5 py-2 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:bg-white/10"
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {contracts.length === 0 ? (
          <div className="py-12 sm:py-20 text-center text-muted-foreground">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">{t.table.empty}</p>
            <Link href="/contracts/new" className="mt-4 inline-block text-primary hover:underline font-bold">
              {t.newContract}
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {contracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      contract.type === "DOGOVOR" ? "bg-blue-500/10 text-blue-400" : "bg-primary/10 text-primary"
                    }`}>
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                          contract.type === "DOGOVOR"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-primary/15 text-primary"
                        }`}>{contract.type || "KONTRAKT"}</span>
                      </div>
                      <p className="font-black text-sm truncate">{contract.title}</p>
                      <p className="text-xs text-primary font-bold">{(contract.amount || 0).toLocaleString()} UZS</p>
                    </div>
                  </div>
                  <span className={`ml-2 shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                    contract.status === "ACCEPTED" || contract.status === "SIGNED" ? "bg-emerald-500/10 text-emerald-500"
                    : contract.status === "REJECTED" ? "bg-red-500/10 text-red-500"
                    : contract.status === "SENT" ? "bg-blue-500/10 text-blue-500"
                    : "bg-amber-500/10 text-amber-500"
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      contract.status === "ACCEPTED" || contract.status === "SIGNED" ? "bg-emerald-500"
                      : contract.status === "REJECTED" ? "bg-red-500"
                      : contract.status === "SENT" ? "bg-blue-500" : "bg-amber-500"
                    }`} />
                    {contract.status === "ACCEPTED" ? (uz ? "Qabul" : "Принято")
                      : contract.status === "SIGNED"   ? (uz ? "Imzo" : "Подпис.")
                      : contract.status === "REJECTED" ? (uz ? "Rad"  : "Откл.")
                      : contract.status === "SENT"     ? (uz ? "Yuborildi" : "Отпр.")
                      : (uz ? "Kutilmoqda" : "Ожидает")}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  <th className="px-6 py-5">{t.table.name}</th>
                  <th className="px-6 py-5">{t.table.amount}</th>
                  <th className="px-6 py-5">{t.table.date}</th>
                  <th className="px-6 py-5">{t.table.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="group cursor-pointer transition-all hover:bg-white/5"
                    onClick={() => window.location.href = `/contracts/${contract.id}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                          contract.type === "DOGOVOR" ? "bg-blue-500/10 text-blue-400" : "bg-primary/10 text-primary"
                        }`}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                            contract.type === "DOGOVOR"
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-primary/15 text-primary"
                          }`}>{contract.type || "KONTRAKT"}</span>
                          <p className="mt-0.5 font-bold group-hover:text-primary transition-colors">{contract.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-primary">{(contract.amount || 0).toLocaleString()} UZS</td>
                    <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-tighter ${
                        contract.status === "ACCEPTED" || contract.status === "SIGNED" ? "bg-emerald-500/10 text-emerald-500"
                        : contract.status === "REJECTED" ? "bg-red-500/10 text-red-500"
                        : contract.status === "SENT" ? "bg-blue-500/10 text-blue-500"
                        : "bg-amber-500/10 text-amber-500"
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          contract.status === "ACCEPTED" || contract.status === "SIGNED" ? "bg-emerald-500"
                          : contract.status === "REJECTED" ? "bg-red-500"
                          : contract.status === "SENT" ? "bg-blue-500" : "bg-amber-500"
                        }`} />
                        {contract.status === "ACCEPTED" ? (uz ? "Qabul qilindi" : "Принято")
                          : contract.status === "SIGNED"   ? t.stats.signed
                          : contract.status === "REJECTED" ? (uz ? "Rad etildi"   : "Отклонено")
                          : contract.status === "SENT"     ? (uz ? "Yuborildi"    : "Отправлено")
                          : t.stats.pending}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}

        {contracts.length > 0 && (
          <div className="border-t border-white/10 p-6 text-center">
            <button className="text-sm font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
              {t.table.viewAll}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
