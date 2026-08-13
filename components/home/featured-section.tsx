/**
 * Euphoria — Featured Section (Premium v2.0)
 * Asymmetric editorial layout with premium spacing
 * Design Guide: 1 large hero + 3 standard cards
 */

import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/product/product-card";
import { ALL_PRODUCTS } from "@/lib/demo-data";
import { formatPrice } from "@/lib/utils";

export function FeaturedSection() {
  const featuredProducts = ALL_PRODUCTS.filter(
    (p) => p.compareAtPrice && p.compareAtPrice >= 3000
  ).slice(0, 4);

  const heroProduct = featuredProducts[0];

  return (
    <section className="section-premium bg-surface-warm">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section heading */}
        <div className="flex items-end justify-between mb-10 md:mb-14 reveal">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
              Curated
            </p>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-[-0.02em]">
              Featured Collection
            </h2>
          </div>
          <Link
            href="/collections/featured"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground"
          >
            View All
          </Link>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 reveal [transition-delay:200ms]">
          {/* Hero product — large, spans 2 cols */}
          {heroProduct && (
            <div className="col-span-2 row-span-2">
              <Link
                href={`/products/${heroProduct.slug}`}
                className="group block relative aspect-[3/4] overflow-hidden"
                aria-label={`View ${heroProduct.name}`}
              >
                <Image
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                  <h3 className="text-lg md:text-xl font-semibold text-white leading-snug">
                    {heroProduct.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-white">
                      {formatPrice(heroProduct.price)}
                    </span>
                    {heroProduct.compareAtPrice && (
                      <span className="text-xs text-white/50 line-through">
                        {formatPrice(heroProduct.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Standard cards */}
          {featuredProducts.slice(1).map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
