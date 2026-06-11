import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListWorkRequests, useListCompletedWork } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, CheckCircle2, Eye, MousePointer, TrendingUp,
  ArrowUpRight, Mail, Download, Share2,
  FileText, Link2, ExternalLink, AlertCircle,
  ChevronRight, ChevronDown, Maximize2, MessageSquare, X,
  Send, ThumbsUp, Pencil, RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/lib/dashboard-context";
import { loadPings, savePings, addPing, SUBTYPE_META, KIND_META, Ping } from "@/lib/pings";
import { MediaItem, MEDIA_KIND_META, getProjectMedia, gradientFor } from "@/lib/media";

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface PerformanceMetrics {
  impressions?: number; clicks?: number; ctr?: number; engagementRate?: number;
  reach?: number; platform?: string; sent?: number; opens?: number;
  openRate?: number; conversions?: number; roas?: number; note?: string;
}

type TimelineEntry =
  | { kind: "phase"; phase: string; date: string; isCurrent: boolean; isDone: boolean }
  | { kind: "ping";  ping: Ping }
  | { kind: "media"; media: MediaItem };

type MediaStatus = "approved" | "edits_requested" | "new_direction";

/* ══════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════ */
const PHASES = ["Discovery", "Brief", "Design", "Review", "Revisions", "Delivered"] as const;

const PHASE_DESC: Record<string, string> = {
  Discovery:  "Understanding your goals and requirements",
  Brief:      "Defining scope and creative direction",
  Design:     "Active creative work in progress",
  Review:     "Ready for your feedback and approval",
  Revisions:  "Applying your requested changes",
  Delivered:  "Final assets delivered",
};

const STATUS_META: Record<MediaStatus, { label: string; color: string; bg: string; border: string }> = {
  approved:        { label: "Approved",        color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  edits_requested: { label: "Edits Requested",  color: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800" },
  new_direction:   { label: "New Direction",    color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
};

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function getPhaseIndex(status: string): number {
  return (
    { pending: 0, in_progress: 2, in_review: 3, approved: 4, delivered: 5, completed: 5 } as Record<string, number>
  )[status] ?? 0;
}

function getScore(m: PerformanceMetrics | null): number | null {
  if (!m) return null;
  if (m.ctr && m.ctr > 0)           return Math.min(100, Math.round((m.ctr / 5) * 100));
  if (m.openRate && m.openRate > 0) return Math.min(100, Math.round((m.openRate / 40) * 100));
  return null;
}

function fmtNum(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildTimeline(
  status: string,
  createdAt: string,
  pings: Ping[],
  media: MediaItem[],
  phaseOverride: number | null,
): TimelineEntry[] {
  const pi = phaseOverride ?? getPhaseIndex(status);
  const phaseEntries: TimelineEntry[] = PHASES.slice(0, pi + 1).map((phase, i) => ({
    kind: "phase" as const, phase,
    date: new Date(new Date(createdAt).getTime() + i * 3 * 86_400_000).toISOString(),
    isCurrent: i === pi, isDone: i < pi,
  }));
  const pingEntries:  TimelineEntry[] = pings.map(p => ({ kind: "ping"  as const, ping: p }));
  const mediaEntries: TimelineEntry[] = media.map(m => ({ kind: "media" as const, media: m }));
  return [...phaseEntries, ...pingEntries, ...mediaEntries].sort((a, b) => {
    const da = a.kind === "phase" ? a.date : a.kind === "ping" ? a.ping.date : a.media.date;
    const db = b.kind === "phase" ? b.date : b.kind === "ping" ? b.ping.date : b.media.date;
    return new Date(da).getTime() - new Date(db).getTime();
  });
}

/* ══════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════ */
function FigmaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 57" fill="currentColor">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" />
      <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" />
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" />
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" />
    </svg>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-secondary/40 rounded-xl p-4 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Media approval status control ────────────────── */
function MediaStatusControl({ mediaId, status, onChange }: {
  mediaId: string;
  status: MediaStatus | null;
  onChange: (s: MediaStatus) => void;
}) {
  const opts: { key: MediaStatus; label: string; Icon: any }[] = [
    { key: "approved",        label: "Approved",       Icon: ThumbsUp  },
    { key: "edits_requested", label: "Edits Requested", Icon: Pencil    },
    { key: "new_direction",   label: "New Direction",   Icon: RefreshCcw },
  ];
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Approval Status</p>
      <div className="flex gap-1.5 flex-wrap">
        {opts.map(({ key, label, Icon }) => {
          const m   = STATUS_META[key];
          const sel = status === key;
          return (
            <button key={key} onClick={() => onChange(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                sel ? cn(m.bg, m.color, m.border) : "border-border/50 text-muted-foreground hover:border-border",
              )}>
              <Icon className="h-3 w-3" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mini comment thread ───────────────────────────── */
function MiniCommentThread({ comments, onViewAll, onOpen }: {
  comments: Ping[];
  onViewAll: () => void;
  onOpen: () => void;
}) {
  if (comments.length === 0) {
    return (
      <button onClick={onOpen}
        className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
        <MessageSquare className="h-3.5 w-3.5" />
        Start a comment thread on this file
      </button>
    );
  }
  const shown = comments.slice(0, 2);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {comments.length} Comment{comments.length > 1 ? "s" : ""}
        </p>
        <button onClick={onViewAll} className="text-[10px] text-primary font-semibold hover:underline">
          Open chat →
        </button>
      </div>
      {shown.map(c => (
        <div key={c.id} className="flex items-start gap-2 bg-secondary/30 rounded-lg px-3 py-2">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[9px] font-bold text-primary">{c.author === "team" ? "T" : "Y"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium line-clamp-2 leading-snug">{c.body}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(c.date)}</p>
          </div>
        </div>
      ))}
      {comments.length > 2 && (
        <p className="text-[10px] text-muted-foreground">+{comments.length - 2} more</p>
      )}
    </div>
  );
}

/* ── Review Overlay (fullscreen image + chat) ──────── */
function ReviewOverlay({ media, comments, onClose, onNewComment }: {
  media: MediaItem;
  comments: Ping[];
  onClose: () => void;
  onNewComment: (body: string) => void;
}) {
  const [reply, setReply] = useState("");
  const km = MEDIA_KIND_META[media.kind];

  const handleSend = () => {
    if (!reply.trim()) return;
    onNewComment(reply.trim());
    setReply("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 flex" onClick={onClose}>
      <div className="flex w-full h-full" onClick={e => e.stopPropagation()}>

        {/* Left — image */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <button onClick={onClose}
            className="absolute top-4 left-4 h-8 w-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="w-full max-w-3xl">
            <div className="aspect-video rounded-2xl flex items-center justify-center overflow-hidden border border-white/10"
              style={{ background: gradientFor(media) }}>
              <span className="text-9xl opacity-10 font-bold select-none">{km.icon}</span>
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-white/50 uppercase tracking-widest font-bold">{km.label}</span>
                  <span className="text-xs text-white/40">v{media.iteration}</span>
                  {media.isFinal && (
                    <span className="text-[10px] bg-primary text-white rounded-full px-2 py-0.5 font-bold">Final</span>
                  )}
                </div>
                <p className="text-lg font-bold text-white leading-tight">{media.title}</p>
                {media.description && (
                  <p className="text-sm text-white/60 mt-1 leading-relaxed">{media.description}</p>
                )}
              </div>
              <Button size="sm" variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-1.5 shrink-0"
                onClick={() => { /* download */ }}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </div>
        </div>

        {/* Right — chat */}
        <div className="w-[360px] shrink-0 bg-card/95 backdrop-blur flex flex-col border-l border-white/10">
          <div className="px-5 py-4 border-b border-border/50 shrink-0">
            <p className="font-semibold text-sm">Comments</p>
            <p className="text-[11px] text-muted-foreground">{media.title} — v{media.iteration}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No comments yet.<br />Be the first to leave a note.</p>
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className={cn(
                  "flex items-start gap-2.5",
                  c.author === "client" && "flex-row-reverse",
                )}>
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                    c.author === "team" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                  )}>
                    {c.author === "team" ? "T" : "Y"}
                  </div>
                  <div className={cn(
                    "flex-1 max-w-[240px] rounded-xl px-3 py-2",
                    c.author === "client" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary rounded-tl-sm",
                  )}>
                    <p className="text-xs leading-snug">{c.body}</p>
                    <p className={cn(
                      "text-[9px] mt-1",
                      c.author === "client" ? "text-primary-foreground/60" : "text-muted-foreground",
                    )}>
                      {timeAgo(c.date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Compose */}
          <div className="p-4 border-t border-border/50 space-y-2 shrink-0">
            <Textarea
              value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Leave a comment…"
              className="text-sm resize-none min-h-[72px]"
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSend(); }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">⌘+Enter</p>
              <Button size="sm" onClick={handleSend} disabled={!reply.trim()} className="gap-1.5 h-7 text-xs">
                <Send className="h-3 w-3" /> Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function ProjectDetail() {
  const [, params]      = useRoute("/dashboard/project/:id");
  const [, setLocation] = useLocation();
  const { toast }       = useToast();
  const { setActiveProject, setActivePing } = useDashboard();

  const id = params?.id ? parseInt(params.id) : null;

  /* ── Data ── */
  const { data: requests, isLoading: reqLoading } = useListWorkRequests(
    { query: { queryKey: ["requests", 1] } },
    { request: { query: { companyId: 1 } } },
  );
  const { data: work, isLoading: workLoading } = useListCompletedWork(
    { query: { queryKey: ["completed-work", 1] } },
    { request: { query: { companyId: 1 } } },
  );

  const isLoading = reqLoading || workLoading;
  const request   = requests?.find(r => r.id === id);
  const completed = work?.find(w => w.id === id);

  const title     = request?.title ?? completed?.title ?? "";
  const category  = (request?.type ?? completed?.category ?? "").toLowerCase();
  const status    = request?.status ?? (completed?.approved ? "approved" : "completed");
  const createdAt = request?.createdAt ?? completed?.completedAt ?? new Date().toISOString();
  const basePi    = getPhaseIndex(status);

  /* ── Phase override ── */
  const phaseKey = `concepful_phase_${id}`;
  const [localPhase, setLocalPhase] = useState<number | null>(() => {
    const s = localStorage.getItem(phaseKey);
    return s !== null ? parseInt(s) : null;
  });
  const effectivePi    = localPhase ?? basePi;
  const effectivePhase = PHASES[Math.min(effectivePi, PHASES.length - 1)];

  const advancePhase = () => {
    const next = Math.min(effectivePi + 1, PHASES.length - 1);
    setLocalPhase(next);
    localStorage.setItem(phaseKey, String(next));
    toast({ title: `Moved to ${PHASES[next]}`, description: "Phase updated." });
  };

  /* ── Figma link ── */
  const figmaKey = `concepful_figma_${id}`;
  const [figmaInput,    setFigmaInput]    = useState(() => localStorage.getItem(figmaKey) ?? "");
  const [savedFigmaUrl, setSavedFigmaUrl] = useState(() => localStorage.getItem(figmaKey) ?? "");
  const saveFigmaUrl = () => {
    localStorage.setItem(figmaKey, figmaInput);
    setSavedFigmaUrl(figmaInput);
    toast({ title: "Figma link saved" });
  };

  /* ── Pings + media ── */
  const [pings, setPings] = useState<Ping[]>(() => loadPings());
  const projectPings = pings.filter(p => p.projectId === id?.toString());
  const mediaItems   = getProjectMedia(id?.toString() ?? "");

  const getMediaComments = (media: MediaItem) =>
    projectPings.filter(p => p.title.startsWith(`Re: ${media.title}`));

  /* ── Media approval statuses ── */
  const statusKey = `concepful_media_status_${id}`;
  const [mediaStatuses, setMediaStatuses] = useState<Record<string, MediaStatus>>(() => {
    try { return JSON.parse(localStorage.getItem(statusKey) ?? "{}"); } catch { return {}; }
  });
  const setMediaStatus = (mediaId: string, st: MediaStatus) => {
    const updated = { ...mediaStatuses, [mediaId]: st };
    setMediaStatuses(updated);
    localStorage.setItem(statusKey, JSON.stringify(updated));
  };

  /* ── UI state ── */
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [reviewMedia,   setReviewMedia]   = useState<MediaItem | null>(null);

  /* ── Active project context ── */
  useEffect(() => {
    if (id && title) setActiveProject(id, title);
    return () => setActiveProject(null, null);
  }, [id, title]);

  /* ── Add comment ── */
  const handleAddComment = (media: MediaItem, body: string) => {
    const updated = addPing(pings, {
      kind: "message", subtype: "chat", author: "client",
      title: `Re: ${media.title}`,
      body,
      projectId: id?.toString(),
    });
    setPings(updated);
    savePings(updated);
  };

  const handleOpenChat = (media: MediaItem) => {
    setReviewMedia(media);
  };

  /* ── Timeline ── */
  const timeline = buildTimeline(status, createdAt, projectPings, mediaItems, localPhase);

  /* ── Performance ── */
  const metrics    = completed?.performanceMetrics as PerformanceMetrics | null;
  const score      = getScore(metrics);
  const hasMetrics = metrics && Object.keys(metrics).some(k => k !== "note" && (metrics as any)[k]);

  /* ── Scroll anchors ── */
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Guards ── */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!request && !completed) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto text-center py-24">
          <FileText className="h-12 w-12 text-muted-foreground/25 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Project not found</h2>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-7 pb-24">

        {/* Back */}
        <button onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>

        {/* ── Phase stepper ── */}
        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project Phase</h2>
            <div className="flex items-center gap-2">
              {status === "in_review" && (
                <div className="flex items-center gap-1.5 bg-primary/[0.07] border border-primary/20 rounded-full px-3 py-1">
                  <AlertCircle className="h-3 w-3 text-primary" />
                  <p className="text-xs font-semibold text-primary">Your review needed</p>
                </div>
              )}
              {effectivePi < PHASES.length - 1 && (
                <Button size="sm" variant="outline" onClick={advancePhase} className="gap-1.5 h-7 text-xs">
                  Move to {PHASES[effectivePi + 1]} <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-border/50 z-0" />
            <div className="absolute top-3.5 left-3.5 h-0.5 bg-primary z-0 transition-all duration-700"
              style={{ width: `${(effectivePi / (PHASES.length - 1)) * 100}%` }} />
            <div className="relative z-10 flex items-start justify-between">
              {PHASES.map((p, i) => {
                const done    = i < effectivePi;
                const current = i === effectivePi;
                return (
                  <div key={p} className="flex flex-col items-center gap-2" style={{ width: `${100 / PHASES.length}%` }}>
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center bg-background transition-all",
                      done    ? "border-primary bg-primary" :
                      current ? "border-primary ring-4 ring-primary/20" : "border-border/50",
                    )}>
                      {done    && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                      {current && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <p className={cn(
                      "text-[10px] font-semibold text-center leading-tight",
                      done || current ? "text-primary" : "text-muted-foreground/40",
                    )}>{p}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border/40">
            <span className="font-semibold text-foreground">{effectivePhase}</span> — {PHASE_DESC[effectivePhase]}
          </p>
        </div>

        {/* ── Title + meta ── */}
        <div>
          <Badge variant="outline" className="text-[10px] font-semibold border border-primary/25 text-primary bg-primary/[0.06] mb-2">
            {effectivePhase}
          </Badge>
          <h1 className="font-serif text-2xl font-bold leading-tight">{title}</h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">{category}</p>
        </div>

        {/* ── Sticky section nav ── */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm -mx-4 px-4 py-2 border-b border-border/40 flex items-center gap-1">
          {[
            { id: "history",     label: "History" },
            { id: "brief",       label: "Brief" },
            { id: "ideation",    label: "Ideation" },
            ...(hasMetrics ? [{ id: "performance", label: "Performance" }] : []),
          ].map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              {s.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION: HISTORY (unified timeline)
        ══════════════════════════════════════════════ */}
        <section id="history" className="scroll-mt-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Activity Timeline</p>

          <div className="relative">
            {/* Vertical guide */}
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/40" />

            <div className="space-y-0">
              {timeline.map((entry, i) => {
                const isOpen = i === expandedEntry;
                const toggle = () => setExpandedEntry(isOpen ? null : i);

                /* ── Phase entry ── */
                if (entry.kind === "phase") {
                  return (
                    <div key={i}>
                      <button onClick={toggle}
                        className={cn(
                          "w-full flex items-start gap-4 py-3 px-2 rounded-xl transition-colors text-left",
                          isOpen
                            ? "bg-primary/[0.06]"
                            : entry.isCurrent
                            ? "bg-primary/[0.03] hover:bg-primary/[0.05]"
                            : "hover:bg-secondary/20",
                        )}>
                        <div className={cn(
                          "h-9 w-9 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 bg-background z-10",
                          entry.isDone    ? "border-primary bg-primary text-primary-foreground" :
                          entry.isCurrent ? "border-primary ring-4 ring-primary/15" : "border-border/50",
                        )}>
                          {entry.isDone    ? <CheckCircle2 className="h-4 w-4 text-primary-foreground" /> :
                           entry.isCurrent ? <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" /> :
                                             <div className="h-2.5 w-2.5 rounded-full bg-border" />}
                        </div>
                        <div className="flex-1 py-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn(
                              "text-sm font-semibold",
                              entry.isCurrent || entry.isDone ? "text-primary" : "text-muted-foreground/40",
                            )}>
                              {entry.phase}
                              {entry.isCurrent && <span className="ml-2 text-[10px] font-bold text-primary/60">Current</span>}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{timeAgo(entry.date)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{PHASE_DESC[entry.phase]}</p>
                        </div>
                        <ChevronDown className={cn(
                          "h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-3 mr-1 transition-transform",
                          isOpen && "rotate-180",
                        )} />
                      </button>

                      {/* Phase expanded */}
                      {isOpen && (
                        <div className="ml-[52px] mb-2 p-4 bg-card border border-border/50 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-150">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.isDone && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/[0.07] border border-primary/15 rounded-full px-2.5 py-0.5">
                                <CheckCircle2 className="h-3 w-3" /> Completed
                              </span>
                            )}
                            {entry.isCurrent && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/[0.07] border border-primary/15 rounded-full px-2.5 py-0.5">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Active phase
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{timeAgo(entry.date)}</span>
                          </div>
                          {entry.isCurrent && effectivePi < PHASES.length - 1 && (
                            <Button size="sm" variant="outline" onClick={advancePhase} className="gap-1.5 w-full justify-center">
                              Move to {PHASES[effectivePi + 1]} <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                /* ── Media entry ── */
                if (entry.kind === "media") {
                  const grad     = gradientFor(entry.media);
                  const km       = MEDIA_KIND_META[entry.media.kind];
                  const comments = getMediaComments(entry.media);
                  const approval = mediaStatuses[entry.media.id] ?? null;
                  const apMeta   = approval ? STATUS_META[approval] : null;

                  return (
                    <div key={i}>
                      <button onClick={toggle}
                        className={cn(
                          "w-full flex items-start gap-4 py-3 px-2 group rounded-xl transition-colors text-left",
                          isOpen ? "bg-primary/[0.06]" : "hover:bg-secondary/20",
                        )}>
                        <div className="h-9 w-9 rounded-full border border-border/60 bg-card flex items-center justify-center shrink-0 mt-1 z-10 text-sm font-bold text-muted-foreground">
                          {km.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 w-14 h-10 rounded-lg flex items-center justify-center border border-border/30 overflow-hidden"
                              style={{ background: grad }}>
                              <span className="text-xs opacity-20 font-bold select-none">{km.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0 py-0.5">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{km.label}</span>
                                <span className="text-[10px] text-muted-foreground bg-secondary px-1 py-0.5 rounded-full">v{entry.media.iteration}</span>
                                {entry.media.isFinal && (
                                  <Badge className="text-[9px] px-1.5 h-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Final</Badge>
                                )}
                                {apMeta && (
                                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", apMeta.bg, apMeta.color, apMeta.border)}>
                                    {apMeta.label}
                                  </span>
                                )}
                                {comments.length > 0 && (
                                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                    <MessageSquare className="h-2.5 w-2.5" />
                                    {comments.length}
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-sm line-clamp-1 leading-snug">{entry.media.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(entry.media.date)}</p>
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={cn(
                          "h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-3 mr-1 transition-transform",
                          isOpen && "rotate-180",
                        )} />
                      </button>

                      {/* Media expanded accordion */}
                      {isOpen && (
                        <div className="ml-[52px] mb-3 border border-border/50 rounded-xl overflow-hidden bg-card animate-in slide-in-from-top-2 duration-150">
                          {/* Preview */}
                          <div className="aspect-[16/9] relative flex items-center justify-center cursor-pointer"
                            style={{ background: grad }}
                            onClick={() => setReviewMedia(entry.media)}>
                            <span className="text-7xl opacity-10 font-bold select-none">{km.icon}</span>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                              <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <Maximize2 className="h-3 w-3" /> Review & Comment
                              </div>
                            </div>
                            {entry.media.isFinal && (
                              <div className="absolute top-3 left-3 text-[10px] bg-primary text-white rounded-full px-2.5 py-0.5 font-bold">Final</div>
                            )}
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Title row */}
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{km.label}</span>
                                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground">v{entry.media.iteration}</span>
                                <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(entry.media.date)}</span>
                              </div>
                              <p className="font-semibold text-sm">{entry.media.title}</p>
                              {entry.media.description && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{entry.media.description}</p>
                              )}
                            </div>

                            {/* Status control */}
                            <MediaStatusControl
                              mediaId={entry.media.id}
                              status={approval}
                              onChange={st => setMediaStatus(entry.media.id, st)}
                            />

                            {/* Actions row */}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="gap-1.5 flex-1"
                                onClick={() => handleOpenChat(entry.media)}>
                                <MessageSquare className="h-3.5 w-3.5" />
                                Comment{comments.length > 0 ? ` (${comments.length})` : ""}
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 flex-1"
                                onClick={() => toast({ title: "Downloading…", description: entry.media.title })}>
                                <Download className="h-3.5 w-3.5" /> Download
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5"
                                onClick={() => setReviewMedia(entry.media)}>
                                <Maximize2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            {/* Mini comment thread */}
                            <div className="border-t border-border/40 pt-3">
                              <MiniCommentThread
                                comments={comments}
                                onViewAll={() => {
                                  const latestComment = comments[0];
                                  if (latestComment) setActivePing(latestComment);
                                }}
                                onOpen={() => handleOpenChat(entry.media)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                /* ── Ping entry ── */
                const m  = KIND_META[entry.ping.kind];
                const sm = SUBTYPE_META[entry.ping.subtype];
                return (
                  <div key={i}>
                    <button onClick={toggle}
                      className={cn(
                        "w-full flex items-start gap-4 py-3 px-2 rounded-xl transition-colors text-left",
                        isOpen ? "bg-primary/[0.06]" : "hover:bg-secondary/20",
                      )}>
                      <div className={cn(
                        "h-9 w-9 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-base z-10",
                        m.bg, m.border,
                      )}>
                        {sm.emoji}
                      </div>
                      <div className="flex-1 py-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wide", m.color)}>{sm.label}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {entry.ping.author === "team" ? "Creative Team" : "You"} · {timeAgo(entry.ping.date)}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-0.5 line-clamp-1">{entry.ping.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{entry.ping.body}</p>
                      </div>
                      <ChevronDown className={cn(
                        "h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-3 mr-1 transition-transform",
                        isOpen && "rotate-180",
                      )} />
                    </button>

                    {/* Ping expanded */}
                    {isOpen && (
                      <div className="ml-[52px] mb-3 p-4 bg-card border border-border/50 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <h4 className="font-semibold text-sm leading-snug">{entry.ping.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{entry.ping.body}</p>
                        {entry.ping.fileName && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] border rounded-lg px-2 py-1.5 bg-secondary/40 font-medium">
                            📎 {entry.ping.fileName}
                          </div>
                        )}
                        <div className="pt-1">
                          <Button size="sm" variant="outline" className="gap-1.5 w-full"
                            onClick={() => { setActivePing(entry.ping); setExpandedEntry(null); }}>
                            <MessageSquare className="h-3.5 w-3.5" /> Reply in Actions
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {timeline.length === 0 && (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No activity yet for this project.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION: BRIEF
        ══════════════════════════════════════════════ */}
        <section id="brief" className="scroll-mt-12 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Brief</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-card border rounded-2xl p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Description</h3>
                {(request?.description ?? completed?.notes) ? (
                  <p className="text-sm leading-relaxed">{request?.description ?? completed?.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description added yet.</p>
                )}
              </div>
              {request?.goal && (
                <div className="bg-primary/[0.05] border border-primary/15 rounded-2xl p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Business Goal</h3>
                  <p className="text-sm leading-relaxed font-medium">{request.goal}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-card border rounded-2xl p-5 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</h3>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-sm">
                  <Download className="h-4 w-4" /> Download Assets
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-sm text-muted-foreground" disabled>
                  <Share2 className="h-4 w-4" /> Share Project
                  <Badge className="ml-auto text-[9px] px-1.5 bg-primary/10 text-primary border-primary/20">Pro</Badge>
                </Button>
              </div>
              <div className="bg-card border rounded-2xl p-5 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details</h3>
                <div className="text-sm space-y-2">
                  {[
                    ["Status",    effectivePhase],
                    ["Type",      category || "—"],
                    ...(request?.priority ? [["Priority", request.priority]] : []),
                    [request ? "Created" : "Completed", new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium capitalize">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION: IDEATION
        ══════════════════════════════════════════════ */}
        <section id="ideation" className="scroll-mt-12 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Ideation</p>

          <div className="space-y-5">
            <div className="bg-card border rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#1e1e1e] flex items-center justify-center shrink-0">
                  <FigmaIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Figma Ideation Board</p>
                  <p className="text-xs text-muted-foreground">Paste your Figma or FigJam link for this project.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input value={figmaInput} onChange={e => setFigmaInput(e.target.value)}
                      placeholder="https://figma.com/file/…" className="pl-8 text-sm" />
                  </div>
                  <Button onClick={saveFigmaUrl} disabled={!figmaInput.trim()}>Save</Button>
                </div>
                {savedFigmaUrl && (
                  <a href={savedFigmaUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" /> Open in Figma
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { e: "🎨", t: "Mood Boards",   d: "Visual direction, colour palettes, and inspiration." },
                { e: "🗺️", t: "Journey Maps",  d: "User flows, screen layouts, and experience touchpoints." },
                { e: "💡", t: "Concept Notes", d: "Annotations, direction notes, and rough ideas." },
              ].map(({ e, t, d }) => (
                <div key={t} className="bg-secondary/20 border border-border/50 rounded-xl p-4 space-y-1.5">
                  <span className="text-2xl">{e}</span>
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION: PERFORMANCE (if available)
        ══════════════════════════════════════════════ */}
        {hasMetrics && (
          <section id="performance" className="scroll-mt-12 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Performance</p>

            <div className="space-y-5">
              {score !== null && (
                <div className="bg-card border rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Performance score</span>
                    <span className={cn("font-bold text-lg", score >= 75 ? "text-primary" : "text-muted-foreground")}>{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              )}
              {metrics?.impressions && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard icon={Eye}         label="Impressions" value={fmtNum(metrics.impressions)} />
                  {metrics.clicks         && <MetricCard icon={MousePointer} label="Clicks"      value={fmtNum(metrics.clicks)} />}
                  {metrics.ctr            && <MetricCard icon={TrendingUp}   label="CTR"         value={`${metrics.ctr}%`} sub="Click-through" />}
                  {metrics.engagementRate && <MetricCard icon={ArrowUpRight} label="Engagement"  value={`${metrics.engagementRate}%`} />}
                </div>
              )}
              {metrics?.sent && !metrics.impressions && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard icon={Mail}        label="Sent"      value={fmtNum(metrics.sent)} />
                  {metrics.opens    && <MetricCard icon={Eye}        label="Opens"     value={fmtNum(metrics.opens)} />}
                  {metrics.openRate && <MetricCard icon={TrendingUp} label="Open Rate" value={`${metrics.openRate}%`} />}
                </div>
              )}
              {metrics?.platform && <p className="text-xs text-muted-foreground">Platform: {metrics.platform}</p>}
            </div>
          </section>
        )}

      </div>

      {/* ══ REVIEW OVERLAY ═════════════════════════════ */}
      {reviewMedia && (
        <ReviewOverlay
          media={reviewMedia}
          comments={getMediaComments(reviewMedia)}
          onClose={() => setReviewMedia(null)}
          onNewComment={body => handleAddComment(reviewMedia, body)}
        />
      )}

    </DashboardLayout>
  );
}
