"use client";

import { fmtPrice } from "@/lib/pricing-builder";
import type {
  BuilderTier,
  BuilderPriceBreakdown,
  BuilderAnswers,
  BillingMode,
} from "@/types/pricing-builder";
import { Button } from "@/components/ui/button";

interface SummarySidebarProps {
  tierData: BuilderTier;
  tierId: string;
  billing: BillingMode;
  focus: string[];
  answers: BuilderAnswers;
  price: BuilderPriceBreakdown;
  files: string[];
  canContinue: boolean;
  suggestUpgrade: boolean;
  onUpgrade: () => void;
  onContinue: () => void;
}

export function SummarySidebar({
  tierData,
  tierId,
  billing,
  focus,
  answers,
  price,
  files,
  canContinue,
  suggestUpgrade,
  onUpgrade,
  onContinue,
}: SummarySidebarProps) {
  const stringAnswers = Object.entries(answers).filter(
    ([, v]) => typeof v === "string" && v !== "",
  );

  return (
    <aside className="pa-summary">
      <div className="pa-s-head">Your Project</div>

      <div className="pa-s-block">
        <div className="pa-s-label">Engagement</div>
        <div className="pa-s-item strong">✓ {tierData.name}</div>
        {!price.isOneTime && (
          <div className="pa-s-item dim">
            {billing === "annual" ? "Annual billing · save 10%" : "Monthly billing"}
          </div>
        )}
      </div>

      {focus.length > 0 && (
        <div className="pa-s-block">
          <div className="pa-s-label">{tierId === "cdaas" ? "Streams" : "Focus"}</div>
          {focus.map((f) => (
            <div className="pa-s-item" key={f}>
              ✓ {f.includes(" · ") ? f.split(" · ")[1] : f}
            </div>
          ))}
        </div>
      )}

      {stringAnswers.slice(0, 4).map(([k, v]) => (
        <div className="pa-s-block" key={k}>
          <div className="pa-s-label">{k.replace(/_/g, " ")}</div>
          <div className="pa-s-item">✓ {v as string}</div>
        </div>
      ))}

      {price.addons.length > 0 && (
        <div className="pa-s-block">
          <div className="pa-s-label">Enhancements</div>
          {price.addons.map((a) => {
            const p = price.isOneTime ? a.oneTime : a.monthly;
            if (p === null) return null;
            return (
              <div className="pa-s-item row" key={a.id}>
                <span>✓ {a.label}</span>
                <span className="pa-s-price">
                  +{fmtPrice(p)}
                  {price.isOneTime ? "" : "/mo"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {files.length > 0 && (
        <div className="pa-s-block">
          <div className="pa-s-label">Materials</div>
          <div className="pa-s-item">
            ✓ {files.length} file{files.length > 1 ? "s" : ""} for review
          </div>
        </div>
      )}

      {suggestUpgrade && (
        <div className="pa-s-nudge">
          This is shaping up bigger than a Sprint — an <b>Expedition</b> may fit
          better. <button onClick={onUpgrade}>Switch</button>
        </div>
      )}

      <div className="pa-s-foot">
        <div className="pa-s-row">
          <span className="pa-s-label">Base engagement</span>
          <span>
            {fmtPrice(price.base)}
            {price.isOneTime ? "" : "/mo"}
          </span>
        </div>
        {price.addonSum > 0 && (
          <div className="pa-s-row">
            <span className="pa-s-label">Enhancements</span>
            <span>
              +{fmtPrice(price.addonSum)}
              {price.isOneTime ? "" : "/mo"}
            </span>
          </div>
        )}
        {price.discount > 0 && (
          <div className="pa-s-row save">
            <span className="pa-s-label">Annual savings</span>
            <span>−{fmtPrice(price.discount)}/mo</span>
          </div>
        )}
        <div className="pa-s-row total">
          <span>Estimated {price.isOneTime ? "fee" : "monthly"}</span>
          <span>
            {fmtPrice(price.total)}
            {price.isOneTime ? "" : "/mo"}
          </span>
        </div>
        <Button
          className="w-full mt-3"
          size="lg"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue
        </Button>
        <div className="pa-s-fine">
          Estimate is your ceiling — final quote confirmed after we review your
          materials.
        </div>
      </div>
    </aside>
  );
}
