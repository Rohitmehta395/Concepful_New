import { AdminLayout } from "@/components/layout/admin-layout";
import { useListOnboardings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Leads() {
  const { data: leads, isLoading } = useListOnboardings();

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Onboarding Leads</h1>
          <p className="text-muted-foreground">Prospects who have completed the configuration flow.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : leads && leads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan Details</TableHead>
                    <TableHead className="text-right">Est. Monthly</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-secondary/20">
                      <TableCell className="font-medium">{lead.companyName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{lead.contactName || 'Unknown'}</div>
                          <div className="text-muted-foreground text-xs">{lead.contactEmail || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-medium">{lead.tier}</span>
                          <span className="text-xs text-muted-foreground uppercase px-1.5 py-0.5 bg-secondary rounded">{lead.billingCycle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(lead.estimatedMonthlyTotal)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.status === 'pending' ? 'secondary' : 'default'} className="capitalize">
                          {lead.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                No leads found in the pipeline.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}