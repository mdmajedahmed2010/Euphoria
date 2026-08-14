"use client";

/**
 * Euphoria — Footer Component
 * Euphoria | Authentic Jewellery
 */

import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const shopLinks = [
  { href: "/collections/kundan-bridal-sets", label: "Kundan Bridal Sets" },
  { href: "/collections/polki-necklaces", label: "Polki Necklaces" },
  { href: "/collections/pearl-jewellery", label: "Pearl Jewellery" },
  { href: "/collections/long-chains", label: "Long Chains" },
  { href: "/collections/choker-sets", label: "Choker Sets" },
];

const helpLinks = [
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact Us" },
  { href: "/refund-policy", label: "Refund & Exchange Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/about", label: "About Us" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Footer({ settings = {} }: { settings?: Record<string, any> }) {
  return (
    <footer className="bg-background border-t border-border">
      {/* Brand Newsletter Section */}
      <div className="bg-neutral-900 text-white py-14 md:py-18 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, #c9a43c 0%, transparent 60%)'}} />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-3 text-center md:text-left max-w-lg">
              <span className="inline-block px-3 py-1 border border-white/20 text-white/70 text-[9.5px] uppercase tracking-[0.28em] font-bold">
                Euphoria Client Circle
              </span>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight font-serif">
                Join Euphoria VIPs
              </h3>
              <p className="text-sm text-white/60 leading-relaxed font-sans">
                Get early access to new arrivals, exclusive drops, and special discounts.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("ধন্যবাদ! আপনাকে Euphoria পরিবারে স্বাগতম!");
              }}
              className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch max-w-md shrink-0"
            >
              <input
                type="email"
                required
                placeholder="আপনার ইমেইল ঠিকানা লিখুন"
                className="h-12 px-5 bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-white/60 w-full sm:w-72 transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-7 bg-[#c9a43c] hover:bg-[#b8932b] text-black text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={typeof settings.store_logo === "string" && settings.store_logo ? settings.store_logo : "/euphoria/logo.jpg"}
                alt="Euphoria"
                width={48}
                height={48}
                className="h-12 w-12 object-cover rounded-full ring-2 ring-accent/40"
              />
              <div>
                <p className="text-[13px] font-extrabold text-primary uppercase tracking-wide">
                  Euphoria
                </p>
                <p className="text-[10px] text-primary/70 font-medium">Authentic Jewellery</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A haven for jewelry lovers. Premium quality traditional wear, exclusive Kundan sets, and elegant accessories in Mirpur, Dhaka.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href={settings.social_facebook || "https://www.facebook.com/Euphoria2222"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold"
                aria-label="Facebook Page"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook Page</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-4">
              কালেকশনসমূহ
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-4">
              গ্রাহক সেবা
            </h4>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-4">
              যোগাযোগ করুন
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-2 text-sm text-muted-foreground group">
                  <span className="flex items-center justify-center size-8 rounded-full bg-neutral-100 group-hover:bg-foreground group-hover:text-background transition-colors shrink-0">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <a 
                    href={`tel:${settings.store_phone || "+8801741-875914"}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {settings.store_phone || "+880 1741-875914"}
                  </a>
                </li>
              <li>
                <a
                  href={`mailto:${settings.store_email || "info@euphoria.com"}`}
                  className="hover:text-primary transition-colors"
                >
                  {settings.store_email || "info@euphoria.com"}
                </a>
              </li>
              <li className="leading-relaxed pt-1 text-[12px]">
                {settings.store_address || "Mirpur, Dhaka, Bangladesh"}
              </li>
              <li className="pt-1">
                <a
                  href={"https://www.facebook.com/Euphoria2222"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Facebook Inbox order
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} Euphoria. All rights reserved.</p>
          <p>
            Cash on Delivery&nbsp;|&nbsp;Dhaka: ৳{settings.shipping_dhaka || 80}&nbsp;|&nbsp;
            Outside: ৳{settings.shipping_outside || 150}&nbsp;|&nbsp;100% Authentic Guaranteed
          </p>
        </div>
      </div>
    </footer>
  );
}
