"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Check, Eye, XCircle, FileText, CheckSquare, Square, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { acceptSentContract, rejectContract } from "@/lib/actions";
import { Language, translations } from "@/lib/translations";

type PendingContract = {
  id: string;
  cid: string | null;
  title: string;
  amount: number | null;
  content: string;
  terms: string | null;
  sentAt: Date | null;
  creator: { id: string; name: string | null; phone: string };
};

type ViewState = "list" | "terms" | "reject";

export function NotificationBell({
  pendingContracts,
  lang,
}: {
  pendingContracts: PendingContract[];
  lang: Language;
}) {
  const t = translations[lang].notifications;
  const uz = lang === "uz";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [activeContract, setActiveContract] = useState<PendingContract | null>(null);
  const [checkedTerms, setCheckedTerms] = useState<boolean[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const count = pendingContracts.length;

  const openTermsView = (contract: PendingContract) => {
    const parsed = parseTerms(contract.terms);
    setActiveContract(contract);
    setCheckedTerms(parsed.map(() => false));
    setViewState("terms");
  };

  const openRejectView = (contract: PendingContract) => {
    setActiveContract(contract);
    setRejectReason("");
    setViewState("reject");
  };

  const backToList = () => {
    setViewState("list");
    setActiveContract(null);
    setCheckedTerms([]);
    setRejectReason("");
  };

  const handleAccept = async () => {
    if (!activeContract) return;
    setLoadingId(activeContract.id);
    const result = await acceptSentContract(activeContract.id);
    setLoadingId(null);
    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
      backToList();
      router.refresh();
    }
  };

  const handleReject = async () => {
    if (!activeContract) return;
    setLoadingId(activeContract.id);
    const result = await rejectContract(activeContract.id, rejectReason || undefined);
    setLoadingId(null);
    if (result.error) {
      alert(result.error);
    } else {
      setOpen(false);
      backToList();
      router.refresh();
    }
  };

  const toggleTerm = (i: number) => {
    setCheckedTerms((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const allTermsChecked = checkedTerms.length === 0 || checkedTerms.every(Boolean);

  if (count === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) backToList(); }}
        className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-white/5 text-foreground transition-all hover:bg-white/10 border border-white/5"
        aria-label={t.title}
      >
        <Bell size={18} className="text-primary" />
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg shadow-primary/30 animate-pulse">
          {count}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-[340px] md:w-[400px] overflow-hidden rounded-2xl border border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  {viewState !== "list" && (
                    <button
                      onClick={backToList}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors mr-1"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  <Bell size={16} className="text-primary" />
                  <span className="text-sm font-black text-foreground">
                    {viewState === "list"
                      ? t.title
                      : viewState === "terms"
                      ? (uz ? "Shartnoma shartlari" : "Условия договора")
                      : (uz ? "Rad etish" : "Отклонить")}
                  </span>
                  {viewState === "list" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                      {count}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* LIST VIEW */}
                {viewState === "list" && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.15 }}
                    className="max-h-[460px] overflow-y-auto"
                  >
                    {pendingContracts.map((contract) => (
                      <div key={contract.id} className="border-b border-white/5 px-4 py-4 last:border-0">
                        <div className="mb-3 flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <FileText size={16} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-foreground truncate">{contract.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {uz ? "Yuboruvchi: " : "Отправитель: "}
                              <span className="font-bold">{contract.creator.name || contract.creator.phone}</span>
                            </p>
                            {contract.amount ? (
                              <p className="text-xs font-bold text-primary mt-0.5">
                                {contract.amount.toLocaleString()} UZS
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/contracts/${contract.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                          >
                            <Eye size={12} />
                            {t.view}
                          </Link>
                          <button
                            onClick={() => openTermsView(contract)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500/10 py-2 text-xs font-black text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Check size={12} />
                            {t.accept}
                          </button>
                          <button
                            onClick={() => openRejectView(contract)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-500/10 py-2 text-xs font-black text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            <XCircle size={12} />
                            {t.reject}
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* TERMS VIEW */}
                {viewState === "terms" && activeContract && (
                  <motion.div
                    key="terms"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.15 }}
                    className="max-h-[500px] flex flex-col"
                  >
                    {/* Contract info */}
                    <div className="border-b border-white/5 px-4 py-3 bg-white/2">
                      <p className="text-sm font-black">{activeContract.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {uz ? "Yuboruvchi: " : "Отправитель: "}
                        <span className="font-bold">{activeContract.creator.name || activeContract.creator.phone}</span>
                      </p>
                      {activeContract.amount ? (
                        <p className="text-xs font-bold text-primary mt-1">
                          {activeContract.amount.toLocaleString()} UZS
                        </p>
                      ) : null}
                    </div>

                    {/* Terms list */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                      {parseTerms(activeContract.terms).length > 0 ? (
                        <>
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-3">
                            {uz ? "Quyidagi shartlarni o'qib tasdiqlang:" : "Прочитайте и подтвердите условия:"}
                          </p>
                          {parseTerms(activeContract.terms).map((term, i) => (
                            <button
                              key={i}
                              onClick={() => toggleTerm(i)}
                              className="flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-left transition-all hover:bg-white/10"
                            >
                              <span className="mt-0.5 shrink-0 text-primary">
                                {checkedTerms[i]
                                  ? <CheckSquare size={16} />
                                  : <Square size={16} className="text-muted-foreground" />}
                              </span>
                              <span className={`text-xs leading-relaxed transition-colors ${checkedTerms[i] ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                                <span className="mr-1 font-black text-primary/60">{i + 1}.</span>
                                {term}
                              </span>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-xs text-muted-foreground">
                            {uz ? "Bu shartnomada maxsus shartlar yo'q." : "В этом договоре нет особых условий."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Accept button */}
                    <div className="border-t border-white/5 px-4 py-3 space-y-2">
                      {parseTerms(activeContract.terms).length > 0 && !allTermsChecked && (
                        <p className="text-center text-[11px] text-amber-500 font-bold">
                          {uz
                            ? `${checkedTerms.filter(Boolean).length}/${checkedTerms.length} shart tasdiqlangan`
                            : `Подтверждено ${checkedTerms.filter(Boolean).length}/${checkedTerms.length} условий`}
                        </p>
                      )}
                      <button
                        onClick={handleAccept}
                        disabled={!allTermsChecked || loadingId === activeContract.id}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black text-white transition-all hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check size={16} />
                        {loadingId === activeContract.id
                          ? (uz ? "Saqlanmoqda..." : "Сохраняется...")
                          : (uz ? "Tasdiqlash va qabul qilish" : "Подтвердить и принять")}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* REJECT VIEW */}
                {viewState === "reject" && activeContract && (
                  <motion.div
                    key="reject"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 py-4 space-y-3"
                  >
                    <p className="text-sm font-black">{activeContract.title}</p>
                    <p className="text-xs font-bold text-muted-foreground">{t.rejectTitle}</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t.rejectReasonPlaceholder}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReject}
                        disabled={loadingId === activeContract.id}
                        className="flex-1 rounded-xl bg-red-500/10 py-2.5 text-xs font-black text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {loadingId === activeContract.id ? t.rejecting : t.rejectConfirm}
                      </button>
                      <button
                        onClick={backToList}
                        className="flex-1 rounded-xl bg-white/5 py-2.5 text-xs font-black text-muted-foreground hover:bg-white/10 transition-colors"
                      >
                        {t.rejectCancel}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function parseTerms(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t: unknown) => typeof t === "string" && t.trim()) : [];
  } catch {
    return [];
  }
}
