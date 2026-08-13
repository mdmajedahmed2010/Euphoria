"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { bulkUpdateProductsAndVariants } from "@/actions/product.actions";
import { Save, AlertCircle } from "lucide-react";

type ProductVariant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  basePrice: number;
  status: string;
  category: { name: string } | null;
  variants: ProductVariant[];
};

export function ExcelBulkEditor({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [changedCount, setChangedCount] = useState(0);

  // Mark that a change happened
  const triggerChange = () => setChangedCount((c) => c + 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProductChange = (productId: string, field: keyof Product, value: any) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p)));
    triggerChange();
  };

  const handleVariantChange = (
    productId: string,
    variantId: string,
    field: keyof ProductVariant,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variants: p.variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)),
        };
      })
    );
    triggerChange();
  };

  const handleSave = async () => {
    if (changedCount === 0) return toast.info("No changes to save.");

    setIsSaving(true);
    // Flatten updates
    const pUpdates = products.map((p) => ({
      id: p.id,
      basePrice: p.basePrice,
      status: p.status,
    }));
    const vUpdates = products.flatMap((p) =>
      p.variants.map((v) => ({
        id: v.id,
        stock: v.stock,
        price: v.price,
        sku: v.sku,
      }))
    );

    const res = await bulkUpdateProductsAndVariants({ products: pUpdates, variants: vUpdates });
    setIsSaving(false);

    if (res.success) {
      toast.success("All changes saved successfully!");
      setChangedCount(0);
    } else {
      toast.error(res.error || "Failed to save changes");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            Catalog Size: {products.length} Products
          </span>
          {changedCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Unsaved changes
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || changedCount === 0}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100/50 text-gray-500 font-medium uppercase tracking-wider text-[11px] border-b border-gray-200">
              <th className="px-4 py-3 sticky left-0 bg-gray-100/90 backdrop-blur z-10 w-[250px]">
                Product / Variant Name
              </th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Base Price (৳)</th>
              <th className="px-4 py-3">Variant Price (৳)</th>
              <th className="px-4 py-3">Stock Qty</th>
              <th className="px-4 py-3">SKU</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-xs">
            {products.map((product) => (
              <React.Fragment key={product.id}>
                {/* Product Master Row */}
                <tr className="bg-gray-50/30 hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-indigo-50/30 transition-colors z-10 font-sans font-bold text-gray-900 border-r border-gray-100">
                    <div className="truncate max-w-[230px]">{product.name}</div>
                  </td>
                  <td className="px-4 py-3 font-sans text-gray-500">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={product.status}
                      onChange={(e) => handleProductChange(product.id, "status", e.target.value)}
                      className="bg-transparent border border-gray-200 rounded px-2 py-1 outline-none focus:border-indigo-500 font-sans cursor-pointer w-32"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={product.basePrice}
                      onChange={(e) =>
                        handleProductChange(product.id, "basePrice", Number(e.target.value))
                      }
                      className="w-24 bg-transparent border border-gray-200 rounded px-2 py-1 outline-none focus:border-indigo-500 focus:bg-white text-right font-bold text-gray-900"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-center">—</td>
                  <td className="px-4 py-3 text-gray-300 text-center">—</td>
                  <td className="px-4 py-3 text-gray-300 text-center">—</td>
                </tr>
                {/* Variant Rows */}
                {product.variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-4 py-2 sticky left-0 bg-white group-hover:bg-blue-50/50 transition-colors z-10 border-r border-gray-100 pl-8">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-3 h-px bg-gray-300"></div>
                        <span className="truncate max-w-[190px]">
                          {variant.size || variant.color
                            ? `${variant.size || ""} ${variant.size && variant.color ? "/" : ""} ${variant.color || ""}`
                            : "Default Variant"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-300 text-center">—</td>
                    <td className="px-4 py-2 text-gray-300 text-center">—</td>
                    <td className="px-4 py-2 text-gray-300 text-center">—</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            product.id,
                            variant.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        className="w-24 bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right text-gray-800"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(
                            product.id,
                            variant.id,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                        className={`w-20 bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right font-bold ${variant.stock < 5 ? "text-red-600 bg-red-50" : "text-gray-800"}`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          handleVariantChange(product.id, variant.id, "sku", e.target.value)
                        }
                        className="w-32 bg-transparent border border-transparent hover:border-gray-200 focus:border-indigo-500 rounded px-2 py-1 outline-none focus:bg-white text-gray-600 transition-colors"
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
