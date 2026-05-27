import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListWorkRequests } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, PlusCircle } from "lucide-react";

export default function DashboardOverview() {
  const { data: requests, isLoading } = useListWorkRequests({ query: { queryKey: ["requests", 1] } }, { request: { query: { companyId: 1 } } });
  
  const activeRequests = requests?.filter(r => r.status !== 'completed' && r.status !== 'delivered') || [];
  const mostRecent = activeRequests[0];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">Welcome back. Here's what's happening with your creative intelligence.</p>
          </div>
          <Badge variant="secondary" className="w-fit text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            Signal Plan Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-4xl font-bold tracking-tight">{activeRequests.length}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Strategic Hours Left</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight">3.5<span className="text-lg text-muted-foreground font-normal ml-1">/ 5</span></div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Need something new?</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/requests">
                <Button variant="secondary" className="w-full justify-between mt-2 group">
                  Submit Request
                  <PlusCircle className="h-4 w-4 ml-2 group-hover:rotate-90 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-serif">Recent Activity</h2>
              <Link href="/dashboard/requests" className="text-sm text-primary flex items-center hover:underline">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : activeRequests.length > 0 ? (
                  <div className="divide-y">
                    {activeRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="p-4 sm:p-6 flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium line-clamp-1">{req.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 capitalize flex items-center gap-2">
                            {req.type}
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <Clock className="h-3 w-3" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize shrink-0">{req.status.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    No active requests.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold font-serif mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/brand">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">Brand Center</h3>
                    <p className="text-sm text-muted-foreground">Update your brand guidelines, colors, and tone.</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/brand-check">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">Brand Check</h3>
                    <p className="text-sm text-muted-foreground">Run copy against your established brand guidelines.</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
