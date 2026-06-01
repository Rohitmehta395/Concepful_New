import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListCompletedWork } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArtworkThumbnail } from "@/components/ArtworkThumbnail";
import {
  ArrowLeft, CheckCircle2, Clock, Eye, MousePointer, TrendingUp,
  ArrowUpRight, Mail, BarChart2, Download, Share2, PlusCircle,
  CalendarDays, Tag, Layers, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface PerformanceMetrics {
  impressions?: number; clicks?: number; ctr?: number; engagementRate?: number;
  reach?: number; platform?: string; sent?: number; opens?: number;
  openRate?: number; conversions?: number; adSpend?: number; cpm?: number;
  roas?: number; note?: string;
}

function getScore(m: PerformanceMetrics | null): number | null {
  if (!m) return null;
  if (m.ctr && m.ctr > 0) return Math.min(100, Math.round((m.ctr / 5) * 100));
  if (m.openRate && m.openRate > 0) return Math.min(100, Math.round((m.openRate / 40) * 100));
  return null;
}

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-600 border-amber-400/25",
  in_review: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  delivered: "bg-secondary text-secondary-foreground border-border",
  completed: "bg-secondary text-secondary-foreground border-border",
};

const CATEGORY_COLOR: Record<string, string> = {
  campaign: "bg-amber-400/15 text-amber-700 border-amber-400/25",
  social: "bg-primary/10 text-primary border-primary/20",
  email: "bg-blue-400/15 text-blue-700 border-blue-400/25",
  strategy: "bg-slate-400/15 text-slate-600 border-slate-300/40",
  presentation: "bg-purple-400/15 text-purple-700 border-purple-400/25",
  motion: "bg-emerald-400/15 text-emerald-700 border-emerald-400/25",
  web: "bg-cyan-400/15 text-cyan-700 border-cyan-400/25",
};

export default function ProjectCard() {
  const [, params] = useRoute("/dashboard/project/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : null;

  const { data: work, isLoading } = useListCompletedWork(
    { query: { queryKey: ["completed-work", 1] } },
    { request: { query: { companyId: 1 } } }
  );

  const item = work?.find(w => w.id === id);
  const metrics = item?.performanceMetrics as PerformanceMetrics | null;
  const score = getScore(metrics);
  const hasMetrics = metrics && Object.keys(metrics).some(k => k !== "note" && (metrics as any)[k]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-24">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">This project may have been removed or the link is incorrect.</p>
          <Button variant="outline" onClick={() => setLocation("/dashboard/brand")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Brand Center
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const catKey = (item.category ?? "").toLowerCase().trim();
  const catColor = CATEGORY_COLOR[catKey] ?? "bg-secondary text-secondary-foreground border-border";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Breadcrumb */}
        <button
          onClick={() => setLocation("/dashboard/brand")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Brand Center
        </button>

        {/* Hero artwork */}
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg">
          <ArtworkThumbnail
            category={item.category}
            title={item.title}
            className="h-64 w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={cn("text-xs capitalize border", catColor)}>
                <Tag className="h-3 w-3 mr-1" />{item.category}
              </Badge>
              {item.approved ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />Approved
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs bg-white/10 text-white/70 border-white/10">Pending</Badge>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold text-white leading-tight">{item.title}</h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Completed {new Date(item.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="capitalize">{item.category ?? "Creative"}</span>
          </span>
          {score !== null && (
            <span className={cn(
              "flex items-center gap-2 font-semibold",
              score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600"
            )}>
              <TrendingUp className="h-4 w-4" />
              {score}% performance score
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: description + timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign description */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Campaign / Task Description</h2>
              {item.notes ? (
                <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                  <p className="text-sm leading-relaxed">{item.notes}</p>
                </div>
              ) : (
                <div className="bg-secondary/20 rounded-xl p-5 border border-dashed border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">No description added yet.</p>
                </div>
              )}
            </div>

            {/* Performance metrics */}
            {hasMetrics && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Performance Data</h2>

                {/* Score bar */}
                {score !== null && (
                  <div className="mb-5 p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Performance score</span>
                      <span className={cn(
                        "font-bold",
                        score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600"
                      )}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                )}

                {/* Social metrics */}
                {metrics?.impressions && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <MetricCard icon={Eye} label="Impressions" value={fmt(metrics.impressions)} />
                    {metrics.clicks && <MetricCard icon={MousePointer} label="Clicks" value={fmt(metrics.clicks)} />}
                    {metrics.ctr && <MetricCard icon={TrendingUp} label="CTR" value={`${metrics.ctr}%`} sub="Click-through rate" />}
                    {metrics.engagementRate && <MetricCard icon={ArrowUpRight} label="Engagement" value={`${metrics.engagementRate}%`} />}
                  </div>
                )}

                {/* Email metrics */}
                {metrics?.sent && !metrics.impressions && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <MetricCard icon={Mail} label="Sent" value={fmt(metrics.sent)} />
                    {metrics.opens && <MetricCard icon={Eye} label="Opens" value={fmt(metrics.opens)} />}
                    {metrics.openRate && <MetricCard icon={TrendingUp} label="Open Rate" value={`${metrics.openRate}%`} />}
                    {metrics.conversions && <MetricCard icon={ArrowUpRight} label="Conversions" value={String(metrics.conversions)} />}
                  </div>
                )}

                {/* Paid metrics */}
                {metrics?.adSpend && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <MetricCard icon={BarChart2} label="Ad Spend" value={`$${fmt(metrics.adSpend)}`} />
                    {metrics.roas && <MetricCard icon={TrendingUp} label="ROAS" value={`${metrics.roas}x`} sub="Return on ad spend" />}
                    {metrics.cpm && <MetricCard icon={Eye} label="CPM" value={`$${metrics.cpm}`} />}
                  </div>
                )}

                {metrics?.platform && (
                  <p className="text-xs text-muted-foreground mt-2">Platform(s): {metrics.platform}</p>
                )}
              </div>
            )}

            {!hasMetrics && (
              <div className="border border-dashed border-border/50 rounded-xl p-6 text-center">
                <BarChart2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">No performance data yet</p>
                <p className="text-xs text-muted-foreground">Add metrics from the Collateral page to track impact.</p>
              </div>
            )}
          </div>

          {/* Right: actions + details */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-sm">
                  <Download className="h-4 w-4" /> Download assets
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-sm">
                  <Share2 className="h-4 w-4" /> Share project
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm text-muted-foreground">
                  <PlusCircle className="h-4 w-4" /> Add performance data
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">
                    {item.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{item.category ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
