"use client";

/**
 * Euphoria — Bulk Stock Management Form (Interactive)
 * Premium spreadsheet-like interface for managing stock quantities
 */

import { useState, useTransition, useMemo } from "react";
import { bulkUpdateStock } from "@/actions/product.actions";
import { toast } from "sonner";
import {
  Search,
  AlertTriangle,
  Save,
  Package,
  RefreshCw,
  SlidersHorizontal,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

interface VariantInfo {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
}

interface ProductWithVariants {
  id: string;
  name: string;
  category: { name: string };
  variants: VariantInfo[];
}

interface BulkStockFormProps {
  products: ProductWithVariants[];
}

export default function BulkStockForm({ products }: BulkStockFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  // Handle stock input change
  const handleStockChange = (variantId: string, value: string, originalStock: number) => {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 0) return;

    if (parsed === originalStock) {
      const updated = { ...stockChanges };
      delete updated[variantId];
      setStockChanges(updated);
    } else {
      setStockChanges((prev) => ({
        ...prev,
        [variantId]: parsed,
      }));
    }
  };

  // Check if there are any changes
  const hasChanges = Object.keys(stockChanges).length > 0;

  // Flatten products and variants for searchable inventory spreadsheet rows
  const inventoryRows = useMemo(() => {
    const rows: {
      productId: string;
      productName: string;
      categoryName: string;
      variantId: string;
      sku: string;
      size: string | null;
      color: string | null;
      price: number;
      originalStock: number;
      currentStock: number;
    }[] = [];

    products.forEach((prod) => {
      prod.variants.forEach((v) => {
        const changedStock = stockChanges[v.id];
        const modifiedStock = typeof changedStock === "number" ? changedStock : v.stock;

        rows.push({
          productId: prod.id,
          productName: prod.name,
          categoryName: prod.category.name,
          variantId: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: Number(v.price),
          originalStock: v.stock,
          currentStock: modifiedStock,
        });
      });
    });

    return rows;
  }, [products, stockChanges]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return inventoryRows.filter((row) => {
      const matchesSearch =
        row.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLowStock = showLowStockOnly ? row.currentStock < 5 : true;

      return matchesSearch && matchesLowStock;
    });
  }, [inventoryRows, searchTerm, showLowStockOnly]);

  // Calculate totals
  const lowStockCount = useMemo(() => {
    return inventoryRows.filter((row) => row.currentStock < 5).length;
  }, [inventoryRows]);

  // Save changes
  const handleSave = () => {
    if (!hasChanges) return;

    const updates = Object.entries(stockChanges).map(([variantId, stock]) => ({
      variantId,
      stock,
    }));

    startTransition(async () => {
      const res = await bulkUpdateStock(updates);
      if (res.success) {
        toast.success("Inventory stock metrics successfully updated!", {
          description: `Synchronized ${updates.length} variants in database.`,
        });
        setStockChanges({});
      } else {
        toast.error("Failed to save inventory updates", {
          description: res.error || "Please verify your parameters and try again.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Total Variants</span>
            <p className="mt-1 text-2xl font-bold text-gray-900">{inventoryRows.length}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Critically Low Stock</span>
            <p className="mt-1 text-2xl font-bold text-rose-600">{lowStockCount}</p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${lowStockCount > 0 ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-400"}`}
          >
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Pending Changes</span>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {Object.keys(stockChanges).length}
            </p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${hasChanges ? "bg-blue-50 text-blue-600 animate-pulse" : "bg-gray-50 text-gray-400"}`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Control Panel: Search and Toggles */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Quick search by product name, SKU, or category..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Low Stock Toggle & Action Button */}
        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              Show Low Stock Only (&lt; 5)
            </span>
          </label>

          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save {Object.keys(stockChanges).length} updates
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Stock Grid */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Catalog Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Variant Options</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-center">Base Stock</th>
                <th className="px-6 py-3 text-center min-w-[120px]">New Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products or variants found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const hasPendingChange = stockChanges[row.variantId] !== undefined;
                  const isLow = row.currentStock < 5;

                  return (
                    <tr
                      key={row.variantId}
                      className={`transition-colors ${
                        hasPendingChange
                          ? "bg-blue-50/20 hover:bg-blue-50/30"
                          : "hover:bg-gray-50/30"
                      }`}
                    >
                      {/* Product details */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/products`}
                            className="font-bold text-gray-900 hover:text-blue-600 hover:underline max-w-[200px] truncate"
                          >
                            {row.productName}
                          </Link>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                          {row.categoryName}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-[10px] text-gray-500 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                          {row.sku}
                        </span>
                      </td>

                      {/* Options */}
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {row.size && (
                            <span className="bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                              S: {row.size}
                            </span>
                          )}
                          {row.color && (
                            <span className="bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                              C: {row.color}
                            </span>
                          )}
                          {!row.size && !row.color && (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-3.5 text-right font-mono text-gray-900 font-medium">
                        ৳{row.price.toLocaleString("en-BD")}
                      </td>

                      {/* Base Stock Indicator */}
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            row.originalStock < 5
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {row.originalStock}
                        </span>
                      </td>

                      {/* New Stock Input */}
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={
                              stockChanges[row.variantId] !== undefined
                                ? stockChanges[row.variantId]
                                : row.originalStock
                            }
                            onChange={(e) =>
                              handleStockChange(row.variantId, e.target.value, row.originalStock)
                            }
                            className={`w-16 rounded-lg border px-2 py-1 text-center font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                              hasPendingChange
                                ? "border-blue-300 bg-blue-50 text-blue-700 focus:border-blue-500"
                                : isLow
                                  ? "border-rose-200 bg-rose-50/30 text-rose-700 focus:border-rose-500"
                                  : "border-gray-200 bg-gray-50/50 text-gray-800 focus:border-blue-500 focus:bg-white"
                            }`}
                          />
                          {hasPendingChange && (
                            <button
                              onClick={() => {
                                const updated = { ...stockChanges };
                                delete updated[row.variantId];
                                setStockChanges(updated);
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Reset
                            </button>
                          )}
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
    </div>
  );
}
