"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CaseStudy } from "@/lib/content/types";
import { TopoContourBackground } from "./topo-contour-background";
import { Button } from "@/components/ui/button";

interface WorkHeroProps {
  caseStudies?: CaseStudy[];
}

const CATEGORY_TAGS = [
  { label: "Brand Identity", filterKey: "Brand" },
  { label: "Product", filterKey: "Product" },
  { label: "Campaigns", filterKey: "Marketing" },
  { label: "Motion", filterKey: "Motion" },
];

export function WorkHero({ caseStudies = [] }: WorkHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleTagClick = (filterKey: string) => {
    // Notify WorkMosaic to update active filter
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("concepful:filter-work", { detail: filterKey })
      );
      const target = document.getElementById("all-work");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative flex min-h-[72vh] md:min-h-[80vh] items-center justify-center overflow-hidden px-6 pt-24 pb-14 md:pt-32 md:pb-20">
      {/* Topographic Elevation Contour Background */}
      <TopoContourBackground />

      <div className="container relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={
            !shouldReduceMotion ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Editorial Kicker */}
          <div className="mb-6 inline-flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/80">
              Selected Work
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 max-w-3xl font-serif text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            What we <em className="font-medium italic text-primary">build</em>{" "}
            for our clients<span className="text-primary">.</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            From Figma flows for drone operations platforms to brand systems,
            launch campaigns, and motion — brief outputs, real context.
          </p>

          {/* Centered CTA Button - shadcn Button in Concepful theme red */}
          <div className="mb-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-lg px-7 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200"
            >
              <Link href="#featured-projects">View Projects</Link>
            </Button>
          </div>

          {/* Interactive Capability Tags - click to filter and scroll */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORY_TAGS.map(({ label, filterKey }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleTagClick(filterKey)}
                className="cursor-pointer rounded-full border border-border/70 bg-card/70 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90 backdrop-blur-sm transition-all duration-200 hover:border-primary/60 hover:text-primary hover:bg-card active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
