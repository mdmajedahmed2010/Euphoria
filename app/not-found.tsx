/**
 * Euphoria — 404 Not Found Page
 * Euphoria | Authentic Jewellery
 */

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="text-center space-y-8 max-w-lg">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-accent/30 shadow-lg">
            <Image
              src="/euphoria/logo.jpg"
              alt="Euphoria"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-3">
          <p className="text-8xl md:text-9xl font-bold text-muted leading-none">404</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            পেজটি পাওয়া যাচ্ছে না
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            দুঃখিত, আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে বা আর নেই। আমাদের হোম পেজে ফিরে যান।
          </p>
        </div>

        {/* Brand Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-accent/20">
          <span className="text-accent text-xs">✦</span>
          <p className="text-[11px] text-primary font-medium tracking-wide">
            Euphoria — Authentic Premium Jewellery
          </p>
          <span className="text-accent text-xs">✦</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 rounded-sm bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-sm active:scale-[0.98] tracking-wide"
          >
            হোম পেজে যান
          </Link>
          <Link
            href="/collections/kundan-bridal-sets"
            className="inline-flex items-center justify-center h-12 px-6 rounded-sm border-2 border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 hover:border-primary transition-all tracking-wide"
          >
            কালেকশন দেখুন
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/about" className="hover:text-primary transition-colors font-medium">
            About Us
          </Link>
          <span className="text-accent">·</span>
          <Link href="/contact" className="hover:text-primary transition-colors font-medium">
            Contact Us
          </Link>
          <span className="text-accent">·</span>
          <a
            href="https://www.facebook.com/Euphoria2222"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors font-medium"
          >
            Facebook Page
          </a>
        </div>
      </div>
    </div>
  );
}
