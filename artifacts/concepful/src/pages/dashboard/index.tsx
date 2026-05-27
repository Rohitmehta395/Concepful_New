import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListWorkRequests, useListCompletedWork } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, PlusCircle, TrendingUp, BarChart2, CheckCircle2, CalendarDays, SortAsc } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { ArtworkThumbnail } from "@/components/ArtworkThumbnail";
import { cn } from "@/lib/utils";

type SortKey = "date" | "kind" | "performance";

const ACTIVITY_DATA = [
  { month: "Dec", delivered: 1, requests: 2 },
  { month: "Jan", delivered: 2, requests: 3 },
  { month: "Feb", delivered: 3, requests: 4 },
  { month: "Mar", delivered: 4, requests: 4 },
  { month: "Apr", delivered: 3, requests: 5 },
  { month: "May", delivered: 5, requests: 6 },
];

const COMPLETION_DATA = [
  { name: "Campaign", done: 4, total: 5 },
  { name: "Social", done: 8, total: 9 },
  { name: "Email", done: 3, total: 4 },
  { name: "Strategy", done: 2, total: 3 },
  { name: "Presentation", done: 1, total: 2 },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-600 border-amber-400/25",
  in_review: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  delivered: "bg-secondary text-secondary-foreground border-border",
  completed: "bg-secondary text-secondary-foreground border-border",
};

const DONUT_DATA = [
  { name: "On track", value: 68, color: "hsl(349 90% 54%)" },
  { name: "In review", value: 20, color: "hsl(215 85% 55%)" },
  { name: "Pending", value: 12, color: "hsl(220 14% 80%)" },
];


export default function DashboardOverview() {
  const { data: requests, isLoading } = useListWorkRequests({ query: { queryKey: ["requests", 1] } }, { request: { query: { companyId: 1 } } });
  const { data: completedWork } = useListCompletedWork({ query: { queryKey: ["completed-work", 1] } }, { request: { query: { companyId: 1 } } });
  const [projectSort, setProjectSort] = useState<SortKey>("date");

  const allItems = requests ?? [];
  const activeRequests = allItems.filter(r => r.status !== "completed" && r.status !== "delivered");

  const projectList = [...allItems].sort((a, b) => {
    if (projectSort === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (projectSort === "kind") return a.type.localeCompare(b.type);
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">Your creative intelligence at a glance.</p>
          </div>
          <Badge className="w-fit text-sm px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
            Signal Plan Active
          </Badge>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Requests</p>
              {isLoading ? <Skeleton className="h-9 w-16 mt-1" /> : (
                <p className="text-3xl font-bold tracking-tight">{activeRequests.length}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Strategic Hrs Left</p>
              <p className="text-3xl font-bold tracking-tight">3.5<span className="text-base font-normal text-muted-foreground ml-1">/ 5</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Deliverables</p>
              <p className="text-3xl font-bold tracking-tight">{completedWork?.length ?? "—"}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider mb-1">New Request</p>
              <Link href="/dashboard/requests">
                <Button variant="secondary" size="sm" className="w-full mt-1 justify-between font-semibold group">
                  Submit
                  <PlusCircle className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity area chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Campaign Activity
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Deliverables vs requests, last 6 months</p>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={ACTIVITY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(349 90% 54%)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="hsl(349 90% 54%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215 85% 55%)" stopOpacity={0.14} />
                      <stop offset="95%" stopColor="hsl(215 85% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220 14% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220 14% 50%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(220 12% 88%)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ fontWeight: 600, color: "hsl(232 35% 13%)" }}
                  />
                  <Area type="monotone" dataKey="delivered" name="Delivered" stroke="hsl(349 90% 54%)" strokeWidth={2} fill="url(#colorDelivered)" dot={false} activeDot={{ r: 4, fill: "hsl(349 90% 54%)" }} />
                  <Area type="monotone" dataKey="requests" name="Requests" stroke="hsl(215 85% 55%)" strokeWidth={2} fill="url(#colorRequests)" dot={false} activeDot={{ r: 4, fill: "hsl(215 85% 55%)" }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 pl-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-0.5 rounded-full bg-primary inline-block" />Delivered
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-0.5 rounded-full bg-blue-500 inline-block" />Requests
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donut — portfolio status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" /> Portfolio Status
              </CardTitle>
              <p className="text-xs text-muted-foreground">Current work breakdown</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-4">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value">
                    {DONUT_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(220 12% 88%)", borderRadius: 10, fontSize: 12 }}
                    formatter={(val, name) => [`${val}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 w-full mt-1">
                {DONUT_DATA.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion by type bar chart */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> To-Do Completion by Type
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Completed vs total across all categories</p>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={COMPLETION_DATA} layout="vertical" margin={{ top: 0, right: 12, left: 16, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220 12% 88%)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(220 14% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(220 14% 50%)" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(220 12% 88%)", borderRadius: 10, fontSize: 12 }}
                  cursor={{ fill: "hsl(220 12% 95%)" }}
                />
                <Bar dataKey="total" name="Total" fill="hsl(220 12% 88%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="done" name="Completed" fill="hsl(349 90% 54%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project list + Recent collateral row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Sortable project list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold font-serif flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Projects
              </h2>
              <div className="flex items-center gap-1">
                <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
                {(["date", "kind"] as SortKey[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setProjectSort(s)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md capitalize transition-colors",
                      projectSort === s ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : projectList.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {projectList.map(req => (
                      <div key={req.id} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors">
                        {/* Tiny color bar by type */}
                        <div className={cn(
                          "w-1 h-10 rounded-full shrink-0",
                          req.type === "campaign" ? "bg-amber-400" :
                          req.type === "social" ? "bg-primary" :
                          req.type === "strategy" ? "bg-foreground/30" :
                          req.type === "presentation" ? "bg-purple-400" :
                          "bg-blue-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{req.title}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5 flex items-center gap-1.5">
                            {req.type}
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <Clock className="h-3 w-3" />
                            {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <Badge className={cn("text-[10px] capitalize shrink-0 border", STATUS_COLORS[req.status] ?? "bg-secondary")} variant="outline">
                          {req.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-muted-foreground text-sm">
                    No active projects.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-3 flex justify-end">
              <Link href="/dashboard/requests">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  All requests <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent collateral with artwork */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold font-serif">Recent Collateral</h2>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="p-0">
                {completedWork && completedWork.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {completedWork.slice(0, 4).map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                        {/* Artwork placeholder thumbnail */}
                        <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden">
                          <ArtworkThumbnail category={item.category} title={item.title} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{item.category}</p>
                        </div>
                        {item.approved ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    Completed work will appear here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-lg font-bold font-serif mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/dashboard/brand", title: "Brand Center", desc: "Colors, tone & guidelines" },
              { href: "/dashboard/brand-check", title: "Brand Check", desc: "Run copy against your brand" },
              { href: "/dashboard/ai-collaboration", title: "AI Collab", desc: "AI model & workflow config" },
              { href: "/dashboard/history", title: "Collateral", desc: "All deliverables + metrics" },
            ].map(l => (
              <Link key={l.href} href={l.href}>
                <Card className="hover:border-primary/40 transition-all hover:shadow-sm cursor-pointer h-full">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold mb-1">{l.title}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{l.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
