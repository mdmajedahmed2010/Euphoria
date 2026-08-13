"use client";

/**
 * Euphoria — Collections Showcase
 * Euphoria | Authentic Pakistani Luxury Suits & Designer Collections
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

/* ──────────────── Types ──────────────── */

export interface CollectionShowcaseItem {
  title: string;
  image: string;
  href: string;
  tag: string;
}

interface CollectionsShowcaseProps {
  collections: CollectionShowcaseItem[];
}

/* ──────────────── Animation Variants ──────────────── */

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const headingVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ──────────────── Component ──────────────── */

export function CollectionsShowcase({ collections }: CollectionsShowcaseProps) {
  if (collections.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white border-b border-border/20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px 0px" }}
        variants={containerVariants}
        className="container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl"
      >
        <motion.div
          variants={headingVariants}
          className="text-center max-w-lg mx-auto mb-10 md:mb-16"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#0a0a0a] font-bold mb-3">
            EXPLORE EVERYTHING
          </p>
          <h2 className="text-2xl md:text-[36px] font-bold tracking-tight text-[#1a0008] font-heading">
            All Collections
          </h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-[2px] bg-[#d4af37] mx-auto mt-4"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
        >
          {collections.slice(0, 4).map((collection) => (
            <motion.div key={collection.title} variants={cardVariants}>
              <Link
                href={collection.href}
                className="group relative overflow-hidden rounded-sm aspect-[3/4] shadow-luxury hover:shadow-gold-glow bg-neutral-900 block border border-[#d4af37]/30 transition-all duration-500"
              >
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-110 group-active:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-3.5 border border-[#d4af37]/25 group-hover:border-[#d4af37]/70 transition-all duration-500 pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-20">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[9px] uppercase tracking-[0.24em] font-bold mb-2">
                    ✦ {collection.tag}
                  </span>
                  <h3 className="text-white text-base md:text-xl font-bold tracking-tight font-heading">
                    {collection.title}
                  </h3>
                  <div className="mt-2.5 flex items-center gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-active:opacity-100 group-active:translate-y-0 transition-all duration-300">
                    <span className="text-[10.5px] text-[#d4af37] uppercase tracking-[0.16em] font-bold font-sans">
                      Explore Collection
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#d4af37]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Haute-Couture Explore All Collections Button */}
        <div className="mt-12 md:mt-16 text-center">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-3 px-10 py-4.5 bg-[#0a0a0a] text-[#d4af37] text-xs uppercase tracking-[0.24em] font-bold rounded-sm hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 shadow-luxury hover:shadow-gold-glow border border-[#d4af37]/40 active:scale-[0.98]"
          >
            Explore All Collections →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
