import { prisma, serializeDecimals } from "@/lib/db";
import { HomeUI } from "./home-client";

export const revalidate = 60; // Cache and revalidate every 60 seconds for ultra-fast response

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
      take: 12,
    });
  } catch (err) {
    console.error("[HOME] Database error fetching categories:", err);
    return [];
  }
}

async function getProducts() {
  try {
    return await prisma.product.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        createdAt: true,
        category: {
          select: { name: true, slug: true },
        },
        variants: {
          where: { isActive: true },
          take: 1,
          select: {
            price: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("[HOME] Database error fetching products:", err);
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <HomeUI dbCategories={serializeDecimals(categories)} dbProducts={serializeDecimals(products)} />
  );
}
