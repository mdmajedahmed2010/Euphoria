"use client";

/**
 * Euphoria — Admin Header (Modernized)
 * NotificationCenter, CommandPalette (⌘K), Mobile Sidebar, User Menu
 */

import { signOut } from "next-auth/react";
import { LogOut, User, Menu, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { NotificationCenter } from "./notification-center";
import { CommandPalette } from "./command-palette";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";

interface AdminHeaderProps {
  userName: string;
  userRole: string;
}

export function AdminHeader({ userName, userRole }: AdminHeaderProps) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Generate breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
    MANAGER: "bg-green-100 text-green-700",
    STAFF: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb — hidden on mobile */}
          <nav className="hidden items-center gap-1 text-sm sm:flex" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">/</span>}
                {crumb.isLast ? (
                  <span className="font-medium text-gray-900">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-gray-500 hover:text-gray-700">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile: Page title */}
          <h1 className="text-base font-semibold text-gray-900 sm:hidden">
            {breadcrumbs[breadcrumbs.length - 1]?.label || "Admin"}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search — Command Palette (manages its own trigger + modal) */}
          <CommandPalette />

          {/* View Store */}
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 sm:flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Store
          </Link>

          {/* Notifications — Real Notification Center */}
          <NotificationCenter />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{userName}</p>
                <span
                  className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleColors[userRole] || "bg-gray-100 text-gray-600"}`}
                >
                  {userRole.replace("_", " ")}
                </span>
              </div>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg shadow-gray-200/50">
                  <div className="border-b border-gray-100 px-3 py-2.5 sm:hidden">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    My Account
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    View Store
                  </Link>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AdminMobileSidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        role={userRole}
        userName={userName}
        userRole={userRole}
      />
    </>
  );
}
