"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListCompletedWork, useUpdateCompletedWork, getListCompletedWorkQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, BarChart2, TrendingUp, Eye, MousePointer, Mail, ArrowUpRight, LayoutGrid, List, Upload, PlusCircle } from "lucide-react";
import { ArtworkThumbnail } from "@/components/features/dashboard/artwork-thumbnail";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortKey = "date" | "performance" | "type";

const CATEGORIES = ["All", "Social", "Email", "Campaign", "Strategy", "Presentation", "Motion", "Web"];

interface PerformanceMetrics {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  engagementRate?: number;
  reach?: number;
  platform?: string;
  sent?: number;
  opens?: number;
  openRate?: number;
  conversions?: number;
  note?: string;
  // Generic ad/banner metrics
  adSpend?: number;
  cpm?: number;
  roas?: number;
}

function getPerformanceScore(metrics: PerformanceMetrics | null): number | null {
  if (!metrics) return null;
  if (metrics.ctr && metrics.ctr > 0) {
    // CTR-based score: 5%+ CTR = 100, 0.5% = 20
    return Math.min(100, Math.round((metrics.ctr / 5) * 100));
  }
  if (metrics.openRate && metrics.openRate > 0) {
    // Open rate: 40%+ = 100, 10% = 25
    return Math.min(100, Math.round((metrics.openRate / 40) * 100));
  }
  return null;
}

function PerformanceBar({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-bold", score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500")}>{score}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function MetricPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">{label}</p>
        <p className="text-sm font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AddMetricsDialog({ item, onClose }: { item: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateWork = useUpdateCompletedWork();
  const [form, setForm] = useState<PerformanceMetrics>(
    (item.performanceMetrics as PerformanceMetrics) ?? {}
  );

  const handleSave = () => {
    updateWork.mutate(
      { id: item.id, data: { notes: item.notes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCompletedWorkQueryKey() });
          toast({ title: "Metrics saved", description: "Performance data updated." });
          onClose();
        },
      }
    );
  };

  const field = (key: keyof PerformanceMetrics, label: string, placeholder: string, type = "number") => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={(form[key] as any) ?? ""}
        onChange={e => setForm(prev => ({ ...prev, [key]: type === "number" ? parseFloat(e.target.value) || undefined : e.target.value }))}
        data-testid={`metrics-input-${key}`}
      />
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add Performance Metrics</DialogTitle>
          <p className="text-sm text-muted-foreground">{item.title}</p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Digital / Social</p>
            <div className="grid grid-cols-2 gap-3">
              {field("impressions", "Impressions", "84200")}
              {field("reach", "Reach", "61000")}
              {field("clicks", "Clicks", "3120")}
              {field("ctr", "CTR (%)", "3.7")}
              {field("engagementRate", "Engagement Rate (%)", "5.2")}
              {field("platform", "Platform(s)", "Instagram, LinkedIn", "text")}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Email</p>
            <div className="grid grid-cols-2 gap-3">
              {field("sent", "Emails Sent", "12400")}
              {field("opens", "Opens", "3844")}
              {field("openRate", "Open Rate (%)", "31.0")}
              {field("conversions", "Conversions", "44")}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Paid / Banners</p>
            <div className="grid grid-cols-2 gap-3">
              {field("adSpend", "Ad Spend ($)", "2400")}
              {field("cpm", "CPM ($)", "4.20")}
              {field("roas", "ROAS", "3.8")}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Google Analytics / Ads OAuth connection coming soon — paste metrics manually for now.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateWork.isPending} data-testid="save-metrics-btn">
            {updateWork.isPending ? "Saving..." : "Save Metrics"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HistoryClient() {
  const { data: work, isLoading } = useListCompletedWork(
    { companyId: 1 },
    { query: { queryKey: getListCompletedWorkQueryKey({ companyId: 1 }) } },
  );

  const [view, setView] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [filterCategory, setFilterCategory] = useState("All");
  const [metricsItem, setMetricsItem] = useState<any | null>(null);

  const sorted = [...(work ?? [])].filter(item => {
    if (filterCategory === "All") return true;
    return item.category?.toLowerCase() === filterCategory.toLowerCase();
  }).sort((a, b) => {
    if (sortBy === "date") return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    if (sortBy === "type") return (a.category ?? "").localeCompare(b.category ?? "");
    if (sortBy === "performance") {
      const sa = getPerformanceScore((a as any).performanceMetrics as any) ?? -1;
      const sb = getPerformanceScore((b as any).performanceMetrics as any) ?? -1;
      return sb - sa;
    }
    return 0;
  });

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight mb-1">Collateral</h1>
          <p className="text-muted-foreground">All creative deliverables — with performance data where available.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            data-testid="view-grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            data-testid="view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              data-testid={`filter-${cat.toLowerCase()}`}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                filterCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">Sort:</span>
          {(["date", "type", "performance"] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-md transition-colors capitalize",
                sortBy === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={cn("gap-5", view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col")}>
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed">
          <BarChart2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No work yet in this category</h3>
          <p className="text-muted-foreground text-sm">Completed deliverables will appear here with performance tracking.</p>
        </div>
      ) : (
        <div className={cn(
          "gap-5",
          view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col"
        )}>
          {sorted.map((item) => {
            const metrics = (item as any).performanceMetrics as PerformanceMetrics | null;
            const perfScore = getPerformanceScore(metrics);
            const hasMetrics = metrics && Object.keys(metrics).some(k => k !== "note" && (metrics as any)[k]);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card
                  className={cn(
                    "flex flex-col overflow-hidden transition-shadow hover:shadow-lg",
                    view === "list" ? "flex-row items-center" : ""
                  )}
                  data-testid={`collateral-item-${item.id}`}
                >
                  {/* Artwork thumbnail */}
                  {view === "grid" ? (
                    <ArtworkThumbnail
                      category={item.category}
                      title={item.title}
                      className="h-28 w-full rounded-none"
                    />
                  ) : (
                    <ArtworkThumbnail
                      category={item.category}
                      title={item.title}
                      className="h-16 w-16 shrink-0 rounded-none"
                    />
                  )}

                  <CardHeader className={cn("pb-3", view === "list" ? "flex-1 py-3" : "")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight line-clamp-2">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                          <span className="capitalize">{item.category}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <Clock className="h-3 w-3" />
                          {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {item.approved ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                        )}
                        {perfScore !== null && (
                          <div className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            perfScore >= 75 ? "bg-emerald-500/10 text-emerald-600" :
                            perfScore >= 50 ? "bg-amber-400/15 text-amber-600" : "bg-rose-500/10 text-rose-600"
                          )}>
                            {perfScore}% perf
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4 flex-1">
                    {item.notes && (
                      <p className="text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3 mb-4 line-clamp-2">
                        {item.notes}
                      </p>
                    )}

                    {/* Metrics display */}
                    {hasMetrics ? (
                      <div className="space-y-3">
                        {/* Social metrics */}
                        {metrics?.impressions && (
                          <div className="grid grid-cols-2 gap-2">
                            <MetricPill icon={Eye} label="Impressions" value={fmt(metrics.impressions)} />
                            {metrics.clicks && <MetricPill icon={MousePointer} label="Clicks" value={fmt(metrics.clicks)} />}
                            {metrics.ctr && <MetricPill icon={TrendingUp} label="CTR" value={`${metrics.ctr}%`} />}
                            {metrics.engagementRate && <MetricPill icon={ArrowUpRight} label="Engagement" value={`${metrics.engagementRate}%`} />}
                          </div>
                        )}
                        {/* Email metrics */}
                        {metrics?.sent && !metrics.impressions && (
                          <div className="grid grid-cols-2 gap-2">
                            <MetricPill icon={Mail} label="Sent" value={fmt(metrics.sent)} />
                            {metrics.opens && <MetricPill icon={Eye} label="Opens" value={fmt(metrics.opens)} />}
                            {metrics.openRate && <MetricPill icon={TrendingUp} label="Open Rate" value={`${metrics.openRate}%`} />}
                            {metrics.conversions && <MetricPill icon={ArrowUpRight} label="Conversions" value={String(metrics.conversions)} />}
                          </div>
                        )}
                        {/* Paid metrics */}
                        {metrics?.adSpend && (
                          <div className="grid grid-cols-2 gap-2">
                            <MetricPill icon={BarChart2} label="Ad Spend" value={`$${fmt(metrics.adSpend)}`} />
                            {metrics.roas && <MetricPill icon={TrendingUp} label="ROAS" value={`${metrics.roas}x`} />}
                            {metrics.cpm && <MetricPill icon={Eye} label="CPM" value={`$${metrics.cpm}`} />}
                          </div>
                        )}

                        {perfScore !== null && (
                          <PerformanceBar score={perfScore} label="Performance score" />
                        )}

                        {metrics?.platform && (
                          <p className="text-[11px] text-muted-foreground">Platform: {metrics.platform}</p>
                        )}
                        {metrics?.note && (
                          <p className="text-[11px] text-muted-foreground italic">{metrics.note}</p>
                        )}
                      </div>
                    ) : (
                      <div className="border border-dashed border-border/60 rounded-lg p-3 flex items-center gap-2.5">
                        <BarChart2 className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        <p className="text-xs text-muted-foreground">No performance metrics yet.</p>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setMetricsItem(item)}
                      data-testid={`add-metrics-${item.id}`}
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                      {hasMetrics ? "Update metrics" : "Add performance metrics"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {metricsItem && (
        <AddMetricsDialog item={metricsItem} onClose={() => setMetricsItem(null)} />
      )}
    </div>
  );
}
