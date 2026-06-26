"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Camera, Phone, Hash, Calendar, FileText, CheckCircle2, Clock, LogOut, Pencil, X, Save } from "lucide-react";
import { useState } from "react";
import { updateProfileImage, updateProfile, logout } from "@/lib/actions";
import { Language, translations } from "@/lib/translations";

export function ProfileClient({ user, contracts, lang }: { user: any, contracts: any[], lang: Language }) {
  const t  = translations[lang].profile;
  const ct = translations[lang].dashboard;
  const uz = lang === "uz";

  const [imgUrl, setImgUrl]       = useState(user.image || "");
  const [isUpdatingImg, setUpdImg] = useState(false);
  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState(user.name || "");
  const [savedName, setSavedName] = useState(user.name || "");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const handleImageUpdate = async () => {
    const url = prompt(t.imageUrlPrompt, user.image || "");
    if (url === null) return;
    setUpdImg(true);
    const result = await updateProfileImage(url);
    setUpdImg(false);
    if (result.success) setImgUrl(url);
    else alert(result.error);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(name);
    setSaving(false);
    if (result.success) {
      setSavedName(name);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert(result.error);
    }
  };

  const handleCancel = () => {
    setName(savedName);
    setEditing(false);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-1 space-y-6">
            <div className="rounded-[40px] border border-white/10 bg-background/40 p-8 backdrop-blur-2xl shadow-2xl text-center relative overflow-hidden">

              {/* Avatar */}
              <div className="relative mx-auto mb-6 h-32 w-32">
                <div className="h-full w-full overflow-hidden rounded-3xl border-4 border-primary/20 bg-primary/5 shadow-2xl">
                  {imgUrl ? (
                    <img src={imgUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary">
                      <User size={64} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleImageUpdate}
                  disabled={isUpdatingImg}
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-60"
                >
                  <Camera size={20} />
                </button>
              </div>

              {/* Name + edit */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-black tracking-tight">{savedName}</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil size={13} />
                </button>
              </div>
              <p className="text-sm font-bold text-primary uppercase tracking-widest">{t.user}</p>

              {/* Success badge */}
              <AnimatePresence>
                {saved && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-xs font-bold text-emerald-500"
                  >
                    ✓ {t.editSuccess}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Edit form */}
              <AnimatePresence>
                {editing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 space-y-3 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                        {t.editName}
                      </label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t.editNamePlaceholder}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleSave}
                          disabled={saving || !name.trim()}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-black text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                          <Save size={14} />
                          {saving ? t.editSaving : t.editSave}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:bg-white/10"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info rows */}
              <div className="mt-8 space-y-4 text-left">
                {user.uid && (
                  <div className="flex items-center gap-4 rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <div className="shrink-0 w-4.5 text-center text-[10px] font-black text-primary leading-none">ID</div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {lang === "uz" ? "Shaxsiy ID" : "Личный ID"}
                      </p>
                      <p className="text-sm font-black tracking-wider text-primary">{user.uid}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/5">
                  <Phone size={18} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t.phone}</p>
                    <p className="text-sm font-bold">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/5">
                  <Hash size={18} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t.pinfl}</p>
                    <p className="text-sm font-bold">{user.pinfl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/5">
                  <Calendar size={18} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t.registered}</p>
                    <p className="text-sm font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-4 text-sm font-black text-red-500 transition-all hover:bg-red-500/20"
              >
                <LogOut size={18} /> {t.logout}
              </button>
            </div>
          </motion.div>

          {/* Contracts */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 space-y-6">
            <div className="rounded-[40px] border border-white/10 bg-background/40 p-8 backdrop-blur-2xl shadow-2xl min-h-[600px]">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black">{t.myContracts}</h3>
                <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-black text-primary uppercase tracking-widest">
                  {t.total}: {contracts.length}
                </span>
              </div>

              <div className="space-y-4">
                {contracts.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <FileText size={48} className="mx-auto mb-4" />
                    <p className="font-bold">{t.empty}</p>
                  </div>
                ) : (
                  contracts.map((contract) => (
                    <motion.div
                      key={contract.id}
                      whileHover={{ x: 5 }}
                      onClick={() => window.location.href = `/contracts/${contract.id}`}
                      className="group cursor-pointer flex items-center justify-between rounded-3xl border border-white/5 bg-white/5 p-6 transition-all hover:border-primary/30 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          contract.status === "SIGNED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-black group-hover:text-primary transition-colors">{contract.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs font-bold text-muted-foreground">{(contract.amount || 0).toLocaleString()} UZS</p>
                            {contract.cid && (
                              <span className="text-[10px] font-black tracking-wider text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded-md">
                                {contract.cid}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Status</p>
                          <p className={`text-xs font-black uppercase ${
                            contract.status === "ACCEPTED" || contract.status === "SIGNED" ? "text-emerald-500"
                            : contract.status === "REJECTED" ? "text-red-500"
                            : contract.status === "SENT" ? "text-blue-400"
                            : "text-amber-500"
                          }`}>
                            {contract.status === "ACCEPTED" ? (uz ? "Qabul qilindi" : "Принято")
                              : contract.status === "SIGNED"   ? ct.stats.signed
                              : contract.status === "REJECTED" ? (uz ? "Rad etildi" : "Отклонено")
                              : contract.status === "SENT"     ? (uz ? "Yuborildi"  : "Отправлено")
                              : ct.stats.pending}
                          </p>
                        </div>
                        {contract.status === "SIGNED"
                          ? <CheckCircle2 size={20} className="text-emerald-500" />
                          : <Clock size={20} className="text-amber-500" />
                        }
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
