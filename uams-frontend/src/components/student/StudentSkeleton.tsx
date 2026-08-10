import { Skeleton } from "@/components/ui";

interface StudentSkeletonProps {
  rows?: number;
}

export default function StudentSkeleton({
  rows = 8,
}: StudentSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="w-12 px-4 py-3">
              <Skeleton className="mx-auto h-4 w-4" />
            </th>

            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>

            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-28" />
            </th>

            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>

            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>

            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-16" />
            </th>

            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>

            <th className="px-4 py-3 text-right">
              <Skeleton className="ml-auto h-4 w-20" />
            </th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="border-b last:border-b-0"
            >
              {/* Checkbox */}
              <td className="px-4 py-4">
                <Skeleton className="mx-auto h-4 w-4" />
              </td>

              {/* Matric Number */}
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-28" />
              </td>

              {/* Student Name */}
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-40" />
              </td>

              {/* Faculty */}
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-24" />
              </td>

              {/* Department */}
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-32" />
              </td>

              {/* Level */}
              <td className="px-4 py-4">
                <Skeleton className="h-6 w-20" />
              </td>

              {/* Admission */}
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-16" />
              </td>

              {/* Actions */}
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}