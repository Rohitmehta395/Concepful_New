export const TIERS = {
  signal: { name: "Signal", subtitle: "Creative Awareness", monthly: 5500, annualDiscount: 0.10 },
  pulse:  { name: "Pulse",  subtitle: "Creative Partnership", monthly: 12000, annualDiscount: 0.12 },
  cortex: { name: "Cortex", subtitle: "Embedded Creative Intelligence", monthly: 24000, annualDiscount: 0.15 },
};

export const MONTHLY_ADDONS = [
  { id: "async_pack",       label: "Additional Async Request Pack", price: 2000 },
  { id: "rush_delivery",    label: "Rush Delivery Upgrade",         price: 1500 },
  { id: "extra_revisions",  label: "Extra Revision Pack",           price: 1000 },
  { id: "strategy_session", label: "Extended Strategy Session",     price: 1250 },
  { id: "ai_content",       label: "AI-Generated Content Pack",     price: 1500 },
  { id: "brand_photography",label: "Brand Photography Direction",   price: 3000 },
];

export const AI_OPS = {
  none:     { label: "None",     price: 0 },
  basic:    { label: "Basic AI Operations",    price: 1000 },
  advanced: { label: "Advanced AI Operations", price: 3500 },
  embedded: { label: "Embedded AI Operations", price: 7500 },
};

export const PROJECT_ADDONS = [
  { label: "Brand Identity System",      startingAt: 25000 },
  { label: "Campaign System",            startingAt: 15000 },
  { label: "Website Design",             startingAt: 20000 },
  { label: "Pitch Ecosystem",            startingAt: 10000 },
  { label: "AI Pipeline Customization",  startingAt: 15000 },
  { label: "Innovation Sprint",          startingAt: 8000 },
  { label: "Video Creative Direction",   startingAt: 15000 },
  { label: "Custom AI Model Fine-Tuning",startingAt: 10000 },
];

export function calcMonthlyTotal(tier: keyof typeof TIERS, addOns: string[], aiOpsLevel: keyof typeof AI_OPS) {
  return TIERS[tier].monthly + addOns.reduce((sum, id) => sum + (MONTHLY_ADDONS.find(a => a.id === id)?.price ?? 0), 0) + AI_OPS[aiOpsLevel].price;
}

export function calcAnnualTotal(tier: keyof typeof TIERS, monthly: number, billing: "monthly" | "annual") {
  return billing === "annual" ? monthly * 12 * (1 - TIERS[tier].annualDiscount) : monthly * 12;
}
