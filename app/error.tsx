/**
 * Sitara — Error Page (500)
 * Branded error boundary
 * SOP §২ — Frontend Plan F6.6
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Log error to Sentry (Phase 4)
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="space-y-2">
          <p className="text-6xl md:text-7xl font-bold text-muted-foreground/20">500</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Something Went Wrong</h1>
          <p className="text-muted-foreground">
            We&apos;re sorry, something unexpected happened. Please try again or contact us if the
            problem persists.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-lg bg-foreground text-background font-medium text-sm hover:bg-foreground/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
