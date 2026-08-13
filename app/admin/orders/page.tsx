/**
 * Sitara — Admin Orders Page
 * SOP §৬F — Order Management
 */

import { getAdminOrders } from "@/actions/order.actions";
import Link from "next/link";
import Form from "next/form";
import { Search } from "lucide-react";
import { OrderExportButton } from "@/components/admin/order-export-button";
import { OrdersTable } from "@/components/admin/orders-table";
import { OrdersKanban } from "@/components/admin/orders-kanban";
import { LayoutGrid, List } from "lucide-react";
import { prisma } from "@/lib/db";
import { OrderPipeline } from "@/components/admin/order-pipeline";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    date?: string;
    view?: "table" | "kanban";
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || undefined;
  const paymentStatus = params.paymentStatus || undefined;
  const date = params.date || undefined;
  const view = params.view || "table";
  const pageSize = view === "kanban" ? 100 : 20;

  let dateFrom: string | undefined = undefined;
  let dateTo: string | undefined = undefined;

  if (date === "today") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    dateFrom = todayStart.toISOString();

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    dateTo = todayEnd.toISOString();
  }

  const result = await getAdminOrders({
    page,
    pageSize,
    search: search || undefined,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
  });

  const orders = result.orders || [];
  const pagination = result.pagination;

  // Fetch counts for the pipeline
  let pipelineCounts = { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0 };
  try {
    const [pending, confirmed, processing, shipped, delivered] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
    ]);
    pipelineCounts = { pending, confirmed, processing, shipped, delivered };
  } catch (err) {
    console.error("[DB ERROR] Failed to fetch order pipeline counts:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1">
            <Link
              href={`/admin/orders?view=table${status ? `&status=${status}` : ""}`}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                view === "table"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="h-4 w-4" />
              Table
            </Link>
            <Link
              href={`/admin/orders?view=kanban${status ? `&status=${status}` : ""}`}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                view === "kanban"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </Link>
          </div>
          <OrderExportButton />
        </div>
      </div>

      {/* Order Flow Pipeline */}
      <OrderPipeline
        pendingCount={pipelineCounts.pending}
        confirmedCount={pipelineCounts.confirmed}
        processingCount={pipelineCounts.processing}
        shippedCount={pipelineCounts.shipped}
        deliveredCount={pipelineCounts.delivered}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Form className="relative flex-1" action="/admin/orders">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by order #, name, phone... (Press Enter)"
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-gray-400 focus:outline-none"
          />
        </Form>
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (s) => (
              <Link
                key={s}
                href={`/admin/orders${s === "ALL" ? "" : `?status=${s}`}`}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  (s === "ALL" && !status) || status === s
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </Link>
            )
          )}
        </div>
      </div>

      {/* Orders View */}
      {view === "kanban" ? <OrdersKanban orders={orders} /> : <OrdersTable orders={orders} />}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {page < pagination.totalPages && (
              <Link
                href={`/admin/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
