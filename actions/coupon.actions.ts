"use server";

/**
 * BIBAZ — Coupon Server Actions
 * SOP §৬ — Coupon/Discount System
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ═══════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════

const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().positive(),
  minOrder: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ═══════════════════════════════════════════
// PUBLIC ACTIONS
// ═══════════════════════════════════════════

/**
 * Validate a coupon code (Public — used at checkout)
 */
export async function validateCoupon(code: string, cartTotal: number) {
  try {
    const upperCode = code.toUpperCase();
    let coupon = await prisma.coupon.findUnique({
      where: { code: upperCode },
    });

    // Auto-seeding of default coupons safely with upsert
    if (!coupon && (upperCode === "DRESSLY10" || upperCode === "BIBAZ10" || upperCode === "EID2026")) {
      try {
        coupon = await prisma.coupon.upsert({
          where: { code: upperCode },
          update: {},
          create: {
            code: upperCode,
            type: (upperCode === "DRESSLY10" || upperCode === "BIBAZ10") ? "PERCENTAGE" : "FIXED",
            value: (upperCode === "DRESSLY10" || upperCode === "BIBAZ10") ? 10 : 200,
            isActive: true,
            expiresAt: new Date("2028-12-31T23:59:59Z"),
          },
        });
      } catch (e) {
        console.error("Auto-seeding default coupon failed:", e);
      }
    }

    if (!coupon) {
      return { success: false, error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { success: false, error: "This coupon is no longer active" };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { success: false, error: "This coupon has expired" };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { success: false, error: "This coupon has reached its usage limit" };
    }

    if (coupon.minOrder && cartTotal < Number(coupon.minOrder)) {
      return {
        success: false,
        error: `Minimum order amount is ৳${coupon.minOrder}`,
      };
    }

    // Calculate discount
    let discount = 0;
    switch (coupon.type) {
      case "PERCENTAGE":
        discount = (cartTotal * Number(coupon.value)) / 100;
        break;
      case "FIXED":
        discount = Number(coupon.value);
        break;
      case "FREE_SHIPPING":
        discount = 0; // Shipping handled separately
        break;
    }

    // Cap discount at cart total
    discount = Math.min(discount, cartTotal);

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        discount: Math.round(discount * 100) / 100,
        freeShipping: coupon.type === "FREE_SHIPPING",
      },
    };
  } catch (error) {
    console.error("[COUPON] validateCoupon error:", error);
    return { success: false, error: "Failed to validate coupon" };
  }
}

// ═══════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════

async function requireAdmin(): Promise<
  | { authorized: true; error: null; userId: string }
  | { authorized: false; error: string; userId: null }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated", userId: null };
  }
  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { authorized: false, error: "Insufficient permissions", userId: null };
  }
  return { authorized: true, error: null, userId: session.user.id };
}

/**
 * Get all coupons (Admin)
 */
export async function getCoupons() {
  const { authorized, error } = await requireAdmin();
  if (!authorized) return { success: false, error, coupons: [] };

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true } },
      },
    });

    return { success: true, coupons: serializeDecimals(coupons) };
  } catch (error) {
    console.error("[COUPON] getCoupons error:", error);
    return { success: false, coupons: [], error: "Failed to fetch coupons" };
  }
}

/**
 * Create a coupon (Admin)
 */
export async function createCoupon(data: z.infer<typeof createCouponSchema>) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  const parsed = createCouponSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    // Check code uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code: parsed.data.code },
    });
    if (existing) {
      return { success: false, error: "Coupon code already exists" };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        type: parsed.data.type,
        value: parsed.data.value,
        minOrder: parsed.data.minOrder,
        maxUses: parsed.data.maxUses,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "CREATE_COUPON",
        entity: "Coupon",
        entityId: coupon.id,
        newValue: { code: coupon.code, type: coupon.type, value: Number(coupon.value) },
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon: serializeDecimals(coupon) };
  } catch (error) {
    console.error("[COUPON] createCoupon error:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

/**
 * Deactivate a coupon (Admin)
 */
export async function deactivateCoupon(couponId: string) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "DEACTIVATE_COUPON",
        entity: "Coupon",
        entityId: coupon.id,
        newValue: { isActive: false },
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error("[COUPON] deactivateCoupon error:", error);
    return { success: false, error: "Failed to deactivate coupon" };
  }
}

/**
 * Delete a coupon (Admin)
 */
export async function deleteCoupon(couponId: string) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    const coupon = await prisma.coupon.delete({
      where: { id: couponId },
    });

    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "DELETE_COUPON",
        entity: "Coupon",
        entityId: coupon.id,
        oldValue: { code: coupon.code },
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error("[COUPON] deleteCoupon error:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}
