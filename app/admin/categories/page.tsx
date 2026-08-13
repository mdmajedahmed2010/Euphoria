/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Sitara — Admin Categories Page
 * SOP §৬A — Structural Category Directory UI
 */

import { getAdminCategories } from "@/actions/category.actions";
import Link from "next/link";
import Image from "next/image";
import { Folder, FolderOpen, Plus, Search, Edit2, Layers, Tag } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    redirect("/admin");
  }

  const { q = "" } = await searchParams;
  const result = await getAdminCategories();
  const categoriesRaw = result.categories || [];

  // Metrics calculations
  const totalCategories = categoriesRaw.length;
  const activeCategoriesCount = categoriesRaw.filter((c: any) => c.isActive).length;
  const subcategoriesCount = categoriesRaw.filter((c: any) => c.parentId).length;

  // Filter list
  const filteredCategories = categoriesRaw.filter((c: any) => {
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.slug.toLowerCase().includes(q.toLowerCase())
    );
  });

  // Group by parent-child hierarchy
  const rootCategories = filteredCategories.filter((c: any) => !c.parentId);
  const childCategories = categoriesRaw.filter((c: any) => c.parentId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="h-6 w-6 text-gray-800" />
            Categories Suite
          </h1>
          <p className="text-sm text-gray-500">
            Define, structure, and prioritize structural product groupings.
          </p>
        </div>
        <div>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Category</span>
          </Link>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Total Directory</span>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalCategories}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
            <Folder className="h-5 w-5" />
          </div>
        </div>

        {/* Active Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">
              Active Structural Categories
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCategoriesCount}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50/70 text-emerald-600">
            <Tag className="h-5 w-5" />
          </div>
        </div>

        {/* Subcategories Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Subcategories Nesting</span>
            <p className="mt-1 text-2xl font-bold text-blue-600">{subcategoriesCount}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FolderOpen className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-gray-200/85 bg-white p-4 shadow-sm">
        <form method="GET" className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by category name, slug..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-gray-400 focus:bg-white focus:outline-none transition-all"
          />
        </form>
      </div>

      {/* Categories Nested Directory Tree Grid */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50/40">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Categories Catalog Tree</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Reflecting structural configurations for storefront catalogs
            </p>
          </div>
          <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-mono text-gray-600 uppercase">
            Directory
          </span>
        </div>

        {/* Hierarchy List Wrapper */}
        <div className="divide-y divide-gray-100">
          {rootCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Folder className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">
                {q ? `No categories found for “${q}”` : "No categories configured yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click &ldquo;Create Category&rdquo; at the top right to start building your catalog
                structure.
              </p>
            </div>
          ) : (
            rootCategories.map((parent: any) => {
              const children = childCategories.filter((c: any) => c.parentId === parent.id);

              return (
                <div key={parent.id} className="bg-white">
                  {/* Parent Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50/40 transition-colors">
                    <div className="flex items-center gap-3.5">
                      {/* Category Thumbnail */}
                      <div className="relative h-10 w-16 overflow-hidden rounded-lg border border-gray-100 bg-gray-50/50">
                        {parent.image ? (
                          <Image
                            src={parent.image}
                            alt={parent.name}
                            fill
                            className="object-cover"
                            sizes="60px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-50">
                            <Folder className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{parent.name}</p>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.25 rounded">
                            Order: {parent.sortOrder}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">/{parent.slug}</p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      {/* Product Count Badge */}
                      <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50/50 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        {parent._count?.products || 0} product(s)
                      </span>

                      {/* Status Toggle */}
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          parent.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {parent.isActive ? "Active" : "Draft"}
                      </span>

                      {/* Actions */}
                      <Link
                        href={`/admin/categories/${parent.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Children Rows (Hierarchical tree list) */}
                  {children.length > 0 && (
                    <div className="bg-gray-50/20 divide-y divide-gray-100/50 border-t border-gray-100/50">
                      {children.map((child: any) => (
                        <div
                          key={child.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-12 pr-5 py-3.5 hover:bg-gray-50/60 transition-colors relative"
                        >
                          {/* Hierarchical L-Tree Line Connector in CSS */}
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center">
                            <div className="border-l-2 border-b-2 border-gray-200/80 w-3 h-5 rounded-bl-lg -mt-5" />
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Subcategory Icon Thumbnail */}
                            <div className="relative h-8 w-12 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                              {child.image ? (
                                <Image
                                  src={child.image}
                                  alt={child.name}
                                  fill
                                  className="object-cover"
                                  sizes="50px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-50">
                                  <FolderOpen className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-gray-800">{child.name}</p>
                                <span className="text-[9px] font-mono text-gray-400">
                                  Order: {child.sortOrder}
                                </span>
                              </div>
                              <p className="text-[9px] font-mono text-gray-400">/{child.slug}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 justify-between sm:justify-end">
                            <span className="text-[10px] text-gray-400 italic">
                              Subcategory of {parent.name}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50/50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                              {child._count?.products || 0} product(s)
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                child.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}
                            >
                              {child.isActive ? "Active" : "Draft"}
                            </span>
                            <Link
                              href={`/admin/categories/${child.id}/edit`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                              title="Edit Subcategory"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
