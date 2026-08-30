"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { CaseStudy } from "@/lib/content/types";
import { ParticleField } from "./particle-field";
import { cn } from "@/lib/utils";

interface WorkHeroProps {
  caseStudies?: CaseStudy[];
}

export function WorkHero({ caseStudies = [] }: WorkHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const previews = caseStudies.slice(0, 3);
  const total = caseStudies.length;

  return (
    <section className="relative px-6 pt-16 pb-10 md:pt-16 md:pb-12 md:min-h-screen">
      <HeroBackdrop shouldReduceMotion={shouldReduceMotion ?? false} />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-12 md:gap-8">
          {/* ——— Editorial copy ——— */}
          <motion.div
            className="md:col-span-6 lg:col-span-5"
            initial={
              !shouldReduceMotion ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-8 flex items-center gap-3">
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Selected Work
              </p>
              {total > previews.length && (
                <span className="text-[11px] font-medium tracking-wide text-muted-foreground/60">
                  · {String(previews.length).padStart(2, "0")} of {total}
                </span>
              )}
            </div>

            <h1 className="mb-8 font-serif text-[2.9rem] font-bold leading-[1.0] tracking-tight md:text-[4.4rem] lg:text-[5rem]">
              What we <em className="font-medium italic text-primary">build</em>
              <br />
              for our clients<span className="text-primary">.</span>
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              From Figma flows for drone operations platforms to brand systems,
              launch campaigns, and motion — brief outputs, real context.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              {["Brand Identity", "Product", "Campaigns", "Motion"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </motion.div>

          {/* ——— Gallery stage ——— */}
          <div className="md:col-span-6 lg:col-span-7">
            <GalleryStage
              previews={previews}
              shouldReduceMotion={shouldReduceMotion ?? false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ———————————————————————————————————————————————— */

function HeroBackdrop({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Studio light — subtle ambient glow */}
      <motion.div
        className="absolute -top-24 right-[-12%] h-[520px] w-[520px] rounded-full bg-primary/5 blur-[110px] md:right-[2%]"
        animate={
          !shouldReduceMotion ? { x: [0, 24, 0], y: [0, -16, 0] } : undefined
        }
        transition={
          !shouldReduceMotion
            ? { duration: 16, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      />
      <motion.div
        className="absolute bottom-[-12%] right-[16%] h-[380px] w-[380px] rounded-full bg-muted/40 blur-[100px]"
        animate={
          !shouldReduceMotion ? { x: [0, -18, 0], y: [0, 14, 0] } : undefined
        }
        transition={
          !shouldReduceMotion
            ? { duration: 19, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
            : undefined
        }
      />

      {/* Animated particle field — neutral drifting motes */}
      <ParticleField
        colors={["#94a3b8", "#cbd5e1"]}
        shouldReduceMotion={shouldReduceMotion}
        className="absolute inset-0 h-full w-full opacity-60"
      />

      {/* Print-registration grid — confined to the stage, kept visible rather than faded to nothing */}
      <div
        className="absolute inset-y-0 right-0 hidden w-3/5 md:block"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "linear-gradient(to left, rgba(0,0,0,0.9), transparent 70%)",
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,0.9), transparent 70%)",
        }}
      />

      {/* Fine grain for tactility, kept extremely subtle */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay">
        <filter id="workHeroGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#workHeroGrain)" />
      </svg>
    </div>
  );
}

function GalleryStage({
  previews,
  shouldReduceMotion,
}: {
  previews: CaseStudy[];
  shouldReduceMotion: boolean;
}) {
  if (previews.length === 0) return null;

  // Axis-aligned editorial grid: one featured board, two supporting boards stacked beside it.
  const spans = [
    "md:col-start-2 md:row-span-2",
    "md:col-start-1 md:row-start-1",
    "md:col-start-1 md:row-start-2",
  ];

  return (
    <div className="grid gap-4 md:h-[560px] md:grid-cols-2 md:grid-rows-2 md:gap-5">
      {previews.map((study, i) => (
        <div key={study.slug} className={cn("min-h-0", spans[i])}>
          <WorkBoard
            study={study}
            index={i}
            shouldReduceMotion={shouldReduceMotion}
          />
        </div>
      ))}
    </div>
  );
}

function WorkBoard({
  study,
  index,
  shouldReduceMotion,
}: {
  study: CaseStudy;
  index: number;
  shouldReduceMotion: boolean;
}) {
  const isHero = index === 0;

  return (
    <motion.div
      className="h-full"
      initial={
        !shouldReduceMotion ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "60px" }}
      transition={{
        duration: 0.7,
        delay: 0.15 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/work/${study.slug}`}
        aria-label={`View ${study.title} case study`}
        className={cn(
          "group flex h-full flex-col rounded-lg border border-border/60 bg-card p-3 shadow-sm",
          "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-md hover:border-border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        {/* Category accent bar */}
        <span
          className="mb-3 block h-[3px] w-9 rounded-full bg-primary"
          aria-hidden="true"
        />

        {/* Artwork — full color, no dimming overlay */}
        <div className="relative min-h-0 flex-1 aspect-[4/3] overflow-hidden rounded-md bg-muted md:aspect-auto">
          <Image
            src={study.coverImage?.url || "/placeholder.svg"}
            alt={study.coverImage?.alt || study.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={isHero}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-white backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
          {isHero && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>

        {/* Footer — category, title, hover reveal */}
        <div className="flex items-end justify-between gap-3 px-0.5 pt-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              {study.category?.name || "Project"}
            </p>
            <p
              className={cn(
                "truncate font-serif font-semibold leading-snug text-foreground",
                isHero ? "text-lg" : "text-[15px]",
              )}
            >
              {study.title}
            </p>
          </div>
          <span className="mb-0.5 flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
            View
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M3 13L13 3M13 3H5M13 3v8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
