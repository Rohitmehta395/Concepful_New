export type PingKind = "message" | "todo" | "media";
export type MessageSubtype = "chat" | "note" | "followup";
export type TodoSubtype    = "task" | "project" | "meeting";
export type MediaSubtype   = "document" | "asset";
export type PingSubtype    = MessageSubtype | TodoSubtype | MediaSubtype;

export interface Ping {
  id:             string;
  kind:           PingKind;
  subtype:        PingSubtype;
  title:          string;
  body:           string;
  author:         "client" | "team";
  projectId?:     string;
  date:           string;
  done?:          boolean;
  fileUrl?:       string;
  fileName?:      string;
  previewUrl?:    string;
  scheduledDate?: string;
}

const STORAGE_KEY = "concepful_pings";

export function loadPings(): Ping[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Ping[];
  } catch {}
  return SEED_PINGS;
}

export function savePings(pings: Ping[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pings));
}

export function addPing(pings: Ping[], ping: Omit<Ping, "id" | "date">): Ping[] {
  const newPing: Ping = { ...ping, id: crypto.randomUUID(), date: new Date().toISOString() };
  return [newPing, ...pings];
}

export const KIND_META: Record<PingKind, { label: string; color: string; bg: string; border: string; dot: string }> = {
  message: {
    label:  "Message",
    color:  "text-primary",
    bg:     "bg-primary/[0.07]",
    border: "border-primary/20",
    dot:    "bg-primary",
  },
  todo: {
    label:  "To-Do",
    color:  "text-[hsl(232,28%,28%)]",
    bg:     "bg-[hsl(232,28%,11%)]/[0.07]",
    border: "border-[hsl(232,28%,11%)]/20",
    dot:    "bg-[hsl(232,28%,28%)]",
  },
  media: {
    label:  "Media",
    color:  "text-muted-foreground",
    bg:     "bg-secondary/60",
    border: "border-border",
    dot:    "bg-muted-foreground",
  },
};

export const SUBTYPE_META: Record<PingSubtype, { label: string; emoji: string }> = {
  chat:     { label: "Chat",      emoji: "💬" },
  note:     { label: "Note",      emoji: "📝" },
  followup: { label: "Follow-up", emoji: "🔔" },
  task:     { label: "Task",      emoji: "✓"  },
  project:  { label: "Project",   emoji: "□"  },
  meeting:  { label: "Meeting",   emoji: "◷"  },
  document: { label: "Document",  emoji: "▤"  },
  asset:    { label: "Asset",     emoji: "⊞"  },
};

const now = new Date();
function daysAgo(d: number) { return new Date(now.getTime() - d * 86400000).toISOString(); }

export const SEED_PINGS: Ping[] = [
  {
    id: "1", kind: "message", subtype: "chat", author: "team",
    title: "Q3 Campaign — direction confirmed",
    body: "Hey! We've locked in the moodboard direction — coral + dark navy palette, editorial photography style. Moving to Design phase tomorrow.",
    date: daysAgo(0), projectId: "1",
  },
  {
    id: "2", kind: "todo", subtype: "task", author: "team",
    title: "Approve brand color palette",
    body: "Please review the 3 palette options in Figma and confirm your preferred direction by Friday EOD.",
    date: daysAgo(1), projectId: "1", done: false,
    scheduledDate: "2026-06-13T17:00:00.000Z",
  },
  {
    id: "3", kind: "media", subtype: "asset", author: "team",
    title: "Moodboard v1 — Q3 Campaign",
    body: "Initial moodboard exploring editorial direction. 12 reference images across two visual territories.",
    date: daysAgo(1), projectId: "1", fileName: "moodboard_v1.fig",
    previewUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&q=80",
  },
  {
    id: "4", kind: "message", subtype: "followup", author: "team",
    title: "Investor Deck — revision notes",
    body: "Quick follow-up: slide 8 data visualization needs your updated Q1 numbers before we can finalize. Can you drop them in the notes?",
    date: daysAgo(2), projectId: "2",
  },
  {
    id: "5", kind: "todo", subtype: "meeting", author: "team",
    title: "Creative kickoff — Brand Voice Guidelines",
    body: "Scheduled for Thursday June 13 at 2pm EST. We'll walk through brand voice principles and gather input on tone and positioning.",
    date: daysAgo(3), projectId: "3", done: false,
    scheduledDate: "2026-06-13T14:00:00.000Z",
  },
  {
    id: "6", kind: "media", subtype: "document", author: "team",
    title: "Brand Strategy Brief",
    body: "Completed brand strategy document covering positioning, target audience, competitive landscape, and core messaging pillars.",
    date: daysAgo(5), projectId: "3", fileName: "brand_strategy_brief.pdf",
    previewUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=500&fit=crop&q=80",
  },
  {
    id: "7", kind: "message", subtype: "note", author: "client",
    title: "Reference: competitor rebrand I like",
    body: "Sharing this as a reference — I really like how Figma handled their brand refresh. Particularly the typography pairing and use of whitespace.",
    date: daysAgo(6),
  },
  {
    id: "8", kind: "todo", subtype: "project", author: "team",
    title: "Social Media Template Pack — delivered",
    body: "All 24 templates (Stories, Feed, Carousel) exported and ready for download. Includes Figma source files and PNG/MP4 exports.",
    date: daysAgo(8), projectId: "4", done: true,
  },
  {
    id: "9", kind: "media", subtype: "asset", author: "team",
    title: "Brand Identity Kit — Final",
    body: "Full brand identity system: logo suite, color tokens, typography scale, and iconography guidelines. Ready for handoff.",
    date: daysAgo(4), projectId: "3", fileName: "brand_identity_kit.fig",
    previewUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=500&fit=crop&q=80",
  },
  {
    id: "10", kind: "media", subtype: "asset", author: "team",
    title: "Social Media Templates — All Formats",
    body: "24 templates across Stories, Feed, and Carousel formats. Figma source + exported PNG and MP4 motion variants included.",
    date: daysAgo(7), projectId: "4", fileName: "social_templates_v2.fig",
    previewUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=500&fit=crop&q=80",
  },
  {
    id: "11", kind: "media", subtype: "document", author: "team",
    title: "Investor Deck — v3 Final",
    body: "Updated slide deck with revised data visualization on slide 8, executive summary, and new market opportunity section.",
    date: daysAgo(3), projectId: "2", fileName: "investor_deck_v3.pdf",
    previewUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&q=80",
  },
];
