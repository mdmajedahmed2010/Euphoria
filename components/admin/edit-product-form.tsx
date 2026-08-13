"use client";

/**
 * Euphoria — Edit Product Form (Admin)
 * Includes product details + variant management
 */

import {
  updateProduct,
  createVariant,
  updateVariant,
  deleteProduct,
  updateProductCollections,
} from "@/actions/product.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

interface Variant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  images: unknown;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  categoryId: string;
  status: string;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
  variants: Variant[];
}

interface EditProductFormProps {
  product: Product;
  categories: Category[];
  collections: Collection[];
  initialCollectionIds: string[];
}

export function EditProductForm({
  product,
  categories,
  collections,
  initialCollectionIds,
}: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [variants, setVariants] = useState(product.variants);
  const [selectedCollectionIds, setSelectedCollectionIds] =
    useState<string[]>(initialCollectionIds);
  const [specifications, setSpecifications] = useState<{label: string, value: string}[]>([]);

  // Variant form state
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    price: product.basePrice,
    stock: 0,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    const comparePriceInput = formData.get("compareAtPrice") as string;
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      basePrice: parseFloat(formData.get("basePrice") as string),
      compareAtPrice: comparePriceInput ? parseFloat(comparePriceInput) : null,
      categoryId: formData.get("categoryId") as string,
      status: formData.get("status") as "DRAFT" | "ACTIVE",
      isFeatured: formData.get("isFeatured") === "on",
      seoTitle: (formData.get("seoTitle") as string) || undefined,
      seoDesc: (formData.get("seoDesc") as string) || undefined,
    };

    const result = await updateProduct(product.id, data);

    if (result.success) {
      // Save collections
      const colResult = await updateProductCollections(product.id, selectedCollectionIds);
      if (colResult.success) {
        setSuccess("Product and collections updated successfully!");
      } else {
        setError(colResult.error || "Failed to update collections");
      }
    } else {
      setError(result.error || "Failed to update product");
    }
    setLoading(false);
  }

  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const sizes = newVariant.size
      ? newVariant.size
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : ["Free Size"];
    const colors = newVariant.color
      ? newVariant.color
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : ["As Shown"];

    let successCount = 0;
    const addedVariants: Variant[] = [];

    for (const size of sizes) {
      for (const color of colors) {
        const result = await createVariant({
          productId: product.id,
          size: size || "Free Size",
          color: color || "As Shown",
          price: newVariant.price,
          stock: newVariant.stock,
        });

        if (result.success && result.variant) {
          successCount++;
          addedVariants.push({
            ...result.variant,
            price: Number(result.variant.price),
          } as unknown as Variant);
        }
      }
    }

    if (successCount > 0) {
      setVariants([...variants, ...addedVariants]);
      setShowVariantForm(false);
      setNewVariant({ size: "", color: "", price: product.basePrice, stock: 0 });
      setSuccess(`Successfully added ${successCount} variant(s)!`);
    } else {
      setError("Failed to add variant(s)");
    }
  }

  async function handleUpdateVariantStock(variantId: string, stock: number) {
    const result = await updateVariant(variantId, { stock });
    if (result.success) {
      setVariants(variants.map((v) => (v.id === variantId ? { ...v, stock } : v)));
    }
  }

  async function handleToggleVariant(variantId: string, isActive: boolean) {
    const result = await updateVariant(variantId, { isActive });
    if (result.success) {
      setVariants(variants.map((v) => (v.id === variantId ? { ...v, isActive } : v)));
    }
  }

  async function handleDeleteProduct() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    const result = await deleteProduct(product.id);
    if (result.success) {
      router.push("/admin/products");
    } else {
      setError(result.error || "Failed to delete product");
    }
  }

  return (
    <div className="space-y-6">
      {/* Product Details Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>

        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={product.name}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            defaultValue={product.description}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="basePrice" className="mb-1 block text-sm font-medium text-gray-700">
              Base Price (৳) *
            </label>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              required
              min={1}
              step="0.01"
              defaultValue={product.basePrice}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="compareAtPrice"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Compare at Price (Original/Crossed-out) (৳)
            </label>
            <input
              type="number"
              id="compareAtPrice"
              name="compareAtPrice"
              min={1}
              step="0.01"
              defaultValue={product.compareAtPrice || ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
              placeholder="e.g., 2500"
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product.categoryId}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <label className="mb-2 block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Marketing Collections
            </label>
            <div className="flex flex-wrap gap-2.5">
              {collections.map((col) => {
                const isSelected = selectedCollectionIds.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCollectionIds(
                          selectedCollectionIds.filter((id) => id !== col.id)
                        );
                      } else {
                        setSelectedCollectionIds([...selectedCollectionIds, col.id]);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                    {col.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status + Featured */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product.isFeatured}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="border-t border-gray-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Product Specifications (Optional)
            </label>
            <button
              type="button"
              onClick={() => setSpecifications([...specifications, { label: "", value: "" }])}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              + Add Spec
            </button>
          </div>
          <div className="space-y-2">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={spec.label}
                  onChange={(e) => {
                    const newSpecs = specifications.map((s, i) => i === index ? { ...s, label: e.target.value } : s);
                    setSpecifications(newSpecs);
                  }}
                  placeholder="e.g. Fabric"
                  className="w-1/3 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => {
                    const newSpecs = specifications.map((s, i) => i === index ? { ...s, value: e.target.value } : s);
                    setSpecifications(newSpecs);
                  }}
                  placeholder="e.g. Crape Silk"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSpecifications(specifications.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 px-2 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            {specifications.length === 0 && (
              <p className="text-xs text-gray-500">No specifications added yet. Add variants like Outfit, Fabric, Body size, etc.</p>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">SEO (Optional)</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="seoTitle" className="mb-1 block text-sm font-medium text-gray-700">
                SEO Title
              </label>
              <input
                type="text"
                id="seoTitle"
                name="seoTitle"
                maxLength={60}
                defaultValue={product.seoTitle || ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="seoDesc" className="mb-1 block text-sm font-medium text-gray-700">
                SEO Description
              </label>
              <textarea
                id="seoDesc"
                name="seoDesc"
                maxLength={160}
                rows={2}
                defaultValue={product.seoDesc || ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleDeleteProduct}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Product
          </button>
        </div>
      </form>

      {/* Variants Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Variants ({variants.length})</h2>
          <button
            onClick={() => setShowVariantForm(!showVariantForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>
        </div>

        {/* Add Variant Form */}
        {showVariantForm && (
          <form
            onSubmit={handleAddVariant}
            className="mb-4 space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Size</label>
                <input
                  type="text"
                  value={newVariant.size}
                  onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                  placeholder="e.g., M, L, XL"
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Color</label>
                <input
                  type="text"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  placeholder="e.g., Red, Blue"
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Price (৳)</label>
                <input
                  type="number"
                  value={newVariant.price}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, price: parseFloat(e.target.value) })
                  }
                  min={1}
                  required
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Stock</label>
                <input
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })
                  }
                  min={0}
                  required
                  className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Add Variant
              </button>
              <button
                type="button"
                onClick={() => setShowVariantForm(false)}
                className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Variants List */}
        {variants.length === 0 ? (
          <p className="text-sm text-gray-500">
            No variants yet. Add at least one variant with size/color/stock.
          </p>
        ) : (
          <div className="space-y-2">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  variant.isActive ? "border-gray-200" : "border-red-100 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Size: {variant.size && variant.size !== "null" && variant.size !== "undefined" ? variant.size : "Free Size"}
                      {" • "}
                      Color: {variant.color && variant.color !== "null" && variant.color !== "undefined" ? variant.color : "As Shown"}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">৳{variant.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Stock:</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleUpdateVariantStock(variant.id, parseInt(e.target.value) || 0)
                      }
                      min={0}
                      className="w-16 rounded border border-gray-200 px-2 py-1 text-center text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleToggleVariant(variant.id, !variant.isActive)}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      variant.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {variant.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
