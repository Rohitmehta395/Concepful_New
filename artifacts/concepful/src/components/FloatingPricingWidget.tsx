import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, X, ChevronRight } from "lucide-react";
import { TIERS, MONTHLY_ADDONS, AI_OPS, calcMonthlyTotal, calcAnnualTotal, TierKey, AiOpsKey } from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIER_KEYS: TierKey[] = ["signal", "pulse", "cortex"];

export function FloatingPricingWidget() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const { tier, setTier, billing, setBilling, addOns, aiOpsLevel, setPricingMode } = usePricingStore();

  const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);
  const displayPrice = billing === "annual" ? Math.round(annualTotal / 12) : Math.round(monthlyTotal);
  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  const tierColors: Record<TierKey, string> = {
    signal: "bg-rose-500/10 text-rose-600 border-rose-500/25",
    pulse: "bg-primary/10 text-primary border-primary/25",
    cortex: "bg-foreground/10 text-foreground border-foreground/20",
  };

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-72 bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Configuration</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Tier selector */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Plan</p>
                <div className="flex gap-1.5">
                  {TIER_KEYS.map(key => (
                    <button
                      key={key}
                      onClick={() => { setTier(key); setPricingMode("retainer"); }}
                      className={cn(
                        "flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all",
                        tier === key
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {TIERS[key].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing toggle */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Billing</p>
                <div className="flex gap-1.5">
                  {(["monthly", "annual"] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setBilling(b)}
                      className={cn(
                        "flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all capitalize",
                        billing === b
                          ? "bg-secondary text-foreground border-border"
                          : "border-border/40 text-muted-foreground hover:border-border"
                      )}
                    >
                      {b}
                      {b === "annual" && <span className="ml-1 text-primary text-[9px]">−15%</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-secondary/30 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{TIERS[tier].name}</span>
                  <span className="font-medium">{fmt(billing === "annual" ? TIERS[tier].monthly * (1 - TIERS[tier].annualDiscount) : TIERS[tier].monthly)}</span>
                </div>
                {addOns.length > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{addOns.length} add-on{addOns.length > 1 ? "s" : ""}</span>
                    <span>+{fmt(addOns.reduce((s, id) => s + (MONTHLY_ADDONS.find(a => a.id === id)?.price ?? 0), 0))}</span>
                  </div>
                )}
                {AI_OPS[aiOpsLevel].price > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>AI ops</span>
                    <span>+{fmt(AI_OPS[aiOpsLevel].price)}</span>
                  </div>
                )}
                <div className="pt-1.5 mt-1.5 border-t border-border/50 flex justify-between items-baseline">
                  <span className="text-xs text-muted-foreground">Est. monthly</span>
                  <span className="text-xl font-bold tracking-tight">{fmt(displayPrice)}</span>
                </div>
              </div>

              <Button size="sm" className="w-full font-semibold gap-1" onClick={() => setLocation("/pricing")}>
                Review Full Breakdown <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed pill / toggle button */}
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl border shadow-lg shadow-black/10 transition-all duration-200 select-none",
          open
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card border-border/60 hover:border-primary/50"
        )}
        data-testid="floating-pricing-widget"
      >
        {!open && (
          <div className="flex items-center gap-2.5">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", tierColors[tier])}>
              {TIERS[tier].name}
            </span>
            <span className="text-sm font-bold tracking-tight">{fmt(displayPrice)}<span className="text-xs font-normal text-muted-foreground ml-0.5">/mo</span></span>
          </div>
        )}
        {open && <span className="text-sm font-semibold">Close</span>}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronUp className="h-4 w-4" />
        </motion.div>
      </motion.button>
    </div>
  );
}
