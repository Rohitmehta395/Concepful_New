export const TIERS = {
  signal: {
    name: "Core",
    subtitle: "Creative Foundation",
    tagline: "For solo founders & early-stage teams",
    monthly: 2500,
    annualDiscount: 0.10,
    highlight: false,
    badge: null as string | null,
    bandwidth: {
      concurrent: "1 active project",
      requests: "10 requests/mo",
      sla: "48-hr turnaround",
      strategy: "5 hrs/mo",
      revisions: "2 revision rounds",
      team: "Shared creative team",
    },
    capabilities: [
      "Brand identity & guidelines",
      "Social assets & static ads",
      "One-pagers & sell sheets",
      "Email templates",
      "Basic presentations",
      "Photo direction",
      "Short-form copy",
      "Baseline AI Services included",
    ],
  },
  pulse: {
    name: "Studio",
    subtitle: "Full Creative Suite",
    tagline: "For growing companies & product teams",
    monthly: 7500,
    annualDiscount: 0.12,
    highlight: true,
    badge: "Most Popular" as string | null,
    bandwidth: {
      concurrent: "3 active projects",
      requests: "25 requests/mo",
      sla: "24-hr turnaround",
      strategy: "15 hrs/mo",
      revisions: "Unlimited",
      team: "Dedicated creative lead",
    },
    capabilities: [
      "Everything in Core",
      "UI/UX design",
      "Campaign concepting",
      "Motion graphics",
      "Custom presentations (30+ slides)",
      "Landing page design",
      "Email campaigns",
      "Brand voice modeling",
      "Competitive audits",
      "Messaging framework",
      "Monthly strategy call",
      "Baseline AI Services included",
    ],
  },
  cortex: {
    name: "Department",
    subtitle: "Embedded Creative Intelligence",
    tagline: "For mid-market & scaling brands",
    monthly: 18000,
    annualDiscount: 0.15,
    highlight: false,
    badge: null as string | null,
    bandwidth: {
      concurrent: "Unlimited projects",
      requests: "Priority queue",
      sla: "Same-day turnaround",
      strategy: "30 hrs/mo",
      revisions: "Unlimited",
      team: "Senior lead + full team",
    },
    capabilities: [
      "Everything in Studio",
      "Product design & UX",
      "Brand architecture",
      "Full campaign strategy",
      "Innovation advisory",
      "Pitch ecosystem design",
      "Narrative strategy",
      "AI-powered brand monitoring",
      "Agentic content workflows",
      "Custom AI pipelines",
      "Weekly strategy sync",
      "Baseline AI Services included",
    ],
  },
};

export const MONTHLY_ADDONS = [
  {
    id: "motion_graphics",
    label: "Motion Graphics",
    description: "Extended animation, motion design & video asset production beyond plan scope.",
    price: 2000,
  },
  {
    id: "three_d_art",
    label: "3D Art & Visualization",
    description: "3D modeling, rendering & visual effects for campaigns, product renders, and spatial content.",
    price: 3000,
  },
  {
    id: "product_design",
    label: "Product Design Sprint",
    description: "Deep-dive UX/UI product design, user research synthesis & interactive prototype iterations.",
    price: 2500,
  },
  {
    id: "illustration",
    label: "Custom Illustration",
    description: "Bespoke illustration sets, editorial art, icon systems & branded character design.",
    price: 1500,
  },
  {
    id: "rush_delivery",
    label: "Priority Rush Delivery",
    description: "Guaranteed 12-hr turnaround on all submitted requests.",
    price: 1500,
  },
];

export const AI_OPS = {
  none: {
    label: "Baseline AI Services",
    description: "High-level AI across every workflow in your tier — concept generation, copy assistance, and asset variations. Included in all plans at no extra cost.",
    compute: null as string | null,
    price: 0,
  },
  integration: {
    label: "AI Workflow Integration",
    description: "Embed AI agents into your existing creative and marketing stack — covering agent-driven briefing, scheduling, and approval loops.",
    compute: "~50K tokens / mo",
    price: 2500,
  },
  brand_command: {
    label: "AI Brand Command Center",
    description: "Real-time brand monitoring, competitive signal ingestion, auto-brief generation, and trend intelligence dashboards.",
    compute: "~150K tokens / mo",
    price: 4000,
  },
  intelligence: {
    label: "AI Intelligence System",
    description: "Fully custom AI workflow: brand memory, multi-model content pipelines, automated quality assurance, and agentic publishing.",
    compute: "~250K tokens / mo + dedicated compute",
    price: 6000,
  },
  robotics: {
    label: "AI Robotics Assistance",
    description: "Interface AI with physical hardware for creative robotics, spatial computing, or interactive physical installations.",
    compute: "Custom GPU / edge compute",
    price: 12000,
  },
};

export const PROJECT_ADDONS = [
  { id: "brand_identity", label: "Brand Identity System",           startingAt: 15000, hours: "60–80 hrs",  weeks: "4–6 wks" },
  { id: "website",        label: "Website Design & Build",          startingAt: 20000, hours: "80–120 hrs", weeks: "6–8 wks" },
  { id: "campaign",       label: "Campaign System",                 startingAt: 12000, hours: "40–60 hrs",  weeks: "3–5 wks" },
  { id: "pitch_deck",     label: "Pitch Deck / Investor Materials", startingAt:  8000, hours: "20–35 hrs",  weeks: "2–3 wks" },
  { id: "product_ui",     label: "Product UI/UX Design",            startingAt: 18000, hours: "70–100 hrs", weeks: "5–8 wks" },
  { id: "video",          label: "Video Creative Direction",        startingAt: 10000, hours: "30–50 hrs",  weeks: "3–4 wks" },
  { id: "ai_workflow",    label: "AI Workflow Customization",       startingAt: 12000, hours: "40–60 hrs",  weeks: "3–5 wks" },
  { id: "innovation",     label: "Innovation Sprint",               startingAt:  6000, hours: "20–30 hrs",  weeks: "1–2 wks" },
];

export type TierKey   = keyof typeof TIERS;
export type AiOpsKey  = keyof typeof AI_OPS;

export function calcMonthlyTotal(
  tier: TierKey,
  addOns: string[],
  aiOpsLevel: AiOpsKey,
): number {
  return (
    TIERS[tier].monthly +
    addOns.reduce(
      (sum, id) => sum + (MONTHLY_ADDONS.find((a) => a.id === id)?.price ?? 0),
      0,
    ) +
    AI_OPS[aiOpsLevel].price
  );
}

export function calcAnnualTotal(
  tier: TierKey,
  monthly: number,
  billing: "monthly" | "annual",
): number {
  return billing === "annual"
    ? monthly * 12 * (1 - TIERS[tier].annualDiscount)
    : monthly * 12;
}
