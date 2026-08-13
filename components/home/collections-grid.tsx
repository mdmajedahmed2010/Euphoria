/**
 * Euphoria — Collections Grid (Premium v2.0)
 * Clean collection cards with minimal design
 * Design Guide: Clean cards, consistent sizing
 */

import Link from "next/link";
import { CATEGORIES } from "@/lib/demo-data";
import Image from "next/image";

export function CollectionsGrid() {
  return (
    <section className="section-premium">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section heading */}
        <div className="text-center mb-10 md:mb-14 reveal">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3">
            Browse
          </p>
          <h2 className="text-2xl md:text-[34px] font-bold tracking-[-0.02em]">All Collections</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 reveal [transition-delay:200ms]">
          {CATEGORIES.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group relative aspect-[4/3] overflow-hidden"
            >
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-sm md:text-base font-semibold tracking-wide">
                  {collection.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
