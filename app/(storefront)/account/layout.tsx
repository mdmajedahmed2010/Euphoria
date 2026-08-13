/**
 * Sitara — Account Layout
 * Sidebar navigation (desktop) + tabs (mobile)
 * SOP §২ — Frontend Plan PAGE 7
 */

import type { Metadata } from "next";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Sitara account, orders, and addresses.",
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">My Account</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <AccountSidebar />
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
