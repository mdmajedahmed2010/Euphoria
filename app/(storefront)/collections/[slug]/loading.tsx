/**
 * Sitara — Collection Page Loading State
 */

export default function CollectionLoading() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 rounded bg-muted animate-pulse" />

      {/* Header skeleton */}
      <div className="mt-6 mb-8 space-y-2">
        <div className="h-8 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex gap-8">
        {/* Sidebar skeleton (desktop) */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-6">
          <div className="h-5 w-20 rounded bg-muted animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded bg-muted animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-5 w-16 rounded bg-muted animate-pulse" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-7 w-7 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="flex justify-between mb-6">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[3/4] rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
