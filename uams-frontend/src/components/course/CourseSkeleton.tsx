
import { Card, Skeleton } from "@/components/ui";

export default function CourseSkeleton() {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    
      <Skeleton className="h-5 w-64 mb-6" />
    
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
    
      <div className="mt-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
    
      <div className="flex justify-end gap-2 mt-6">
        <Skeleton className="h-10 w-20 rounded-lg" />
        <Skeleton className="h-10 w-44 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </Card>
  );
}