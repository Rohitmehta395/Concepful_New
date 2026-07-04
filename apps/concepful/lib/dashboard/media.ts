export type MediaKind = "image" | "video" | "document" | "figma";

export interface MediaItem {
  id:          string;
  projectId:   string;
  title:       string;
  kind:        MediaKind;
  iteration:   number;
  isFinal:     boolean;
  date:        string;
  description?: string;
}

export const MEDIA_KIND_META: Record<MediaKind, { label: string; icon: string }> = {
  image:    { label: "Image",    icon: "□" },
  video:    { label: "Video",    icon: "▶" },
  document: { label: "Document", icon: "▤" },
  figma:    { label: "Figma",    icon: "✦" },
};

/* Coral→navy gradient spectrum — inline styles avoid Tailwind purge issues */
export const MEDIA_GRADIENTS: string[] = [
  "linear-gradient(135deg, hsl(349 90% 85%), hsl(349 60% 93%))",
  "linear-gradient(135deg, hsl(232 28% 70%), hsl(232 28% 88%))",
  "linear-gradient(135deg, hsl(349 70% 78%), hsl(232 28% 82%))",
  "linear-gradient(135deg, hsl(20 80% 80%), hsl(349 60% 90%))",
  "linear-gradient(135deg, hsl(232 40% 60%), hsl(349 40% 80%))",
  "linear-gradient(135deg, hsl(340 60% 75%), hsl(260 30% 85%))",
];

export function gradientFor(item: MediaItem): string {
  const idx = parseInt(item.id.replace(/\D/g, "").slice(-2) || "0", 10);
  return MEDIA_GRADIENTS[idx % MEDIA_GRADIENTS.length];
}

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString();

export const SEED_MEDIA: MediaItem[] = [
  /* ── Project 1: Q3 Campaign ── */
  {
    id: "m1-1", projectId: "1", kind: "image", iteration: 1, isFinal: false,
    title: "Visual Direction Deck",
    description: "Early explorations for the campaign visual language and colour palette.",
    date: daysAgo(10),
  },
  {
    id: "m1-2", projectId: "1", kind: "figma", iteration: 2, isFinal: false,
    title: "Moodboard & References",
    description: "Curated reference images and brand direction — open in Figma to view annotations.",
    date: daysAgo(7),
  },
  {
    id: "m1-3", projectId: "1", kind: "image", iteration: 3, isFinal: true,
    title: "Campaign Hero Artwork — Final",
    description: "Approved hero image for production. Delivered in 3 aspect ratios.",
    date: daysAgo(2),
  },

  /* ── Project 2: Investor Deck ── */
  {
    id: "m2-1", projectId: "2", kind: "document", iteration: 1, isFinal: false,
    title: "Investor Deck Draft v1",
    description: "Initial deck structure with placeholder content and narrative arc.",
    date: daysAgo(12),
  },
  {
    id: "m2-2", projectId: "2", kind: "figma", iteration: 2, isFinal: false,
    title: "Slide Design System",
    description: "Typography, grid, colour tokens, and graphic language for all slides.",
    date: daysAgo(8),
  },
  {
    id: "m2-3", projectId: "2", kind: "image", iteration: 3, isFinal: false,
    title: "Revised Slides — Stakeholder Edit",
    description: "Applied review comments from the board meeting session.",
    date: daysAgo(4),
  },

  /* ── Project 3: Brand Voice ── */
  {
    id: "m3-1", projectId: "3", kind: "document", iteration: 1, isFinal: false,
    title: "Brand Audit Report",
    description: "Current brand assessment: tone gaps, visual inconsistencies, and opportunity areas.",
    date: daysAgo(15),
  },
  {
    id: "m3-2", projectId: "3", kind: "document", iteration: 2, isFinal: true,
    title: "Brand Voice Guidelines — Final",
    description: "Tone of voice, vocabulary, and messaging principles across all channels.",
    date: daysAgo(5),
  },

  /* ── Project 4: Social Media Template Pack ── */
  {
    id: "m4-1", projectId: "4", kind: "image", iteration: 1, isFinal: false,
    title: "Template Sketches",
    description: "Rough wireframes and composition options for Stories, Feed, and Carousel.",
    date: daysAgo(18),
  },
  {
    id: "m4-2", projectId: "4", kind: "figma", iteration: 2, isFinal: false,
    title: "Design Refinement",
    description: "High-fidelity templates with brand colours and typography applied.",
    date: daysAgo(12),
  },
  {
    id: "m4-3", projectId: "4", kind: "image", iteration: 3, isFinal: true,
    title: "24-Template Pack — Final",
    description: "All 24 templates exported: Stories, Feed, Carousel. Figma source + PNG + MP4.",
    date: daysAgo(8),
  },
];

export function getProjectMedia(projectId: string): MediaItem[] {
  return SEED_MEDIA.filter(m => m.projectId === projectId);
}
