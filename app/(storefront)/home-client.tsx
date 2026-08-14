/* eslint-disable */
"use client";

/**
 * Euphoria — Home UI Orchestrator
 * Euphoria | Authentic Jewellery
 * All images served locally from /public/euphoria/
 */

import { HeroSlider, type HeroSlide } from "@/components/home/hero-slider";
import { TrustBadges } from "@/components/home/trust-badges";
import { CategoryGrid, type CategoryItem } from "@/components/home/category-grid";
import { NewArrivalsGrid, type ArrivalsProduct } from "@/components/home/new-arrivals-grid";
import { LookbookSection, type LookbookLook } from "@/components/home/lookbook-section";
import { CollectionsShowcase, type CollectionShowcaseItem } from "@/components/home/collections-showcase";
import { TestimonialsCarousel, type Testimonial } from "@/components/home/testimonials-carousel";
import { EditorialSection } from "@/components/home/editorial-section";
import { ASSETS } from "@/lib/demo-data";

/* ──────────────── Static Data — Euphoria ──────────────── */

// Hero slides featuring local brand images
const heroSlides: HeroSlide[] = [
  {
    image: ASSETS.banner,
    title: "EXQUISITE AUTHENTIC JEWELLERY",
    subtitle:
      "Dressing well is a form of good manners. Discover our premium Kundan, Polki, and Pearl collections.",
    link: "/collections/kundan-bridal-sets",
    overline: "EUPHORIA EXCLUSIVE",
    color: "from-black/80",
  },
  {
    image: ASSETS.heroImage,
    title: "ROYAL KUNDAN & POLKI BRIDAL SETS",
    subtitle:
      "Heavy traditional bridal jewelry sets. Delivery charges vary based on location.",
    link: "/collections/bridal-couture-2026",
    overline: "BRIDAL EDITION",
    color: "from-[#0a1a1f]/80", // Dark turquoise hint
  },
  {
    image: ASSETS.img2,
    title: "ELEGANT PEARL & STONE NECKLACES",
    subtitle:
      "Timeless pearl jewelry and long chains for your festive occasions.",
    link: "/collections/pearl-elegance",
    overline: "FESTIVE SPECIAL",
    color: "from-[#1a1508]/80", // Dark gold hint
  }
];

// Verified Customer Reviews
const testimonials: Testimonial[] = [
  {
    quote:
      "Euphoria-এর Kundan ব্রাইডাল চকারটা হাতে পেয়ে আমি জাস্ট অভিভূত! কোয়ালিটি এবং ডিটেইলিং অবিকল ছবির মত। মিরপুর থেকে ১ দিনেই ডেলিভারি পেয়েছি!",
    author: "Tazreen Nahar",
    designation: "Verified Buyer — Dhanmondi, Dhaka",
    stars: 5,
  },
  {
    quote:
      "ট্র্যাডিশনাল জুয়েলারি কিনতে আমি সবসময় Euphoria কেই ট্রাস্ট করি। Polki সেটটা বিয়ের অনুষ্ঠানে সবাই অনেক পছন্দ করেছে। ১০০% অথেন্টিক কালেকশন!",
    author: "Nusrat Jahan",
    designation: "Verified Buyer — Chattogram",
    stars: 5,
  },
  {
    quote:
      "ইনবক্সে খুব দ্রুত রেসপন্স করেছে এবং প্যাকেজিং খুব সুন্দর ছিল। Euphoria সত্যিই প্রিমিয়াম কোয়ালিটি প্রদান করে।",
    author: "Farhana Sharmin",
    designation: "Verified Buyer — Uttara, Dhaka",
    stars: 5,
  },
  {
    quote:
      "Dressing well is a form of good manners - কথাটি এদের জুয়েলারির ক্ষেত্রে ১০০% সত্যি! ফিনিশিং দারুণ। বন্ধুদের সবাইকে রেকমেন্ড করেছি।",
    author: "Sabrina Yeasmin",
    designation: "Verified Buyer — Sylhet",
    stars: 5,
  },
];

/* ──────────────── Main Component ──────────────── */

export function HomeUI({
  dbProducts,
  dbCategories,
}: {
  dbProducts: any[];
  dbCategories: any[];
}) {
  // Local asset images for categories
  const localCategoryImages: string[] = [
    ASSETS.img1,
    ASSETS.img2,
    ASSETS.img6,
    ASSETS.img4,
    ASSETS.img13,
    ASSETS.img14,
  ];

  /* ── Map DB categories OR use Euphoria defaults ── */
  const defaultCategories: CategoryItem[] = [
    {
      name: "Kundan Bridal Sets",
      slug: "kundan-bridal-sets",
      productCount: 4,
      image: ASSETS.img1,
    },
    {
      name: "Polki Necklaces",
      slug: "polki-necklaces",
      productCount: 3,
      image: ASSETS.img2,
    },
    {
      name: "Pearl Jewellery",
      slug: "pearl-jewellery",
      productCount: 3,
      image: ASSETS.img6,
    },
    {
      name: "Long Chains",
      slug: "long-chains",
      productCount: 2,
      image: ASSETS.img14,
    },
    {
      name: "Choker Sets",
      slug: "choker-sets",
      productCount: 2,
      image: ASSETS.img13,
    },
  ];

  const mappedCategories: CategoryItem[] =
    dbCategories && dbCategories.length > 0
      ? dbCategories.map((c: any, i: number) => ({
          name: c.name,
          slug: c.slug,
          productCount: c._count?.products ?? 0,
          image: c.image || localCategoryImages[i % localCategoryImages.length],
        }))
      : defaultCategories;

  /* ── Map DB products OR use Euphoria defaults ── */
  const defaultProducts: ArrivalsProduct[] = [
    {
      id: "euph-001",
      name: "Emerald Drop Heavy Kundan Bridal Choker",
      slug: "emerald-drop-heavy-kundan-bridal-choker",
      category: "Kundan Bridal Sets",
      price: 35000,
      compareAtPrice: 42000,
      image: ASSETS.img1,
      tag: "BESTSELLER",
    },
    {
      id: "euph-002",
      name: "Royal Polki & Pearl Multilayer Necklace",
      slug: "royal-polki-pearl-multilayer-necklace",
      category: "Polki Necklaces",
      price: 28500,
      compareAtPrice: 32000,
      image: ASSETS.img2,
      tag: "NEW",
    },
    {
      id: "euph-003",
      name: "Ruby Accent Traditional Antique Necklace",
      slug: "ruby-accent-traditional-antique-necklace",
      category: "Kundan Bridal Sets",
      price: 24000,
      compareAtPrice: 28000,
      image: ASSETS.img3,
      tag: "EXCLUSIVE",
    },
    {
      id: "euph-004",
      name: "Classic Authentic Pearl Strand Set",
      slug: "classic-authentic-pearl-strand-set",
      category: "Pearl Jewellery",
      price: 18000,
      compareAtPrice: 21000,
      image: ASSETS.img4,
      tag: "FESTIVE",
    },
    {
      id: "euph-005",
      name: "Navratna Style Festive Kundan Necklace",
      slug: "navratna-style-festive-kundan-necklace",
      category: "Kundan Bridal Sets",
      price: 22500,
      compareAtPrice: 26000,
      image: ASSETS.img5,
      tag: "PARTY WEAR",
    },
    {
      id: "euph-006",
      name: "Golden Polki Detailed Bridal Choker",
      slug: "golden-polki-detailed-bridal-choker",
      category: "Polki Necklaces",
      price: 32000,
      compareAtPrice: 38000,
      image: ASSETS.img6,
      tag: "BRIDAL",
    },
    {
      id: "euph-008",
      name: "Antique Gold Plated Long Rani Haar",
      slug: "antique-gold-plated-long-rani-haar",
      category: "Long Chains",
      price: 29000,
      compareAtPrice: 34000,
      image: ASSETS.img8,
      tag: "LUXURY",
    },
    {
      id: "euph-013",
      name: "Sapphire & Kundan Statement Choker",
      slug: "sapphire-kundan-statement-choker",
      category: "Choker Sets",
      price: 38500,
      compareAtPrice: 45000,
      image: ASSETS.img13,
      tag: "NEW",
    },
  ];

  const mappedProducts: ArrivalsProduct[] =
    dbProducts && dbProducts.length > 0
      ? dbProducts.map((p: any) => {
          const img =
            p.variants?.[0]?.images?.[0] || ASSETS.img1;
          const pPrice = Number(p.variants?.[0]?.price ?? p.basePrice);
          return {
            id: p.id,
            name: p.name,
            category: p.category?.name || "Authentic Jewellery",
            price: pPrice,
            compareAtPrice: Math.round(pPrice * 1.15),
            image: img,
            slug: p.slug,
          };
        })
      : defaultProducts;

  /* ── Lookbook section ── */
  const lookbookLooks: LookbookLook[] = [
    {
      id: "lb-1",
      image: ASSETS.img1,
      title: "Royal Kundan Choker",
      subtitle: "Emerald Drop Heavy Kundan Bridal Choker",
      slug: "emerald-drop-heavy-kundan-bridal-choker",
      price: 35000,
      tag: "BRIDAL EXCLUSIVE",
    },
    {
      id: "lb-2",
      image: ASSETS.img8,
      title: "Temple Antique Jewellery",
      subtitle: "Antique Gold Plated Long Rani Haar",
      slug: "antique-gold-plated-long-rani-haar",
      price: 29000,
      tag: "ANTIQUE COLLECTION",
    },
    {
      id: "lb-3",
      image: ASSETS.img13,
      title: "Sapphire Elegance",
      subtitle: "Sapphire & Kundan Statement Choker",
      slug: "sapphire-kundan-statement-choker",
      price: 38500,
      tag: "STATEMENT PIECE",
    },
  ];

  /* ── Collections showcase ── */
  const allCollections: CollectionShowcaseItem[] = [
    {
      title: "Kundan Bridal Sets",
      image: ASSETS.img1,
      href: "/collections/kundan-bridal-sets",
      tag: "ROYAL HERITAGE",
    },
    {
      title: "Polki Necklaces",
      image: ASSETS.img2,
      href: "/collections/polki-necklaces",
      tag: "UNCUT DIAMOND",
    },
    {
      title: "Pearl Jewellery",
      image: ASSETS.img6,
      href: "/collections/pearl-jewellery",
      tag: "TIMELESS ELEGANCE",
    },
    {
      title: "Long Chains",
      image: ASSETS.img14,
      href: "/collections/long-chains",
      tag: "RANI HAAR",
    },
    {
      title: "Choker Sets",
      image: ASSETS.img13,
      href: "/collections/choker-sets",
      tag: "STATEMENT NECKPIECE",
    }
  ];

  return (
    <div className="flex flex-col bg-background overflow-hidden">
      {/* 1. HERO — Eager loaded */}
      <HeroSlider slides={heroSlides} />

      {/* 2. TRUST BADGES — Lightweight */}
      <TrustBadges />

      {/* 3. CATEGORY GRID */}
      <CategoryGrid categories={mappedCategories} />

      {/* 4. NEW ARRIVALS */}
      <NewArrivalsGrid products={mappedProducts} />

      {/* 5. LOOKBOOK */}
      <LookbookSection looks={lookbookLooks} />

      {/* 6. ALL COLLECTIONS */}
      <CollectionsShowcase collections={allCollections} />

      {/* 7. TESTIMONIALS */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* 8. EDITORIAL / BRAND STORY */}
      <EditorialSection />
    </div>
  );
}
