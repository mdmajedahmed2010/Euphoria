"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function getAbandonedCarts() {
  await requireAdmin();

  try {
    const carts = await prisma.abandonedCart.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
      },
    });

    return { success: true as const, data: carts };
  } catch (error) {
    console.error("[CART] getAbandonedCarts failed:", error);
    return { success: false as const, error: "Failed to load carts" };
  }
}

export async function updateAbandonedCartStatus(id: string, status: string) {
  await requireAdmin();

  try {
    await prisma.abandonedCart.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/abandoned-carts");
    return { success: true as const };
  } catch (error) {
    console.error("[CART] updateAbandonedCartStatus failed:", error);
    return { success: false as const, error: "Failed to update status" };
  }
}
