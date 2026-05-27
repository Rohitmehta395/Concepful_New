import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { TIERS, MONTHLY_ADDONS, AI_OPS, PROJECT_ADDONS, calcMonthlyTotal, calcAnnualTotal, TierKey, AiOpsKey } from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/layout/site-layout";
import { FloatingPricingWidget } from "@/components/FloatingPricingWidget";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "tier", label: "Choose Tier" },
  { id: "addons", label: "Add-ons" },
  { id: "ai-ops", label: "AI Operations" },
  { id: "review", label: "Review & Pricing" },
];

const TIER_KEYS: TierKey[] = ["signal", "pulse", "cortex"];

const TIER_DETAILS: Record<TierKey, { stats: string[]; included: string[]; bestFor: string; accent: string }> = {
  signal: {
    accent: "from-rose-500/5 to-transparent",
    bestFor: "Early-stage startups, SMBs, founder-led brands, marketing teams",
    stats: ["5 strategic hrs/mo", "10 async requests/mo", "18 AI credits/mo", "2 revision rounds", "48hr SLA", "Basic brand memory", "0 quarterly sessions"],
    included: ["Monthly brand pulse check", "Light creative direction", "Brand guideline enforcement", "Quarterly trend memo", "Social assets & one-sheets", "Flyers & static ads", "Basic email templates", "AI concept variations"],
  },
  pulse: {
    accent: "from-primary/5 to-transparent",
    bestFor: "Growing SMBs, mid-market, product launches, campaign systems, brand refreshes",
    stats: ["12 strategic hrs/mo", "25 async requests/mo", "45 AI credits/mo", "3 revision rounds", "24hr SLA", "Advanced brand memory", "1 quarterly session"],
    included: ["Everything in Signal", "Shared creative lead", "Monthly 60-min strategy call", "Campaign concepting & direction", "Editorial calendar consultation", "Messaging framework", "Campaign asset systems", "Brand voice modeling"],
  },
  cortex: {
    accent: "from-accent/5 to-transparent",
    bestFor: "Mid-market, venture-backed, media companies, advisory firms treating brand as strategic infrastructure",
    stats: ["25 strategic hrs/mo", "45 async requests/mo", "Fair-use priority access", "4 revision rounds", "Same-day SLA", "Full brand memory", "2 quarterly sessions"],
    included: ["Everything in Pulse", "Dedicated senior creative lead", "Weekly strategy sync", "Full campaign strategy", "Brand architecture consulting", "Innovation advisory", "Pitch ecosystem design", "Custom AI workflow pipelines"],
  },
};

export default function Landing() {
  const [, setLocation] = useLocation();
  const { tier, setTier, billing, setBilling, addOns, setAddOns, aiOpsLevel, setAiOpsLevel } = usePricingStore();

  const [activeStep, setActiveStep] = useState(0);
  const [mobileTierIndex, setMobileTierIndex] = useState(TIER_KEYS.indexOf(tier));
  const tierScrollRef = useRef<HTMLDivElement>(null);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const handleAddOnToggle = (id: string) => {
    setAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);
  const displayPrice = billing === "annual" ? Math.round(annualTotal / 12) : monthlyTotal;
  const annualSavings = billing === "annual" ? monthlyTotal * 12 - annualTotal : 0;

  const fmt = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  // Track scroll position for active step highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveStep(idx);
          }
        });
      },
      { threshold: 0.4 }
    );
    sectionRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Sync mobile swipe -> tier selection
  const handleMobileSwipe = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(2, mobileTierIndex + dir));
    setMobileTierIndex(next);
    setTier(TIER_KEYS[next]);
  };

  const handleTierSelect = (key: TierKey) => {
    setTier(key);
    setMobileTierIndex(TIER_KEYS.indexOf(key));
  };

  const aiOpsRecommendation: Record<TierKey, AiOpsKey> = { signal: "basic", pulse: "advanced", cortex: "embedded" };

  return (
    <SiteLayout>
      <div className="flex-1 pb-32">

        {/* Vertical step indicator — desktop left rail */}
        <div className="hidden lg:flex flex-col fixed left-8 top-1/2 -translate-y-1/2 z-40 gap-1">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="flex items-center gap-3 group text-left"
            >
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === activeStep ? "bg-primary scale-150" : "bg-border group-hover:bg-muted-foreground"
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-200 whitespace-nowrap",
                i === activeStep ? "text-foreground opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
              )}>
                {step.label}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile step dots — top */}
        <div className="flex lg:hidden justify-center gap-2 pt-6 pb-0 px-6">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex flex-col items-center gap-1"
            >
              <div className={cn(
                "rounded-full transition-all duration-300",
                i === activeStep ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                i === activeStep ? "text-primary" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── STEP 1: Hero + Tiers ── */}
        <section
          ref={el => { sectionRefs.current[0] = el; }}
          className="pt-16 pb-4 px-6 scroll-mt-8"
        >
          <div className="container mx-auto max-w-5xl text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <h1 className="font-serif text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-5 leading-none">
                Start with clarity.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Creative intelligence as infrastructure. Select your partnership level below — pricing updates instantly.
              </p>
            </motion.div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3 bg-secondary/60 px-4 py-2.5 rounded-full border border-border/60">
              <Label className={cn("cursor-pointer text-sm", billing === "monthly" ? "font-semibold text-foreground" : "text-muted-foreground")}>
                Monthly
              </Label>
              <Switch checked={billing === "annual"} onCheckedChange={(c) => setBilling(c ? "annual" : "monthly")} data-testid="billing-toggle" />
              <Label className={cn("cursor-pointer text-sm flex items-center gap-2", billing === "annual" ? "font-semibold text-foreground" : "text-muted-foreground")}>
                Annual
                <Badge className="bg-primary/12 text-primary border-primary/20 text-[10px] px-2">Save 10–15%</Badge>
              </Label>
            </div>
          </div>

          {/* ── MOBILE: Horizontal swipe carousel ── */}
          <div className="md:hidden relative px-6 mb-4">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileTierIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {(() => {
                    const key = TIER_KEYS[mobileTierIndex];
                    const t = TIERS[key];
                    const det = TIER_DETAILS[key];
                    const price = billing === "annual" ? t.monthly * (1 - t.annualDiscount) : t.monthly;
                    const isSelected = tier === key;
                    return (
                      <Card
                        data-testid={`tier-card-${key}`}
                        onClick={() => handleTierSelect(key)}
                        className={cn(
                          "border-2 transition-all duration-200 cursor-pointer",
                          isSelected ? "border-primary shadow-lg shadow-primary/10" : "border-border/60"
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-serif text-2xl font-extrabold">{t.name}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">{t.subtitle}</div>
                            </div>
                            {isSelected && <Badge className="bg-primary text-primary-foreground">Selected</Badge>}
                          </div>
                          <div className="mt-4">
                            <span className="text-4xl font-bold tracking-tight">{fmt(price)}</span>
                            <span className="text-muted-foreground text-sm ml-1">/mo</span>
                          </div>
                          {billing === "annual" && (
                            <p className="text-xs text-primary font-medium mt-1">Billed {fmt(price * 12)}/yr</p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-5">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Best for</p>
                            <p className="text-sm text-foreground leading-relaxed">{det.bestFor}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Stats</p>
                            <div className="grid grid-cols-2 gap-2">
                              {det.stats.map(s => (
                                <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Check className="h-3 w-3 text-primary shrink-0" />{s}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Included</p>
                            <ul className="space-y-1.5">
                              {det.included.map(inc => (
                                <li key={inc} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0 mt-1" />
                                  {inc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            className="w-full"
                            onClick={(e) => { e.stopPropagation(); handleTierSelect(key); }}
                            data-testid={`select-tier-${key}`}
                          >
                            {isSelected ? "Selected" : "Select Plan"}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Swipe controls */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMobileSwipe(-1)}
                disabled={mobileTierIndex === 0}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Pill dots */}
              <div className="flex items-center gap-2">
                {TIER_KEYS.map((k, i) => (
                  <button
                    key={k}
                    onClick={() => { setMobileTierIndex(i); handleTierSelect(k); }}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      i === mobileTierIndex ? "w-8 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-border hover:bg-muted-foreground"
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

            {/* Tier label below dots */}
            <p className="text-center text-xs text-muted-foreground mt-2">
              {mobileTierIndex + 1} of 3 — swipe or tap arrows to compare
            </p>
          </div>

          {/* ── DESKTOP: 3-column grid ── */}
          <div className="hidden md:grid container mx-auto px-6 grid-cols-3 gap-6 mb-4">
            {TIER_KEYS.map((key, i) => {
              const t = TIERS[key];
              const det = TIER_DETAILS[key];
              const isSelected = tier === key;
              const price = billing === "annual" ? t.monthly * (1 - t.annualDiscount) : t.monthly;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="h-full"
                >
                  <Card
                    data-testid={`tier-card-${key}`}
                    onClick={() => handleTierSelect(key)}
                    className={cn(
                      "h-full flex flex-col cursor-pointer border-2 transition-all duration-200",
                      isSelected
                        ? "border-primary shadow-xl shadow-primary/10 ring-4 ring-primary/8"
                        : "border-border/60 hover:border-primary/40 hover:shadow-md"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="font-serif text-2xl font-extrabold">{t.name}</div>
                          <div className="text-sm text-muted-foreground mt-0.5">{t.subtitle}</div>
                        </div>
                        {isSelected && <Badge className="bg-primary text-primary-foreground text-[11px]">Selected</Badge>}
                      </div>
                      <div className="mt-4">
                        <span className="text-4xl font-bold tracking-tight">{fmt(price)}</span>
                        <span className="text-muted-foreground text-sm ml-1">/mo</span>
                      </div>
                      {billing === "annual" && (
                        <p className="text-xs text-primary font-medium mt-1">Billed {fmt(price * 12)}/yr — save {fmt(t.monthly * 12 * t.annualDiscount)}</p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 space-y-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Best for</p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{det.bestFor}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Stats</p>
                        <ul className="space-y-1.5">
                          {det.stats.map(s => (
                            <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="h-3.5 w-3.5 text-primary shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-4 border-t border-border/60">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Included</p>
                        <ul className="space-y-1.5">
                          {det.included.map(inc => (
                            <li key={inc} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0 mt-1.5" />{inc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className="w-full"
                        onClick={(e) => { e.stopPropagation(); handleTierSelect(key); }}
                        data-testid={`select-tier-${key}`}
                      >
                        {isSelected ? "Selected" : "Select Plan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── STEP 2: Monthly Add-ons ── */}
        <section
          ref={el => { sectionRefs.current[1] = el; }}
          className="container mx-auto px-6 py-16 scroll-mt-8 max-w-5xl"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Step 2</span>
            </div>
            <h2 className="font-serif text-3xl font-extrabold tracking-tight mb-2">Monthly Add-ons</h2>
            <p className="text-muted-foreground">Optional enhancements added to your monthly retainer.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MONTHLY_ADDONS.map(addon => {
              const checked = addOns.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  data-testid={`addon-${addon.id}`}
                  className={cn(
                    "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150",
                    checked ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40 hover:bg-secondary/40"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleAddOnToggle(addon.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold leading-tight">{addon.label}</p>
                    <p className="text-sm text-primary font-medium mt-1">+{fmt(addon.price)}/mo</p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* ── STEP 3: AI Operations ── */}
        <section
          ref={el => { sectionRefs.current[2] = el; }}
          className="container mx-auto px-6 py-16 scroll-mt-8 max-w-5xl border-t border-border/40"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Step 3</span>
              <Badge variant="outline" className="text-[10px]">
                Recommended: {AI_OPS[aiOpsRecommendation[tier]].label} for {TIERS[tier].name}
              </Badge>
            </div>
            <h2 className="font-serif text-3xl font-extrabold tracking-tight mb-2">AI Operations Level</h2>
            <p className="text-muted-foreground">Brand memory, vector indexing, and agentic workflow infrastructure.</p>
          </div>
          <RadioGroup value={aiOpsLevel} onValueChange={(v) => setAiOpsLevel(v as AiOpsKey)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.entries(AI_OPS) as [AiOpsKey, typeof AI_OPS[AiOpsKey]][]).map(([key, op]) => {
              const isRec = key === aiOpsRecommendation[tier] && key !== "none";
              return (
                <div
                  key={key}
                  data-testid={`ai-ops-${key}`}
                  className={cn(
                    "relative flex items-start gap-4 p-5 border rounded-xl transition-all cursor-pointer",
                    aiOpsLevel === key ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"
                  )}
                  onClick={() => setAiOpsLevel(key)}
                >
                  {isRec && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recommended</span>
                  )}
                  <RadioGroupItem value={key} id={`aiops-${key}`} className="mt-1" />
                  <Label htmlFor={`aiops-${key}`} className="flex-1 cursor-pointer">
                    <span className="font-semibold text-sm block">{op.label}</span>
                    <span className="text-sm text-primary font-medium block mt-0.5">
                      {op.price === 0 ? "Included" : `+${fmt(op.price)}/mo`}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-4">AI infrastructure pricing may scale based on usage, compute, storage, and model access.</p>
        </section>

        {/* ── STEP 4: Review / Summary + Project Add-ons ── */}
        <section
          ref={el => { sectionRefs.current[3] = el; }}
          className="container mx-auto px-6 py-16 scroll-mt-8 max-w-5xl border-t border-border/40"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Summary card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">Step 4</span>
                </div>
                <h2 className="font-serif text-3xl font-extrabold tracking-tight mb-6">Review Pricing</h2>
                <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-border/60">
                      <div>
                        <p className="font-semibold">{TIERS[tier].name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{billing} billing</p>
                      </div>
                      <p className="font-semibold">{fmt(TIERS[tier].monthly)}</p>
                    </div>

                    {addOns.length > 0 && (
                      <div className="space-y-2 pb-4 border-b border-border/60">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add-ons</p>
                        {addOns.map(id => {
                          const a = MONTHLY_ADDONS.find(x => x.id === id);
                          return a ? (
                            <div key={id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{a.label}</span>
                              <span>+{fmt(a.price)}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {AI_OPS[aiOpsLevel].price > 0 && (
                      <div className="flex justify-between text-sm pb-4 border-b border-border/60">
                        <span className="text-muted-foreground">{AI_OPS[aiOpsLevel].label}</span>
                        <span>+{fmt(AI_OPS[aiOpsLevel].price)}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="flex justify-between items-end mb-1">
                        <p className="text-sm text-muted-foreground">{billing === "annual" ? "Avg monthly" : "Monthly total"}</p>
                        <p className="text-3xl font-bold tracking-tight">{fmt(displayPrice)}</p>
                      </div>
                      {billing === "annual" && (
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Annual total</span>
                          <span className="font-semibold">{fmt(annualTotal)}</span>
                        </div>
                      )}
                      {billing === "annual" && annualSavings > 0 && (
                        <div className="flex justify-between text-sm text-primary mt-1">
                          <span>Annual savings</span>
                          <span className="font-semibold">{fmt(annualSavings)}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      data-testid="review-pricing-btn"
                      size="lg"
                      className="w-full h-12 text-base font-semibold mt-2"
                      onClick={() => setLocation("/pricing")}
                    >
                      Review Full Breakdown
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Project add-ons */}
            <div className="lg:col-span-3">
              <h3 className="font-serif text-2xl font-extrabold tracking-tight mb-2">Custom-Scoped Projects</h3>
              <p className="text-muted-foreground text-sm mb-6">Estimated starting prices. Not included in monthly total — scoped per engagement.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_ADDONS.map(proj => (
                  <div
                    key={proj.label}
                    className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <p className="text-sm font-medium">{proj.label}</p>
                    <p className="text-sm text-muted-foreground ml-4 shrink-0">from {fmt(proj.startingAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      <FloatingPricingWidget />
    </SiteLayout>
  );
}
