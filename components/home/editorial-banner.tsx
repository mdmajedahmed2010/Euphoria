/**
 * Euphoria — Editorial Banner (Premium v2.0)
 * Full-width lifestyle image with text overlay
 * Design Guide: Between product sections for visual break
 */

import Link from "next/link";

export function EditorialBanner() {
  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-surface-warm">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2c2420] via-[#3d3028] to-[#2c2420]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(201,169,110,0.1),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-lg text-center mx-auto reveal">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37] font-medium mb-4">
              Eid Collection 2026
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-[42px] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-4">
              Celebrate in
              <br />
              <span className="italic font-normal">Style</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mb-6 sm:mb-8 max-w-sm mx-auto">
              Discover our exclusive Eid collection — premium fabrics, intricate embroidery, and
              timeless elegance.
            </p>
            <Link
              href="/collections/organza-luxury-suits"
              className="inline-flex items-center justify-center h-11 px-8 border border-white/40 text-white text-xs sm:text-sm font-medium tracking-wide hover:bg-white hover:text-black transition-all duration-300 rounded-sm"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
