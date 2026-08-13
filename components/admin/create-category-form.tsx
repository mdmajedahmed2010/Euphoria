"use client";

/**
 * Euphoria — Create Category Form (Admin)
 * SOP §৬A — Structural Category creation with verified image upload
 */

import { createCategory } from "@/actions/category.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "./image-upload";
import { Layers, ArrowLeft, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CreateCategoryFormProps {
  categories: Category[];
}

export function CreateCategoryForm({ categories }: CreateCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      parentId: (formData.get("parentId") as string) || null,
      sortOrder: parseInt((formData.get("sortOrder") as string) || "0"),
      image: image || null,
    };

    const result = await createCategory(data);
    setLoading(false);

    if (result.success) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      setError(result.error || "Failed to create category");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Category Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={2}
          placeholder="e.g., Punjabi, T-Shirts, Premium Shoes"
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-gray-400 focus:outline-none transition-all"
        />
      </div>

      {/* Parent Category Selection */}
      <div>
        <label htmlFor="parentId" className="mb-1.5 block text-sm font-medium text-gray-700">
          Parent Category (Optional)
        </label>
        <div className="relative">
          <select
            id="parentId"
            name="parentId"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-gray-400 focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">None (Top-Level Category)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Layers className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Leave as None if this is a top-level category (e.g. Men&apos;s Wear)
        </p>
      </div>

      {/* Numerical Sort Order */}
      <div>
        <label htmlFor="sortOrder" className="mb-1.5 block text-sm font-medium text-gray-700">
          Sort Order Prioritization
        </label>
        <input
          type="number"
          id="sortOrder"
          name="sortOrder"
          defaultValue={0}
          min={0}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-gray-400 focus:outline-none transition-all"
        />
        <p className="mt-1 text-xs text-gray-400">
          Lower numbers will be prioritized and displayed first in menus (e.g., 0, 1, 2)
        </p>
      </div>

      {/* Category Image Upload Widget */}
      <div className="pt-2">
        <ImageUpload
          images={image ? [image] : []}
          onChange={(urls) => setImage(urls[0] || null)}
          single
          folder="categories"
          label="Category Banner / Icon Image"
          aspectRatio="aspect-video"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Submit / Cancel Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Category</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
}
