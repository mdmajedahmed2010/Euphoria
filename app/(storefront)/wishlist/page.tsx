"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Separator } from "@/components/ui/separator";
import { useWishlistStore } from "@/store/wishlist-store";

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((state) => state.items);

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-6 max-w-7xl min-h-[60vh] flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
        <Separator />
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center flex-grow">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-2">
            <Heart className="h-10 w-10 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Save items you love for later. Browse our collections and add your favorite pieces to the wishlist.
            </p>
          </div>
          <Link
            href="/collections/new-arrivals"
            className="inline-flex items-center justify-center h-12 px-8 mt-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 max-w-7xl min-h-[60vh]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Wishlist ({wishlistItems.length})</h1>
      </div>
      <Separator />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlistItems.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id || item.productId || ""}
            name={item.name || item.productName || "Product"}
            slug={item.slug || item.productSlug || ""}
            price={item.price || 0}
            image={item.image || "/images/products/placeholder.jpg"}
          />
        ))}
      </div>
    </div>
  );
}
