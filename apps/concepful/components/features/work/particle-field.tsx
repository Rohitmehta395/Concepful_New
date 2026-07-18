"use client";

import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  /** Accent colors pulled from the work — particles are tinted from these. */
  colors: string[];
  /** Skip animation and heavy rendering for reduced-motion users. */
  shouldReduceMotion?: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  /** phase offset for the subtle twinkle */
  phase: number;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const parsed = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(parsed))
    return { r: 120, g: 120, b: 130 };
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

export function ParticleField({
  colors,
  shouldReduceMotion = false,
  className,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = (colors.length ? colors : ["#6366F1", "#F97316"]).map(
      hexToRgb,
    );

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let t = 0;

    const pick = () => palette[Math.floor(Math.random() * palette.length)];

    const build = () => {
      // Density scales with area but stays modest — "cool, not so much".
      const count = Math.min(
        64,
        Math.max(24, Math.round((width * height) / 26000)),
      );
      particles = Array.from({ length: count }, () => {
        const { r, g, b } = pick();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.6 + 0.6,
          color: `${r}, ${g}, ${b}`,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 130;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!shouldReduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          // wrap around the edges for a seamless drift
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        // faint connecting lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.14;
            ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        const twinkle = shouldReduceMotion
          ? 0.5
          : 0.45 + Math.sin(t * 0.02 + p.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${twinkle})`;
        ctx.fill();
      }
    };

    const loop = () => {
      t += 1;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (shouldReduceMotion) {
      draw();
    } else {
      loop();
    }

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [colors, shouldReduceMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
