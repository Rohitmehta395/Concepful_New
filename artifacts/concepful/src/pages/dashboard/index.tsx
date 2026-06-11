import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  PlusCircle, LayoutGrid, AlignLeft, CalendarDays,
  Clock, CheckCircle2, FileText, Pencil, Eye,
  ChevronRight, AlertCircle, MessageSquare, CheckSquare,
  Paperclip,
} from "lucide-react";
import { useListWorkRequests, useListCompletedWork } from "@workspace/api-client-react";
import { ArtworkThumbnail } from "@/components/ArtworkThumbnail";
import { cn } from "@/lib/utils";
import { loadPings, KIND_META, SUBTYPE_META } from "@/lib/pings";

const PHASES = ["Discovery", "Brief", "Design", "Review", "Revisions", "Delivered"] as const;

function getPhaseIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0, in_progress: 2, in_review: 3,
    approved: 4, delivered: 5, completed: 5,
  };
  return map[status] ?? 0;
}

const PHASE_TOP: Record<number, string> = {
  0: "border-t-amber-400",  1: "border-t-orange-400",
  2: "border-t-blue-500",   3: "border-t-violet-500",
  4: "border-t-indigo-500", 5: "border-t-emerald-500",
};

const PHASE_BADGE: Record<number, string> = {
  0: "bg-amber-50 text-amber-700 border-amber-200",
  1: "bg-orange-50 text-orange-700 border-orange-200",
  2: "bg-blue-50 text-blue-700 border-blue-200",
  3: "bg-violet-50 text-violet-700 border-violet-200",
  4: "bg-indigo-50 text-indigo-700 border-indigo-200",
  5: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PHASE_DOT: Record<number, string> = {
  0: "bg-amber-400", 1: "bg-orange-400", 2: "bg-blue-500",
  3: "bg-violet-500", 4: "bg-indigo-500", 5: "bg-emerald-500",
};

const TYPE_ICON: Record<string, string> = {
  campaign: "🎯", social: "📱", strategy: "🧭",
  presentation: "📊", brand: "✦", email: "📧",
  web: "🌐", motion: "🎬", video: "🎬",
  design: "🎨", copywriting: "✍️",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type ViewKey = "bento" | "timeline" | "calendar";
type FilterKey = "all" | "active" | "review" | "delivered";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "review",    label: "Needs Review" },
  { key: "delivered", label: "Delivered" },
];

/* ─── Calendar helpers ───────────────────────────────────────── */
function calendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  return { first, total };
}

export default function DashboardOverview() {
  const { data: requests, isLoading } = useListWorkRequests(
    { query: { queryKey: ["requests", 1] } },
    { request: { query: { companyId: 1 } } },
  );
  const { data: completedWork } = useListCompletedWork(
    { query: { queryKey: ["completed-work", 1] } },
    { request: { query: { companyId: 1 } } },
  );

  const [view,   setView]   = useState<ViewKey>("bento");
  const [filter, setFilter] = useState<FilterKey>("all");

  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const allRequests    = requests ?? [];
  const activeRequests = allRequests.filter(r => !["completed","delivered"].includes(r.status));
  const reviewRequests = allRequests.filter(r => r.status === "in_review");
  const deliveredWork  = completedWork ?? [];
  const pendingReview  = reviewRequests.length;

  const filteredRequests = (() => {
    switch (filter) {
      case "active":    return allRequests.filter(r => !["completed","delivered"].includes(r.status));
      case "review":    return allRequests.filter(r => r.status === "in_review");
      case "delivered": return allRequests.filter(r => ["delivered","completed"].includes(r.status));
      default:          return allRequests;
    }
  })();

  const pings = loadPings();
  const recentPings = pings.slice(0, 4);

  /* calendar event map */
  const calEvents: Record<number, { label: string; color: string }[]> = {};
  allRequests.forEach(r => {
    const d = new Date(r.createdAt);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      calEvents[day] ??= [];
      calEvents[day].push({ label: r.title, color: PHASE_DOT[getPhaseIndex(r.status)] });
    }
  });

  const { first, total } = calendarDays(calYear, calMonth);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-7">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground text-sm">Phases, assets, and ideation across your creative work.</p>
          </div>
          <Link href="/dashboard/requests">
            <Button className="gap-2 shrink-0">
              <PlusCircle className="h-4 w-4" /> New Request
            </Button>
          </Link>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">{activeRequests.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active</p>
            </div>
          </div>

          <div className={cn(
            "bg-card border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors",
            pendingReview > 0 && "border-violet-300 bg-violet-50/60 dark:bg-violet-950/20",
          )}>
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
              pendingReview > 0 ? "bg-violet-100" : "bg-secondary",
            )}>
              {pendingReview > 0
                ? <AlertCircle className="h-4 w-4 text-violet-600" />
                : <Eye className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">{pendingReview}</p>
              <p className={cn("text-xs mt-0.5", pendingReview > 0 ? "text-violet-600 font-semibold" : "text-muted-foreground")}>
                Needs Review
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">{deliveredWork.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Delivered</p>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap",
                  filter === key
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {key === "review" && pendingReview > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-violet-500 text-white text-[10px] font-bold">
                    {pendingReview}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
            {([
              ["bento",    LayoutGrid,    "Bento"],
              ["timeline", AlignLeft,     "Timeline"],
              ["calendar", CalendarDays,  "Calendar"],
            ] as const).map(([v, Icon, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  view === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading state ── */}
        {isLoading && (
          <div className={cn(view === "bento" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2")}>
            {[1,2,3,4].map(i => (
              <Skeleton key={i} className={view === "bento" ? "h-56 rounded-2xl" : "h-14 rounded-xl"} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-20 border border-dashed rounded-2xl bg-secondary/10">
            <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground mb-1">No projects here yet</p>
            <p className="text-xs text-muted-foreground mb-5">Submit a request to start your first creative project.</p>
            <Link href="/dashboard/requests">
              <Button variant="outline" size="sm">Submit a request</Button>
            </Link>
          </div>
        )}

        {/* ════════════════════════════════
            BENTO VIEW
        ════════════════════════════════ */}
        {!isLoading && filteredRequests.length > 0 && view === "bento" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map(req => {
              const pi = getPhaseIndex(req.status);
              const phase = PHASES[pi];
              return (
                <Link key={req.id} href={`/dashboard/project/${req.id}`}>
                  <div className={cn(
                    "group relative bg-card border rounded-2xl overflow-hidden",
                    "hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer",
                    "border-t-4 flex flex-col",
                    PHASE_TOP[pi],
                  )}>
                    <div className="p-5 space-y-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0 shadow-inner">
                          {TYPE_ICON[req.type] ?? "✦"}
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-semibold capitalize border shrink-0 px-2", PHASE_BADGE[pi])}>
                          {phase}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {req.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{req.type}</p>
                      </div>

                      {/* Phase progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-0.5">
                          {PHASES.map((_, i) => (
                            <div key={i} className={cn(
                              "flex-1 h-1.5 rounded-full transition-all",
                              i < pi  ? "bg-primary" :
                              i === pi ? "bg-primary/40" :
                              "bg-border/60",
                            )} />
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Phase {pi + 1} of {PHASES.length} — {phase}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-all" />
                      </div>
                    </div>

                    {req.status === "in_review" && (
                      <div className="bg-violet-50 border-t border-violet-100 px-5 py-2.5 flex items-center justify-between">
                        <p className="text-xs font-semibold text-violet-700">Your review needed</p>
                        <ChevronRight className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════
            TIMELINE VIEW
        ════════════════════════════════ */}
        {!isLoading && filteredRequests.length > 0 && view === "timeline" && (
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border/60" />

            <div className="space-y-1">
              {filteredRequests.map((req, idx) => {
                const pi = getPhaseIndex(req.status);
                const phase = PHASES[pi];
                const date = new Date(req.createdAt);
                const prevDate = idx > 0 ? new Date(filteredRequests[idx - 1].createdAt) : null;
                const showDate = !prevDate ||
                  prevDate.toDateString() !== date.toDateString();

                return (
                  <div key={req.id}>
                    {/* Date separator */}
                    {showDate && (
                      <div className="flex items-center gap-3 pl-10 py-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    )}

                    <Link href={`/dashboard/project/${req.id}`}>
                      <div className="group flex items-start gap-4 py-2 hover:bg-secondary/30 rounded-xl px-2 transition-colors cursor-pointer">
                        {/* Timeline dot */}
                        <div className={cn(
                          "h-9 w-9 rounded-full border-2 border-background ring-2 flex items-center justify-center shrink-0 mt-0.5 text-sm",
                          "ring-border/40 bg-card z-10",
                        )}>
                          {TYPE_ICON[req.type] ?? "✦"}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {req.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground capitalize">{req.type}</span>
                              <span className="text-muted-foreground/30">·</span>
                              <span className="text-xs text-muted-foreground">
                                {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className={cn("text-[10px] capitalize border font-medium", PHASE_BADGE[pi])}>
                              {phase}
                            </Badge>
                            {/* Mini phase bar */}
                            <div className="hidden sm:flex items-center gap-0.5 w-16">
                              {PHASES.map((_, i) => (
                                <div key={i} className={cn(
                                  "flex-1 h-1 rounded-full",
                                  i < pi ? "bg-primary" : i === pi ? "bg-primary/30" : "bg-border/50",
                                )} />
                              ))}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}

              {/* Recent pings on timeline */}
              {filter === "all" && recentPings.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 pl-10 py-2 mt-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</p>
                  </div>
                  {recentPings.map(ping => {
                    const m  = KIND_META[ping.kind];
                    const sm = SUBTYPE_META[ping.subtype];
                    return (
                      <div key={ping.id} className="flex items-start gap-4 py-2 px-2">
                        <div className={cn(
                          "h-9 w-9 rounded-full border-2 border-background ring-2 flex items-center justify-center shrink-0 mt-0.5 text-sm",
                          "ring-border/40 z-10", m.bg,
                        )}>
                          {sm.emoji}
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <p className="text-sm font-medium truncate">{ping.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("text-[10px] font-semibold uppercase tracking-wide", m.color)}>{sm.label}</span>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-xs text-muted-foreground">{ping.author === "team" ? "Creative Team" : "You"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            CALENDAR VIEW
        ════════════════════════════════ */}
        {!isLoading && view === "calendar" && (
          <div className="bg-card border rounded-2xl overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-serif text-lg font-bold">
                {MONTH_NAMES[calMonth]} {calYear}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                  else setCalMonth(m => m - 1);
                }}>‹</Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => {
                  setCalYear(today.getFullYear()); setCalMonth(today.getMonth());
                }}>Today</Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                  else setCalMonth(m => m + 1);
                }}>›</Button>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells before first day */}
              {Array.from({ length: first }).map((_, i) => (
                <div key={`e${i}`} className="min-h-[80px] border-r border-b border-border/40 bg-secondary/10 last:border-r-0" />
              ))}

              {/* Day cells */}
              {Array.from({ length: total }).map((_, i) => {
                const day = i + 1;
                const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
                const events  = calEvents[day] ?? [];

                return (
                  <div key={day} className={cn(
                    "min-h-[80px] border-r border-b border-border/40 p-1.5 last:border-r-0",
                    isToday && "bg-primary/5",
                    (first + i + 1) % 7 === 0 && "border-r-0",
                  )}>
                    <span className={cn(
                      "text-xs font-semibold inline-flex h-5 w-5 items-center justify-center rounded-full",
                      isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {events.slice(0, 2).map((ev, ei) => (
                        <div key={ei} className={cn(
                          "text-[9px] leading-tight truncate px-1.5 py-0.5 rounded font-medium",
                          "bg-primary/10 text-primary",
                        )}>
                          {ev.label}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <p className="text-[9px] text-muted-foreground pl-1">+{events.length - 2} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Recent Deliverables strip (bento + all filter only) ── */}
        {!isLoading && deliveredWork.length > 0 && filter === "all" && view === "bento" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-serif font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recent Deliverables
              </h2>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  All <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border/50">
                {deliveredWork.slice(0, 4).map(item => (
                  <Link key={item.id} href={`/dashboard/project/${item.id}`}>
                    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border/40">
                        <ArtworkThumbnail category={item.category} title={item.title} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                      </div>
                      {item.approved && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                      <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                        {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Activity summary (bento + all filter only) ── */}
        {!isLoading && filter === "all" && view === "bento" && recentPings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-serif font-bold">Recent Pings</h2>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden divide-y divide-border/50">
              {recentPings.map(ping => {
                const m  = KIND_META[ping.kind];
                const sm = SUBTYPE_META[ping.subtype];
                const KIcon = ping.kind === "message" ? MessageSquare : ping.kind === "todo" ? CheckSquare : Paperclip;
                return (
                  <div key={ping.id} className={cn("flex items-start gap-3 px-5 py-3.5", m.bg.replace("dark:", ""))}>
                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-sm border", m.bg, m.border)}>
                      {sm.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ping.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{ping.body}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wide", m.color)}>{sm.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
