import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ChevronLeft, ChevronRight, ArrowRight,
  Layers, Palette, Globe, Megaphone, Monitor, PenTool,
  Lightbulb, FileText, Sparkles, Zap, Clock,
} from "lucide-react";
import {
  TIERS, calcMonthlyTotal, calcAnnualTotal,
  type TierKey,
} from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { useAuthState } from "@/hooks/use-auth-state";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/layout/site-layout";
import { FloatingPricingWidget } from "@/components/FloatingPricingWidget";
import { cn } from "@/lib/utils";

const TIER_KEYS: TierKey[] = ["signal", "pulse", "cortex"];

const CAPABILITIES = [
  { icon: Monitor,    label: "Product Design" },
  { icon: Layers,     label: "UI / UX Design" },
  { icon: Globe,      label: "Web Design" },
  { icon: Palette,    label: "Brand Identity" },
  { icon: Megaphone,  label: "Campaigns" },
  { icon: FileText,   label: "Presentations" },
  { icon: PenTool,    label: "Creative Direction" },
  { icon: Lightbulb,  label: "Concept Development" },
  { icon: Sparkles,   label: "Marketing Assets" },
];

const SEGMENTS = [
  {
    label: "Solo Founders",
    desc: "From zero to a brand that punches above its weight. Pitch decks, landing pages, identity — done.",
    range: "Core plan",
    color: "border-rose-500/30 bg-rose-500/5",
    accent: "text-rose-500",
  },
  {
    label: "Startups",
    desc: "Build fast, look great, stay consistent. Your design partner from seed through Series B.",
    range: "Core → Studio",
    color: "border-primary/30 bg-primary/5",
    accent: "text-primary",
  },
  {
    label: "SMBs",
    desc: "Marketing that scales with your team. Campaign assets, brand systems, and ongoing creative.",
    range: "Studio plan",
    color: "border-amber-500/30 bg-amber-500/5",
    accent: "text-amber-500",
  },
  {
    label: "Mid-Market",
    desc: "An embedded creative department that thinks like your business and moves at your speed.",
    range: "Department plan",
    color: "border-violet-500/30 bg-violet-500/5",
    accent: "text-violet-500",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick your plan",
    desc: "Choose creative bandwidth that matches your pace — like picking a data plan. Takes 2 minutes.",
    icon: Zap,
  },
  {
    step: "02",
    title: "Submit your first brief",
    desc: "Use our simple request form on any device. Describe what you need — we'll handle the rest.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Get work back, fast",
    desc: "Receive polished, on-brand creative within your SLA. Revise, approve, and keep moving.",
    icon: Clock,
  },
];

const BANDWIDTH_LABELS: Record<string, string> = {
  concurrent: "Active projects",
  requests:   "Monthly requests",
  sla:        "Turnaround",
  strategy:   "Strategy time",
  revisions:  "Revisions",
  team:       "Your team",
};

export default function Landing() {
  const [, setLocation] = useLocation();
  const { markPricingInterest } = useAuthState();
  const { tier, setTier, billing, setBilling, addOns, aiOpsLevel } = usePricingStore();

  const [mobileTierIndex, setMobileTierIndex] = useState(TIER_KEYS.indexOf(tier));
  const touchStartX = useRef(0);

  const monthlyTotal  = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annualTotal   = calcAnnualTotal(tier, monthlyTotal, billing);
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  const handleMobileSwipe = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(2, mobileTierIndex + dir));
    setMobileTierIndex(next);
    setTier(TIER_KEYS[next]);
  };

  const handleTierSelect = (key: TierKey) => {
    setTier(key);
    setMobileTierIndex(TIER_KEYS.indexOf(key));
  };

  const handleTierContinue = (key: TierKey) => {
    handleTierSelect(key);
    markPricingInterest();
    setLocation("/pricing");
  };

  return (
    <SiteLayout>
      <div className="flex-1 pb-32">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ background: "hsl(232, 28%, 11%)" }}>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(349, 90%, 54%, 0.3) 0%, transparent 60%)",
            }}
          />
          <div className="relative container mx-auto px-6 pt-20 pb-24 max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-semibold uppercase tracking-widest text-white/70 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Creative Department-as-a-Service
              </div>

              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[0.95]">
                Your creative<br />
                <span style={{ color: "hsl(349, 90%, 54%)" }}>department,</span><br />
                on demand.
              </h1>

              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
                Stop patching together freelancers and agencies. Get a complete, expert creative team
                — product design, branding, campaigns, and more — that activates in 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base font-semibold"
                  style={{ backgroundColor: "hsl(349, 90%, 54%)" }}
                  onClick={() => document.getElementById("plan-selector")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                >
                  Choose a plan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-13 px-8 text-base text-white/80 hover:text-white hover:bg-white/10 border border-white/15"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  See how it works
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/40"
            >
              {["No hiring. No retainer surprises.", "Cancel anytime.", "Work starts within 24 hours."].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />{t}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CAPABILITIES ── */}
        <section className="py-16 px-6 border-b border-border/40">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">What you can build</p>
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                One team. Every creative discipline.
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                We're not selling deliverables — we're selling creative capability. Your team handles whatever you need, as you need it.
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-3 md:gap-4">
              {CAPABILITIES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all text-center group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="text-xs font-medium leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLAN SELECTOR ── */}
        <section id="plan-selector" className="pt-16 pb-10 px-6 scroll-mt-8">
          <div className="container mx-auto max-w-5xl mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Choose your plan</p>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Creative bandwidth that fits your team.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Like selecting a mobile plan — pick the capacity that fits your pace. Upgrade or downgrade anytime.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3 bg-secondary/60 px-4 py-2.5 rounded-full border border-border/60">
              <Label className={cn("cursor-pointer text-sm", billing === "monthly" ? "font-semibold text-foreground" : "text-muted-foreground")}>
                Monthly
              </Label>
              <Switch
                checked={billing === "annual"}
                onCheckedChange={(c) => setBilling(c ? "annual" : "monthly")}
                data-testid="billing-toggle"
              />
              <Label className={cn("cursor-pointer text-sm flex items-center gap-2", billing === "annual" ? "font-semibold text-foreground" : "text-muted-foreground")}>
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
                    isSelected={tier === TIER_KEYS[mobileTierIndex]}
                    billing={billing}
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
                  isSelected={tier === key}
                  billing={billing}
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
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          className="border-t border-border/40 py-20 px-6"
          style={{ background: "hsl(232, 28%, 11%)" }}
        >
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Simple process</p>
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
                Up and running in 24 hours
              </h2>
              <p className="text-white/50 max-w-md mx-auto">
                The entire purchase and onboarding can be completed on your phone in under five minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative p-6 rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-4xl font-bold tabular-nums text-white/10 font-serif">{step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BUILT FOR YOUR STAGE ── */}
        <section className="py-20 px-6 border-t border-border/40">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Built for your stage</p>
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Wherever you are, we fit in.
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                One platform, four segments. Concepful scales with you from first pitch deck to enterprise brand system.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {SEGMENTS.map(({ label, desc, range, color, accent }) => (
                <div key={label} className={cn("p-6 rounded-2xl border transition-all hover:shadow-md", color)}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-xl font-bold">{label}</h3>
                    <Badge variant="outline" className={cn("text-[11px] shrink-0", accent)}>{range}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section
          className="py-20 px-6 text-center"
          style={{ background: "hsl(232, 28%, 11%)" }}
        >
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5">
                Stop hiring.<br />Start creating.
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-md mx-auto">
                Add a creative department to your company today. Cancel anytime.
              </p>
              <Button
                size="lg"
                className="h-14 px-10 text-base font-semibold"
                style={{ backgroundColor: "hsl(349, 90%, 54%)" }}
                onClick={() => document.getElementById("plan-selector")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              >
                Choose your plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

      </div>

      <FloatingPricingWidget />
    </SiteLayout>
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
