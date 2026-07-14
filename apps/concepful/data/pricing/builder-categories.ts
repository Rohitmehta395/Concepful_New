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
    id: "content_creation",
    label: "Content Creation",
    subs: ["Copywriting", "Presentations", "Motion & Video", "Illustration", "Unsure"],
  },
  {
    id: "marketing_collateral",
    label: "Marketing Collateral",
    subs: ["Social Media Assets", "Email Campaigns", "Ads & Banners", "Sales Materials", "Unsure"],
  },
  {
    id: "product_service_design",
    label: "Product / Service Design",
    subs: ["MVP Design", "Product Strategy", "Service Blueprint", "Product Concept", "Unsure"],
  },
  {
    id: "ui_design",
    label: "UI Design",
    subs: ["Landing Pages", "Web App UI", "Mobile App UI", "Dashboard UI", "Unsure"],
  },
  {
    id: "gtm_ideation",
    label: "Go-to-Market Ideation",
    subs: ["Launch Strategy", "Positioning", "Messaging", "Growth Campaign", "Unsure"],
  },
  {
    id: "ux_design",
    label: "User Experience Design",
    subs: ["User Flows", "Wireframes", "UX Audit", "Customer Journey", "Unsure"],
  },
  {
    id: "application_design",
    label: "Application Design",
    subs: ["SaaS Platform", "AI Application", "Internal Tool", "Mobile App", "Unsure"],
  },
  {
    id: "experimental",
    label: "Experimental",
    subs: ["AI Prototype", "R&D Concept", "Interactive Demo", "Innovation Sprint", "Unsure"],
  },
  {
    id: "storyboards",
    label: "Storyboards",
    subs: ["Commercial", "Explainer Video", "Animation", "Product Demo", "Unsure"],
  },
  {
    id: "story_character_dev",
    label: "Story / Character Development",
    subs: ["Character Design", "World Building", "Script Writing", "Narrative Development", "Unsure"],
  },
  {
    id: "else",
    label: "Something Else",
    subs: ["Not Listed", "Need Guidance", "Custom Project", "Not Sure Yet", "Let's Discuss"],
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
  "Elevate our visual direction",
  "Other",
] as const;

export const READINESS = [
  "We have nothing yet",
  "We have some early concepts",
  "We have reference materials",
  "We have a clear direction",
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
