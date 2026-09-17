import { Skeleton } from "@/components/ui";

export default function AdminDashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-20 rounded-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9" rounded="full" />
            </div>
            <Skeleton className="h-8 w-16 mt-4" />
          </div>
        ))}
      </div>
    </>
  );
}