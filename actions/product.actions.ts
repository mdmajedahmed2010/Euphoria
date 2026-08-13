"use server";

/**
 * BIBAZ — Product Server Actions
 * SOP §৬A — Product Management
 *
 * Public: getProducts, getProductBySlug, getCategories
 * Admin+: createProduct, updateProduct, deleteProduct, createVariant, updateVariant
 */

import { prisma, serializeDecimals } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  createCategorySchema,
  type CreateProductInput,
  type UpdateProductInput,
  type CreateVariantInput,
  type UpdateVariantInput,
  type CreateCategoryInput,
} from "@/lib/validators/product";
import { withCache } from "@/lib/redis";
import { getActiveCampaign } from "@/actions/campaign.actions";

// ═══════════════════════════════════════════
// PUBLIC ACTIONS
// ═══════════════════════════════════════════

/**
 * Get products with filters, sorting, and pagination
 */
export async function getProducts(options?: {
  categorySlug?: string;
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  isFeatured?: boolean;
}) {
  try {
    const {
      categorySlug,
      status = "ACTIVE",
      search,
      sort = "newest",
      page = 1,
      pageSize = 12,
      isFeatured,
    } = options || {};

    const cacheKey = `products:${JSON.stringify(options || {})}`;

    return await withCache(cacheKey, async () => {
      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        deletedAt: null,
      };

      if (status) {
        where.status = status;
      }

      if (categorySlug) {
        where.category = { slug: categorySlug };
      }

      if (isFeatured !== undefined) {
        where.isFeatured = isFeatured;
      }

      if (search) {
        where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
      }

      // Build orderBy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let orderBy: any = { createdAt: "desc" };
      switch (sort) {
        case "price-asc":
          orderBy = { basePrice: "asc" };
          break;
        case "price-desc":
          orderBy = { basePrice: "desc" };
          break;
        case "name-asc":
          orderBy = { name: "asc" };
          break;
        case "name-desc":
          orderBy = { name: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }

      const skip = (page - 1) * pageSize;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            basePrice: true,
            status: true,
            isFeatured: true,
            createdAt: true,
            category: { select: { name: true, slug: true } },
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                sku: true,
                size: true,
                color: true,
                price: true,
                stock: true,
                images: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      const campaignRes = await getActiveCampaign();
      const activeCampaign = campaignRes.success ? campaignRes.campaign : null;

      const modifiedProducts = products.map((product) => {
        let basePrice = Number(product.basePrice);
        let compareAtPrice = Math.round(basePrice * 1.2);

        if (
          activeCampaign &&
          (!activeCampaign.productIds ||
            (activeCampaign.productIds as string[]).length === 0 ||
            (activeCampaign.productIds as string[]).includes(product.id))
        ) {
          compareAtPrice = basePrice;
          if (activeCampaign.discountType === "percentage") {
            basePrice = Math.round(basePrice - (basePrice * activeCampaign.discountValue) / 100);
          } else {
            basePrice = Math.max(0, basePrice - activeCampaign.discountValue);
          }
        }

        return {
          ...product,
          basePrice,
          compareAtPrice,
          variants: product.variants.map((v) => {
            let vPrice = Number(v.price);
            if (
              activeCampaign &&
              (!activeCampaign.productIds ||
                (activeCampaign.productIds as string[]).length === 0 ||
                (activeCampaign.productIds as string[]).includes(product.id))
            ) {
              if (activeCampaign.discountType === "percentage") {
                vPrice = Math.round(vPrice - (vPrice * activeCampaign.discountValue) / 100);
              } else {
                vPrice = Math.max(0, vPrice - activeCampaign.discountValue);
              }
            }
            return { ...v, price: vPrice };
          }),
        };
      });

      return {
        success: true,
        products: serializeDecimals(modifiedProducts),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    });
  } catch (error) {
    console.error("[PRODUCT] getProducts error:", error);
    return { success: false, products: [], pagination: null, error: "Failed to fetch products" };
  }
}

/**
 * Get single product by slug (with all variants)
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        basePrice: true,
        status: true,
        isFeatured: true,
        seoTitle: true,
        seoDesc: true,
        ogImage: true,
        createdAt: true,
        categoryId: true,
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            price: true,
            stock: true,
            images: true,
          },
        },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return { success: false, product: null, error: "Product not found" };
    }

    const campaignRes = await getActiveCampaign();
    const activeCampaign = campaignRes.success ? campaignRes.campaign : null;

    let basePrice = Number(product.basePrice);
    let compareAtPrice = Math.round(basePrice * 1.2);

    if (
      activeCampaign &&
      (!activeCampaign.productIds ||
        (activeCampaign.productIds as string[]).length === 0 ||
        (activeCampaign.productIds as string[]).includes(product.id))
    ) {
      compareAtPrice = basePrice;
      if (activeCampaign.discountType === "percentage") {
        basePrice = Math.round(basePrice - (basePrice * activeCampaign.discountValue) / 100);
      } else {
        basePrice = Math.max(0, basePrice - activeCampaign.discountValue);
      }
    }

    const modifiedProduct = {
      ...product,
      basePrice,
      compareAtPrice,
      variants: product.variants.map((v) => {
        let vPrice = Number(v.price);
        if (
          activeCampaign &&
          (!activeCampaign.productIds ||
            (activeCampaign.productIds as string[]).length === 0 ||
            (activeCampaign.productIds as string[]).includes(product.id))
        ) {
          if (activeCampaign.discountType === "percentage") {
            vPrice = Math.round(vPrice - (vPrice * activeCampaign.discountValue) / 100);
          } else {
            vPrice = Math.max(0, vPrice - activeCampaign.discountValue);
          }
        }
        return { ...v, price: vPrice };
      }),
    };

    return { success: true, product: serializeDecimals(modifiedProduct) };
  } catch (error) {
    console.error("[PRODUCT] getProductBySlug error:", error);
    return { success: false, product: null, error: "Failed to fetch product" };
  }
}

/**
 * Get all active categories
 */
export async function getCategories() {
  try {
    return await withCache(
      "categories:all",
      async () => {
        const categories = await prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { products: true } },
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        });

        return { success: true, categories };
      },
      3600
    ); // cache for 1 hour
  } catch (error) {
    console.error("[PRODUCT] getCategories error:", error);
    return { success: false, categories: [], error: "Failed to fetch categories" };
  }
}

/**
 * Get related products (same category, excluding current)
 */
export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        status: "ACTIVE",
        deletedAt: null,
      },
      take: limit,
      include: {
        variants: {
          where: { isActive: true },
          take: 1,
          select: { price: true, images: true },
        },
        category: { select: { name: true, slug: true } },
      },
    });

    return { success: true, products: serializeDecimals(products) };
  } catch (error) {
    console.error("[PRODUCT] getRelatedProducts error:", error);
    return { success: false, products: [] };
  }
}

// ═══════════════════════════════════════════
// ADMIN ACTIONS (Requires Admin+ role)
// ═══════════════════════════════════════════

/**
 * Helper: Check if current user has admin access
 */
async function requireAdmin(): Promise<
  | { authorized: true; error: null; userId: string }
  | { authorized: false; error: string; userId: null }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated", userId: null };
  }
  const role = (session.user as { role?: string }).role;
  const adminRoles = ["ADMIN", "SUPER_ADMIN", "MANAGER"];
  if (!adminRoles.includes(role || "")) {
    return { authorized: false, error: "Insufficient permissions", userId: null };
  }
  return { authorized: true, error: null, userId: session.user.id };
}

/**
 * Create a new product (Admin+)
 */
export async function createProduct(data: CreateProductInput) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  const parsed = createProductSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    // Generate slug from name
    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug: finalSlug,
        description: parsed.data.description,
        basePrice: parsed.data.basePrice,
        categoryId: parsed.data.categoryId,
        status: parsed.data.status || "DRAFT",
        isFeatured: parsed.data.isFeatured || false,
        seoTitle: parsed.data.seoTitle,
        seoDesc: parsed.data.seoDesc,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "CREATE_PRODUCT",
        entity: "Product",
        entityId: product.id,
        newValue: { name: product.name, slug: product.slug },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return {
      success: true,
      product: serializeDecimals(product),
    };
  } catch (error) {
    console.error("[PRODUCT] createProduct error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

/**
 * Update a product (Admin+)
 */
export async function updateProduct(productId: string, data: UpdateProductInput) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  const parsed = updateProductSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    const oldProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!oldProduct) return { success: false, error: "Product not found" };

    const product = await prisma.product.update({
      where: { id: productId },
      data: parsed.data,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "UPDATE_PRODUCT",
        entity: "Product",
        entityId: product.id,
        oldValue: { name: oldProduct.name, status: oldProduct.status },
        newValue: { name: product.name, status: product.status },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/");

    return {
      success: true,
      product: serializeDecimals(product),
    };
  } catch (error) {
    console.error("[PRODUCT] updateProduct error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

/**
 * Soft delete a product (Admin+)
 */
export async function deleteProduct(productId: string) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "DELETE_PRODUCT",
        entity: "Product",
        entityId: product.id,
        oldValue: { name: product.name },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[PRODUCT] deleteProduct error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

/**
 * Soft delete multiple products in bulk (Admin+)
 */
export async function deleteProductsBulk(productIds: string[]) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  if (!productIds || productIds.length === 0) {
    return { success: false, error: "No products selected" };
  }

  try {
    const result = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });

    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "BULK_DELETE_PRODUCTS",
        entity: "Product",
        entityId: "BULK",
        oldValue: { count: result.count, productIds },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("[PRODUCT] deleteProductsBulk error:", error);
    return { success: false, error: "Failed to delete products in bulk" };
  }
}

/**
 * Create a product variant (Admin+)
 */
export async function createVariant(data: CreateVariantInput) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  const parsed = createVariantSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    // Auto-generate SKU
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { slug: true },
    });
    if (!product) return { success: false, error: "Product not found" };

    const skuBase = product.slug.substring(0, 8).toUpperCase().replace(/-/g, "");
    const skuSuffix = Date.now().toString(36).toUpperCase().slice(-4);
    const sku = `${skuBase}-${parsed.data.size || "OS"}-${skuSuffix}`;

    const variant = await prisma.productVariant.create({
      data: {
        productId: parsed.data.productId,
        sku,
        size: parsed.data.size,
        color: parsed.data.color,
        price: parsed.data.price,
        stock: parsed.data.stock,
        images: parsed.data.images || [],
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "CREATE_VARIANT",
        entity: "ProductVariant",
        entityId: variant.id,
        newValue: { sku: variant.sku, size: variant.size, color: variant.color },
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      variant: serializeDecimals(variant),
    };
  } catch (error) {
    console.error("[PRODUCT] createVariant error:", error);
    return { success: false, error: "Failed to create variant" };
  }
}

/**
 * Update a product variant (Admin+)
 */
export async function updateVariant(variantId: string, data: UpdateVariantInput) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  const parsed = updateVariantSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: parsed.data,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "UPDATE_VARIANT",
        entity: "ProductVariant",
        entityId: variant.id,
        newValue: parsed.data,
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      variant: serializeDecimals(variant),
    };
  } catch (error) {
    console.error("[PRODUCT] updateVariant error:", error);
    return { success: false, error: "Failed to update variant" };
  }
}

/**
 * Update stock for a variant (Staff+)
 */
export async function updateStock(variantId: string, stock: number) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  const allowedRoles = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id!,
        action: "UPDATE_STOCK",
        entity: "ProductVariant",
        entityId: variant.id,
        newValue: { stock },
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      variant: serializeDecimals(variant),
    };
  } catch (error) {
    console.error("[PRODUCT] updateStock error:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

/**
 * Create a category (Admin+)
 */
export async function createCategory(data: CreateCategoryInput) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  const parsed = createCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error?.issues?.[0]?.message || "Invalid input" };
  }

  try {
    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug,
        parentId: parsed.data.parentId,
        image: parsed.data.image,
        sortOrder: parsed.data.sortOrder || 0,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "CREATE_CATEGORY",
        entity: "Category",
        entityId: category.id,
        newValue: { name: category.name, slug: category.slug },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, category };
  } catch (error) {
    console.error("[PRODUCT] createCategory error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

/**
 * Get all collection IDs that a product belongs to
 */
export async function getProductCollections(productId: string) {
  try {
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        productIds: true,
      },
    });

    const activeCollectionIds = collections
      .filter((col) => {
        const productIds = (col.productIds as string[]) || [];
        return productIds.includes(productId);
      })
      .map((col) => col.id);

    return { success: true, collectionIds: activeCollectionIds };
  } catch (error) {
    console.error("[PRODUCT] getProductCollections error:", error);
    return { success: false, collectionIds: [], error: "Failed to fetch product collections" };
  }
}

/**
 * Update collections a product belongs to (Admin+)
 */
export async function updateProductCollections(productId: string, collectionIds: string[]) {
  const { authorized, error } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    const collections = await prisma.collection.findMany();

    for (const col of collections) {
      const currentProductIds = (col.productIds as string[]) || [];
      const isCurrentlyInCollection = currentProductIds.includes(productId);
      const shouldBeInCollection = collectionIds.includes(col.id);

      if (isCurrentlyInCollection && !shouldBeInCollection) {
        const updated = currentProductIds.filter((id) => id !== productId);
        await prisma.collection.update({
          where: { id: col.id },
          data: { productIds: updated as unknown as object },
        });
      } else if (!isCurrentlyInCollection && shouldBeInCollection) {
        const updated = [...currentProductIds, productId];
        await prisma.collection.update({
          where: { id: col.id },
          data: { productIds: updated as unknown as object },
        });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/collections");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[PRODUCT] updateProductCollections error:", error);
    return { success: false, error: "Failed to update product collections" };
  }
}

/**
 * Bulk update stock for multiple variants in a single transaction (Staff+)
 */
export async function bulkUpdateStock(updates: { variantId: string; stock: number }[]) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  const allowedRoles = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  if (!updates || updates.length === 0) {
    return { success: false, error: "No updates provided" };
  }

  try {
    // Perform bulk updates inside a single secure transactional block
    await prisma.$transaction(
      updates.map((up) =>
        prisma.productVariant.update({
          where: { id: up.variantId },
          data: { stock: up.stock },
        })
      )
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id!,
        action: "BULK_UPDATE_STOCK",
        entity: "ProductVariant",
        entityId: "BULK",
        newValue: { updates },
      },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("[PRODUCT] bulkUpdateStock error:", error);
    return { success: false, error: "Failed to bulk update stock" };
  }
}

/**
 * Excel-style Bulk Update Products & Variants
 */
export async function bulkUpdateProductsAndVariants(data: {
  products: { id: string; basePrice: number; status: string }[];
  variants: { id: string; stock: number; price: number; sku: string }[];
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  const allowedRoles = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Update Products
      for (const p of data.products) {
        await tx.product.update({
          where: { id: p.id },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { basePrice: p.basePrice, status: p.status as any },
        });
      }
      // Update Variants
      for (const v of data.variants) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { stock: v.stock, price: v.price, sku: v.sku },
        });
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id!,
        action: "BULK_UPDATE_EXCEL",
        entity: "Product",
        entityId: "BULK",
        newValue: { products: data.products.length, variants: data.variants.length },
      },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[PRODUCT] bulkUpdateProductsAndVariants error:", error);
    return { success: false, error: "Failed to bulk update products" };
  }
}

/**
 * Export products as CSV data (Admin+)
 */
export async function exportProductsCSV() {
  const { authorized, error } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { name: true } },
        variants: { where: { isActive: true } },
      },
    });

    // Create CSV header
    let csv = "ID,Name,Category,Status,BasePrice,SKU,VariantName,Stock,VariantPrice\n";

    // Populate rows
    products.forEach((product) => {
      const pId = product.id;
      const pName = `"${product.name.replace(/"/g, '""')}"`;
      const pCat = `"${product.category.name.replace(/"/g, '""')}"`;
      const pStatus = product.status;
      const pPrice = product.basePrice.toString();

      if (product.variants.length === 0) {
        csv += `${pId},${pName},${pCat},${pStatus},${pPrice},,,,0\n`;
      } else {
        product.variants.forEach((variant) => {
          const vSku = `"${variant.sku.replace(/"/g, '""')}"`;
          const vName = `"${(variant.size || "") + (variant.size && variant.color ? " - " : "") + (variant.color || "")}"`;
          const vStock = variant.stock;
          const vPrice = variant.price.toString();
          csv += `${pId},${pName},${pCat},${pStatus},${pPrice},${vSku},${vName},${vStock},${vPrice}\n`;
        });
      }
    });

    return { success: true, csvData: csv };
  } catch (error) {
    console.error("[PRODUCT] exportProductsCSV error:", error);
    return { success: false, error: "Failed to export products" };
  }
}

/**
 * Import products/variants from CSV data (Admin+)
 * Currently focuses on updating stock and prices for existing SKUs to prevent complex creates via CSV.
 */
export async function importProductsCSV(csvData: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  const allowedRoles = ["MANAGER", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const lines = csvData
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length <= 1 || !lines[0])
      return { success: false, error: "Empty or invalid CSV file" };

    const header = lines[0].split(",");
    const skuIndex = header.indexOf("SKU");
    const stockIndex = header.indexOf("Stock");
    const priceIndex = header.indexOf("VariantPrice");

    if (skuIndex === -1 || stockIndex === -1) {
      return { success: false, error: "CSV must contain SKU and Stock columns" };
    }

    let updatedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Basic CSV parsing handling quotes
      const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
      const row = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        const val = match[1] || "";
        row.push(val.replace(/^"|"$/g, "").replace(/""/g, '"'));
      }

      const sku = row[skuIndex];
      const stock = parseInt(row[stockIndex] || "0", 10);
      let price: number | undefined;

      if (priceIndex !== -1 && row[priceIndex]) {
        price = parseFloat(row[priceIndex]);
      }

      if (sku && !isNaN(stock)) {
        const updateData: { stock: number; price?: number } = { stock };
        if (price !== undefined && !isNaN(price)) {
          updateData.price = price;
        }

        const variant = await prisma.productVariant.findFirst({ where: { sku } });
        if (variant) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: updateData,
          });
          updatedCount++;
        }
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id!,
        action: "IMPORT_CSV",
        entity: "Product",
        entityId: "BULK",
        newValue: { updatedCount },
      },
    });

    revalidatePath("/admin/products");
    return { success: true, updatedCount };
  } catch (error) {
    console.error("[PRODUCT] importProductsCSV error:", error);
    return { success: false, error: "Failed to import products" };
  }
}
