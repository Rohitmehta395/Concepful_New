"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DISCIPLINES = [
  "Brand",
  "Web",
  "Motion",
  "Product",
  "Content",
  "Strategy",
  "Brand",
  "Web",
  "Motion",
  "Product",
  "Content",
  "Strategy",
];

export function BottomCta() {
  const reduceMotion = useReducedMotion();
  const marqueeItems = reduceMotion
    ? DISCIPLINES
    : [...DISCIPLINES, ...DISCIPLINES];

  return (
    <section className="relative overflow-hidden bg-[hsl(232,28%,11%)] px-6 py-28 md:py-32">
      {/* Discipline strip stands in for the hero's glow as this section's
          bookend — it's what a "creative department" actually delivers,
          not a decorative gradient repeat. */}
      <div
        className="absolute inset-x-0 top-0 flex overflow-hidden border-b border-white/10 py-3"
        aria-hidden="true"
      >
        <div
          className={`flex shrink-0 gap-10 whitespace-nowrap pr-10 ${
            reduceMotion ? "" : "animate-marquee"
          }`}
        >
          {marqueeItems.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-10 text-xs font-medium uppercase tracking-[0.2em] text-white/30"
            >
              {item}
              <span className="text-[hsl(349,90%,54%)]">—</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container relative mx-auto max-w-5xl pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 text-center lg:grid-cols-12 lg:items-end lg:gap-8 lg:text-left"
        >
          <div className="lg:col-span-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Ready when you are
            </p>
            <h2 className="font-serif text-[2.75rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Stop Hiring.
              <br />
              Start{" "}
              <span className="relative inline-block">
                Creating
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 5.5C40 2 100 1 199 4"
                    stroke="hsl(349, 90%, 54%)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h2>
          </div>

          <div className="lg:col-span-4 lg:border-l lg:border-white/10 lg:pl-8">
            <p className="mb-6 text-base leading-relaxed text-white/50">
              Add a full creative department to your company. No contracts, no
              overhead. Cancel anytime.
            </p>
            <Button
              asChild
              size="lg"
              className="group h-14 bg-primary px-10 text-base font-semibold hover:bg-primary/90"
            >
              <Link href="#plan-selector">
                Choose your plan
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
