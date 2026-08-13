"use client";

/**
 * Euphoria — Category Grid (Premium Clean v2.0)
 */

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface CategoryItem {
  name: string;
  slug: string;
  productCount: number;
  image: string;
}

interface CategoryGridProps {
  categories: CategoryItem[];
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white border-b border-neutral-100">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px 0px" }}
        variants={containerVariants}
        className="container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl"
      >
        {/* Section heading */}
        <motion.div variants={cardVariants} className="text-center mb-12 md:mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold mb-3">
            SHOP BY CATEGORY
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 font-serif">
            Our Collections
          </h2>
          <div className="w-10 h-[2px] bg-[#c9a43c] mx-auto mt-4" />
        </motion.div>

        {/* Category cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          {categories.slice(0, 4).map((category) => (
            <motion.div key={category.slug} variants={cardVariants}>
              <Link
                href={`/collections/${category.slug}`}
                className="group relative overflow-hidden bg-neutral-50 block border border-neutral-200 hover:border-neutral-900 transition-all duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                </div>

                {/* Info strip */}
                <div className="p-4 bg-white border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[13px] font-bold tracking-tight text-neutral-900 font-serif">
                        {category.name}
                      </h3>
                      <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-medium">
                        {category.productCount} Pieces
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-10 py-4 bg-neutral-900 text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-neutral-700 transition-all duration-300 active:scale-[0.98]"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
