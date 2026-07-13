"use client";

/**
 * useBuilder — All state for the Pricing Architect v2 builder.
 *
 * Intentionally isolated from `use-pricing-store` which serves the retainer
 * calculator, checkout flow, and home page plan-selector. Do not merge them.
 *
 * Derived values (price, visibleStepCount, canContinue, suggestUpgrade) are
 * memoized — components never compute these directly.
 */
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type {
  BuilderTierId,
  BillingMode,
  BuilderScreen,
  StepConfig,
  BuilderAnswers,
  BuilderPriceBreakdown,
  BuilderTier,
} from "@/types/pricing-builder";
import { BUILDER_TIERS } from "@/data/pricing/builder-tiers";
import { BUILDER_FLOWS } from "@/data/pricing/builder-flows";
import { computeBuilderTotal } from "@/lib/pricing-builder";

/** Sprints with this many or more focus items surface the upgrade nudge. */
const UPGRADE_THRESHOLD = 4;

// ── Step completion logic (pure function, no React) ───────────

function isStepComplete(
  step: StepConfig,
  focus: string[],
  answers: BuilderAnswers,
): boolean {
  switch (step.type) {
    case "focus":
    case "streams":
      return focus.length > 0;
    case "single":
      return typeof answers[step.id] === "string" && (answers[step.id] as string) !== "";
    case "dual":
      return !!(answers[step.a!.key] && answers[step.b!.key]);
    case "teamdocs":
      // Minimum: decider must be selected
      return !!(answers[step.a!.key]);
    case "addons":
    case "docs":
      // Optional — never blocks progression
      return true;
    default:
      return true;
  }
}

// ── Hook ──────────────────────────────────────────────────────

export function useBuilder() {
  const searchParams = useSearchParams();
  const initTierParam = searchParams.get("tier") as BuilderTierId | null;
  const validTier = initTierParam && BUILDER_TIERS.some((t) => t.id === initTierParam)
    ? initTierParam
    : null;

  // Navigation
  const [screen, setScreen] = useState<BuilderScreen>(validTier ? "architect" : "tiers");

  // Tier + Billing (billing is independent of home-page billing toggle)
  const [tier, setTierState] = useState<BuilderTierId | null>(validTier);
  const [billing, setBilling] = useState<BillingMode>("monthly");

  // Builder state
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [answers, setAnswers] = useState<BuilderAnswers>({});
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  // ── Tier selection ────────────────────────────────────────────

  /** Changing tier resets all builder-specific state to avoid stale answers. */
  const setTier = useCallback((newTier: BuilderTierId) => {
    setTierState(newTier);
    setFocus([]);
    setAnswers({});
    setAddonIds([]);
    setActiveCat(null);
    // files are kept — they're still relevant for the new tier
  }, []);

  // ── Derived: resolved tier object ─────────────────────────────

  const tierData: BuilderTier | null = useMemo(
    () => (tier ? (BUILDER_TIERS.find((t) => t.id === tier) ?? null) : null),
    [tier],
  );

  // ── Derived: active flow ──────────────────────────────────────

  const flow: readonly StepConfig[] = useMemo(
    () => (tier ? BUILDER_FLOWS[tier] : []),
    [tier],
  );

  // ── Toggle handlers (stable refs via useCallback) ─────────────

  /** Toggle a subcategory chip in the focus step. */
  const toggleFocus = useCallback((catLabel: string, sub: string) => {
    const key = `${catLabel} · ${sub}`;
    setFocus((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  }, []);

  /** Toggle a stream in the CDaaS streams step (uses category label as key). */
  const toggleStream = useCallback((label: string) => {
    setFocus((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  }, []);

  /** Toggle an addon by id. */
  const toggleAddon = useCallback((id: string) => {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  /** Set a single-value answer (replaces any previous value for that key). */
  const setAnswer = useCallback((key: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }, []);

  /** Toggle a value in a multi-select answer array. */
  const toggleMulti = useCallback((key: string, val: string) => {
    setAnswers((prev) => {
      const cur = (prev[key] as string[] | undefined) ?? [];
      return {
        ...prev,
        [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val],
      };
    });
  }, []);

  /** Add file names to the uploaded file list (UI-only, no actual upload). */
  const addFiles = useCallback((names: string[]) => {
    setFiles((prev) => [...prev, ...names.filter((n) => !prev.includes(n))]);
  }, []);

  /** Remove a file by name. */
  const removeFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f !== name));
  }, []);

  // ── Derived: progressive step visibility ──────────────────────

  /**
   * How many steps are currently visible in the builder.
   * Starts at 1 and increments as each preceding step is completed.
   * Optional steps (addons, docs) are transparent — they never block the next.
   */
  const visibleStepCount = useMemo(() => {
    if (!flow.length) return 0;
    let n = 1;
    for (let i = 0; i < flow.length - 1; i++) {
      if (isStepComplete(flow[i], focus, answers)) n++;
      else break;
    }
    return n;
  }, [flow, focus, answers]);

  // ── Derived: can the user proceed to quote ────────────────────

  /**
   * True when every non-optional step is complete.
   * addons and docs are always optional — they don't block Continue.
   */
  const canContinue = useMemo(() => {
    if (!tier) return false;
    const required = flow.filter((s) => !["addons", "docs"].includes(s.type));
    return required.every((s) => isStepComplete(s, focus, answers));
  }, [tier, flow, focus, answers]);

  // ── Derived: Sprint → Expedition upgrade nudge ────────────────

  const suggestUpgrade = tier === "sprint" && focus.length >= UPGRADE_THRESHOLD;

  // ── Derived: price breakdown ──────────────────────────────────

  const price: BuilderPriceBreakdown | null = useMemo(() => {
    if (!tier) return null;
    return computeBuilderTotal(tier, billing, addonIds);
  }, [tier, billing, addonIds]);

  // ── Full reset ────────────────────────────────────────────────

  const reset = useCallback(() => {
    setScreen("tiers");
    setTierState(null);
    setBilling("monthly");
    setActiveCat(null);
    setFocus([]);
    setAnswers({});
    setAddonIds([]);
    setFiles([]);
  }, []);

  return {
    // Navigation
    screen,
    setScreen,
    // Tier + billing
    tier,
    setTier,
    billing,
    setBilling,
    tierData,
    // Builder answers
    activeCat,
    setActiveCat,
    focus,
    answers,
    addonIds,
    files,
    // Action handlers
    toggleFocus,
    toggleStream,
    toggleAddon,
    setAnswer,
    toggleMulti,
    addFiles,
    removeFile,
    // Derived
    flow,
    visibleStepCount,
    canContinue,
    suggestUpgrade,
    price,
    // Utility
    reset,
  };
}
