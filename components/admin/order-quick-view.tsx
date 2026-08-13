"use client";

/**
 * Euphoria — Order Quick View Drawer
 * Slide-out drawer from the right showing order details inline.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  MapPin,
  CreditCard,
  Clock,
  User,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import { getOrderDetail } from "@/actions/order.actions";
import { updateOrderStatus } from "@/actions/order.actions";
import { toast } from "sonner";

interface OrderQuickViewProps {
  orderId: string | null;
  onClose: () => void;
}

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: "bg-rose-50 text-rose-700",
  PAID: "bg-emerald-50 text-emerald-700",
  PARTIALLY_REFUNDED: "bg-orange-50 text-orange-700",
  REFUNDED: "bg-gray-50 text-gray-700",
  FAILED: "bg-red-50 text-red-700",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderData = any;

export function OrderQuickView({ orderId, onClose }: OrderQuickViewProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    const result = await getOrderDetail(orderId);
    if (result.success && result.order) {
      setOrder(result.order);
    }
    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrder();
  }, [fetchOrder]);

  // Escape to close
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (orderId) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
      };
    }
  }, [orderId, onClose]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    setShowStatusMenu(false);
    const result = await updateOrderStatus({
      orderId: order.id,
      status: newStatus as (typeof ORDER_STATUSES)[number],
    });
    if (result.success) {
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrder();
    } else {
      toast.error(result.error || "Failed to update status");
    }
    setIsUpdating(false);
  };

  const address =
    order?.shippingAddress && typeof order.shippingAddress === "object"
      ? (order.shippingAddress as {
          street?: string;
          area?: string;
          city?: string;
          postalCode?: string;
        })
      : null;

  return (
    <AnimatePresence>
      {orderId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[51] h-full w-[95vw] max-w-[480px] border-l border-gray-200 bg-white shadow-2xl"
          >
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
                <p className="text-sm text-gray-500">Loading order...</p>
              </div>
            ) : !order ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Package className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">Order not found</p>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                  {/* Status + Quick Change */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColors[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {order.status}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50"
                      >
                        {isUpdating ? "Updating..." : "Change Status"}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {showStatusMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowStatusMenu(false)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                            {ORDER_STATUSES.map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={order.status === status}
                                className="flex w-full items-center rounded-lg px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50 disabled:text-gray-400"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {order.guestName || "Guest"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {order.guestPhone}
                      </div>
                      {order.guestEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {order.guestEmail}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {address && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        Shipping Address
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {address.street}
                        {address.area ? `, ${address.area}` : ""}
                        {address.city ? `, ${address.city}` : ""}
                        {address.postalCode ? ` - ${address.postalCode}` : ""}
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      Items ({order.items?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map(
                        (item: {
                          id: string;
                          quantity: number;
                          unitPrice: number;
                          totalPrice: number;
                          variant?: {
                            size?: string;
                            color?: string;
                            images?: string[];
                            product?: { name: string };
                          };
                        }) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3"
                          >
                            {/* Image */}
                            {item.variant?.images &&
                            Array.isArray(item.variant.images) &&
                            item.variant.images.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.variant.images[0] as string}
                                alt={item.variant?.product?.name || "Product"}
                                className="h-12 w-12 shrink-0 rounded-lg object-cover border border-gray-100"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {item.variant?.product?.name || "Product"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.variant?.size || "OS"} / {item.variant?.color || "Default"} ×{" "}
                                {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              ৳{Number(item.totalPrice).toLocaleString()}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Payment & Totals */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      Payment
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Method</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Payment Status</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${paymentStatusColors[order.paymentStatus] || "bg-gray-50 text-gray-600"}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="border-t border-gray-200/60 pt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span>৳{Number(order.subtotal).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Shipping</span>
                        <span>৳{Number(order.shippingCharge).toLocaleString()}</span>
                      </div>
                      {Number(order.discount) > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Discount</span>
                          <span>-৳{Number(order.discount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200/60">
                        <span>Total</span>
                        <span>৳{Number(order.total).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Internal Notes
                      </h4>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
