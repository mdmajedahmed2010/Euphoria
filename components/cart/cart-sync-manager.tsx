"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { syncCart, getCart, updateFullCart } from "@/actions/cart.actions";

export function CartSyncManager({ userId }: { userId: string | undefined }) {
  const { items, setItems } = useCartStore();
  const isInitialized = useRef(false);
  const previousItemsStr = useRef("");

  useEffect(() => {
    if (!userId) {
      isInitialized.current = false;
      return;
    }

    const initCart = async () => {
      // 1. Sync any guest items in localStorage before login
      if (items.length > 0 && !isInitialized.current) {
        await syncCart(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
      }

      // 2. Fetch the true source of truth from DB
      const res = await getCart();
      if (res.success && res.cart && Array.isArray(res.cart.items)) {
        const dbItems = res.cart.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((ci: any) => ci && ci.variant && ci.variant.product)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((ci: any) => ({
            variantId: ci.variantId,
            productId: ci.variant.product.id,
            productName: ci.variant.product.name || "Product",
            productSlug: ci.variant.product.slug || "",
            variantSku: ci.variant.sku || "",
            size: ci.variant.size,
            color: ci.variant.color,
            price: Number(ci.variant.price || 0),
            quantity: ci.quantity,
            image: ci.variant.images?.[0] || "/images/products/placeholder.jpg",
            maxStock: ci.variant.stock ?? 0,
          }));
        setItems(dbItems);
        previousItemsStr.current = JSON.stringify(dbItems);
      }
      isInitialized.current = true;
    };

    if (!isInitialized.current) {
      initCart();
    }
  }, [userId, setItems]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isInitialized.current || !userId) return;

    const currentItemsStr = JSON.stringify(items);
    if (currentItemsStr === previousItemsStr.current) return;

    // Changes detected! Sync to DB
    previousItemsStr.current = currentItemsStr;
    const timeout = setTimeout(() => {
      updateFullCart(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
    }, 1000); // debounce 1s

    return () => clearTimeout(timeout);
  }, [items, userId]);

  return null;
}
