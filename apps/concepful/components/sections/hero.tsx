"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Edit, Layers, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RequestIllustration,
  CreateAndDeliverIllustration,
  GrowIllustration,
} from "@/components/workflow-illustrations";
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
    }, 4000);
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

type WorkflowStep = {
  title: string;
  /** Used for screen readers to describe what the illustration depicts. */
  description: string;
  icon: LucideIcon;
  Illustration: () => JSX.Element;
  /** The center step renders larger and is the visual anchor of the row. */
  featured?: boolean;
};

const workflowSteps: WorkflowStep[] = [
  {
    title: "You Request",
    description: "A client submitting a creative request",
    icon: Edit,
    Illustration: RequestIllustration,
  },
  {
    title: "We Create & Deliver",
    description:
      "The Concepful team designing the work and handing off finished assets",
    icon: Layers,
    Illustration: CreateAndDeliverIllustration,
    featured: true,
  },
  {
    title: "You Grow",
    description: "Business growth resulting from the work",
    icon: TrendingUp,
    Illustration: GrowIllustration,
  },
];

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
          className="max-w-5xl mx-auto"
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

        {/* Workflow section — the middle step is the visual anchor */}
        <motion.div
          {...fadeUpLarge}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-24 md:mt-16 w-full relative z-10"
        >
          <ol className="flex flex-col items-center gap-10 lg:flex-row lg:items-stretch lg:justify-center lg:gap-6 list-none">
            {workflowSteps.map((step, idx) => {
              const isLast = idx === workflowSteps.length - 1;
              return (
                <li key={step.title} className="contents">
                  <div
                    className={cn(
                      "flex flex-col items-center",
                      step.featured
                        ? "w-full lg:shrink-0 lg:basis-[38%]"
                        : "w-full lg:shrink-0 lg:basis-[24%]",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-6 lg:mb-8">
                      <step.icon
                        className="w-5 h-5 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-white font-medium text-lg whitespace-nowrap">
                        {step.title}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "group relative w-full flex flex-col items-center justify-center flex-1",
                        !prefersReducedMotion &&
                          "transition-all duration-500 hover:-translate-y-2",
                      )}
                    >
                      {/* Glow — stronger behind the featured card */}
                      <div
                        aria-hidden="true"
                        className={cn(
                          "absolute rounded-full blur-[60px] -z-10 transition-opacity duration-500",
                          step.featured
                            ? "inset-1/4 bg-primary/40 opacity-80"
                            : "inset-1/3 bg-primary/20 opacity-0 group-hover:opacity-40",
                        )}
                      />

                      <div
                        role="img"
                        aria-label={step.description}
                        className="z-10 flex w-full justify-center drop-shadow-2xl"
                      >
                        <step.Illustration />
                      </div>
                    </div>
                  </div>

                  {/* Connector — same icon, just rotated for the stacked mobile layout */}
                  {!isLast && (
                    <div
                      className="flex items-center justify-center text-primary/70 lg:shrink-0"
                      aria-hidden="true"
                    >
                      <ArrowRight className="h-6 w-6 rotate-90 lg:h-7 lg:w-7 lg:rotate-0" />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
