/**
 * Euphoria — Track Order Form
 * Order Number + Phone → Order Status
 * Guest-first: No login required
 */

"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { trackOrder } from "@/actions/order.actions";

interface OrderResult {
  orderNumber: string;
  status: string;
  date: string;
  estimatedDelivery: string;
  timeline: { status: string; date: string; active: boolean; isError?: boolean }[];
}

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please fill in both fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await trackOrder(orderNumber.trim(), phone.trim());
      if (!res.success || !res.order) {
        setError(res.error || "Order not found. Check your order number and phone.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const order: any = res.order;

      // Format order creation date
      const placedDate = new Date(order.createdAt).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      // Parse estimated delivery date from order notes
      let estimatedDelivery = "Under calculation";
      if (order.notes && order.notes.startsWith("Estimated Delivery: ")) {
        const match = order.notes.match(/^Estimated Delivery: ([^\n]+)/);
        if (match) {
          estimatedDelivery = match[1];
        }
      }

      // Build real dynamic timeline from order.timeline table records
      // Standard workflow statuses: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED
      const dbTimeline = order.timeline || [];

      // Helper function to find if status is active and return its formatted date
      const getStatusDetail = (statusName: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const record = dbTimeline.find((t: any) => t.status === statusName);
        if (record) {
          const dateStr = new Date(record.createdAt).toLocaleString("en-BD", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return { active: true, date: dateStr };
        }
        return { active: false, date: "" };
      };

      // Check if order was cancelled or returned
      const isCancelled = order.status === "CANCELLED";
      const isReturned = order.status === "RETURNED";
      const isRefunded = order.status === "REFUNDED";

      const timelineSteps = [];

      // 1. Order Placed (Always active if order exists)
      const placedDetail = getStatusDetail("PENDING");
      timelineSteps.push({
        status: "Order Placed",
        date: placedDetail.active ? placedDetail.date : placedDate,
        active: true,
      });

      // 2. Confirmed
      const confirmedDetail = getStatusDetail("CONFIRMED");
      timelineSteps.push({
        status: "Confirmed",
        date:
          confirmedDetail.date || (confirmedDetail.active ? "Confirmed" : "Awaiting confirmation"),
        active: confirmedDetail.active,
      });

      // 3. Processing
      const processingDetail = getStatusDetail("PROCESSING");
      timelineSteps.push({
        status: "Processing",
        date:
          processingDetail.date || (processingDetail.active ? "Processing" : "Pending processing"),
        active: processingDetail.active,
      });

      // 4. Shipped
      const shippedDetail = getStatusDetail("SHIPPED");
      timelineSteps.push({
        status: "Shipped",
        date: shippedDetail.date || (shippedDetail.active ? "Shipped" : "Pending shipment"),
        active: shippedDetail.active,
      });

      // 5. Delivered or Cancellation exception
      if (isCancelled) {
        const cancelledDetail = getStatusDetail("CANCELLED");
        timelineSteps.push({
          status: "Cancelled",
          date: cancelledDetail.date || "Order cancelled",
          active: true,
          isError: true,
        });
      } else if (isReturned) {
        const returnedDetail = getStatusDetail("RETURNED");
        timelineSteps.push({
          status: "Returned",
          date: returnedDetail.date || "Order returned",
          active: true,
          isError: true,
        });
      } else if (isRefunded) {
        const refundedDetail = getStatusDetail("REFUNDED");
        timelineSteps.push({
          status: "Refunded",
          date: refundedDetail.date || "Order refunded",
          active: true,
          isError: true,
        });
      } else {
        const deliveredDetail = getStatusDetail("DELIVERED");
        timelineSteps.push({
          status: "Delivered",
          date: deliveredDetail.active ? deliveredDetail.date : `Estimated: ${estimatedDelivery}`,
          active: deliveredDetail.active,
        });
      }

      setResult({
        orderNumber: order.orderNumber,
        status: order.status,
        date: placedDate,
        estimatedDelivery,
        timeline: timelineSteps,
      });
    } catch (err) {
      console.error("[TRACK] Error:", err);
      setError(
        "An error occurred while tracking your order. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="order-number" className="text-sm font-medium">
            Order Number
          </label>
          <input
            id="order-number"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full h-10 px-3 rounded-sm border border-[#e8e0d0] bg-[#fdfaf5] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]/20 transition-colors"
            placeholder="ORD-2026-00001"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="track-phone" className="text-sm font-medium">
            Phone Number
          </label>
          <input
            id="track-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-10 px-3 rounded-sm border border-[#e8e0d0] bg-[#fdfaf5] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]/20 transition-colors"
            placeholder="01XXXXXXXXX"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-sm bg-[#0a0a0a] text-[#f5e6c8] font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#3d0010] shadow-sm disabled:opacity-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isLoading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="text-left space-y-4 p-5 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono font-medium">{result.orderNumber}</p>
              <p className="text-xs text-muted-foreground">Placed: {result.date}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#0a0a0a]">
              {result.status}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Estimated delivery:{" "}
            <span className="font-medium text-foreground">{result.estimatedDelivery}</span>
          </p>

          <Separator />

          {/* Timeline */}
          <div className="space-y-0">
            {result.timeline.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      step.isError
                        ? "bg-red-500"
                        : step.active
                          ? "bg-[#0a0a0a]"
                          : "bg-[#e8e0d0]"
                    }`}
                  />
                  {index < result.timeline.length - 1 && (
                    <div
                      className={`w-0.5 h-7 ${
                        step.isError
                          ? "bg-red-500/20"
                          : step.active
                            ? "bg-[#0a0a0a]"
                            : "bg-[#e8e0d0]"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-5">
                  <p
                    className={`text-sm -mt-0.5 ${
                      step.isError
                        ? "font-medium text-red-600"
                        : step.active
                          ? "font-medium"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.status}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
