export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  category: string;
  categoryLabel: string;
  teaser: string;
  tags: string[];
  gradient: string;
  accentColor: string;
  brief: string;
  challenges: string[];
  deliverables: string[];
  outcome: string;
  outcomeMetrics: { label: string; value: string }[];
  tools: string[];

  featured: boolean;
  image: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "aerosight-drone-ui",
    title: "Mission Control UI",
    client: "AeroSight Technologies",
    category: "product-app",
    categoryLabel: "Product & App",
    teaser: "A real-time mission control interface for operators managing multiple commercial UAVs simultaneously.",
    tags: ["Figma", "UX Research", "Interface Design", "Dark Mode"],
    gradient: "from-[#0f172a] via-[#1e3a5f] to-[#1d4ed8]/60",
    accentColor: "#3b82f6",
    brief:
      "AeroSight needed to replace a legacy dashboard that required extensive training and caused operator fatigue during long missions. Their software handled multi-UAV flight paths, live telemetry, and alert routing — all of which needed to coexist without overwhelming the person in the field.",
    challenges: [
      "Translating dense flight telemetry into readable UI without hiding critical data — operators need everything, instantly.",
      "Designing for outdoor use: high-contrast readability in bright sunlight, glare-proof dark mode, large tap targets for gloved hands.",
      "Building for stress — the interface had to remain intuitive at 6am with three drones in the air and one flagging a battery warning.",
    ],
    deliverables: [
      "Mission dashboard Figma flows (20+ screens)",
      "Flight plan editor with drag-and-drop waypoint system",
      "Alert triage panel with priority logic",
      "Operator onboarding flow",
      "Component library and design tokens",
    ],
    outcome:
      "The new interface passed usability testing with active drone pilots in under three weeks. Operators called it 'the first dashboard that doesn't require memorizing shortcuts.' AeroSight used the Figma flows directly in their engineering handoff.",
    outcomeMetrics: [
      { label: "Task completion time", value: "−40%" },
      { label: "Training time to proficiency", value: "3 days → 1 day" },
      { label: "Screens delivered", value: "20+" },
      { label: "Pilot usability score", value: "4.7 / 5" },
    ],
    tools: ["Figma", "FigJam", "Maze (testing)", "Lottie"],
    featured: true,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "verdana-brand-identity",
    title: "Craft Coffee Brand",
    client: "Verdana Roasters",
    category: "brand",
    categoryLabel: "Brand",
    teaser: "A full visual identity for a specialty coffee brand entering a crowded market with a sustainability-first story.",
    tags: ["Logo", "Packaging", "Typography", "Color System"],
    gradient: "from-[#78350f] via-[#92400e] to-[#d97706]/50",
    accentColor: "#f59e0b",
    brief:
      "Verdana was launching as a direct-trade roaster targeting specialty coffee enthusiasts. They had a clear sourcing story but no brand — and needed to stand out from the sea of generic 'artisan' aesthetics that dominate the category.",
    challenges: [
      "Avoiding the visual clichés of the specialty coffee world (kraft paper, hand-drawn maps, neutral earth tones) while still feeling premium.",
      "Appealing to both Gen Z buyers discovering specialty coffee and established enthusiasts who've seen every trend.",
      "The brand needed to scale across packaging, social media, and a future café environment from day one.",
    ],
    deliverables: [
      "Logo system (primary, secondary, monogram)",
      "Color palette and usage guidelines",
      "Typography pairing and hierarchy guide",
      "Packaging concepts (250g and 1kg bags)",
      "Instagram template system (12 templates)",
    ],
    outcome:
      "Verdana launched to strong reception across specialty coffee communities. The packaging was featured in two design blogs within the first month. The brand's Instagram hit 3,000 followers organically in 60 days without paid spend.",
    outcomeMetrics: [
      { label: "Instagram followers (60 days)", value: "3,000" },
      { label: "Design blog features", value: "2" },
      { label: "Packaging SKUs designed", value: "4" },
      { label: "Brand guidelines", value: "28 pages" },
    ],
    tools: ["Figma", "Illustrator", "Notion (guidelines)"],
    featured: true,
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "launchr-saas-campaign",
    title: "B2B SaaS Launch",
    client: "Launchr",
    category: "marketing-launch",
    categoryLabel: "Marketing & Launch",
    teaser: "A two-week Product Hunt and LinkedIn blitz for a project management tool targeting creative agencies.",
    tags: ["Product Hunt", "LinkedIn", "Email", "Copy", "Social"],
    gradient: "from-[#7c3aed] via-[#6d28d9] to-[#ec4899]/40",
    accentColor: "#a855f7",
    brief:
      "Launchr had a solid product and a two-week launch window. They needed a creative team to handle everything: Product Hunt launch assets, a LinkedIn content series, an email drip, and landing page copy — all built around a single narrative that could cut through a saturated PM tool market.",
    challenges: [
      "Differentiating in a category where every competitor claims to 'save your team time' — the brief needed a sharper angle.",
      "Coordinating channel timing so the Product Hunt spike, email sequence, and LinkedIn posts all amplified each other.",
      "Writing for two audiences simultaneously: the agency founders who buy, and the project managers who use it daily.",
    ],
    deliverables: [
      "Product Hunt launch kit (thumbnail, tagline, gallery assets)",
      "LinkedIn carousel series (6 posts, 48 slides total)",
      "Email welcome sequence (5 emails)",
      "Landing page copy and above-the-fold rewrite",
      "Objection-handling FAQ copy",
    ],
    outcome:
      "Launchr hit #2 Product of the Day on launch. The email sequence outperformed category benchmarks by 19 percentage points. The campaign drove 1,200 signups in the first week without paid advertising.",
    outcomeMetrics: [
      { label: "Product Hunt ranking", value: "#2 of the Day" },
      { label: "Launch week signups", value: "1,200" },
      { label: "Email open rate", value: "38%" },
      { label: "LinkedIn post reach", value: "42k impressions" },
    ],
    tools: ["Figma", "Notion", "Mailchimp", "Copy.ai (drafts)"],
    featured: true,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "fable-content-system",
    title: "Indie Animation Content",
    client: "Fable Studios",
    category: "content-story",
    categoryLabel: "Content & Story",
    teaser: "A monthly content engine for an indie animation studio building audience ahead of their series release.",
    tags: ["Reels", "TikTok", "Content Calendar", "Templates"],
    gradient: "from-[#065f46] via-[#047857] to-[#10b981]/40",
    accentColor: "#10b981",
    brief:
      "Fable had an animated series in production with zero social presence and a crowdfunding campaign coming in four months. They needed a content system that could run with minimal internal bandwidth — a small team of animators, not marketers.",
    challenges: [
      "Representing a series still in production: no finished footage, limited assets, spoiler restrictions on story content.",
      "Building emotional investment in characters and world before audiences had seen anything.",
      "Designing a system the team could execute themselves with templates and a clear monthly playbook.",
    ],
    deliverables: [
      "Monthly content calendar system (Notion)",
      "8 repeatable content formats (process reveals, character spotlights, WIP previews)",
      "Reels and TikTok caption templates",
      "Community engagement playbook",
      "Hashtag and platform strategy document",
    ],
    outcome:
      "The studio's TikTok account grew from 800 to 12,000 followers in four months using only organic posts. The crowdfunding campaign funded to goal two weeks ahead of schedule, with backers citing the social presence as their reason for trusting the project.",
    outcomeMetrics: [
      { label: "TikTok growth", value: "800 → 12k" },
      { label: "Crowdfunding close", value: "2 weeks early" },
      { label: "Content formats built", value: "8" },
      { label: "Avg. Reel engagement rate", value: "9.4%" },
    ],
    tools: ["CapCut", "Figma", "Notion", "Later"],
    featured: false,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "nucleus-health-explainer",
    title: "AI Diagnostics Explainer",
    client: "Nucleus Health",
    category: "experimental",
    categoryLabel: "Experimental",
    teaser: "A 60-second animated explainer making AI diagnostic software feel trustworthy to hospital procurement teams.",
    tags: ["Motion Design", "Storyboard", "Script", "B2B"],
    gradient: "from-[#164e63] via-[#0e7490] to-[#22d3ee]/30",
    accentColor: "#06b6d4",
    brief:
      "Nucleus had built AI-powered diagnostic software for radiology teams. Their sales team was closing hospital deals but losing momentum during the 'explain this to our board' stage. They needed a single asset that could do that explanation — credibly, in under a minute.",
    challenges: [
      "AI diagnostics is abstract — the product works invisibly, which makes it hard to visualize without oversimplifying.",
      "Hospital procurement audiences are skeptical of hype. The explainer had to be rigorous, not flashy.",
      "The 60-second cut needed a 15-second version for pre-roll ads without losing the core message.",
    ],
    deliverables: [
      "Script and voiceover brief",
      "Full storyboard (24 frames)",
      "60-second animated explainer",
      "15-second ad cut-down",
      "Thumbnail and social static from motion frames",
    ],
    outcome:
      "The explainer became the anchor asset in three enterprise sales decks. Two signed contracts cited it in post-close feedback as a key factor in building board-level confidence. It's been used without modification for 18 months.",
    outcomeMetrics: [
      { label: "Deals influenced", value: "2 enterprise contracts" },
      { label: "Sales deck integrations", value: "3 teams" },
      { label: "Asset lifespan (active)", value: "18 months" },
      { label: "Versions delivered", value: "60s + 15s" },
    ],
    tools: ["After Effects", "Figma (storyboard)", "Audition", "Frame.io"],
    featured: false,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "basecamp-vc-lp-deck",
    title: "LP Update Deck",
    client: "Basecamp Ventures",
    category: "content-story",
    categoryLabel: "Content & Story",
    teaser: "An annual LP update presentation for a seed-stage VC fund — professional, data-rich, and actually memorable.",
    tags: ["Figma", "Data Viz", "Presentation", "Print"],
    gradient: "from-[#1e1b4b] via-[#312e81] to-[#6366f1]/40",
    accentColor: "#818cf8",
    brief:
      "Basecamp's annual LP update was a 40-slide PowerPoint that their team knew was underperforming. The content was solid — fund returns were strong — but the format was making it hard to follow. They needed a redesign that honored the data without burying it.",
    challenges: [
      "Financial data is dense by nature. The deck had to be skimmable for busy LPs but detailed enough for those who wanted depth.",
      "Maintaining the fund's serious, understated tone — no startup-y design trends that would feel off-brand for institutional investors.",
      "The deck needed to work in presentation mode and as a leave-behind PDF, with a print-ready version for in-person LP meetings.",
    ],
    deliverables: [
      "22-slide Figma deck (full redesign)",
      "Custom data visualization system for portfolio performance",
      "Icon system for portfolio company categories",
      "Print-ready PDF export (A4 + US Letter)",
      "Slide master for future quarterly updates",
    ],
    outcome:
      "The deck was used in the fund's annual LP meeting. LP re-commitment rate for the following vintage was 94%. One limited partner forwarded the deck to another fund as a benchmark for what LP communications should look like.",
    outcomeMetrics: [
      { label: "LP re-commitment rate", value: "94%" },
      { label: "Deck shared externally", value: "1 fund benchmark" },
      { label: "Slides delivered", value: "22" },
      { label: "Formats", value: "Figma + PDF (2 sizes)" },
    ],
    tools: ["Figma", "Notion (outline)", "Adobe Acrobat (print)"],
    featured: false,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "fintech-landing-page",
    title: "Fintech Landing Page",
    client: "Nexus Finance",
    category: "website",
    categoryLabel: "Website",
    teaser: "A high-conversion landing page for a new consumer fintech product.",
    tags: ["Web Design", "Next.js", "Tailwind CSS", "Framer Motion"],
    gradient: "from-[#022c22] via-[#064e3b] to-[#047857]/40",
    accentColor: "#34d399",
    brief:
      "Nexus Finance needed a landing page for their new mobile app. The goal was to build a waitlist of 10,000 users before the official launch. The design needed to feel trustworthy, modern, and clearly explain the value proposition without overwhelming the user.",
    challenges: [
      "Balancing a sleek, modern aesthetic with the trust required for a financial product.",
      "Optimizing performance to ensure fast load times on mobile devices.",
      "Creating engaging animations that enhance the user experience without being distracting.",
    ],
    deliverables: [
      "High-fidelity Figma prototypes",
      "Responsive Next.js landing page",
      "Custom 3D coin animations",
      "Integration with waitlist API",
    ],
    outcome:
      "The landing page converted at 12%, exceeding the initial goal. The waitlist hit 15,000 users in the first month. The page also scored 98/100 on Google PageSpeed Insights.",
    outcomeMetrics: [
      { label: "Conversion rate", value: "12%" },
      { label: "Waitlist signups", value: "15,000" },
      { label: "PageSpeed score", value: "98/100" },
    ],
    tools: ["Figma", "Next.js", "Tailwind", "Framer Motion"],
    featured: false,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "health-tracker-app",
    title: "Health Tracker Redesign",
    client: "Vitality Health",
    category: "product-app",
    categoryLabel: "Product & App",
    teaser: "A complete UX/UI overhaul of a legacy health tracking mobile application.",
    tags: ["Mobile UX", "Design System", "Prototyping", "User Testing"],
    gradient: "from-[#4c1d95] via-[#5b21b6] to-[#7c3aed]/40",
    accentColor: "#a78bfa",
    brief:
      "Vitality Health's mobile app had grown cluttered over 5 years. Users were struggling to log basic metrics, leading to high drop-off rates. They needed a simplified, intuitive interface that encouraged daily use and made health data easy to understand.",
    challenges: [
      "Simplifying complex health data into easily digestible daily summaries.",
      "Designing a unified design system to replace the fragmented legacy UI.",
      "Ensuring accessibility for a wide demographic of users, including seniors.",
    ],
    deliverables: [
      "Comprehensive UX audit",
      "New mobile design system (iOS and Android)",
      "Interactive prototypes for user testing",
      "Redesigned core user flows (onboarding, logging, reporting)",
    ],
    outcome:
      "The redesigned app saw a 35% increase in daily active users. The time required to log a daily entry decreased by 50%. The app store rating improved from 3.2 to 4.6 stars.",
    outcomeMetrics: [
      { label: "Daily active users", value: "+35%" },
      { label: "App store rating", value: "3.2 → 4.6" },
      { label: "Time to log data", value: "-50%" },
    ],
    tools: ["Figma", "Principle", "UserTesting.com"],
    featured: false,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
  },
];

export const CATEGORY_FILTERS = [
  { id: "all", label: "All Work" },
  { id: "brand", label: "Brand" },
  { id: "website", label: "Website" },
  { id: "product-app", label: "Product & App" },
  { id: "content-story", label: "Content & Story" },
  { id: "marketing-launch", label: "Marketing & Launch" },
  { id: "experimental", label: "Experimental" },
];
