/**
 * Euphoria — Storefront Layout
 * Wraps all public-facing pages with Header + Footer + Mobile Bottom Nav + StorefrontOverlays
 */

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { StorefrontOverlays } from "@/components/layout/storefront-overlays";
import { getStorefrontSettings } from "@/actions/settings.actions";
import { auth } from "@/lib/auth";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getStorefrontSettings();
  const isMaintenanceMode = settings?.maintenance_mode;
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF"].includes(role || "");

  if (isMaintenanceMode === true && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <>
      <Header settings={settings || {}} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer settings={settings || {}} />
      <StorefrontOverlays />
      <MobileBottomNav />
    </>
  );
}

function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf5] px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#0a0a0a]/10 text-[#0a0a0a] mb-2">
          <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a0008] font-heading">
          Scheduled Maintenance
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Euphoria is currently undergoing scheduled updates to provide you with a more premium shopping
          experience. We will be back online shortly. Thank you for your patience!
        </p>
        <div className="pt-6 border-t border-[#d4af37]/30 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Euphoria. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
