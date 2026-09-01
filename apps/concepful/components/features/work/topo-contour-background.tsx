"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export function TopoContourBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Mouse tracking for subtle ambient parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let time = 0;

    const render = () => {
      if (!ctx || width === 0 || height === 0) return;

      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const baseStrokeRgb = isDark ? "148, 163, 184" : "100, 116, 139";
      const primaryRgb = isDark ? "244, 63, 94" : "225, 29, 72";

      // 18 elegant nested topographic elevation contour rings
      const contourLevels = 18;
      const numPoints = 120;
      const centerX = width * 0.5 + (mouseX - width * 0.5) * 0.08;
      const centerY = height * 0.52 + (mouseY - height * 0.52) * 0.08;
      const maxRadius = Math.max(width, height) * 0.85;

      for (let level = 1; level <= contourLevels; level++) {
        const levelNorm = level / contourLevels; // 0 to 1
        const radius = (level / contourLevels) * maxRadius;

        // Determine line styling
        const isAccentRing = level === 7 || level === 14;
        const isMajorRing = level % 4 === 0;

        ctx.beginPath();

        if (isAccentRing) {
          ctx.strokeStyle = `rgba(${primaryRgb}, ${isDark ? 0.35 : 0.22})`;
          ctx.lineWidth = 1.2;
        } else if (isMajorRing) {
          ctx.strokeStyle = `rgba(${baseStrokeRgb}, ${isDark ? 0.25 : 0.16})`;
          ctx.lineWidth = 1.0;
        } else {
          ctx.strokeStyle = `rgba(${baseStrokeRgb}, ${isDark ? 0.14 : 0.08})`;
          ctx.lineWidth = 0.75;
        }

        const points: { x: number; y: number }[] = [];

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;

          // Multi-frequency harmonic topological deformations
          const harmonic1 =
            Math.sin(angle * 3 + time * 0.4 + level * 0.35) * 35;
          const harmonic2 =
            Math.cos(angle * 5 - time * 0.25 + level * 0.5) * 18;
          const harmonic3 =
            Math.sin(angle * 2 + Math.cos(angle * 4) + time * 0.15) *
            24 *
            levelNorm;

          // Asymmetrical organic ridge shaping
          const ridgeDistortion =
            Math.sin(angle * 1.5 + level * 0.2) * (20 + level * 3);

          const r = radius + harmonic1 + harmonic2 + harmonic3 + ridgeDistortion;
          const x = centerX + Math.cos(angle) * r * 1.35; // Oval / panoramic expansion
          const y = centerY + Math.sin(angle) * r * 0.75;

          points.push({ x, y });
        }

        // Draw closed smooth spline
        if (points.length > 0) {
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const mx = (prev.x + curr.x) / 2;
            const my = (prev.y + curr.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Subtle architectural crosshair accents along the perimeter
      const crosshairs = [
        { x: width * 0.12, y: height * 0.28 },
        { x: width * 0.88, y: height * 0.28 },
        { x: width * 0.16, y: height * 0.78 },
        { x: width * 0.84, y: height * 0.78 },
      ];

      ctx.strokeStyle = `rgba(${baseStrokeRgb}, ${isDark ? 0.3 : 0.18})`;
      ctx.lineWidth = 1;
      const crossSize = 5;

      for (const ch of crosshairs) {
        ctx.beginPath();
        ctx.moveTo(ch.x - crossSize, ch.y);
        ctx.lineTo(ch.x + crossSize, ch.y);
        ctx.moveTo(ch.x, ch.y - crossSize);
        ctx.lineTo(ch.x, ch.y + crossSize);
        ctx.stroke();
      }

      if (!prefersReducedMotion) {
        time += 0.004; // Calm, meditative drift
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Studio lighting auras */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 h-[480px] w-[720px] rounded-full opacity-60 dark:opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(225, 29, 72, 0.08) 0%, rgba(59, 130, 246, 0.04) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-0 right-[10%] h-[360px] w-[420px] rounded-full opacity-50 dark:opacity-15"
        style={{
          background:
            "radial-gradient(circle at center, rgba(225, 29, 72, 0.06) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />

      {/* Topographic Contour Canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-90 dark:opacity-40"
        style={{
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 50%, black 25%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 70% at 50% 50%, black 25%, transparent 90%)",
        }}
      />
    </div>
  );
}
