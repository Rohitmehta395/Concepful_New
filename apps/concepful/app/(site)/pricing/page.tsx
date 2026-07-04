import { Metadata } from "next";
import { PricingCalculator } from "@/components/features/pricing/pricing-calculator";

export const metadata: Metadata = {
  title: "Pricing | Concepful",
  description: "Configure your creative department. Select a plan and start building.",
};

export default function PricingPage() {
  return (
    <div className="flex-1 min-h-screen">
      <PricingCalculator />
    </div>
  );
}
