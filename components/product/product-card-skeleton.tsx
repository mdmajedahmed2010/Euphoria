/**
 * Euphoria — Product Card Skeleton
 * Loading placeholder for product cards
 */

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-[3/4] rounded-lg bg-muted" />
      <div className="space-y-2 px-0.5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}
