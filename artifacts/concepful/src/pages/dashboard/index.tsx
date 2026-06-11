import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  PlusCircle, LayoutGrid, AlignLeft, CalendarDays,
  Clock, CheckCircle2, FileText, Pencil, Eye,
  ChevronRight, AlertCircle, Search,
} from "lucide-react";
import { useListWorkRequests, useListCompletedWork } from "@workspace/api-client-react";
import { ArtworkThumbnail } from "@/components/ArtworkThumbnail";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/lib/dashboard-context";
import { getProjectMedia, gradientFor, MEDIA_KIND_META } from "@/lib/media";

const PHASES = ["Discovery", "Brief", "Design", "Review", "Revisions", "Delivered"] as const;

function getPhaseIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0, in_progress: 2, in_review: 3,
    approved: 4, delivered: 5, completed: 5,
  };
  return map[status] ?? 0;
}

const TYPE_ICON: Record<string, string> = {
  campaign: "🎯", social: "📱", strategy: "🧭", presentation: "📊",
  brand: "✦", email: "📧", web: "🌐", motion: "🎬", video: "🎬",
  design: "🎨", copywriting: "✍️",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Plan Gauge SVG ──────────────────────────────── */
function PlanGauge({ used, total }: { used: number; total: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(used / total, 1);
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className="shrink-0">
      <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(232 28% 11% / 0.08)" strokeWidth="6" />
      <circle
        cx="45" cy="45" r={r} fill="none"
        stroke="hsl(349 90% 54%)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${pct * circ} ${circ}`}
        transform="rotate(-90 45 45)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="45" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="hsl(232 28% 11%)">
        {used}h
      </text>
      <text x="45" y="55" textAnchor="middle" fontSize="8" fill="hsl(220 14% 55%)">
        of {total}h
      </text>
    </svg>
  );
}

/* ── Compact project list (right col when ping open) */
function CompactProjectList({ requests, completedWork }: { requests: any[]; completedWork: any[] }) {
  return (
    <div className="py-3 space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 pb-1">Projects</p>
      {requests.map(req => {
        const pi = getPhaseIndex(req.status);
        return (
          <Link key={req.id} href={`/dashboard/project/${req.id}`}>
            <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-secondary/60 transition-colors cursor-pointer group rounded-lg mx-1">
              <span className="text-sm shrink-0">{TYPE_ICON[req.type] ?? "✦"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate group-hover:text-primary transition-colors leading-snug">
                  {req.title}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {PHASES.map((_, i) => (
                    <div key={i} className={cn(
                      "flex-1 h-0.5 rounded-full",
                      i < pi ? "bg-primary" : i === pi ? "bg-primary/30" : "bg-border/50",
                    )} />
                  ))}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
      {completedWork.slice(0, 3).map(item => (
        <Link key={item.id} href={`/dashboard/project/${item.id}`}>
          <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-secondary/60 transition-colors cursor-pointer group rounded-lg mx-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

type ViewKey   = "bento" | "timeline" | "calendar";
type FilterKey = "all" | "active" | "review" | "delivered";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "review",    label: "Needs Review" },
  { key: "delivered", label: "Delivered" },
];

export default function DashboardOverview() {
  const { activePing } = useDashboard();

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
  const [search, setSearch] = useState("");

  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const allRequests    = requests ?? [];
  const activeRequests = allRequests.filter(r => !["completed","delivered"].includes(r.status));
  const reviewRequests = allRequests.filter(r => r.status === "in_review");
  const deliveredWork  = completedWork ?? [];
  const pendingReview  = reviewRequests.length;

  const filteredRequests = (() => {
    let list: typeof allRequests;
    switch (filter) {
      case "active":    list = allRequests.filter(r => !["completed","delivered"].includes(r.status)); break;
      case "review":    list = allRequests.filter(r => r.status === "in_review"); break;
      case "delivered": list = allRequests.filter(r => ["delivered","completed"].includes(r.status)); break;
      default:          list = allRequests;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q));
    }
    return list;
  })();

  /* Calendar events */
  const calEvents: Record<number, { label: string }[]> = {};
  allRequests.forEach(r => {
    const d = new Date(r.createdAt);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      calEvents[day] ??= [];
      calEvents[day].push({ label: r.title });
    }
  });
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();

  /* ── Compact mode when ping is active (renders in narrow right column) ── */
  if (activePing) {
    return (
      <CompactProjectList
        requests={allRequests}
        completedWork={deliveredWork}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground text-sm">Phases, assets, and ideation across your creative work.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="pl-8 h-9 text-sm w-48"
            />
          </div>
          <Link href="/dashboard/requests">
            <Button className="gap-1.5 h-9 shrink-0">
              <PlusCircle className="h-4 w-4" /> New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Top section: 3-col grid — Usage spans 2, Status card in col 3 ── */}
      <div className="grid grid-cols-3 gap-4 items-stretch">

        {/* Plan usage card — spans cols 1–2 */}
        <div className="col-span-2 bg-card border rounded-2xl p-5 flex items-center gap-6">
          <PlanGauge used={3.5} total={5} />
          <div className="flex-1 space-y-4 min-w-0">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Plan Usage</p>
              <p className="font-serif text-lg font-bold">Signal — Core</p>
            </div>
            <div className="grid grid-cols-4 gap-x-5 gap-y-2">
              {[
                { val: "6",   label: "Requests" },
                { val: "10",  label: "Monthly Limit" },
                { val: "19d", label: "Days Left" },
                { val: "87%", label: "On Time", accent: true },
              ].map(({ val, label, accent }) => (
                <div key={label}>
                  <p className={cn("text-xl font-bold tabular-nums leading-none", accent && "text-primary")}>{val}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Single combined status card — col 3, items horizontal */}
        <div className={cn(
          "bg-card border rounded-2xl p-5 flex flex-col justify-center gap-0",
          pendingReview > 0 && "border-primary/25",
        )}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Project Status</p>
          <div className="flex items-stretch divide-x divide-border/60">
            {[
              { label: "Active",       value: activeRequests.length, Icon: Pencil,       accent: false },
              { label: "Needs Review", value: pendingReview,         Icon: AlertCircle,  accent: pendingReview > 0 },
              { label: "Delivered",    value: deliveredWork.length,  Icon: CheckCircle2, accent: false },
            ].map(({ label, value, Icon, accent }) => (
              <div key={label} className="flex-1 flex flex-col items-center justify-center gap-2 px-3 first:pl-0 last:pr-0">
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center",
                  accent ? "bg-primary/10" : "bg-secondary",
                )}>
                  <Icon className={cn("h-3.5 w-3.5", accent ? "text-primary" : "text-muted-foreground")} />
                </div>
                <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
                <p className={cn("text-[10px] text-center leading-tight", accent ? "text-primary font-semibold" : "text-muted-foreground")}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={cn(
                "text-sm px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap",
                filter === key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {key === "review" && pendingReview > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {pendingReview}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
          {([["bento", LayoutGrid, "Bento"], ["timeline", AlignLeft, "Timeline"], ["calendar", CalendarDays, "Calendar"]] as const).map(([v, Icon, label]) => (
            <button key={v} onClick={() => setView(v)}
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

      {/* ── Loading ── */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && filteredRequests.length === 0 && (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-secondary/10">
          <FileText className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground mb-5">
            {search ? `No projects matching "${search}"` : "No projects here yet"}
          </p>
          {!search && (
            <Link href="/dashboard/requests">
              <Button variant="outline" size="sm">Submit a request</Button>
            </Link>
          )}
        </div>
      )}

      {/* ════ BENTO ════ */}
      {!isLoading && filteredRequests.length > 0 && view === "bento" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map(req => {
            const pi        = getPhaseIndex(req.status);
            const phase     = PHASES[pi];
            const finalMedia = getProjectMedia(String(req.id)).find(m => m.isFinal);
            return (
              <Link key={req.id} href={`/dashboard/project/${req.id}`}>
                <div className="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/25 transition-all duration-200 cursor-pointer flex flex-col"
                  style={{ borderTopColor: finalMedia ? "transparent" : `hsl(349 90% ${Math.max(40, 74 - pi * 6)}%)`, borderTopWidth: finalMedia ? 0 : 4 }}>

                  {/* Final deliverable preview thumbnail */}
                  {finalMedia && (
                    <div
                      className="h-24 relative flex items-center justify-center overflow-hidden"
                      style={{ background: gradientFor(finalMedia) }}
                    >
                      <span className="text-5xl opacity-10 font-bold select-none">{MEDIA_KIND_META[finalMedia.kind].icon}</span>
                      <div className="absolute bottom-2 right-2 text-[9px] bg-black/20 text-white rounded-full px-2 py-0.5 font-bold backdrop-blur-sm">
                        Final
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-4 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
                        {TYPE_ICON[req.type] ?? "✦"}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold border shrink-0 px-2 text-primary border-primary/25 bg-primary/[0.06]">
                        {phase}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {req.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{req.type}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-0.5">
                        {PHASES.map((_, i) => (
                          <div key={i} className={cn(
                            "flex-1 h-1.5 rounded-full transition-all",
                            i < pi ? "bg-primary" : i === pi ? "bg-primary/30" : "bg-border/50",
                          )} />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Phase {pi + 1} of {PHASES.length} — {phase}</p>
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
                    <div className="bg-primary/[0.07] border-t border-primary/15 px-5 py-2.5 flex items-center justify-between">
                      <p className="text-xs font-semibold text-primary">Your review needed</p>
                      <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ════ TIMELINE ════ */}
      {!isLoading && filteredRequests.length > 0 && view === "timeline" && (
        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border/50" />
          <div className="space-y-0.5">
            {filteredRequests.map((req, idx) => {
              const pi   = getPhaseIndex(req.status);
              const date = new Date(req.createdAt);
              const prev = idx > 0 ? new Date(filteredRequests[idx - 1].createdAt) : null;
              const showDate = !prev || prev.toDateString() !== date.toDateString();
              return (
                <div key={req.id}>
                  {showDate && (
                    <div className="pl-10 py-1.5">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  )}
                  <Link href={`/dashboard/project/${req.id}`}>
                    <div className="group flex items-start gap-4 py-2 hover:bg-secondary/30 rounded-xl px-2 transition-colors cursor-pointer">
                      <div className="h-9 w-9 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-sm z-10">
                        {TYPE_ICON[req.type] ?? "✦"}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{req.title}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{req.type}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] border text-primary border-primary/25 bg-primary/[0.06] font-medium">
                            {PHASES[pi]}
                          </Badge>
                          <div className="hidden sm:flex items-center gap-0.5 w-14">
                            {PHASES.map((_, i) => (
                              <div key={i} className={cn("flex-1 h-1 rounded-full", i < pi ? "bg-primary" : i === pi ? "bg-primary/25" : "bg-border/50")} />
                            ))}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ CALENDAR ════ */}
      {!isLoading && view === "calendar" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-serif text-lg font-bold">{MONTH_NAMES[calMonth]} {calYear}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1);
              }}>‹</Button>
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth()); }}>Today</Button>
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1);
              }}>›</Button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="min-h-[80px] border-r border-b border-border/30 bg-secondary/10" />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day     = i + 1;
              const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
              const events  = calEvents[day] ?? [];
              return (
                <div key={day} className={cn("min-h-[80px] border-r border-b border-border/30 p-1.5", isToday && "bg-primary/[0.04]", (firstDay + i + 1) % 7 === 0 && "border-r-0")}>
                  <span className={cn("text-xs font-semibold inline-flex h-5 w-5 items-center justify-center rounded-full", isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {events.slice(0, 2).map((ev, ei) => (
                      <div key={ei} className="text-[9px] truncate px-1 py-0.5 rounded font-medium bg-primary/10 text-primary">{ev.label}</div>
                    ))}
                    {events.length > 2 && <p className="text-[9px] text-muted-foreground pl-1">+{events.length - 2}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Deliverables (bento + all) ── */}
      {!isLoading && deliveredWork.length > 0 && filter === "all" && view === "bento" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-serif font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Recent Deliverables
            </h2>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">All <ChevronRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
          <div className="bg-card border rounded-2xl overflow-hidden divide-y divide-border/50">
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
                  {item.approved && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
