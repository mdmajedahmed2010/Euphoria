"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[STOREFRONT ERROR BOUNDARY]:", error);
  }, [error]);

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="size-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-5">
        <AlertCircle className="size-7" />
      </div>

      <p className="text-xs font-semibold tracking-widest text-[#b8935a] uppercase mb-2">
        ATELIER SYSTEM ALERT
      </p>

      <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground max-w-md">
        Something went wrong while loading this page
      </h1>

      <p className="text-xs md:text-sm text-muted-foreground mt-3 max-w-sm leading-relaxed">
        We apologize for the inconvenience. Our technical atelier has logged this incident. Please try refreshing or return to the main boutique.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 h-10 px-6 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="size-3.5" />
          Try Again
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-6 border border-border text-foreground text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-50 transition-colors"
        >
          <Home className="size-3.5" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
