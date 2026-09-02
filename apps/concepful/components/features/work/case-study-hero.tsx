"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Check,
  Building2,
  Layers,
  Award,
  ListChecks,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import type { CaseStudy } from "@/lib/content/types";

interface CaseStudyHeroProps {
  study: CaseStudy;
}

export function CaseStudyHero({ study }: CaseStudyHeroProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const deliverablesCount = study.deliverables?.length ?? 0;
  const toolsCount = study.tools?.length ?? 0;

  return (
    <section className="relative pt-8 pb-10 md:pt-12 md:pb-14 px-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl rounded-full" />

      <div className="container relative mx-auto max-w-5xl">
        {/* Navigation & Actions Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          {/* Breadcrumb back */}
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border/60"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>All Projects</span>
          </Link>

          {/* Share button */}
          <button
            onClick={handleCopyLink}
            type="button"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg border border-border/60 hover:bg-muted/60 hover:border-border cursor-pointer active:scale-95"
            title="Share case study"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Hero Title & Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl"
        >
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            {/* Category badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.16em] bg-primary/10 text-primary border border-primary/20">
              {study.category?.name || "Case Study"}
            </span>

            {study.featured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Award className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.08] mb-6">
            {study.title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-10 font-normal">
            {study.teaser}
          </p>
        </motion.div>

        {/* Project Metadata Specs Strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-2xl bg-card/80 border border-border/70 backdrop-blur-md shadow-sm"
        >
          {/* Client */}
          <div className="flex items-start gap-3 p-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                Client
              </p>
              <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                {study.client}
              </p>
            </div>
          </div>

          {/* Discipline / Category */}
          <div className="flex items-start gap-3 p-2">
            <div className="p-2 rounded-xl bg-secondary text-foreground shrink-0 mt-0.5">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                Discipline
              </p>
              <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                {study.category?.name || "Product & Brand"}
              </p>
            </div>
          </div>

          {/* Deliverables Scope */}
          <div className="flex items-start gap-3 p-2">
            <div className="p-2 rounded-xl bg-secondary text-foreground shrink-0 mt-0.5">
              <ListChecks className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                Scope
              </p>
              <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                {deliverablesCount > 0 ? `${deliverablesCount} Deliverables` : "Full-Cycle"}
              </p>
            </div>
          </div>

          {/* Tools & Tech */}
          <div className="flex items-start gap-3 p-2">
            <div className="p-2 rounded-xl bg-secondary text-foreground shrink-0 mt-0.5">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                Tooling
              </p>
              <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                {toolsCount > 0 ? `${toolsCount} Stack Tools` : "Design & Code"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
