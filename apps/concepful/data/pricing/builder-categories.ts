/**
 * Static question/option arrays for the pricing builder flows.
 * All values are `as const` — no mutations allowed at runtime.
 */

// ── Focus Categories ──────────────────────────────────────────

export type TierFit = "sprint" | "expedition" | "cdaas";

export interface Task {
  id: string;
  description: string;
}

export interface Scope {
  id: string;
  label: string;
  categoryIds: string[];
  description?: string;
  tierFit?: TierFit;
  tasks?: Task[];
}

export interface Category {
  id: string;
  label: string;
  description: string;
}

export const BUILDER_CATEGORIES: readonly Category[] = [
  { id: "brand", label: "Brand", description: "How you look and sound — the rules, not the output" },
  { id: "website", label: "Website", description: "The thing people visit" },
  { id: "product-app", label: "Product & App", description: "The thing people use" },
  { id: "content-story", label: "Content & Story", description: "The things you publish" },
  { id: "marketing-launch", label: "Marketing & Launch", description: "Getting it out there — exists to sell" },
  { id: "experimental", label: "Experimental", description: "The weird stuff — hardware, spatial, AI-native, R&D" },
  { id: "else", label: "Something Else", description: "Escape hatch" },
] as const;

export const BUILDER_SCOPES: readonly Scope[] = [
  // Brand
  {
    id: "brand-identity",
    label: "Brand Identity",
    categoryIds: ["brand"],
    tierFit: "expedition",
  },
  {
    id: "brand-refresh",
    label: "Brand Refresh",
    categoryIds: ["brand"],
    tierFit: "sprint",
  },
  {
    id: "brand-guidelines",
    label: "Guidelines",
    categoryIds: ["brand"],
    tierFit: "sprint",
  },
  { id: "naming", label: "Naming", categoryIds: ["brand"], tierFit: "sprint" },
  {
    id: "positioning-messaging",
    label: "Positioning & Messaging",
    categoryIds: ["brand", "marketing-launch"],
    tierFit: "sprint",
  },
  // Website
  {
    id: "website-new",
    label: "New Website",
    categoryIds: ["website"],
    tierFit: "expedition",
  },
  {
    id: "landing-page",
    label: "Landing Page",
    categoryIds: ["website", "marketing-launch"],
    tierFit: "sprint",
  },
  {
    id: "website-refresh",
    label: "Existing Refresh",
    categoryIds: ["website"],
    tierFit: "sprint",
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    categoryIds: ["website"],
    tierFit: "expedition",
  },
  {
    id: "docs-site",
    label: "Documentation Site",
    categoryIds: ["website"],
    tierFit: "sprint",
  },
  // Product & App
  {
    id: "product-concept",
    label: "Product Concept",
    categoryIds: ["product-app"],
    tierFit: "sprint",
  },
  {
    id: "ui-ux",
    label: "Digital Product UI/UX",
    categoryIds: ["product-app"],
    tierFit: "expedition",
  },
  {
    id: "mvp-build",
    label: "MVP Build",
    categoryIds: ["product-app"],
    tierFit: "expedition",
  },
  {
    id: "app-build",
    label: "Web / Mobile App",
    categoryIds: ["product-app"],
    tierFit: "expedition",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    categoryIds: ["product-app"],
    tierFit: "expedition",
  },
  {
    id: "hmi",
    label: "Physical Interface / HMI",
    categoryIds: ["product-app"],
    tierFit: "expedition",
  },
  {
    id: "form-factor",
    label: "Physical Product / Form Factor",
    categoryIds: ["product-app"],
    tierFit: "expedition",
  },
  {
    id: "design-system",
    label: "Design System",
    categoryIds: ["product-app"],
    tierFit: "expedition",
  },
  {
    id: "internal-tool",
    label: "Internal Tool",
    categoryIds: ["product-app"],
    tierFit: "sprint",
  },
  {
    id: "usability-audit",
    label: "Usability Audit",
    categoryIds: ["product-app"],
    tierFit: "sprint",
  },
  // Content & Story
  {
    id: "copywriting",
    label: "Copywriting",
    categoryIds: ["content-story"],
    tierFit: "sprint",
  },
  {
    id: "presentations",
    label: "Presentations",
    categoryIds: ["content-story"],
    tierFit: "sprint",
  },
  {
    id: "motion",
    label: "Motion & Video",
    categoryIds: ["content-story"],
    tierFit: "expedition",
  },
  {
    id: "storyboards",
    label: "Storyboards",
    categoryIds: ["content-story"],
    tierFit: "sprint",
  },
  {
    id: "story-character",
    label: "Story / Character Development",
    categoryIds: ["content-story"],
    tierFit: "sprint",
  },
  {
    id: "illustration",
    label: "Illustration",
    categoryIds: ["content-story"],
    tierFit: "expedition",
  },
  {
    id: "sales-deck",
    label: "Sales Deck",
    categoryIds: ["content-story", "marketing-launch"],
    tierFit: "sprint",
  },
  // Marketing & Launch
  {
    id: "gtm",
    label: "GTM Strategy",
    categoryIds: ["marketing-launch"],
    tierFit: "expedition",
  },
  {
    id: "campaign",
    label: "Campaign",
    categoryIds: ["marketing-launch"],
    tierFit: "sprint",
  },
  {
    id: "ads-social",
    label: "Ads & Social",
    categoryIds: ["marketing-launch"],
    tierFit: "sprint",
  },
  {
    id: "launch-plan",
    label: "Launch Plan",
    categoryIds: ["marketing-launch"],
    tierFit: "sprint",
  },
  // Experimental
  {
    id: "robotics",
    label: "Robotics / Hardware UI",
    categoryIds: ["experimental"],
  },
  {
    id: "spatial",
    label: "Spatial / Installations",
    categoryIds: ["experimental"],
    tierFit: "expedition",
  },
  {
    id: "ai-native",
    label: "AI-Native Concepts",
    categoryIds: ["experimental"],
    tierFit: "expedition",
  },
  {
    id: "rd-sprint",
    label: "R&D Sprint",
    categoryIds: ["experimental"],
    tierFit: "sprint",
  },
  // Something Else
  { id: "custom", label: "Custom Project", categoryIds: ["else"] },
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
