import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListCompletedWork } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

export default function History() {
  const { data: work, isLoading } = useListCompletedWork({ query: { queryKey: ["completed-work", 1] } }, { request: { query: { companyId: 1 } } });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight mb-2">Work History</h1>
          <p className="text-muted-foreground">An archive of all completed and approved creative deliverables.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : work && work.length > 0 ? (
          <div className="relative border-l-2 border-border ml-3 md:ml-6 space-y-12 pb-12">
            {work.map((item, i) => (
              <div key={item.id} className="relative pl-6 md:pl-8">
                <div className="absolute w-4 h-4 bg-background border-2 border-primary rounded-full -left-[9px] top-1" />
                <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold font-serif">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="capitalize">{item.category}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {item.approved ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending Approval</Badge>
                    )}
                  </div>
                  {item.notes && (
                    <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground mt-4">
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-xl border border-dashed">
            <h3 className="text-lg font-medium mb-2">No history yet</h3>
            <p className="text-muted-foreground">Completed work will appear here.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
