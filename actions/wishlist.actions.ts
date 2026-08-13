"use server";

/**
 * BIBAZ — Wishlist Server Actions
 * SOP §৬E — Customer Features
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Get user's wishlist
 */
export async function getWishlist() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, items: [], error: "Not authenticated" };
  }

  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            category: { select: { name: true, slug: true } },
            variants: {
              where: { isActive: true },
              take: 1,
              select: { price: true, images: true, stock: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, items: serializeDecimals(wishlist) };
  } catch (error) {
    console.error("[WISHLIST] getWishlist error:", error);
    return { success: false, items: [], error: "Failed to fetch wishlist" };
  }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to add to wishlist" };
  }

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return { success: true, message: "Already in wishlist" };
    }

    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (error) {
    console.error("[WISHLIST] addToWishlist error:", error);
    return { success: false, error: "Failed to add to wishlist" };
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (error) {
    console.error("[WISHLIST] removeFromWishlist error:", error);
    return { success: false, error: "Failed to remove from wishlist" };
  }
}

/**
 * Check if product is in user's wishlist
 */
export async function isInWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { inWishlist: false };
  }

  try {
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return { inWishlist: !!item };
  } catch {
    return { inWishlist: false };
  }
}
