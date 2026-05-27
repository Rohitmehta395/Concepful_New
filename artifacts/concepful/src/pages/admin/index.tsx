import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminStats, useGetAdminMrr, useListOnboardings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: mrr, isLoading: mrrLoading } = useGetAdminMrr();
  const { data: leads, isLoading: leadsLoading } = useListOnboardings();

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Agency Operations</h1>
          <p className="text-muted-foreground">High-level view of Concepful's pipeline and revenue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold">{formatCurrency(stats?.totalMrr || 0)}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-bold">{stats?.activeClients || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-bold">{stats?.openRequests || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-3xl font-bold">{stats?.totalLeads || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>MRR by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              {mrrLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {mrr?.byTier.map(tier => (
                    <div key={tier.tier}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{tier.tier} <span className="text-muted-foreground font-normal ml-2">({tier.clients} clients)</span></span>
                        <span className="font-bold">{formatCurrency(tier.mrr)}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${(tier.mrr / mrr.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Link href="/admin/leads" className="text-sm text-primary flex items-center hover:underline">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {leadsLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="divide-y">
                  {leads?.slice(0, 5).map(lead => (
                    <div key={lead.id} className="p-4 sm:p-6 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lead.companyName}</p>
                        <p className="text-sm text-muted-foreground capitalize">{lead.tier} Plan · {lead.billingCycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(lead.estimatedMonthlyTotal)}/mo</p>
                        <p className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}