"use client";

/**
 * Euphoria — Admin Table Skeleton
 * Reusable loading skeleton for admin data tables with gold shimmer animation.
 */

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 8, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header Row */}
      <div className="flex border-b border-gray-100 bg-gray-50/40 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`h-${i}`} className="flex-1 px-2">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`r-${rowIdx}`} className="flex items-center border-b border-gray-50 px-4 py-3.5">
          {Array.from({ length: columns }).map((_, colIdx) => {
            // Vary widths per column position for realism
            const widths = ["w-20", "w-28", "w-16", "w-24", "w-14"];
            const width = widths[colIdx % widths.length];

            return (
              <div key={`c-${colIdx}`} className="flex-1 px-2">
                <div
                  className={`h-3.5 ${width} rounded shimmer-skeleton`}
                  style={{
                    animationDelay: `${(rowIdx * columns + colIdx) * 50}ms`,
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}

      {/* Inline shimmer styles using the Euphoria gold accent */}
      <style jsx>{`
        .shimmer-skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e8dcc8 37%, #f3f4f6 63%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
