import { Link, useLocation } from "wouter";
import { ArrowLeft, Check, X, Zap, Clock, Users, RefreshCw } from "lucide-react";
import { TIERS, MONTHLY_ADDONS, AI_OPS, PROJECT_ADDONS, calcMonthlyTotal, calcAnnualTotal } from "@/lib/pricing";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/layout/site-layout";

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

export default function PricingBreakdown() {
  const [, setLocation] = useLocation();
  const { tier, billing, addOns, aiOpsLevel } = usePricingStore();

  const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);
  const displayPrice = billing === "annual" ? (annualTotal / 12).toFixed(0) : monthlyTotal.toFixed(0);

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const t = TIERS[tier];
  const tierPrice = billing === "annual" ? t.monthly * (1 - t.annualDiscount) : t.monthly;

  return (
    <SiteLayout>
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to plan selector
          </Button>
        </Link>

        <div className="mb-10">
          <Badge variant="outline" className="text-primary border-primary/30 mb-4">{t.badge ?? t.subtitle}</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {t.name} Plan — Full Breakdown
          </h1>
          <p className="text-xl text-muted-foreground">{t.tagline}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">

            {/* Bandwidth metrics */}
            <section>
              <h2 className="text-xl font-bold font-serif mb-5">Your Creative Bandwidth</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(t.bandwidth).map(([key, value]) => {
                  const Icon = BANDWIDTH_ICONS[key];
                  return (
                    <div key={key} className="p-4 rounded-xl border border-border/60 bg-secondary/20">
                      {Icon && <Icon className="h-4 w-4 text-primary mb-2" />}
                      <p className="text-base font-semibold">{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{key.replace(/([A-Z])/g, " $1").replace("_", " ")}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Capabilities */}
            <section>
              <h2 className="text-xl font-bold font-serif mb-5">Capabilities Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {t.capabilities.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Not included */}
            <section>
              <h2 className="text-xl font-bold font-serif mb-5 text-muted-foreground">Not Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(EXCLUDED[tier] ?? []).map((item) => (
                  <div key={item} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* One-time projects */}
            <section>
              <h2 className="text-xl font-bold font-serif mb-2">One-Time Projects Available</h2>
              <p className="text-sm text-muted-foreground mb-5">Custom-scoped work outside your retainer.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_ADDONS.map((item) => (
                  <div key={item.label} className="flex justify-between items-center px-4 py-3 bg-secondary/30 rounded-lg border border-border/40">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground ml-3 shrink-0">from {fmt(item.startingAt)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Summary sidebar */}
          <div>
            <Card className="sticky top-24 border-primary/20 shadow-lg">
              <CardContent className="p-7">
                <h3 className="text-lg font-bold mb-5 font-serif">Order Summary</h3>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <span className="font-medium">{t.name} plan</span>
                      <p className="text-xs text-muted-foreground capitalize">{billing} billing</p>
                    </div>
                    <span className="font-medium">{fmt(tierPrice)}/mo</span>
                  </div>

                  {addOns.map((id) => {
                    const a = MONTHLY_ADDONS.find((x) => x.id === id);
                    return a ? (
                      <div key={id} className="flex justify-between text-muted-foreground">
                        <span>{a.label}</span>
                        <span>{fmt(a.price)}</span>
                      </div>
                    ) : null;
                  })}

                  {AI_OPS[aiOpsLevel].price > 0 && (
                    <div className="flex justify-between text-muted-foreground pb-3 border-b">
                      <span>{AI_OPS[aiOpsLevel].label}</span>
                      <span>{fmt(AI_OPS[aiOpsLevel].price)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-muted-foreground text-sm font-medium">
                      {billing === "annual" ? "Monthly avg" : "Monthly total"}
                    </span>
                    <span className="text-3xl font-bold tracking-tight">{fmt(Number(displayPrice))}</span>
                  </div>
                  {billing === "annual" && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                      <span className="text-primary font-medium">Annual total</span>
                      <span className="font-semibold">{fmt(annualTotal)}</span>
                    </div>
                  )}
                </div>

                <Button size="lg" className="w-full text-base h-13 font-semibold" onClick={() => setLocation("/checkout")}>
                  Proceed to Payment
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
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
