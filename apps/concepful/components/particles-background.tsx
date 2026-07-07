"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Particles } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { type ISourceOptions, tsParticles } from "@tsparticles/engine";

/**
 * An ambient, animated particle network in place of a static CSS grid.
 * Connected dots slowly drifting read as a "grid" but with real depth and
 * motion — driven by tsParticles instead of hand-rolled canvas code.
 *
 * Two things that matter for embedding this inside one section of a page
 * rather than a full-page background:
 *   - `fullScreen: { enable: false }` — tsParticles defaults to attaching
 *     itself to <body> and covering the entire viewport, which is almost
 *     never what you want here.
 *   - The engine only initializes once, in an effect, and nothing renders
 *     until it's ready — this is the standard SSR-safe pattern for
 *     Next.js App Router client components.
 */
export function ParticlesBackground() {
  const [engineReady, setEngineReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    loadSlim(tsParticles).then(() => setEngineReady(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 60 },
        color: { value: "hsl(349, 90%, 54%)" },
        opacity: { value: 0.45 },
        size: { value: { min: 1, max: 2 } },
        links: {
          enable: true,
          color: "hsl(349, 90%, 54%)",
          distance: 140,
          opacity: 0.22,
          width: 1,
        },
        move: {
          // Reduced-motion users get a static, connected dot field —
          // still visually there, just not moving.
          enable: !prefersReducedMotion,
          speed: 0.3,
          direction: "none",
          outModes: { default: "out" },
        },
      },
      // Ambient only — no click/hover behavior, so it never competes with
      // the buttons and links rendered on top of it.
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
          resize: true,
        },
      },
      // Fewer particles on small screens: lighter for mobile GPUs/CPUs and
      // avoids a cluttered mesh on a narrow canvas.
      responsive: [
        {
          maxWidth: 640,
          options: { particles: { number: { value: 24 } } },
        },
      ],
    }),
    [prefersReducedMotion],
  );

  // Render nothing until the engine has loaded — avoids a layout flash and
  // keeps this safe under SSR.
  if (!engineReady) return null;

  return (
    <div className="absolute inset-0">
      <Particles id="hero-particles" options={options} />
    </div>
  );
}
