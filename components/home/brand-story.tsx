"use client";

/**
 * Euphoria — Brand Story Component
 * Euphoria | Authentic Pakistani Luxury Suits & Designer Collections
 */

import Link from "next/link";
import Image from "next/image";

export function BrandStory() {
  return (
    <section className="bg-[#faf7f2] border-t border-[#0a0a0a]/15 py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Photo */}
          <div className="lg:col-span-6 relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] rounded-sm overflow-hidden shadow-sm group reveal">
            <Image
              src="/images/Euphoria/image.jpg"
              alt="Euphoria — Authentic Pakistani Luxury Suits"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Gold accent overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />
            {/* Heritage badge */}
            <div className="absolute bottom-5 left-5 bg-[#0a0a0a]/85 backdrop-blur-sm border border-[#d4af37]/40 px-4 py-2.5 rounded-sm">
              <p className="text-[#d4af37] text-[9px] uppercase tracking-[0.25em] font-bold">Euphoria</p>
              <p className="text-white text-xs font-semibold mt-0.5">Elephant Road, Dhaka</p>
            </div>
          </div>

          {/* Right Side: Brand Narrative */}
          <div className="lg:col-span-6 space-y-6 lg:pl-8 reveal [transition-delay:200ms]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#0a0a0a] font-bold">
              আমাদের গল্প • Our Story
            </p>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-[#1a0008] font-heading">
              Authentic Pakistani Elegance,
              <br />
              <span className="italic font-normal text-[#0a0a0a]/80">Curated for Bangladesh</span>
            </h2>

            <div className="border-l-2 border-[#d4af37]/50 pl-4 py-1 text-[#0a0a0a]/80 italic text-sm">
              &ldquo;Euphoria brings exclusive authentic Pakistani luxury 3-piece suits, organza, embroidered chiffon, and designer lawn collections to fashion lovers across Bangladesh.&rdquo;
            </div>

            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Euphoria বাংলাদেশের ফ্যাশনপ্রিয় নারীদের জন্য আসল পাকিস্তানি প্রিমিয়াম ড্রেস ও ডিজাইনার কালেকশনের বিশ্বাসযোগ্য নাম। আমাদের প্রিমিয়াম অরেঞ্জা, এম্ব্রয়ডার্ড শিফন এবং ডিজিটাল লন কালেকশন আপনাকে দেয় রাজকীয় পোশাকের অনুভূতি।
              </p>
              <p>
                ঈদ, গায়ে হলুদ, রিসেপশন কিংবা যেকোনো বিশেষ পার্টি — আমাদের থ্রি-পিস ড্রেসগুলো সরাসরি ফেসবুক ইনবক্সের মাধ্যমে অর্ডার করে ঘরে বসেই ক্যাশ অন ডেলিভারিতে পেতে পারেন।
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-[#d4af37]/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0a0a0a]">52K+</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Followers</p>
              </div>
              <div className="text-center border-x border-[#d4af37]/20">
                <p className="text-2xl font-bold text-[#0a0a0a]">100%</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Recommend</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0a0a0a]">100%</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Authentic</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center justify-center h-12 px-8 bg-[#0a0a0a] text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 rounded-sm shadow-luxury hover:shadow-gold-glow border border-[#d4af37]/40 active:scale-[0.98]"
              >
                আমাদের সম্পর্কে জানুন →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
