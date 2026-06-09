import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListWorkRequests, useListCompletedWork } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArtworkThumbnail } from "@/components/ArtworkThumbnail";
import {
  ArrowLeft, CheckCircle2, Clock, Eye, MousePointer, TrendingUp,
  ArrowUpRight, Mail, BarChart2, Download, Share2, PlusCircle,
  CalendarDays, Tag, Layers, FileText, Link2, Send, ExternalLink,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface PerformanceMetrics {
  impressions?: number; clicks?: number; ctr?: number; engagementRate?: number;
  reach?: number; platform?: string; sent?: number; opens?: number;
  openRate?: number; conversions?: number; adSpend?: number; cpm?: number;
  roas?: number; note?: string;
}

type Note = { text: string; author: "client" | "team"; createdAt: string };

function getScore(m: PerformanceMetrics | null): number | null {
  if (!m) return null;
  if (m.ctr && m.ctr > 0) return Math.min(100, Math.round((m.ctr / 5) * 100));
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
  Brief:      "Defining the scope and creative direction",
  Design:     "Active creative work in progress",
  Review:     "Ready for your feedback and approval",
  Revisions:  "Applying your requested changes",
  Delivered:  "Final assets delivered and ready to use",
};

function getPhaseIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0, in_progress: 2, in_review: 3, approved: 4, delivered: 5, completed: 5,
  };
  return map[status] ?? 0;
}

const PHASE_COLORS: Record<number, { dot: string; ring: string; label: string }> = {
  0: { dot: "bg-amber-400",  ring: "ring-amber-400/30",  label: "text-amber-700" },
  1: { dot: "bg-orange-400", ring: "ring-orange-400/30", label: "text-orange-700" },
  2: { dot: "bg-blue-500",   ring: "ring-blue-500/30",   label: "text-blue-700" },
  3: { dot: "bg-violet-500", ring: "ring-violet-500/30", label: "text-violet-700" },
  4: { dot: "bg-indigo-500", ring: "ring-indigo-500/30", label: "text-indigo-700" },
  5: { dot: "bg-emerald-500",ring: "ring-emerald-500/30",label: "text-emerald-700" },
};

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-400/15 text-amber-600 border-amber-400/25",
  in_review:   "bg-violet-500/10 text-violet-600 border-violet-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  approved:    "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  delivered:   "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  completed:   "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const CATEGORY_COLOR: Record<string, string> = {
  campaign:     "bg-amber-400/15 text-amber-700 border-amber-400/25",
  social:       "bg-primary/10 text-primary border-primary/20",
  email:        "bg-blue-400/15 text-blue-700 border-blue-400/25",
  strategy:     "bg-slate-400/15 text-slate-600 border-slate-300/40",
  presentation: "bg-purple-400/15 text-purple-700 border-purple-400/25",
  motion:       "bg-emerald-400/15 text-emerald-700 border-emerald-400/25",
  web:          "bg-cyan-400/15 text-cyan-700 border-cyan-400/25",
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

export default function ProjectDetail() {
  const [, params] = useRoute("/dashboard/project/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
  const isActive  = !!request && !completed;

  const storageKey = `concepful_figma_${id}`;
  const [figmaInput, setFigmaInput] = useState(() => localStorage.getItem(storageKey) ?? "");
  const [savedFigmaUrl, setSavedFigmaUrl] = useState(() => localStorage.getItem(storageKey) ?? "");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<Note[]>(() => {
    try { return JSON.parse(localStorage.getItem(`concepful_notes_${id}`) ?? "[]"); } catch { return []; }
  });

  const saveFigmaUrl = () => {
    localStorage.setItem(storageKey, figmaInput);
    setSavedFigmaUrl(figmaInput);
    toast({ title: "Figma link saved" });
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    const newNote: Note = { text: noteInput.trim(), author: "client", createdAt: new Date().toISOString() };
    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem(`concepful_notes_${id}`, JSON.stringify(updated));
    setNoteInput("");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!request && !completed) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto text-center py-24">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">This project may have been removed or the link is incorrect.</p>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const title    = request?.title ?? completed?.title ?? "—";
  const category = (request?.type ?? completed?.category ?? "").toLowerCase();
  const status   = request?.status ?? (completed?.approved ? "approved" : "completed");
  const createdAt = request?.createdAt ?? completed?.completedAt ?? "";
  const pi        = getPhaseIndex(status);
  const phase     = PHASES[pi];
  const phaseC    = PHASE_COLORS[pi];
  const metrics   = completed?.performanceMetrics as PerformanceMetrics | null;
  const score     = getScore(metrics);
  const hasMetrics = metrics && Object.keys(metrics).some(k => k !== "note" && (metrics as any)[k]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-16">

        {/* Breadcrumb */}
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>

        {/* ── Hero / header ── */}
        {completed ? (
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm">
            <ArtworkThumbnail category={completed.category} title={completed.title} className="h-52 w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={cn("text-xs capitalize border", CATEGORY_COLOR[category] ?? "bg-secondary")} >
                  <Tag className="h-3 w-3 mr-1" />{completed.category}
                </Badge>
                {completed.approved
                  ? <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>
                  : <Badge variant="secondary" className="text-xs bg-white/10 text-white/70 border-white/10">Pending approval</Badge>
                }
              </div>
              <h1 className="font-serif text-3xl font-bold text-white leading-tight">{completed.title}</h1>
            </div>
          </div>
        ) : (
          <div className={cn("rounded-2xl border-t-4 bg-card border p-6", `border-t-${["amber","orange","blue","violet","indigo","emerald"][pi]}-${pi < 5 ? 400 : 500}`)}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Badge variant="outline" className={cn("text-xs capitalize border mb-3", STATUS_COLORS[status] ?? "bg-secondary")}>
                  {phase}
                </Badge>
                <h1 className="font-serif text-2xl font-bold leading-tight">{title}</h1>
                <p className="text-muted-foreground text-sm mt-1 capitalize">{request?.type}</p>
              </div>
              {status === "in_review" && (
                <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2.5">
                  <AlertCircle className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Your review is needed</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Phase timeline ── */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Project Phase</h2>
          <div className="relative">
            {/* progress line */}
            <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-border z-0" />
            <div
              className="absolute top-3.5 left-3.5 h-0.5 bg-primary z-0 transition-all duration-500"
              style={{ width: `${(pi / (PHASES.length - 1)) * 100}%` }}
            />

            <div className="relative z-10 flex items-start justify-between">
              {PHASES.map((p, i) => {
                const done    = i < pi;
                const current = i === pi;
                return (
                  <div key={p} className="flex flex-col items-center gap-2" style={{ width: `${100 / PHASES.length}%` }}>
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center bg-background transition-all",
                      done    ? "border-primary bg-primary"          :
                      current ? cn("border-primary ring-4", phaseC.ring) :
                      "border-border/50",
                    )}>
                      {done && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                      {current && <div className={cn("w-2.5 h-2.5 rounded-full", phaseC.dot)} />}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "text-[10px] font-semibold leading-tight",
                        done ? "text-primary" : current ? phaseC.label : "text-muted-foreground/60",
                      )}>{p}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border/40">
            <span className="font-semibold text-foreground">{phase}</span> — {PHASE_DESC[phase]}
          </p>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="brief">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="brief" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Brief</TabsTrigger>
            <TabsTrigger value="ideation" className="gap-1.5"><FigmaIcon className="h-3.5 w-3.5" /> Ideation</TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5"><Send className="h-3.5 w-3.5" /> Notes</TabsTrigger>
            {hasMetrics && (
              <TabsTrigger value="performance" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Performance</TabsTrigger>
            )}
          </TabsList>

          {/* ── BRIEF tab ── */}
          <TabsContent value="brief">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Description</h3>
                  {(request?.description ?? completed?.notes) ? (
                    <p className="text-sm leading-relaxed">{request?.description ?? completed?.notes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description added yet.</p>
                  )}
                </div>

                {request?.goal && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-3">Business Goal</h3>
                    <p className="text-sm leading-relaxed font-medium">{request.goal}</p>
                  </div>
                )}
              </div>

              {/* Actions sidebar */}
              <div className="space-y-4">
                <div className="bg-card border rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Actions</h3>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-sm">
                    <Download className="h-4 w-4" /> Download Assets
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-sm text-muted-foreground" disabled>
                    <Share2 className="h-4 w-4" /> Share Project <Badge className="ml-auto text-[9px] px-1.5 bg-primary/10 text-primary border-primary/20">Pro</Badge>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm text-muted-foreground">
                    <PlusCircle className="h-4 w-4" /> Add performance data
                  </Button>
                </div>

                <div className="bg-card border rounded-2xl p-5 space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Details</h3>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className={cn("text-[10px] capitalize border", STATUS_COLORS[status] ?? "bg-secondary")}>
                        {phase}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{category || "—"}</span>
                    </div>
                    {request?.priority && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <span className="font-medium capitalize">{request.priority}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isActive ? "Created" : "Completed"}</span>
                      <span className="font-medium">
                        {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── IDEATION tab ── */}
          <TabsContent value="ideation">
            <div className="space-y-6">
              {/* Figma workspace card */}
              <div className="bg-card border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1e1e1e] flex items-center justify-center shrink-0">
                    <FigmaIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Figma Ideation Board</h3>
                    <p className="text-xs text-muted-foreground">Paste your Figma file or FigJam link to access your whiteboard for this project.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={figmaInput}
                        onChange={e => setFigmaInput(e.target.value)}
                        placeholder="https://figma.com/file/... or figma.com/board/..."
                        className="pl-8 text-sm"
                      />
                    </div>
                    <Button onClick={saveFigmaUrl} disabled={!figmaInput.trim()} size="default">
                      Save
                    </Button>
                  </div>

                  {savedFigmaUrl && (
                    <a
                      href={savedFigmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Ideation Board in Figma
                    </a>
                  )}
                </div>
              </div>

              {/* Ideation guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "🎨", title: "Mood Boards", desc: "Share visual direction, color palettes, and inspiration references to guide the creative team." },
                  { icon: "🗺️", title: "Journey Maps", desc: "Map out user flows, screen layouts, and experience touchpoints for UI/UX projects." },
                  { icon: "💡", title: "Concept Notes", desc: "Annotate frames, leave direction notes, and sketch rough ideas directly in Figma or FigJam." },
                ].map(item => (
                  <div key={item.title} className="bg-secondary/20 border border-border/50 rounded-xl p-4 space-y-2">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-secondary/20 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span> FigJam boards work great for collaborative whiteboarding. Share your Figma workspace with <strong>hello@concepful.com</strong> so the creative team can work directly in your environment.
              </div>
            </div>
          </TabsContent>

          {/* ── NOTES tab ── */}
          <TabsContent value="notes">
            <div className="space-y-4">
              <div className="bg-card border rounded-2xl overflow-hidden">
                {notes.length === 0 ? (
                  <div className="py-12 text-center">
                    <Send className="h-8 w-8 text-muted-foreground/25 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No notes yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add context, ideas, or feedback below.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
                    {notes.map((note, i) => (
                      <div key={i} className={cn("px-5 py-4 flex gap-3", note.author === "team" && "bg-secondary/20")}>
                        <div className={cn(
                          "h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white",
                          note.author === "client" ? "bg-primary" : "bg-foreground/70",
                        )}>
                          {note.author === "client" ? "Y" : "C"}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold capitalize">{note.author === "client" ? "You" : "Creative Team"}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{note.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Note input */}
                <div className="px-5 py-4 border-t bg-secondary/10">
                  <div className="flex gap-2">
                    <Textarea
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Add context, ideas, or feedback for this project..."
                      className="min-h-[64px] text-sm resize-none"
                      onKeyDown={e => { if (e.key === "Enter" && e.metaKey) addNote(); }}
                    />
                    <Button
                      onClick={addNote}
                      disabled={!noteInput.trim()}
                      size="sm"
                      className="self-end gap-1.5 h-9"
                    >
                      <Send className="h-3.5 w-3.5" /> Send
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">⌘ + Enter to send</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground px-1">
                Notes are shared with your creative team. For urgent requests, contact us at <span className="text-foreground font-medium">hello@concepful.com</span>
              </div>
            </div>
          </TabsContent>

          {/* ── PERFORMANCE tab (only if metrics exist) ── */}
          {hasMetrics && (
            <TabsContent value="performance">
              <div className="space-y-6">
                {score !== null && (
                  <div className="bg-card border rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Performance score</span>
                      <span className={cn("font-bold text-lg",
                        score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600"
                      )}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{metrics?.note ?? "Based on engagement and conversion data."}</p>
                  </div>
                )}

                {metrics?.impressions && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard icon={Eye} label="Impressions" value={fmtNum(metrics.impressions)} />
                    {metrics.clicks && <MetricCard icon={MousePointer} label="Clicks" value={fmtNum(metrics.clicks)} />}
                    {metrics.ctr && <MetricCard icon={TrendingUp} label="CTR" value={`${metrics.ctr}%`} sub="Click-through rate" />}
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

                {metrics?.adSpend && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MetricCard icon={BarChart2} label="Ad Spend" value={`$${fmtNum(metrics.adSpend)}`} />
                    {metrics.roas && <MetricCard icon={TrendingUp} label="ROAS" value={`${metrics.roas}x`} sub="Return on ad spend" />}
                    {metrics.cpm && <MetricCard icon={Eye} label="CPM" value={`$${metrics.cpm}`} />}
                  </div>
                )}

                {metrics?.platform && (
                  <p className="text-xs text-muted-foreground">Platform(s): {metrics.platform}</p>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

      </div>
    </DashboardLayout>
  );
}
