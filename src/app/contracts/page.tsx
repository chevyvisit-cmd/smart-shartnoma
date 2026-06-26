import { db } from "@/lib/db";
import { getUser, getLanguage } from "@/lib/actions";
import { redirect } from "next/navigation";
import { FileText, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ContractsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const lang = await getLanguage();

  const contracts = await db.contract.findMany({
    where: {
      OR: [{ creatorId: user.id }, { recipientId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: { creator: true, recipient: true },
  });

  const signed   = lang === "uz" ? "Imzolangan"  : "Подписано";
  const pending  = lang === "uz" ? "Kutilmoqda"  : "Ожидает";
  const empty    = lang === "uz" ? "Hali shartnomalar yo'q." : "Контрактов пока нет.";
  const title    = lang === "uz" ? "Mening shartnomalarim" : "Мои контракты";
  const newLabel = lang === "uz" ? "Yangi shartnoma" : "Новый контракт";
  const viewLabel= lang === "uz" ? "Ko'rish" : "Просмотр";

  return (
    <div className="container mx-auto px-4 py-24 md:px-6">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black tracking-tight">{title}</h1>
        <Link
          href="/contracts/new"
          className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">{newLabel}</span>
          <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
        </Link>
      </div>

      <div className="grid gap-4">
        {contracts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-20 text-center text-muted-foreground">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">{empty}</p>
            <Link href="/contracts/new" className="mt-4 inline-block text-sm font-black text-primary hover:underline">
              {newLabel}
            </Link>
          </div>
        ) : (
          contracts.map((contract) => (
            <Link
              key={contract.id}
              href={`/contracts/${contract.id}`}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-black text-lg group-hover:text-primary transition-colors">{contract.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {new Date(contract.createdAt).toLocaleDateString()} &nbsp;·&nbsp;
                    <span className="font-bold text-primary">{(contract.amount || 0).toLocaleString()} UZS</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-tight ${
                  contract.status === "SIGNED"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}>
                  {contract.status === "SIGNED"
                    ? <><CheckCircle2 size={12} /> {signed}</>
                    : <><Clock size={12} /> {pending}</>
                  }
                </span>
                <span className="hidden sm:flex items-center gap-1 text-xs font-black text-muted-foreground/40 group-hover:text-primary transition-colors uppercase tracking-widest">
                  {viewLabel} <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
