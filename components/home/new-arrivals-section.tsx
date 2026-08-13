/**
 * Euphoria — New Arrivals Section (Premium v2.0)
 * Clean product grid with generous spacing
 * Design Guide: 4-column grid, editorial heading, "View All" link
 */

import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ALL_PRODUCTS } from "@/lib/demo-data";

export function NewArrivalsSection() {
  const products = ALL_PRODUCTS.slice(0, 8);

  return (
    <section className="section-premium">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section heading — premium style */}
        <div className="flex items-end justify-between mb-10 md:mb-14 reveal">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
              Just In
            </p>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-[-0.02em]">New Arrivals</h2>
          </div>
          <Link
            href="/collections/new-arrivals"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground"
          >
            View All
          </Link>
        </div>

        {/* Product Grid — generous gap */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 reveal [transition-delay:200ms]">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
