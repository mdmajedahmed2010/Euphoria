"use server";

/**
 * BIBAZ — Site Settings Server Actions
 * Dynamic key-value settings — editable from admin panel
 */

import { prisma } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

import { withCache } from "@/lib/redis";

// ═══════════════════════════════════════════
// PUBLIC — Get settings (for storefront)
// ═══════════════════════════════════════════

/**
 * Get a single setting by key
 */
export async function getSetting(key: string) {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Get all settings in a group
 */
export async function getSettingsByGroup(group: string) {
  try {
    const settings = await db.siteSetting.findMany({
      where: { group },
      orderBy: { key: "asc" },
    });
    // Convert to key-value map
    const map: Record<string, unknown> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return { success: true, settings: map, raw: settings };
  } catch (error) {
    console.error("[SETTINGS] getSettingsByGroup error:", error);
    return { success: false, settings: {}, raw: [] };
  }
}

/**
 * Get all settings needed for the storefront (general, branding, shipping, social)
 */
export async function getStorefrontSettings() {
  return withCache(
    "storefront_settings",
    async () => {
      try {
        const settings = await db.siteSetting.findMany({
          where: {
            group: { in: ["general", "branding", "shipping", "social"] },
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map: Record<string, any> = {};
        for (const s of settings) {
          map[s.key] = s.value;
        }
        return { success: true, settings: map };
      } catch (error) {
        console.error("[SETTINGS] getStorefrontSettings error:", error);
        return { success: false, settings: {} };
      }
    },
    3600 // Cache for 1 hour
  );
}

/**
 * Get all settings (for admin)
 */
export async function getAllSettings() {
  const session = await auth();
  if (!session?.user) return { success: false, settings: [] };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, settings: [], error: "Insufficient permissions" };
  }

  try {
    const settings = await db.siteSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });
    return { success: true, settings };
  } catch (error) {
    console.error("[SETTINGS] getAllSettings error:", error);
    return { success: false, settings: [] };
  }
}

// ═══════════════════════════════════════════
// ADMIN — Update settings
// ═══════════════════════════════════════════

/**
 * Update or create a setting (Admin)
 */
export async function updateSetting(
  key: string,
  value: unknown,
  options?: { group?: string; label?: string; type?: string }
) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    await db.siteSetting.upsert({
      where: { key },
      update: { value: value as object },
      create: {
        key,
        value: value as object,
        group: options?.group || "general",
        label: options?.label,
        type: options?.type || "text",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "UPDATE_SETTING",
        entity: "SiteSetting",
        entityId: key,
        newValue: { key, value } as object,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    revalidateTag("site_settings", "default");
    return { success: true };
  } catch (error) {
    console.error("[SETTINGS] updateSetting error:", error);
    return { success: false, error: "Failed to update setting" };
  }
}

/**
 * Bulk update settings (Admin)
 */
export async function bulkUpdateSettings(
  updates: { key: string; value: unknown; group?: string; label?: string; type?: string }[]
) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    for (const update of updates) {
      await db.siteSetting.upsert({
        where: { key: update.key },
        update: { value: update.value as object },
        create: {
          key: update.key,
          value: update.value as object,
          group: update.group || "general",
          label: update.label,
          type: update.type || "text",
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id as string,
        action: "BULK_UPDATE_SETTINGS",
        entity: "SiteSetting",
        entityId: "bulk",
        newValue: { count: updates.length },
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    revalidateTag("site_settings", "default");
    return { success: true };
  } catch (error) {
    console.error("[SETTINGS] bulkUpdateSettings error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
