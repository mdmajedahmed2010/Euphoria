"use client";

/**
 * Euphoria — Low Stock Quick-Action Update Widget
 * Highly interactive card showing variants running low on stock (< 5)
 * allowing admins to quick-update stock values directly from the main dashboard.
 */

import { useState } from "react";
import { updateStock } from "@/actions/product.actions";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface VariantItem {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  product: {
    name: string;
  };
}

export function QuickStockUpdate({ initialItems }: { initialItems: VariantItem[] }) {
  const [items, setItems] = useState<VariantItem[]>(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>(() => {
    const inputs: Record<string, number> = {};
    initialItems.forEach((item) => {
      inputs[item.id] = item.stock;
    });
    return inputs;
  });

  const handleUpdate = async (id: string) => {
    const stock = stockInputs[id];
    if (stock === undefined || isNaN(stock) || stock < 0) {
      toast.error("Invalid stock value");
      return;
    }

    setUpdatingId(id);
    const res = await updateStock(id, stock);
    setUpdatingId(null);

    if (res.success) {
      toast.success("Stock updated successfully");
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, stock } : item)));
    } else {
      toast.error(res.error || "Failed to update stock");
    }
  };

  const handleInputChange = (id: string, val: string) => {
    const stock = parseInt(val, 10);
    setStockInputs((prev) => ({ ...prev, [id]: isNaN(stock) ? 0 : stock }));
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4.5 w-4.5 text-emerald-500" />
          <h2 className="text-sm font-semibold text-gray-900">Inventory Status</h2>
        </div>
        <p className="text-xs text-gray-500 text-center py-6">
          All products are healthy and fully stocked!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 animate-bounce" />
          <h2 className="text-sm font-semibold text-gray-900">Low Stock Alert</h2>
        </div>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
          Needs Attention
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{item.product.name}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                {item.sku} {item.size ? `• Size: ${item.size}` : ""}{" "}
                {item.color ? `• Color: ${item.color}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                {item.stock} left
              </span>

              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <input
                  type="number"
                  min={0}
                  className="w-12 text-center text-xs font-semibold py-1 bg-transparent border-none focus:outline-none"
                  value={stockInputs[item.id] ?? 0}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                />
                <button
                  onClick={() => handleUpdate(item.id)}
                  disabled={updatingId === item.id}
                  className="bg-gray-900 text-white p-1.5 hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
                  title="Quick Save"
                >
                  {updatingId === item.id ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
