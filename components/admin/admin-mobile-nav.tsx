"use client";

/**
 * Euphoria — Admin Mobile Bottom Navigation
 * Shows on mobile/tablet only — quick access to key admin sections
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from "lucide-react";

interface AdminMobileNavProps {
  role: string;
}

const mobileNavItems = [
  { label: "Home", href: "/admin", icon: LayoutDashboard },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    roles: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    roles: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
];

export function AdminMobileNav({ role }: AdminMobileNavProps) {
  const pathname = usePathname();

  const filteredItems = mobileNavItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-all ${
                isActive ? "text-blue-600" : "text-gray-500 active:scale-95"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
              <span>{item.label}</span>
              {isActive && <span className="absolute -top-0 h-0.5 w-8 rounded-full bg-blue-600" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
