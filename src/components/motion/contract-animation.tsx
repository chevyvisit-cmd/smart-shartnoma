"use client";

import { useEffect, useRef } from "react";

interface ContractDoc {
  x: number; y: number;
  w: number; h: number;
  angle: number; vx: number; vy: number; va: number;
  opacity: number;
  lineCount: number;
  lineLengths: number[];
  signPhase: number; signSpeed: number;
  stampPhase: number; stampSpeed: number;
  hasStamp: boolean;
  layer: number;
}

const PRIMARY = "45,106,79";
const GOLD    = "212,165,55";

export function ContractAnimation() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let docs: ContractDoc[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      spawnDocs();
    };

    const makeDoc = (startY?: number): ContractDoc => {
      const w = 70 + Math.random() * 70;
      const layer = Math.floor(Math.random() * 3);
      const speed = [0.12, 0.22, 0.38][layer];
      const lineCount = 5 + Math.floor(Math.random() * 5);
      return {
        x: Math.random() * canvas.width,
        y: startY ?? canvas.height + 60 + Math.random() * 200,
        w, h: w * 1.41,
        angle: (Math.random() - 0.5) * 0.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -speed,
        va: (Math.random() - 0.5) * 0.0008,
        opacity: [0.05, 0.1, 0.18][layer],
        lineCount,
        lineLengths: Array.from({ length: lineCount }, () => 0.35 + Math.random() * 0.55),
        signPhase: Math.random() * Math.PI * 2,
        signSpeed: 0.006 + Math.random() * 0.006,
        stampPhase: Math.random() * Math.PI * 2,
        stampSpeed: 0.004 + Math.random() * 0.003,
        hasStamp: Math.random() > 0.4,
        layer,
      };
    };

    const spawnDocs = () => {
      const count = Math.max(6, Math.floor((canvas.width * canvas.height) / 80000));
      docs = Array.from({ length: count }, () => makeDoc(Math.random() * canvas.height));
    };

    const drawDoc = (d: ContractDoc) => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.angle);

      const rx = -d.w / 2, ry = -d.h / 2;
      const fold = d.w * 0.18;

      /* ── paper body ── */
      ctx.globalAlpha = d.opacity;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + d.w - fold, ry);
      ctx.lineTo(rx + d.w, ry + fold);
      ctx.lineTo(rx + d.w, ry + d.h);
      ctx.lineTo(rx, ry + d.h);
      ctx.closePath();
      ctx.fillStyle = `rgba(${PRIMARY},0.07)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${PRIMARY},0.7)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      /* ── fold corner ── */
      ctx.beginPath();
      ctx.moveTo(rx + d.w - fold, ry);
      ctx.lineTo(rx + d.w - fold, ry + fold);
      ctx.lineTo(rx + d.w, ry + fold);
      ctx.strokeStyle = `rgba(${PRIMARY},0.4)`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      /* ── text lines ── */
      const pad = d.w * 0.12;
      const maxW = d.w - pad * 2;
      const lineH = (d.h * 0.55) / d.lineCount;
      const lineY0 = ry + d.h * 0.12;

      for (let i = 0; i < d.lineCount; i++) {
        const progress = ((Math.sin(t * 0.007 + d.signPhase + i * 0.4) + 1) / 2);
        const lw = maxW * d.lineLengths[i] * progress;
        ctx.globalAlpha = d.opacity * (0.5 + progress * 0.5);
        ctx.beginPath();
        ctx.moveTo(rx + pad, lineY0 + i * lineH);
        ctx.lineTo(rx + pad + lw, lineY0 + i * lineH);
        ctx.strokeStyle = `rgba(${PRIMARY},1)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      /* ── signature ── */
      const signP = (Math.sin(t * d.signSpeed + d.signPhase) + 1) / 2;
      if (signP > 0.05) {
        const sx = rx + pad;
        const sy = ry + d.h * 0.78;
        const sw = maxW * 0.5 * signP;

        ctx.globalAlpha = d.opacity * signP * 1.4;
        ctx.strokeStyle = `rgba(${GOLD},1)`;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(
          sx + sw * 0.3, sy - sw * 0.25,
          sx + sw * 0.55, sy + sw * 0.2,
          sx + sw * 0.7, sy - sw * 0.1,
        );
        ctx.bezierCurveTo(
          sx + sw * 0.82, sy - sw * 0.25,
          sx + sw * 0.92, sy + sw * 0.15,
          sx + sw, sy,
        );
        ctx.stroke();

        /* underline */
        ctx.globalAlpha = d.opacity * signP * 0.7;
        ctx.beginPath();
        ctx.moveTo(sx, sy + 5);
        ctx.lineTo(sx + sw, sy + 5);
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      /* ── stamp ── */
      if (d.hasStamp) {
        const stampP = (Math.sin(t * d.stampSpeed + d.stampPhase) + 1) / 2;
        const cx = rx + d.w - pad - 14;
        const cy = ry + d.h - pad - 14;
        const r = 13;

        ctx.globalAlpha = d.opacity * stampP * 1.2;
        ctx.strokeStyle = `rgba(${GOLD},1)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
        ctx.globalAlpha = d.opacity * stampP * 0.6;
        ctx.stroke();

        /* star-like center */
        ctx.globalAlpha = d.opacity * stampP * 0.8;
        ctx.fillStyle = `rgba(${GOLD},0.5)`;
        for (let a = 0; a < 5; a++) {
          const ang = (a / 5) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(ang) * r * 0.35;
          const py = cy + Math.sin(ang) * r * 0.35;
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < docs.length; i++) {
        const d = docs[i];
        d.x += d.vx;
        d.y += d.vy;
        d.angle += d.va;

        if (d.y < -d.h - 40) {
          docs[i] = makeDoc();
        }
        if (d.x < -d.w - 40) d.x = canvas.width + d.w;
        if (d.x > canvas.width + d.w + 40) d.x = -d.w;

        drawDoc(d);
      }

      animId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}
