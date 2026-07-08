"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Sparkles, Star, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import heroBg from "@/assets/hero-background.webp";

export function HeroFloatingComposition() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="img"
      aria-label="A creative request being submitted to Concepful, surrounded by stats showing conversion growth, delivered assets, 24-hour turnaround, team size, and client rating."
      className="relative w-full max-w-[600px] lg:max-w-none"
    >
      {/* Background image with faded edges */}
      <Image
        src={heroBg}
        alt=""
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] min-h-[1000px] h-[180%] max-h-[1200px] pointer-events-none -z-20 object-cover opacity-25 mix-blend-luminosity [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
        priority
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-x-12 inset-y-12 -z-10 rounded-full bg-primary/20 blur-[80px]"
      />

      {/* ── Desktop: positioned composition ── */}
      <div className="relative hidden lg:block" style={{ height: 480 }}>

        {/* Center card — slightly left of center to pull toward left column */}
        <div className="absolute left-1/2 top-1/2 z-10 w-[340px] -translate-x-[55%] -translate-y-1/2">
          <Float delay={0} prefersReducedMotion={prefersReducedMotion}>
            <CenterRequestCard />
          </Float>
        </div>

        {/* Top-left */}
        <div className="absolute -left-2 -top-4 z-20 w-[170px] -rotate-6">
          <Float delay={0.4} prefersReducedMotion={prefersReducedMotion}>
            <ConversionStatCard />
          </Float>
        </div>

        {/* Top-right */}
        <div className="absolute -right-4 top-8 z-20 w-[178px] rotate-3">
          <Float delay={0.8} prefersReducedMotion={prefersReducedMotion}>
            <DeliverablesCard />
          </Float>
        </div>

        {/* Mid-left */}
        <div className="absolute -left-15 top-[210px] z-20 w-[162px] rotate-2">
          <Float delay={1.0} prefersReducedMotion={prefersReducedMotion}>
            <TeamCard />
          </Float>
        </div>

        {/* Mid-right */}
        <div className="absolute right-2 top-[200px] z-20 w-[158px] -rotate-3">
          <Float delay={1.4} prefersReducedMotion={prefersReducedMotion}>
            <RatingCard />
          </Float>
        </div>

        {/* Bottom-left */}
        <div className="absolute -bottom-14 left-4 z-20 w-[168px] -rotate-3">
          <Float delay={1.2} prefersReducedMotion={prefersReducedMotion}>
            <TurnaroundCard />
          </Float>
        </div>

        {/* Bottom-right */}
        <div className="absolute bottom-2 right-2 z-20 w-[162px] -rotate-6">
          <Float delay={1.6} prefersReducedMotion={prefersReducedMotion}>
            <SatisfactionCard />
          </Float>
        </div>
      </div>

      {/* ── Mobile / small tablet: simplified stacked layout ── */}
      <div className="flex flex-col items-center gap-6 lg:hidden">
        <div className="w-full max-w-[320px]">
          <CenterRequestCard />
        </div>
        <div className="grid w-full max-w-[420px] grid-cols-2 gap-3">
          <ConversionStatCard />
          <DeliverablesCard />
          <TeamCard />
          <RatingCard />
          <TurnaroundCard />
          <SatisfactionCard />
        </div>
      </div>
    </div>
  );
}

/* ── Float ─────────────────────────────────────────────────────────────── */

function Float({
  delay,
  prefersReducedMotion,
  children,
}: {
  delay: number;
  prefersReducedMotion: boolean | null;
  children: React.ReactNode;
}) {
  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Center card ─────────────────────────────────────────────────────── */

function CenterRequestCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white text-left shadow-2xl shadow-black/25 ring-1 ring-black/5">
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-xs font-semibold text-neutral-400">
          New Request
        </span>
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>

      <div className="flex flex-col items-center px-7 pb-6 pt-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-lg font-bold text-white shadow-lg shadow-primary/30">
          C
        </span>
        <p className="mt-4 text-base font-semibold text-neutral-900">
          What do you need?
        </p>
      </div>

      <div className="mx-6 mb-5 rounded-xl bg-neutral-50 p-4 text-left text-sm leading-relaxed text-neutral-600">
        Redesign our landing page — clean, modern, and conversion focused.
      </div>

      <div className="mx-6 mb-6 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3">
        <span className="flex-1 truncate text-sm text-neutral-400">
          Ask your creative team for anything…
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

/* ── Satellite cards ─────────────────────────────────────────────────── */

function SatelliteShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white p-3.5 text-left shadow-2xl shadow-black/20 ring-1 ring-black/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ConversionStatCard() {
  return (
    <SatelliteShell>
      <p className="text-[11px] font-medium text-neutral-400">
        More Conversions
      </p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <span className="text-xl font-bold text-emerald-500">+120%</span>
        <svg
          width="56"
          height="22"
          viewBox="0 0 56 22"
          fill="none"
          aria-hidden="true"
          className="text-emerald-500"
        >
          <path
            d="M2 20 L12 14 L22 16 L32 7 L42 9 L54 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </SatelliteShell>
  );
}

function DeliverablesCard() {
  return (
    <SatelliteShell>
      <p className="text-[11px] font-medium text-neutral-400">Delivered</p>
      <div className="mt-2 flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-white">
          Brand Guidelines
        </span>
        <span className="inline-flex w-fit items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
          Social Kit
        </span>
      </div>
    </SatelliteShell>
  );
}

function TeamCard() {
  return (
    <SatelliteShell>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
        <Users className="h-3 w-3 text-primary" aria-hidden="true" />
        Your Pod
      </div>
      <p className="mt-1 text-lg font-bold text-neutral-900">5 Specialists</p>
      <div className="mt-2 flex -space-x-1.5" aria-hidden="true">
        {["bg-blue-400", "bg-purple-400", "bg-amber-400", "bg-emerald-400"].map(
          (c, i) => (
            <span
              key={i}
              className={cn("h-5 w-5 rounded-full border-2 border-white", c)}
            />
          ),
        )}
      </div>
    </SatelliteShell>
  );
}

function RatingCard() {
  return (
    <SatelliteShell>
      <p className="text-[11px] font-medium text-neutral-400">Average Rating</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-xl font-bold text-neutral-900">5.0</span>
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
    </SatelliteShell>
  );
}

function TurnaroundCard() {
  return (
    <SatelliteShell>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
        <Zap className="h-3 w-3 text-primary" aria-hidden="true" />
        Ready to Start
      </div>
      <p className="mt-1 text-xl font-bold text-neutral-900">24 hrs</p>
      <div className="mt-2 flex -space-x-1.5" aria-hidden="true">
        {["bg-blue-400", "bg-purple-400", "bg-amber-400"].map((c, i) => (
          <span
            key={i}
            className={cn("h-5 w-5 rounded-full border-2 border-white", c)}
          />
        ))}
      </div>
    </SatelliteShell>
  );
}

function SatisfactionCard() {
  const pct = 98;
  const circumference = 2 * Math.PI * 16;
  const dash = (pct / 100) * circumference;

  return (
    <SatelliteShell className="flex items-center gap-3">
      <svg
        width="44"
        height="44"
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="shrink-0 -rotate-90"
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-neutral-100"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="text-primary"
        />
      </svg>
      <div>
        <p className="text-lg font-bold text-neutral-900">{pct}%</p>
        <p className="text-[10px] font-medium leading-tight text-neutral-400">
          Client
          <br />
          Satisfaction
        </p>
      </div>
    </SatelliteShell>
  );
}
