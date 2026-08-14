"use client";

/**
 * Euphoria — Storefront Client Overlays
 * Wraps dynamic overlays in a Client Component boundary for Next.js App Router
 */

import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

const QuickViewModal = dynamic(
  () => import("@/components/product/quick-view-modal").then((mod) => mod.QuickViewModal),
  { ssr: false }
);

const FloatingChat = dynamic(
  () => import("@/components/ui/floating-chat").then((mod) => mod.FloatingChat),
  { ssr: false }
);

const BackToTop = dynamic(
  () => import("@/components/ui/back-to-top").then((mod) => mod.BackToTop),
  { ssr: false }
);

const PageTracker = dynamic(
  () => import("@/components/ui/page-tracker").then((mod) => mod.PageTracker),
  { ssr: false }
);

export function StorefrontOverlays() {
  return (
    <>
      <CartDrawer />
      <QuickViewModal />
      <ScrollReveal />
      <ScrollProgress />
      <BackToTop />
      <FloatingChat phoneNumber="+8801741875914" messengerUrl="https://m.me/Euphoria2222" />
      <PageTracker />
    </>
  );
}
