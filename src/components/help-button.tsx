"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mail, Phone } from "lucide-react";

const SUPPORT_TELEGRAM = "https://t.me/SmartShartnoma_bot";
const SUPPORT_EMAIL    = "mailto:support@smart-shartnoma.uz";
const SUPPORT_PHONE    = "tel:+998901234567";

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mb-1 w-64 overflow-hidden rounded-2xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="border-b border-white/10 bg-primary/10 px-4 py-3">
              <p className="text-sm font-black text-foreground">Yordam kerakmi?</p>
              <p className="text-xs text-muted-foreground">Biz siz bilan bog'lanamiz</p>
            </div>

            {/* Links */}
            <div className="divide-y divide-white/5">
              <a
                href={SUPPORT_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Send size={15} />
                </div>
                <div>
                  <p className="font-black text-foreground text-xs">Telegram bot</p>
                  <p className="text-[10px] text-muted-foreground">@SmartShartnoma_bot</p>
                </div>
              </a>

              <a
                href={SUPPORT_EMAIL}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail size={15} />
                </div>
                <div>
                  <p className="font-black text-foreground text-xs">Email</p>
                  <p className="text-[10px] text-muted-foreground">support@smart-shartnoma.uz</p>
                </div>
              </a>

              <a
                href={SUPPORT_PHONE}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Phone size={15} />
                </div>
                <div>
                  <p className="font-black text-foreground text-xs">Telefon</p>
                  <p className="text-[10px] text-muted-foreground">+998 90 123 45 67</p>
                </div>
              </a>
            </div>

            <div className="px-4 py-3 text-[10px] text-muted-foreground/60 text-center border-t border-white/5">
              Ish vaqti: Du–Ju 09:00–18:00
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.08 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/40 transition-colors hover:bg-primary/90"
        aria-label="Yordam"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        )}
      </motion.button>
    </div>
  );
}
