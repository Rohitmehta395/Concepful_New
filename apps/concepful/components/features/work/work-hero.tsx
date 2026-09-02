"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CaseStudy } from "@/lib/content/types";
import { cn } from "@/lib/utils";

interface WorkHeroProps {
  caseStudies?: CaseStudy[];
}

export function WorkHero({ caseStudies = [] }: WorkHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fallback if no case studies available
  const featuredList = caseStudies.length > 0 ? caseStudies : [];
  const currentStudy = featuredList[activeIndex] || null;

  // Auto-rotate every 6 seconds if not paused and more than 1 study
  const nextSlide = useCallback(() => {
    if (featuredList.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % featuredList.length);
  }, [featuredList.length]);

  useEffect(() => {
    if (isPaused || featuredList.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, featuredList.length]);

  // Dynamic hero text replacement (defaults to "Snazzy UIs" if ctaText not set)
  const dynamicCtaText = currentStudy?.ctaText?.trim() || "Snazzy UIs";

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden w-full min-h-screen flex items-center pt-0 pb-12 lg:py-0 lg:-mt-8"
    >
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute -top-20 left-1/4 h-[420px] w-[600px] rounded-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl" />

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen items-stretch">
        {/* Left Column: Hero headline & Case Study Details */}
        <div className="flex flex-col justify-center px-6 sm:px-12 lg:pl-16 xl:pl-24 lg:pr-12 py-16 lg:py-0 lg:-translate-y-4">
          <div className="max-w-xl w-full mx-auto lg:ml-auto lg:mr-0">
            {/* Dynamic Hero Headline */}
            <h1 className="mb-12 sm:mb-14 lg:mb-20 font-sans text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.06]">
              <span className="block text-foreground">We build</span>
              <span className="relative block h-[1.18em] overflow-hidden my-0.5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentStudy ? currentStudy.id : "default-hero-cta"}
                    initial={
                      !shouldReduceMotion
                        ? { opacity: 0, y: 30 }
                        : { opacity: 1, y: 0 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      !shouldReduceMotion
                        ? { opacity: 0, y: -30 }
                        : { opacity: 0 }
                    }
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 block text-primary truncate font-normal"
                  >
                    {dynamicCtaText}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="block text-foreground">
                for our clients<span className="text-primary">.</span>
              </span>
            </h1>

            {/* Active Case Study Info Section */}
            {currentStudy ? (
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStudy.id}
                    initial={
                      !shouldReduceMotion
                        ? { opacity: 0, y: 12 }
                        : { opacity: 1, y: 0 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      !shouldReduceMotion
                        ? { opacity: 0, y: -12 }
                        : { opacity: 0 }
                    }
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-1"
                  >
                    {/* Case Study Title */}
                    <Link
                      href={`/work/${currentStudy.slug}`}
                      className="group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >
                      <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {currentStudy.title}
                      </h2>
                    </Link>

                    {/* Client Name */}
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
                      {currentStudy.client}
                    </p>

                    {/* Teaser & Arrow Button */}
                    <div className="pt-2 flex items-center gap-4 sm:gap-6">
                      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground line-clamp-2 max-w-md">
                        {currentStudy.teaser}
                      </p>

                      <Link
                        href={`/work/${currentStudy.slug}`}
                        aria-label={`View ${currentStudy.title} case study`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : null}

            {/* Rotation Carousel Indicators */}
            {featuredList.length > 1 && (
              <div
                className="mt-8 flex items-center gap-2.5"
                role="tablist"
                aria-label="Featured case studies carousel navigation"
              >
                {featuredList.map((study, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={study.id || study.slug}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Show ${study.title}`}
                      onClick={() => setActiveIndex(idx)}
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isActive
                          ? "w-16 bg-primary"
                          : "w-12 bg-muted-foreground/25 hover:bg-muted-foreground/45",
                      )}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Featured Case Study Image taking full 50% right side at ~80% height */}
        <div className="w-full h-full min-h-[420px] sm:min-h-[500px] lg:min-h-screen relative flex items-center justify-center">
          {currentStudy && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStudy.id}
                initial={
                  !shouldReduceMotion
                    ? { opacity: 0, scale: 0.98 }
                    : { opacity: 1 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  !shouldReduceMotion
                    ? { opacity: 0, scale: 0.98 }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-[400px] sm:h-[480px] lg:h-[80vh] relative"
              >
                <Link
                  href={`/work/${currentStudy.slug}`}
                  aria-label={`View ${currentStudy.title}`}
                  className="relative block w-full h-full p-4 sm:p-6 lg:p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative w-full h-full overflow-hidden rounded-2xl">
                    <Image
                      src={currentStudy.coverImage?.url || "/placeholder.svg"}
                      alt={currentStudy.coverImage?.alt || currentStudy.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain object-center"
                    />
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
