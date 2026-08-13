"use server";

/**
 * BIBAZ — Heatmap Server Actions
 * Revenue heatmap data: 7-day × 24-hour grid of revenue intensity.
 * SOP §৬F — Prisma queries, TypeScript strict.
 */

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface HeatmapCell {
  day: number; // 0=Sun, 1=Mon, ..., 6=Sat
  dayLabel: string;
  hour: number; // 0-23
  revenue: number;
  orders: number;
}

export async function getRevenueHeatmap(
  days: number = 7
): Promise<{ success: boolean; data: HeatmapCell[] }> {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role || "")) {
      return { success: false, data: [] };
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        deletedAt: null,
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Aggregate into day×hour grid
    const grid = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      const d = new Date(order.createdAt);
      const day = d.getDay();
      const hour = d.getHours();
      const key = `${day}-${hour}`;

      const existing = grid.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += Number(order.total);
      existing.orders += 1;
      grid.set(key, existing);
    }

    // Fill complete 7×24 grid
    const result: HeatmapCell[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        const cell = grid.get(key) || { revenue: 0, orders: 0 };
        result.push({
          day,
          dayLabel: dayLabels[day] || "",
          hour,
          revenue: Math.round(cell.revenue),
          orders: cell.orders,
        });
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("[Heatmap] Failed to fetch revenue heatmap:", error);
    return { success: false, data: [] };
  }
}
