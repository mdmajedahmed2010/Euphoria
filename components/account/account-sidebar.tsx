/**
 * Euphoria — Account Sidebar Navigation
 * Desktop: Vertical sidebar | Mobile: Horizontal scroll tabs
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, Lock, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const accountLinks = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/change-password", label: "Change Password", icon: Lock },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account navigation">
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide border-b border-border/40">
        {accountLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all shadow-sm snap-start shrink-0 ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-white border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
        
        {/* Mobile Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all shadow-sm snap-start shrink-0 bg-white border border-border/60 text-destructive hover:bg-destructive/5"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      {/* Desktop: Vertical sidebar */}
      <div className="hidden md:flex flex-col gap-1">
        {accountLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors mt-4 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
