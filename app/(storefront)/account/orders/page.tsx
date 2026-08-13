/**
 * Sitara — My Orders Page
 * Order list with status badges
 * SOP §২ — Frontend Plan F5.6
 */

import Link from "next/link";
import { Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { getUserOrders } from "@/actions/account.actions";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default async function OrdersPage() {
  const res = await getUserOrders();
  const orders = res.success && res.orders ? res.orders : [];

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <Package className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            When you place an order, it will appear here.
          </p>
        </div>
        <Link
          href="/collections/new-arrivals"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Order History ({orders.length})</h2>
      <Separator />

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="block p-4 rounded-xl border border-border hover:border-foreground/20 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium font-mono">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {order.date} · {order.itemCount} item
                  {order.itemCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right space-y-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[order.status] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {order.status}
                </span>
                <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
