/**
 * Sitara — Checkout Page
 * Guest-first checkout flow (no login required)
 * SOP §২ — Frontend Plan PAGE 5
 *
 * Steps: Address → Payment Method → Review → Place Order
 */

import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getStorefrontSettings } from "@/actions/settings.actions";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order — secure checkout.",
};

export default async function CheckoutPage() {
  const { settings } = await getStorefrontSettings();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-center">Checkout</h1>
      <CheckoutForm settings={settings || {}} />
    </div>
  );
}
