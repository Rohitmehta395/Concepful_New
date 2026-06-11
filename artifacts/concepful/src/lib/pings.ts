export type PingKind = "message" | "todo" | "media";

export type MessageSubtype = "chat" | "note" | "followup";
export type TodoSubtype    = "task" | "project" | "meeting";
export type MediaSubtype   = "document" | "asset";

export type PingSubtype = MessageSubtype | TodoSubtype | MediaSubtype;

export interface Ping {
  id:        string;
  kind:      PingKind;
  subtype:   PingSubtype;
  title:     string;
  body:      string;
  author:    "client" | "team";
  projectId?: string;
  date:      string;
  done?:     boolean;
  fileUrl?:  string;
  fileName?: string;
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
  const newPing: Ping = {
    ...ping,
    id:   crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  return [newPing, ...pings];
}

export const KIND_META: Record<PingKind, { label: string; color: string; bg: string; border: string }> = {
  message: {
    label:  "Message",
    color:  "text-blue-600 dark:text-blue-400",
    bg:     "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  todo: {
    label:  "To-Do",
    color:  "text-amber-600 dark:text-amber-400",
    bg:     "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  media: {
    label:  "Media",
    color:  "text-violet-600 dark:text-violet-400",
    bg:     "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
  },
};

export const SUBTYPE_META: Record<PingSubtype, { label: string; emoji: string }> = {
  chat:      { label: "Chat",      emoji: "💬" },
  note:      { label: "Note",      emoji: "📝" },
  followup:  { label: "Follow-up", emoji: "🔔" },
  task:      { label: "Task",      emoji: "✅" },
  project:   { label: "Project",   emoji: "📁" },
  meeting:   { label: "Meeting",   emoji: "📅" },
  document:  { label: "Document",  emoji: "📄" },
  asset:     { label: "Asset",     emoji: "🖼️" },
};

const now = new Date();
function daysAgo(d: number) { return new Date(now.getTime() - d * 86400000).toISOString(); }

export const SEED_PINGS: Ping[] = [
  {
    id: "1", kind: "message", subtype: "chat", author: "team",
    title: "Q3 Campaign — direction confirmed",
    body: "Hey! We've reviewed your brief and locked in the moodboard direction. Coral + dark navy palette, editorial photography style. Moving to Design phase tomorrow.",
    date: daysAgo(0), projectId: "1",
  },
  {
    id: "2", kind: "todo", subtype: "task", author: "team",
    title: "Approve brand color palette",
    body: "Please review the 3 palette options shared in the Figma board and confirm your preferred direction by EOD Friday.",
    date: daysAgo(1), projectId: "1", done: false,
  },
  {
    id: "3", kind: "media", subtype: "asset", author: "team",
    title: "Moodboard v1 — Q3 Campaign",
    body: "Initial moodboard exploring editorial direction. 12 reference images across two visual territories.",
    date: daysAgo(1), projectId: "1", fileName: "moodboard_v1.fig",
  },
  {
    id: "4", kind: "message", subtype: "followup", author: "team",
    title: "Investor Deck — revision notes",
    body: "Quick follow-up: the slide 8 data visualization needs your updated Q1 numbers before we can finalize. Can you drop them in the notes thread?",
    date: daysAgo(2), projectId: "2",
  },
  {
    id: "5", kind: "todo", subtype: "meeting", author: "team",
    title: "Creative kickoff — Brand Voice Guidelines",
    body: "Scheduled for Thursday June 13 at 2pm EST. We'll walk through brand voice principles and gather input on tone, vocabulary, and audience positioning.",
    date: daysAgo(3), projectId: "3", done: false,
  },
  {
    id: "6", kind: "media", subtype: "document", author: "team",
    title: "Brand Strategy Brief",
    body: "Completed brand strategy document covering positioning, target audience, competitive landscape, and core messaging pillars.",
    date: daysAgo(5), projectId: "3", fileName: "brand_strategy_brief.pdf",
  },
  {
    id: "7", kind: "message", subtype: "note", author: "client",
    title: "Reference: competitor rebrand I like",
    body: "Sharing this link as a reference — I really like how Figma handled their brand refresh. Particularly the typography pairing and the way they used whitespace.",
    date: daysAgo(6),
  },
  {
    id: "8", kind: "todo", subtype: "project", author: "team",
    title: "Social Media Template Pack — delivered",
    body: "All 24 templates (Stories, Feed, Carousel) have been exported and are ready for download. Includes both Figma source files and PNG/MP4 exports.",
    date: daysAgo(8), projectId: "4", done: true,
  },
];
