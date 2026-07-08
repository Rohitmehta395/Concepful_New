"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroFloatingComposition } from "@/components/hero-floating-composition";
import { HeroBackground } from "@/components/hero-background";
import { JSX, useState, useEffect } from "react";

const services = [
  { name: "Product Design", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { name: "Branding", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { name: "Websites", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { name: "Marketing Campaigns", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { name: "Content Creation", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { name: "Motion Design", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { name: "Creative Strategy", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
];

function AnimatedService() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % services.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const prefersReducedMotion = useReducedMotion();
  const service = services[index];

  return (
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center px-4 h-[36px] mx-1 align-middle translate-y-[-2px] overflow-hidden gap-2",
        "rounded-full border text-sm md:text-[15px] font-medium whitespace-nowrap transition-colors duration-500 text-white",
        service.bg
      )}
    >
      <span className={cn("w-2 h-2 rounded-full bg-current transition-colors duration-500", service.color)} />
      {service.name}
    </motion.span>
  );
}

// ── Config ───────────────────────────────────────────────────────────────

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  // When the user has requested reduced motion, render content in its final
  // state immediately instead of animating in.
  const fadeUp = prefersReducedMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  const fadeUpLarge = prefersReducedMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="relative overflow-hidden bg-[hsl(232,28%,11%)]">
      <HeroBackground />
      <div className="relative container mx-auto px-6 pt-22 pb-24 max-w-7xl text-center">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto relative z-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-xs font-semibold uppercase tracking-widest text-white/70 mb-8">
            Creative Department-as-a-Service
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white mb-6 leading-[0.95]">
            Your Creative <span className="text-primary">Department,</span>
            <br />
            on Demand.
          </h1>

          <p className="text-md md:text-lg text-white/60 max-w-3xl mx-auto leading-relaxed mb-10">
            Stop juggling freelancers and agencies. Get one expert team for <AnimatedService /> <br /> — ready to start within 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90"
            >
              <Link href="#plan-selector">
                Start Your Creative Department
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-14 px-8 text-base text-white/80 hover:text-white hover:bg-white/10 border border-white/15"
            >
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>
        </motion.div>

        {/* Hero centerpiece: request card + floating stat satellites */}
        <motion.div
          {...fadeUpLarge}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-24 md:mt-16 w-full relative z-10"
        >
          <HeroFloatingComposition />
        </motion.div>
      </div>
    </section>
  );
}
