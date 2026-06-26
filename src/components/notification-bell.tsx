"use client";

import { useState } from "react";
import { Bell, X, Check, Eye, XCircle, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { acceptSentContract, rejectContract } from "@/lib/actions";
import { Language, translations } from "@/lib/translations";

type PendingContract = {
  id: string;
  cid: string | null;
  title: string;
  amount: number | null;
  sentAt: Date | null;
  creator: { id: string; name: string | null; phone: string };
};

export function NotificationBell({
  pendingContracts,
  lang,
}: {
  pendingContracts: PendingContract[];
  lang: Language;
}) {
  const t = translations[lang].notifications;
  const [open, setOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const count = pendingContracts.length;

  const handleAccept = async (contractId: string) => {
    setLoadingId(contractId);
    const result = await acceptSentContract(contractId);
    setLoadingId(null);
    if (result.error) alert(result.error);
  };

  const handleReject = async (contractId: string) => {
    setLoadingId(contractId);
    const result = await rejectContract(contractId, rejectReason || undefined);
    setLoadingId(null);
    if (result.error) {
      alert(result.error);
    } else {
      setRejectingId(null);
      setRejectReason("");
    }
  };

  if (count === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
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
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-[340px] md:w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  <span className="text-sm font-black text-foreground">{t.title}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                    {count}
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Contract list */}
              <div className="max-h-[420px] overflow-y-auto">
                {pendingContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="border-b border-white/5 px-4 py-4 last:border-0"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <FileText size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground truncate">{contract.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {contract.creator.name || contract.creator.phone}
                        </p>
                        {contract.amount ? (
                          <p className="text-xs font-bold text-primary mt-0.5">
                            {contract.amount.toLocaleString()} UZS
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Reject reason input */}
                    {rejectingId === contract.id ? (
                      <div className="mb-2 space-y-2">
                        <p className="text-xs font-bold text-muted-foreground">{t.rejectTitle}</p>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={t.rejectReasonPlaceholder}
                          rows={2}
                          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(contract.id)}
                            disabled={loadingId === contract.id}
                            className="flex-1 rounded-xl bg-red-500/10 py-2 text-xs font-black text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {loadingId === contract.id ? t.rejecting : t.rejectConfirm}
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(""); }}
                            className="flex-1 rounded-xl bg-white/5 py-2 text-xs font-black text-muted-foreground hover:bg-white/10 transition-colors"
                          >
                            {t.rejectCancel}
                          </button>
                        </div>
                      </div>
                    ) : (
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
                          onClick={() => handleAccept(contract.id)}
                          disabled={loadingId === contract.id}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500/10 py-2 text-xs font-black text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          <Check size={12} />
                          {loadingId === contract.id ? t.accepting : t.accept}
                        </button>
                        <button
                          onClick={() => setRejectingId(contract.id)}
                          disabled={loadingId === contract.id}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-500/10 py-2 text-xs font-black text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          {t.reject}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
