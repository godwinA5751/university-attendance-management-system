import { Card, Skeleton } from "@/components/ui";

interface AcademicSessionSkeletonProps {
  isActive?: boolean;
}

export default function AcademicSessionSkeleton({ isActive = false }: AcademicSessionSkeletonProps) {
  return (
    <Card className="animate-pulse flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-6 w-18 mb-4" />
      </div>

      <div className="flex gap-2">
        {!isActive && (
          <Skeleton className="h-10 w-24 rounded-lg" />
        )}
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </Card>
  );
}