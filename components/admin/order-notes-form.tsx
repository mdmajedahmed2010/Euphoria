"use client";

import { updateOrderNotes } from "@/actions/order.actions";
import { useState } from "react";
import { Calendar, FileText } from "lucide-react";

interface OrderNotesFormProps {
  orderId: string;
  initialNotes: string;
}

export function OrderNotesForm({ orderId, initialNotes }: OrderNotesFormProps) {
  // Parse initial delivery date and clean notes
  let initialDate = "";
  let initialCleanNotes = initialNotes || "";

  if (initialCleanNotes.startsWith("Estimated Delivery: ")) {
    const match = initialCleanNotes.match(/^Estimated Delivery: ([^\n]+)\n?([\s\S]*)$/);
    if (match) {
      initialDate = match[1] || "";
      initialCleanNotes = match[2] || "";
    }
  }

  const [deliveryDate, setDeliveryDate] = useState(initialDate);
  const [notes, setNotes] = useState(initialCleanNotes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Format notes inside database
    const formattedNotes = deliveryDate ? `Estimated Delivery: ${deliveryDate}\n${notes}` : notes;

    const result = await updateOrderNotes(orderId, formattedNotes);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Fulfillment details updated successfully" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update details" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Delivery Date Picker */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <Calendar className="h-4 w-4 text-gray-400" />
          Estimated Delivery Date
        </label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      {/* Internal Notes */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-gray-400" />
          Fulfillment Notes / Remarks
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Courier: Pathao, Tracking ID: 123456"
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
        disabled={loading}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving Details..." : "Save Delivery & Notes"}
      </button>
    </form>
  );
}
