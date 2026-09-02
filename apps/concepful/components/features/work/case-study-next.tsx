"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Grid } from "lucide-react";
import type { CaseStudy } from "@/lib/content/types";

interface CaseStudyNextProps {
  nextStudy: CaseStudy | null;
}

export function CaseStudyNext({ nextStudy }: CaseStudyNextProps) {
  if (!nextStudy) {
    return (
      <section className="px-6 py-12 md:py-16 border-t border-border/60">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Explore More Work
              </p>
              <h3 className="font-serif text-2xl font-bold text-foreground">
                Discover all our client case studies.
              </h3>
            </div>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Grid className="h-4 w-4" />
              <span>Browse All Work</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const hasCover = Boolean(nextStudy.coverImage?.url);

  return (
    <section className="px-6 py-12 md:py-16 border-t border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Next Project
          </p>
          <Link
            href="/work"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            All Work &rarr;
          </Link>
        </div>

        <Link
          href={`/work/${nextStudy.slug}`}
          className="group grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-3xl border border-border/70 bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          {/* Visual Preview */}
          <div className="md:col-span-4 relative aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
            {hasCover ? (
              <Image
                src={nextStudy.coverImage?.url as string}
                alt={nextStudy.coverImage?.alt || nextStudy.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 350px"
              />
            ) : (
              <div className="h-full w-full min-h-[160px] bg-gradient-to-br from-primary/20 via-secondary to-card p-6 flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {nextStudy.client}
                </span>
                <span className="text-xs font-bold font-serif text-foreground">
                  {nextStudy.category?.name || "Project"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Details & CTA */}
          <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                  {nextStudy.category?.name || "Case Study"}
                </span>
                <span className="text-muted-foreground/40">&bull;</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {nextStudy.client}
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>{nextStudy.title}</span>
                <ArrowRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0 text-primary" />
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {nextStudy.teaser}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1.5">
                Read Next Case Study
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-xs text-muted-foreground">
                {nextStudy.outcomeMetrics?.[0]?.value ? `${nextStudy.outcomeMetrics[0].value} ${nextStudy.outcomeMetrics[0].label}` : "Full Case Study"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
