import { Card, Skeleton } from "@/components/ui";

export default function StudentDashboardSkeleton() {
  return (
    <>
      <Card className="mb-6 max-w-sm">
        <Skeleton className="h-4 w-40" />

        <div className="mt-3 flex items-center gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-6 w-24" rounded="full" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-6 w-14" rounded="full" />
            </div>

            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}