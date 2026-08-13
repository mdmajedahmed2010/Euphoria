"use server";

/**
 * BIBAZ — Review Server Actions
 * SOP §৬E — Customer Reviews (Verified Purchase Only)
 */

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ═══════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ═══════════════════════════════════════════
// PUBLIC ACTIONS
// ═══════════════════════════════════════════

/**
 * Get approved reviews for a product
 */
export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    return {
      success: true,
      reviews,
      stats: {
        count: reviews.length,
        average: Math.round(avgRating * 10) / 10,
      },
    };
  } catch (error) {
    console.error("[REVIEW] getProductReviews error:", error);
    return { success: false, reviews: [], stats: { count: 0, average: 0 } };
  }
}

/**
 * Create a review (Logged-in user — verified purchase preferred)
 */
export async function createReview(data: z.infer<typeof createReviewSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to leave a review" };
  }

  const parsed = createReviewSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const { productId, rating, comment } = parsed.data;

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { productId, userId: session.user.id },
    });

    if (existing) {
      return { success: false, error: "You have already reviewed this product" };
    }

    // Check if user has purchased this product (verified purchase)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        order: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "CONFIRMED", "PROCESSING", "SHIPPED"] },
        },
        variant: { productId },
      },
    });

    await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        comment,
        isVerified: !!hasPurchased,
        status: "PENDING", // Requires admin approval
      },
    });

    return { success: true, message: "Review submitted! It will appear after approval." };
  } catch (error) {
    console.error("[REVIEW] createReview error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

// ═══════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════

/**
 * Get all reviews (Admin — for moderation)
 */
export async function getAdminReviews(status?: string) {
  const session = await auth();
  if (!session?.user) return { success: false, reviews: [] };

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, reviews: [], error: "Insufficient permissions" };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, reviews };
  } catch (error) {
    console.error("[REVIEW] getAdminReviews error:", error);
    return { success: false, reviews: [] };
  }
}

/**
 * Approve or reject a review (Admin)
 */
export async function moderateReview(reviewId: string, action: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status: action },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: `REVIEW_${action}`,
        entity: "Review",
        entityId: reviewId,
        newValue: { status: action },
      },
    });

    revalidatePath("/admin/reviews");
    if (review.productId) {
      revalidatePath(`/products/${review.productId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[REVIEW] moderateReview error:", error);
    return { success: false, error: "Failed to moderate review" };
  }
}
