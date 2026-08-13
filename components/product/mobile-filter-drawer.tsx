/**
 * Euphoria — Mobile Filter Drawer (Premium v2.0)
 * Full-screen overlay for mobile filters
 */

"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CollectionFilters } from "./collection-filters";

export function MobileFilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center gap-1.5 h-9 px-3 border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter
      </button>

      {/* Full-screen overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel — slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl overflow-y-auto animate-[fadeInUp_0.3s_ease-out]">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-5 pb-24">
              <CollectionFilters />
            </div>

            {/* Apply Button — sticky bottom */}
            <div className="sticky bottom-0 bg-white border-t border-border p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full h-11 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
