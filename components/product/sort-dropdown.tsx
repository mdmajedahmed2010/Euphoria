/**
 * Euphoria — Sort Dropdown Component
 * Product sorting options for collection pages
 * SOP §২ — Frontend Plan F3.4
 */

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export function SortDropdown() {
  const [selected, setSelected] = useState("newest");
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = sortOptions.find((opt) => opt.value === selected)?.label ?? "Sort";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        Sort: <span className="font-medium text-foreground">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background shadow-lg z-20"
          role="listbox"
          aria-label="Sort products"
        >
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelected(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                selected === option.value
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              role="option"
              aria-selected={selected === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
