"use client";

/**
 * Euphoria — Edit Category Form (Admin)
 * SOP §৬A — Structural Category edit with loops prevention & verified upload
 */

import { updateCategory, deleteCategory } from "@/actions/category.actions";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { ImageUpload } from "./image-upload";
import { Layers, ArrowLeft, Loader2, Trash2, Check, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface EditCategoryFormProps {
  category: Category;
  categories: { id: string; name: string; parentId: string | null }[];
}

export function EditCategoryForm({ category, categories }: EditCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(category.image);
  const [isActive, setIsActive] = useState<boolean>(category.isActive);

  // Recursively find all child subcategory IDs (descendants) to prevent looping hierarchies
  const selectableCategories = useMemo(() => {
    function getDescendantIds(catId: string): string[] {
      const children = categories.filter((c) => c.parentId === catId);
      const childIds = children.map((c) => c.id);
      const subChildIds = childIds.flatMap((id) => getDescendantIds(id));
      return [...childIds, ...subChildIds];
    }

    const descendants = getDescendantIds(category.id);
    // Selectable: not itself and not any of its descendants
    return categories.filter((cat) => cat.id !== category.id && !descendants.includes(cat.id));
  }, [category.id, categories]);

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
      isActive,
    };

    const result = await updateCategory(category.id, data);
    setLoading(false);

    if (result.success) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      setError(result.error || "Failed to update category");
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you absolutely sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    const result = await deleteCategory(category.id);
    setDeleteLoading(false);

    if (result.success) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      setError(result.error || "Failed to delete category");
    }
  }

  return (
    <div className="space-y-6">
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
            defaultValue={category.name}
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
              defaultValue={category.parentId || ""}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-gray-400 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">None (Top-Level Category)</option>
              {selectableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Layers className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Note: Descendant categories are hidden to prevent circular relationship errors.
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
            defaultValue={category.sortOrder}
            min={0}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-gray-400 focus:outline-none transition-all"
          />
          <p className="mt-1 text-xs text-gray-400">
            Lower numbers will be prioritized and displayed first in menus (e.g., 0, 1, 2)
          </p>
        </div>

        {/* Status Toggle Badge */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-[0.98] ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {isActive && <Check className="h-3.5 w-3.5" />}
              <span>Active</span>
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-[0.98] ${
                !isActive
                  ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {!isActive && <Check className="h-3.5 w-3.5" />}
              <span>Draft / Inactive</span>
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Draft categories are hidden on the storefront menus
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
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-xs font-semibold text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit / Cancel / Delete Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
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
                <span>Update Category</span>
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

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/20 text-rose-700 px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:bg-rose-50 active:scale-[0.98] disabled:opacity-50"
          >
            {deleteLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Delete Category</span>
          </button>
        </div>
      </form>
    </div>
  );
}
