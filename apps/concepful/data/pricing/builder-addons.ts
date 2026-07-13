import type { BuilderAddon } from "@/types/pricing-builder";

/**
 * All available add-ons for the pricing builder.
 *
 * Pricing rules:
 *  - oneTime: price for Sprint (one-time) engagements, null = not available
 *  - monthly:  price for Expedition / CDaaS retainer engagements, null = not available
 *  - tiers:    which tiers surface this addon
 */
export const BUILDER_ADDONS: readonly BuilderAddon[] = [
  {
    id: "motion",
    label: "Motion Graphics",
    blurb: "Animation & video asset production.",
    oneTime: 2000,
    monthly: null,
    tiers: ["sprint"],
  },
  {
    id: "illustration",
    label: "Custom Illustration",
    blurb: "Bespoke sets, icons, character design.",
    oneTime: 1500,
    monthly: null,
    tiers: ["sprint"],
  },
  {
    id: "three_d",
    label: "3D Art & Visualization",
    blurb: "Modeling, rendering, product visuals.",
    oneTime: 3500,
    monthly: 3000,
    tiers: ["sprint", "expedition", "cdaas"],
  },
  {
    id: "fab",
    label: "Product Printing & Fabrication",
    blurb: "3D-printed prototypes and physical mockups.",
    oneTime: 2500,
    monthly: 2000,
    tiers: ["sprint", "expedition", "cdaas"],
  },
  {
    id: "rush",
    label: "Priority Rush",
    blurb: "Guaranteed 12-hr turnaround on deliverables.",
    oneTime: 1200,
    monthly: 1500,
    tiers: ["sprint", "cdaas"],
  },
  {
    id: "ai_setup",
    label: "AI Setup Sprint",
    blurb: "One workflow, implemented and handed off.",
    oneTime: 3500,
    monthly: null,
    tiers: ["sprint"],
  },
  {
    id: "ai_workflow",
    label: "AI Workflow Integration",
    blurb: "Agent-driven briefing, scheduling, approvals.",
    oneTime: null,
    monthly: 2500,
    tiers: ["expedition", "cdaas"],
  },
  {
    id: "ai_command",
    label: "AI Brand Command Center",
    blurb: "Live brand & competitive monitoring.",
    oneTime: null,
    monthly: 4000,
    tiers: ["expedition", "cdaas"],
  },
  {
    id: "ai_system",
    label: "AI Intelligence System",
    blurb: "Brand memory, multi-model pipeline, auto-QA.",
    oneTime: null,
    monthly: 6000,
    tiers: ["expedition", "cdaas"],
  },
  {
    id: "robotics",
    label: "Robotic / Hardware UI",
    blurb: "AI meets hardware — robotics, spatial, installs.",
    oneTime: null,
    monthly: 12000,
    tiers: ["expedition", "cdaas"],
    hot: true,
  },
];
