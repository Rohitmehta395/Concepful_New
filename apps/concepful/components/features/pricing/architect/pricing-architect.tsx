"use client";

import { useState, useEffect } from "react";
import { useBuilder } from "@/hooks/use-builder";
import { EngagementScreen } from "./engagement-screen";
import { BuilderScreen } from "./builder-screen";
import { QuoteScreen } from "./quote-screen";
import type { BuilderTierId } from "@/types/pricing-builder";

// Import the specific styling for this builder
import "./pricing-builder.css";

export function PricingArchitect() {
  const [mounted, setMounted] = useState(false);

  const {
    screen,
    setScreen,
    tier,
    setTier,
    billing,
    setBilling,
    tierData,
    activeCat,
    setActiveCat,
    focus,
    answers,
    addonIds,
    files,
    toggleFocus,
    toggleStream,
    toggleAddon,
    setAnswer,
    toggleMulti,
    addFiles,
    removeFile,
    flow,
    visibleStepCount,
    canContinue,
    suggestUpgrade,
    price,
  } = useBuilder();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleUpgrade = () => {
    setTier("expedition");
    setScreen("architect");
  };

  const handleCheckout = () => {
    // TODO: Wire to payment/quote API
  };

  return (
    <div className="pa">
      <div className="pa-progress">
        {["Engagement", "Architect", "Quote"].map((s, i) => {
          const idx = screen === "tiers" ? 0 : screen === "architect" ? 1 : 2;
          return (
            <span
              key={s}
              className={
                "pa-crumb" + (i === idx ? " on" : "") + (i < idx ? " done" : "")
              }
            >
              {s}
            </span>
          );
        })}
      </div>

      {screen === "tiers" && (
        <EngagementScreen
          billing={billing}
          onBillingChange={setBilling}
          selectedTier={tier}
          onSelectTier={setTier}
          onContinue={() => setScreen("architect")}
        />
      )}

      {screen === "architect" && tierData && price && (
        <BuilderScreen
          tierData={tierData}
          tierId={tier!}
          billing={billing}
          flow={flow}
          visibleStepCount={visibleStepCount}
          activeCat={activeCat}
          onCatChange={setActiveCat}
          focus={focus}
          onToggleFocus={toggleFocus}
          onToggleStream={toggleStream}
          answers={answers}
          onSelect={setAnswer}
          onToggleMulti={toggleMulti}
          addonIds={addonIds}
          onToggleAddon={toggleAddon}
          price={price}
          files={files}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
          canContinue={canContinue}
          suggestUpgrade={suggestUpgrade}
          onUpgrade={handleUpgrade}
          onBack={() => setScreen("tiers")}
          onContinue={() => setScreen("quote")}
        />
      )}

      {screen === "quote" && tierData && price && (
        <QuoteScreen
          tierData={tierData}
          billing={billing}
          focus={focus}
          answers={answers}
          price={price}
          files={files}
          onBack={() => setScreen("architect")}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
