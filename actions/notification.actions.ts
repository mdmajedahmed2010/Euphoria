"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

// Create a notification
export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  try {
    await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data.data ? (data.data as any) : undefined,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[NOTIFICATION] Create failed:", error);
    return { success: false };
  }
}

// Get notifications for admin dashboard
export async function getNotifications(limit: number = 20) {
  await requireAdmin();

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { isRead: false },
      }),
    ]);

    return {
      success: true,
      data: { notifications, unreadCount },
    };
  } catch (error) {
    console.error("[NOTIFICATION] Get failed:", error);
    return { success: false, data: { notifications: [], unreadCount: 0 } };
  }
}

// Mark notification as read
export async function markNotificationRead(id: string) {
  await requireAdmin();

  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    console.error("[NOTIFICATION] Mark read failed:", error);
    return { success: false };
  }
}

// Mark all as read
export async function markAllNotificationsRead() {
  await requireAdmin();

  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    console.error("[NOTIFICATION] Mark all read failed:", error);
    return { success: false };
  }
}

// Delete old notifications (> 30 days)
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        isRead: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[NOTIFICATION] Cleanup failed:", error);
    return { success: false };
  }
}
