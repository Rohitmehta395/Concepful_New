"use client";

import { ParticlesBackground } from "@/components/particles-background";

/**
 * Layered decorative background for the hero + workflow section:
 *   1. the existing soft primary-colored glow behind the headline
 *   2. an animated tsParticles network (connected, drifting dots) faded
 *      toward the edges via a radial mask — reads as a grid, but with
 *      real depth and motion instead of static lines
 *   3. a few large, very soft blurred glow shapes trailing down the section,
 *      loosely aligned behind the workflow row for continued depth as you
 *      scroll past the headline
 *
 * Layers 1 and 3 are static CSS (gradients + blur) and cost nothing at
 * runtime. Layer 2 is the one piece of canvas/JS here — see
 * particles-background.tsx for the reduced-motion and mobile-perf handling.
 */
export function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Primary glow behind the headline (unchanged from before) */}
      <div
        className="absolute inset-x-0 top-0 h-[640px]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(349, 90%, 54%, 0.35) 0%, transparent 60%)",
        }}
      />

      {/* 2. Animated particle network (tsParticles), faded toward the edges.
          Replaces the old static CSS grid — the connected, drifting dots
          read as a "grid" but with real depth and motion, and the colors
          are visibly brighter than the previous line-grid was. */}
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 22%, black 25%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 22%, black 25%, transparent 70%)",
        }}
      >
        <ParticlesBackground />
      </div>

      {/* 3. Soft glow shapes trailing down behind the workflow row */}
      <div className="absolute left-[6%] top-[58%] h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
      <div className="absolute right-[8%] top-[72%] h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute left-1/2 top-[88%] h-64 w-64 -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[100px]" />
    </div>
  );
}
