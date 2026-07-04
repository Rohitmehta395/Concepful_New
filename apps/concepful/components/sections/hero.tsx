"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "hsl(232, 28%, 11%)" }}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(349, 90%, 54%, 0.3) 0%, transparent 60%)",
        }}
      />
      <div className="relative container mx-auto px-6 pt-20 pb-24 max-w-5xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-semibold uppercase tracking-widest text-white/70 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Creative Department-as-a-Service
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[0.95]">
            Your creative<br />
            <span style={{ color: "hsl(349, 90%, 54%)" }}>department,</span><br />
            on demand.
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            Stop patching together freelancers and agencies. Get a complete, expert creative team
            — product design, branding, campaigns, and more — that activates in 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="h-13 px-8 text-base font-semibold"
              style={{ backgroundColor: "hsl(349, 90%, 54%)" }}
            >
              <Link href="#plan-selector">
                Choose a plan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-13 px-8 text-base text-white/80 hover:text-white hover:bg-white/10 border border-white/15"
            >
              <Link href="#how-it-works">
                See how it works
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/40"
        >
          {["No hiring. No retainer surprises.", "Cancel anytime.", "Work starts within 24 hours."].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />{t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
