"use client";

/**
 * Euphoria — Horizontal Collection Filters (Premium v2.0)
 * Biba-style horizontal sticky dropdown filters.
 * Connected to URL search params for instant, shareable, SEO-friendly filter states.
 */

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

const categories = ["Kundan Bridal Sets", "Polki Necklaces", "Pearl Jewellery", "Long Chains", "Choker Sets"];

const priceRanges = [
  { label: "Under ৳15,000", value: "0-15000" },
  { label: "৳15,000 – ৳25,000", value: "15000-25000" },
  { label: "৳25,000 – ৳35,000", value: "25000-35000" },
  { label: "Above ৳35,000", value: "35000-999999" },
];

export function CollectionFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Active dropdown panel states
  const [openDropdown, setOpenDropdown] = useState<"size" | "price" | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Read current URL filters
  const currentSizes = searchParams.getAll("size");
  const currentPrice = searchParams.get("price");

  // Helper to push new search parameters
  const updateFilters = (key: string, values: string[], removeKey?: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always delete first to rebuild
    params.delete(key);
    values.forEach(v => params.append(key, v));

    if (removeKey) {
      params.delete(key);
    }

    setOpenDropdown(null);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleToggleSize = (size: string) => {
    const nextSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    updateFilters("size", nextSizes);
  };

  const handleSelectPrice = (value: string) => {
    if (currentPrice === value) {
      // Toggle off
      updateFilters("price", [], true);
    } else {
      updateFilters("price", [value]);
    }
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("size");
    params.delete("price");
    setOpenDropdown(null);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = currentSizes.length > 0 || currentPrice !== null;

  return (
    <div ref={dropdownRef} className="w-full space-y-4">
      {/* 1. Horizontal Dropdown Bar */}
      <div className="flex flex-wrap items-center gap-3 py-3 border-y border-border/50 bg-white">
        
        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
            className={`inline-flex items-center gap-1.5 h-10 px-4 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
              currentSizes.length > 0
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 bg-white"
            }`}
            aria-expanded={openDropdown === "size"}
          >
            Category {currentSizes.length > 0 && `(${currentSizes.length})`}
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === "size" ? "rotate-180" : ""}`} />
          </button>

          {openDropdown === "size" && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-neutral-200 shadow-lg py-3 px-3 z-40">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">Filter by Category</h5>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => {
                  const isChecked = currentSizes.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleToggleSize(cat)}
                      className={`w-full text-left h-9 px-3 text-xs font-medium border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-100 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 bg-white"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
            className={`inline-flex items-center gap-1.5 h-10 px-4 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
              currentPrice
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 bg-white"
            }`}
            aria-expanded={openDropdown === "price"}
          >
            Price
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === "price" ? "rotate-180" : ""}`} />
          </button>

          {openDropdown === "price" && (
            <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-neutral-200 shadow-lg py-3 px-3 z-40">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">Price Range</h5>
              <div className="flex flex-col gap-1.5">
                {priceRanges.map((range) => {
                  const isChecked = currentPrice === range.value;
                  return (
                    <button
                      key={range.value}
                      onClick={() => handleSelectPrice(range.value)}
                      className={`w-full text-left h-9 px-3 text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? "bg-neutral-900 text-white border-neutral-900 font-semibold"
                          : "border-neutral-100 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 bg-white"
                      }`}
                    >
                      {range.label}
                      {isChecked && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Active Clear Link inside bar */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer ml-auto"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 2. Active Filter Chips Display Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {currentSizes.map((size) => (
            <div
              key={`chip-size-${size}`}
              className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/50 rounded-full text-xs font-medium text-foreground transition-colors"
            >
              Size: {size}
              <button
                onClick={() => handleToggleSize(size)}
                className="size-4 rounded-full flex items-center justify-center hover:bg-neutral-300 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={`Remove size filter ${size}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {currentPrice && (() => {
            const range = priceRanges.find(r => r.value === currentPrice);
            return range ? (
              <div
                key={`chip-price-${currentPrice}`}
                className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/50 rounded-full text-xs font-medium text-foreground transition-colors"
              >
                {range.label}
                <button
                  onClick={() => updateFilters("price", [], true)}
                  className="size-4 rounded-full flex items-center justify-center hover:bg-neutral-300 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Remove price filter"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}
