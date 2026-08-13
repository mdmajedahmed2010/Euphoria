"use client";

/**
 * Euphoria — Hero Slider (Premium v5.0)
 * Cinematic hero with Ken Burns, parallax, animated progress line, and slide counter.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

/* ──────────────── Image With Skeleton ──────────────── */

function ImageWithSkeleton({
  src,
  alt,
  fill = true,
  sizes,
  className = "",
  priority = false,
  quality,
  unoptimized,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={quality}
      unoptimized={unoptimized}
      className={className}
    />
  );
}

/* ──────────────── Types ──────────────── */

export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  overline: string;
  color: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

/* ──────────────── Component ──────────────── */

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroReady, setHeroReady] = useState(true);
  const [progress, setProgress] = useState(0);

  // Parallax depth
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 80]);

  const SLIDE_DURATION = 7000;

  // Hero entrance animation
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Progress bar animation + auto-slide
  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
    }, 50);

    const slideTimer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(slideTimer);
    };
  }, [currentSlide, slides.length]);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative w-full h-[75vh] min-h-[500px] md:h-[88vh] overflow-hidden bg-neutral-950 group border-b border-border/20">
      {/* Decorative vertical lines */}
      <div className="absolute inset-0 z-20 pointer-events-none border-x-[1px] border-white/5 max-w-7xl mx-auto flex justify-between">
        <div className="w-[1px] h-full bg-white/5" />
        <div className="w-[1px] h-full bg-white/5" />
      </div>

      {/* Slide Counter — top right editorial style */}
      <div className="absolute top-5 right-5 md:top-8 md:right-8 z-30 flex items-center gap-2">
        <span className="text-white/90 font-mono text-sm font-bold tracking-widest">
          {String(currentSlide + 1).padStart(2, "0")}
        </span>
        <span className="text-white/30 font-mono text-xs">/</span>
        <span className="text-white/40 font-mono text-xs tracking-widest">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <motion.div
              style={{ y: parallaxY }}
              className={`absolute inset-0 transition-transform duration-[8500ms] cubic-bezier(0.1, 1, 0.1, 1) ${
                isActive ? "scale-105" : "scale-100"
              }`}
            >
              <ImageWithSkeleton
                src={slide.image}
                alt={slide.title}
                sizes="100vw"
                priority={index === 0}
                quality={100}
                unoptimized
                className="object-cover"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-black/30 to-transparent`}
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
            </motion.div>

            {/* Hero Content with staggered entrance */}
            <div className="relative z-20 h-full flex items-center">
              <div className="container mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
                <div
                  className={`max-w-2xl transition-all duration-[1000ms] delay-300 transform ${
                    isActive && heroReady
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  {/* Overline with animated gold badge */}
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-5">
                    <span
                      className={`h-[1.5px] bg-[#d4af37] transition-all duration-700 delay-500 ${
                        isActive && heroReady ? "w-6 sm:w-10" : "w-0"
                      }`}
                    />
                    <span
                      className={`inline-block px-3 py-0.5 sm:py-1 border border-white/30 bg-white/10 backdrop-blur-md text-white text-[9.5px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.28em] font-bold transition-all duration-700 delay-500 shadow-sm ${
                        isActive && heroReady
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-4"
                      }`}
                    >
                      ✦ {slide.overline} ✦
                    </span>
                  </div>

                  {/* Title */}
                  <h1
                    className={`text-[24px] xs:text-[30px] sm:text-[44px] md:text-[58px] lg:text-[72px] font-bold text-white leading-[1.1] md:leading-[1.04] tracking-tight mb-3 sm:mb-5 font-heading drop-shadow-md transition-all duration-[800ms] delay-[400ms] ${
                      isActive && heroReady
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                    }`}
                  >
                    {slide.title}
                  </h1>

                  <p
                    className={`text-xs sm:text-sm md:text-base text-neutral-200 max-w-lg leading-relaxed mb-6 sm:mb-8 md:mb-10 font-medium font-sans transition-all duration-[800ms] delay-[600ms] ${
                      isActive && heroReady
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    {slide.subtitle}
                  </p>

                  <div
                    className={`flex flex-wrap gap-4 transition-all duration-[800ms] delay-[800ms] ${
                      isActive && heroReady
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <Link
                      href={slide.link}
                      className="relative inline-flex items-center justify-center gap-2 sm:gap-2.5 h-11 sm:h-13 md:h-14 px-6 sm:px-9 bg-white text-neutral-900 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-all duration-300 hover:bg-neutral-100 active:scale-[0.98] group/btn cursor-pointer overflow-hidden shadow-lg"
                    >
                      {/* CTA shimmer overlay */}
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent pointer-events-none" />
                      Shop Collection
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation arrows */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center size-10 md:size-13 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer backdrop-blur-[2px]"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <button
        onClick={handleNextSlide}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center size-10 md:size-13 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer backdrop-blur-[2px]"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Bottom: Progress line + slide dots */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        {/* Animated progress line */}
        <div className="relative h-[2px] bg-white/10">
          <motion.div
            key={currentSlide}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#d4af37] to-[#d4af37]"
          />
        </div>

        {/* Slide indicator dots (below line) */}
        <div className="flex justify-center gap-3 py-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideClick(index)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                index === currentSlide ? "w-8 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
