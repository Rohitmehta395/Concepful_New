/**
 * Static question/option arrays for the pricing builder flows.
 * All values are `as const` — no mutations allowed at runtime.
 */

// ── Focus Categories ──────────────────────────────────────────

export interface FocusCategory {
  id: string;
  label: string;
  subs: readonly string[];
}

export const FOCUS_CATEGORIES: readonly FocusCategory[] = [
  {
    id: "brand",
    label: "Brand",
    subs: ["New Identity", "Brand Refresh", "Guidelines", "Naming", "Unsure"],
  },
  {
    id: "website",
    label: "Website",
    subs: [
      "New Website",
      "Landing Page",
      "Existing Refresh",
      "Dashboard",
      "Ecommerce",
      "Documentation",
      "Unsure",
    ],
  },
  {
    id: "product",
    label: "Product",
    subs: [
      "Product Concept",
      "Digital Product / UI-UX",
      "MVP Build",
      "Physical Interface / HMI",
      "Unsure",
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    subs: ["Campaign", "GTM Strategy", "Sales Deck", "Ads & Social", "Unsure"],
  },
  {
    id: "content",
    label: "Content",
    subs: [
      "Copywriting",
      "Presentations",
      "Motion & Video",
      "Illustration",
      "Unsure",
    ],
  },
  {
    id: "ai",
    label: "AI & Automation",
    subs: [
      "Workflow Integration",
      "Brand Command Center",
      "Custom AI System",
      "Robotics / Hardware",
      "Unsure",
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    subs: [
      "Positioning & Messaging",
      "GTM Plan",
      "Creative Direction",
      "Unsure",
    ],
  },
  {
    id: "else",
    label: "Something Else",
    subs: ["We'll describe it in the brief"],
  },
] as const;

// ── Answer Option Arrays ──────────────────────────────────────

export const OUTCOMES = [
  "Launch something new",
  "Increase credibility",
  "Improve conversion",
  "Raise funding",
  "Generate leads",
  "Simplify an experience",
  "Modernize our brand",
  "Other",
] as const;

export const READINESS = [
  "We have nothing yet",
  "We have a logo",
  "We have some assets",
  "We have full brand guidelines",
  "We'd like Concepful to define this",
] as const;

export const TIMELINE_DRIVERS = [
  "Funding round",
  "Public launch",
  "Trade show / demo day",
  "Internal milestone",
  "No hard date yet",
] as const;

export const EXISTS = [
  "Just the idea",
  "Research or validation done",
  "Designs or prototype exist",
  "A live product needing evolution",
  "Mixed — we'll explain in the brief",
] as const;

export const MONTH_SHAPE = [
  "A few key projects at a time",
  "A steady stream of requests",
  "Campaign cycles with peaks",
  "Unpredictable — we need flex",
] as const;

export const AUGMENTING = [
  "No in-house creative yet",
  "One designer who needs backup",
  "A small team that needs range",
  "A full department needing overflow",
] as const;

export const DECIDERS = [
  "Founder / CEO",
  "Head of Marketing",
  "Head of Product",
  "Committee — we'll align you",
] as const;

export const COLLAB = [
  "Founder",
  "Marketing",
  "Product",
  "Sales",
  "Executive Team",
  "Agency",
  "Other",
] as const;

export const CADENCE = [
  "Slack, as it happens",
  "Weekly working session",
  "Async — email + workspace",
  "Embedded in our PM tool",
] as const;
