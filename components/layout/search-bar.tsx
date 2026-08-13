/**
 * Euphoria — Search Bar Component (v2.1)
 * Dual-mode search:
 *   Desktop: Persistent inline search input visible in the header bar
 *   Mobile:  Full-screen luxury search overlay (opens from icon tap)
 * SOP §২ — Frontend Plan F1.7
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { createPortal } from "react-dom";

const popularSearches = [
  "Borka",
  "Silk Saree",
  "Three Piece",
  "Daily Wear Abaya",
  "Boutique Suits",
  "Eid Collection",
];

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [desktopQuery, setDesktopQuery] = useState("");
  const [desktopFocused, setDesktopFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const desktopWrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Lock body scroll when mobile overlay is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopWrapperRef.current && !desktopWrapperRef.current.contains(e.target as Node)) {
        setDesktopFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setQuery("");
      setDesktopQuery("");
      setDesktopFocused(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleDesktopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(desktopQuery);
  };

  const filteredSuggestions = desktopQuery.trim()
    ? popularSearches.filter((s) => s.toLowerCase().includes(desktopQuery.toLowerCase()))
    : popularSearches;

  return (
    <>
      {/* ════════════════════════════════════════
         DESKTOP: Persistent inline search bar
         ════════════════════════════════════════ */}
      <div ref={desktopWrapperRef} className="hidden md:block relative">
        <form onSubmit={handleDesktopSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
          <input
            ref={desktopInputRef}
            type="text"
            value={desktopQuery}
            onChange={(e) => setDesktopQuery(e.target.value)}
            onFocus={() => setDesktopFocused(true)}
            placeholder="Search products..."
            className="w-44 lg:w-56 h-9 pl-9 pr-3 text-[12px] bg-[#f8f5f0] border border-border/50 rounded-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all duration-200 placeholder:text-muted-foreground/40 font-medium text-foreground"
          />
        </form>

        {/* Desktop Quick Suggestions Dropdown */}
        {desktopFocused && (
          <div className="absolute top-full mt-1.5 left-0 right-0 w-56 lg:w-64 bg-white border border-border/50 shadow-xl rounded-sm z-[9999] animate-[fadeIn_0.15s_ease-out]">
            <div className="p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                {desktopQuery.trim() ? "Suggestions" : "Popular Searches"}
              </p>
              <div className="flex flex-col gap-0.5">
                {filteredSuggestions.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearch(term)}
                    className="text-left text-[12px] px-2.5 py-2 text-foreground/70 hover:text-foreground hover:bg-[#f8f5f0] rounded-sm transition-colors cursor-pointer font-medium"
                  >
                    {term}
                  </button>
                ))}
                {desktopQuery.trim() && filteredSuggestions.length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic px-2 py-2">
                    Press Enter to search &quot;{desktopQuery}&quot;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
         MOBILE: Search icon + full-screen overlay
         ════════════════════════════════════════ */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center size-10 text-foreground/60 hover:text-foreground hover:bg-neutral-50 transition-all cursor-pointer"
        aria-label="Search products"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {/* Full-Screen Overlay (Mobile) */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-[100dvh] bg-white z-[99999] flex flex-col p-6 md:p-12 animate-[fadeIn_0.25s_ease-out]"
          style={{ backgroundColor: "#fdfcfa" }}
        >
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-start">
            <div className="flex justify-end mb-8 md:mb-12">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex items-center justify-center size-12 rounded-full border border-border/40 hover:border-foreground/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                aria-label="Close search overlay"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-b border-border/60 pb-4 flex items-center gap-4 animate-slide-up"
            >
              <Search className="h-6 w-6 text-muted-foreground/60" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH FOR PRODUCTS..."
                className="flex-1 bg-transparent text-lg md:text-2xl font-heading tracking-wider placeholder:text-muted-foreground/30 focus:outline-none uppercase font-semibold text-foreground"
                aria-label="Search inputs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer font-bold"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pt-8 md:pt-12 animate-slide-up [animation-delay:100ms]">
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  {query.trim() ? "Suggested Searches" : "Popular Searches"}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {(query.trim()
                    ? popularSearches.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
                    : popularSearches
                  ).map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="text-[11px] uppercase tracking-wider border border-border/80 hover:border-foreground hover:bg-neutral-50 px-4 py-2.5 transition-all duration-300 font-semibold text-foreground cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                  {query.trim() &&
                    popularSearches.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
                      .length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No suggestions found. Press enter to search for &quot;{query}&quot;.
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Trending Collections
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <Link
                    href="/collections/borka"
                    onClick={() => setIsOpen(false)}
                    className="relative aspect-[4/3] overflow-hidden group border border-border/20 shadow-sm"
                  >
                    <Image
                      src="/images/products/borka/borka 1.jpg"
                      alt="Borka collection"
                      fill
                      sizes="(max-width: 768px) 50vw, 30vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 group-hover:bg-black/45">
                      <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/40 group-hover:border-white transition-all pb-0.5">
                        Borka
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/collections/saree"
                    onClick={() => setIsOpen(false)}
                    className="relative aspect-[4/3] overflow-hidden group border border-border/20 shadow-sm"
                  >
                    <Image
                      src="/images/products/saree/0560000083852.webp"
                      alt="Saree collection"
                      fill
                      sizes="(max-width: 768px) 50vw, 30vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 group-hover:bg-black/45">
                      <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/40 group-hover:border-white transition-all pb-0.5">
                        Saree
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
