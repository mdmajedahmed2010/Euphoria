"use client";

/**
 * Euphoria — Product Images Gallery (Premium Clean v3.0)
 * Large editorial image, vertical thumbnail strip, fullscreen lightbox.
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImagesProps {
  images: string[];
  productName: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const selectedImage = images[selectedIndex] ?? images[0] ?? "";

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isLightboxOpen]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLightboxOpen, handleNext, handlePrev]);

  return (
    <div className="w-full">
      {/* ── Desktop Layout: Thumbs Left + Main Right ── */}
      <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">

        {/* Vertical Thumbnail Strip (desktop) */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-2 w-[76px] shrink-0">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-full aspect-[3/4] overflow-hidden bg-neutral-100 transition-all duration-200 cursor-pointer border-2 ${
                  selectedIndex === index
                    ? "border-neutral-900 opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80 hover:border-neutral-300"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  fill
                  sizes="80px"
                  quality={90}
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="flex-1 relative">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-neutral-50 cursor-zoom-in group border border-neutral-100"
          >
            <Image
              src={selectedImage}
              alt={`${productName} — main view`}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              quality={100}
              unoptimized
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />

            {/* Zoom hint */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 text-neutral-700 text-[10px] font-bold uppercase tracking-widest">
              <ZoomIn className="h-3 w-3" />
              <span>Zoom</span>
            </div>

            {/* Navigation arrows on image (mobile) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-white/90 border border-neutral-200 shadow-sm text-neutral-700 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-white/90 border border-neutral-200 shadow-sm text-neutral-700 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile: dot indicators */}
          {images.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-2 mt-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === selectedIndex ? "w-6 bg-neutral-900" : "w-1.5 bg-neutral-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Full-Screen Lightbox ── */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 bg-black/96 z-[99999] flex items-center justify-center p-4 md:p-8"
        >
          {/* Close */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 h-11 w-11 flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Prev/Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 md:left-8 h-12 w-12 flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 md:right-8 h-12 w-12 flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl h-[80vh]"
          >
            <Image
              src={selectedImage}
              alt={`${productName} full view`}
              fill
              className="object-contain"
              sizes="100vw"
              quality={100}
              unoptimized
              priority
            />
          </div>

          {/* Counter */}
          <p className="absolute bottom-6 text-white/40 text-xs font-bold tracking-widest uppercase">
            {selectedIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
