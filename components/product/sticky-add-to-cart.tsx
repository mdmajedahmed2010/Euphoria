/**
 * Euphoria — Sticky Add to Cart Bar (Mobile)
 * Fixed bottom bar on mobile for quick add to cart
 * SOP §২ — Frontend Plan: "Mobile: Sticky Add to Cart bar at bottom"
 */

"use client";

import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StickyAddToCartProps {
  price: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled: boolean;
  label: string;
}

export function StickyAddToCart({
  price,
  onAddToCart,
  onBuyNow,
  disabled,
  label: _label,
}: StickyAddToCartProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/40 bg-white px-5 py-3.5 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] transition-transform duration-300"
      style={{
        backgroundColor: "rgba(253, 252, 250, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="flex flex-col gap-2 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
            Total Price
          </span>
          <span className="text-base font-semibold text-foreground tracking-tight">
            {formatPrice(price)}
          </span>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onAddToCart}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-1.5 h-11 text-[11px] font-bold uppercase tracking-[0.14em] transition-all rounded-sm cursor-pointer ${
              disabled
                ? "bg-neutral-200 border border-neutral-300 text-neutral-500 font-bold opacity-100 cursor-not-allowed"
                : "bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#d4af37]" />
            ADD TO BAG
          </button>

          <button
            onClick={onBuyNow}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-1.5 h-11 text-[11px] font-bold uppercase tracking-[0.14em] transition-all rounded-sm cursor-pointer ${
              disabled
                ? "bg-neutral-200 border border-neutral-300 text-neutral-500 font-bold opacity-100 cursor-not-allowed"
                : "bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {disabled ? "OUT OF STOCK" : "✦ BUY NOW"}
          </button>
        </div>
      </div>
    </div>
  );
}
