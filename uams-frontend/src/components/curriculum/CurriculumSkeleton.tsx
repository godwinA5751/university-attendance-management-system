import { Card, Skeleton } from "@/components/ui";

export default function CurriculumSkeleton() {
  return (
    <Card className="animate-pulse flex items-center justify-between">
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-4 w-32 mb-4" />
      </div>

      <div className="flex flex-col gap-2 items-center">
        <Skeleton className="h-5 w-15 mb-4" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </Card>
  );
}