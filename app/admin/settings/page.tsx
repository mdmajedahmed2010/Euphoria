/**
 * Sitara — Admin Settings Page (Editable)
 * Dynamic settings stored in DB
 */

import { getAllSettings } from "@/actions/settings.actions";
import { SettingsManager } from "@/components/admin/settings-manager";
import { Settings as SettingsIcon } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminSettingsPage() {
  const session = await auth();
  const result = await getAllSettings();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = (result.settings || []) as any[];

  // Fetch current user 2FA status from DB
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { isTwoFactorEnabled: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
          <SettingsIcon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Store Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure your store — all changes save instantly
          </p>
        </div>
      </div>

      <SettingsManager
        initialSettings={settings}
        isTwoFactorEnabled={user?.isTwoFactorEnabled || false}
      />
    </div>
  );
}
