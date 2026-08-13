"use client";

/**
 * Euphoria — Create Product Form (Advanced)
 * Now with image upload, multi-image support
 */

import { createProduct, createVariant, updateProductCollections } from "@/actions/product.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "./image-upload";
import { Save, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
}

interface CreateProductFormProps {
  categories: Category[];
  collections: Collection[];
}

export function CreateProductForm({ categories, collections }: CreateProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{label: string, value: string}[]>([]);

  // Initial variant
  const [variantSize, setVariantSize] = useState("Free Size");
  const [variantColor, setVariantColor] = useState("");
  const [variantStock, setVariantStock] = useState(10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (images.length === 0) {
      setError("Please upload at least one product image");
      setLoading(false);
      return;
    }

    try {
      // 1. Create product
      const productResult = await createProduct({
        name,
        description,
        basePrice: parseFloat(basePrice),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId,
        status,
        isFeatured,
        seoTitle: seoTitle || undefined,
        seoDesc: seoDesc || undefined,
      });

      if (!productResult.success || !productResult.product) {
        setError(productResult.error || "Failed to create product");
        setLoading(false);
        return;
      }

      // 2. Assign collections
      if (selectedCollectionIds.length > 0) {
        await updateProductCollections(productResult.product.id, selectedCollectionIds);
      }

      // 3. Create all split variants!
      const sizes = variantSize
        ? variantSize
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : ["Free Size"];
      const colors = variantColor
        ? variantColor
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : ["As Shown"];

      for (const size of sizes) {
        for (const color of colors) {
          await createVariant({
            productId: productResult.product.id,
            size: size || "Free Size",
            color: color || "As Shown",
            price: parseFloat(basePrice),
            stock: variantStock,
            images: images,
          });
        }
      }

      router.push(`/admin/products/${productResult.product.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="e.g., Teal Paisley Block Print Cotton Saree"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Detailed product description..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Base Price (৳) *
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                min={1}
                step="0.01"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="2000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Compare at Price (Original/Crossed-out) (৳)
              </label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                min={1}
                step="0.01"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="e.g., 2500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select category</option>
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

          {/* Specifications */}
          <div className="border-t border-gray-100 pt-4 mt-4">
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
                    className="w-1/3 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => {
                      const newSpecs = specifications.map((s, i) => i === index ? { ...s, value: e.target.value } : s);
                      setSpecifications(newSpecs);
                    }}
                    placeholder="e.g. Crape Silk"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
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
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Product Images</h2>
        <ImageUpload
          images={images}
          onChange={setImages}
          maxImages={6}
          folder="products"
          label=""
        />
      </div>

      {/* Initial Variant */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Initial Variant</h2>
        <p className="mb-4 text-xs text-gray-500">
          You can add more variants after creating the product
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Size</label>
            <input
              type="text"
              value={variantSize}
              onChange={(e) => setVariantSize(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              placeholder="e.g., M, Free Size"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Color</label>
            <input
              type="text"
              value={variantColor}
              onChange={(e) => setVariantColor(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              placeholder="e.g., Red"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Stock *</label>
            <input
              type="number"
              value={variantStock}
              onChange={(e) => setVariantStock(parseInt(e.target.value) || 0)}
              min={0}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Status & SEO */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Status & SEO</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "ACTIVE")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="ACTIVE">Active (Visible in store)</option>
                <option value="DRAFT">Draft (Hidden)</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              SEO Title (optional, max 60)
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              maxLength={60}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              SEO Description (optional, max 160)
            </label>
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              maxLength={160}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
