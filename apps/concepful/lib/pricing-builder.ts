/**
 * Pricing Builder — Business Logic
 *
 * All price calculations for the builder live here.
 * Components never compute prices directly — they call these functions.
 *
 * NOTE: This is separate from lib/pricing.ts which serves the existing
 * retainer calculator, checkout, and onboarding flows. Do not merge them.
 */
import { BUILDER_TIERS } from "@/data/pricing/builder-tiers";
import { BUILDER_ADDONS } from "@/data/pricing/builder-addons";
import type {
  BuilderTierId,
  BillingMode,
  BuilderPriceBreakdown,
  BuilderAddon,
} from "@/types/pricing-builder";

/** Annual billing discount applied to Expedition and CDaaS retainers. */
export const BUILDER_ANNUAL_DISCOUNT = 0.1;

/**
 * Formats a number as USD currency — no decimals.
 * Consistent with the rest of the project (Intl.NumberFormat).
 */
export function fmtPrice(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Returns the tier display price for the engagement screen cards,
 * taking billing mode into account.
 *
 * Sprint is always one-time, so billing mode is ignored for it.
 */
export function getTierDisplayPrice(
  tierId: BuilderTierId,
  billing: BillingMode,
): number {
  const tier = BUILDER_TIERS.find((t) => t.id === tierId);
  if (!tier) return 0;
  if (tier.billing === "one_time") return tier.base;
  return billing === "annual"
    ? Math.round(tier.base * (1 - BUILDER_ANNUAL_DISCOUNT))
    : tier.base;
}

/**
 * Computes the full price breakdown for a given tier + billing + addon selection.
 *
 * Returns a `BuilderPriceBreakdown` that components can render directly.
 * Returns a zero-value breakdown if the tier is not found (defensive fallback).
 */
export function computeBuilderTotal(
  tierId: BuilderTierId,
  billing: BillingMode,
  addonIds: string[],
): BuilderPriceBreakdown {
  const tier = BUILDER_TIERS.find((t) => t.id === tierId);

  if (!tier) {
    return {
      base: 0,
      addons: [],
      addonSum: 0,
      discount: 0,
      total: 0,
      isOneTime: true,
    };
  }

  const isOneTime = tier.billing === "one_time";

  // Resolve selected addons (cast needed because BUILDER_ADDONS is readonly)
  const addons: BuilderAddon[] = BUILDER_ADDONS.filter((a) =>
    addonIds.includes(a.id),
  ) as BuilderAddon[];

  const addonSum = addons.reduce(
    (sum, a) => sum + (isOneTime ? (a.oneTime ?? 0) : (a.monthly ?? 0)),
    0,
  );

  let subtotal = tier.base + addonSum;
  let discount = 0;

  if (!isOneTime && billing === "annual") {
    discount = Math.round(subtotal * BUILDER_ANNUAL_DISCOUNT);
    subtotal -= discount;
  }

  return {
    base: tier.base,
    addons,
    addonSum,
    discount,
    total: subtotal,
    isOneTime,
  };
}
