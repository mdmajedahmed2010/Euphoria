"use client";

/**
 * Euphoria — Testimonials Carousel (Extracted from home-client.tsx)
 * Auto-rotating carousel with pause on hover and Framer Motion.
 */

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────── Types ──────────────── */

export interface Testimonial {
  quote: string;
  author: string;
  designation: string;
  stars: number;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

/* ──────────────── Animation Variants ──────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slideVariants: any = {
  enter: { opacity: 0, y: 20 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

/* ──────────────── Component ──────────────── */

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  // Auto-slide with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goToNext, 6000);
    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  const current = testimonials[activeIndex];
  if (!current) return null;

  return (
    <section className="py-16 md:py-24 bg-[#f8f5f0] border-b border-border/20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto px-4 md:px-12 lg:px-16 max-w-5xl"
      >
        {/* Heading */}
        <div className="text-center max-w-sm mx-auto mb-8 md:mb-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
            CLIENT REVIEW JOURNAL
          </p>
          <h2 className="text-2xl font-bold text-foreground font-heading mt-2">Testimonials</h2>
        </div>

        {/* Testimonial card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative p-6 md:p-14 bg-white border border-border/40 shadow-sm rounded-sm text-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Stars */}
          <div className="flex gap-1 justify-center mb-5 text-accent">
            {[...Array(current.stars)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-current animate-[scaleIn_0.3s_ease-out_forwards]"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>

          {/* Quote with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-sm sm:text-base md:text-lg text-foreground/80 font-medium leading-relaxed font-heading max-w-2xl mx-auto italic"
            >
              &ldquo;{current.quote}&rdquo;
            </motion.p>
          </AnimatePresence>

          {/* Author */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`author-${activeIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {current.author}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{current.designation}</p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2.5 mt-7">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? "w-7 bg-accent" : "w-2 bg-neutral-200 hover:bg-neutral-300"
                }`}
                aria-label={`Testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
