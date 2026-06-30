"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, DollarSign, User, ShieldCheck, Download, Share2, ListChecks, Send, Phone, CreditCard, XCircle, Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptSentContract, rejectContract, sendContract } from "@/lib/actions";
import { Language, translations } from "@/lib/translations";

export function ContractClient({ contract, currentUserId, lang }: { contract: any, currentUserId?: string, lang: Language }) {
  const t = translations[lang].contracts;
  const commonT = translations[lang].dashboard;
  const st = translations[lang].send;
  const uz = lang === "uz";
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  // Send state
  const [sendPhone, setSendPhone] = useState("");
  const [sendPinfl, setSendPinfl] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendDone, setSendDone] = useState(false);
  const [sendError, setSendError] = useState("");

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const isCreator = !!(currentUserId && contract.creatorId === currentUserId);
  const isRecipient = !isCreator && !!(currentUserId && contract.recipientId === currentUserId);
  const canSend = isCreator && contract.status === "PENDING" && !contract.recipientId;
  const canSign = contract.status === "SENT" && isRecipient;

  const handleSend = async () => {
    if (!sendPhone && !sendPinfl) return;
    setSendLoading(true);
    setSendError("");
    const result = await sendContract(contract.id, sendPhone || undefined, sendPinfl || undefined);
    setSendLoading(false);
    if (result.error) {
      setSendError(result.error);
    } else {
      setSendDone(true);
    }
  };

  const terms: string[] = (() => {
    try {
      const parsed = JSON.parse(contract.terms || "[]");
      return Array.isArray(parsed) ? parsed.filter((s: string) => s.trim() !== "") : [];
    } catch {
      return [];
    }
  })();

  const [agreed, setAgreed] = useState<boolean[]>(terms.map(() => false));
  const allAgreed = terms.length === 0 || agreed.every(Boolean);

  const toggleAgreed = (i: number) => {
    const next = [...agreed];
    next[i] = !next[i];
    setAgreed(next);
  };

  const handleDownload = () => {
    const statusLabel = contract.status === "SIGNED"
      ? (lang === "uz" ? "IMZOLANGAN" : "ПОДПИСАНО")
      : (lang === "uz" ? "KUTILMOQDA" : "ОЖИДАЕТ");

    const termsHtml = terms.length > 0
      ? `<section>
          <h3>${lang === "uz" ? "Shartnoma shartlari" : "Условия договора"}</h3>
          <ol>${terms.map(term => `<li>${term}</li>`).join("")}</ol>
        </section>`
      : "";

    const recipientHtml = contract.recipient
      ? `<p><strong>${contract.recipient.name}</strong><br/>${contract.recipient.phone}</p>`
      : `<p style="color:#888;font-style:italic">${lang === "uz" ? "Hali imzolanmagan" : "Ещё не подписано"}</p>`;

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${contract.title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',serif;font-size:13pt;color:#111;background:#fff;padding:40px 60px;max-width:800px;margin:auto;word-break:break-word;overflow-wrap:break-word}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a3d2d;padding-bottom:16px;margin-bottom:24px}
    .logo{font-family:Arial,sans-serif;font-size:18pt;font-weight:900;letter-spacing:-1px;color:#1a3d2d}
    .logo span{color:#D4A537}
    .meta{text-align:right;font-size:9pt;color:#555;font-family:Arial,sans-serif}
    .status-badge{display:inline-block;background:${contract.status==="SIGNED"?"#d1fae5":"#fef3c7"};color:${contract.status==="SIGNED"?"#065f46":"#92400e"};font-family:Arial,sans-serif;font-size:8pt;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:20px;margin-top:4px}
    h1{font-size:22pt;font-weight:900;margin:20px 0 8px;line-height:1.2;word-break:break-word}
    .amount{font-size:16pt;font-weight:900;color:#1a3d2d;margin-bottom:28px}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}
    .party{border:1px solid #ccc;border-radius:8px;padding:16px;min-width:0;overflow:hidden}
    .party-label{font-family:Arial,sans-serif;font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:8px}
    section{margin:24px 0;page-break-inside:avoid}
    h3{font-family:Arial,sans-serif;font-size:9pt;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:6px}
    .content-box{background:#f9f9f9;border-radius:8px;padding:16px;font-size:12pt;line-height:1.7;white-space:pre-wrap;word-break:break-word;overflow-wrap:break-word;max-width:100%;overflow:hidden}
    ol{padding-left:20px;line-height:2}
    li{margin-bottom:4px;word-break:break-word}
    .signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px;page-break-inside:avoid}
    .sig-block{border-top:1px solid #111;padding-top:8px;font-size:9pt;color:#555}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:8pt;color:#aaa;text-align:center}
    @media print{body{padding:20px 30px}@page{margin:15mm;size:A4}}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SMART<span>SHARTNOMA</span></div>
    <div class="meta">
      ID: ${contract.id.slice(0,8).toUpperCase()}<br/>
      ${new Date(contract.createdAt).toLocaleDateString(lang === "uz" ? "uz-UZ" : "ru-RU", {day:"2-digit",month:"long",year:"numeric"})}<br/>
      <span class="status-badge">${statusLabel}</span>
    </div>
  </div>

  <h1>${contract.title}</h1>
  <div class="amount">💰 ${(contract.amount || 0).toLocaleString()} UZS</div>

  <div class="parties">
    <div class="party">
      <div class="party-label">${lang === "uz" ? "Ijrochi" : "Исполнитель"}</div>
      <p><strong>${contract.creator?.name || "—"}</strong><br/>${contract.creator?.phone || ""}</p>
    </div>
    <div class="party">
      <div class="party-label">${lang === "uz" ? "Buyurtmachi" : "Заказчик"}</div>
      ${recipientHtml}
    </div>
  </div>

  <section>
    <h3>${lang === "uz" ? "Shartnoma tavsifi" : "Описание договора"}</h3>
    <div class="content-box">${contract.content || ""}</div>
  </section>

  ${termsHtml}

  <div class="signatures">
    <div class="sig-block">${lang === "uz" ? "Ijrochi imzosi" : "Подпись исполнителя"}<br/><br/><br/>
      ${contract.creator?.name || ""}
    </div>
    <div class="sig-block">${lang === "uz" ? "Buyurtmachi imzosi" : "Подпись заказчика"}<br/><br/><br/>
      ${contract.recipient?.name || ""}
    </div>
  </div>

  <div class="footer">
    ${lang === "uz"
      ? "Ushbu shartnoma Smart-Shartnoma platformasi orqali raqamli imzolangan."
      : "Данный договор подписан в электронном виде через платформу Smart-Shartnoma."}
  </div>

  <script>window.onload=()=>{window.print()}</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;";
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 2000);
    };
  };

  const handleSign = async () => {
    if (!allAgreed) return;
    setIsLoading(true);
    const result = await acceptSentContract(contract.id);
    setIsLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success(uz ? "Shartnoma qabul qilindi!" : "Договор принят!");
      router.refresh();
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    const result = await rejectContract(contract.id, rejectReason || undefined);
    setRejectLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success(uz ? "Shartnoma rad etildi" : "Договор отклонён");
      setShowRejectModal(false);
      router.refresh();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: contract.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(uz ? "Havola nusxalandi" : "Ссылка скопирована");
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <Link href="/dashboard" className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> {t.backToDashboard}
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              title={uz ? "Ulashish" : "Поделиться"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleDownload}
              title={lang === "uz" ? "PDF yuklab olish" : "Скачать PDF"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <Download size={18} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[40px] border border-white/10 bg-background/40 backdrop-blur-2xl shadow-2xl"
        >
          {(() => {
            const s = contract.status;
            const isSigned   = s === "SIGNED";
            const isAccepted = s === "ACCEPTED";
            const isRejected = s === "REJECTED";
            const isSent     = s === "SENT";
            const bgClass = isSigned || isAccepted
              ? "bg-emerald-500/10"
              : isRejected
              ? "bg-red-500/10"
              : isSent
              ? "bg-blue-500/10"
              : "bg-amber-500/10";
            const iconBg = isSigned || isAccepted
              ? "bg-emerald-500"
              : isRejected
              ? "bg-red-500"
              : isSent
              ? "bg-blue-500"
              : "bg-amber-500";
            const textColor = isSigned || isAccepted
              ? "text-emerald-500"
              : isRejected
              ? "text-red-500"
              : isSent
              ? "text-blue-400"
              : "text-amber-500";
            const statusLabel = isSigned
              ? commonT.stats.signed
              : isAccepted
              ? st.statusAccepted
              : isRejected
              ? st.statusRejected
              : isSent
              ? st.statusSent
              : commonT.stats.pending;
            const Icon = isSigned || isAccepted ? CheckCircle2 : isRejected ? XCircle : isSent ? Send : Clock;
            return (
              <div className={`flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 md:px-12 ${bgClass}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${iconBg} ${!isSigned && !isAccepted && !isRejected ? "animate-pulse" : ""}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">{t.status}</p>
                    <p className={`text-sm font-black uppercase ${textColor}`}>{statusLabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">{t.date}</p>
                  <p className="text-sm font-black">{new Date(contract.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })()}

          <div className="p-4 sm:p-8 md:p-12">
            <div className="mb-8 sm:mb-12">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {contract.cid && (
                  <span className="text-xs font-black tracking-widest text-primary/50 uppercase">{contract.cid}</span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                  contract.type === "DOGOVOR"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  {contract.type === "DOGOVOR" ? "📋 Dogovor" : "📄 Kontrakt"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-foreground">{contract.title}</h1>
              <div className="mt-4 sm:mt-6 flex items-center gap-3 text-xl sm:text-3xl font-black text-primary">
                <DollarSign size={24} className="sm:hidden" /><DollarSign size={32} className="hidden sm:block" />
                <span>{(contract.amount || 0).toLocaleString()} UZS</span>
              </div>
            </div>

            <div className="mb-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">{t.creator}</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-black">{contract.creator?.name}</p>
                    <p className="text-sm font-medium text-muted-foreground">{contract.creator?.phone}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">{t.recipient}</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                    <User size={24} />
                  </div>
                  <div>
                    {contract.recipient ? (
                      <>
                        <p className="font-black">{contract.recipient.name}</p>
                        <p className="text-sm font-medium text-muted-foreground">{contract.recipient.phone}</p>
                      </>
                    ) : (
                      <p className="font-bold text-muted-foreground italic">{t.notSigned}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Send contract form */}
            {canSend && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-[28px] border border-blue-500/20 bg-blue-500/5 p-6"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Send size={18} className="text-blue-400" />
                  <h3 className="text-base font-black text-foreground">{st.title}</h3>
                </div>
                <p className="mb-5 text-sm font-medium text-muted-foreground">{st.desc}</p>

                {sendDone ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                    <Check size={18} />
                    <span className="text-sm font-black">{st.sentSuccess}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                        {st.phoneLabel}
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <Phone size={15} className="shrink-0 text-muted-foreground/40" />
                        <input
                          type="tel"
                          value={sendPhone}
                          onChange={(e) => { setSendPhone(e.target.value); setSendPinfl(""); }}
                          placeholder={st.phonePlaceholder}
                          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 border-t border-white/10" />
                      <span className="shrink-0 text-xs font-black uppercase text-muted-foreground/40">{st.orDivider}</span>
                      <div className="flex-1 border-t border-white/10" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                        {st.pinflLabel}
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <CreditCard size={15} className="shrink-0 text-muted-foreground/40" />
                        <input
                          type="text"
                          value={sendPinfl}
                          onChange={(e) => { setSendPinfl(e.target.value); setSendPhone(""); }}
                          placeholder={st.pinflPlaceholder}
                          maxLength={14}
                          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    {sendError && (
                      <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-500">{sendError}</p>
                    )}

                    <button
                      onClick={handleSend}
                      disabled={sendLoading || (!sendPhone && !sendPinfl)}
                      className="w-full rounded-2xl bg-blue-500/10 py-3.5 text-sm font-black text-blue-400 transition-all hover:bg-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sendLoading ? st.sending : st.sendButton}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* SENT / ACCEPTED / REJECTED status info */}
            {(contract.status === "SENT" || contract.status === "ACCEPTED" || contract.status === "REJECTED") && contract.recipient && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 rounded-[28px] p-5 border ${
                  contract.status === "ACCEPTED"
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : contract.status === "REJECTED"
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-blue-500/20 bg-blue-500/5"
                }`}
              >
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-muted-foreground">
                    <span className="font-black text-foreground">{st.sentTo}</span>{" "}
                    {contract.recipient.name || contract.recipient.phone}
                  </p>
                  {contract.status === "ACCEPTED" && contract.acceptedAt && (
                    <p className="font-medium text-muted-foreground">
                      <span className="font-black text-emerald-500">{st.acceptedAt}</span>{" "}
                      {new Date(contract.acceptedAt).toLocaleString()}
                    </p>
                  )}
                  {contract.status === "REJECTED" && contract.rejectedAt && (
                    <p className="font-medium text-muted-foreground">
                      <span className="font-black text-red-500">{st.rejectedAt}</span>{" "}
                      {new Date(contract.rejectedAt).toLocaleString()}
                    </p>
                  )}
                  {contract.status === "REJECTED" && contract.rejectionReason && (
                    <p className="font-medium text-muted-foreground">
                      <span className="font-black text-foreground">{st.rejectionReason}</span>{" "}
                      {contract.rejectionReason}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <div className="mb-12">
              <p className="mb-6 text-xs font-black uppercase tracking-widest text-muted-foreground/60">{t.contentLabel}</p>
              <div className="rounded-3xl border border-white/5 bg-white/5 p-4 sm:p-8">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/80 font-medium">
                  {contract.content}
                </p>
              </div>
            </div>

            {terms.length > 0 && (
              <div className="mb-12">
                <div className="mb-6 flex items-center gap-2">
                  <ListChecks size={16} className="text-primary" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{t.termsLabel}</p>
                </div>
                <div className="space-y-3">
                  {terms.map((term, i) => {
                    const isChecked = agreed[i];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`flex items-start gap-4 rounded-2xl border p-5 transition-all ${
                          isChecked
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-white/5 bg-white/5"
                        } ${canSign ? "cursor-pointer hover:bg-white/10" : ""}`}
                        onClick={() => canSign && toggleAgreed(i)}
                      >
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isChecked
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-white/20 bg-white/5"
                        }`}>
                          {isChecked && <CheckCircle2 size={14} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-foreground/80">{term}</span>
                            {contract.status !== "SIGNED" && canSign && (
                              <span className={`shrink-0 text-xs font-black uppercase tracking-widest ${
                                isChecked ? "text-emerald-500" : "text-muted-foreground/40"
                              }`}>
                                {isChecked ? "✓ " + t.termAgreed : t.termAgreed}
                              </span>
                            )}
                            {contract.status === "SIGNED" && (
                              <span className="shrink-0 text-xs font-black uppercase tracking-widest text-emerald-500">
                                ✓ {t.termAgreed}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {canSign && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 sm:mt-12 rounded-3xl bg-primary/5 p-5 sm:p-8 text-center border border-primary/20"
              >
                <ShieldCheck size={40} className="mx-auto mb-3 text-primary" />
                <h3 className="text-xl sm:text-2xl font-black mb-2">{t.signTitle}</h3>
                <p className="mb-2 text-sm sm:text-base text-muted-foreground font-medium">{t.signDesc}</p>
                {terms.length > 0 && !allAgreed && (
                  <p className="mb-4 sm:mb-6 text-sm font-bold text-amber-500">{t.mustAgreeAll}</p>
                )}
                {(terms.length === 0 || allAgreed) && <div className="mb-4 sm:mb-6" />}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleSign}
                    disabled={isLoading || !allAgreed}
                    className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 sm:px-12 py-4 text-base font-black text-white shadow-xl transition-all hover:scale-105 hover:shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? t.signing : t.signButton}
                      <CheckCircle2 size={20} />
                    </span>
                    <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-8 py-4 text-base font-black text-red-500 transition-all hover:bg-red-500/20 active:scale-95"
                  >
                    <XCircle size={18} />
                    {uz ? "Rad etish" : "Отклонить"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Reject modal */}
            <AnimatePresence>
              {showRejectModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setShowRejectModal(false); }}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 16 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 16 }}
                    className="w-full max-w-md rounded-3xl border border-white/10 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-foreground">
                        {uz ? "Shartnomani rad etish" : "Отклонить договор"}
                      </h3>
                      <button
                        onClick={() => setShowRejectModal(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {uz ? "Rad etish sababini kiriting (ixtiyoriy):" : "Укажите причину отклонения (необязательно):"}
                    </p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={uz ? "Masalan: Shartlar menga mos kelmadi..." : "Например: Условия мне не подходят..."}
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleReject}
                        disabled={rejectLoading}
                        className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-black text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-50"
                      >
                        {rejectLoading
                          ? (uz ? "Saqlanmoqda..." : "Сохраняется...")
                          : (uz ? "Rad etishni tasdiqlash" : "Подтвердить отклонение")}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(false)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-muted-foreground hover:bg-white/10 transition-colors"
                      >
                        {uz ? "Bekor" : "Отмена"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {contract.status === "SIGNED" && (
              <div className="mt-12 flex flex-col items-center gap-4 text-center opacity-40">
                <ShieldCheck size={32} className="text-emerald-500" />
                <p className="text-sm font-black uppercase tracking-widest">
                  {t.legalFootnote}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
