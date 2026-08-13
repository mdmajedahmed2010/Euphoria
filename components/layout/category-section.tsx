/**
 * Euphoria — Category Section (Premium v2.0)
 * Asymmetric editorial grid with real images
 * Design Guide: 1 large (60%) + 2 small stacked, OR 2x2
 */

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/demo-data";

export function CategorySection() {
  return (
    <section className="section-premium">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section heading — editorial */}
        <div className="text-center mb-10 md:mb-14 reveal">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3">
            Collections
          </p>
          <h2 className="text-2xl md:text-[34px] font-bold tracking-[-0.02em]">Shop by Category</h2>
        </div>

        {/* Asymmetric Grid — 1 large + 3 small */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 reveal [transition-delay:200ms]">
          {/* First item — spans 2 columns on desktop */}
          {CATEGORIES[0] && (
            <Link
              href={`/collections/${CATEGORIES[0].slug}`}
              className="group relative col-span-2 row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[500px] overflow-hidden"
            >
              <Image
                src={CATEGORIES[0].image}
                alt={CATEGORIES[0].name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight">
                  {CATEGORIES[0].name}
                </h3>
                <p className="text-white/70 text-sm mt-1 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Explore Collection →
                </p>
              </div>
            </Link>
          )}

          {/* Remaining items — smaller cards */}
          {CATEGORIES.slice(1).map((category) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className="text-white text-base md:text-lg font-semibold">{category.name}</h3>
                <p className="text-white/60 text-xs mt-0.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {category.productCount} Products →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
