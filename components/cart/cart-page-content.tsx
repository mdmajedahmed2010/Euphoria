/**
 * Euphoria — Cart Page Content (Client Component)
 * Premium full cart page with editorial 2-column grid layout, serif headers,
 * and high-end warm-cream sticky order summary panel.
 * SOP §২ — Frontend Plan F4.2-F4.6
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CartPageContent({ settings = {} }: { settings?: Record<string, any> }) {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const shippingDhaka = Number(settings.shipping_dhaka ?? 80);
  const freeShippingThreshold = Number(settings.free_shipping_threshold ?? 0);

  const estimatedShipping =
    subtotal > 0
      ? freeShippingThreshold > 0 && subtotal >= freeShippingThreshold
        ? 0
        : shippingDhaka
      : 0;
  const total = subtotal + estimatedShipping;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center max-w-md mx-auto">
        <div className="relative p-6 rounded-full bg-[#f8f5f0] text-muted-foreground/60">
          <ShoppingBag className="h-12 w-12" strokeWidth={1} />
        </div>
        <div>
          <h2 className="text-xl font-heading font-medium text-foreground">Your bag is empty</h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Looks like you haven&apos;t added any items to your shopping bag yet. Explore our luxury
            collections to begin.
          </p>
        </div>
        <Link
          href="/collections/new-arrivals"
          className="inline-flex items-center justify-center h-12 px-8 bg-[#0a0a0a] text-[#d4af37] text-xs font-bold uppercase tracking-wider hover:bg-[#1a1a1a] transition-all duration-300 rounded-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column: Cart Items List (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_130px_130px_50px] gap-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground pb-4 border-b border-border/40">
          <span>Product</span>
          <span className="text-center">Quantity</span>
          <span className="text-right">Total</span>
          <span />
        </div>

        {/* Items Rows */}
        <div className="divide-y divide-border/40">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="grid grid-cols-1 md:grid-cols-[1fr_130px_130px_50px] gap-6 items-center py-6 border-b border-border/10 first:pt-0"
            >
              {/* Product Info Thumbnail & Titles */}
              <div className="flex gap-4">
                <div className="relative h-28 w-21 shrink-0 overflow-hidden bg-[#faf9f6] border border-border/30 aspect-[3/4] rounded-none">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName || "Product"}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}
                </div>

                <div className="min-w-0 flex flex-col justify-center">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="text-base font-heading font-semibold text-foreground hover:text-accent line-clamp-2 transition-colors leading-tight"
                  >
                    {item.productName}
                  </Link>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.size && item.size !== "null" && item.size !== "undefined" ? (
                      <span className="text-[9px] uppercase tracking-wider bg-[#f8f5f0] text-muted-foreground px-2.5 py-1 font-semibold border border-border/20 rounded-sm">
                        {item.size.toLowerCase().includes("size") || item.size === "Free Size"
                          ? item.size
                          : `Size ${item.size}`}
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider bg-[#f8f5f0] text-muted-foreground px-2.5 py-1 font-semibold border border-border/20 rounded-sm">
                        Free Size
                      </span>
                    )}
                    {item.color && item.color !== "null" && item.color !== "undefined" && item.color !== "As Shown" && (
                      <span className="text-[9px] uppercase tracking-wider bg-[#f8f5f0] text-muted-foreground px-2.5 py-1 font-semibold border border-border/20 rounded-sm">
                        {item.color}
                      </span>
                    )}
                  </div>

                  {/* Mobile-only item price display */}
                  <p className="text-sm font-semibold text-foreground mt-2.5 md:hidden">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center justify-center">
                <div className="flex items-center border border-border/60">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="h-9 w-9 flex items-center justify-center text-xs font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= (item.maxStock ?? 99)}
                    className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Total price for row */}
              <div className="text-right hidden md:block">
                <span className="text-sm font-semibold text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>

              {/* Delete item action */}
              <div className="flex justify-end">
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="p-2 text-muted-foreground hover:text-sale transition-colors cursor-pointer"
                  aria-label={`Remove ${item.productName}`}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Clear Cart Trigger */}
        <div className="pt-2">
          <button
            onClick={clearCart}
            className="text-xs text-muted-foreground hover:text-sale uppercase tracking-widest font-semibold underline underline-offset-4 cursor-pointer transition-colors"
          >
            Clear Entire Bag
          </button>
        </div>
      </div>

      {/* Right Column: Premium Sticky Order Summary (4 cols) */}
      <div className="lg:col-span-4">
        <div className="sticky top-28 bg-[#fdfaf5] border border-[#d4af37]/30 shadow-md rounded-sm p-8 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a0a0a]">
            Order Summary
          </h2>

          <Separator className="opacity-50" />

          {/* Pricing breakdown */}
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase tracking-wider">Subtotal</span>
              <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase tracking-wider">Shipping</span>
              <span className="font-semibold text-foreground">
                {formatPrice(estimatedShipping)}
              </span>
            </div>
          </div>

          {/* Luxury Coupon Form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="PROMO CODE"
              className="flex-1 h-11 px-4 border border-[#d4af37]/60 bg-white text-xs tracking-wider placeholder:text-muted-foreground focus:outline-none focus:border-[#0a0a0a] uppercase font-semibold rounded-sm"
            />
            <button className="h-11 px-6 bg-[#0a0a0a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors cursor-pointer rounded-sm">
              Apply
            </button>
          </div>

          <Separator className="opacity-50" />

          {/* Final Calculated Total */}
          <div className="flex justify-between text-foreground">
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Grand Total</span>
            <span className="text-base font-bold tracking-tight">{formatPrice(total)}</span>
          </div>

          <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-relaxed">
            Shipping price is calculated for Dhaka. Out-of-Dhaka charges applied during checkout
            delivery address selection.
          </p>

          <div className="space-y-2 pt-2">
            {/* Proceed Checkout Link */}
            <Link
              href="/checkout"
              className="flex items-center justify-center w-full h-12 bg-[#0a0a0a] text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#1a1a1a] shadow-sm hover:shadow-md transition-all duration-300 rounded-sm"
            >
              Proceed to Checkout
            </Link>

            {/* Back shopping */}
            <Link
              href="/collections/new-arrivals"
              className="flex items-center justify-center w-full h-11 border border-[#0a0a0a]/30 bg-transparent text-[#0a0a0a] hover:bg-[#0a0a0a]/5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
