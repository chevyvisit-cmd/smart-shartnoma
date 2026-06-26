"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const COLORS = {
  emerald: "#2D6A4F",
  darkEmerald: "#1A3D2D",
  gold: "#D4A537",
};

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, active: false };

    const config = {
      connectionDistance: 130,
      mouseRadius: 200,
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      layer: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.layer = Math.floor(Math.random() * 3);

        const speed = [0.15, 0.3, 0.45][this.layer];
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.size = [0.8, 1.4, 2.2][this.layer];

        const r = Math.random();
        this.color = r > 0.1 ? COLORS.emerald : COLORS.gold;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas!.width;
        if (this.x > canvas!.width) this.x = 0;
        if (this.y < 0) this.y = canvas!.height;
        if (this.y > canvas!.height) this.y = 0;

        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.mouseRadius) {
            const force = (config.mouseRadius - distance) / config.mouseRadius;
            this.x += dx * force * 0.03;
            this.y += dy * force * 0.03;
          }
        }
      }

      draw() {
        if (!ctx) return;
        const isDark = resolvedTheme === "dark";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        if (isDark) {
          ctx.shadowBlur = this.size * 1;
          ctx.shadowColor = this.color;
        }

        ctx.fillStyle = this.color;
        ctx.globalAlpha = isDark
          ? [0.2, 0.35, 0.5][this.layer]
          : [0.3, 0.45, 0.6][this.layer];
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const density = window.innerWidth < 768 ? 9000 : 7000;
      const count = Math.floor((canvas.width * canvas.height) / density);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = resolvedTheme === "dark";

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (Math.abs(p1.layer - p2.layer) > 1) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            let opacity = 1 - distance / config.connectionDistance;

            if (mouse.active) {
              const mdx = (p1.x + p2.x) / 2 - mouse.x;
              const mdy = (p1.y + p2.y) / 2 - mouse.y;
              const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
              if (mDist < 100) opacity *= 1.6;
            }

            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, p1.color);
            gradient.addColorStop(1, p2.color);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = isDark ? 0.5 : 0.7;
            ctx.globalAlpha = isDark ? opacity * 0.15 : opacity * 0.22;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => init();
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => { mouse.active = false; };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, resolvedTheme]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        background: "transparent",
        filter: resolvedTheme === "dark" ? "none" : "contrast(1.05) saturate(1.1)"
      }}
    />
  );
}
