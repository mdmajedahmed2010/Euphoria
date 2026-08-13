/**
 * Euphoria — Product Validation Schemas (Zod)
 * SOP §৪B — Input Validation (Admin operations)
 */

import { z } from "zod";

// Create product schema (Admin)
export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.number().positive("Price must be positive").max(999999, "Price is too high"),
  compareAtPrice: z
    .number()
    .positive("Discount price must be positive")
    .max(999999, "Discount price is too high")
    .nullable()
    .optional(),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "ACTIVE"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(60, "SEO title max 60 characters").optional(),
  seoDesc: z.string().max(160, "SEO description max 160 characters").optional(),
});

// Update product schema (Admin)
export const updateProductSchema = createProductSchema.partial();

// Create variant schema (Admin)
export const createVariantSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  size: z.string().max(50, "Size is too long").optional(),
  color: z.string().max(50, "Color is too long").optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string().url("Invalid image URL").max(1000, "Image URL too long")).max(10, "Maximum 10 images allowed").optional(),
});

// Update variant schema (Admin)
export const updateVariantSchema = z.object({
  size: z.string().max(50, "Size is too long").optional(),
  color: z.string().max(50, "Color is too long").optional(),
  price: z.number().positive("Price must be positive").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  images: z.array(z.string().url("Invalid image URL").max(1000, "Image URL too long")).max(10, "Maximum 10 images allowed").optional(),
  isActive: z.boolean().optional(),
});

// Update stock schema (Staff+)
export const updateStockSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

// Create category schema (Admin)
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name is too long"),
  parentId: z.string().optional(),
  image: z.string().url("Invalid image URL").optional(),
  sortOrder: z.number().int().default(0),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
