"use client";

/**
 * Euphoria — Lookbook / Editorial Picks Section (Extracted from home-client.tsx)
 * Interactive dual-column desktop + mobile swipeable card view.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

/* ──────────────── Types ──────────────── */

export interface LookbookLook {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  slug: string;
  price: number;
  tag: string;
}

interface LookbookSectionProps {
  looks: LookbookLook[];
}

/* ──────────────── Image With Skeleton ──────────────── */

function ImageWithSkeleton({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="absolute inset-0 skeleton-shimmer z-[1]" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

/* ──────────────── Animation Variants ──────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const leftColumnVariants: any = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rightColumnVariants: any = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ──────────────── Component ──────────────── */

export function LookbookSection({ looks }: LookbookSectionProps) {
  const [activeLookIndex, setActiveLookIndex] = useState(0);

  if (looks.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-surface-warm border-t border-accent/15 overflow-hidden relative">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px 0px" }}
        className="container mx-auto px-4 md:px-12 lg:px-16 max-w-7xl"
      >
        {/* ─── DESKTOP DUAL COLUMN VIEW ─── */}
        <div className="hidden lg:grid grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column */}
          <motion.div variants={leftColumnVariants} className="col-span-5 space-y-7 z-10">
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
                Euphoria EDITORIALS
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-heading leading-tight">
                Hand-Picked <br /> Showcase
              </h2>
            </div>

            {/* Vertical tab container with gold highlight */}
            <div className="flex flex-col gap-3.5 pt-2">
              {looks.map((look, idx) => (
                <button
                  key={look.id || look.slug || idx}
                  onClick={() => setActiveLookIndex(idx)}
                  className={`group relative flex items-center justify-between p-5 border text-left rounded-sm transition-all duration-500 cursor-pointer overflow-hidden ${
                    activeLookIndex === idx
                      ? "bg-white border-accent shadow-md pl-8 scale-[1.01]"
                      : "border-border/60 bg-transparent text-muted-foreground hover:bg-white/40 hover:text-foreground pl-6"
                  }`}
                >
                  {/* Active sliding gold strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-[4px] bg-accent transition-all duration-500 ${
                      activeLookIndex === idx ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                    }`}
                  />
                  <div className="space-y-0.5">
                    <p className="text-[9px] uppercase tracking-wider text-accent font-bold">
                      {look.tag}
                    </p>
                    <h4 className="text-sm font-bold text-foreground transition-colors duration-300 font-sans line-clamp-1">
                      {look.subtitle}
                    </h4>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full transition-all duration-500 ${
                      activeLookIndex === idx
                        ? "bg-accent scale-125"
                        : "bg-neutral-300 group-hover:bg-neutral-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Showcase */}
          <motion.div variants={rightColumnVariants} className="col-span-7 relative">
            {looks.map((look, idx) => {
              if (idx !== activeLookIndex) return null;
              return (
                <div
                  key={look.id || look.slug || idx}
                  className="grid grid-cols-12 gap-6 items-center animate-[slideInRight_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                >
                  <div className="col-span-7 relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100 shadow-xl border border-accent/5 group">
                    <ImageWithSkeleton
                      src={look.image}
                      alt={look.title}
                      className="object-cover transition-transform duration-[6000ms] ease-out scale-100 group-hover:scale-103"
                      sizes="40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="col-span-5 space-y-5 pr-2">
                    <div className="space-y-3">
                      <span className="inline-flex px-2.5 py-1 bg-accent-light border border-accent/20 rounded-sm text-[9px] text-accent font-bold uppercase tracking-wider font-sans">
                        Atelier Pick
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground font-heading leading-snug">
                        {look.subtitle}
                      </h3>
                      <p className="text-lg font-bold text-foreground">{formatPrice(look.price)}</p>
                    </div>
                    <div className="border-t border-accent/15 pt-5">
                      <Link
                        href={`/products/${look.slug}`}
                        className="inline-flex items-center justify-center gap-2 w-full h-12 bg-foreground hover:bg-neutral-800 text-background text-xs font-bold uppercase tracking-[0.15em] transition-all rounded-sm active:scale-[0.97] shadow-sm hover:shadow-md group/btn cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4" /> Shop Now
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ─── MOBILE VIEW ─── */}
        <div className="block lg:hidden space-y-6">
          <div className="text-center space-y-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
              Euphoria EDITORIALS
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Hand-Picked Showcase
            </h2>
          </div>

          {/* Horizontal Pill Tabs */}
          <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide snap-x px-1 justify-start md:justify-center">
            {looks.map((look, idx) => (
              <button
                key={look.id || look.slug || idx}
                onClick={() => setActiveLookIndex(idx)}
                className={`snap-center shrink-0 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                  activeLookIndex === idx
                    ? "bg-foreground text-background border-foreground shadow-sm scale-[1.02]"
                    : "bg-white/80 text-muted-foreground border-border hover:bg-white"
                }`}
              >
                {look.tag?.split(" ")[0] || "LOOK"}
              </button>
            ))}
          </div>

          {/* Swipeable card */}
          <div className="relative max-w-sm mx-auto">
            {looks.map((look, idx) => {
              if (idx !== activeLookIndex) return null;
              return (
                <div
                  key={look.id || look.slug || idx}
                  className="relative aspect-[3/4] rounded-sm overflow-hidden bg-neutral-100 shadow-xl border border-accent/5 animate-scale-in group"
                >
                  <ImageWithSkeleton
                    src={look.image}
                    alt={look.subtitle}
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 400px"
                  />

                  {/* Counter */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-sm text-[9px] text-white/90 font-bold tracking-widest font-sans">
                    0{idx + 1} / 0{looks.length}
                  </div>

                  {/* Arrows */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveLookIndex((prev) => (prev - 1 + looks.length) % looks.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center size-9 rounded-full bg-white/95 text-foreground border border-border/10 shadow-md cursor-pointer transition-transform active:scale-90 animate-fade-in"
                    aria-label="Previous look"
                  >
                    <ChevronLeft className="h-4.5 w-4.5 stroke-[2]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveLookIndex((prev) => (prev + 1) % looks.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center size-9 rounded-full bg-white/95 text-foreground border border-border/10 shadow-md cursor-pointer transition-transform active:scale-90 animate-fade-in"
                    aria-label="Next look"
                  >
                    <ChevronRight className="h-4.5 w-4.5 stroke-[2]" />
                  </button>

                  {/* Floating Bottom Card */}
                  <div className="absolute bottom-4 inset-x-4 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-lg border border-white/20 dark:border-white/10 p-4 rounded-sm shadow-2xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="inline-block text-[8px] text-accent font-bold uppercase tracking-widest font-sans">
                        {look.tag}
                      </span>
                      <h4 className="text-xs font-bold text-foreground truncate font-heading leading-tight">
                        {look.subtitle}
                      </h4>
                      <p className="text-xs font-bold text-foreground/80">
                        {formatPrice(look.price)}
                      </p>
                    </div>
                    <Link
                      href={`/products/${look.slug}`}
                      className="shrink-0 flex items-center justify-center h-10 px-4 bg-foreground hover:bg-neutral-800 text-background text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm active:scale-95 group/btn"
                    >
                      Shop Now{" "}
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
