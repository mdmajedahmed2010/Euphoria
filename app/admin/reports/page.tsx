/**
 * Sitara — Admin Reports & Premium Sales Analytics
 * SOP §৪ — High-end analytics, LTV calculation, and product variant resolution
 */

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { getDailyRevenueTrend, getDailyVisitorTrend } from "@/actions/analytics.actions";
import { getRevenueHeatmap } from "@/actions/heatmap.actions";
import { RevenueHeatmap } from "@/components/admin/revenue-heatmap";

export default async function AdminReportsPage(props: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const searchParams = await props.searchParams;
  const range = searchParams?.range || "all";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dateFilter: any = {};
  if (range === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    dateFilter.createdAt = { gte: d };
  } else if (range === "30d") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    dateFilter.createdAt = { gte: d };
  } else if (range === "this_year") {
    const d = new Date(new Date().getFullYear(), 0, 1);
    dateFilter.createdAt = { gte: d };
  }

  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    redirect("/admin");
  }

  // Fetch report metrics in a single transactional-safe parallel block
  const [totalOrders, totalRevenueAgg, ordersByStatus, topProductsRaw, totalCustomers] =
    await Promise.all([
      prisma.order.count({ where: { deletedAt: null, ...dateFilter } }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
          deletedAt: null,
          ...dateFilter,
        },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { deletedAt: null, ...dateFilter },
        _count: true,
      }),
      prisma.orderItem.groupBy({
        by: ["variantId"],
        where: { order: { deletedAt: null, ...dateFilter } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 8,
      }),
      prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null, ...dateFilter } }),
    ]);

  const totalRevenue = Number(totalRevenueAgg._sum.total || 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Chart data
  const days = range === "30d" ? 30 : range === "this_year" ? 365 : 7;
  const [revenueTrendResult, visitorTrendResult] = await Promise.all([
    getDailyRevenueTrend(days),
    getDailyVisitorTrend(days),
  ]);
  const revenueData = revenueTrendResult.data || [];
  const visitorData = visitorTrendResult.data || [];

  // Fetch heatmap data
  const heatmapResult = await getRevenueHeatmap();
  const heatmapData = heatmapResult.data || [];

  // Resolve Variant IDs to actual Product Details
  const variantIds = topProductsRaw.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: { name: true, slug: true },
      },
    },
  });

  const variantMap = new Map(
    variants.map((v) => [
      v.id,
      {
        name: v.product.name,
        slug: v.product.slug,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: Number(v.price),
      },
    ])
  );

  const topProducts = topProductsRaw.map((item) => {
    const details = variantMap.get(item.variantId);
    return {
      variantId: item.variantId,
      quantitySold: Number(item._sum.quantity || 0),
      name: details?.name || `Variant ${item.variantId.slice(0, 8)}`,
      sku: details?.sku || "N/A",
      size: details?.size || "—",
      color: details?.color || "—",
      price: details?.price || 0,
      totalSalesValue: Number(item._sum.quantity || 0) * (details?.price || 0),
    };
  });

  const statusConfig: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
  > = {
    PENDING: {
      label: "Pending Payment",
      icon: <Clock className="h-4 w-4" />,
      color: "text-amber-600",
      bg: "bg-amber-400",
      border: "border-amber-200/50",
    },
    CONFIRMED: {
      label: "Confirmed",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-blue-600",
      bg: "bg-blue-500",
      border: "border-blue-200/50",
    },
    PROCESSING: {
      label: "Processing",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-indigo-600",
      bg: "bg-indigo-500",
      border: "border-indigo-200/50",
    },
    SHIPPED: {
      label: "Shipped",
      icon: <Truck className="h-4 w-4" />,
      color: "text-purple-600",
      bg: "bg-purple-500",
      border: "border-purple-200/50",
    },
    DELIVERED: {
      label: "Delivered",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-emerald-600",
      bg: "bg-emerald-500",
      border: "border-emerald-200/50",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-rose-600",
      bg: "bg-rose-500",
      border: "border-rose-200/50",
    },
    RETURNED: {
      label: "Returned",
      icon: <TrendingDown className="h-4 w-4" />,
      color: "text-orange-600",
      bg: "bg-orange-500",
      border: "border-orange-200/50",
    },
    REFUNDED: {
      label: "Refunded",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-gray-600",
      bg: "bg-gray-500",
      border: "border-gray-200/50",
    },
  };

  return (
    <div className="space-y-7 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl flex items-center gap-2">
            <div className="p-2 bg-gray-900 rounded-xl shadow-lg shadow-gray-900/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            High-end business intelligence and sales performance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-white/60 backdrop-blur-md p-1 rounded-xl border border-gray-200/50 shadow-sm">
            {[
              { id: "all", label: "All Time" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "this_year", label: "This Year" },
            ].map((r) => (
              <Link
                key={r.id}
                href={`/admin/reports?range=${r.id}`}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  range === r.id
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
          <ReportExportButton
            data={{ totalRevenue, totalOrders, avgOrderValue, totalCustomers, ordersByStatus }}
          />
        </div>
      </div>

      {/* Analytics Summary Cards (Glassmorphic) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* LTV Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100/50 bg-gradient-to-br from-emerald-50/50 to-white/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl transition-all group-hover:bg-emerald-400/40" />
          <div className="flex items-center justify-between relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Gross Revenue
            </span>
          </div>
          <div className="mt-5 relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600/80">
              Total Confirmed Sales
            </h3>
            <p className="mt-1 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              <span className="text-emerald-500">৳</span>
              {totalRevenue.toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        {/* Volume */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-100/50 bg-gradient-to-br from-blue-50/50 to-white/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-400/20 blur-2xl transition-all group-hover:bg-blue-400/40" />
          <div className="flex items-center justify-between relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Volume
            </span>
          </div>
          <div className="mt-5 relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600/80">
              Total Orders Processed
            </h3>
            <p className="mt-1 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              {totalOrders.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="group relative overflow-hidden rounded-2xl border border-purple-100/50 bg-gradient-to-br from-purple-50/50 to-white/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-400/20 blur-2xl transition-all group-hover:bg-purple-400/40" />
          <div className="flex items-center justify-between relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Average
            </span>
          </div>
          <div className="mt-5 relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600/80">
              Average Order Value
            </h3>
            <p className="mt-1 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              <span className="text-purple-500">৳</span>
              {avgOrderValue.toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        {/* Customers */}
        <div className="group relative overflow-hidden rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/50 to-white/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-400/20 blur-2xl transition-all group-hover:bg-indigo-400/40" />
          <div className="flex items-center justify-between relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Customers
            </span>
          </div>
          <div className="mt-5 relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600/80">
              Active Customer Base
            </h3>
            <p className="mt-1 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              {totalCustomers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <AnalyticsCharts revenueData={revenueData} visitorData={visitorData} />

      {/* Interactive Revenue Heatmap */}
      <RevenueHeatmap data={heatmapData} />

      {/* Main Grid: Orders Status Distribution & Top Selling Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Order Status Distribution */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-gray-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl relative overflow-hidden">
            <div className="mb-6">
              <h2 className="text-base font-black text-gray-900">Funnel Breakdown</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">
                Order distribution across all operational stages
              </p>
            </div>
            <div className="space-y-5">
              {ordersByStatus.map((item) => {
                const config = statusConfig[item.status] || {
                  label: item.status,
                  icon: <Package className="h-4 w-4" />,
                  color: "text-gray-600",
                  bg: "bg-gray-500",
                  border: "border-gray-200",
                };
                const percentage =
                  totalOrders > 0 ? Math.round((item._count / totalOrders) * 100) : 0;

                return (
                  <div key={item.status} className="group">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2 font-bold text-gray-700">
                        <div
                          className={`p-1 rounded-md bg-white shadow-sm border ${config.border} ${config.color}`}
                        >
                          {config.icon}
                        </div>
                        {config.label}
                      </div>
                      <span className="font-black text-gray-900">
                        {item._count}{" "}
                        <span className="text-gray-400 font-medium">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full ${config.bg} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {ordersByStatus.length === 0 && (
                <div className="text-center py-8 text-sm font-medium text-gray-400">
                  No funnel data to display.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Top Selling Products Table */}
        <div className="rounded-2xl border border-gray-200/60 bg-white/60 shadow-sm backdrop-blur-xl lg:col-span-2 overflow-hidden flex flex-col">
          <div className="border-b border-gray-100/80 px-6 py-5 flex items-center justify-between bg-white/40">
            <div>
              <h2 className="text-base font-black text-gray-900">Top Performers</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">
                Highest grossing products by sales volume
              </p>
            </div>
            <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-500/20">
              Leaderboard
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100/80 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50/50">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU & Options</th>
                  <th className="px-6 py-4 text-center">Qty Sold</th>
                  <th className="px-6 py-4 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {topProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm font-medium text-gray-400"
                    >
                      No sales data available. Launch marketing campaigns to boost sales.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product) => (
                    <tr
                      key={product.variantId}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 max-w-[200px] truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 font-mono mt-1">
                          ID: {product.variantId.slice(0, 8)}...
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-bold font-mono text-gray-600 bg-gray-100/80 border border-gray-200/50 rounded px-2 py-0.5 inline-block">
                          {product.sku}
                        </p>
                        <div className="flex gap-2 mt-1.5 text-[10px] font-semibold text-gray-400">
                          {product.size && <span className="uppercase">{product.size}</span>}
                          {product.color && <span className="uppercase">• {product.color}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-black text-gray-900">
                        {product.quantitySold}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-semibold text-gray-500 line-through decoration-gray-300">
                          ৳{product.price.toLocaleString("en-BD")}
                        </p>
                        <p className="text-sm font-black text-emerald-600 font-mono drop-shadow-sm">
                          ৳{product.totalSalesValue.toLocaleString("en-BD")}
                        </p>
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
