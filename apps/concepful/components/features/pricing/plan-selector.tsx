"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Check } from "lucide-react";
import { TIERS, TierKey } from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TIER_KEYS: TierKey[] = ["signal", "pulse", "cortex"];

const BANDWIDTH_LABELS: Record<string, string> = {
  concurrent: "Active projects",
  requests: "Monthly requests",
  sla: "Turnaround",
  strategy: "Strategy time",
  revisions: "Revisions",
  team: "Your team",
};

export function PlanSelector() {
  const router = useRouter();
  const { tier, setTier, billing, setBilling, setPricingMode } =
    usePricingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Use a default for SSR to avoid hydration mismatch, update on mount
  const currentTier = mounted ? tier : "signal";
  const currentBilling = mounted ? billing : "monthly";

  const [mobileTierIndex, setMobileTierIndex] = useState(
    TIER_KEYS.indexOf(currentTier),
  );
  const touchStartX = useRef(0);

  // Sync mobileTierIndex if tier changes externally (e.g. from floating widget)
  useEffect(() => {
    if (mounted) setMobileTierIndex(TIER_KEYS.indexOf(tier));
  }, [tier, mounted]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);

  const handleMobileSwipe = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(2, mobileTierIndex + dir));
    setMobileTierIndex(next);
    setTier(TIER_KEYS[next]);
    setPricingMode("retainer");
  };

  const handleTierSelect = (key: TierKey) => {
    setTier(key);
    setMobileTierIndex(TIER_KEYS.indexOf(key));
    setPricingMode("retainer");
  };

  const handleTierContinue = (key: TierKey) => {
    handleTierSelect(key);
    // markPricingInterest omitted until auth migration
    router.push("/pricing");
  };

  const handleViewCapabilities = (key: TierKey) => {
    handleTierSelect(key);
    router.push("/pricing#capabilities");
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        {/* Placeholder to prevent layout shift */}
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-12 flex justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-secondary/60 px-4 py-2.5 shadow-sm">
          <Label
            className={cn(
              "cursor-pointer text-sm transition-colors",
              currentBilling === "monthly"
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            Monthly
          </Label>
          <Switch
            checked={currentBilling === "annual"}
            onCheckedChange={(c) => setBilling(c ? "annual" : "monthly")}
            data-testid="billing-toggle"
          />
          <Label
            className={cn(
              "flex cursor-pointer items-center gap-2 text-sm transition-colors",
              currentBilling === "annual"
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            Annual
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Save 10–15%
            </span>
          </Label>
        </div>
      </div>

      {/* Mobile carousel */}
      <div
        className="relative mb-4 px-4 md:hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const delta = touchStartX.current - e.changedTouches[0].clientX;
          if (delta > 40) handleMobileSwipe(1);
          else if (delta < -40) handleMobileSwipe(-1);
        }}
      >
        <div className="overflow-visible pt-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileTierIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <TierCard
                tierKey={TIER_KEYS[mobileTierIndex]}
                isSelected={currentTier === TIER_KEYS[mobileTierIndex]}
                billing={currentBilling}
                onSelect={handleTierSelect}
                onContinue={handleTierContinue}
                onViewCapabilities={handleViewCapabilities}
                fmt={fmt}
                bandwidthLabels={BANDWIDTH_LABELS}
              />
            </motion.div>
          </AnimatePresence>
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
            {TIER_KEYS.map((k, i) => (
              <button
                key={k}
                onClick={() => {
                  setMobileTierIndex(i);
                  handleTierSelect(k);
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === mobileTierIndex
                    ? "h-2.5 w-8 bg-primary"
                    : "h-2.5 w-2.5 bg-border hover:bg-muted-foreground",
                )}
                data-testid={`tier-dot-${k}`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMobileSwipe(1)}
            disabled={mobileTierIndex === 2}
            className="rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-2 text-center text-md text-muted-foreground">
          {mobileTierIndex + 1} of 3 — swipe or tap arrows to compare
        </p>
      </div>

      {/* Desktop 3-col grid */}
      <div className="container mx-auto mb-8 hidden max-w-5xl grid-cols-3 gap-5 px-6 pt-3 md:grid">
        {TIER_KEYS.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="h-full"
          >
            <TierCard
              tierKey={key}
              isSelected={currentTier === key}
              billing={currentBilling}
              onSelect={handleTierSelect}
              onContinue={handleTierContinue}
              onViewCapabilities={handleViewCapabilities}
              fmt={fmt}
              bandwidthLabels={BANDWIDTH_LABELS}
            />
          </motion.div>
        ))}
      </div>

      <p className="text-center text-md text-muted-foreground">
        Not sure?{" "}
        <button
          onClick={() => handleTierContinue("pulse")}
          className="font-medium text-primary hover:underline hover:cursor-pointer"
        >
          Start with Studio
        </button>{" "}
        — our most popular plan. Switch anytime.
      </p>

      <p className="mt-3 text-center text-md text-muted-foreground">
        Not ready for a retainer?{" "}
        <button
          onClick={() => {
            setPricingMode("oneTime");
            router.push("/pricing");
          }}
          className="font-medium text-primary hover:underline hover:cursor-pointer"
        >
          Browse one-time projects →
        </button>
      </p>
    </>
  );
}

/* ── Tier Card ── */
function TierCard({
  tierKey,
  isSelected,
  billing,
  onSelect,
  onContinue,
  onViewCapabilities,
  fmt,
  bandwidthLabels,
}: {
  tierKey: TierKey;
  isSelected: boolean;
  billing: "monthly" | "annual";
  onSelect: (k: TierKey) => void;
  onContinue: (k: TierKey) => void;
  onViewCapabilities: (k: TierKey) => void;
  fmt: (v: number) => string;
  bandwidthLabels: Record<string, string>;
}) {
  const t = TIERS[tierKey];
  const price =
    billing === "annual" ? t.monthly * (1 - t.annualDiscount) : t.monthly;

  return (
    <div className="relative h-full">
      {/* The one badge that survives — a single floating pill for the plan
          actually meant to stand out, not a scattering of same-weight tags. */}
      {t.badge && (
        <div className="absolute inset-x-0 top-0 z-10 flex -translate-y-1/2 justify-center">
          <span className="whitespace-nowrap rounded-full bg-primary px-3.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-md shadow-primary/25">
            {t.badge}
          </span>
        </div>
      )}

      <Card
        data-testid={`tier-card-${tierKey}`}
        onClick={() => onSelect(tierKey)}
        className={cn(
          "flex h-full cursor-pointer flex-col rounded-2xl border-2 transition-all duration-200",
          isSelected
            ? "border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/15"
            : "border-border/60 hover:border-primary/40 hover:shadow-md",
          t.highlight &&
            !isSelected &&
            "border-primary/30 shadow-md shadow-primary/5",
        )}
      >
        <CardHeader className="pb-2 pt-7">
          <div className="font-serif text-2xl font-bold">{t.name}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {t.tagline}
          </div>

          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {fmt(price)}
            </span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          {billing === "annual" && (
            <p className="mt-1 text-xs font-medium text-primary">
              {fmt(price * 12)}/yr · save {Math.round(t.annualDiscount * 100)}%
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-2 pt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Creative Bandwidth
          </p>
          <div className="space-y-2.5">
            {Object.entries(t.bandwidth).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {bandwidthLabels[key]}
                </span>
                <span className="text-right font-medium text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border/60 pt-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Capabilities included
            </p>
            <ul className="space-y-1.5">
              {t.capabilities.slice(0, 5).map((cap) => (
                <li
                  key={cap}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {cap}
                </li>
              ))}
              {t.capabilities.length > 5 && (
                <li 
                  className="pl-5 text-xs font-medium text-primary hover:underline cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCapabilities(tierKey);
                  }}
                >
                  +{t.capabilities.length - 5} more included
                </li>
              )}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="pb-5 pt-2">
          <Button
            variant={isSelected ? "default" : "outline"}
            className="group w-full gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onContinue(tierKey);
            }}
            data-testid={`select-tier-${tierKey}`}
          >
            {isSelected ? "Continue with this plan" : "Select & customize"}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
