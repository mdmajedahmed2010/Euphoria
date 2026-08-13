"use client";

/**
 * Euphoria — Quick View Modal (Premium v4.1 - Production Ready)
 * Glassmorphism modal with REAL variant data fetched from DB.
 * Upgraded with 50+ color map support, modern Pill/Chip color swatches,
 * and robust auto-fallback for empty sizes/colors to prevent "No sizes available" bug.
 */

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Heart, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useQuickViewStore, type QuickViewProduct } from "@/store/quick-view-store";
import { getProductVariants, type QuickViewVariant } from "@/actions/quick-view.actions";
import { getColorStyle } from "@/lib/color-utils";

export function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickViewStore();

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-neutral-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      {/* Click Outside to Close */}
      <div className="absolute inset-0" onClick={closeQuickView} />

      {/* Modal Container — Inner mounted with unique key to reset state */}
      <QuickViewModalInner key={product.id} product={product} onClose={closeQuickView} />
    </div>
  );
}

interface QuickViewModalInnerProps {
  product: QuickViewProduct;
  onClose: () => void;
}

function QuickViewModalInner({ product, onClose }: QuickViewModalInnerProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Real variant state
  const [variants, setVariants] = useState<QuickViewVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(true);

  // Fetch real variants from DB when the modal opens
  useEffect(() => {
    let cancelled = false;

    async function fetchVariants() {
      setIsLoadingVariants(true);
      const result = await getProductVariants(product.id);
      if (!cancelled) {
        setVariants(result.success ? result.data : []);
        setIsLoadingVariants(false);
      }
    }

    fetchVariants();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  // Fallback variant if no variants exist in database
  const fallbackVariant = useMemo<QuickViewVariant>(
    () => ({
      id: `default-${product.id}`,
      sku: `${product.slug || product.id}-default`,
      size: "Free Size",
      color: "As Shown",
      price: product.price,
      stock: 100,
      images: [product.image],
    }),
    [product]
  );

  const effectiveVariants = useMemo<QuickViewVariant[]>(() => {
    return variants.length > 0 ? variants : [fallbackVariant];
  }, [variants, fallbackVariant]);

  // Derive unique sizes from effective variants
  const availableSizes = useMemo(() => {
    const unique = new Set<string>();
    effectiveVariants.forEach((v) => {
      const sizeStr = v.size ? v.size.trim() : "";
      unique.add(sizeStr || "Free Size");
    });
    return Array.from(unique);
  }, [effectiveVariants]);

  // Derive unique colors from effective variants
  const availableColors = useMemo(() => {
    const unique = new Set<string>();
    effectiveVariants.forEach((v) => {
      if (v.color && v.color.trim() !== "" && v.color !== "As Shown") {
        unique.add(v.color.trim());
      }
    });
    return Array.from(unique);
  }, [effectiveVariants]);

  // Auto-select first available in-stock size and color when variants load
  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      const firstInStock = availableSizes.find((s) => {
        return effectiveVariants.some((v) => (v.size?.trim() || "Free Size") === s && v.stock > 0);
      });
      setSelectedSize(firstInStock || availableSizes[0] || "Free Size");
    }
    if (!selectedColor && availableColors.length > 0) {
      const firstColorInStock = availableColors.find((c) => {
        return effectiveVariants.some((v) => v.color?.trim() === c && v.stock > 0);
      });
      setSelectedColor(firstColorInStock || availableColors[0] || null);
    }
  }, [effectiveVariants, availableSizes, availableColors, selectedSize, selectedColor]);

  // Find selected variant
  const selectedVariant = useMemo(() => {
    let match = effectiveVariants;
    if (selectedSize) {
      match = match.filter((v) => (v.size?.trim() || "Free Size") === selectedSize);
    }
    if (selectedColor) {
      match = match.filter((v) => v.color?.trim() === selectedColor);
    }
    return match.find((v) => v.stock > 0) ?? match[0] ?? effectiveVariants[0];
  }, [effectiveVariants, selectedSize, selectedColor]);

  const currentPrice = selectedVariant?.price ?? product.price;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : true;
  const maxQuantity = selectedVariant?.stock ?? 10;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - currentPrice) / product.compareAtPrice!) * 100)
    : 0;

  // Build image gallery from variant images + product image
  const variantImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : variants.length > 0
      ? variants.flatMap((v) => v.images || [])
      : [];

  const allImages = variantImages.length > 0
    ? [...new Set([product.image, ...variantImages])]
    : [product.image];

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedVariant) {
      toast.error("Selected product is unavailable");
      return;
    }

    const sizeToUse = selectedVariant.size?.trim() || "Free Size";
    const colorToUse = selectedVariant.color?.trim() || "As Shown";

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSku: selectedVariant.sku,
      size: sizeToUse,
      color: colorToUse,
      price: selectedVariant.price,
      quantity,
      image: product.image,
      maxStock: selectedVariant.stock,
    });

    toast.success("Added to bag", {
      description: `${product.name} — ${sizeToUse !== "Free Size" ? `Size ${sizeToUse}` : "Free Size"}${colorToUse !== "As Shown" ? ` (${colorToUse})` : ""} × ${quantity}`,
    });

    onClose();
  };

  const handleBuyNow = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedVariant) {
      toast.error("Selected product is unavailable");
      return;
    }

    const sizeToUse = selectedVariant.size?.trim() || "Free Size";
    const colorToUse = selectedVariant.color?.trim() || "As Shown";

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSku: selectedVariant.sku,
      size: sizeToUse,
      color: colorToUse,
      price: selectedVariant.price,
      quantity,
      image: product.image,
      maxStock: selectedVariant.stock,
    });

    toast.success("Proceeding to checkout...", {
      description: `${product.name} — ${sizeToUse !== "Free Size" ? `Size ${sizeToUse}` : "Free Size"}`,
    });

    onClose();
    router.push("/checkout");
  };

  return (
    <div className="relative w-full max-w-4xl bg-[#fdfcfa]/98 border border-white/20 shadow-2xl rounded-sm overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh] md:max-h-[85vh] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-muted-foreground hover:text-foreground transition-colors border border-border/40 cursor-pointer"
        aria-label="Close modal"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      {/* Left Section: Gallery (50%) */}
      <div className="w-full md:w-1/2 bg-[#f5f5f5] p-6 flex flex-col justify-between max-h-[40vh] md:max-h-full">
        <div className="relative flex-1 aspect-[3/4] max-h-[35vh] md:max-h-[55vh] overflow-hidden rounded-sm bg-neutral-100">
          <Image
            src={allImages[activeImageIndex] ?? product.image}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-700 hover:scale-103 bg-[#f5f5f5]"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={100}
            unoptimized
            priority
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="inline-flex items-center px-2 py-0.5 bg-foreground text-background text-[9px] font-bold uppercase tracking-[0.15em] rounded-sm">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="inline-flex items-center px-2 py-0.5 bg-sale text-white text-[9px] font-bold tracking-wide rounded-sm">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails if multiple images exist */}
        {allImages.length > 1 && (
          <div className="flex gap-2.5 mt-4 justify-center overflow-x-auto scrollbar-hide">
            {allImages.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-14 w-11 overflow-hidden border transition-all cursor-pointer shrink-0 ${
                  activeImageIndex === idx
                    ? "border-accent scale-103 shadow-sm"
                    : "border-border/60 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Section: Details (50%) */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full bg-white">
        <div className="space-y-5">
          {/* Brand & Product Title */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight font-heading text-foreground tracking-[-0.01em]">
              {product.name}
            </h2>
          </div>

          {/* Price display */}
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-semibold text-foreground">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-muted-foreground line-through font-medium">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <span className="text-xs font-bold text-sale bg-sale/5 px-2 py-0.5 rounded-sm">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <div className="border-t border-border/40" />

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div>
              <div className="flex items-baseline gap-2 mb-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Select Color
                </p>
                {selectedColor ? (
                  <span className="text-xs text-foreground font-semibold">({selectedColor})</span>
                ) : (
                  <span className="text-xs text-muted-foreground font-medium italic">(Select a color)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5 items-center">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color;
                  const style = getColorStyle(color);
                  const inStock = variants.some((v) => v.color === color && v.stock > 0);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(isSelected ? null : color);
                        setQuantity(1);
                        setActiveImageIndex(0);
                      }}
                      disabled={!inStock}
                      className={`group relative w-8 h-8 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "ring-2 ring-foreground ring-offset-2 scale-110 shadow-md border border-black/20 dark:border-white/20"
                          : inStock
                            ? "hover:scale-105 hover:ring-1 hover:ring-foreground/50 hover:ring-offset-1 border border-black/15 shadow-sm"
                            : "opacity-30 cursor-not-allowed border border-black/10"
                      }`}
                      title={color}
                      aria-label={color}
                      aria-pressed={isSelected}
                    >
                      <span
                        className="w-full h-full rounded-full shadow-inner block"
                        style={style}
                      />
                      {!inStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-[1.5px] bg-red-500 rotate-45 transform" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div>
            <div className="flex items-baseline gap-2 mb-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Select Size
              </p>
              {selectedSize && (
                <span className="text-xs text-muted-foreground font-medium">({selectedSize})</span>
              )}
            </div>

            {isLoadingVariants ? (
              <div className="flex items-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-xs text-muted-foreground">Loading sizes...</span>
              </div>
            ) : availableSizes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No sizes available for this product.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const variant = variants.find((v) => (v.size?.trim() || "Free Size") === size && (!selectedColor || v.color?.trim() === selectedColor));
                  const inStock = variant ? variant.stock > 0 : variants.some((v) => (v.size?.trim() || "Free Size") === size && v.stock > 0);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                        setActiveImageIndex(0);
                      }}
                      disabled={!inStock}
                      className={`h-10 min-w-[42px] px-3.5 text-xs font-semibold border rounded-sm transition-all duration-200 cursor-pointer ${
                        selectedSize === size
                          ? "bg-foreground text-background border-foreground shadow-sm"
                          : inStock
                            ? "border-border text-foreground hover:border-foreground hover:bg-neutral-50"
                            : "border-border/30 text-muted-foreground/30 line-through cursor-not-allowed bg-neutral-50/20"
                      }`}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Stock indicator */}
            {selectedVariant && (
              <p className={`text-[10px] mt-2 font-medium ${
                selectedVariant.stock <= 3 && selectedVariant.stock > 0
                  ? "text-warning"
                  : selectedVariant.stock === 0
                    ? "text-sale"
                    : "text-success"
              }`}>
                {selectedVariant.stock === 0
                  ? "Out of stock"
                  : selectedVariant.stock <= 3
                    ? `Only ${selectedVariant.stock} left!`
                    : "In stock"}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
              Quantity:
            </span>
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex items-center justify-center h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="flex items-center justify-center h-9 w-9 text-xs font-semibold border-x border-border">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
                className="flex items-center justify-center h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3.5">
          {/* Add to Bag & Buy Now Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || isLoadingVariants}
              className={`flex-1 flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-[0.14em] transition-all rounded-sm cursor-pointer active:scale-[0.98] ${
                !isInStock || isLoadingVariants
                  ? "bg-neutral-200 border border-neutral-300 text-neutral-500 font-bold cursor-not-allowed"
                  : "bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              <ShoppingBag className="h-4 w-4 text-[#d4af37]" />
              ADD TO BAG
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!isInStock || isLoadingVariants}
              className={`flex-1 flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-[0.14em] transition-all rounded-sm cursor-pointer active:scale-[0.98] ${
                !isInStock || isLoadingVariants
                  ? "bg-neutral-200 border border-neutral-300 text-neutral-500 font-bold cursor-not-allowed"
                  : "bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {isLoadingVariants ? "LOADING..." : !isInStock ? "OUT OF STOCK" : "✦ BUY NOW"}
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`flex items-center justify-center h-11 w-11 border transition-colors shrink-0 rounded-sm ${
                isWishlisted
                  ? "border-sale text-sale bg-sale/5"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* View Full details */}
          <Link
            href={`/products/${product.slug}`}
            onClick={onClose}
            className="block w-full text-center py-2.5 border border-border/70 hover:border-foreground text-xs font-bold uppercase tracking-[0.15em] text-foreground/80 hover:text-foreground transition-all rounded-sm hover:bg-neutral-50"
          >
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
