import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { TIERS, MONTHLY_ADDONS, AI_OPS, PROJECT_ADDONS, calcMonthlyTotal, calcAnnualTotal, TierKey, AiOpsKey } from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/layout/site-layout";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { tier, setTier, billing, setBilling, addOns, setAddOns, aiOpsLevel, setAiOpsLevel } = usePricingStore();

  const handleTierSelect = (t: TierKey) => {
    setTier(t);
  };

  const handleAddOnToggle = (id: string) => {
    setAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);
  const displayPrice = billing === "annual" ? (annualTotal / 12).toFixed(0) : monthlyTotal.toFixed(0);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <SiteLayout>
      <div className="flex-1 pb-24">
        {/* Hero */}
        <section className="pt-24 pb-16 px-6 container mx-auto text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
              Start with clarity.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Creative intelligence as infrastructure. Senior judgment meets AI-amplified execution. Select your partnership level to begin.
            </p>
          </motion.div>
        </section>

        {/* Billing Toggle */}
        <section className="px-6 mb-12 flex justify-center">
          <div className="flex items-center space-x-3 bg-secondary/50 p-2 rounded-full border border-border/50">
            <Label htmlFor="billing-monthly" className={`cursor-pointer ${billing === 'monthly' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Monthly</Label>
            <Switch 
              id="billing-toggle" 
              checked={billing === 'annual'} 
              onCheckedChange={(checked) => setBilling(checked ? 'annual' : 'monthly')} 
            />
            <Label htmlFor="billing-annual" className={`cursor-pointer flex items-center gap-2 ${billing === 'annual' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Annual <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Save 10-15%</Badge>
            </Label>
          </div>
        </section>

        {/* Tiers */}
        <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, t], i) => {
            const isSelected = tier === key;
            const price = billing === "annual" ? t.monthly * (1 - t.annualDiscount) : t.monthly;
            
            let stats = [];
            let included = [];
            let bestFor = "";
            
            if (key === 'signal') {
              stats = ['5 strategic hrs/mo', '10 async requests/mo', '18 AI credits/mo', '2 revision rounds', '48hr SLA', 'Basic brand memory'];
              included = ['Monthly brand pulse check', 'Light creative direction', 'Brand guideline enforcement', 'Quarterly trend memo', 'Social assets', 'One-sheets', 'Flyers', 'Static ads'];
              bestFor = "Early-stage startups, SMBs, founder-led brands, marketing teams";
            } else if (key === 'pulse') {
              stats = ['12 strategic hrs/mo', '25 async requests/mo', '45 AI credits/mo', '3 revision rounds', '24hr SLA', 'Advanced brand memory'];
              included = ['Everything in Signal', 'Shared creative lead', 'Monthly 60-min strategy call', 'Campaign concepting', 'Editorial calendar', 'Messaging framework', 'Campaign asset systems'];
              bestFor = "Growing SMBs, mid-market, product launches, campaign systems";
            } else {
              stats = ['25 strategic hrs/mo', '45 async requests/mo', 'Fair-use priority access', '4 revision rounds', 'Same-day SLA', 'Full brand memory'];
              included = ['Everything in Pulse', 'Dedicated senior creative lead', 'Weekly strategy sync', 'Full campaign strategy', 'Brand architecture consulting', 'Innovation advisory'];
              bestFor = "Mid-market, venture-backed, media companies, advisory firms";
            }

            return (
              <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="h-full">
                <Card 
                  className={`h-full flex flex-col transition-all duration-300 cursor-pointer border-2 ${isSelected ? 'border-primary ring-4 ring-primary/10 shadow-lg' : 'border-border/50 hover:border-primary/50'}`}
                  onClick={() => handleTierSelect(key)}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">{t.name}</CardTitle>
                    <CardDescription>{t.subtitle}</CardDescription>
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-bold tracking-tight">{formatCurrency(price)}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    {billing === 'annual' && (
                      <div className="text-sm text-primary font-medium">Billed annually at {formatCurrency(price * 12)}</div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6">
                      <p className="text-sm font-semibold mb-2">Best for:</p>
                      <p className="text-sm text-muted-foreground">{bestFor}</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Key Stats</p>
                        <ul className="space-y-2">
                          {stats.map(s => (
                            <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm font-semibold mb-2">Included</p>
                        <ul className="space-y-2">
                          {included.map(inc => (
                            <li key={inc} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0 mt-1.5" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant={isSelected ? "default" : "outline"} className="w-full">
                      {isSelected ? "Selected" : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </section>

        {/* Configurator */}
        <section className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-bold mb-6 font-serif">Monthly Add-ons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MONTHLY_ADDONS.map(addon => (
                  <label key={addon.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                    <Checkbox 
                      id={addon.id} 
                      checked={addOns.includes(addon.id)}
                      onCheckedChange={() => handleAddOnToggle(addon.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none mb-1">{addon.label}</p>
                      <p className="text-sm text-muted-foreground">+{formatCurrency(addon.price)}/mo</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 font-serif flex items-center gap-2">
                AI Operations Level
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">Contextual Recommendation</span>
              </h3>
              <RadioGroup value={aiOpsLevel} onValueChange={(v) => setAiOpsLevel(v as AiOpsKey)} className="space-y-4">
                {(Object.entries(AI_OPS) as [AiOpsKey, typeof AI_OPS[AiOpsKey]][]).map(([key, op]) => (
                  <div key={key} className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${aiOpsLevel === key ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'}`}>
                    <RadioGroupItem value={key} id={`ai-ops-${key}`} />
                    <Label htmlFor={`ai-ops-${key}`} className="flex-1 flex justify-between cursor-pointer">
                      <span className="font-medium">{op.label}</span>
                      <span className="text-muted-foreground">{op.price === 0 ? 'Included' : `+${formatCurrency(op.price)}/mo`}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div>
            <div className="bg-card border rounded-xl p-6 md:p-8 sticky top-24 shadow-sm">
              <h3 className="text-xl font-bold mb-6 font-serif">Estimated Configuration</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="font-medium">{TIERS[tier].name} Plan ({billing})</span>
                  <span>{formatCurrency(billing === 'annual' ? TIERS[tier].monthly * (1 - TIERS[tier].annualDiscount) : TIERS[tier].monthly)}</span>
                </div>
                
                {addOns.length > 0 && (
                  <div className="space-y-2 pb-4 border-b">
                    <p className="text-sm text-muted-foreground font-medium">Add-ons</p>
                    {addOns.map(id => {
                      const a = MONTHLY_ADDONS.find(x => x.id === id);
                      return a ? (
                        <div key={id} className="flex justify-between text-sm">
                          <span>{a.label}</span>
                          <span>{formatCurrency(a.price)}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                
                {AI_OPS[aiOpsLevel].price > 0 && (
                  <div className="flex justify-between text-sm pb-4 border-b">
                    <span>{AI_OPS[aiOpsLevel].label}</span>
                    <span>{formatCurrency(AI_OPS[aiOpsLevel].price)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated {billing === 'monthly' ? 'Monthly' : 'Average Monthly'} Total</p>
                  <p className="text-4xl font-bold tracking-tight">{formatCurrency(Number(displayPrice))}</p>
                </div>
                {billing === 'annual' && (
                  <div className="text-right">
                    <p className="text-sm text-primary font-medium">Annual Total</p>
                    <p className="font-semibold">{formatCurrency(annualTotal)}</p>
                  </div>
                )}
              </div>

              <Button size="lg" className="w-full text-lg h-14" onClick={() => setLocation('/pricing')}>
                Review Pricing Breakdown
              </Button>
            </div>
          </div>
        </section>

        {/* Project Addons */}
        <section className="container mx-auto px-6 mb-24">
          <h3 className="text-2xl font-bold mb-8 font-serif text-center">Custom-Scoped Projects</h3>
          <p className="text-center text-muted-foreground mb-8">Estimated Starting At. Not added to monthly total.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_ADDONS.map(proj => (
              <Card key={proj.label} className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <p className="font-medium mb-2">{proj.label}</p>
                  <p className="text-muted-foreground text-sm">Starting at {formatCurrency(proj.startingAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t md:hidden z-50 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{TIERS[tier].name}</p>
          <p className="font-bold">{formatCurrency(Number(displayPrice))}/mo</p>
        </div>
        <Button onClick={() => setLocation('/pricing')}>Let's Get Started</Button>
      </div>
    </SiteLayout>
  );
}
