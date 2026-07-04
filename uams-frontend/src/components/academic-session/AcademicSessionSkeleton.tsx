export default function AcademicSessionSkeleton() {
  return (
    <div className="animate-pulse border rounded-xl p-5 shadow-sm bg-white">
      <div className="h-5 w-36 rounded bg-gray-300 mb-4"></div>

      <div className="h-4 w-28 rounded bg-gray-200 mb-2"></div>

      <div className="h-4 w-28 rounded bg-gray-200 mb-4"></div>

      <div className="flex gap-2">
        <div className="h-9 w-20 rounded bg-gray-300"></div>
        <div className="h-9 w-20 rounded bg-gray-300"></div>
      </div>
    </div>
  );
}