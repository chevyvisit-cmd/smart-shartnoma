"use client";

import React, { useEffect, useRef } from "react";

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const orbs = [
      { sx: 0.25, sy: 0.2, ex: 0.75, ey: 0.5, phase: 0,    speed: 0.00035, r: 0.65, color: "45,106,79",   a: 0.09 },
      { sx: 0.8,  sy: 0.6, ex: 0.2,  ey: 0.3, phase: 1.5,  speed: 0.00028, r: 0.55, color: "212,165,55", a: 0.07 },
      { sx: 0.5,  sy: 0.9, ex: 0.5,  ey: 0.1, phase: 3.0,  speed: 0.00042, r: 0.5,  color: "45,106,79",   a: 0.06 },
      { sx: 0.1,  sy: 0.5, ex: 0.9,  ey: 0.8, phase: 4.5,  speed: 0.00032, r: 0.45, color: "212,165,55", a: 0.05 },
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const orb of orbs) {
        const angle = t * orb.speed * Math.PI * 2 + orb.phase;
        const progress = (Math.sin(angle) + 1) / 2;

        const x = (orb.sx + (orb.ex - orb.sx) * progress) * canvas.width;
        const y = (orb.sy + (orb.ey - orb.sy) * Math.cos(angle * 0.7 + orb.phase)) * canvas.height;
        const size = orb.r * Math.min(canvas.width, canvas.height);

        const grd = ctx.createRadialGradient(x, y, 0, x, y, size);
        grd.addColorStop(0,   `rgba(${orb.color},${orb.a})`);
        grd.addColorStop(0.4, `rgba(${orb.color},${orb.a * 0.45})`);
        grd.addColorStop(1,   `rgba(${orb.color},0)`);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
    />
  );
}
