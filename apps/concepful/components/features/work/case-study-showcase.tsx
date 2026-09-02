"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CaseStudy } from "@/lib/content/types";

interface CaseStudyShowcaseProps {
  study: CaseStudy;
}

const THEME_GRADIENTS: Record<string, string> = {
  blue: "from-blue-600/20 via-indigo-600/10 to-slate-950",
  amber: "from-amber-600/20 via-orange-600/10 to-stone-950",
  purple: "from-purple-600/20 via-pink-600/10 to-neutral-950",
  emerald: "from-emerald-600/20 via-teal-600/10 to-zinc-950",
  cyan: "from-cyan-600/20 via-blue-600/10 to-slate-950",
  indigo: "from-indigo-600/20 via-violet-600/10 to-zinc-950",
  violet: "from-violet-600/20 via-fuchsia-600/10 to-neutral-950",
};

export function CaseStudyShowcase({ study }: CaseStudyShowcaseProps) {
  const gradientClass =
    (study.theme && THEME_GRADIENTS[study.theme]) ||
    "from-primary/15 via-secondary/40 to-card";

  const hasCoverImage = Boolean(study.coverImage?.url);

  return (
    <section className="px-6 pb-12 md:pb-16">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative group rounded-3xl overflow-hidden border border-border/80 bg-card shadow-lg"
        >
          {/* Ambient lighting glow */}
          <div
            className={`pointer-events-none absolute -inset-1 opacity-40 blur-xl bg-gradient-to-r ${gradientClass} transition-opacity duration-500 group-hover:opacity-70`}
          />

          {hasCoverImage ? (
            <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-muted">
              <Image
                src={study.coverImage?.url as string}
                alt={study.coverImage?.alt || study.title}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1280px) 100vw, 1200px"
              />
              {/* Subtle top-down and bottom-up glass vignettes */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>
          ) : (
            <div
              className={`relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-gradient-to-br ${gradientClass} p-8 flex flex-col justify-between`}
            >
              {/* Architectural abstract grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

              {/* Glowing abstract geometry */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/20 bg-primary/5 blur-sm" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-border/40" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs font-mono font-medium tracking-widest text-muted-foreground uppercase">
                  {study.client}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border/60 text-foreground">
                  {study.category?.name || "Featured Concept"}
                </span>
              </div>

              <div className="relative z-10 text-center max-w-xl mx-auto my-auto py-6">
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {study.title}
                </p>
              </div>
            </div>
          )}

          {/* Tags bar overlay */}
          {study.tags && study.tags.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center gap-2">
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-3 py-1 rounded-full bg-background/80 dark:bg-black/60 text-foreground/90 backdrop-blur-md border border-border/60 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Cover image caption if present */}
        {study.coverImage?.caption && (
          <p className="text-xs text-muted-foreground mt-3 text-center italic">
            {study.coverImage.caption}
          </p>
        )}
      </div>
    </section>
  );
}
