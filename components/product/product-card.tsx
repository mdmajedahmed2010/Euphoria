"use client";

/**
 * Euphoria — Product Card (Premium Clean v5.0)
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Heart } from "lucide-react";
import { useQuickViewStore } from "@/store/quick-view-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { CURRENCY } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  category?: string;
  isNew?: boolean;
  isSoldOut?: boolean;
  images?: string[];
  secondaryImage?: string;
  isBestseller?: boolean;
  stock?: number;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  category,
  isNew,
  isSoldOut,
  images,
  secondaryImage: explicitSecondary,
  isBestseller,
  stock,
}: ProductCardProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const secondaryImage =
    explicitSecondary && explicitSecondary !== image
      ? explicitSecondary
      : images && images.length > 1
      ? images.find((img) => img && img !== image) || image
      : image;
  const hasSecondaryImage = secondaryImage !== image && Boolean(secondaryImage);

  const openQuickView = useQuickViewStore((state) => state.openQuickView);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = wishlistItems.some((i) => i.id === id);

  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const [secondaryError, setSecondaryError] = useState(false);
  const canShowSecondary = hasSecondaryImage && secondaryLoaded && !secondaryError;

  const isLowStock = !isSoldOut && typeof stock === "number" && stock > 0 && stock <= 5;

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView({ id, name, slug, price, compareAtPrice, image, category, isNew, isSoldOut });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistItem({ id, name, slug, price, image });
  };

  return (
    <Link
      href={`/products/${slug}`}
      className="group block"
      aria-label={`View ${name}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 mb-3 border border-neutral-100 group-hover:border-neutral-300 transition-colors duration-300">
        {/* Primary Image */}
        <Image
          src={image || "/images/products/placeholder.jpg"}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={95}
          unoptimized
          className={`object-cover transition-all duration-500 ${
            canShowSecondary
              ? "group-hover:opacity-0 group-hover:scale-105"
              : "group-hover:scale-105"
          }`}
        />

        {/* Secondary Image Swap */}
        {hasSecondaryImage && !secondaryError && (
          <Image
            src={secondaryImage}
            alt={`${name} detail view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={95}
            unoptimized
            className={`object-cover absolute inset-0 transition-all duration-700 scale-105 group-hover:scale-100 ${
              canShowSecondary ? "opacity-0 group-hover:opacity-100" : "opacity-0"
            }`}
            onLoad={() => setSecondaryLoaded(true)}
            onError={() => setSecondaryError(true)}
          />
        )}

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isBestseller && (
            <span className="inline-flex items-center px-2 py-0.5 bg-[#c9a43c] text-white text-[9px] font-bold uppercase tracking-wider">
              ★ Best
            </span>
          )}
          {isNew && !isBestseller && (
            <span className="inline-flex items-center px-2 py-0.5 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-wider">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold tracking-wide">
              -{discountPercent}%
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex items-center px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold tracking-wide animate-pulse">
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 z-20 flex items-center justify-center h-8 w-8 bg-white border transition-all duration-200 cursor-pointer md:opacity-0 md:group-hover:opacity-100 ${
            isWishlisted
              ? "border-red-400 text-red-500 opacity-100"
              : "border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="h-3.5 w-3.5" fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2} />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-700 border border-neutral-400 px-3 py-1 bg-white/80 backdrop-blur-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View */}
        {!isSoldOut && (
          <button
            onClick={handleQuickViewClick}
            className="absolute bottom-2.5 right-2.5 z-20 flex items-center justify-center h-9 w-9 bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 shadow-sm transition-all duration-200 cursor-pointer md:opacity-0 md:group-hover:opacity-100"
            title="Quick View"
          >
            <Eye className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1 px-0.5">
        <h3 className="text-[13px] md:text-[14px] font-medium leading-snug text-neutral-800 group-hover:text-neutral-900 line-clamp-2 font-serif transition-colors duration-200">
          {name}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold text-neutral-900">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through font-medium">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
