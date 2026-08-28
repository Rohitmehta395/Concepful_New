import { Metadata } from "next";
import { Suspense } from "react";
import { PricingArchitect } from "@/components/features/pricing/architect/pricing-architect";

export const metadata: Metadata = {
  title: "Pricing | Concepful",
  description:
    "Choose your engagement and architect the project. Sprint, Expedition, or Department Augmentation — transparent pricing, scoped in 24 hours.",
};

export default function PricingPage() {
  return (
    <div className="flex-1 min-h-screen">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <PricingArchitect />
      </Suspense>
    </div>
  );
}
