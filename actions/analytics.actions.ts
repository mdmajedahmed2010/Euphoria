"use server";

/**
 * BIBAZ — Analytics Actions
 * Real visitor tracking via PageView model + order-based conversion metrics.
 */

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

// ═══════════════════════════════════════════
// Visitor Stats (from PageView table)
// ═══════════════════════════════════════════

export async function getVisitorStats() {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const prevSevenStart = new Date(sevenDaysAgo);
  prevSevenStart.setDate(prevSevenStart.getDate() - 7);
  const prevThirtyStart = new Date(thirtyDaysAgo);
  prevThirtyStart.setDate(prevThirtyStart.getDate() - 30);

  try {
    const [
      todayViews,
      yesterdayViews,
      sevenDayViews,
      thirtyDayViews,
      todayUnique,
      yesterdayUnique,
      sevenDayUnique,
      thirtyDayUnique,
      prevSevenUnique,
      prevThirtyUnique,
    ] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.pageView
        .groupBy({ by: ["sessionId"], where: { createdAt: { gte: todayStart } } })
        .then((r) => r.length),
      prisma.pageView
        .groupBy({
          by: ["sessionId"],
          where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
        })
        .then((r) => r.length),
      prisma.pageView
        .groupBy({ by: ["sessionId"], where: { createdAt: { gte: sevenDaysAgo } } })
        .then((r) => r.length),
      prisma.pageView
        .groupBy({ by: ["sessionId"], where: { createdAt: { gte: thirtyDaysAgo } } })
        .then((r) => r.length),
      prisma.pageView
        .groupBy({
          by: ["sessionId"],
          where: { createdAt: { gte: prevSevenStart, lt: sevenDaysAgo } },
        })
        .then((r) => r.length),
      prisma.pageView
        .groupBy({
          by: ["sessionId"],
          where: { createdAt: { gte: prevThirtyStart, lt: thirtyDaysAgo } },
        })
        .then((r) => r.length),
    ]);

    return {
      success: true as const,
      data: {
        today: { views: todayViews, visitors: todayUnique },
        yesterday: { views: yesterdayViews, visitors: yesterdayUnique },
        sevenDay: { views: sevenDayViews, visitors: sevenDayUnique, prevVisitors: prevSevenUnique },
        thirtyDay: {
          views: thirtyDayViews,
          visitors: thirtyDayUnique,
          prevVisitors: prevThirtyUnique,
        },
      },
    };
  } catch (error) {
    console.error("[ANALYTICS] getVisitorStats failed:", error);
    return { success: false as const, data: null };
  }
}

// ═══════════════════════════════════════════
// Top Visited Pages
// ═══════════════════════════════════════════

export async function getTopPages(days: number = 7) {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const pages = await prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    });

    return {
      success: true as const,
      data: pages.map((p) => ({ path: p.path, views: p._count.path })),
    };
  } catch (error) {
    console.error("[ANALYTICS] getTopPages failed:", error);
    return { success: false as const, data: [] as { path: string; views: number }[] };
  }
}

// ═══════════════════════════════════════════
// Device Breakdown
// ═══════════════════════════════════════════

export async function getDeviceBreakdown(days: number = 30) {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const devices = await prisma.pageView.groupBy({
      by: ["device"],
      where: { createdAt: { gte: since } },
      _count: { device: true },
    });

    const total = devices.reduce((sum, d) => sum + d._count.device, 0);
    return {
      success: true as const,
      data: devices.map((d) => ({
        device: d.device || "unknown",
        count: d._count.device,
        percentage: total > 0 ? Math.round((d._count.device / total) * 100) : 0,
      })),
    };
  } catch (error) {
    console.error("[ANALYTICS] getDeviceBreakdown failed:", error);
    return {
      success: false as const,
      data: [] as { device: string; count: number; percentage: number }[],
    };
  }
}

// ═══════════════════════════════════════════
// Daily Visitor Trend (for charts)
// ═══════════════════════════════════════════

export async function getDailyVisitorTrend(days: number = 30) {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const result = await prisma.$queryRaw<Array<{ date: string; views: bigint; visitors: bigint }>>`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as visitors
      FROM page_views
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return {
      success: true as const,
      data: result.map((r) => ({
        date: String(r.date),
        views: Number(r.views),
        visitors: Number(r.visitors),
      })),
    };
  } catch (error) {
    console.error("[ANALYTICS] getDailyVisitorTrend failed:", error);
    return {
      success: false as const,
      data: [] as { date: string; views: number; visitors: number }[],
    };
  }
}

// ═══════════════════════════════════════════
// Conversion Stats (visitors → orders)
// ═══════════════════════════════════════════

export async function getConversionStats(days: number = 30) {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const [totalVisitors, totalOrders] = await Promise.all([
      prisma.pageView
        .groupBy({ by: ["sessionId"], where: { createdAt: { gte: since } } })
        .then((r) => r.length),
      prisma.order.count({
        where: {
          createdAt: { gte: since },
          deletedAt: null,
          status: { not: "CANCELLED" },
        },
      }),
    ]);

    const conversionRate =
      totalVisitors > 0 ? parseFloat(((totalOrders / totalVisitors) * 100).toFixed(2)) : 0;

    return {
      success: true as const,
      data: { totalVisitors, totalOrders, conversionRate },
    };
  } catch (error) {
    console.error("[ANALYTICS] getConversionStats failed:", error);
    return { success: false as const, data: null };
  }
}

// ═══════════════════════════════════════════
// Track Page View (used by API route)
// ═══════════════════════════════════════════

export async function trackPageView(data: { path: string; sessionId: string; device?: string }) {
  try {
    await prisma.pageView.create({
      data: {
        path: data.path,
        sessionId: data.sessionId,
        device: data.device || "desktop",
      },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ═══════════════════════════════════════════
// Advanced E-commerce Metrics
// ═══════════════════════════════════════════

export async function getAdvancedEcommerceMetrics(days: number = 30) {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const [orders, abandonedCarts] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: since },
          deletedAt: null,
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.abandonedCart.count({
        where: { createdAt: { gte: since } },
      }),
    ]);

    const totalRevenue = Number(orders._sum.total || 0);
    const totalOrders = orders._count.id;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Recovery rate could be calculated if we track recovered status
    const recoveredCarts = await prisma.abandonedCart.count({
      where: { createdAt: { gte: since }, status: "recovered" },
    });

    const recoveryRate =
      abandonedCarts > 0 ? Math.round((recoveredCarts / abandonedCarts) * 100) : 0;

    return {
      success: true as const,
      data: {
        aov,
        abandonedCarts,
        recoveredCarts,
        recoveryRate,
      },
    };
  } catch (error) {
    console.error("[ANALYTICS] getAdvancedEcommerceMetrics failed:", error);
    return { success: false as const, data: null };
  }
}

// ═══════════════════════════════════════════
// Top Selling Products (By Volume)
// ═══════════════════════════════════════════

export async function getTopSellingProducts(take: number = 5) {
  await requireAdmin();

  try {
    const topVariants = await prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take,
    });

    // Fetch product details for these variants
    const variantIds = topVariants.map((v) => v.variantId);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { name: true, category: { select: { name: true } } } } },
    });

    // Merge data
    const topProducts = topVariants.map((tv) => {
      const variant = variants.find((v) => v.id === tv.variantId);
      return {
        id: tv.variantId,
        name: variant?.product.name || "Unknown Product",
        category: variant?.product.category?.name || "Uncategorized",
        sku: variant?.sku || "N/A",
        sold: tv._sum.quantity || 0,
        revenue: Number(tv._sum.totalPrice || 0),
        image:
          variant?.images && Array.isArray(variant.images) && variant.images.length > 0
            ? (variant.images[0] as string)
            : null,
      };
    });

    return { success: true as const, data: topProducts };
  } catch (error) {
    console.error("[ANALYTICS] getTopSellingProducts failed:", error);
    return { success: false as const, data: [] };
  }
}

// ═══════════════════════════════════════════
// Recent Activity Feed
// ═══════════════════════════════════════════

export async function getRecentActivityFeed(take: number = 10) {
  await requireAdmin();

  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });

    return {
      success: true as const,
      data: notifications,
    };
  } catch (error) {
    console.error("[ANALYTICS] getRecentActivityFeed failed:", error);
    return { success: false as const, data: [] };
  }
}

// -------------------------------------------
// Daily Revenue Trend (for charts)
// -------------------------------------------

export async function getDailyRevenueTrend(days: number = 30) {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const result = await prisma.$queryRaw<Array<{ date: string; revenue: bigint; orders: bigint }>>`
      SELECT
        DATE(created_at) as date,
        SUM(total) as revenue,
        COUNT(id) as orders
      FROM orders
      WHERE created_at >= ${since} AND status NOT IN ('CANCELLED', 'RETURNED', 'REFUNDED') AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return {
      success: true as const,
      data: result.map((r) => ({
        date: String(r.date),
        revenue: Number(r.revenue),
        orders: Number(r.orders),
      })),
    };
  } catch (error) {
    console.error("[ANALYTICS] getDailyRevenueTrend failed:", error);
    return {
      success: false as const,
      data: [] as { date: string; revenue: number; orders: number }[],
    };
  }
}

