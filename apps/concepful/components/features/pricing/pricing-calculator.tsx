"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, X, Zap, Clock, Users, RefreshCw,
  ChevronRight, ChevronUp, ChevronDown, Cpu, Bot, Workflow, Boxes, Radar,
} from "lucide-react";
import {
  TIERS, MONTHLY_ADDONS, AI_OPS, PROJECT_ADDONS,
  calcMonthlyTotal, calcAnnualTotal,
  type TierKey, type AiOpsKey,
} from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const EXCLUDED: Record<string, string[]> = {
  signal:  ["UI/UX design", "Campaign strategy", "Motion graphics", "Dedicated creative lead", "Live collaboration"],
  pulse:   ["Full brand architecture", "Product/interface design", "Video production", "Embedded senior team"],
  cortex:  ["Website development", "Physical production", "Media buying", "PR", "Dedicated onsite team"],
};

const BANDWIDTH_ICONS: Record<string, React.ElementType> = {
  concurrent: Zap,
  sla:        Clock,
  team:       Users,
  revisions:  RefreshCw,
};

const AI_ICONS: Record<AiOpsKey, React.ElementType> = {
  none:          Bot,
  integration:   Workflow,
  brand_command: Radar,
  intelligence:  Cpu,
  robotics:      Boxes,
};

const TIER_KEYS: TierKey[] = ["signal", "pulse", "cortex"];

export function PricingCalculator() {
  const router = useRouter();
  
  const {
    tier, setTier, billing, setBilling,
    addOns, setAddOns, aiOpsLevel, setAiOpsLevel,
    pricingMode, setPricingMode, selectedProjects, setSelectedProjects,
  } = usePricingStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleProjectToggle = (id: string) =>
    setSelectedProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const projectsTotal = selectedProjects.reduce(
    (sum, id) => sum + (PROJECT_ADDONS.find(p => p.id === id)?.price ?? 0), 0
  );

  const monthlyTotal   = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annualTotal    = calcAnnualTotal(tier, monthlyTotal, billing);
  const displayPrice   = billing === "annual" ? Math.round(annualTotal / 12) : monthlyTotal;
  const annualSavings  = billing === "annual" ? monthlyTotal * 12 - annualTotal : 0;

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  const t = TIERS[tier];
  const tierPrice = billing === "annual" ? t.monthly * (1 - t.annualDiscount) : t.monthly;

  const handleAddOnToggle = (id: string) =>
    setAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const handleCheckout = () => {
    // markPricingInterest(); // Omitted until auth migration
    if (pricingMode === "oneTime") {
      router.push("/onboarding");
    } else {
      router.push("/checkout");
    }
  };

  // Auto-recommend AI level when tier changes
  const AI_RECOMMEND: Record<TierKey, AiOpsKey> = {
    signal:  "none",
    pulse:   "integration",
    cortex:  "intelligence",
  };
  useEffect(() => { 
    if (mounted) setAiOpsLevel(AI_RECOMMEND[tier]); 
  }, [tier, mounted]);

  // Mobile bottom sheet state
  const [sheetOpen, setSheetOpen] = useState(false);

  // Auto-collapse on scroll
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastY) > 8) {
        setSheetOpen(false);
        lastY = window.scrollY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section refs for scroll-to from sidebar links
  const enhanceRef   = useRef<HTMLElement>(null);
  const aiRef        = useRef<HTMLElement>(null);
  const projectsRef  = useRef<HTMLElement>(null);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* ── Sticky plan bar ── */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-6 py-3 max-w-6xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Back to plan selector"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Plan switcher pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {TIER_KEYS.map(k => (
                <button
                  key={k}
                  onClick={() => { setPricingMode("retainer"); setTier(k); }}
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full border transition-all",
                    pricingMode === "retainer" && tier === k
                      ? "bg-foreground text-background border-foreground"
                      : "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {TIERS[k].name}
                </button>
              ))}
              <button
                onClick={() => setPricingMode("oneTime")}
                className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-full border transition-all",
                  pricingMode === "oneTime"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                1-Time
              </button>
            </div>

            {/* Billing toggle — retainer only */}
            {pricingMode === "retainer" && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className={cn("transition-colors", billing === "monthly" ? "text-foreground font-medium" : "text-muted-foreground")}>
                  Monthly
                </span>
                <Switch
                  checked={billing === "annual"}
                  onCheckedChange={c => setBilling(c ? "annual" : "monthly")}
                />
                <span className={cn("transition-colors flex items-center gap-1.5", billing === "annual" ? "text-foreground font-medium" : "text-muted-foreground")}>
                  Annual
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
                    Save {Math.round(t.annualDiscount * 100)}%
                  </Badge>
                </span>
              </div>
            )}
          </div>

          {/* Live price / quote summary */}
          <div className="flex items-center gap-4 shrink-0">
            {pricingMode === "retainer" ? (
              <div className="text-right hidden sm:block">
                <p className="text-xl font-bold tabular-nums">{fmt(displayPrice)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                {billing === "annual" && <p className="text-xs text-primary">{fmt(annualSavings)} saved / yr</p>}
              </div>
            ) : (
              <div className="text-right hidden sm:block">
                {selectedProjects.length > 0
                  ? <p className="text-sm font-semibold">{selectedProjects.length} project{selectedProjects.length > 1 ? "s" : ""} · {fmt(projectsTotal)}</p>
                  : <p className="text-sm text-muted-foreground">Select projects below</p>
                }
              </div>
            )}
            <Button
              onClick={handleCheckout}
              size="sm"
              className="h-9 px-5 font-semibold text-sm"
              disabled={pricingMode === "oneTime" && selectedProjects.length === 0}
            >
              {pricingMode === "oneTime" ? "Begin Project" : "Proceed to payment"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* ── Left: scrollable config ── */}
          <div className="space-y-16 min-w-0">

            {pricingMode === "oneTime" ? (
              /* ── One-Time Project Picker ── */
              <div className="space-y-8">
                <div>
                  <Badge variant="outline" className="text-primary border-primary/30 mb-4">
                    Single Projects
                  </Badge>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">
                    One-Time Projects
                  </h1>
                  <p className="text-lg text-muted-foreground mb-1">
                    Custom-scoped engagements — no retainer required. Select the projects you need and we'll deliver a tailored quote.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Each project includes a defined block of senior creative hours. Additional time beyond that block is billed at <span className="font-semibold text-foreground">$85/hr</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PROJECT_ADDONS.map(proj => {
                    const selected = selectedProjects.includes(proj.id);
                    return (
                      <motion.label
                        key={proj.id}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex flex-col gap-3 p-5 border rounded-xl cursor-pointer transition-all duration-150",
                          selected
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                            : "border-border/60 hover:border-primary/40 hover:bg-secondary/30",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => handleProjectToggle(proj.id)}
                              className="mt-0.5 shrink-0"
                            />
                            <span className="font-semibold text-sm leading-snug">{proj.label}</span>
                          </div>
                          <span className={cn("text-sm font-bold shrink-0 tabular-nums", selected ? "text-primary" : "text-muted-foreground")}>
                            {fmt(proj.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 pl-7 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {proj.hours}
                          </span>
                          <span>·</span>
                          <span>{proj.weeks} est. timeline</span>
                        </div>
                      </motion.label>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Flat-rate pricing</p>
                  <p className="leading-relaxed">
                    Each project is quoted at a fixed price. Scope is confirmed before work begins — no surprise overages.
                  </p>
                </div>
              </div>
            ) : (
              /* ── Retainer plan header ── */
              <div>
                <Badge variant="outline" className="text-primary border-primary/30 mb-4">
                  {t.badge ?? t.subtitle}
                </Badge>
                <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  {t.name} — Full Breakdown
                </h1>
                <p className="text-xl text-muted-foreground">{t.tagline}</p>
              </div>
            )}

            {pricingMode === "retainer" && (<>

            {/* Bandwidth */}
            <section>
              <h2 className="text-xl font-bold font-serif mb-5">Creative Bandwidth</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(t.bandwidth).map(([key, value]) => {
                  const Icon = BANDWIDTH_ICONS[key];
                  return (
                    <div key={key} className="p-4 rounded-xl border border-border/60 bg-secondary/20">
                      {Icon && <Icon className="h-4 w-4 text-primary mb-2" />}
                      <p className="text-base font-semibold">{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {key.replace(/([A-Z])/g, " $1").replace("_", " ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Capabilities */}
            <section>
              <h2 className="text-xl font-bold font-serif mb-5">Capabilities Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {t.capabilities.map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Not included */}
            {(EXCLUDED[tier] ?? []).length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-serif mb-5 text-muted-foreground">Not Included in {t.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(EXCLUDED[tier] ?? []).map(item => (
                    <div key={item} className="flex items-start gap-3 text-muted-foreground">
                      <X className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Step 2: Enhance ── */}
            <section ref={enhanceRef} className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  Enhance
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight mb-2">Specialist Add-ons</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Capabilities that require specialist practitioners — added to your monthly retainer.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MONTHLY_ADDONS.map(addon => {
                  const checked = addOns.includes(addon.id);
                  return (
                    <motion.label
                      key={addon.id}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150",
                        checked
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border/60 hover:border-primary/40 hover:bg-secondary/40",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleAddOnToggle(addon.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{addon.label}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{addon.description}</p>
                        <p className="text-sm text-primary font-semibold mt-2">+{fmt(addon.price)}/mo</p>
                      </div>
                    </motion.label>
                  );
                })}
              </div>
            </section>

            {/* ── Step 3: AI Intelligence ── */}
            <section ref={aiRef} className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  AI Integration
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight mb-2">AI Intelligence Level</h2>
              <p className="text-muted-foreground text-sm mb-6">
                All plans ship with Baseline AI Services. Upgrade to embed AI more deeply into your company's infrastructure.
              </p>

              {/* Baseline AI — always included, locked at top */}
              <div className="flex items-start gap-4 p-5 rounded-xl border-2 border-primary/30 bg-primary/5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm">{AI_OPS.none.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Always Included
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed block">{AI_OPS.none.description}</span>
                  <span className="text-sm font-semibold text-primary block mt-1.5">Included in all plans</span>
                </div>
              </div>

              {/* Upgrade options */}
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Upgrade AI Integration
              </p>
              <RadioGroup
                value={aiOpsLevel === "none" ? "" : aiOpsLevel}
                onValueChange={v => setAiOpsLevel(v as AiOpsKey)}
                className="grid grid-cols-1 gap-4"
              >
                {(Object.entries(AI_OPS).filter(([k]) => k !== "none") as [AiOpsKey, (typeof AI_OPS)[AiOpsKey]][]).map(([key, op]) => {
                  const Icon = AI_ICONS[key];
                  const selected = aiOpsLevel === key;
                  const recommended = AI_RECOMMEND[tier] === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setAiOpsLevel(selected ? "none" : key)}
                      className={cn(
                        "relative flex items-start gap-4 p-5 border rounded-xl transition-all cursor-pointer group",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border/60 hover:border-primary/30 hover:bg-secondary/20",
                      )}
                    >
                      {recommended && (
                        <span className="absolute top-3 right-3 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                      <RadioGroupItem value={key} id={`ai-${key}`} className="mt-1 shrink-0" />
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        selected ? "bg-primary/15" : "bg-secondary/60 group-hover:bg-primary/10",
                      )}>
                        <Icon className={cn("h-4.5 w-4.5 transition-colors", selected ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                      </div>
                      <Label htmlFor={`ai-${key}`} className="flex-1 cursor-pointer space-y-1 min-w-0">
                        <span className="font-semibold text-sm block">{op.label}</span>
                        <span className="text-xs text-muted-foreground block leading-relaxed">{op.description}</span>
                        {op.compute && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70 bg-secondary/60 border border-border/60 px-2 py-0.5 rounded-md mt-1">
                            <Cpu className="h-2.5 w-2.5" /> {op.compute}
                          </span>
                        )}
                        <span className="text-sm font-semibold block mt-1.5" style={{ color: selected ? "hsl(349,90%,54%)" : undefined }}>
                          +{fmt(op.price)}/mo
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </section>

            </>)}

          </div>

          {/* ── Right: sticky order summary ── */}
          <div className="hidden lg:block">
            <Card className="sticky top-[120px] border-primary/20 shadow-lg shadow-primary/5">
              <CardContent className="p-6">
                <h3 className="text-base font-bold mb-1 font-serif">
                  {pricingMode === "oneTime" ? "Project Estimate" : "Order Summary"}
                </h3>

                {pricingMode === "retainer" ? (
                  <>
                    {/* Jump links — retainer mode */}
                    <div className="flex flex-col gap-0.5 mb-5 border-b border-border/40 pb-4">
                      {[
                        { label: "Enhancements", ref: enhanceRef },
                        { label: "AI Integration", ref: aiRef },
                      ].map(({ label, ref }) => (
                        <button
                          key={label}
                          onClick={() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors text-left py-0.5"
                        >
                          <ChevronRight className="h-3 w-3" /> {label}
                        </button>
                      ))}
                    </div>

                    {/* Retainer line items */}
                    <div className="space-y-2.5 text-sm mb-5">
                      <div className="flex justify-between items-start pb-3 border-b border-border/40">
                        <div>
                          <p className="font-medium">{t.name} plan</p>
                          <p className="text-xs text-muted-foreground capitalize">{billing} billing</p>
                        </div>
                        <span className="font-medium shrink-0 ml-2">{fmt(tierPrice)}/mo</span>
                      </div>

                      {addOns.length > 0 && (
                        <div className="space-y-1.5 pb-3 border-b border-border/40">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Specialist add-ons</p>
                          {addOns.map(id => {
                            const a = MONTHLY_ADDONS.find(x => x.id === id);
                            return a ? (
                              <div key={id} className="flex justify-between text-muted-foreground">
                                <span className="truncate mr-2">{a.label}</span>
                                <span className="shrink-0">+{fmt(a.price)}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                      {AI_OPS[aiOpsLevel].price > 0 && (
                        <div className="flex justify-between text-muted-foreground pb-3 border-b border-border/40">
                          <span className="truncate mr-2">{AI_OPS[aiOpsLevel].label}</span>
                          <span className="shrink-0">+{fmt(AI_OPS[aiOpsLevel].price)}</span>
                        </div>
                      )}
                    </div>

                    {/* Retainer total */}
                    <div className="bg-secondary/50 rounded-xl p-4 mb-5">
                      <div className="flex justify-between items-end mb-0.5">
                        <span className="text-xs text-muted-foreground">
                          {billing === "annual" ? "Monthly avg" : "Monthly total"}
                        </span>
                        <span className="text-2xl font-bold tracking-tight tabular-nums">{fmt(displayPrice)}</span>
                      </div>
                      {billing === "annual" && (
                        <>
                          <div className="flex justify-between text-xs pt-2 border-t border-border/40 mt-2">
                            <span className="text-muted-foreground">Annual total</span>
                            <span className="font-semibold">{fmt(annualTotal)}</span>
                          </div>
                          {annualSavings > 0 && (
                            <div className="flex justify-between text-xs text-primary mt-1">
                              <span>You save</span>
                              <span className="font-semibold">{fmt(annualSavings)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <Button size="lg" className="w-full font-semibold text-sm h-11" onClick={handleCheckout}>
                      Proceed to Payment
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      Secured by Stripe · Cancel anytime
                    </p>
                  </>
                ) : (
                  <>
                    {/* One-time project line items */}
                    {selectedProjects.length === 0 ? (
                      <p className="text-xs text-muted-foreground mt-3 mb-5">
                        Select one or more projects from the list to build your estimate.
                      </p>
                    ) : (
                      <div className="space-y-3 text-sm mt-4 mb-5">
                        {selectedProjects.map(id => {
                          const p = PROJECT_ADDONS.find(x => x.id === id);
                          return p ? (
                            <div key={id} className="pb-3 border-b border-border/40">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <span className="font-medium leading-snug">{p.label}</span>
                                <span className="font-semibold shrink-0 text-primary">{fmt(p.price)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{p.hours} · {p.weeks} est.</span>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Projects starting-from total */}
                    {selectedProjects.length > 0 && (
                      <div className="bg-secondary/50 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-muted-foreground">Flat Total</span>
                          <span className="text-2xl font-bold tracking-tight tabular-nums">{fmt(projectsTotal)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Fixed price · Scope confirmed before work begins.
                        </p>
                      </div>
                    )}


                    <Button
                      size="lg"
                      className="w-full font-semibold text-sm h-11"
                      onClick={handleCheckout}
                      disabled={selectedProjects.length === 0}
                    >
                      {selectedProjects.length === 0 ? "Select a project to continue" : "Begin Project"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      No commitment required · Scoped before you pay
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Backdrop when open */}
        <AnimatePresence>
          {sheetOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSheetOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="relative z-50 bg-background border-t border-border/40 shadow-2xl rounded-t-2xl overflow-hidden"
          animate={{ height: sheetOpen ? "auto" : 72 }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }}
          style={{ maxHeight: "75dvh" }}
        >
          {/* Collapsed summary row — toggle area + CTA as siblings, never nested */}
          <div className="flex items-center gap-2 px-5 py-4">
            {/* Tap-to-toggle: price + plan + badge + chevron */}
            <button
              onClick={() => setSheetOpen(v => !v)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left focus-visible:outline-none"
              aria-label={sheetOpen ? "Collapse order summary" : "Expand order summary"}
            >
              <div className="min-w-0">
                <p className="text-base font-bold tabular-nums leading-none">
                  {fmt(displayPrice)}<span className="text-xs font-normal text-muted-foreground ml-0.5">/mo</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.name} · {billing}</p>
              </div>
              {(addOns.length > 0 || AI_OPS[aiOpsLevel].price > 0) && (
                <span className="shrink-0 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  {addOns.length + (AI_OPS[aiOpsLevel].price > 0 ? 1 : 0)} add-on{(addOns.length + (AI_OPS[aiOpsLevel].price > 0 ? 1 : 0)) !== 1 ? "s" : ""}
                </span>
              )}
              {sheetOpen
                ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                : <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
              }
            </button>

            {/* CTA — sibling of toggle, never inside it */}
            <Button
              size="sm"
              className="h-8 px-4 font-semibold text-xs shrink-0"
              onClick={handleCheckout}
            >
              Proceed
            </Button>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-y-auto px-5 pb-6"
                style={{ maxHeight: "calc(75dvh - 72px)" }}
              >
                <div className="border-t border-border/40 pt-4 space-y-3 text-sm mb-4">
                  {/* Base plan */}
                  <div className="flex justify-between items-start pb-3 border-b border-border/40">
                    <div>
                      <p className="font-medium">{t.name} plan</p>
                      <p className="text-xs text-muted-foreground capitalize">{billing} billing</p>
                    </div>
                    <span className="font-medium shrink-0 ml-2">{fmt(tierPrice)}/mo</span>
                  </div>

                  {/* Add-ons */}
                  {addOns.length > 0 && (
                    <div className="space-y-1.5 pb-3 border-b border-border/40">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Specialist add-ons</p>
                      {addOns.map(id => {
                        const a = MONTHLY_ADDONS.find(x => x.id === id);
                        return a ? (
                          <div key={id} className="flex justify-between text-muted-foreground">
                            <span className="truncate mr-2">{a.label}</span>
                            <span className="shrink-0">+{fmt(a.price)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* AI level */}
                  {AI_OPS[aiOpsLevel].price > 0 && (
                    <div className="flex justify-between text-muted-foreground pb-3 border-b border-border/40">
                      <span className="truncate mr-2">{AI_OPS[aiOpsLevel].label}</span>
                      <span className="shrink-0">+{fmt(AI_OPS[aiOpsLevel].price)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="bg-secondary/50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground">
                      {billing === "annual" ? "Monthly avg" : "Monthly total"}
                    </span>
                    <span className="text-2xl font-bold tracking-tight tabular-nums">{fmt(displayPrice)}</span>
                  </div>
                  {billing === "annual" && annualSavings > 0 && (
                    <div className="flex justify-between text-xs text-primary mt-2 pt-2 border-t border-border/40">
                      <span>You save annually</span>
                      <span className="font-semibold">{fmt(annualSavings)}</span>
                    </div>
                  )}
                </div>

                <Button size="lg" className="w-full font-semibold" onClick={handleCheckout}>
                  Proceed to Payment
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Secured by Stripe · Cancel anytime
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom padding for mobile sheet */}
      <div className="h-20 lg:h-0" />
    </>
  );
}
