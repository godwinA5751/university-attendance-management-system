import { Card, Skeleton } from "@/components/ui";

export default function LecturerDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-40 mt-2" />

          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-16" />
          </div>

          <div className="mt-6">
            <Skeleton className="h-10 w-full" rounded="full" />
          </div>
        </Card>
      ))}
    </div>
  );
}