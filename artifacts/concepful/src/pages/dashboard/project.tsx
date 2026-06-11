import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListWorkRequests, useListCompletedWork } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, CheckCircle2, Eye, MousePointer, TrendingUp,
  ArrowUpRight, Mail, Download, Share2,
  FileText, Link2, ExternalLink, AlertCircle,
  ChevronRight, Maximize2, MessageSquare, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/lib/dashboard-context";
import { loadPings, savePings, addPing, SUBTYPE_META, KIND_META, Ping } from "@/lib/pings";
import { MediaItem, MEDIA_KIND_META, getProjectMedia, gradientFor } from "@/lib/media";

/* ── Types ─────────────────────────────────────────── */
interface PerformanceMetrics {
  impressions?: number; clicks?: number; ctr?: number; engagementRate?: number;
  reach?: number; platform?: string; sent?: number; opens?: number;
  openRate?: number; conversions?: number; roas?: number; note?: string;
}

type TimelineEntry =
  | { kind: "phase"; phase: string; date: string; isCurrent: boolean; isDone: boolean }
  | { kind: "ping";  ping: Ping }
  | { kind: "media"; media: MediaItem };

/* ── Constants ──────────────────────────────────────── */
const PHASES = ["Discovery", "Brief", "Design", "Review", "Revisions", "Delivered"] as const;

const PHASE_DESC: Record<string, string> = {
  Discovery:  "Understanding your goals and requirements",
  Brief:      "Defining scope and creative direction",
  Design:     "Active creative work in progress",
  Review:     "Ready for your feedback and approval",
  Revisions:  "Applying your requested changes",
  Delivered:  "Final assets delivered",
};

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

/* ── Timeline builder ───────────────────────────────── */
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

/* ── FigmaIcon ──────────────────────────────────────── */
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

/* ── MetricCard ─────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════
   PROJECT DETAIL PAGE
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
  const [figmaInput, setFigmaInput]       = useState(() => localStorage.getItem(figmaKey) ?? "");
  const [savedFigmaUrl, setSavedFigmaUrl] = useState(() => localStorage.getItem(figmaKey) ?? "");
  const saveFigmaUrl = () => {
    localStorage.setItem(figmaKey, figmaInput);
    setSavedFigmaUrl(figmaInput);
    toast({ title: "Figma link saved" });
  };

  /* ── UI state ── */
  const [fullscreen,     setFullscreen]     = useState<MediaItem | null>(null);
  const [selectedIndex,  setSelectedIndex]  = useState<number | null>(null);

  /* ── Pings + media ── */
  const allPings     = loadPings();
  const projectPings = allPings.filter(p => p.projectId === id?.toString());
  const mediaItems   = getProjectMedia(id?.toString() ?? "");

  /* ── Comment on media → creates ping AND opens it in sidebar ── */
  const handleMediaComment = (media: MediaItem) => {
    const current = loadPings();
    const updated = addPing(current, {
      kind: "message", subtype: "chat", author: "client",
      title: `Re: ${media.title}`,
      body: `Comment on ${media.title} (v${media.iteration})…`,
      projectId: id?.toString(),
    });
    savePings(updated);
    setActivePing(updated[0]);
    toast({ title: "Chat opened", description: "Reply in the Ping sidebar." });
  };

  /* ── Active project context ── */
  useEffect(() => {
    if (id && title) setActiveProject(id, title);
    return () => setActiveProject(null, null);
  }, [id, title]);

  /* ── Timeline ── */
  const timeline      = buildTimeline(status, createdAt, projectPings, mediaItems, localPhase);
  const selectedEntry = selectedIndex !== null ? (timeline[selectedIndex] ?? null) : null;

  /* ── Performance ── */
  const metrics    = completed?.performanceMetrics as PerformanceMetrics | null;
  const score      = getScore(metrics);
  const hasMetrics = metrics && Object.keys(metrics).some(k => k !== "note" && (metrics as any)[k]);

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
      <div className="max-w-5xl mx-auto space-y-7 pb-20">

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

        {/* ── Tabs ── */}
        <Tabs defaultValue="history">
          <TabsList className="mb-6">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="brief">Brief</TabsTrigger>
            <TabsTrigger value="ideation">Ideation</TabsTrigger>
            {hasMetrics && <TabsTrigger value="performance">Performance</TabsTrigger>}
          </TabsList>

          {/* ══ HISTORY TAB ══════════════════════════════ */}
          <TabsContent value="history">
            <div className={cn(
              "transition-all duration-200",
              selectedEntry ? "grid grid-cols-[5fr_7fr] gap-5 items-start" : "",
            )}>

              {/* ── Left: Timeline list ── */}
              <div className="relative">
                <div className="absolute left-[17px] top-0 bottom-0 w-px bg-border/40" />
                <div className="space-y-0">

                  {timeline.map((entry, i) => {
                    const isSel = i === selectedIndex;

                    /* ── Phase milestone ── */
                    if (entry.kind === "phase") {
                      return (
                        <div key={i}
                          onClick={() => setSelectedIndex(isSel ? null : i)}
                          className={cn(
                            "flex items-start gap-4 py-3 px-2 rounded-xl cursor-pointer transition-colors",
                            isSel
                              ? "bg-primary/[0.06] ring-1 ring-primary/15"
                              : entry.isCurrent
                              ? "bg-primary/[0.03] hover:bg-primary/[0.05]"
                              : "hover:bg-secondary/20",
                          )}>
                          <div className={cn(
                            "h-9 w-9 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 bg-background z-10",
                            entry.isDone    ? "border-primary bg-primary text-primary-foreground" :
                            entry.isCurrent ? "border-primary ring-4 ring-primary/15" : "border-border/50",
                          )}>
                            {entry.isDone
                              ? <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                              : entry.isCurrent
                              ? <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                              : <div className="h-2.5 w-2.5 rounded-full bg-border" />}
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
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{PHASE_DESC[entry.phase]}</p>
                          </div>
                        </div>
                      );
                    }

                    /* ── Media item ── */
                    if (entry.kind === "media") {
                      const grad = gradientFor(entry.media);
                      const km   = MEDIA_KIND_META[entry.media.kind];
                      return (
                        <div key={i}
                          onClick={() => setSelectedIndex(isSel ? null : i)}
                          className={cn(
                            "flex items-start gap-4 py-3 px-2 group rounded-xl cursor-pointer transition-colors",
                            isSel ? "bg-primary/[0.06] ring-1 ring-primary/15" : "hover:bg-secondary/20",
                          )}>
                          <div className="h-9 w-9 rounded-full border border-border/60 bg-card flex items-center justify-center shrink-0 mt-1 z-10 text-sm font-bold text-muted-foreground">
                            {km.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              {/* Mini thumbnail */}
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
                                </div>
                                <p className="font-semibold text-sm line-clamp-1 leading-snug">{entry.media.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(entry.media.date)}</p>
                              </div>
                              {/* Hover actions — only when no panel open */}
                              {!selectedEntry && (
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={e => { e.stopPropagation(); handleMediaComment(entry.media); }}
                                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                    title="Comment">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); toast({ title: "Downloading…", description: entry.media.title }); }}
                                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                    title="Download">
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); setFullscreen(entry.media); }}
                                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                    title="Fullscreen">
                                    <Maximize2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    /* ── Ping entry ── */
                    const m  = KIND_META[entry.ping.kind];
                    const sm = SUBTYPE_META[entry.ping.subtype];
                    return (
                      <div key={i}
                        onClick={() => setSelectedIndex(isSel ? null : i)}
                        className={cn(
                          "flex items-start gap-4 py-3 px-2 rounded-xl cursor-pointer transition-colors",
                          isSel ? "bg-primary/[0.06] ring-1 ring-primary/15" : "hover:bg-secondary/20",
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
                      </div>
                    );
                  })}

                  {timeline.length === 0 && (
                    <div className="text-center py-12 text-sm text-muted-foreground">No activity yet for this project.</div>
                  )}
                </div>
              </div>

              {/* ── Right: Detail panel ── */}
              {selectedEntry && (() => {

                /* Phase detail */
                if (selectedEntry.kind === "phase") return (
                  <div className="sticky top-4 bg-card border rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-right-6 duration-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1.5">Project Phase</p>
                          <h3 className="text-xl font-bold">{selectedEntry.phase}</h3>
                        </div>
                        <button onClick={() => setSelectedIndex(null)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors mt-0.5">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{PHASE_DESC[selectedEntry.phase]}</p>
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        {selectedEntry.isDone && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/[0.07] border border-primary/15 rounded-full px-3 py-1">
                            <CheckCircle2 className="h-3 w-3" /> Complete
                          </div>
                        )}
                        {selectedEntry.isCurrent && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/[0.07] border border-primary/15 rounded-full px-3 py-1">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Current phase
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(selectedEntry.date)}</span>
                      </div>
                      {selectedEntry.isCurrent && effectivePi < PHASES.length - 1 && (
                        <Button size="sm" variant="outline" onClick={advancePhase}
                          className="mt-4 gap-1.5 w-full justify-center">
                          Move to {PHASES[effectivePi + 1]} <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );

                /* Media detail */
                if (selectedEntry.kind === "media") {
                  const grad = gradientFor(selectedEntry.media);
                  const km   = MEDIA_KIND_META[selectedEntry.media.kind];
                  return (
                    <div className="sticky top-4 bg-card border rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-right-6 duration-200">
                      {/* Preview */}
                      <div className="aspect-[16/9] relative flex items-center justify-center"
                        style={{ background: grad }}>
                        <span className="text-8xl opacity-10 font-bold select-none">{km.icon}</span>
                        <button onClick={() => setSelectedIndex(null)}
                          className="absolute top-3 right-3 h-7 w-7 rounded-lg flex items-center justify-center bg-black/20 text-white hover:bg-black/35 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                        {selectedEntry.media.isFinal && (
                          <div className="absolute top-3 left-3 text-[10px] bg-primary text-white rounded-full px-2.5 py-0.5 font-bold">Final</div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{km.label}</span>
                          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">v{selectedEntry.media.iteration}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(selectedEntry.media.date)}</span>
                        </div>
                        <h3 className="font-bold text-base leading-snug mb-2">{selectedEntry.media.title}</h3>
                        {selectedEntry.media.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{selectedEntry.media.description}</p>
                        )}
                        <div className="flex gap-2 mt-4 flex-wrap">
                          <Button size="sm" variant="outline" className="gap-1.5 flex-1 min-w-0"
                            onClick={() => handleMediaComment(selectedEntry.media)}>
                            <MessageSquare className="h-3.5 w-3.5" /> Comment
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 flex-1 min-w-0"
                            onClick={() => toast({ title: "Downloading…", description: selectedEntry.media.title })}>
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 flex-1 min-w-0"
                            onClick={() => { setFullscreen(selectedEntry.media); setSelectedIndex(null); }}>
                            <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                /* Ping detail */
                const m  = KIND_META[selectedEntry.ping.kind];
                const sm = SUBTYPE_META[selectedEntry.ping.subtype];
                return (
                  <div className="sticky top-4 bg-card border rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-right-6 duration-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0", m.bg)}>
                            {sm.emoji}
                          </div>
                          <div>
                            <p className={cn("text-[10px] font-bold uppercase tracking-wide", m.color)}>{sm.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedEntry.ping.author === "team" ? "Creative Team" : "You"} · {timeAgo(selectedEntry.ping.date)}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedIndex(null)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-base mb-2 leading-snug">{selectedEntry.ping.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedEntry.ping.body}</p>
                      {selectedEntry.ping.fileName && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] border rounded-lg px-2 py-1.5 mt-3 bg-secondary/40 font-medium">
                          📎 {selectedEntry.ping.fileName}
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="mt-5 w-full gap-1.5"
                        onClick={() => { setActivePing(selectedEntry.ping); setSelectedIndex(null); }}>
                        <MessageSquare className="h-3.5 w-3.5" /> Reply in Pings
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          {/* ══ BRIEF TAB ════════════════════════════════ */}
          <TabsContent value="brief">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Description</h3>
                  {(request?.description ?? completed?.notes) ? (
                    <p className="text-sm leading-relaxed">{request?.description ?? completed?.notes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description yet.</p>
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
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</h3>
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
          </TabsContent>

          {/* ══ IDEATION TAB ═════════════════════════════ */}
          <TabsContent value="ideation">
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
          </TabsContent>

          {/* ══ PERFORMANCE TAB ══════════════════════════ */}
          {hasMetrics && (
            <TabsContent value="performance">
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
                    <MetricCard icon={Eye} label="Impressions" value={fmtNum(metrics.impressions)} />
                    {metrics.clicks         && <MetricCard icon={MousePointer} label="Clicks"      value={fmtNum(metrics.clicks)} />}
                    {metrics.ctr            && <MetricCard icon={TrendingUp}   label="CTR"          value={`${metrics.ctr}%`} sub="Click-through" />}
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
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* ══ FULLSCREEN OVERLAY ════════════════════════════ */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/88 z-50 flex items-center justify-center p-6"
          onClick={() => setFullscreen(null)}>
          <div className="max-w-3xl w-full space-y-5" onClick={e => e.stopPropagation()}>
            <div className="aspect-video rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden"
              style={{ background: gradientFor(fullscreen) }}>
              <span className="text-8xl opacity-15 font-bold select-none">
                {MEDIA_KIND_META[fullscreen.kind].icon}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 text-white">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-white/50 uppercase tracking-widest font-bold">
                    {MEDIA_KIND_META[fullscreen.kind].label}
                  </span>
                  <span className="text-xs text-white/40">v{fullscreen.iteration}</span>
                  {fullscreen.isFinal && (
                    <span className="text-[10px] bg-primary text-white rounded-full px-2 py-0.5 font-bold">Final</span>
                  )}
                </div>
                <p className="text-lg font-bold leading-tight">{fullscreen.title}</p>
                {fullscreen.description && (
                  <p className="text-sm text-white/60 mt-1 leading-relaxed">{fullscreen.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-1.5"
                  onClick={() => { handleMediaComment(fullscreen); setFullscreen(null); }}>
                  <MessageSquare className="h-3.5 w-3.5" /> Comment
                </Button>
                <Button size="sm" variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-1.5"
                  onClick={() => toast({ title: "Downloading…", description: fullscreen.title })}>
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <button onClick={() => setFullscreen(null)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
