"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { OutcomeMetric } from "@/lib/content/types";
import { ArrowRight } from "lucide-react";

interface CaseStudyMetricsProps {
  metrics: OutcomeMetric[];
}

/**
 * Derives a contextual, editorial category descriptor from the metric's context
 * rather than arbitrary generic counts or numbered labels.
 */
function getMetricCategory(label: string, value: string): string {
  const text = `${label} ${value}`.toLowerCase();

  if (
    text.includes("completion") ||
    text.includes("reduction") ||
    text.includes("efficiency") ||
    text.includes("cost") ||
    text.includes("save") ||
    text.startsWith("-")
  ) {
    return "Efficiency Gain";
  }
  if (
    text.includes("day") ||
    text.includes("hour") ||
    text.includes("time") ||
    text.includes("speed") ||
    text.includes("training") ||
    text.includes("proficiency") ||
    text.includes("fast") ||
    text.includes("cycle")
  ) {
    return "Time to Value";
  }
  if (
    text.includes("screen") ||
    text.includes("deliver") ||
    text.includes("asset") ||
    text.includes("component") ||
    text.includes("page") ||
    text.includes("module") ||
    text.includes("scope")
  ) {
    return "Shipped Scope";
  }
  if (
    text.includes("score") ||
    text.includes("rating") ||
    text.includes("usability") ||
    text.includes("pilot") ||
    text.includes("satisfaction") ||
    text.includes("user") ||
    text.includes("nps") ||
    text.includes("/ 5") ||
    text.includes("/5")
  ) {
    return "Usability & Adoption";
  }
  if (
    text.includes("growth") ||
    text.includes("revenue") ||
    text.includes("roi") ||
    text.includes("conversion") ||
    text.includes("+")
  ) {
    return "Business Impact";
  }

  return "Key Result";
}

/**
 * Editorial metric value formatter with clean semibold weights.
 */
function FormattedMetricValue({ value }: { value: string }) {
  const transitionMatch = value.split(/\s*(?:->|→)\s*/);
  if (transitionMatch.length === 2) {
    const [before, after] = transitionMatch;
    return (
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70">
          <span className="line-through decoration-primary/40">{before}</span>
          <ArrowRight className="h-3 w-3 text-primary" />
        </div>
        <span className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {after}
        </span>
      </div>
    );
  }

  const scoreMatch = value.match(/^([\d.]+)\s*\/\s*(\d+)$/);
  if (scoreMatch) {
    const [, score, max] = scoreMatch;
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {score}
        </span>
        <span className="text-sm font-medium text-muted-foreground/70">
          / {max}
        </span>
      </div>
    );
  }

  return (
    <span className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
      {value}
    </span>
  );
}

export function CaseStudyMetrics({ metrics }: CaseStudyMetricsProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!metrics || metrics.length === 0) return null;

  return (
    <section className="px-6 pb-16 md:pb-24">
      <div className="container mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Delivered Outcomes
              </p>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Measurable impact & project results.
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-normal text-muted-foreground sm:max-w-xs sm:text-right leading-relaxed">
            Verified key deliverables and performance markers shipped for this project.
          </p>
        </div>

        {/* Editorial Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {metrics.map((metric, i) => {
            const category = getMetricCategory(metric.label, metric.value);

            return (
              <motion.div
                key={`${metric.label}-${i}`}
                initial={
                  !shouldReduceMotion
                    ? { opacity: 0, y: 14 }
                    : { opacity: 1, y: 0 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-border/70 bg-card/60 dark:bg-card/30 backdrop-blur-xs hover:border-border transition-all duration-300 hover:shadow-xs"
              >
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-4">
                    {category}
                  </p>

                  <div className="min-h-[50px] flex items-center">
                    <FormattedMetricValue value={metric.value} />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <p className="text-xs sm:text-sm font-normal text-muted-foreground leading-relaxed">
                    {metric.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
