/**
 * Sitara — Account Loading State
 */

export default function AccountLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="h-px w-full bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-5 w-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
