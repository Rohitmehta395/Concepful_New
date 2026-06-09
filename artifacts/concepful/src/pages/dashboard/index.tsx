import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  PlusCircle, LayoutGrid, List, ArrowRight,
  Clock, CheckCircle2, FileText, Pencil, Eye,
  ChevronRight, AlertCircle,
} from "lucide-react";
import { useListWorkRequests, useListCompletedWork } from "@workspace/api-client-react";
import { ArtworkThumbnail } from "@/components/ArtworkThumbnail";
import { cn } from "@/lib/utils";

const PHASES = ["Discovery", "Brief", "Design", "Review", "Revisions", "Delivered"] as const;

function getPhaseIndex(status: string): number {
  const map: Record<string, number> = {
    pending:    0,
    in_progress: 2,
    in_review:  3,
    approved:   4,
    delivered:  5,
    completed:  5,
  };
  return map[status] ?? 0;
}

const PHASE_TOP: Record<number, string> = {
  0: "border-t-amber-400",
  1: "border-t-orange-400",
  2: "border-t-blue-500",
  3: "border-t-violet-500",
  4: "border-t-indigo-500",
  5: "border-t-emerald-500",
};

const PHASE_DOT: Record<number, string> = {
  0: "bg-amber-400",
  1: "bg-orange-400",
  2: "bg-blue-500",
  3: "bg-violet-500",
  4: "bg-indigo-500",
  5: "bg-emerald-500",
};

const PHASE_BADGE: Record<number, string> = {
  0: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  1: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
  2: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  3: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400",
  4: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
  5: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
};

const TYPE_ICON: Record<string, string> = {
  campaign: "🎯", social: "📱", strategy: "🧭",
  presentation: "📊", brand: "✦", email: "📧",
  web: "🌐", motion: "🎬", video: "🎬", design: "🎨",
  copywriting: "✍️",
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

type FilterKey = "all" | "active" | "review" | "delivered";
type ViewKey   = "bento" | "list";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "review",    label: "Needs Review" },
  { key: "delivered", label: "Delivered" },
];

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

  const allRequests     = requests ?? [];
  const activeRequests  = allRequests.filter(r => !["completed","delivered"].includes(r.status));
  const reviewRequests  = allRequests.filter(r => r.status === "in_review");
  const deliveredWork   = completedWork ?? [];

  const filteredRequests = (() => {
    switch (filter) {
      case "active":    return allRequests.filter(r => !["completed","delivered"].includes(r.status));
      case "review":    return allRequests.filter(r => r.status === "in_review");
      case "delivered": return allRequests.filter(r => ["delivered","completed"].includes(r.status));
      default:          return allRequests;
    }
  })();

  const pendingReview = reviewRequests.length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground">Track phases, assets, and ideation across your creative work.</p>
          </div>
          <Link href="/dashboard/requests">
            <Button className="gap-2">
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
            pendingReview > 0 && "border-violet-300 bg-violet-50/60 dark:bg-violet-950/20 dark:border-violet-800",
          )}>
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
              pendingReview > 0 ? "bg-violet-100 dark:bg-violet-900/40" : "bg-secondary",
            )}>
              {pendingReview > 0
                ? <AlertCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                : <Eye className="h-4 w-4 text-muted-foreground" />
              }
            </div>
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">{pendingReview}</p>
              <p className={cn("text-xs mt-0.5", pendingReview > 0 ? "text-violet-600 dark:text-violet-400 font-semibold" : "text-muted-foreground")}>
                Needs Review
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">{deliveredWork.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Delivered</p>
            </div>
          </div>
        </div>

        {/* ── Toolbar: filter tabs + view toggle ── */}
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

          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
            {([["bento", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Project grid / list ── */}
        {isLoading ? (
          <div className={cn(view === "bento" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2")}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className={view === "bento" ? "h-56 rounded-2xl" : "h-14 rounded-xl"} />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl bg-secondary/10">
            <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground mb-1">No projects here yet</p>
            <p className="text-xs text-muted-foreground mb-5">Submit a request to start your first creative project.</p>
            <Link href="/dashboard/requests">
              <Button variant="outline" size="sm">Submit a request</Button>
            </Link>
          </div>
        ) : view === "bento" ? (
          /* ── BENTO GRID ── */
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
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0 shadow-inner">
                          {TYPE_ICON[req.type] ?? "✦"}
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-semibold capitalize border shrink-0 px-2", PHASE_BADGE[pi])}>
                          {phase}
                        </Badge>
                      </div>

                      {/* Title */}
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
                            <div
                              key={i}
                              className={cn(
                                "flex-1 h-1.5 rounded-full transition-all",
                                i < pi  ? "bg-primary" :
                                i === pi ? "bg-primary/40" :
                                "bg-border/60",
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Phase {pi + 1} of {PHASES.length} — {phase}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    {/* Review banner */}
                    {req.status === "in_review" && (
                      <div className="bg-violet-50 dark:bg-violet-950/40 border-t border-violet-100 dark:border-violet-900 px-5 py-2.5 flex items-center justify-between">
                        <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">Your review needed</p>
                        <ArrowRight className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="px-5 py-2.5 border-b bg-secondary/30 grid grid-cols-12 gap-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-5">Project</div>
              <div className="col-span-2 hidden sm:block">Phase</div>
              <div className="col-span-2 hidden md:block">Type</div>
              <div className="col-span-2 hidden sm:block">Updated</div>
              <div className="col-span-1 text-right"></div>
            </div>
            <div className="divide-y divide-border/50">
              {filteredRequests.map(req => {
                const pi = getPhaseIndex(req.status);
                const phase = PHASES[pi];
                return (
                  <Link key={req.id} href={`/dashboard/project/${req.id}`}>
                    <div className="grid grid-cols-12 gap-4 items-center px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer group">
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", PHASE_DOT[pi])} />
                        <span className="text-sm shrink-0">{TYPE_ICON[req.type] ?? "✦"}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {req.title}
                          </p>
                          {req.status === "in_review" && (
                            <p className="text-[10px] text-violet-600 font-semibold">Needs review</p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 hidden sm:block">
                        <Badge variant="outline" className={cn("text-[10px] capitalize border font-medium", PHASE_BADGE[pi])}>
                          {phase}
                        </Badge>
                      </div>

                      <div className="col-span-2 hidden md:block">
                        <p className="text-xs text-muted-foreground capitalize">{req.type}</p>
                      </div>

                      <div className="col-span-2 hidden sm:block">
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Recent Deliverables (only on "all" filter) ── */}
        {deliveredWork.length > 0 && filter === "all" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-serif font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recent Deliverables
              </h2>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border/50">
                {deliveredWork.slice(0, 5).map(item => (
                  <Link key={item.id} href={`/dashboard/project/${item.id}`}>
                    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border/40">
                        <ArtworkThumbnail category={item.category} title={item.title} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                      </div>
                      {item.approved && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
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

      </div>
    </DashboardLayout>
  );
}
