"use client";

/**
 * Euphoria — Mobile Bottom Navigation (Premium v3.0)
 * Glassmorphism backdrop, active route highlighting, cart badge,
 * spring animation on active tab, 5 tabs: Home, Categories, Search, Wishlist, Account.
 * Only visible on mobile (md:hidden).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Search, Heart, User, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Categories", href: "/collections", icon: Grid3x3 },
  { label: "Search", href: "/search", icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed nav */}
      <div className="h-16 md:hidden" />

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around backdrop-blur-xl bg-white/80 border-t border-gray-200/50 px-1 pb-safe md:hidden">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex h-full w-full flex-col items-center justify-center gap-0.5"
            >
              {/* Active indicator dot */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-1.5 h-[3px] w-5 rounded-full bg-accent"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={active ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    active
                      ? "text-foreground stroke-[2.5px]"
                      : "text-gray-400 stroke-[1.8px]"
                  }`}
                />
              </motion.div>

              <span
                className={`text-[9px] font-medium transition-colors duration-200 ${
                  active ? "text-foreground font-bold" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Cart Button (opens drawer instead of linking) */}
        <button
          onClick={openCart}
          className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="relative"
          >
            <ShoppingBag className="h-5 w-5 text-gray-400 stroke-[1.8px]" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -right-2.5 -top-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white px-1"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="text-[9px] font-medium text-gray-400">Cart</span>
        </button>
      </nav>
    </>
  );
}
