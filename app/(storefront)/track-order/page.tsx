/**
 * Sitara — Order Tracking Page
 * Public — no login required
 * SOP §২ — Guest-first: Order Number + Phone দিয়ে track
 */

import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/order/track-order-form";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your Sitara order status with your order number and phone.",
};

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Track Your Order</h1>
          <p className="text-sm text-muted-foreground">
            Enter your order number and phone number to check your order status. No login required.
          </p>
        </div>

        <TrackOrderForm />
      </div>
    </div>
  );
}
