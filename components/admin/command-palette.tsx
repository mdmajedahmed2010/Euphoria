"use client";

/**
 * Euphoria — Command Palette (⌘K / Ctrl+K)
 * Modal search across orders, products, customers, and quick actions.
 * Enhanced with Framer Motion typewriter and morphological animations.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Package,
  Users,
  ArrowRight,
  Plus,
  BarChart3,
  Settings,
  X,
  Loader2,
} from "lucide-react";
import { globalAdminSearch, type SearchResults } from "@/actions/search.actions";
import { useRouter } from "next/navigation";

// Typewriter placeholder component
function TypewriterPlaceholder() {
  const placeholders = [
    "Search orders...",
    "Find products...",
    "Look up customers...",
    "Jump to settings...",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-400">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          {placeholders[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface QuickAction {
  id: string;
  label: string;
  icon: typeof ShoppingCart;
  href: string;
  keywords: string[];
}

const quickActions: QuickAction[] = [
  {
    id: "pending-orders",
    label: "View Pending Orders",
    icon: ShoppingCart,
    href: "/admin/orders?status=PENDING",
    keywords: ["pending", "orders", "new"],
  },
  {
    id: "create-product",
    label: "Create New Product",
    icon: Plus,
    href: "/admin/products/new",
    keywords: ["create", "new", "product", "add"],
  },
  {
    id: "view-reports",
    label: "View Sales Reports",
    icon: BarChart3,
    href: "/admin/reports",
    keywords: ["report", "analytics", "sales", "revenue"],
  },
  {
    id: "settings",
    label: "Open Settings",
    icon: Settings,
    href: "/admin/settings",
    keywords: ["settings", "config", "store"],
  },
  {
    id: "customers",
    label: "Customer Directory",
    icon: Users,
    href: "/admin/customers",
    keywords: ["customer", "clients", "directory"],
  },
  {
    id: "all-orders",
    label: "All Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
    keywords: ["orders", "all", "list"],
  },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults(null);
    setSelectedIndex(0);
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setTimeout(() => {
        setResults(null);
        setIsSearching(false);
      }, 0);
      return;
    }

    setTimeout(() => {
      setIsSearching(true);
    }, 0);
    debounceRef.current = setTimeout(async () => {
      const searchResults = await globalAdminSearch(query);
      setResults(searchResults);
      setIsSearching(false);
      setSelectedIndex(0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const navigateTo = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [router, handleClose]
  );

  // Build flat list of all navigable items for keyboard navigation
  const allItems: { label: string; href: string; type: string }[] = [];

  // Quick actions that match query
  const filteredActions = query
    ? quickActions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : quickActions;

  filteredActions.forEach((action) =>
    allItems.push({ label: action.label, href: action.href, type: "action" })
  );

  if (results) {
    results.orders.forEach((o) =>
      allItems.push({
        label: `${o.orderNumber} — ${o.guestName || "Guest"}`,
        href: `/admin/orders/${o.id}`,
        type: "order",
      })
    );
    results.products.forEach((p) =>
      allItems.push({
        label: p.name,
        href: `/admin/products/${p.id}`,
        type: "product",
      })
    );
    results.customers.forEach((c) =>
      allItems.push({
        label: `${c.name} — ${c.email}`,
        href: `/admin/customers/${c.id}`,
        type: "customer",
      })
    );
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      e.preventDefault();
      navigateTo(allItems[selectedIndex].href);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const hasResults =
    results &&
    (results.orders.length > 0 || results.products.length > 0 || results.customers.length > 0);

  let currentFlatIndex = 0;

  // Stagger variants for results
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  } as const;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-100 sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-2 hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 lg:inline">
          ⌘K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:hidden"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={handleClose}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-[15%] z-[61] w-[95vw] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            >
              {/* Search Input */}
              <div className="relative flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <Search className="h-4.5 w-4.5 shrink-0 text-gray-400 z-10" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-sm text-gray-900 placeholder-transparent focus:outline-none z-10 bg-transparent relative"
                />
                {!query && <TypewriterPlaceholder />}
                {isSearching && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400 z-10" />
                )}
                <button
                  onClick={handleClose}
                  className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 z-10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Results */}
              <div ref={resultsRef} className="max-h-[400px] overflow-y-auto p-2">
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {/* Quick Actions */}
                  {filteredActions.length > 0 && (
                    <motion.div variants={itemVariants} className="mb-2">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Quick Actions
                      </p>
                      {filteredActions.map((action) => {
                        const thisIndex = currentFlatIndex++;
                        const Icon = action.icon;
                        const isSelected = selectedIndex === thisIndex;
                        return (
                          <button
                            key={action.id}
                            data-index={thisIndex}
                            onClick={() => navigateTo(action.href)}
                            className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                              isSelected ? "text-blue-700" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="command-highlight"
                                className="absolute inset-0 rounded-lg bg-blue-50"
                                initial={false}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <Icon
                              className={`h-4 w-4 shrink-0 relative z-10 ${isSelected ? "text-blue-500" : "text-gray-500"}`}
                            />
                            <span className="flex-1 text-sm relative z-10 font-medium">
                              {action.label}
                            </span>
                            <ArrowRight
                              className={`h-3 w-3 shrink-0 relative z-10 ${isSelected ? "text-blue-400" : "text-gray-400"}`}
                            />
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Search Results */}
                  {hasResults && (
                    <>
                      {/* Orders */}
                      {results.orders.length > 0 && (
                        <motion.div variants={itemVariants} className="mb-2">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Orders
                          </p>
                          {results.orders.map((order) => {
                            const thisIndex = currentFlatIndex++;
                            const isSelected = selectedIndex === thisIndex;
                            return (
                              <button
                                key={order.id}
                                data-index={thisIndex}
                                onClick={() => navigateTo(`/admin/orders/${order.id}`)}
                                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors`}
                              >
                                {isSelected && (
                                  <motion.div
                                    layoutId="command-highlight"
                                    className="absolute inset-0 rounded-lg bg-blue-50"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <ShoppingCart className="h-4 w-4 shrink-0 text-blue-500 relative z-10" />
                                <div className="min-w-0 flex-1 relative z-10">
                                  <p
                                    className={`truncate text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                                  >
                                    {order.orderNumber}
                                  </p>
                                  <p
                                    className={`truncate text-[11px] ${isSelected ? "text-blue-600" : "text-gray-500"}`}
                                  >
                                    {order.guestName || "Guest"} • ৳{order.total.toLocaleString()} •{" "}
                                    {order.status}
                                  </p>
                                </div>
                                <ArrowRight
                                  className={`h-3 w-3 shrink-0 relative z-10 ${isSelected ? "text-blue-400" : "text-gray-400"}`}
                                />
                              </button>
                            );
                          })}
                        </motion.div>
                      )}

                      {/* Products */}
                      {results.products.length > 0 && (
                        <motion.div variants={itemVariants} className="mb-2">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Products
                          </p>
                          {results.products.map((product) => {
                            const thisIndex = currentFlatIndex++;
                            const isSelected = selectedIndex === thisIndex;
                            return (
                              <button
                                key={product.id}
                                data-index={thisIndex}
                                onClick={() => navigateTo(`/admin/products/${product.id}`)}
                                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors`}
                              >
                                {isSelected && (
                                  <motion.div
                                    layoutId="command-highlight"
                                    className="absolute inset-0 rounded-lg bg-blue-50"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <Package className="h-4 w-4 shrink-0 text-emerald-500 relative z-10" />
                                <div className="min-w-0 flex-1 relative z-10">
                                  <p
                                    className={`truncate text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                                  >
                                    {product.name}
                                  </p>
                                  <p
                                    className={`truncate text-[11px] ${isSelected ? "text-blue-600" : "text-gray-500"}`}
                                  >
                                    ৳{product.basePrice.toLocaleString()} • {product.status}
                                  </p>
                                </div>
                                <ArrowRight
                                  className={`h-3 w-3 shrink-0 relative z-10 ${isSelected ? "text-blue-400" : "text-gray-400"}`}
                                />
                              </button>
                            );
                          })}
                        </motion.div>
                      )}

                      {/* Customers */}
                      {results.customers.length > 0 && (
                        <motion.div variants={itemVariants} className="mb-2">
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Customers
                          </p>
                          {results.customers.map((customer) => {
                            const thisIndex = currentFlatIndex++;
                            const isSelected = selectedIndex === thisIndex;
                            return (
                              <button
                                key={customer.id}
                                data-index={thisIndex}
                                onClick={() => navigateTo(`/admin/customers/${customer.id}`)}
                                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors`}
                              >
                                {isSelected && (
                                  <motion.div
                                    layoutId="command-highlight"
                                    className="absolute inset-0 rounded-lg bg-blue-50"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                                <Users className="h-4 w-4 shrink-0 text-purple-500 relative z-10" />
                                <div className="min-w-0 flex-1 relative z-10">
                                  <p
                                    className={`truncate text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                                  >
                                    {customer.name}
                                  </p>
                                  <p
                                    className={`truncate text-[11px] ${isSelected ? "text-blue-600" : "text-gray-500"}`}
                                  >
                                    {customer.email}
                                    {customer.phone ? ` • ${customer.phone}` : ""}
                                  </p>
                                </div>
                                <ArrowRight
                                  className={`h-3 w-3 shrink-0 relative z-10 ${isSelected ? "text-blue-400" : "text-gray-400"}`}
                                />
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>

                {/* No results */}
                {query.length >= 2 && !isSearching && !hasResults && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-8 px-4"
                  >
                    <Search className="h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-500">No results found</p>
                    <p className="mt-0.5 text-xs text-gray-400">Try a different search term</p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">
                    ↵
                  </kbd>{" "}
                  Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">
                    esc
                  </kbd>{" "}
                  Close
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
