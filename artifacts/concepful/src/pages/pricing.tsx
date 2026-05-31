import { Link, useLocation } from "wouter";
import { ArrowLeft, Check, X } from "lucide-react";
import { TIERS, MONTHLY_ADDONS, AI_OPS, PROJECT_ADDONS, calcMonthlyTotal, calcAnnualTotal } from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/layout/site-layout";

export default function PricingBreakdown() {
  const [, setLocation] = useLocation();
  const { tier, billing, addOns, aiOpsLevel } = usePricingStore();

  const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);
  const displayPrice = billing === "annual" ? (annualTotal / 12).toFixed(0) : monthlyTotal.toFixed(0);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const t = TIERS[tier];
  
  let included = [];
  let excluded = [];

  if (tier === 'signal') {
    included = ['Monthly brand pulse check', 'Light creative direction', 'Brand guideline enforcement', 'Quarterly trend memo', 'Social assets', 'One-sheets', 'Flyers', 'Static ads', 'Basic email templates', 'Photo editing', 'AI concept variations', 'Short-form copy'];
    excluded = ['Full brand identity', 'Campaign strategy', 'UX/UI', 'Custom illustration', 'Live collaboration'];
  } else if (tier === 'pulse') {
    included = ['Monthly brand pulse check', 'Brand guideline enforcement', 'Quarterly trend memo', 'Social assets', 'Static ads', 'Shared creative lead', 'Monthly 60-min strategy call', 'Campaign concepting', 'Editorial calendar', 'Competitive audits', 'Messaging framework', 'Campaign asset systems', 'Motion graphics', 'Custom presentations (30 slides)', 'Landing page design', 'Email campaigns', 'Limited illustration/icons', 'Brand voice modeling', 'AI competitive analysis', 'Vector-indexed brand memory'];
    excluded = ['Full brand identity systems', 'Product/interface design', 'Video production', 'Embedded team'];
  } else {
    included = ['Everything in Pulse', 'Dedicated senior creative lead', 'Weekly strategy sync', 'Full campaign strategy', 'Brand architecture consulting', 'Innovation/emerging tech advisory', 'Media positioning', 'Pitch ecosystem design', 'Narrative strategy', 'Full brand intelligence system', 'Custom AI workflow pipelines', 'Agentic content workflows', 'AI-powered brand monitoring', 'Automated brand QA', 'Multi-model orchestration'];
    excluded = ['Full website dev', 'Physical production', 'Media buying', 'PR', 'Dedicated onsite team', 'Proprietary model fine-tuning'];
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Configurator
          </Button>
        </Link>

        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">Pricing Breakdown</h1>
          <p className="text-xl text-muted-foreground">Detailed view of your selected {t.name} plan configuration.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold font-serif mb-6">What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {included.map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-serif mb-6 text-muted-foreground">What's Excluded</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {excluded.map(item => (
                  <div key={item} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-5 w-5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-serif mb-6">Custom-Scoped Add-ons Available</h2>
              <div className="flex flex-wrap gap-2">
                {PROJECT_ADDONS.slice(0, 5).map(item => (
                  <div key={item.label} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-md">
                    {item.label}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div>
            <Card className="sticky top-24 border-primary/20 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 font-serif">Summary</h3>
                
                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="font-medium text-base">{t.name} ({billing})</span>
                    <span className="font-medium">{formatCurrency(billing === 'annual' ? t.monthly * (1 - t.annualDiscount) : t.monthly)}</span>
                  </div>
                  
                  {addOns.map(id => {
                    const a = MONTHLY_ADDONS.find(x => x.id === id);
                    return a ? (
                      <div key={id} className="flex justify-between text-muted-foreground">
                        <span>{a.label}</span>
                        <span>{formatCurrency(a.price)}</span>
                      </div>
                    ) : null;
                  })}
                  
                  {AI_OPS[aiOpsLevel].price > 0 && (
                    <div className="flex justify-between text-muted-foreground pb-4 border-b">
                      <span>{AI_OPS[aiOpsLevel].label}</span>
                      <span>{formatCurrency(AI_OPS[aiOpsLevel].price)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-muted-foreground font-medium">Estimated Monthly</span>
                    <span className="text-3xl font-bold tracking-tight">{formatCurrency(Number(displayPrice))}</span>
                  </div>
                  {billing === 'annual' && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                      <span className="text-primary font-medium">Annual Total</span>
                      <span className="font-semibold">{formatCurrency(annualTotal)}</span>
                    </div>
                  )}
                </div>

                <Button size="lg" className="w-full text-lg h-14" onClick={() => setLocation('/checkout')}>
                  Proceed to Payment
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Secured by Stripe · Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
