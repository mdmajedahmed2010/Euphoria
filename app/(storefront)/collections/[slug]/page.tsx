/**
 * Euphoria — Collection/Category Page (Premium Clean v2.0)
 * Route: /collections/[slug]
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/product/product-card";
import { CollectionFilters } from "@/components/product/collection-filters";
import { SortDropdown } from "@/components/product/sort-dropdown";
import { MobileFilterDrawer } from "@/components/product/mobile-filter-drawer";
import { getProducts } from "@/actions/product.actions";
import { prisma } from "@/lib/db";
import { CATEGORIES, getProductsByCategory } from "@/lib/demo-data";

export const revalidate = 60;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ size?: string | string[]; price?: string; sort?: string; q?: string }>;
}

// Jewellery-specific category descriptions
const CATEGORY_INFO: Record<string, { name: string; description: string }> = {
  "new-arrivals": {
    name: "New Arrivals",
    description: "Our freshest pieces — the newest additions to the Euphoria jewellery catalog.",
  },
  featured: {
    name: "Featured Collection",
    description: "Handpicked statement pieces curated by the Euphoria team.",
  },
  sale: {
    name: "Sale",
    description: "Special offers and festive discounts on authentic jewellery.",
  },
  "kundan-bridal-sets": {
    name: "Kundan Bridal Sets",
    description: "Exquisite Kundan bridal jewelry with meticulous handcrafted detailing — perfect for weddings & festive celebrations.",
  },
  "polki-necklaces": {
    name: "Polki Necklaces",
    description: "Timeless uncut diamond Polki sets crafted in the royal Mughal tradition. A statement piece for brides & connoisseurs.",
  },
  "pearl-jewellery": {
    name: "Pearl Jewellery",
    description: "Elegant authentic pearl necklaces — lustrous, hand-selected, and lightweight. Perfect for all occasions.",
  },
  "long-chains": {
    name: "Long Chains",
    description: "Stunning multi-layered long chains & rani haars. Versatile statement pieces for traditional & fusion wear.",
  },
  "choker-sets": {
    name: "Choker Sets",
    description: "Regal choker necklaces that frame the face beautifully — ideal for bridal wear, receptions & grand celebrations.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const special = CATEGORY_INFO[slug];
  if (special) {
    return {
      title: `${special.name} — Euphoria Jewellery`,
      description: special.description,
    };
  }

  let category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    const demoCat = CATEGORIES.find((c) => c.slug === slug);
    if (demoCat) category = { id: "demo", name: demoCat.name, slug: demoCat.slug } as any;
  }

  if (!category) return { title: "Collection Not Found — Euphoria" };

  return {
    title: `${category.name} — Euphoria Jewellery`,
    description: `Discover our ${category.name} collection — 100% authentic luxury jewellery in Bangladesh. Cash on delivery available.`,
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  let categoryName: string;
  let categoryDescription: string;
  let useFeaturedFilter = false;
  let useNewestSort = false;

  if (CATEGORY_INFO[slug]) {
    categoryName = CATEGORY_INFO[slug].name;
    categoryDescription = CATEGORY_INFO[slug].description;
    if (slug === "featured") useFeaturedFilter = true;
    if (slug === "new-arrivals") useNewestSort = true;
  } else {
    let category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      const demoCat = CATEGORIES.find((c) => c.slug === slug);
      if (demoCat) category = { id: "demo", name: demoCat.name, slug: demoCat.slug } as any;
    }
    if (!category) notFound();
    categoryName = category.name;
    categoryDescription = `Discover our ${category.name} collection — 100% authentic luxury jewellery. Cash on delivery available nationwide.`;
  }

  const sort = resolvedSearchParams.sort;
  let sortOrder = "newest";
  if (useNewestSort) sortOrder = "newest";
  if (sort === "price-low-high") sortOrder = "price-asc";
  if (sort === "price-high-low") sortOrder = "price-desc";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = { products: [] };
  try {
    result = await getProducts({
      categorySlug: CATEGORY_INFO[slug] ? undefined : slug,
      sort: sortOrder,
      pageSize: 48,
      isFeatured: useFeaturedFilter ? true : undefined,
    });
  } catch (e) {
    // Ignore DB errors — use demo data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = result.products || [];

  // Fallback to demo data
  if (products.length === 0) {
    const demoProducts = getProductsByCategory(slug);
    products = demoProducts.map((p) => ({
      ...p,
      basePrice: p.price,
      variants: [{ images: [p.image], price: p.price }],
      category: { name: p.category },
    }));
  }

  // Price filter
  const price = resolvedSearchParams.price;
  if (price && typeof price === "string") {
    const parts = price.split("-");
    const minVal = Number(parts[0]);
    const maxVal = Number(parts[1]);
    if (!isNaN(minVal) && !isNaN(maxVal)) {
      products = products.filter((p) => {
        const productPrice = Number(p.basePrice);
        return productPrice >= minVal && productPrice <= maxVal;
      });
    }
  }

  // Size filter
  const sizeParam = resolvedSearchParams.size;
  if (sizeParam) {
    const selectedSizes = Array.isArray(sizeParam) ? sizeParam : [sizeParam];
    if (selectedSizes.length > 0) {
      products = products.filter((p) =>
        p.variants?.some((v: { size?: string }) => v.size && selectedSizes.includes(v.size))
      );
    }
  }

  // Search query filter
  const searchQuery = resolvedSearchParams.q;
  if (searchQuery && typeof searchQuery === "string" && searchQuery.trim().length > 0) {
    const qLower = searchQuery.trim().toLowerCase();
    products = products.filter(
      (p) => p.name?.toLowerCase().includes(qLower) || p.description?.toLowerCase().includes(qLower)
    );
  }

  // Map to ProductCard format — use correct images from demo data
  const mappedProducts = products.map((p) => {
    const variantImages = p.variants?.[0]?.images;
    const image =
      Array.isArray(variantImages) && variantImages.length > 0
        ? variantImages[0]
        : p.image || "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg";

    const variantPrice = p.variants?.[0]?.price ? Number(p.variants[0].price) : Number(p.basePrice);
    const compareAtPrice = p.compareAtPrice || Math.round(variantPrice * 1.18);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: variantPrice,
      compareAtPrice,
      image,
      category: p.category?.name || categoryName,
      isNew: p.isNew || p.isFeatured,
      isBestseller: p.isBestseller,
    };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="container mx-auto px-4 md:px-8 py-3 max-w-7xl">
          <Breadcrumb
            items={[{ label: "Collections", href: "/collections" }, { label: categoryName }]}
          />
        </div>
      </div>

      {/* Category Hero — Clean White */}
      <div className="border-b border-neutral-100 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-7xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9a43c] mb-3">
            Euphoria Curations
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 font-serif mb-4">
            {categoryName}
          </h1>
          <div className="w-10 h-[2px] bg-[#c9a43c] mx-auto mb-4" />
          <p className="text-sm md:text-base text-neutral-500 leading-relaxed max-w-xl mx-auto">
            {categoryDescription}
          </p>
        </div>
      </div>

      {/* Filter + Products */}
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        {/* Filters row */}
        <div className="mb-6">
          <CollectionFilters />
        </div>

        {/* Count + Sort */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {mappedProducts.length} {mappedProducts.length === 1 ? "Product" : "Products"} Found
          </p>
          <div className="flex items-center gap-3">
            <MobileFilterDrawer />
            <SortDropdown />
          </div>
        </div>

        {/* Product Grid */}
        {mappedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {mappedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-28 max-w-md mx-auto">
            <p className="text-4xl mb-4">💎</p>
            <p className="text-base font-semibold text-neutral-800 mb-2">No products found</p>
            <p className="text-sm text-neutral-400">
              Try adjusting your filters or browse our other collections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
