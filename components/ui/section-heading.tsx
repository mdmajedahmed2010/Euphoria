/**
 * Euphoria — Section Heading Component
 * Reusable heading for homepage sections
 */

import Link from "next/link";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeading({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between mb-8 md:mb-10">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm md:text-base text-muted-foreground">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          {viewAllLabel} →
        </Link>
      )}
    </div>
  );
}
