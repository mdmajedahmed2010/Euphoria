"use client";

/**
 * Euphoria — Admin Sidebar Navigation (Advanced)
 * Collapsible, animated, with active indicators and section grouping
 */

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
  ChevronLeft,
  ChevronRight,
  Store,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { PulseIndicator, PulseDot } from "./pulse-indicator";

interface AdminSidebarProps {
  role: string;
  counts?: {
    pendingOrders?: number;
    lowStock?: number;
    abandonedCarts?: number;
  };
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
        icon: Megaphone,
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
      { label: "Coupons", href: "/admin/coupons", icon: Tag, roles: ["ADMIN", "SUPER_ADMIN"] },
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
      { label: "Audit Log", href: "/admin/audit-log", icon: Shield, roles: ["SUPER_ADMIN"] },
    ],
  },
];

export function AdminSidebar({ role, counts }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-gray-800 bg-gray-950 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b border-gray-800 px-4">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-900/50">
            <Store className="h-4.5 w-4.5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">Euphoria</span>
              <span className="text-[10px] font-medium text-gray-400">Admin Panel</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-5">
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600/10 text-blue-400"
                          : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-500" />
                      )}
                      <item.icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"
                        }`}
                      />
                      {!collapsed && <span>{item.label}</span>}

                      {/* Live Pulse Indicators */}
                      {!collapsed &&
                        item.label === "Orders" &&
                        counts?.pendingOrders !== undefined &&
                        counts.pendingOrders > 0 && (
                          <span className="ml-auto">
                            <PulseIndicator count={counts.pendingOrders} severity="urgent" />
                          </span>
                        )}
                      {!collapsed &&
                        item.label === "Products" &&
                        counts?.lowStock !== undefined &&
                        counts.lowStock > 0 && (
                          <span className="ml-auto">
                            <PulseIndicator count={counts.lowStock} severity="warning" />
                          </span>
                        )}
                      {!collapsed &&
                        item.label === "Abandoned Carts" &&
                        counts?.abandonedCarts !== undefined &&
                        counts.abandonedCarts > 0 && (
                          <span className="ml-auto">
                            <PulseIndicator count={counts.abandonedCarts} severity="info" />
                          </span>
                        )}

                      {/* Collapsed view small dots */}
                      {collapsed &&
                        item.label === "Orders" &&
                        counts?.pendingOrders !== undefined &&
                        counts.pendingOrders > 0 && (
                          <span className="absolute right-2.5 top-2">
                            <PulseDot severity="urgent" size={6} />
                          </span>
                        )}
                      {collapsed &&
                        item.label === "Products" &&
                        counts?.lowStock !== undefined &&
                        counts.lowStock > 0 && (
                          <span className="absolute right-2.5 top-2">
                            <PulseDot severity="warning" size={6} />
                          </span>
                        )}
                      {collapsed &&
                        item.label === "Abandoned Carts" &&
                        counts?.abandonedCarts !== undefined &&
                        counts.abandonedCarts > 0 && (
                          <span className="absolute right-2.5 top-2">
                            <PulseDot severity="info" size={6} />
                          </span>
                        )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400 shadow-sm transition-all hover:bg-gray-800 hover:text-gray-200"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Footer */}
      <div className="border-t border-gray-800 p-3 space-y-2">
        {/* View Live Store link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all duration-200 border border-emerald-500/20 hover:border-emerald-500/40 ${
            collapsed ? "justify-center" : ""
          }`}
          title="View Live Store"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>View Live Store</span>}
        </a>

        {!collapsed ? (
          <div className="rounded-lg bg-gray-900 p-3 border border-gray-800">
            <p className="text-[11px] font-semibold text-gray-300">Euphoria Admin</p>
            <p className="text-[10px] text-gray-500">v1.2 • Premium Suite Live</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              title="System Online"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
