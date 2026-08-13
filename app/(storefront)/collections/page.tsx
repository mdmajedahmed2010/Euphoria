/**
 * Euphoria — All Collections Page (Clean v2.0)
 * Route: /collections
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/lib/demo-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Collections — Euphoria Jewellery",
  description:
    "Explore Euphoria's curated jewellery collections — Kundan Bridal Sets, Polki Necklaces, Pearl Jewellery, Long Chains, Choker Sets & more. Cash on delivery across Bangladesh.",
};

// Euphoria's jewellery collections
const CURATED_COLLECTIONS = [
  {
    title: "Kundan Bridal Sets",
    image: "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg",
    href: "/collections/kundan-bridal-sets",
    tag: "BRIDAL COUTURE",
    desc: "Exquisite Kundan jewelry with meticulous handcrafted detailing — perfect for weddings & festive celebrations.",
  },
  {
    title: "Polki Necklaces",
    image: "/euphoria/766953023_2186460245228415_4551314285155222007_n.jpg",
    href: "/collections/polki-necklaces",
    tag: "ROYAL POLKI",
    desc: "Timeless uncut diamond Polki sets crafted in the Mughal tradition — a statement for brides & connoisseurs.",
  },
  {
    title: "Pearl Jewellery",
    image: "/euphoria/769222217_1365468228389531_1251425921139694609_n.jpg",
    href: "/collections/pearl-jewellery",
    tag: "PEARL ELEGANCE",
    desc: "Elegant authentic pearl necklaces — lustrous, hand-selected, lightweight. Perfect for every occasion.",
  },
  {
    title: "Long Chains",
    image: "/euphoria/773724287_1364533438546734_5029064412872943930_n.jpg",
    href: "/collections/long-chains",
    tag: "RANI HAAR",
    desc: "Multi-layered long chains & rani haars — versatile statement pieces for traditional & fusion wear.",
  },
  {
    title: "Choker Sets",
    image: "/euphoria/772978487_1332257145332271_6743125412296380938_n.jpg",
    href: "/collections/choker-sets",
    tag: "CHOKER COLLECTION",
    desc: "Regal choker necklaces that frame the face beautifully — ideal for bridal & grand festive occasions.",
  },
  {
    title: "New Arrivals",
    image: "/euphoria/771821230_1583238333404917_7863217094968182891_n.jpg",
    href: "/collections/new-arrivals",
    tag: "LATEST DROPS",
    desc: "Our freshest pieces — new additions to the Euphoria jewellery catalog every week.",
  },
];

export default async function CollectionsPage() {
  // Fetch DB categories, fallback to demo
  let categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (categories.length === 0) {
    categories = CATEGORIES.map((cat, i) => ({
      id: `demo-cat-${i}`,
      name: cat.name,
      slug: cat.slug,
      parentId: null,
      image: cat.image,
      sortOrder: i,
      isActive: true,
      seoTitle: null,
      seoDesc: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="container mx-auto px-4 md:px-8 py-3 max-w-7xl">
          <Breadcrumb items={[{ label: "All Collections" }]} />
        </div>
      </div>

      {/* Page Header */}
      <div className="border-b border-neutral-100 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-7xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9a43c] mb-3">
            ✦ Euphoria Curations ✦
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 font-serif mb-4">
            All Collections
          </h1>
          <div className="w-10 h-[2px] bg-[#c9a43c] mx-auto mb-4" />
          <p className="text-neutral-500 text-sm md:text-base max-w-lg mx-auto">
            Discover our curated jewellery edits — from bridal Kundan sets to elegant pearl collections.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-16">
          {CURATED_COLLECTIONS.map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className="group relative overflow-hidden bg-neutral-900 block border border-neutral-200 hover:border-neutral-900 transition-all duration-300 aspect-[4/5]"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                <span className="inline-block px-2 py-0.5 bg-[#c9a43c]/20 border border-[#c9a43c]/40 text-[#c9a43c] text-[9px] uppercase tracking-[0.22em] font-bold mb-2.5">
                  ✦ {col.tag}
                </span>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-white mb-1.5 group-hover:text-[#c9a43c] transition-colors duration-300">
                  {col.title}
                </h2>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                  {col.desc}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[#c9a43c] uppercase tracking-widest font-bold group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Category Switcher */}
        <div className="border-t border-neutral-100 pt-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-neutral-900 font-serif">Shop by Category</h3>
            <Link
              href="/categories"
              className="text-xs uppercase tracking-widest font-bold text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200 text-xs font-semibold uppercase tracking-wider text-neutral-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
