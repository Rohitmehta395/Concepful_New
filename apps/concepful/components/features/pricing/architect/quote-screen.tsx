"use client";

import { fmtPrice } from "@/lib/pricing-builder";
import type {
  BuilderTier,
  BuilderPriceBreakdown,
  BuilderAnswers,
  BillingMode,
} from "@/types/pricing-builder";
import { Button } from "@/components/ui/button";

interface QuoteScreenProps {
  tierData: BuilderTier;
  billing: BillingMode;
  focus: string[];
  answers: BuilderAnswers;
  price: BuilderPriceBreakdown;
  files: string[];
  onBack: () => void;
  onCheckout: () => void;
}

export function QuoteScreen({
  tierData,
  billing,
  focus,
  answers,
  price,
  files,
  onBack,
  onCheckout,
}: QuoteScreenProps) {
  const focusLabels = focus
    .map((f) => (f.includes(" · ") ? f.split(" · ")[1] : f))
    .join(" · ");
  
  const outcome = answers["outcome"] as string | undefined;

  return (
    <section className="pa-quote">
      <button className="pa-back" onClick={onBack}>
        ← Back to your project
      </button>

      <div className="pa-q-card">
        <div className="pa-s-label">Your Engagement</div>
        <div className="pa-q-tier">{tierData.name}</div>

        <div className="pa-lines">
          <div className="pa-line">
            <span>Base engagement</span>
            <span>
              {fmtPrice(price.base)}
              {price.isOneTime ? "" : "/mo"}
            </span>
          </div>

          {price.addons.map((a) => {
            const p = price.isOneTime ? a.oneTime : a.monthly;
            if (p === null) return null;
            return (
              <div className="pa-line" key={a.id}>
                <span>{a.label}</span>
                <span>
                  +{fmtPrice(p)}
                  {price.isOneTime ? "" : "/mo"}
                </span>
              </div>
            );
          })}

          {price.discount > 0 && (
            <div className="pa-line save">
              <span>Annual billing (−10%)</span>
              <span>−{fmtPrice(price.discount)}/mo</span>
            </div>
          )}

          <div className="pa-line total">
            <span>
              {price.isOneTime
                ? "Estimated Fixed Fee"
                : "Estimated Monthly Investment"}
            </span>
            <span>
              {fmtPrice(price.total)}
              {price.isOneTime ? "" : "/mo"}
            </span>
          </div>
        </div>

        <div className="pa-review">
          <div className="pa-s-label">What happens next</div>
          <p>
            {files.length > 0
              ? `We review your ${files.length} uploaded file${
                  files.length > 1 ? "s" : ""
                } and confirm the final number within 24 hours. `
              : "We review anything you share and confirm the final number within 24 hours. "}
            Your estimate is the ceiling — it doesn’t go up without a scope
            conversation you’re part of.
          </p>
        </div>

        {focus.length > 0 && (
          <div className="pa-q-brief">
            <div className="pa-s-label">Already in your brief</div>
            <p>
              {focusLabels}
              {outcome ? " — to " + outcome.toLowerCase() : ""}
              .
            </p>
          </div>
        )}

        <Button className="w-full mt-6" size="lg" onClick={onCheckout}>
          Continue &rarr;
        </Button>
        <div className="pa-s-fine center">
          Secured by Stripe · SOW and kickoff within 24 hours
        </div>
      </div>
    </section>
  );
}
