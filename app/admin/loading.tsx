import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Filters/Toolbar Skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md hidden sm:block" />
        <Skeleton className="h-10 w-32 rounded-md hidden sm:block" />
      </div>

      {/* Table/Data Skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <Skeleton className="h-4 w-1/4 rounded-md" />
          <Skeleton className="h-4 w-1/4 rounded-md" />
          <Skeleton className="h-4 w-1/4 rounded-md" />
          <Skeleton className="h-4 w-1/4 rounded-md" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4">
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
