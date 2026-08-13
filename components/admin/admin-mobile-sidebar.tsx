"use client";

/**
 * Euphoria — Admin Mobile Sidebar
 * Full slide-out navigation for mobile with role-based filtering.
 */

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  Shield,
  Store,
  Sparkles,
  SlidersHorizontal,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";

interface AdminMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
  userName: string;
  userRole: string;
}

const navSections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Storefront",
    items: [
      {
        label: "Collections",
        href: "/admin/collections",
        icon: Sparkles,
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Homepage Banners",
        href: "/admin/homepage",
        icon: Store,
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        roles: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Layers,
        roles: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Bulk Stock",
        href: "/admin/products/bulk-stock",
        icon: SlidersHorizontal,
        roles: ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        label: "Campaigns",
        href: "/admin/campaigns",
        icon: Sparkles,
        roles: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        roles: ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Abandoned Carts",
        href: "/admin/abandoned-carts",
        icon: ShoppingCart,
        roles: ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
        roles: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: Tag,
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        label: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Staff",
        href: "/admin/staff",
        icon: Shield,
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Audit Log",
        href: "/admin/audit-log",
        icon: Shield,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MANAGER: "bg-green-100 text-green-700",
  STAFF: "bg-gray-100 text-gray-700",
};

export function AdminMobileSidebar({
  isOpen,
  onClose,
  role,
  userName,
  userRole,
}: AdminMobileSidebarProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-[56] h-full w-[280px] max-w-[85vw] bg-gray-950 shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-900/50">
                    <Store className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight text-white">
                      Euphoria
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      Admin Panel
                    </span>
                  </div>
                </Link>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="border-b border-gray-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-800 text-white text-sm font-bold">
                    {userName?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">
                      {userName}
                    </p>
                    <span
                      className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleColors[userRole] || "bg-gray-100 text-gray-600"}`}
                    >
                      {userRole.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                {navSections.map((section) => {
                  const visibleItems = section.items.filter((item) =>
                    item.roles.includes(role)
                  );
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={section.title} className="mb-5">
                      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        {section.title}
                      </p>
                      <div className="space-y-0.5">
                        {visibleItems.map((item) => {
                          const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" &&
                              pathname.startsWith(item.href));

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={onClose}
                              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                                isActive
                                  ? "bg-blue-600/10 text-blue-400"
                                  : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                              }`}
                            >
                              {isActive && (
                                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-500" />
                              )}
                              <item.icon
                                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                                  isActive
                                    ? "text-blue-500"
                                    : "text-gray-500 group-hover:text-gray-300"
                                }`}
                              />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-800 p-3 space-y-2">
                <Link
                  href="/"
                  target="_blank"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-900 hover:text-gray-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Store
                </Link>
                <div className="rounded-lg bg-gray-900 p-3 border border-gray-800">
                  <p className="text-[11px] font-semibold text-gray-300">
                    Euphoria Admin
                  </p>
                  <p className="text-[10px] text-gray-500">
                    v1.1 • Premium Suite Live
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
