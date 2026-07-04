import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Segments } from "@/components/sections/segments";
import { BottomCta } from "@/components/sections/bottom-cta";
import { PlanSelector } from "@/components/features/pricing/plan-selector";
import { FloatingPricingWidget } from "@/components/features/pricing/floating-pricing-widget";

export default function LandingPage() {
  return (
    <>
      <div className="flex-1 pb-32">
        <Hero />
        <Capabilities />
        
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
          <PlanSelector />
        </section>

        <HowItWorks />
        <Segments />
        <BottomCta />
      </div>
      
      <FloatingPricingWidget />
    </>
  );
}
