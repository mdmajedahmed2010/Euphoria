"use client";

/**
 * Euphoria — Brand Story Section
 * Authentic Jewelry Collections
 */

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ASSETS } from "@/lib/demo-data";

export function EditorialSection() {
  return (
    <section className="py-16 md:py-28 bg-white relative border-y border-border/40 overflow-hidden">
      <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-border/20 hidden lg:block" />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px 0px" }}
        className="container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center">
          {/* Left: Image */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute -inset-3 bg-neutral-100 border border-neutral-200 rounded-sm -z-10 translate-x-3 translate-y-3 transition-transform duration-500 group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-neutral-50 shadow-md">
              <Image
                src={ASSETS.img4}
                alt="Euphoria — Luxury Authentic Jewelry"
                fill
                className="object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="lg:col-span-7 space-y-8 lg:pl-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
                  ABOUT EUPHORIA
                </p>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-foreground font-serif">
                Dedicated to <span className="italic font-normal text-accent">Authentic Jewelry</span>
              </h2>
            </div>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-sans max-w-xl">
              Euphoria is a premier destination in Bangladesh dedicated to curated, premium authentic jewelry. From royal Kundan bridal sets to timeless Polki and elegant Pearl chains, every piece is crafted to make your moments unforgettable.
            </p>

            <div className="p-6 md:p-8 bg-neutral-50 border-l-2 border-accent rounded-sm">
              <p className="text-sm md:text-base text-foreground leading-relaxed font-medium italic font-serif">
                &ldquo;We empower women with elegant, culturally rich festive jewelry, bringing authentic pieces with 100% guarantee and fast delivery across Bangladesh.&rdquo;
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center h-12 md:h-14 px-8 bg-foreground hover:bg-primary text-background text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-sm shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Explore Collections
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground border-b border-accent hover:border-foreground pb-1 transition-all"
              >
                Read Full Story
                <ArrowRight className="h-4 w-4 text-accent" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
