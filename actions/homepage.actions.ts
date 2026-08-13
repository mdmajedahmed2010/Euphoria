"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { withCache } from "@/lib/redis";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { authorized: false, error: "Not authenticated", userId: null };
  const role = (session.user as { role?: string }).role;
  const adminRoles = ["ADMIN", "SUPER_ADMIN", "MANAGER"];
  if (!adminRoles.includes(role || "")) {
    return { authorized: false, error: "Insufficient permissions", userId: null };
  }
  return { authorized: true, error: null, userId: session.user.id };
}

export async function getHomepageSections() {
  return withCache(
    "homepage_sections",
    async () => {
      try {
        const sections = await prisma.homepageSection.findMany({
          orderBy: { sortOrder: "asc" },
        });
        return { success: true, sections };
      } catch (error) {
        console.error("[HOMEPAGE] getHomepageSections error:", error);
        return { success: false, error: "Failed to fetch homepage sections", sections: [] };
      }
    },
    3600 // Cache for 1 hour
  );
}

export async function createHomepageSection(data: {
  type: string;
  title?: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    const section = await prisma.homepageSection.create({
      data: {
        type: data.type,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content || {},
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "CREATE_HOMEPAGE_SECTION",
        entity: "HomepageSection",
        entityId: section.id,
        newValue: { type: section.type, title: section.title },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true, section };
  } catch (error) {
    console.error("[HOMEPAGE] createHomepageSection error:", error);
    return { success: false, error: "Failed to create section" };
  }
}

export async function updateHomepageSection(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content?: any;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    const section = await prisma.homepageSection.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "UPDATE_HOMEPAGE_SECTION",
        entity: "HomepageSection",
        entityId: section.id,
        newValue: data,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true, section };
  } catch (error) {
    console.error("[HOMEPAGE] updateHomepageSection error:", error);
    return { success: false, error: "Failed to update section" };
  }
}

export async function deleteHomepageSection(id: string) {
  const { authorized, error, userId } = await requireAdmin();
  if (!authorized) return { success: false, error };

  try {
    await prisma.homepageSection.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: userId!,
        action: "DELETE_HOMEPAGE_SECTION",
        entity: "HomepageSection",
        entityId: id,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (error) {
    console.error("[HOMEPAGE] deleteHomepageSection error:", error);
    return { success: false, error: "Failed to delete section" };
  }
}
