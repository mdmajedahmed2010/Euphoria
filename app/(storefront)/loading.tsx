import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-16">
      {/* Subtle pulsing header skeleton */}
      <Skeleton className="h-10 w-1/3 mb-10 max-w-sm rounded-sm" />

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[3/4] w-full rounded-sm" />
            <Skeleton className="h-4 w-3/4 rounded-sm" />
            <Skeleton className="h-4 w-1/4 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
