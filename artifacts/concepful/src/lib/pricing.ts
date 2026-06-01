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
      "AI concept variations",
      "Short-form copy",
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
    ],
  },
};

export const MONTHLY_ADDONS = [
  { id: "async_pack",        label: "Additional Request Pack",      description: "+10 async requests/mo",                   price: 1500 },
  { id: "rush_delivery",     label: "Priority Rush Delivery",       description: "Guaranteed 12-hr turnaround",              price: 1500 },
  { id: "extra_revisions",   label: "Unlimited Revision Rounds",    description: "No revision limits on any deliverable",    price: 1000 },
  { id: "strategy_session",  label: "Monthly Strategy Sprint",      description: "2-hour facilitated strategy session",      price: 1500 },
  { id: "ai_content",        label: "AI Content Pack",              description: "AI-authored blog, social & email content", price: 1000 },
  { id: "brand_photography", label: "Brand Photography Direction",  description: "Creative direction for photo shoots",       price: 3000 },
];

export const AI_OPS = {
  none:     { label: "No AI Enhancement",      description: "Human creative team only",                                   price: 0 },
  basic:    { label: "AI Assist",              description: "AI copy variations & visual concept exploration",            price: 0 },
  advanced: { label: "AI Enhanced",            description: "Brand voice modeling, multi-model content workflows",        price: 2500 },
  embedded: { label: "AI Intelligence System", description: "Full brand memory, agentic workflows & automated QA",       price: 6000 },
};

export const PROJECT_ADDONS = [
  { label: "Brand Identity System",           startingAt: 15000 },
  { label: "Website Design & Build",          startingAt: 20000 },
  { label: "Campaign System",                 startingAt: 12000 },
  { label: "Pitch Deck / Investor Materials", startingAt: 8000 },
  { label: "Product UI/UX Design",            startingAt: 18000 },
  { label: "Video Creative Direction",        startingAt: 10000 },
  { label: "AI Workflow Customization",       startingAt: 12000 },
  { label: "Innovation Sprint",               startingAt: 6000 },
];

export type TierKey = keyof typeof TIERS;
export type AiOpsKey = keyof typeof AI_OPS;

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
