"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtPrice, getTierDisplayPrice } from "@/lib/pricing-builder";
import { BUILDER_TIERS } from "@/data/pricing/builder-tiers";
import type { BuilderTierId, BillingMode } from "@/types/pricing-builder";
import { Button } from "@/components/ui/button";

// Import the specific styling for this builder
import "@/components/features/pricing/architect/pricing-builder.css";

export function PlanSelector() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [billing, setBilling] = useState<BillingMode>("monthly");
  
  // Default to expedition which is index 1
  const [selectedTier, setSelectedTier] = useState<BuilderTierId | null>("expedition");
  const [mobileTierIndex, setMobileTierIndex] = useState(1);
  const [swipeDirection, setSwipeDirection] = useState(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSelect = (id: BuilderTierId) => {
    setSelectedTier(id);
    const next = BUILDER_TIERS.findIndex(t => t.id === id);
    if (next !== -1 && next !== mobileTierIndex) {
      setSwipeDirection(next > mobileTierIndex ? 1 : -1);
      setMobileTierIndex(next);
    }
  };

  const handleMobileSwipe = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(BUILDER_TIERS.length - 1, mobileTierIndex + dir));
    if (next !== mobileTierIndex) {
      setSwipeDirection(dir);
      setMobileTierIndex(next);
      setSelectedTier(BUILDER_TIERS[next].id);
    }
  };

  const handleContinue = (tierId: BuilderTierId) => {
    router.push(`/pricing?tier=${tierId}`);
  };

  return (
    <div className="pa" style={{ padding: 0 }}>
      <div className="pa-toggle-row" style={{ justifyContent: "center", marginTop: 0, marginBottom: "32px", flexDirection: "column", gap: "12px" }}>
        <div className="pa-toggle">
          <button
            className={billing === "monthly" ? "on" : ""}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            className={billing === "annual" ? "on" : ""}
            onClick={() => setBilling("annual")}
          >
            Annual <em>save 10%</em>
          </button>
        </div>
        <span className="pa-toggle-note" style={{ textAlign: "center" }}>
          Applies to Expedition &amp; Department Augmentation. Sprints are one-time.
        </span>
      </div>

      {/* Mobile carousel */}
      <div className="relative mb-4 md:hidden touch-pan-y">
        <div className="overflow-visible pt-3">
          <div className="grid">
            <AnimatePresence initial={false} custom={swipeDirection}>
              <motion.div
                key={mobileTierIndex}
                custom={swipeDirection}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? "100%" : "-100%",
                    opacity: 0,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    zIndex: 1,
                  },
                  exit: (dir: number) => ({
                    x: dir > 0 ? "-100%" : "100%",
                    opacity: 0,
                    zIndex: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeVelocity = velocity.x;
                  const swipeOffset = offset.x;

                  if (swipeOffset < -50 || swipeVelocity < -500) {
                    handleMobileSwipe(1);
                  } else if (swipeOffset > 50 || swipeVelocity > 500) {
                    handleMobileSwipe(-1);
                  }
                }}
                className="col-start-1 row-start-1 w-full"
              >
                <BuilderTierCard
                  t={BUILDER_TIERS[mobileTierIndex]}
                  billing={billing}
                  isSelected={selectedTier === BUILDER_TIERS[mobileTierIndex].id}
                  onSelect={handleSelect}
                  onContinue={handleContinue}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMobileSwipe(-1)}
            disabled={mobileTierIndex === 0}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {BUILDER_TIERS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => {
                  handleSelect(t.id);
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === mobileTierIndex
                    ? "h-2.5 w-8 bg-primary"
                    : "h-2.5 w-2.5 bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMobileSwipe(1)}
            disabled={mobileTierIndex === BUILDER_TIERS.length - 1}
            className="rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mobileTierIndex + 1} of {BUILDER_TIERS.length} — swipe or tap arrows to compare
        </p>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:block">
        <div className="pa-tiers">
          {BUILDER_TIERS.map((t) => (
            <BuilderTierCard
              key={t.id}
              t={t}
              billing={billing}
              isSelected={selectedTier === t.id}
              onSelect={handleSelect}
              onContinue={handleContinue}
            />
          ))}
        </div>
      </div>
      
      <p className="pa-help" style={{ textAlign: "center", marginTop: "48px" }}>
        Not sure which fits?{" "}
        <a
          href="/contact"
          style={{
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            fontWeight: 600,
          }}
        >
          Describe the work
        </a>{" "}
        — we’ll point you to the right tier in one reply.
      </p>
    </div>
  );
}

function BuilderTierCard({
  t,
  billing,
  isSelected,
  onSelect,
  onContinue,
}: {
  t: typeof BUILDER_TIERS[0];
  billing: BillingMode;
  isSelected: boolean;
  onSelect: (id: BuilderTierId) => void;
  onContinue: (id: BuilderTierId) => void;
}) {
  const isMo = t.billing === "monthly";
  const displayPrice = getTierDisplayPrice(t.id, billing);

  return (
    <div
      role="button"
      tabIndex={0}
      className={"pa-tier cursor-pointer h-full" + (isSelected ? " pop" : "")}
      onClick={() => onSelect(t.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(t.id);
        }
      }}
    >
      {t.popular && <span className="pa-badge">Most popular</span>}
      <span className="pa-tier-name">{t.name}</span>
      <span className="pa-tier-tag">{t.tagline}</span>
      <span className="pa-tier-price">
        from {fmtPrice(displayPrice)}
        {isMo ? "/mo" : ""}
      </span>
      <span className="pa-tier-note">
        {isMo && billing === "annual" ? "billed annually · " : ""}
        {t.priceNote}
      </span>
      <ul className="mb-4">
        {t.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="mt-auto pt-2">
        <Button
          className={cn(
            "w-full transition-all duration-300",
            isSelected ? "shadow-[inset_0_0_0_999px_rgba(0,0,0,0.15)] scale-[0.98]" : ""
          )}
          variant="default"
          onClick={(e) => {
            e.stopPropagation();
            if (!isSelected) {
              onSelect(t.id);
            }
            onContinue(t.id);
          }}
        >
          {t.cta} &rarr;
        </Button>
      </div>
    </div>
  );
}
