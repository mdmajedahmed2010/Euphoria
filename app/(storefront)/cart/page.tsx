/**
 * Sitara — Cart Page (Full View)
 * Detailed cart breakdown with coupon input
 * SOP §২ — Frontend Plan F4.2
 *
 * Route: /cart
 * Guest-first: No login required
 */

import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";
import { getStorefrontSettings } from "@/actions/settings.actions";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your shopping cart and proceed to checkout.",
};

export default async function CartPage() {
  const { settings } = await getStorefrontSettings();

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
      <CartPageContent settings={settings || {}} />
    </div>
  );
}
