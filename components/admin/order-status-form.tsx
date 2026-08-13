"use client";

/**
 * Euphoria — Order Status Update Form (Admin)
 */

import { updateOrderStatus } from "@/actions/order.actions";
import { useState } from "react";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
] as const;

interface OrderStatusUpdateFormProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdateForm({ orderId, currentStatus }: OrderStatusUpdateFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;

    setLoading(true);
    setMessage(null);

    const result = await updateOrderStatus({
      orderId,
      status: status as (typeof ORDER_STATUSES)[number],
      note: note || undefined,
    });

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Status updated successfully" });
      setNote("");
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">New Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this status change..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || status === currentStatus}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Status"}
      </button>
    </form>
  );
}
