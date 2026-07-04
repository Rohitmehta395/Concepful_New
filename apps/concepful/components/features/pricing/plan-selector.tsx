"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Check } from "lucide-react";
import { TIERS, calcMonthlyTotal, calcAnnualTotal, TierKey } from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TIER_KEYS: TierKey[] = ["signal", "pulse", "cortex"];

const BANDWIDTH_LABELS: Record<string, string> = {
  concurrent: "Active projects",
  requests:   "Monthly requests",
  sla:        "Turnaround",
  strategy:   "Strategy time",
  revisions:  "Revisions",
  team:       "Your team",
};

export function PlanSelector() {
  const router = useRouter();
  const { tier, setTier, billing, setBilling, addOns, aiOpsLevel, setPricingMode } = usePricingStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  // Use a default for SSR to avoid hydration mismatch, update on mount
  const currentTier = mounted ? tier : "signal";
  const currentBilling = mounted ? billing : "monthly";

  const [mobileTierIndex, setMobileTierIndex] = useState(TIER_KEYS.indexOf(currentTier));
  const touchStartX = useRef(0);

  // Sync mobileTierIndex if tier changes externally (e.g. from floating widget)
  useEffect(() => {
    if (mounted) setMobileTierIndex(TIER_KEYS.indexOf(tier));
  }, [tier, mounted]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

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

  if (!mounted) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        {/* Placeholder to prevent layout shift */}
        <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3 bg-secondary/60 px-4 py-2.5 rounded-full border border-border/60">
          <Label className={cn("cursor-pointer text-sm", currentBilling === "monthly" ? "font-semibold text-foreground" : "text-muted-foreground")}>
            Monthly
          </Label>
          <Switch
            checked={currentBilling === "annual"}
            onCheckedChange={(c) => setBilling(c ? "annual" : "monthly")}
            data-testid="billing-toggle"
          />
          <Label className={cn("cursor-pointer text-sm flex items-center gap-2", currentBilling === "annual" ? "font-semibold text-foreground" : "text-muted-foreground")}>
            Annual
            <Badge className="bg-primary/12 text-primary border-primary/20 text-[10px] px-2">Save 10–15%</Badge>
          </Label>
        </div>
      </div>

      {/* Mobile carousel */}
      <div
        className="md:hidden relative px-4 mb-4"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const delta = touchStartX.current - e.changedTouches[0].clientX;
          if (delta > 40) handleMobileSwipe(1);
          else if (delta < -40) handleMobileSwipe(-1);
        }}
      >
        <div className="overflow-hidden">
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
                fmt={fmt}
                bandwidthLabels={BANDWIDTH_LABELS}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="icon" onClick={() => handleMobileSwipe(-1)} disabled={mobileTierIndex === 0} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {TIER_KEYS.map((k, i) => (
              <button
                key={k}
                onClick={() => { setMobileTierIndex(i); handleTierSelect(k); }}
                className={cn("rounded-full transition-all duration-300", i === mobileTierIndex ? "w-8 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-border hover:bg-muted-foreground")}
                data-testid={`tier-dot-${k}`}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleMobileSwipe(1)} disabled={mobileTierIndex === 2} className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">{mobileTierIndex + 1} of 3 — swipe or tap arrows to compare</p>
      </div>

      {/* Desktop 3-col grid */}
      <div className="hidden md:grid container mx-auto px-6 grid-cols-3 gap-5 mb-8 max-w-5xl">
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
              fmt={fmt}
              bandwidthLabels={BANDWIDTH_LABELS}
            />
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Not sure? <button onClick={() => handleTierContinue("pulse")} className="text-primary hover:underline font-medium">Start with Studio</button> — our most popular plan. Switch anytime.
      </p>

      <p className="text-center text-xs text-muted-foreground mt-3">
        Not ready for a retainer?{" "}
        <button
          onClick={() => { setPricingMode("oneTime"); router.push("/pricing"); }}
          className="text-primary hover:underline font-medium"
        >
          Browse one-time projects →
        </button>
      </p>
    </>
  );
}

/* ── Tier Card ── */
function TierCard({
  tierKey, isSelected, billing, onSelect, onContinue, fmt, bandwidthLabels,
}: {
  tierKey: TierKey;
  isSelected: boolean;
  billing: "monthly" | "annual";
  onSelect: (k: TierKey) => void;
  onContinue: (k: TierKey) => void;
  fmt: (v: number) => string;
  bandwidthLabels: Record<string, string>;
}) {
  const t = TIERS[tierKey];
  const price = billing === "annual" ? t.monthly * (1 - t.annualDiscount) : t.monthly;

  return (
    <Card
      data-testid={`tier-card-${tierKey}`}
      onClick={() => onSelect(tierKey)}
      className={cn(
        "h-full flex flex-col cursor-pointer border-2 transition-all duration-200 relative overflow-hidden",
        isSelected
          ? "border-primary shadow-xl shadow-primary/10 ring-4 ring-primary/8"
          : "border-border/60 hover:border-primary/40 hover:shadow-md",
        t.highlight && !isSelected && "border-primary/30",
      )}
    >
      {t.badge && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
      )}
      <CardHeader className="pb-2 pt-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            {t.badge && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] mb-2">{t.badge}</Badge>
            )}
            <div className="font-serif text-2xl font-extrabold">{t.name}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{t.tagline}</div>
          </div>
          {isSelected && (
            <Badge className="bg-primary text-primary-foreground text-[11px] shrink-0">Selected</Badge>
          )}
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold tracking-tight">{fmt(price)}</span>
          <span className="text-muted-foreground text-sm ml-1">/mo</span>
        </div>
        {billing === "annual" && (
          <p className="text-xs text-primary font-medium mt-1">
            {fmt(price * 12)}/yr · save {Math.round(t.annualDiscount * 100)}%
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Creative Bandwidth
        </p>
        <div className="space-y-2.5">
          {Object.entries(t.bandwidth).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{bandwidthLabels[key]}</span>
              <span className="font-medium text-foreground text-right">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-border/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Capabilities included
          </p>
          <ul className="space-y-1.5">
            {t.capabilities.slice(0, 5).map((cap) => (
              <li key={cap} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                {cap}
              </li>
            ))}
            {t.capabilities.length > 5 && (
              <li className="text-xs text-primary font-medium pl-5">
                +{t.capabilities.length - 5} more included
              </li>
            )}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-5">
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full gap-2"
          onClick={(e) => { e.stopPropagation(); onContinue(tierKey); }}
          data-testid={`select-tier-${tierKey}`}
        >
          {isSelected ? "Continue with this plan" : "Select & customize"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
