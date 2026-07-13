"use client";

import { fmtPrice, getTierDisplayPrice } from "@/lib/pricing-builder";
import { BUILDER_TIERS } from "@/data/pricing/builder-tiers";
import { BUILDER_ANNUAL_DISCOUNT } from "@/lib/pricing-builder";
import type { BuilderTierId, BillingMode } from "@/types/pricing-builder";
import { Button } from "@/components/ui/button";

interface EngagementScreenProps {
  billing: BillingMode;
  onBillingChange: (b: BillingMode) => void;
  selectedTier: BuilderTierId | null;
  onSelectTier: (id: BuilderTierId) => void;
  onContinue: () => void;
}

export function EngagementScreen({
  billing,
  onBillingChange,
  selectedTier,
  onSelectTier,
  onContinue,
}: EngagementScreenProps) {
  return (
    <section>
      <h1 className="pa-h1">Choose how we work together.</h1>
      <p className="pa-sub">
        Three engagements, one team. Pick the shape — we’ll architect the rest
        with you.
      </p>

      <div className="pa-toggle-row">
        <div className="pa-toggle">
          <button
            className={billing === "monthly" ? "on" : ""}
            onClick={() => onBillingChange("monthly")}
          >
            Monthly
          </button>
          <button
            className={billing === "annual" ? "on" : ""}
            onClick={() => onBillingChange("annual")}
          >
            Annual <em>save 10%</em>
          </button>
        </div>
        <span className="pa-toggle-note">
          Applies to Expedition & Department Augmentation. Sprints are one-time.
        </span>
      </div>

      <div className="pa-tiers">
        {BUILDER_TIERS.map((t) => {
          const isMo = t.billing === "monthly";
          const displayPrice = getTierDisplayPrice(t.id, billing);
          const isSelected = selectedTier === t.id;

          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              className={"pa-tier cursor-pointer" + (isSelected ? " pop" : "")}
              onClick={() => onSelectTier(t.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectTier(t.id);
                }
              }}
            >
              {t.popular && <span className="pa-badge">Most popular</span>}
              <span className="pa-tier-name">{t.name}</span>
              <span className="pa-tier-tag">{t.tagline}</span>
              <span className="pa-tier-price">
                from {fmtPrice(displayPrice)}
                {isMo ? "/mo" : ""}
              </span>
              <span className="pa-tier-note">
                {isMo && billing === "annual" ? "billed annually · " : ""}
                {t.priceNote}
              </span>
              <ul className="mb-4">
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Button
                  className="w-full"
                  variant={isSelected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      onSelectTier(t.id);
                    }
                    onContinue();
                  }}
                >
                  {t.cta} &rarr;
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="pa-help">
        Not sure which fits?{" "}
        <a
          href="/contact"
          style={{
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            fontWeight: 600,
          }}
        >
          Describe the work
        </a>{" "}
        — we’ll point you to the right tier in one reply.
      </p>
    </section>
  );
}
