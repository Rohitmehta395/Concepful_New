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
        <section
          id="plan-selector"
          className="scroll-mt-8 px-6 pb-15 pt-10 md:pt-24" 
        >
          <div className="container mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.15em] text-primary">
              Choose your plan
            </p>
            <h2 className="mb-5 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Creative Bandwidth That Fits Your Team.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Like selecting a mobile plan — pick the capacity that fits your
              pace. <br /> Upgrade or downgrade anytime.
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
