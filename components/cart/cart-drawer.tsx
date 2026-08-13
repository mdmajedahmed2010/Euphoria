/**
 * Euphoria — Cart Drawer (Slide-out)
 * Luxury shopping bag experience with premium spacing and glassmorphism.
 * SOP §২ — Frontend Plan F4.1
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Ticket,
  Tag,
  XCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { validateCoupon } from "@/actions/coupon.actions";

interface AppliedCoupon {
  code: string;
  type: string;
  value: number;
  label: string;
  discount: number;
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Sync coupon state with localStorage on open/close
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("Euphoria_applied_coupon") || localStorage.getItem("Euphoria_applied_coupon");
      setTimeout(() => {
        if (saved) {
          try {
            setAppliedCoupon(JSON.parse(saved));
          } catch {
            console.error("Error parsing saved coupon");
          }
        } else {
          setAppliedCoupon(null);
        }
        setCouponInput("");
        setCouponError("");
        setCouponSuccess("");
      }, 0);
    }
  }, [isOpen]);

  const subtotal = getSubtotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate discount amount
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;

  const total = subtotal - discountAmount;

  // Apply Coupon Handler
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);

    const res = await validateCoupon(code, subtotal);

    if (!res.success || !res.coupon) {
      setCouponError(res.error || "Invalid coupon code.");
      setIsApplyingCoupon(false);
      return;
    }

    const couponData = {
      code,
      type: res.coupon.type,
      value: res.coupon.value,
      label: res.coupon.freeShipping ? "Free Shipping" : "Discount Applied",
      discount: res.coupon.discount,
    };

    setAppliedCoupon(couponData);
    localStorage.setItem("Euphoria_applied_coupon", JSON.stringify(couponData));
    setCouponSuccess(`"${code}" applied!`);
    setCouponInput("");
    setIsApplyingCoupon(false);
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("Euphoria_applied_coupon");
    localStorage.removeItem("Euphoria_applied_coupon");
    setCouponError("");
    setCouponSuccess("");
    setCouponInput("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] flex flex-col bg-white border-l border-border/40 p-6 md:p-8 shadow-[0_-15px_40px_rgba(0,0,0,0.04)]"
        style={{ backgroundColor: "#fdfcfa" }}
      >
        <SheetHeader className="space-y-1">
          <div className="flex items-baseline justify-between">
            <SheetTitle className="text-lg font-heading font-semibold uppercase tracking-wider text-foreground">
              Shopping Bag
            </SheetTitle>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {itemCount} {itemCount === 1 ? "Item" : "Items"} Selected
          </p>
        </SheetHeader>

        <Separator className="my-4 opacity-50" />

        {/* Free Shipping Progress Bar */}
        {items.length > 0 && (() => {
          const FREE_SHIPPING_THRESHOLD = 10000;
          const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
          const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
          return (
            <div className="mb-4">
              {remaining > 0 ? (
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                  Add <span className="font-bold text-foreground">৳{remaining.toLocaleString()}</span> more for{" "}
                  <span className="font-bold text-accent">FREE shipping</span>
                </p>
              ) : (
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-2">
                  ✓ You&apos;ve unlocked free shipping!
                </p>
              )}
              <div className="h-1 bg-border/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: progress >= 100
                      ? "linear-gradient(90deg, #16a34a, #22c55e)"
                      : "linear-gradient(90deg, #d4af37, #d4af37)"
                  }}
                />
              </div>
            </div>
          );
        })()}

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-10">
            <div className="relative p-6 rounded-full bg-[#f8f5f0] text-muted-foreground/60">
              <ShoppingBag className="h-10 w-10" strokeWidth={1} />
            </div>
            <div>
              <p className="font-heading text-lg font-medium text-foreground">Your bag is empty</p>
              <p className="text-xs text-muted-foreground mt-2 max-w-[240px] mx-auto leading-relaxed">
                Add beautiful garments from our collections to begin your style journey.
              </p>
            </div>
            <button
              onClick={closeCart}
              className="inline-flex items-center justify-center h-11 px-8 border border-[#0a0a0a] bg-transparent text-[#0a0a0a] text-xs font-bold uppercase tracking-wider hover:bg-[#0a0a0a] hover:text-[#d4af37] transition-all duration-300 cursor-pointer rounded-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6 scrollbar-thin">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.variantId}
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95, overflow: "hidden" }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex gap-4 group"
                  >
                    {/* Item Image */}
                    <div className="relative h-24 w-18 shrink-0 overflow-hidden bg-[#faf9f6] border border-border/40 aspect-[3/4] rounded-none">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productName || "Product"}
                          fill
                          sizes="96px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={closeCart}
                            className="text-sm font-medium leading-tight text-foreground hover:text-accent line-clamp-2 transition-colors"
                          >
                            {item.productName}
                          </Link>
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="p-1 text-muted-foreground hover:text-sale transition-colors cursor-pointer shrink-0"
                            aria-label={`Remove ${item.productName} from cart`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {item.size && item.size !== "null" && item.size !== "undefined" ? (
                            <span className="text-[10px] uppercase tracking-wider bg-[#f8f5f0] text-muted-foreground px-2 py-0.5 font-medium rounded-sm border border-border/40">
                              {item.size.toLowerCase().includes("size") || item.size === "Free Size"
                                ? item.size
                                : `Size ${item.size}`}
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider bg-[#f8f5f0] text-muted-foreground px-2 py-0.5 font-medium rounded-sm border border-border/40">
                              Free Size
                            </span>
                          )}
                          {item.color && item.color !== "null" && item.color !== "undefined" && item.color !== "As Shown" && (
                            <span className="text-[10px] uppercase tracking-wider bg-[#f8f5f0] text-muted-foreground px-2 py-0.5 font-medium rounded-sm border border-border/40">
                              {item.color}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-border/60">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-8 w-8 flex items-center justify-center text-xs font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= (item.maxStock ?? 99)}
                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Separator className="my-4 opacity-50" />

            {/* Coupon / Promo Code entry inside Shopping Bag Drawer */}
            <div className="space-y-3.5 py-1">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                  Promo / Coupon Code
                </span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-3 p-3 border border-accent/30 bg-accent/5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 text-accent" />
                    <div>
                      <p className="text-[11px] font-bold text-accent uppercase tracking-wider leading-none">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mt-1">
                        {appliedCoupon.label}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground hover:text-sale transition-colors font-bold cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                          setCouponSuccess("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="w-full h-9 pl-9 pr-3 border border-border/50 bg-white text-[11px] transition-all focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground/30 font-mono font-bold uppercase tracking-widest text-foreground"
                        placeholder="ENTER CODE"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="h-9 px-4 bg-[#0a0a0a] text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#1a1a1a] transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap rounded-r-sm shrink-0"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>

                  {/* Error / Success messages */}
                  {couponError && (
                    <div className="flex items-center gap-1.5 text-sale animate-[fadeIn_0.2s_ease-out]">
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                      <p className="text-[9px] font-bold uppercase tracking-wider">{couponError}</p>
                    </div>
                  )}

                  {couponSuccess && (
                    <div className="flex items-center gap-1.5 text-accent animate-[fadeIn_0.2s_ease-out]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <p className="text-[9px] font-bold uppercase tracking-wider">
                        {couponSuccess}
                      </p>
                    </div>
                  )}

                  {/* Hint */}
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">
                    Try: <span className="font-mono font-bold text-foreground/40">Euphoria10</span>,{" "}
                    <span className="font-mono font-bold text-foreground/40">EID2026</span>
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-4 opacity-50" />

            {/* Cart Summary */}
            <div className="pt-2 space-y-4">
              {appliedCoupon && discountAmount > 0 ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-semibold">
                      Subtotal
                    </span>
                    <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-accent animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5" />
                      <span className="uppercase tracking-widest text-[10px] font-bold">
                        Coupon ({appliedCoupon.code})
                      </span>
                    </div>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/40">
                    <span className="text-foreground uppercase tracking-widest text-[10px] font-bold">
                      Total
                    </span>
                    <span className="font-semibold text-base text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">
                    Subtotal
                  </span>
                  <span className="font-semibold text-base text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-relaxed">
                Taxes & shipping calculated at checkout. Free shipping on orders over ৳10,000.
              </p>

              <div className="space-y-2 mt-4">
                {/* Checkout Button with shimmer effect */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="relative flex items-center justify-center w-full h-12 bg-[#0a0a0a] text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#1a1a1a] transition-all duration-300 overflow-hidden group/checkout rounded-sm shadow-sm"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover/checkout:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  Proceed to Checkout
                </Link>

                {/* Trust micro-copy */}
                <div className="flex items-center justify-center gap-3 py-1">
                  <span className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
                    <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Secure Checkout
                  </span>
                  <span className="text-muted-foreground/30">|</span>
                  <span className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
                    <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Easy Returns
                  </span>
                </div>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="flex items-center justify-center w-full h-11 border border-border/80 bg-transparent text-muted-foreground hover:text-foreground hover:bg-neutral-50 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer"
                >
                  Close Bag
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
