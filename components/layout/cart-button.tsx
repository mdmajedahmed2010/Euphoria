/**
 * Euphoria — Cart Button with Badge
 * Shows cart icon with item count badge
 * Opens cart drawer on click
 */

"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label={`Shopping cart, ${mounted ? itemCount : 0} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {mounted && itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </button>
  );
}
