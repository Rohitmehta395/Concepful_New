/** ============================================================
 *  Pricing Architect v2 — Domain Types
 *  All types are pure data — no React, no framer, no UI deps.
 * ============================================================ */

// ── Tier & Billing ────────────────────────────────────────────

export type BuilderTierId = "sprint" | "expedition" | "cdaas";
export type BillingMode = "monthly" | "annual";
export type BuilderScreen = "tiers" | "architect" | "quote";

// ── Step System ───────────────────────────────────────────────

export type StepType =
  | "focus"     // Category grid → subcategory chips (Sprint / Expedition)
  | "streams"   // CDaaS stream multi-toggle (uses focus[] for state)
  | "single"    // Chip-based single select
  | "dual"      // Two independent single/multi selects in one step
  | "addons"    // Addon toggle cards
  | "docs"      // File upload (UI-only placeholder)
  | "teamdocs"; // Decider + collaborators + file upload

export interface StepOption {
  key: string;
  label: string;
  options: readonly string[];
  multi?: boolean;
}

export interface StepConfig {
  id: string;
  type: StepType;
  title: string;
  sub?: string;
  /** Used by "single" type */
  options?: readonly string[];
  /** If true, renders options as a vertical list instead of wrapping chips */
  col?: boolean;
  /** Used by "dual" and "teamdocs" types */
  a?: StepOption;
  b?: StepOption;
}

// ── Addon ─────────────────────────────────────────────────────

export interface BuilderAddon {
  id: string;
  label: string;
  blurb: string;
  /** Price for one-time (Sprint) engagements, null if not available */
  oneTime: number | null;
  /** Monthly price for retainer engagements, null if not available */
  monthly: number | null;
  /** Which tiers this addon is available on */
  tiers: BuilderTierId[];
  /** Surface a "hot" badge on the card */
  hot?: boolean;
}

// ── Tier ──────────────────────────────────────────────────────

export interface BuilderTier {
  id: BuilderTierId;
  name: string;
  tagline: string;
  /** Base price: one-time fee for Sprint, monthly rate for Expedition/CDaaS */
  base: number;
  billing: "one_time" | "monthly";
  priceNote: string;
  points: readonly string[];
  cta: string;
  popular?: boolean;
}

// ── Price Breakdown ───────────────────────────────────────────

export interface BuilderPriceBreakdown {
  /** Base engagement price before addons/discount */
  base: number;
  /** The selected addon objects (resolved) */
  addons: BuilderAddon[];
  /** Sum of addon prices */
  addonSum: number;
  /** Annual billing discount (0 for monthly or one-time) */
  discount: number;
  /** Final total after discount */
  total: number;
  /** True if this is a fixed one-time fee (Sprint), false if recurring */
  isOneTime: boolean;
}

// ── Hook Return ───────────────────────────────────────────────

export type BuilderAnswers = Record<string, string | string[]>;
