"use server";

/**
 * BIBAZ — Category Server Actions
 * SOP §৬A — Structural Category Management
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ═══════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  parentId: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  parentId: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// ═══════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════

/**
 * Get all categories (Admin — sorted by sortOrder)
 */
export async function getAdminCategories() {
  const session = await auth();
  if (!session?.user) return { success: false, categories: [], error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, categories: [], error: "Insufficient permissions" };
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    });

    return { success: true, categories: serializeDecimals(categories) };
  } catch (error) {
    console.error("[CATEGORY] getAdminCategories error:", error);
    return { success: false, categories: [], error: "Failed to fetch categories" };
  }
}

/**
 * Create a product category (Admin)
 */
export async function createCategory(data: z.infer<typeof categorySchema>) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    // Generate clean slug from name
    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: finalSlug,
        parentId: parsed.data.parentId || null,
        image: parsed.data.image || null,
        sortOrder: parsed.data.sortOrder,
        isActive: true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "CREATE_CATEGORY",
        entity: "Category",
        entityId: category.id,
        newValue: { name: category.name, slug: category.slug },
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, category: serializeDecimals(category) };
  } catch (error) {
    console.error("[CATEGORY] createCategory error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

/**
 * Update a category (Admin)
 */
export async function updateCategory(id: string, data: z.infer<typeof updateCategorySchema>) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  const parsed = updateCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    // Loop prevention: check if parentId is the category itself
    if (parsed.data.parentId === id) {
      return { success: false, error: "A category cannot be its own parent." };
    }

    // Loop prevention: check if parentId is a descendant of this category
    if (parsed.data.parentId) {
      let currentParentId: string | null = parsed.data.parentId;
      while (currentParentId) {
        const parentRecord: { parentId: string | null } | null = await prisma.category.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        });
        if (parentRecord?.parentId === id) {
          return {
            success: false,
            error: "Loops are forbidden! Cannot select a descendant category as a parent.",
          };
        }
        currentParentId = parentRecord?.parentId || null;
      }
    }

    const oldCategory = await prisma.category.findUnique({ where: { id } });
    if (!oldCategory) return { success: false, error: "Category not found" };

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        parentId: parsed.data.parentId,
        image: parsed.data.image,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "UPDATE_CATEGORY",
        entity: "Category",
        entityId: category.id,
        oldValue: oldCategory,
        newValue: parsed.data,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, category: serializeDecimals(category) };
  } catch (error) {
    console.error("[CATEGORY] updateCategory error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

/**
 * Delete a category (Admin)
 */
export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    // Check if there are active products using this category
    const productCount = await prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `This category is assigned to ${productCount} active products. Please reassign the products before deleting.`,
      };
    }

    // Check if there are children subcategories
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return {
        success: false,
        error: `This category has ${childCount} active subcategories. Please delete or reassign them first.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "DELETE_CATEGORY",
        entity: "Category",
        entityId: id,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[CATEGORY] deleteCategory error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
