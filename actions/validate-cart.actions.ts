"use server";

/**
 * BIBAZ — Cart Validation
 * Validates client cart items against DB, returns valid IDs
 */

import { prisma } from "@/lib/db";

/**
 * Validate cart items — returns which variant IDs exist in DB
 */
export async function validateCartItems(variantIds: string[]) {
  try {
    if (!variantIds || variantIds.length === 0) {
      return { success: true, validIds: [], invalidIds: [] };
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      select: { id: true },
    });

    const validIds = variants.map((v) => v.id);
    const invalidIds = variantIds.filter((id) => !validIds.includes(id));

    return { success: true, validIds, invalidIds };
  } catch (error) {
    console.error("[CART] validateCartItems error:", error);
    return { success: false, validIds: variantIds, invalidIds: [], error: "Cart validation temporarily unavailable" };
  }
}
