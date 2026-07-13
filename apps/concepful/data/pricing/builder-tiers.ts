import type { BuilderTier } from "@/types/pricing-builder";

export const BUILDER_TIERS: readonly BuilderTier[] = [
  {
    id: "sprint",
    name: "Sprint",
    tagline: "One project, deployed fast.",
    base: 4000,
    billing: "one_time",
    priceNote: "one-time · scoped in 24 hours",
    points: [
      "≤ 2 weeks, fixed fee",
      "Kickoff within 24 hours",
      "Senior lead, two revision rounds",
      "IP transfers on delivery",
    ],
    cta: "Start a Sprint",
  },
  {
    id: "expedition",
    name: "Expedition",
    tagline: "For work that deserves research before pixels.",
    base: 7200,
    billing: "monthly",
    priceNote: "2-month minimum",
    popular: true,
    points: [
      "1–3 months, research built in",
      "Weekly working sessions",
      "Product concepts, MVP builds, brand platforms",
      "Everything a Sprint includes, sustained",
    ],
    cta: "Plan an Expedition",
  },
  {
    id: "cdaas",
    name: "Department Augmentation",
    tagline: "Your creative department, without the headcount.",
    base: 9500,
    billing: "monthly",
    priceNote: "pause or cancel anytime",
    points: [
      "Dedicated senior creative lead",
      "Prioritized queue, reviewed weekly",
      "All disciplines — product to campaign",
      "Deepest rate, month to month",
    ],
    cta: "Add the Department",
  },
];
