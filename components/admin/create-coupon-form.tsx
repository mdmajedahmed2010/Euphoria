"use client";

/**
 * Euphoria — Create Coupon Form (Admin)
 */

import { createCoupon } from "@/actions/coupon.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateCouponForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const expiresAtRaw = formData.get("expiresAt") as string;
    const data = {
      code: (formData.get("code") as string).toUpperCase(),
      type: formData.get("type") as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
      value: parseFloat(formData.get("value") as string),
      minOrder: formData.get("minOrder")
        ? parseFloat(formData.get("minOrder") as string)
        : undefined,
      maxUses: formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : undefined,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw).toISOString() : undefined,
    };

    const result = await createCoupon(data);
    setLoading(false);

    if (result.success) {
      router.push("/admin/coupons");
    } else {
      setError(result.error || "Failed to create coupon");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
    >
      {/* Coupon Code */}
      <div>
        <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">
          Coupon Code *
        </label>
        <input
          type="text"
          id="code"
          name="code"
          required
          minLength={3}
          maxLength={20}
          placeholder="e.g., Euphoria20, EID2026"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-sm uppercase focus:border-gray-400 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">Will be auto-converted to uppercase</p>
      </div>

      {/* Type + Value */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
            Discount Type *
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (৳)</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
          </select>
        </div>
        <div>
          <label htmlFor="value" className="mb-1 block text-sm font-medium text-gray-700">
            Value *
          </label>
          <input
            type="number"
            id="value"
            name="value"
            required
            min={1}
            step="0.01"
            placeholder="e.g., 10 (for 10% or ৳10)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Min Order + Max Uses */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="minOrder" className="mb-1 block text-sm font-medium text-gray-700">
            Minimum Order (৳)
          </label>
          <input
            type="number"
            id="minOrder"
            name="minOrder"
            min={0}
            step="0.01"
            placeholder="Optional — e.g., 2000"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="maxUses" className="mb-1 block text-sm font-medium text-gray-700">
            Max Uses
          </label>
          <input
            type="number"
            id="maxUses"
            name="maxUses"
            min={1}
            placeholder="Optional — leave empty for unlimited"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Expiry Date */}
      <div>
        <label htmlFor="expiresAt" className="mb-1 block text-sm font-medium text-gray-700">
          Expiry Date
        </label>
        <input
          type="datetime-local"
          id="expiresAt"
          name="expiresAt"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">Leave empty for no expiry</p>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Coupon"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
