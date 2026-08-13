/**
 * Sitara — Product Detail Loading State
 */

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-56 rounded bg-muted animate-pulse" />

      {/* Product detail skeleton */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-7 w-32 rounded bg-muted animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-16 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-10 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-11 w-28 rounded-lg bg-muted animate-pulse" />
            <div className="h-11 flex-1 rounded-lg bg-muted animate-pulse" />
            <div className="h-11 w-11 rounded-lg bg-muted animate-pulse" />
          </div>

          <div className="h-20 rounded-lg bg-muted animate-pulse" />

          <div className="space-y-2">
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
