"use client";

import {
  CheckCircle2,
  Wrench,
  Quote,
  AlertCircle,
  BadgeCheck,
  Activity,
  Eye,
  AlertTriangle,
  Zap,
  Layers,
  Compass,
  Target,
} from "lucide-react";
import type { CaseStudy } from "@/lib/content/types";

interface CaseStudyContentProps {
  study: CaseStudy;
}

/**
 * Returns a contextual icon related to the specific challenge/obstacle topic
 * instead of arbitrary sequential numbers.
 */
function getChallengeIcon(challenge: string) {
  const t = challenge.toLowerCase();

  if (
    t.includes("telemetry") ||
    t.includes("data") ||
    t.includes("real-time") ||
    t.includes("sensor") ||
    t.includes("stream") ||
    t.includes("flight") ||
    t.includes("dense")
  ) {
    return Activity;
  }
  if (
    t.includes("sun") ||
    t.includes("outdoor") ||
    t.includes("glare") ||
    t.includes("contrast") ||
    t.includes("light") ||
    t.includes("dark mode") ||
    t.includes("readability") ||
    t.includes("visual") ||
    t.includes("tap") ||
    t.includes("glove")
  ) {
    return Eye;
  }
  if (
    t.includes("stress") ||
    t.includes("battery") ||
    t.includes("warning") ||
    t.includes("alert") ||
    t.includes("critical") ||
    t.includes("fail") ||
    t.includes("emergency") ||
    t.includes("risk")
  ) {
    return AlertTriangle;
  }
  if (
    t.includes("speed") ||
    t.includes("performance") ||
    t.includes("fast") ||
    t.includes("instant") ||
    t.includes("latency")
  ) {
    return Zap;
  }
  if (
    t.includes("scale") ||
    t.includes("system") ||
    t.includes("architecture") ||
    t.includes("complex") ||
    t.includes("structure")
  ) {
    return Layers;
  }
  if (
    t.includes("user") ||
    t.includes("team") ||
    t.includes("operator") ||
    t.includes("human") ||
    t.includes("train") ||
    t.includes("workflow")
  ) {
    return Compass;
  }

  return Target;
}

export function CaseStudyContent({ study }: CaseStudyContentProps) {
  return (
    <div className="lg:col-span-8 space-y-16 md:space-y-20">
      {/* ── 01. The Brief ── */}
      <section id="the-brief" className="scroll-mt-28">
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            The Strategic Brief
          </p>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-6">
          Understanding the mission and opportunity.
        </h2>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-normal whitespace-pre-line">
            {study.brief}
          </p>
        </div>
      </section>

      <hr className="border-border/60" />

      {/* ── 02. The Challenges ── */}
      <section id="challenges" className="scroll-mt-28">
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            The Obstacles & Complexities
          </p>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-6">
          Key challenges we had to solve.
        </h2>

        {study.challenges && study.challenges.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {study.challenges.map((challenge, i) => {
              const Icon = getChallengeIcon(challenge);

              return (
                <div
                  key={i}
                  className="group flex items-start gap-4 p-5 sm:p-6 rounded-2xl border border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card transition-all duration-300 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mt-0.5 shadow-2xs group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-medium">
                      {challenge}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 text-muted-foreground text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Standard multi-phase project execution.</span>
          </div>
        )}
      </section>

      <hr className="border-border/60" />

      {/* ── 03. What We Made ── */}
      <section id="what-we-made" className="scroll-mt-28">
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Execution & Deliverables
          </p>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-6">
          What was engineered & shipped.
        </h2>

        {/* Deliverables List */}
        {study.deliverables && study.deliverables.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {study.deliverables.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card/70 hover:bg-card transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-foreground/85 font-medium leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Stack and Tooling */}
        {study.tools && study.tools.length > 0 && (
          <div className="p-5 rounded-2xl border border-border/60 bg-muted/30">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Production Stack & Systems
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {study.tools.map((tool) => (
                <span
                  key={tool}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-background border border-border/70 text-foreground shadow-2xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <hr className="border-border/60" />

      {/* ── 04. The Outcome ── */}
      <section id="the-outcome" className="scroll-mt-28">
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            The Transformation
          </p>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-6">
          Impact and lasting value delivered.
        </h2>

        {/* Outcome Feature Box */}
        <div className="relative p-6 sm:p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm overflow-hidden">
          <Quote className="absolute -right-4 -bottom-4 h-32 w-32 text-primary/5 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
              <BadgeCheck className="h-3 w-3" />
              Verified Outcome
            </div>

            <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed">
              {study.outcome}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs text-muted-foreground">
              <span>Client Partner: <strong className="text-foreground">{study.client}</strong></span>
              <span>Concepful On-Demand Team</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
