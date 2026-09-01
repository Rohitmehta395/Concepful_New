"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export function WaveMeshBackground() {
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

    let time = 0;

    const render = () => {
      if (!ctx || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Clean, elegant topological perspective grid parameters
      const cols = 48;
      const rows = 24;
      const startX = -width * 0.1;
      const totalWidth = width * 1.2;
      const colStep = totalWidth / cols;
      const startY = height * 0.15;
      const totalDepth = height * 0.78;
      const rowStep = totalDepth / rows;

      const isDark = document.documentElement.classList.contains("dark");
      // Subtle, refined slate / indigo wireframe lines
      const strokeRgb = isDark ? "148, 163, 184" : "100, 116, 139";

      // Compute graceful, sweeping 3D perspective surface grid
      const grid: { x: number; y: number }[][] = [];

      for (let r = 0; r <= rows; r++) {
        const rowPoints: { x: number; y: number }[] = [];
        const z = r / rows; // 0 (back) to 1 (front)

        for (let c = 0; c <= cols; c++) {
          const xNorm = c / cols; // 0 to 1
          const worldX = startX + c * colStep;
          const worldY = startY + r * rowStep;

          // Calm, structured architectural wave formulas (no erratic wiggle)
          // 1. Broad undulating terrain crest on left and right
          const sideValley = Math.cos((xNorm - 0.5) * Math.PI * 2.2);
          const terrainElevation =
            Math.sin(xNorm * 3.4 + time * 0.35 + z * 1.8) * 32 * (1 + sideValley * 0.5) +
            Math.cos(xNorm * 1.8 - time * 0.2 + z * 2.4) * 20;

          // 2. Smooth perspective tapering and depth displacement
          const perspectiveFactor = 0.88 + z * 0.28;
          const screenX = width * 0.5 + (worldX - width * 0.5) * perspectiveFactor;
          const screenY = worldY + terrainElevation * (0.4 + z * 0.6) + z * z * 22;

          rowPoints.push({ x: screenX, y: screenY });
        }
        grid.push(rowPoints);
      }

      // Draw primary longitudinal contour curves (horizontal rows)
      for (let r = 0; r <= rows; r++) {
        const z = r / rows;
        const lineAlpha = (0.05 + z * 0.13) * (isDark ? 0.4 : 0.85);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${strokeRgb}, ${lineAlpha})`;
        ctx.lineWidth = 0.8 + z * 0.4;

        for (let c = 0; c <= cols; c++) {
          const pt = grid[r][c];
          if (c === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            const prev = grid[r][c - 1];
            const mx = (prev.x + pt.x) / 2;
            const my = (prev.y + pt.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
          }
        }
        ctx.stroke();
      }

      // Draw transverse cross ribs (vertical columns)
      for (let c = 0; c <= cols; c += 1) {
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) {
          const pt = grid[r][c];
          const z = r / rows;
          const lineAlpha = (0.035 + z * 0.09) * (isDark ? 0.35 : 0.75);

          ctx.strokeStyle = `rgba(${strokeRgb}, ${lineAlpha})`;
          ctx.lineWidth = 0.7 + z * 0.3;

          if (r === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            const prev = grid[r - 1][c];
            const mx = (prev.x + pt.x) / 2;
            const my = (prev.y + pt.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
          }
        }
        ctx.stroke();
      }

      if (!prefersReducedMotion) {
        time += 0.005; // Slow, majestic, steady drift
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", updateDimensions);
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
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-85 dark:opacity-30"
        style={{
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 50%, black 25%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 50%, black 25%, transparent 92%)",
        }}
      />
    </div>
  );
}
