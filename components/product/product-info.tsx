"use client";

/**
 * Euphoria — Product Info Component (Jewelry Design)
 * Clean, minimalistic styling with white background and dark text.
 */

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Heart, Minus, Plus, ShoppingBag, Truck, ChevronDown, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

interface Variant {
  id: string;
  price: number;
  stock: number;
  sku: string;
}

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    compareAtPrice?: number | null;
    variants: Variant[];
    specifications?: { label: string; value: string }[] | null;
    deliveryInfo: string;
    images: string[];
  };
  settings?: Record<string, unknown>;
}

export function ProductInfo({
  product,
  settings = {},
}: ProductInfoProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Fallback variant if no variants exist in database
  const fallbackVariant = useMemo(
    () => ({
      id: `default-${product.id}`,
      sku: `${product.slug || product.id}-default`,
      price: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      stock: 100,
    }),
    [product]
  );

  const selectedVariant = product.variants?.[0] || fallbackVariant;

  const [quantity, setQuantity] = useState(1);
  const wishlistItems = useWishlistStore((state) => state.items);
  const isWishlisted = wishlistItems.some((i) => i.id === product.id);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);

  const [openSection, setOpenSection] = useState<string | null>("description");

  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : true;
  const maxQuantity = selectedVariant?.stock ?? 10;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - currentPrice) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Selected product is unavailable");
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSku: selectedVariant.sku,
      size: "Standard",
      color: "As Pictured",
      price: selectedVariant.price,
      quantity,
      image: product.images[0] ?? "",
      maxStock: selectedVariant.stock,
    });

    toast.success("Added to bag", {
      description: `${product.name} × ${quantity}`,
    });

    openCart();
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error("Selected product is unavailable");
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSku: selectedVariant.sku,
      size: "Standard",
      color: "As Pictured",
      price: selectedVariant.price,
      quantity,
      image: product.images[0] ?? "",
      maxStock: selectedVariant.stock,
    });

    toast.success("Proceeding to checkout...", {
      description: `${product.name}`,
    });

    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    toggleWishlistItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.basePrice,
      image: product.images[0] ?? "",
    });
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-8">
      {/* Product Name */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight font-serif text-foreground mb-2">
          {product.name}
        </h1>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Authentic Jewelry
        </p>
      </div>

      {/* Price Display */}
      <div className="flex items-center gap-4">
        <span className="text-2xl md:text-3xl font-medium text-foreground">
          {formatPrice(currentPrice)}
        </span>
        {hasDiscount && (
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground line-through font-medium">
              {formatPrice(product.compareAtPrice!)}
            </span>
            <span className="text-xs font-bold text-sale bg-sale/10 px-2 py-0.5 rounded-sm">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-border/40" />

      {/* Stock Warning */}
      {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
          <p className="text-xs font-bold text-accent">
            Only {selectedVariant.stock} left in stock — order now!
          </p>
        </div>
      )}

      {/* Quantity & Actions Grid */}
      <div className="space-y-6">
        {/* Quantity */}
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            Quantity
          </span>
          <div className="flex items-center border border-neutral-200 overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="flex items-center justify-center h-11 w-11 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <span className="flex items-center justify-center h-11 w-12 text-sm font-semibold border-x border-neutral-200 text-neutral-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="flex items-center justify-center h-11 w-11 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="flex flex-col gap-3 w-full">
          {/* Add to Bag */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`w-full flex items-center justify-center gap-2.5 h-14 px-6 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-200 active:scale-[0.99] cursor-pointer ${
              !isInStock
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-white text-neutral-900 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{!isInStock ? "OUT OF STOCK" : "ADD TO BAG"}</span>
          </button>

          {/* Buy Now — Solid Black */}
          <button
            onClick={handleBuyNow}
            disabled={!isInStock}
            className={`w-full flex items-center justify-center h-14 px-6 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-200 active:scale-[0.99] cursor-pointer ${
              !isInStock
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-900 text-white hover:bg-neutral-700"
            }`}
            style={{ boxShadow: isInStock ? '0 4px 20px rgba(0,0,0,0.18)' : 'none' }}
          >
            <span>{!isInStock ? "OUT OF STOCK" : "BUY NOW"}</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={handleToggleWishlist}
            className={`w-full flex items-center justify-center gap-2 h-11 border text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isWishlisted
                ? "border-[#c9a43c] text-[#c9a43c] bg-[#c9a43c]/5"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2} />
            <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 py-4 border-t border-neutral-100">
        <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-neutral-50 border border-neutral-100">
          <Truck className="h-5 w-5 text-neutral-700" strokeWidth={1.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-800">Fast Delivery</span>
          <span className="text-[9px] text-neutral-400">Dhaka 1-2 days</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-neutral-50 border border-neutral-100">
          <ShieldCheck className="h-5 w-5 text-neutral-700" strokeWidth={1.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-800">100% Authentic</span>
          <span className="text-[9px] text-neutral-400">Guaranteed original</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-neutral-50 border border-neutral-100">
          <Star className="h-5 w-5 text-[#c9a43c]" strokeWidth={1.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-800">Cash on Delivery</span>
          <span className="text-[9px] text-neutral-400">Pay on receipt</span>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-border pt-4">
        {/* Description */}
        <AccordionItem
          title="Jewelry Description"
          isOpen={openSection === "description"}
          onToggle={() => toggleSection("description")}
        >
          <p className="text-sm text-muted-foreground leading-relaxed font-sans">
            {product.description}
          </p>
        </AccordionItem>

        {/* Specifications */}
        {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
          <AccordionItem
            title="Specifications"
            isOpen={openSection === "details"}
            onToggle={() => toggleSection("details")}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.specifications.map((spec, i) => (
                <div key={i} className="flex flex-col border-b border-border/40 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {spec.label}
                  </span>
                  <span className="text-sm font-medium text-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          </AccordionItem>
        )}

        {/* Delivery & Policy */}
        <AccordionItem
          title="Delivery & Care"
          isOpen={openSection === "shipping"}
          onToggle={() => toggleSection("shipping")}
        >
          <div className="space-y-3 text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
            <p>• <strong>Delivery:</strong> Inside Dhaka: ৳{String(settings.shipping_dhaka ?? 80)} | Outside Dhaka: ৳{String(settings.shipping_outside ?? 150)}</p>
            <p>• Delivery-তে পণ্য চেক করা বাধ্যতামূলক। ডেলিভারি ম্যান থাকা অবস্থায় পণ্য চেক করে নিবেন।</p>
            <p>• <strong>Jewelry Care:</strong> Keep away from water, perfume, and chemicals. Store in a cool, dry place inside a pouch or box.</p>
            <p>• <strong>Pre-Order Policy:</strong> Custom or pre-ordered jewelry takes 20-25 days delivery time.</p>
            <p>• <strong>Advance Payment:</strong> Required for all orders above 3000 BDT to confirm booking.</p>
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}

/* Accordion Item Component */
function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 text-sm font-bold uppercase tracking-widest text-foreground hover:opacity-70 transition-opacity"
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="pb-5 animate-[fadeIn_0.3s_ease-out]">{children}</div>}
    </div>
  );
}
