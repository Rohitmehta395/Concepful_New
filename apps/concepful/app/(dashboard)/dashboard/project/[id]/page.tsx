import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDetailClient } from "@/components/features/dashboard/project/project-detail-client";

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    }>
      <ProjectDetailClient />
    </Suspense>
  );
}
