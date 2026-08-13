"use client";

/**
 * Euphoria — Header Component
 * Euphoria | Authentic Jewellery
 */

import Link from "next/link";
import Image from "next/image";
import { User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { MobileNav } from "./mobile-nav";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { MegaMenu } from "../storefront/mega-menu";

const navLinks = [
  { href: "/collections/kundan-bridal-sets", label: "Kundan Sets" },
  { href: "/collections/polki-necklaces", label: "Polki Necklaces" },
  { href: "/collections/pearl-jewellery", label: "Pearl Jewellery" },
  { href: "/collections/long-chains", label: "Long Chains" },
  { href: "/collections/choker-sets", label: "Choker Sets" },
  { href: "/about", label: "About Us" },
];

const megaMenuData: Record<
  string,
  {
    categories: { label: string; href: string }[];
    styles: { label: string; href: string }[];
    featured: { title: string; subtitle: string; image: string; href: string };
  }
> = {
  "Kundan Sets": {
    categories: [
      { label: "Shop All Kundan Sets", href: "/collections/kundan-bridal-sets" },
      { label: "Heavy Bridal Kundan", href: "/collections/kundan-bridal-sets" },
      { label: "Navratna Style Kundan", href: "/collections/kundan-bridal-sets" },
    ],
    styles: [
      { label: "Kundan Chokers", href: "/collections/kundan-bridal-sets" },
      { label: "Minimalist Kundan", href: "/collections/kundan-bridal-sets" },
    ],
    featured: {
      title: "Royal Kundan Collection",
      subtitle: "Exquisite craftsmanship for your special day",
      image: "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg",
      href: "/collections/kundan-bridal-sets",
    },
  },
  "Polki Necklaces": {
    categories: [
      { label: "Shop All Polki", href: "/collections/polki-necklaces" },
      { label: "Uncut Diamond Polki", href: "/collections/polki-necklaces" },
    ],
    styles: [
      { label: "Bridal Polki Sets", href: "/collections/polki-necklaces" },
      { label: "Layered Polki Necklaces", href: "/collections/polki-necklaces" },
    ],
    featured: {
      title: "Heritage Polki",
      subtitle: "Timeless uncut diamond aesthetics",
      image: "/euphoria/766953023_2186460245228415_4551314285155222007_n.jpg",
      href: "/collections/polki-necklaces",
    },
  },
  "Pearl Jewellery": {
    categories: [
      { label: "Shop All Pearls", href: "/collections/pearl-jewellery" },
      { label: "Pearl Strand Sets", href: "/collections/pearl-jewellery" },
    ],
    styles: [
      { label: "Drop Pearl Necklaces", href: "/collections/pearl-jewellery" },
      { label: "Multi-Layer Pearl Haram", href: "/collections/pearl-jewellery" },
    ],
    featured: {
      title: "Pearl Elegance",
      subtitle: "Classic pearls for every occasion",
      image: "/euphoria/769222217_1365468228389531_1251425921139694609_n.jpg",
      href: "/collections/pearl-jewellery",
    },
  },
};

export function Header({ settings = {} }: { settings?: Record<string, unknown> }) {
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("euph_announcement_dismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => setShowAnnouncement(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissAnnouncement = () => {
    setShowAnnouncement(false);
    localStorage.setItem("euph_announcement_dismissed", "true");
  };

  const freeShippingThreshold = Number(settings.free_shipping_threshold || 15000);
  const announcementText =
    `✨ Euphoria — Authentic Jewellery | Free Express Delivery on orders over ৳${freeShippingThreshold.toLocaleString()} | Cash on Delivery Available`;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 border-b border-border shadow-sm transition-all duration-300">
      {/* Brand Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-primary text-primary-foreground border-b border-border text-center text-[9.5px] md:text-[10.5px] font-semibold tracking-[0.14em] md:tracking-[0.18em] uppercase py-2 md:py-2.5 px-6 relative">
          <p className="flex items-center justify-center gap-1.5 md:gap-2 truncate">
            <span className="text-accent shrink-0">✦</span>
            <span className="md:hidden truncate">Euphoria • CASH ON DELIVERY</span>
            <span className="hidden md:inline">{announcementText}</span>
            <span className="text-accent shrink-0">✦</span>
          </p>
          <button
            onClick={dismissAnnouncement}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
            aria-label="Close announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="relative">
        <div className="container mx-auto px-6 md:px-12 static">
          <div className="flex h-[72px] items-center justify-between">
            {/* Left: Mobile menu + Brand Logo + Name */}
            <div className="flex items-center gap-4">
              <MobileNav links={navLinks} />
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src={typeof settings?.store_logo === "string" && settings.store_logo ? settings.store_logo : "/euphoria/logo.jpg"}
                    alt="Euphoria"
                    width={44}
                    height={44}
                    className="h-11 w-11 object-cover rounded-full ring-2 ring-accent/40 group-hover:ring-accent transition-all duration-300"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-[13px] font-extrabold tracking-[0.08em] text-foreground leading-tight uppercase">
                    EUPHORIA
                  </p>
                  <p className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Authentic Jewellery
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 static" aria-label="Main navigation">
              {navLinks.map((link) => {
                const hasMegaMenu = link.label in megaMenuData;
                const menu = megaMenuData[link.label];

                if (hasMegaMenu && menu) {
                  return (
                    <MegaMenu key={link.href} label={link.label} href={link.href} data={menu} />
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    className="text-[12px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:text-primary py-6 block transition-colors relative after:absolute after:bottom-1.5 after:left-0 after:w-full after:h-[1.5px] after:bg-accent after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search + Cart + User */}
            <div className="flex items-center gap-1.5">
              <SearchBar />
              <CartButton />
              <Link
                href="/account"
                className="flex items-center justify-center size-10 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-all"
                aria-label="My account"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
