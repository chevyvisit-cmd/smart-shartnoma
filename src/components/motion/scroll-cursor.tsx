"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function ScrollCursor() {
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const x = useSpring(mouseX, { damping: 22, stiffness: 350, mass: 0.4 });
  const y = useSpring(mouseY, { damping: 22, stiffness: 350, mass: 0.4 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setVisible(!!el?.closest("[data-scroll-cursor]"));
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999] top-0 left-0"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex h-[72px] w-[72px] flex-col items-center justify-center gap-0.5 rounded-full border border-primary/50 bg-black/70 backdrop-blur-md shadow-lg shadow-black/40">
        {/* Up arrow */}
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none" className="text-primary/80">
          <path d="M1 6L5 2L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <span className="text-[7.5px] font-black tracking-[0.22em] text-primary uppercase leading-none">
          scroll
        </span>

        {/* Down arrow */}
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none" className="text-primary/80">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.div>
  );
}
