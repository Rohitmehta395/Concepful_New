"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CaseStudy } from "@/data/case-studies";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const MotionLink = (motion as any).create ? (motion as any).create(Link) : (motion as any)(Link);

/** Converts a hex color (e.g. "#F97316") to an rgba() string at the given alpha. */
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const parsed = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(parsed))
    return `rgba(120, 120, 130, ${alpha})`;
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface WorkGridProps {
  caseStudies: CaseStudy[];
}

export function WorkGrid({ caseStudies }: WorkGridProps) {
  const [visibleCount, setVisibleCount] = useState(6);

  // Reset visible count when filtered case studies change
  useEffect(() => {
    setVisibleCount(6);
  }, [caseStudies]);

  const visibleCaseStudies = caseStudies.slice(0, visibleCount);
  const hasMore = visibleCount < caseStudies.length;

  return (
    <section className="px-6 py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16"
        >
          <AnimatePresence mode="popLayout">
            {visibleCaseStudies.map((cs, i) => (
              <MotionLink
                key={cs.slug}
                href={`/work/${cs.slug}`}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ 
                  duration: 0.7, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.05 // subtle stagger
                }}
                className={cn(
                  "group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-8"
                )}
              >
                {/* Image Container - Minimalist framing */}
                <div 
                  className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-muted mb-5 transition-all duration-500 ease-out group-hover:-translate-y-1"
                  style={{
                    boxShadow: `0 2px 12px -4px ${hexToRgba(cs.accentColor, 0.18)}, 0 28px 56px -24px ${hexToRgba(
                      cs.accentColor,
                      0.34,
                    )}, 0 8px 20px -10px rgba(15, 15, 20, 0.12)`,
                  }}
                >
                  <img 
                    src={cs.image || "/placeholder.svg"} 
                    alt={cs.title} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[0.16,1,0.3,1] group-hover:scale-[1.05]" 
                  />
                  
                  {/* Subtle darkening overlay on hover to draw attention to typography */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/10" />
                  
                  {/* Category indicator floating top-right on hover */}
                  <div className="absolute top-4 right-4 overflow-hidden">
                    <span 
                      className="block px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.25em] bg-background/95 backdrop-blur-sm text-foreground shadow-sm rounded-sm transform translate-y-full opacity-0 transition-all duration-500 ease-[0.16,1,0.3,1] group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      {cs.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Typography Section - Magazine style */}
                <div className="flex flex-col px-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-2xl md:text-3xl font-medium leading-tight text-foreground transition-colors duration-500 group-hover:text-primary pr-2">
                      {cs.title}
                    </h3>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-all duration-500 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span style={{ color: cs.accentColor }}>{cs.client}</span>
                    <span className="h-[1px] w-8 bg-border/80" />
                    <span className="opacity-60 transition-opacity duration-300 group-hover:opacity-100">View Project</span>
                  </div>
                  
                  {cs.teaser && (
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground/80 line-clamp-2 max-w-[85%]">
                      {cs.teaser}
                    </p>
                  )}
                </div>
              </MotionLink>
            ))}
          </AnimatePresence>
        </motion.div>

        {hasMore && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mt-16 flex justify-center"
          >
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-border/60 bg-transparent px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-foreground transition-all duration-150 hover:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
            >
              <span className="relative z-10 transition-colors duration-150 group-hover:text-background">Load More</span>
              <div className="absolute inset-0 z-0 h-full w-full scale-0 rounded-full bg-foreground transition-transform duration-150 ease-[0.16,1,0.3,1] group-hover:scale-100" />
            </button>
          </motion.div>
        )}

        {caseStudies.length === 0 && (
          <div className="text-center py-32">
            <p className="font-serif text-2xl text-muted-foreground">No projects in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
