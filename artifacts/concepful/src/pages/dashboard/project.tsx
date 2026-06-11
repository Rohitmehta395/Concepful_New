import { useState, useEffect } from "react";
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
  ArrowUpRight, Mail, BarChart2, Download, Share2, PlusCircle,
  FileText, Link2, Send, ExternalLink, AlertCircle, AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/lib/dashboard-context";
import { loadPings, SUBTYPE_META, KIND_META, Ping } from "@/lib/pings";

interface PerformanceMetrics {
  impressions?: number; clicks?: number; ctr?: number; engagementRate?: number;
  reach?: number; platform?: string; sent?: number; opens?: number;
  openRate?: number; conversions?: number; adSpend?: number; cpm?: number;
  roas?: number; note?: string;
}

function getScore(m: PerformanceMetrics | null): number | null {
  if (!m) return null;
  if (m.ctr && m.ctr > 0)         return Math.min(100, Math.round((m.ctr / 5) * 100));
  if (m.openRate && m.openRate > 0) return Math.min(100, Math.round((m.openRate / 40) * 100));
  return null;
}

function fmtNum(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

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
  const map: Record<string, number> = {
    pending: 0, in_progress: 2, in_review: 3, approved: 4, delivered: 5, completed: 5,
  };
  return map[status] ?? 0;
}

const STATUS_BADGE: Record<string, string> = {
  pending:     "text-primary border-primary/25 bg-primary/[0.06]",
  in_review:   "text-primary border-primary/25 bg-primary/[0.06]",
  in_progress: "text-primary border-primary/25 bg-primary/[0.06]",
  approved:    "text-primary border-primary/25 bg-primary/[0.06]",
  delivered:   "text-primary border-primary/25 bg-primary/[0.06]",
  completed:   "text-primary border-primary/25 bg-primary/[0.06]",
};

function FigmaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 57" fill="currentColor" aria-hidden>
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" />
      <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" />
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" />
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" />
    </svg>
  );
}

/* ── Activity timeline (project history) ────────── */
type TimelineEntry =
  | { kind: "phase"; phase: string; date: string; isCurrent: boolean; isDone: boolean }
  | { kind: "ping"; ping: Ping };

function buildTimeline(status: string, createdAt: string, projectPings: Ping[]): TimelineEntry[] {
  const pi = getPhaseIndex(status);
  const phaseEntries: TimelineEntry[] = PHASES.slice(0, pi + 1).map((phase, i) => ({
    kind: "phase",
    phase,
    date: new Date(new Date(createdAt).getTime() + i * 3 * 86400000).toISOString(),
    isCurrent: i === pi,
    isDone: i < pi,
  }));
  const pingEntries: TimelineEntry[] = projectPings.map(p => ({ kind: "ping", ping: p }));
  return [...phaseEntries, ...pingEntries].sort((a, b) => {
    const da = a.kind === "phase" ? a.date : a.ping.date;
    const db = b.kind === "phase" ? b.date : b.ping.date;
    return new Date(da).getTime() - new Date(db).getTime();
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

export default function ProjectDetail() {
  const [, params]    = useRoute("/dashboard/project/:id");
  const [, setLocation] = useLocation();
  const { toast }     = useToast();
  const { setActiveProject } = useDashboard();
  const id = params?.id ? parseInt(params.id) : null;

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
  const pi        = getPhaseIndex(status);
  const phase     = PHASES[pi];

  /* Tell context about the active project */
  useEffect(() => {
    if (id && title) setActiveProject(id, title);
    return () => setActiveProject(null, null);
  }, [id, title]);

  /* Figma link */
  const storageKey = `concepful_figma_${id}`;
  const [figmaInput,    setFigmaInput]    = useState(() => localStorage.getItem(storageKey) ?? "");
  const [savedFigmaUrl, setSavedFigmaUrl] = useState(() => localStorage.getItem(storageKey) ?? "");
  const saveFigmaUrl = () => {
    localStorage.setItem(storageKey, figmaInput);
    setSavedFigmaUrl(figmaInput);
    toast({ title: "Figma link saved" });
  };

  /* Project pings */
  const allPings     = loadPings();
  const projectPings = allPings.filter(p => p.projectId === id?.toString());

  /* Activity timeline */
  const metrics   = completed?.performanceMetrics as PerformanceMetrics | null;
  const score     = getScore(metrics);
  const hasMetrics = metrics && Object.keys(metrics).some(k => k !== "note" && (metrics as any)[k]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!request && !completed) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto text-center py-24">
          <FileText className="h-12 w-12 text-muted-foreground/25 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const timeline = buildTimeline(status, createdAt, projectPings);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-7 pb-16">

        {/* Back */}
        <button onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>

        {/* ── Phase stepper (at top) ── */}
        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Phase</h2>
            {status === "in_review" && (
              <div className="flex items-center gap-1.5 bg-primary/[0.07] border border-primary/20 rounded-full px-3 py-1">
                <AlertCircle className="h-3 w-3 text-primary" />
                <p className="text-xs font-semibold text-primary">Your review needed</p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-border/50 z-0" />
            <div className="absolute top-3.5 left-3.5 h-0.5 bg-primary z-0 transition-all duration-700"
              style={{ width: `${(pi / (PHASES.length - 1)) * 100}%` }} />
            <div className="relative z-10 flex items-start justify-between">
              {PHASES.map((p, i) => {
                const done    = i < pi;
                const current = i === pi;
                return (
                  <div key={p} className="flex flex-col items-center gap-2" style={{ width: `${100 / PHASES.length}%` }}>
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center bg-background transition-all",
                      done    ? "border-primary bg-primary" :
                      current ? "border-primary ring-4 ring-primary/20" :
                      "border-border/50",
                    )}>
                      {done && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                      {current && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <p className={cn(
                      "text-[10px] font-semibold text-center leading-tight",
                      done ? "text-primary" : current ? "text-primary" : "text-muted-foreground/50",
                    )}>{p}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border/40">
            <span className="font-semibold text-foreground">{phase}</span> — {PHASE_DESC[phase]}
          </p>
        </div>

        {/* ── Project title + meta ── */}
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge variant="outline" className={cn("text-[10px] font-semibold capitalize border mb-2", STATUS_BADGE[status] ?? "")}>
                {phase}
              </Badge>
              <h1 className="font-serif text-2xl font-bold leading-tight">{title}</h1>
              <p className="text-muted-foreground text-sm mt-1 capitalize">{category}</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="history">
          <TabsList className="mb-6">
            <TabsTrigger value="history" className="gap-1.5">
              <AlignLeft className="h-3.5 w-3.5" /> History
            </TabsTrigger>
            <TabsTrigger value="brief" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Brief
            </TabsTrigger>
            <TabsTrigger value="ideation" className="gap-1.5">
              <FigmaIcon className="h-3.5 w-3.5" /> Ideation
            </TabsTrigger>
            {hasMetrics && (
              <TabsTrigger value="performance" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Performance
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── HISTORY tab (activity timeline) ── */}
          <TabsContent value="history">
            <div className="relative">
              <div className="absolute left-[17px] top-0 bottom-0 w-px bg-border/40" />
              <div className="space-y-0">
                {timeline.map((entry, i) => {
                  if (entry.kind === "phase") {
                    return (
                      <div key={i} className={cn(
                        "flex items-start gap-4 py-3 px-2",
                        entry.isCurrent && "bg-primary/[0.03] rounded-xl",
                      )}>
                        {/* Dot */}
                        <div className={cn(
                          "h-9 w-9 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold z-10 bg-background",
                          entry.isDone ? "border-primary bg-primary text-primary-foreground" :
                          entry.isCurrent ? "border-primary ring-4 ring-primary/15" :
                          "border-border/50 text-muted-foreground/40",
                        )}>
                          {entry.isDone
                            ? <CheckCircle2 className="h-4 w-4" />
                            : entry.isCurrent
                            ? <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            : <div className="h-2.5 w-2.5 rounded-full bg-border" />
                          }
                        </div>
                        {/* Content */}
                        <div className="flex-1 py-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn("text-sm font-semibold", entry.isCurrent ? "text-primary" : entry.isDone ? "text-foreground" : "text-muted-foreground/50")}>
                              {entry.phase}
                              {entry.isCurrent && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-primary/70">Current</span>}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{timeAgo(entry.date)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{PHASE_DESC[entry.phase]}</p>
                        </div>
                      </div>
                    );
                  } else {
                    const m  = KIND_META[entry.ping.kind];
                    const sm = SUBTYPE_META[entry.ping.subtype];
                    return (
                      <div key={i} className="flex items-start gap-4 py-3 px-2 hover:bg-secondary/20 rounded-xl transition-colors">
                        <div className={cn("h-9 w-9 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-base z-10", m.bg, m.border)}>
                          {sm.emoji}
                        </div>
                        <div className="flex-1 py-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wide", m.color)}>{sm.label}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {entry.ping.author === "team" ? "Creative Team" : "You"} · {timeAgo(entry.ping.date)}
                            </span>
                          </div>
                          <p className="text-sm font-medium mt-0.5">{entry.ping.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{entry.ping.body}</p>
                          {entry.ping.fileName && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] border rounded-lg px-2 py-1 mt-1.5 bg-secondary/40 font-medium">
                              📎 {entry.ping.fileName}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                })}
                {timeline.length === 0 && (
                  <div className="text-center py-10 text-sm text-muted-foreground">No history yet for this project.</div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── BRIEF tab ── */}
          <TabsContent value="brief">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <div className="bg-primary/[0.05] border border-primary/20 rounded-2xl p-6">
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
                <div className="bg-card border rounded-2xl p-5 space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details</h3>
                  <div className="text-sm space-y-2">
                    {[
                      ["Status", phase],
                      ["Type", category || "—"],
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

          {/* ── IDEATION tab ── */}
          <TabsContent value="ideation">
            <div className="space-y-5">
              <div className="bg-card border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1e1e1e] flex items-center justify-center shrink-0">
                    <FigmaIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Figma Ideation Board</p>
                    <p className="text-xs text-muted-foreground">Paste your Figma file or FigJam link for this project.</p>
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
                      <ExternalLink className="h-4 w-4" /> Open Ideation Board in Figma
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { e: "🎨", t: "Mood Boards", d: "Visual direction, color palettes, and inspiration references." },
                  { e: "🗺️", t: "Journey Maps", d: "User flows, screen layouts, and experience touchpoints." },
                  { e: "💡", t: "Concept Notes", d: "Annotations, direction notes, and rough ideas in Figma." },
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

          {/* ── PERFORMANCE tab ── */}
          {hasMetrics && (
            <TabsContent value="performance">
              <div className="space-y-5">
                {score !== null && (
                  <div className="bg-card border rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Performance score</span>
                      <span className={cn("font-bold text-lg",
                        score >= 75 ? "text-primary" : score >= 50 ? "text-[hsl(232,28%,40%)]" : "text-muted-foreground"
                      )}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                )}
                {metrics?.impressions && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard icon={Eye} label="Impressions" value={fmtNum(metrics.impressions)} />
                    {metrics.clicks && <MetricCard icon={MousePointer} label="Clicks" value={fmtNum(metrics.clicks)} />}
                    {metrics.ctr && <MetricCard icon={TrendingUp} label="CTR" value={`${metrics.ctr}%`} sub="Click-through" />}
                    {metrics.engagementRate && <MetricCard icon={ArrowUpRight} label="Engagement" value={`${metrics.engagementRate}%`} />}
                  </div>
                )}
                {metrics?.sent && !metrics.impressions && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard icon={Mail} label="Sent" value={fmtNum(metrics.sent)} />
                    {metrics.opens && <MetricCard icon={Eye} label="Opens" value={fmtNum(metrics.opens)} />}
                    {metrics.openRate && <MetricCard icon={TrendingUp} label="Open Rate" value={`${metrics.openRate}%`} />}
                    {metrics.conversions && <MetricCard icon={ArrowUpRight} label="Conversions" value={String(metrics.conversions)} />}
                  </div>
                )}
                {metrics?.platform && <p className="text-xs text-muted-foreground">Platform(s): {metrics.platform}</p>}
              </div>
            </TabsContent>
          )}
        </Tabs>

      </div>
    </DashboardLayout>
  );
}

