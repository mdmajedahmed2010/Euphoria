/**
 * Euphoria — Product Detail Page
 * Route: /products/[slug]
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductImages } from "@/components/product/product-images";
import { ProductInfo } from "@/components/product/product-info";
import { RelatedProducts } from "@/components/product/related-products";
import { getProductBySlug } from "@/actions/product.actions";
import { getStorefrontSettings } from "@/actions/settings.actions";
import { ALL_PRODUCTS } from "@/lib/demo-data";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  let result = await getProductBySlug(slug);

  // Fallback to Demo Data
  if (!result.success || !result.product) {
    const demoProduct = ALL_PRODUCTS.find((p) => p.slug === slug);
    if (demoProduct) {
      result = {
        success: true,
        product: {
          name: demoProduct.name,
          seoTitle: `${demoProduct.name} — Euphoria`,
          seoDesc: `${demoProduct.name} — Authentic luxury jewelry collection by Euphoria.`,
          description: `${demoProduct.name} — Exclusive authentic luxury jewelry piece with premium craftsmanship.`,
        } as any,
      };
    }
  }

  if (!result.success || !result.product) {
    return { title: "Product Not Found — Euphoria" };
  }

  const product = result.product;
  return {
    title: product.seoTitle || `${product.name} — Euphoria`,
    description: (product.seoDesc || product.description).slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let [productRes, settingsRes] = await Promise.all([
    getProductBySlug(slug),
    getStorefrontSettings(),
  ]);

  // Fallback to Demo Data
  if (!productRes.success || !productRes.product) {
    const demoProduct = ALL_PRODUCTS.find((p) => p.slug === slug);
    if (demoProduct) {
      productRes = {
        success: true,
        product: {
          id: demoProduct.id,
          name: demoProduct.name,
          slug: demoProduct.slug,
          description: getProductDescription(demoProduct.name, demoProduct.category || ""),
          basePrice: demoProduct.price,
          compareAtPrice: demoProduct.compareAtPrice || null,
          category: {
            name: demoProduct.category || "Authentic Jewelry",
            slug: (demoProduct.category || "Authentic Jewelry").toLowerCase().replace(/ /g, "-"),
          },
          variants: [
            {
              id: demoProduct.id + "-v1",
              sku: demoProduct.id,
              price: demoProduct.price,
              stock: 12,
              images: [demoProduct.image],
            },
          ],
        } as any,
      };
    }
  }

  if (!productRes.success || !productRes.product) {
    notFound();
  }

  const product = productRes.product;
  const settings = settingsRes.settings || {};

  const shippingDhaka = Number(settings.shipping_dhaka ?? 80);
  const shippingOutside = Number(settings.shipping_outside ?? 150);
  const freeShippingThreshold = Number(settings.free_shipping_threshold ?? 5000);

  // Extract images — use demo product's real image
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstVariant: any = product.variants[0];
  const variantImages = firstVariant?.images;
  
  // Find demo product to get correct image
  const demoMatch = ALL_PRODUCTS.find((p) => p.slug === product.slug);
  const fallbackImage = demoMatch?.image || "/euphoria/762867867_1027766650023554_4511890854211205012_n.jpg";
  
  const images: string[] =
    Array.isArray(variantImages) && variantImages.length > 0
      ? (variantImages as string[])
      : [fallbackImage];

  // Use compareAtPrice from demo data if available
  const prices = product.variants.map((v) => Number(v.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : Number(product.basePrice);
  const compareAtPrice = demoMatch?.compareAtPrice || product.compareAtPrice || Math.round(minPrice * 1.18);

  // Map DB variants to ProductInfo expected format
  const mappedVariants = product.variants.map((v) => ({
    id: v.id,
    size: v.size || "Standard",
    color: v.color || "As Shown",
    price: Number(v.price),
    stock: v.stock,
    sku: v.sku,
  }));

  const displayProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: minPrice,
    compareAtPrice,
    category: {
      name: product.category?.name || "Authentic Jewelry",
      slug: product.category?.slug || "jewelry",
    },
    images,
    ogImage: product.ogImage,
    createdAt: product.createdAt,
    variants: mappedVariants,
    deliveryInfo: `Dhaka: ৳${shippingDhaka} (1-2 days) | Outside Dhaka: ৳${shippingOutside} (2-4 days)${freeShippingThreshold > 0 ? ` | Free shipping on orders above ৳${freeShippingThreshold.toLocaleString()}` : ""}`,
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-3">
          <Breadcrumb
            items={[
              {
                label: displayProduct.category.name,
                href: `/collections/${displayProduct.category.slug}`,
              },
              { label: displayProduct.name },
            ]}
          />
        </div>
      </div>

      {/* Product Detail — Full width, editorial */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left: Image Gallery — takes full 50% */}
          <div className="w-full">
            <ProductImages images={displayProduct.images} productName={displayProduct.name} />
          </div>

          {/* Right: Product Info — sticky, clean */}
          <div className="lg:sticky lg:top-24 space-y-0">
            <ProductInfo product={displayProduct} settings={settings} />
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 md:mt-24 border-t border-neutral-100 pt-12">
          <RelatedProducts categorySlug={displayProduct.category.slug} currentProductId={displayProduct.id} />
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: displayProduct.name,
            description: displayProduct.description,
            image: displayProduct.images,
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "BDT",
              lowPrice: displayProduct.basePrice,
              highPrice: displayProduct.compareAtPrice || displayProduct.basePrice,
              offerCount: displayProduct.variants.length,
            },
          }),
        }}
      />
    </div>
  );
}

// Helper: rich product descriptions per category
function getProductDescription(name: string, category: string): string {
  const categoryDescriptions: Record<string, string> = {
    "Kundan Bridal Sets": "Exquisite authentic Kundan jewelry with meticulous handcrafted detailing. Perfect for bridal occasions, weddings, and festive celebrations. Each piece features premium gold-plated finishing with genuine uncut gemstones. Cash on delivery available across Bangladesh.",
    "Polki Necklaces": "Timeless uncut diamond Polki necklace crafted in the royal Mughal tradition. Features intricate meenakari enamel work on the reverse with premium gold plating. A statement piece for brides and jewelry connoisseurs. Cash on delivery available.",
    "Pearl Jewellery": "Elegant authentic pearl jewelry featuring lustrous, hand-selected pearls. Lightweight yet luxurious — perfect for both daily wear and special occasions. Premium quality with a beautiful drape. Cash on delivery available across Bangladesh.",
    "Long Chains": "Stunning multi-layered long chain necklace with intricate craftsmanship. Features a combination of gold-toned accents and precious stones. A versatile statement piece that elevates any traditional or fusion outfit.",
    "Choker Sets": "Regal choker necklace with exceptional detailing. Sits perfectly around the neck to frame the face beautifully. Ideal for bridal wear, receptions, and grand festive occasions. Premium quality guaranteed.",
  };
  return categoryDescriptions[category] || `${name} — Authentic luxury jewelry crafted with precision. 100% genuine materials with premium finishing. Cash on delivery available nationwide across Bangladesh.`;
}
