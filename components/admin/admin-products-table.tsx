"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Edit, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { ProductStatusBadge } from "@/components/admin/product-status-badge";
import { Sparkline } from "@/components/admin/sparkline";
import { deleteProductsBulk, deleteProduct } from "@/actions/product.actions";
import { useRouter } from "next/navigation";

function getSimulatedStockTrend(productId: string, currentStock: number): number[] {
  let seed = 0;
  for (let i = 0; i < productId.length; i++) {
    seed += productId.charCodeAt(i);
  }
  const trend: number[] = [];
  let tempStock = currentStock;
  for (let i = 0; i < 7; i++) {
    trend.unshift(tempStock);
    const step = (seed + i) % 4;
    tempStock += step;
  }
  return trend;
}

interface ProductItem {
  id: string;
  name: string;
  basePrice: number | string;
  status: string;
  category?: { name: string } | null;
  variants: { stock: number }[];
}

interface AdminProductsTableProps {
  products: ProductItem[];
  search?: string;
}

export function AdminProductsTable({ products, search }: AdminProductsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const allSelected = products.length > 0 && selectedIds.length === products.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected product(s)?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteProductsBulk(selectedIds);
      if (res.success) {
        setSelectedIds([]);
        router.refresh();
      } else {
        alert(res.error || "Failed to delete products");
      }
    });
  };

  const handleSingleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
        router.refresh();
      } else {
        alert(res.error || "Failed to delete product");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Banner */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-900 shadow-sm transition-all">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">
              {selectedIds.length} product{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              disabled={isPending}
              className="text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isPending ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
              <th className="w-12 px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  title="Select All"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-gray-900" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Trend</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                  {search
                    ? `No products found for "${search}"`
                    : "No products yet. Create your first product!"}
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                const isSelected = selectedIds.includes(product.id);

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${
                      isSelected ? "bg-red-50/40 hover:bg-red-50/70" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="w-12 px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(product.id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-red-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.variants.length} variant(s)
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ৳{Number(product.basePrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          totalStock === 0
                            ? "text-red-600"
                            : totalStock < 5
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Sparkline
                        data={getSimulatedStockTrend(product.id, totalStock)}
                        currentStock={totalStock}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                          title="Edit Product"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleSingleDelete(product.id, product.name)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
