/**
 * Sitara — Admin Dashboard (Advanced 10x)
 * Premium dashboard with stats, quick actions, recent activity, revenue overview, and Pro Insights
 */

import { getAdminDashboardStats, getDashboardAnalytics } from "@/actions/order.actions";
import {
  getVisitorStats,
  getConversionStats,
  getDeviceBreakdown,
  getTopPages,
  getAdvancedEcommerceMetrics,
  getTopSellingProducts,
  getRecentActivityFeed,
} from "@/actions/analytics.actions";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { CustomerLTVWidget } from "@/components/admin/customer-ltv-widget";
import { QuickStockUpdate } from "@/components/admin/quick-stock-update";
import { prisma } from "@/lib/db";
import { RevenueTicker } from "@/components/admin/revenue-ticker";
import { ConversionFunnel } from "@/components/admin/conversion-funnel";
import {
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  Eye,
  RefreshCw,
  TrendingUp,
  FileText,
  Smartphone,
  Activity,
  Award,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  StatCard,
  QuickStatCard,
  VisitorStatCard,
  DeviceBreakdownChart,
  TopPagesList,
  StaggeredGrid,
  AdvancedMetricCard,
  TopProductsList,
  ActivityFeed,
} from "@/components/admin/dashboard-ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats();
  const analyticsResult = await getDashboardAnalytics("7d");

  // Advanced Pro Analytics
  const [
    visitorResult,
    conversionResult,
    deviceResult,
    topPagesResult,
    advMetricsResult,
    topProductsResult,
    activityFeedResult,
  ] = await Promise.allSettled([
    getVisitorStats(),
    getConversionStats(),
    getDeviceBreakdown(),
    getTopPages(),
    getAdvancedEcommerceMetrics(30),
    getTopSellingProducts(5),
    getRecentActivityFeed(7),
  ]);

  const visitors =
    visitorResult.status === "fulfilled" && visitorResult.value.success
      ? visitorResult.value.data
      : null;
  const conversion =
    conversionResult.status === "fulfilled" && conversionResult.value.success
      ? conversionResult.value.data
      : null;
  const devices =
    deviceResult.status === "fulfilled" && deviceResult.value.success
      ? deviceResult.value.data
      : [];
  const topPages =
    topPagesResult.status === "fulfilled" && topPagesResult.value.success
      ? topPagesResult.value.data
      : [];
  const advMetrics =
    advMetricsResult.status === "fulfilled" && advMetricsResult.value.success
      ? advMetricsResult.value.data
      : null;
  const topProducts =
    topProductsResult.status === "fulfilled" && topProductsResult.value.success
      ? topProductsResult.value.data
      : [];
  const activityFeed =
    activityFeedResult.status === "fulfilled" && activityFeedResult.value.success
      ? activityFeedResult.value.data
      : [];

  if (!result.success || !result.stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-gray-600 font-medium">Failed to load dashboard data</p>
        <p className="text-sm text-gray-400 mt-1">Check your database connection</p>
      </div>
    );
  }

  const { stats } = result;

  const lowStockVariants = await prisma.productVariant.findMany({
    where: { stock: { lt: 5 }, isActive: true },
    include: { product: { select: { name: true } } },
    orderBy: { stock: "asc" },
    take: 5,
  });

  // Customer LTV: top 5 customers by total spend
  const topCustomers = await prisma.order.groupBy({
    by: ["userId"],
    where: { status: { not: "CANCELLED" as const }, userId: { not: null } },
    _sum: { total: true },
    _count: { id: true },
    orderBy: { _sum: { total: "desc" } },
    take: 5,
  }).then(async (groups) => {
    const userIds = groups.map(g => g.userId).filter(Boolean) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const lastOrders = await prisma.order.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      select: { userId: true, createdAt: true },
    });
    return groups.map(g => {
      const user = users.find(u => u.id === g.userId);
      const lastOrder = lastOrders.find(o => o.userId === g.userId);
      return {
        id: g.userId as string,
        name: user?.name || null,
        email: user?.email || "",
        totalOrders: g._count.id,
        totalSpend: Number(g._sum.total || 0),
        lastOrderDate: lastOrder?.createdAt || null,
      };
    });
  }).catch(() => []);

  // Monthly Goal from settings
  const goalSetting = await prisma.siteSetting.findUnique({ where: { key: "monthly_revenue_goal" } }).catch(() => null);
  const monthlyGoal = goalSetting ? Number(goalSetting.value) || 0 : 0;

  const chartData = (analyticsResult.success ? analyticsResult.dataPoints || [] : []) as {
    label: string;
    revenue: number;
    count: number;
  }[];

  return (
    <div className="space-y-6 pb-20 lg:pb-6 overflow-hidden">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Command Center
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Advanced real-time overview of your e-commerce operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-gray-900/20 transition-all hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/30 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">New</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-white hover:shadow-md active:scale-[0.98]"
          >
            <Eye className="h-4 w-4" />
            Orders
          </Link>
        </div>
      </div>

      {/* Primary Stats — 4 cards */}
      <StaggeredGrid className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders.toString()}
          icon={<ShoppingCart className="h-5 w-5" />}
          trend={stats.todayOrders > 0 ? "up" : "neutral"}
          trendValue={stats.todayOrders > 0 ? `+${stats.todayOrders}` : "0"}
          color="blue"
          href="/admin/orders?date=today"
        />
        <RevenueTicker value={stats.todayRevenue} />
        <StatCard
          title="Pending"
          value={stats.pendingOrders.toString()}
          icon={<Clock className="h-5 w-5" />}
          trend={stats.pendingOrders > 3 ? "down" : "neutral"}
          trendValue={stats.pendingOrders > 0 ? "Needs action" : "All clear"}
          color="amber"
          href="/admin/orders?status=PENDING"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockCount.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={stats.lowStockCount > 0 ? "down" : "neutral"}
          trendValue={stats.lowStockCount > 0 ? "Restock needed" : "Good"}
          color="rose"
          href="/admin/products?stock=low"
        />
      </StaggeredGrid>

      {/* Revenue + Quick Stats Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Overview Card */}
        <div className="lg:col-span-2">
          <DashboardCharts initialData={chartData} monthlyGoal={monthlyGoal} />
        </div>

        {/* Quick Stats (Order Summary) & Low Stock Widgets */}
        <StaggeredGrid className="space-y-4 lg:col-span-1">
          <div className="space-y-3">
            <QuickStatCard
              label="Pending Orders"
              value={stats.pendingOrders.toString()}
              icon={<Clock className="h-5 w-5" />}
              href="/admin/orders?status=PENDING"
              color="amber"
            />
            <QuickStatCard
              label="Processing Orders"
              value={stats.processingOrders.toString()}
              icon={<Package className="h-5 w-5" />}
              href="/admin/orders?status=PROCESSING"
              color="indigo"
            />
            <QuickStatCard
              label="Delivered Orders"
              value={stats.deliveredOrders.toString()}
              icon={<ShoppingCart className="h-5 w-5" />}
              href="/admin/orders?status=DELIVERED"
              color="teal"
            />
          </div>

          <QuickStockUpdate initialItems={lowStockVariants} />
        </StaggeredGrid>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* Advanced Pro Analytics (Dark Mode Section)   */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-[2.5rem] bg-gray-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden my-10">
        {/* Deep ambient glows */}
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none mix-blend-screen" />

        <div className="mb-8 relative z-10">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            Pro Insights & Analytics
          </h2>
          <p className="text-sm font-medium text-gray-400 mt-2">
            Advanced real-time intelligence for scaling your e-commerce business
          </p>
        </div>

        {/* Top Tier Metrics: AOV, Conversion, Abandoned Carts */}
        <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 relative z-10">
          <AdvancedMetricCard
            title="Average Order Value"
            value={advMetrics?.aov ? `৳${advMetrics.aov.toLocaleString("en-BD")}` : "৳0"}
            subtitle="Trailing 30 days AOV"
            icon={<DollarSign className="h-6 w-6" />}
            gradient="from-emerald-500 to-teal-700"
          />
          <AdvancedMetricCard
            title="Conversion Rate"
            value={conversion?.conversionRate ? `${conversion.conversionRate}` : "0"}
            subtitle={`${conversion?.totalOrders || 0} orders / ${conversion?.totalVisitors || 0} visitors`}
            icon={<TrendingUp className="h-6 w-6" />}
            gradient="from-blue-500 to-indigo-700"
          />
          <AdvancedMetricCard
            title="Abandoned Carts"
            value={advMetrics?.abandonedCarts || 0}
            subtitle={`${advMetrics?.recoveryRate || 0}% recovery rate (${advMetrics?.recoveredCarts || 0} recovered)`}
            icon={<ShoppingCart className="h-6 w-6" />}
            gradient="from-rose-500 to-pink-700"
          />
        </StaggeredGrid>

        {/* Conversion Funnel */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl relative z-10">
          <ConversionFunnel
            visitors={conversion?.totalVisitors ?? visitors?.sevenDay?.visitors ?? 0}
            orders={conversion?.totalOrders ?? 0}
            conversionRate={
              conversion?.conversionRate !== undefined
                ? String(conversion.conversionRate)
                : undefined
            }
          />
        </div>

        {/* Visitor Stats Row */}
        <StaggeredGrid className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8 relative z-10">
          <VisitorStatCard
            label="Today"
            visitors={visitors?.today?.visitors ?? 0}
            views={visitors?.today?.views ?? 0}
          />
          <VisitorStatCard
            label="Yesterday"
            visitors={visitors?.yesterday?.visitors ?? 0}
            views={visitors?.yesterday?.views ?? 0}
          />
          <VisitorStatCard
            label="7 Days"
            visitors={visitors?.sevenDay?.visitors ?? 0}
            views={visitors?.sevenDay?.views ?? 0}
            prevVisitors={visitors?.sevenDay?.prevVisitors}
          />
          <VisitorStatCard
            label="30 Days"
            visitors={visitors?.thirtyDay?.visitors ?? 0}
            views={visitors?.thirtyDay?.views ?? 0}
            prevVisitors={visitors?.thirtyDay?.prevVisitors}
          />
        </StaggeredGrid>

        {/* Device Breakdown & Top Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-400" /> Device Distribution
            </h3>
            <div className="h-48 flex items-center justify-center">
              <DeviceBreakdownChart devices={devices} />
            </div>
          </div>
          {topPages && topPages.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" /> Top Performing Pages
              </h3>
              <TopPagesList topPages={topPages.slice(0, 4)} />
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* Bottom Section: Top Products, Activity, Orders */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Top Selling Products */}
        <div className="xl:col-span-1 rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-xl shadow-sm overflow-hidden p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <div className="p-1.5 bg-emerald-100/50 rounded-md">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Top Sellers</h2>
              <p className="text-xs text-gray-500">Highest volume products</p>
            </div>
          </div>
          <TopProductsList products={topProducts} />
        </div>

        {/* Recent Activity Feed */}
        <div className="xl:col-span-1 rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-xl shadow-sm overflow-hidden p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <div className="p-1.5 bg-blue-100/50 rounded-md">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Live Activity</h2>
              <p className="text-xs text-gray-500">System and admin events</p>
            </div>
          </div>
          <ActivityFeed activities={activityFeed} />
        </div>

        {/* Customer LTV Widget */}
        <CustomerLTVWidget customers={topCustomers} />

        {/* Recent Orders Table (Takes remaining space) */}
        <div className="xl:col-span-1 rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100/80 px-5 py-4 bg-white/40">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Latest customer orders</p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
            >
              View All
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <tbody className="divide-y divide-gray-50/50">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <RefreshCw className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50/60 group">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">
                          {order.guestName || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-black text-gray-900 font-mono">
                          ৳{Number(order.total).toLocaleString()}
                        </p>
                        <div className="mt-1 flex justify-end">
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Helpers for badges (Kept Server-Side)
// ═══════════════════════════════════════════
function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100/50 text-amber-700 border-amber-200/50",
    CONFIRMED: "bg-blue-100/50 text-blue-700 border-blue-200/50",
    PROCESSING: "bg-indigo-100/50 text-indigo-700 border-indigo-200/50",
    SHIPPED: "bg-purple-100/50 text-purple-700 border-purple-200/50",
    DELIVERED: "bg-emerald-100/50 text-emerald-700 border-emerald-200/50",
    CANCELLED: "bg-rose-100/50 text-rose-700 border-rose-200/50",
    RETURNED: "bg-orange-100/50 text-orange-700 border-orange-200/50",
    REFUNDED: "bg-gray-100/50 text-gray-700 border-gray-200/50",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${colors[status] || "bg-gray-100/50 text-gray-600 border-gray-200/50"}`}
    >
      {status}
    </span>
  );
}
