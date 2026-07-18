"use client";

import { StepRenderer } from "./builder/step-renderer";
import { SummarySidebar } from "./builder/summary-sidebar";
import type {
  BuilderTier,
  BuilderTierId,
  BillingMode,
  StepConfig,
  BuilderPriceBreakdown,
  BuilderAnswers,
} from "@/types/pricing-builder";

interface BuilderScreenProps {
  tierData: BuilderTier;
  tierId: BuilderTierId;
  billing: BillingMode;
  flow: readonly StepConfig[];
  visibleStepCount: number;
  activeCat: string | null;
  onCatChange: (id: string | null) => void;
  focus: string[];
  onToggleFocus: (cat: string, sub: string) => void;
  onToggleStream: (label: string) => void;
  answers: BuilderAnswers;
  onSelect: (key: string, val: string) => void;
  onToggleMulti: (key: string, val: string) => void;
  addonIds: string[];
  onToggleAddon: (id: string) => void;
  price: BuilderPriceBreakdown;
  files: string[];
  onAddFiles: (names: string[]) => void;
  onRemoveFile: (name: string) => void;
  canContinue: boolean;
  suggestUpgrade: boolean;
  onUpgrade: () => void;
  onBack: () => void;
  onContinue: () => void;
}

export function BuilderScreen({
  tierData,
  tierId,
  billing,
  flow,
  visibleStepCount,
  activeCat,
  onCatChange,
  focus,
  onToggleFocus,
  onToggleStream,
  answers,
  onSelect,
  onToggleMulti,
  addonIds,
  onToggleAddon,
  price,
  files,
  onAddFiles,
  onRemoveFile,
  canContinue,
  suggestUpgrade,
  onUpgrade,
  onBack,
  onContinue,
}: BuilderScreenProps) {
  const visibleSteps = flow.slice(0, visibleStepCount);

  return (
    <section className="pa-arch">
      <div className="pa-flow">
        <button className="pa-back" onClick={onBack}>
          ← Change engagement
        </button>
        <h1 className="pa-h1">
          Let’s architect your{" "}
          {tierData.name === "Department Augmentation"
            ? "department"
            : "project"}
          .
        </h1>
        <p className="pa-sub">
          Five decisions, no jargon. Your answers write the brief — and the
          materials you share sharpen the quote.
        </p>

        {visibleSteps.map((step, i) => (
          <StepRenderer
            key={step.id}
            step={step}
            index={i}
            tierId={tierId}
            activeCat={activeCat}
            onCatChange={onCatChange}
            focus={focus}
            onToggleFocus={onToggleFocus}
            onToggleStream={onToggleStream}
            answers={answers}
            onSelect={onSelect}
            onToggleMulti={onToggleMulti}
            addonIds={addonIds}
            onToggleAddon={onToggleAddon}
            price={price}
            files={files}
            onAddFiles={onAddFiles}
            onRemoveFile={onRemoveFile}
          />
        ))}
      </div>

      <SummarySidebar
        tierData={tierData}
        tierId={tierId}
        billing={billing}
        focus={focus}
        answers={answers}
        price={price}
        files={files}
        canContinue={canContinue}
        suggestUpgrade={suggestUpgrade}
        onUpgrade={onUpgrade}
        onContinue={onContinue}
      />
    </section>
  );
}
