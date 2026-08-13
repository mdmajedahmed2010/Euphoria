"use server";

/**
 * BIBAZ — Collection Server Actions
 * Collections are marketing-focused curated product groups
 * Different from categories (which are structural)
 */

import { prisma } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { withCache } from "@/lib/redis";

// ═══════════════════════════════════════════
// PUBLIC
// ═══════════════════════════════════════════

/**
 * Get all active collections (for storefront)
 */
export async function getCollections() {
  return withCache(
    "storefront_collections",
    async () => {
      try {
        const collections = await db.collection.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        });
        return { success: true, collections };
      } catch (error) {
        console.error("[COLLECTION] getCollections error:", error);
        return { success: false, collections: [] };
      }
    },
    3600 // Cache for 1 hour
  );
}

/**
 * Get collection by slug with products
 */
export async function getCollectionBySlug(slug: string) {
  return withCache(
    `collection_${slug}`,
    async () => {
      try {
        const collection = await db.collection.findUnique({
          where: { slug },
        });

        if (!collection) {
          return { success: false, collection: null, products: [] };
        }

        // Handle both legacy string[] and new smart collection { mode, ids, rules }
        let productIds: string[] = [];
        if (Array.isArray(collection.productIds)) {
          productIds = collection.productIds as string[];
        } else if (collection.productIds && typeof collection.productIds === "object") {
          productIds =
            ((collection.productIds as Record<string, unknown>).cachedIds as string[]) ||
            ((collection.productIds as Record<string, unknown>).ids as string[]) ||
            [];
        }

        const products =
          productIds.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: productIds }, status: "ACTIVE", deletedAt: null },
                include: {
                  variants: { where: { isActive: true }, take: 1 },
                  category: { select: { name: true, slug: true } },
                },
              })
            : [];

        return { success: true, collection, products };
      } catch (error) {
        console.error("[COLLECTION] getCollectionBySlug error:", error);
        return { success: false, collection: null, products: [] };
      }
    },
    1800 // Cache for 30 minutes
  );
}

// ═══════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════

/**
 * Get all collections (Admin — including inactive)
 */
export async function getAdminCollections() {
  const session = await auth();
  if (!session?.user) return { success: false, collections: [] };

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, collections: [], error: "Insufficient permissions" };
  }

  try {
    const collections = await db.collection.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, collections };
  } catch (error) {
    console.error("[COLLECTION] getAdminCollections error:", error);
    return { success: false, collections: [] };
  }
}

/**
 * Create a collection (Admin)
 */
export async function createCollection(data: {
  name: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  isFeatured?: boolean;
  productIds?: unknown;
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await db.collection.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const maxOrder = await db.collection.aggregate({ _max: { sortOrder: true } });

    const collection = await db.collection.create({
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description,
        image: data.image,
        bannerImage: data.bannerImage,
        isFeatured: data.isFeatured || false,
        productIds: (data.productIds || []) as object,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "CREATE_COLLECTION",
        entity: "Collection",
        entityId: collection.id,
        newValue: { name: collection.name, slug: collection.slug },
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true, collection };
  } catch (error) {
    console.error("[COLLECTION] createCollection error:", error);
    return { success: false, error: "Failed to create collection" };
  }
}

/**
 * Update a collection (Admin)
 */
export async function updateCollection(
  id: string,
  data: {
    name?: string;
    description?: string;
    image?: string;
    bannerImage?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productIds?: any;
    sortOrder?: number;
  }
) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const collection = await db.collection.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        bannerImage: data.bannerImage,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        productIds: data.productIds as any,
        sortOrder: data.sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "UPDATE_COLLECTION",
        entity: "Collection",
        entityId: collection.id,
        newValue: data,
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true, collection };
  } catch (error) {
    console.error("[COLLECTION] updateCollection error:", error);
    return { success: false, error: "Failed to update collection" };
  }
}

/**
 * Delete a collection (Admin)
 */
export async function deleteCollection(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    await db.collection.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "DELETE_COLLECTION",
        entity: "Collection",
        entityId: id,
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[COLLECTION] deleteCollection error:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}

/**
 * Resolve Smart Collection Rules to Product IDs (Admin)
 */
export async function resolveSmartCollectionRules(rules: {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "ARCHIVED";
}) {
  const session = await auth();
  if (!session?.user) return { success: false, productIds: [] };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null };

    if (rules.keyword) {
      where.name = { contains: rules.keyword }; // For simplicity, using simple contains.
    }
    if (rules.status) {
      where.status = rules.status;
    }
    if (rules.minPrice !== undefined || rules.maxPrice !== undefined) {
      where.basePrice = {};
      if (rules.minPrice !== undefined) where.basePrice.gte = rules.minPrice;
      if (rules.maxPrice !== undefined) where.basePrice.lte = rules.maxPrice;
    }

    const products = await db.product.findMany({
      where,
      select: { id: true },
      take: 200, // reasonable limit for collection
    });

    return { success: true, productIds: products.map((p: { id: string }) => p.id) };
  } catch (error) {
    console.error("[COLLECTION] resolveSmartCollectionRules error:", error);
    return { success: false, productIds: [] };
  }
}
