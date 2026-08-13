/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Sitara — Admin Order Detail Page
 * SOP §৬F — Order detail + status update + timeline
 */

import { getOrderDetail } from "@/actions/order.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { OrderStatusUpdateForm } from "@/components/admin/order-status-form";
import { OrderNotesForm } from "@/components/admin/order-notes-form";
import { VisualOrderTimeline } from "@/components/admin/visual-timeline";
import { prisma } from "@/lib/db";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderDetail(id);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;

  // Fetch customer profile CRM insights
  const [customerStats, successfulDeliveries, returnedOrCancelled] = await Promise.all([
    prisma.order.aggregate({
      where: { guestPhone: order.guestPhone, deletedAt: null },
      _count: { id: true },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { guestPhone: order.guestPhone, status: "DELIVERED", deletedAt: null },
    }),
    prisma.order.count({
      where: {
        guestPhone: order.guestPhone,
        status: { in: ["CANCELLED", "RETURNED"] },
        deletedAt: null,
      },
    }),
  ]);

  const totalSpent = Number(customerStats._sum.total || 0);
  const totalOrdersCount = customerStats._count.id || 0;

  // Success rate: delivered / (delivered + cancelled/returned)
  const totalCompletedOrFailed = successfulDeliveries + returnedOrCancelled;
  const orderSuccessRate =
    totalCompletedOrFailed > 0
      ? Math.round((successfulDeliveries / totalCompletedOrFailed) * 100)
      : 100;

  // CRM Tiering
  let crmTier = "NEW CLIENT";
  let tierBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (totalSpent >= 15000 || totalOrdersCount >= 5) {
    crmTier = "VIP CLUB";
    tierBadgeColor = "bg-amber-100 text-amber-800 border-amber-300 font-bold shadow-sm";
  } else if (totalSpent >= 2000) {
    crmTier = "REGULAR";
    tierBadgeColor = "bg-blue-50 text-blue-700 border-blue-200";
  }

  // Safely parse shipping address to prevent any JSON parsing or null pointer crashes
  let address: any = {};
  if (order.shippingAddress) {
    if (typeof order.shippingAddress === "string") {
      try {
        address = JSON.parse(order.shippingAddress);
      } catch {
        address = { street: order.shippingAddress };
      }
    } else {
      address = order.shippingAddress;
    }
  }

  // Parse initial delivery date and clean notes
  let deliveryDate = "";
  let cleanNotes = order.notes || "";

  if (cleanNotes.startsWith("Estimated Delivery: ")) {
    const match = cleanNotes.match(/^Estimated Delivery: ([^\n]+)\n?([\s\S]*)$/);
    if (match) {
      deliveryDate = match[1] || "";
      cleanNotes = match[2] || "";
    }
  }

  // Parse Manual Payment details
  let manualPaymentDetails = null;
  const manualPaymentMatch = cleanNotes.match(/\[Manual Payment\] Method: (.*?), Sender: (.*?), TrxID: (.*?)(?:\n|$)/);
  if (manualPaymentMatch) {
    manualPaymentDetails = {
      method: manualPaymentMatch[1],
      sender: manualPaymentMatch[2],
      trxId: manualPaymentMatch[3]
    };
    cleanNotes = cleanNotes.replace(manualPaymentMatch[0], "").trim();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column — Order Items + Status Update */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.variant?.product?.name || "Deleted Product"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.variant?.size && `Size: ${item.variant.size}`}
                      {item.variant?.color && ` • Color: ${item.variant.color}`}
                      {item.variant?.sku && ` • SKU: ${item.variant.sku}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ৳{Number(item.unitPrice).toLocaleString()} × {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      ৳{Number(item.totalPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>৳{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>৳{Number(order.shippingCharge).toLocaleString()}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    -৳{Number(order.discount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                <span>Total</span>
                <span>৳{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status Update & Delivery Form */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">Fulfillment Status</h2>
              <OrderStatusUpdateForm orderId={order.id} currentStatus={order.status} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">Delivery Date & Remarks</h2>
              <OrderNotesForm orderId={order.id} initialNotes={order.notes || ""} />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-10">
            <h2 className="mb-8 text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Advanced Order Tracking
            </h2>
            <VisualOrderTimeline timeline={order.timeline} currentStatus={order.status} />
          </div>
        </div>

        {/* Right Column — Customer Info + Payment */}
        <div className="space-y-6">
          {/* Estimated Delivery Date Badge */}
          {deliveryDate && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  Estimated Delivery
                </p>
                <p className="text-sm font-bold text-blue-900">
                  {new Date(deliveryDate).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Customer Info with CRM Profile */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">Customer Profile</h2>
              <span
                className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tierBadgeColor}`}
              >
                {crmTier}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-medium">Customer Name</p>
                <p className="font-semibold text-gray-900">{order.guestName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Mobile Contact</p>
                <p className="font-semibold text-gray-900 font-mono">{order.guestPhone}</p>
              </div>
              {order.guestEmail && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email Address</p>
                  <p className="font-semibold text-gray-900 font-mono">{order.guestEmail}</p>
                </div>
              )}
            </div>

            {/* CRM Stats Panel */}
            <div className="rounded-xl bg-[#fafafa] border border-gray-100 p-3.5 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Customer CRM Insights
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white border border-gray-100 rounded-lg p-2 text-center shadow-xs">
                  <p className="text-[10px] text-gray-400">Lifetime Orders</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{totalOrdersCount}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2 text-center shadow-xs">
                  <p className="text-[10px] text-gray-400">LTV Spent</p>
                  <p className="text-base font-bold text-emerald-600 mt-0.5 font-mono">
                    ৳{totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-gray-100/60">
                <span className="text-gray-400">Delivery Success Rate:</span>
                <span
                  className={`font-bold ${orderSuccessRate >= 80 ? "text-green-600" : orderSuccessRate >= 50 ? "text-amber-600" : "text-red-500"}`}
                >
                  {orderSuccessRate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Returned/Cancelled:</span>
                <span
                  className={`font-semibold ${returnedOrCancelled > 0 ? "text-red-500 font-bold" : "text-gray-500"}`}
                >
                  {returnedOrCancelled} orders
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Shipping Address</h2>
            <div className="text-sm text-gray-700">
              <p className="font-medium">{address?.name || order.guestName || "—"}</p>
              <p>{address?.street || "—"}</p>
              <p>
                {address?.area || ""}
                {address?.area && address?.city ? ", " : ""}
                {address?.city || ""}
              </p>
              <p>{address?.postalCode || ""}</p>
              <p className="mt-2 text-gray-500">{address?.phone || order.guestPhone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              
              {manualPaymentDetails && (
                <>
                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="text-gray-500">Sender Number</span>
                    <span className="font-medium font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">{manualPaymentDetails.sender}</span>
                  </div>
                  <div className="flex justify-between pb-3">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-medium font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">{manualPaymentDetails.trxId}</span>
                  </div>
                </>
              )}

              <div className={`flex justify-between ${!manualPaymentDetails ? 'border-t border-gray-100 pt-3' : ''}`}>
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${
                    order.paymentStatus === "PAID" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {cleanNotes && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Internal Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{cleanNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
