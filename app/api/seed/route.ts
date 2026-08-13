import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const session = await auth();

    const userRole = (session?.user as { role?: string })?.role;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    const expectedSecret = process.env.SEED_SECRET || "Sitara2026";

    if (!isAdmin && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized seed request" }, { status: 401 });
    }

    console.log("🌱 Starting Production Seed via API...");

    // 1. Delete old demo data (all categories, products, variants)
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // 2. Create 12 Official Categories (9 PDF + 3 Professional Collections at Last Position)
    const CATEGORIES = [
      {
        name: "Kaftan",
        slug: "kaftan",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961964/Sitara/products/0bcafce4-8d43-4f3e-a1c2-59642e51c611.png",
        sortOrder: 1,
      },
      {
        name: "Cord Set",
        slug: "cord-set",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961963/Sitara/products/0417aaaa-da0e-4170-9955-ce2a591954c6.png",
        sortOrder: 2,
      },
      {
        name: "Abaya",
        slug: "abaya",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961978/Sitara/products/72cd69a9-0f87-4b3e-b9a2-318c1f09538f.png",
        sortOrder: 3,
      },
      {
        name: "Cape",
        slug: "cape",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961968/Sitara/products/1ca3cc49-6152-4f4c-b11c-f44fd63b37dc.png",
        sortOrder: 4,
      },
      {
        name: "Kamij Set",
        slug: "kamij-set",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961972/Sitara/products/60224609-864e-45e5-a7e6-1f14b097f09f.png",
        sortOrder: 5,
      },
      {
        name: "Shari",
        slug: "shari",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961964/Sitara/products/0bcafce4-8d43-4f3e-a1c2-59642e51c611.png",
        sortOrder: 6,
      },
      {
        name: "Blouse",
        slug: "blouse",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961968/Sitara/products/1ca3cc49-6152-4f4c-b11c-f44fd63b37dc.png",
        sortOrder: 7,
      },
      {
        name: "Inner & Leggings",
        slug: "inner-leggings",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961963/Sitara/products/0417aaaa-da0e-4170-9955-ce2a591954c6.png",
        sortOrder: 8,
      },
      {
        name: "Scarf / Hijab",
        slug: "scarf-hijab",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961978/Sitara/products/72cd69a9-0f87-4b3e-b9a2-318c1f09538f.png",
        sortOrder: 9,
      },
      {
        name: "Eid & Festive Edit",
        slug: "eid-festive-edit",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961972/Sitara/products/60224609-864e-45e5-a7e6-1f14b097f09f.png",
        sortOrder: 10,
      },
      {
        name: "Bridal & Trousseau",
        slug: "bridal-trousseau",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961964/Sitara/products/0bcafce4-8d43-4f3e-a1c2-59642e51c611.png",
        sortOrder: 11,
      },
      {
        name: "Everyday Luxury",
        slug: "everyday-luxury",
        image:
          "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961963/Sitara/products/0417aaaa-da0e-4170-9955-ce2a591954c6.png",
        sortOrder: 12,
      },
    ];

    const categoryMap: Record<string, string> = {};

    for (const cat of CATEGORIES) {
      const created = await prisma.category.create({
        data: cat,
      });
      categoryMap[cat.slug] = created.id;
    }

    // 3. Create 18 Authentic PDF Products
    const PRODUCTS = [
      {
        name: "Pink & Teal Ombre Tye Dye Kaftan",
        slug: "pink-teal-ombre-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Exclusive handcrafted designer Kaftan in stunning Pink & Teal ombre tye-dye. Crafted from luxurious Crape Silk fabric with a fluid drape and comfortable fit. Designed for elegance and bespoke style.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Pink & Teal Ombre",
            price: 7050,
            stock: 15,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961964/Sitara/products/0bcafce4-8d43-4f3e-a1c2-59642e51c611.png",
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961968/Sitara/products/1ca3cc49-6152-4f4c-b11c-f44fd63b37dc.png",
            ],
          },
        ],
      },
      {
        name: "Royal Blue & Sky Blue Tye Dye Kaftan",
        slug: "royal-blue-sky-blue-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Artisanal Crape Silk Kaftan featuring vibrant Royal Blue and Sky Blue tye-dye patterns. Offers a sophisticated silhouette with free-flowing comfort. Length: 52-54 inches.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Royal & Sky Blue",
            price: 7050,
            stock: 12,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961968/Sitara/products/1ca3cc49-6152-4f4c-b11c-f44fd63b37dc.png",
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961972/Sitara/products/60224609-864e-45e5-a7e6-1f14b097f09f.png",
            ],
          },
        ],
      },
      {
        name: "Black & Yellow Tye Dye Kaftan",
        slug: "black-yellow-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Striking contrast Black & Yellow Tye Dye Kaftan crafted in premium Crape Silk. Designed for statement evening wear and luxurious lounging.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Black & Yellow",
            price: 7050,
            stock: 10,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961972/Sitara/products/60224609-864e-45e5-a7e6-1f14b097f09f.png",
            ],
          },
        ],
      },
      {
        name: "Maroon & Peach Tye Dye Kaftan",
        slug: "maroon-peach-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Elegant Maroon and Peach ombre fusion Kaftan. Made from high-grade Crape Silk for exquisite drape and breathability.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Maroon & Peach",
            price: 7050,
            stock: 8,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961978/Sitara/products/72cd69a9-0f87-4b3e-b9a2-318c1f09538f.png",
            ],
          },
        ],
      },
      {
        name: "Crimson Red & Coral Tye Dye Kaftan",
        slug: "crimson-red-coral-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Vibrant Crimson Red and Coral artisanal tye-dye Kaftan in luxury Crape Silk. Features handcrafted finishing.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Crimson Red & Coral",
            price: 7050,
            stock: 14,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961964/Sitara/products/0bcafce4-8d43-4f3e-a1c2-59642e51c611.png",
            ],
          },
        ],
      },
      {
        name: "Emerald & Lime Green Tye Dye Kaftan",
        slug: "emerald-lime-green-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Stunning Emerald and Lime Green ombre Tye Dye Kaftan. Perfect balance of traditional artistry and modern silhouette.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Emerald & Lime",
            price: 7050,
            stock: 9,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961963/Sitara/products/0417aaaa-da0e-4170-9955-ce2a591954c6.png",
            ],
          },
        ],
      },
      {
        name: "Navy Blue & Cyan Tye Dye Kaftan",
        slug: "navy-blue-cyan-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Deep Navy Blue paired with bright Cyan tye-dye patterns on pure Crape Silk. Luxurious bespoke comfort.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Navy Blue & Cyan",
            price: 7050,
            stock: 11,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961968/Sitara/products/1ca3cc49-6152-4f4c-b11c-f44fd63b37dc.png",
            ],
          },
        ],
      },
      {
        name: "Plum Purple & Magenta Tye Dye Kaftan",
        slug: "plum-purple-magenta-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Rich Plum Purple and vibrant Magenta ombre Kaftan. Designed for festive luxury and elevated casual styling.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Plum & Magenta",
            price: 7050,
            stock: 7,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961978/Sitara/products/72cd69a9-0f87-4b3e-b9a2-318c1f09538f.png",
            ],
          },
        ],
      },
      {
        name: "Charcoal Grey & Silver Tye Dye Kaftan",
        slug: "charcoal-grey-silver-tye-dye-kaftan",
        categorySlug: "kaftan",
        description:
          "Sophisticated Charcoal Grey and Silver ombre tye-dye Kaftan in premium Crape Silk. Effortless grace.",
        basePrice: 7050,
        variants: [
          {
            size: "Free Size (52-54 inch)",
            color: "Charcoal & Silver",
            price: 7050,
            stock: 10,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961972/Sitara/products/60224609-864e-45e5-a7e6-1f14b097f09f.png",
            ],
          },
        ],
      },
      {
        name: "Rose Pink Kaftan Cord Set (2 Piece)",
        slug: "rose-pink-kaftan-cord-set",
        categorySlug: "cord-set",
        description:
          "Designer 2-Piece Kaftan Cord Set in soft Rose Pink. Includes a free-flowing Crape Silk kaftan top paired with tailored matching trousers.",
        basePrice: 8500,
        variants: [
          {
            size: "Free Size (Top 44, Pant 38)",
            color: "Rose Pink",
            price: 8500,
            stock: 12,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961963/Sitara/products/0417aaaa-da0e-4170-9955-ce2a591954c6.png",
            ],
          },
        ],
      },
      {
        name: "Designer Tye Dye Kaftan Cord Set",
        slug: "designer-tye-dye-kaftan-cord-set",
        categorySlug: "cord-set",
        description:
          "Artisanal Tye Dye 2-Piece Cord Set featuring luxury handcrafted finishing. Perfectly paired top and trousers for effortless chic.",
        basePrice: 8500,
        variants: [
          {
            size: "Free Size",
            color: "Multi Tye Dye",
            price: 8500,
            stock: 8,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961964/Sitara/products/0bcafce4-8d43-4f3e-a1c2-59642e51c611.png",
            ],
          },
        ],
      },
      {
        name: "Self Print Shimmery Velvet Kaftan",
        slug: "self-print-shimmery-velvet-kaftan",
        categorySlug: "kaftan",
        description:
          "Opulent Shimmery Velvet Kaftan with self-print embossing. Perfect for winter weddings and evening celebrations.",
        basePrice: 9200,
        variants: [
          {
            size: "Free Size (54 inch)",
            color: "Deep Maroon Velvet",
            price: 9200,
            stock: 6,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961978/Sitara/products/72cd69a9-0f87-4b3e-b9a2-318c1f09538f.png",
            ],
          },
        ],
      },
      {
        name: "Luxury Embroidered Front-Open Abaya",
        slug: "luxury-embroidered-front-open-abaya",
        categorySlug: "abaya",
        description:
          "Exquisite front-open designer Abaya featuring intricate golden embroidery on premium Dubai Nidah fabric. Comes with matching Hijab.",
        basePrice: 6500,
        variants: [
          {
            size: "52",
            color: "Jet Black",
            price: 6500,
            stock: 10,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961978/Sitara/products/72cd69a9-0f87-4b3e-b9a2-318c1f09538f.png",
            ],
          },
        ],
      },
      {
        name: "Pleated Chiffon Layered Cape Set",
        slug: "pleated-chiffon-layered-cape-set",
        categorySlug: "cape",
        description:
          "Contemporary 3-piece Cape Ensemble featuring pleated inner slip, flowing chiffon outer cape, and designer trousers.",
        basePrice: 7800,
        variants: [
          {
            size: "M (40)",
            color: "Champagne Gold",
            price: 7800,
            stock: 8,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961968/Sitara/products/1ca3cc49-6152-4f4c-b11c-f44fd63b37dc.png",
            ],
          },
        ],
      },
      {
        name: "Artisanal Hand-Loom Silk Kamij Set",
        slug: "artisanal-hand-loom-silk-kamij-set",
        categorySlug: "kamij-set",
        description:
          "Traditional 3-piece Kamij Set woven in pure hand-loom silk with delicate zari detailing on neckline and dupatta.",
        basePrice: 6800,
        variants: [
          {
            size: "L (42)",
            color: "Teal Blue",
            price: 6800,
            stock: 10,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961972/Sitara/products/60224609-864e-45e5-a7e6-1f14b097f09f.png",
            ],
          },
        ],
      },
      {
        name: "Royal Zari Woven Katan Shari",
        slug: "royal-zari-woven-katan-shari",
        categorySlug: "shari",
        description:
          "Authentic Katan Silk Shari featuring all-over traditional floral zari motifs. Exceptional craftsmanship for bridal and festive occasions.",
        basePrice: 12500,
        variants: [
          {
            size: "Standard (12 Haat)",
            color: "Royal Red & Gold",
            price: 12500,
            stock: 5,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961964/Sitara/products/0bcafce4-8d43-4f3e-a1c2-59642e51c611.png",
            ],
          },
        ],
      },
      {
        name: "Bespoke Padded Designer Blouse",
        slug: "bespoke-padded-designer-blouse",
        categorySlug: "blouse",
        description:
          "Tailored designer blouse with princess cut seam, inner padding, and hand-embroidered neckline.",
        basePrice: 2800,
        variants: [
          {
            size: "38",
            color: "Gold Zari",
            price: 2800,
            stock: 15,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961968/Sitara/products/1ca3cc49-6152-4f4c-b11c-f44fd63b37dc.png",
            ],
          },
        ],
      },
      {
        name: "Premium Lycra Stretch Inner & Leggings Set",
        slug: "premium-lycra-stretch-inner-leggings",
        categorySlug: "inner-leggings",
        description:
          "Ultra-soft 4-way stretch breathable Lycra inner slip and matching ankle-length leggings set.",
        basePrice: 1450,
        variants: [
          {
            size: "Free Size",
            color: "Nude Peach",
            price: 1450,
            stock: 25,
            images: [
              "https://res.cloudinary.com/dnbol4pey/image/upload/f_auto,q_auto/v1783961963/Sitara/products/0417aaaa-da0e-4170-9955-ce2a591954c6.png",
            ],
          },
        ],
      },
    ];

    let createdCount = 0;
    for (const prod of PRODUCTS) {
      const categoryId = categoryMap[prod.categorySlug];
      if (!categoryId) continue;

      const createdProduct = await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          basePrice: prod.basePrice,
          categoryId,
          status: "ACTIVE",
          isFeatured: true,
        },
      });

      for (const variant of prod.variants) {
        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            sku: `Sitara-${prod.slug.substring(0, 8).toUpperCase()}-${variant.size.substring(0, 2).toUpperCase()}`,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            stock: variant.stock,
            images: variant.images,
            isActive: true,
          },
        });
      }
      createdCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      categories: CATEGORIES.length,
      products: createdCount,
    });
  } catch (error) {
    console.error("[API/SEED] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
