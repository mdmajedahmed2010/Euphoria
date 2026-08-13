/**
 * Euphoria 2 — Demo Product Data & Catalog
 * Euphoria | Authentic Jewellery
 * All images served locally from /public/euphoria/
 */

import type { ProductCardProps } from "@/components/product/product-card";

// ═══════════════════════════════════════════
// Asset image paths (local, /public/euphoria/)
// ═══════════════════════════════════════════
export const ASSETS = {
  logo: "/euphoria/logo.jpg",
  banner: "/euphoria/banner.jpg",
  heroImage: "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg",
  img1: "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg",
  img2: "/euphoria/766953023_2186460245228415_4551314285155222007_n.jpg",
  img3: "/euphoria/768310237_1712816456673993_6849973324518527495_n.jpg",
  img4: "/euphoria/768398770_1045991788216535_288517747382675700_n.jpg",
  img5: "/euphoria/768432871_1914967766556133_3751784928365785225_n.jpg",
  img6: "/euphoria/769222217_1365468228389531_1251425921139694609_n.jpg",
  img7: "/euphoria/770587570_2073586856617335_3551151057027433152_n.jpg",
  img8: "/euphoria/771708723_28107443852277973_5499577680126141710_n.jpg",
  img9: "/euphoria/771821230_1583238333404917_7863217094968182891_n.jpg",
  img10: "/euphoria/772170902_2000269963904714_7559423604021220344_n.jpg",
  img11: "/euphoria/772521622_1691137395278430_6218123870385087042_n.jpg",
  img12: "/euphoria/772868621_1551292096733143_932464586131893099_n.jpg",
  img13: "/euphoria/772978487_1332257145332271_6743125412296380938_n.jpg",
  img14: "/euphoria/773724287_1364533438546734_5029064412872943930_n.jpg",
};

// ═══════════════════════════════════════════
// Product Categories — Euphoria
// ═══════════════════════════════════════════
export const CATEGORIES = [
  {
    name: "Kundan Bridal Sets",
    slug: "kundan-bridal-sets",
    description: "Opulent bridal jewelry featuring authentic Kundan craftsmanship and heavy detailing.",
    image: ASSETS.img1,
    productCount: 4,
  },
  {
    name: "Polki Necklaces",
    slug: "polki-necklaces",
    description: "Uncut diamond polki sets for a royal and traditional look.",
    image: ASSETS.img2,
    productCount: 3,
  },
  {
    name: "Pearl Jewellery",
    slug: "pearl-jewellery",
    description: "Elegant and timeless pearl necklaces and drops.",
    image: ASSETS.img6,
    productCount: 3,
  },
  {
    name: "Long Chains",
    slug: "long-chains",
    description: "Multi-layered long necklaces and rani haars.",
    image: ASSETS.img14,
    productCount: 2,
  },
  {
    name: "Choker Sets",
    slug: "choker-sets",
    description: "Snug-fitting bridal and party wear choker necklaces.",
    image: ASSETS.img13,
    productCount: 2,
  },
];

// ═══════════════════════════════════════════
// Collections — Featured Curations
// ═══════════════════════════════════════════
export const FEATURED_COLLECTIONS = [
  {
    id: "col-bridal-2026",
    title: "Bridal Couture 2026",
    slug: "bridal-couture-2026",
    subtitle: "Exclusive Kundan & Polki Sets for the Bride",
    image: ASSETS.img1,
    itemCount: 8,
  },
  {
    id: "col-pearl-elegance",
    title: "Pearl Elegance",
    slug: "pearl-elegance",
    subtitle: "Timeless authentic pearl jewelry for all occasions",
    image: ASSETS.img6,
    itemCount: 5,
  },
  {
    id: "col-festive-glam",
    title: "Festive Glamour",
    slug: "festive-glamour",
    subtitle: "Statement jewelry to elevate your party wear",
    image: ASSETS.img10,
    itemCount: 6,
  },
];

// ═══════════════════════════════════════════
// All Products — Euphoria Catalog
// ═══════════════════════════════════════════
export const ALL_PRODUCTS: ProductCardProps[] = [
  {
    id: "euph-001",
    name: "Emerald Drop Heavy Kundan Bridal Choker",
    slug: "emerald-drop-heavy-kundan-bridal-choker",
    price: 35000,
    compareAtPrice: 42000,
    image: ASSETS.img1,
    category: "Kundan Bridal Sets",
    isNew: true,
  },
  {
    id: "euph-002",
    name: "Royal Polki & Pearl Multilayer Necklace",
    slug: "royal-polki-pearl-multilayer-necklace",
    price: 28500,
    compareAtPrice: 32000,
    image: ASSETS.img2,
    category: "Polki Necklaces",
    isNew: true,
  },
  {
    id: "euph-003",
    name: "Ruby Accent Traditional Antique Necklace",
    slug: "ruby-accent-traditional-antique-necklace",
    price: 24000,
    compareAtPrice: 28000,
    image: ASSETS.img3,
    category: "Kundan Bridal Sets",
  },
  {
    id: "euph-004",
    name: "Classic Authentic Pearl Strand Set",
    slug: "classic-authentic-pearl-strand-set",
    price: 18000,
    compareAtPrice: 21000,
    image: ASSETS.img4,
    category: "Pearl Jewellery",
  },
  {
    id: "euph-005",
    name: "Navratna Style Festive Kundan Necklace",
    slug: "navratna-style-festive-kundan-necklace",
    price: 22500,
    compareAtPrice: 26000,
    image: ASSETS.img5,
    category: "Kundan Bridal Sets",
    isNew: true,
  },
  {
    id: "euph-006",
    name: "Golden Polki Detailed Bridal Choker",
    slug: "golden-polki-detailed-bridal-choker",
    price: 32000,
    compareAtPrice: 38000,
    image: ASSETS.img6,
    category: "Polki Necklaces",
    isNew: true,
  },
  {
    id: "euph-007",
    name: "Elegant Drop Pearl Party Necklace",
    slug: "elegant-drop-pearl-party-necklace",
    price: 15500,
    compareAtPrice: 18000,
    image: ASSETS.img7,
    category: "Pearl Jewellery",
  },
  {
    id: "euph-008",
    name: "Antique Gold Plated Long Rani Haar",
    slug: "antique-gold-plated-long-rani-haar",
    price: 29000,
    compareAtPrice: 34000,
    image: ASSETS.img8,
    category: "Long Chains",
  },
  {
    id: "euph-009",
    name: "Heavy Bridal Polki & Emerald Set",
    slug: "heavy-bridal-polki-emerald-set",
    price: 45000,
    compareAtPrice: 52000,
    image: ASSETS.img9,
    category: "Polki Necklaces",
    isNew: true,
  },
  {
    id: "euph-010",
    name: "Minimalist Kundan Office Wear Set",
    slug: "minimalist-kundan-office-wear-set",
    price: 12000,
    compareAtPrice: 15000,
    image: ASSETS.img10,
    category: "Kundan Bridal Sets",
  },
  {
    id: "euph-011",
    name: "Exquisite White Pearl Choker",
    slug: "exquisite-white-pearl-choker",
    price: 21000,
    compareAtPrice: 24500,
    image: ASSETS.img11,
    category: "Choker Sets",
  },
  {
    id: "euph-012",
    name: "South Indian Style Temple Jewelry Chain",
    slug: "south-indian-style-temple-jewelry-chain",
    price: 36000,
    compareAtPrice: 40000,
    image: ASSETS.img12,
    category: "Long Chains",
  },
  {
    id: "euph-013",
    name: "Sapphire & Kundan Statement Choker",
    slug: "sapphire-kundan-statement-choker",
    price: 38500,
    compareAtPrice: 45000,
    image: ASSETS.img13,
    category: "Choker Sets",
    isNew: true,
  },
  {
    id: "euph-014",
    name: "Premium Multi-Layer Pearl Haram",
    slug: "premium-multi-layer-pearl-haram",
    price: 31000,
    compareAtPrice: 36000,
    image: ASSETS.img14,
    category: "Pearl Jewellery",
  },
];

// ═══════════════════════════════════════════
// Filtered Helper Collections
// ═══════════════════════════════════════════
export const NEW_ARRIVALS = ALL_PRODUCTS.filter((p) => p.isNew);
export const FEATURED_PRODUCTS = ALL_PRODUCTS.slice(0, 8);
export const KUNDAN_PRODUCTS = ALL_PRODUCTS.filter((p) => p.category === "Kundan Bridal Sets");
export const POLKI_PRODUCTS = ALL_PRODUCTS.filter((p) => p.category === "Polki Necklaces");
export const PEARL_PRODUCTS = ALL_PRODUCTS.filter((p) => p.category === "Pearl Jewellery");

// Helper to filter by category slug
export function getProductsByCategory(slug: string): ProductCardProps[] {
  switch (slug) {
    case "kundan-bridal-sets":
      return KUNDAN_PRODUCTS;
    case "polki-necklaces":
      return POLKI_PRODUCTS;
    case "pearl-jewellery":
      return PEARL_PRODUCTS;
    case "long-chains":
      return ALL_PRODUCTS.filter((p) => p.category === "Long Chains");
    case "choker-sets":
      return ALL_PRODUCTS.filter((p) => p.category === "Choker Sets");
    case "new-arrivals":
      return NEW_ARRIVALS;
    case "featured":
      return FEATURED_PRODUCTS;
    default:
      return ALL_PRODUCTS;
  }
}
