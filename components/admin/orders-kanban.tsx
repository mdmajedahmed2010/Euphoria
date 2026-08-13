"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/actions/order.actions";
import { toast } from "sonner";
import Link from "next/link";
import { Clock, Package, Truck, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrdersKanban({ orders: initialOrders }: { orders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const columns = [
    { id: "PENDING", title: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700" },
    {
      id: "PROCESSING",
      title: "Processing",
      icon: Package,
      color: "bg-indigo-100 text-indigo-700",
    },
    { id: "SHIPPED", title: "Shipped", icon: Truck, color: "bg-purple-100 text-purple-700" },
    {
      id: "DELIVERED",
      title: "Delivered",
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("orderId", id);
    e.dataTransfer.effectAllowed = "move";
    // Slight delay so the ghost image doesn't disappear
    setTimeout(() => {
      const el = document.getElementById(`order-card-${id}`);
      if (el) el.classList.add("opacity-50");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    const el = document.getElementById(`order-card-${id}`);
    if (el) el.classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    if (!orderId) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === newStatus) return;

    // Optimistic UI update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

    setIsUpdating(orderId);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await updateOrderStatus({ orderId, status: newStatus as any });
      if (res.success) {
        toast.success(`Order moved to ${newStatus}`);
      } else {
        toast.error(res.error || "Failed to update order status");
        // Revert on fail
        setOrders(initialOrders);
      }
    } catch {
      toast.error("An error occurred while updating status");
      setOrders(initialOrders);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)] items-start custom-scrollbar">
      {columns.map((col) => {
        const colOrders = orders.filter((o) => {
          // Map confirmed into processing for the board view
          if (col.id === "PROCESSING" && o.status === "CONFIRMED") return true;
          return o.status === col.id;
        });

        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 bg-gray-50/50 rounded-2xl border border-gray-200/60 flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200/60 bg-white/50 backdrop-blur-sm rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${col.color}`}>
                  <col.icon className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-gray-900">{col.title}</h3>
              </div>
              <span className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                {colOrders.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {colOrders.length === 0 ? (
                <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium">
                  Drop orders here
                </div>
              ) : (
                colOrders.map((order) => (
                  <div
                    key={order.id}
                    id={`order-card-${order.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    onDragEnd={(e) => handleDragEnd(e, order.id)}
                    className={`bg-white border ${isUpdating === order.id ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200/80"} rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-BD", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900 font-mono">
                          ৳{Number(order.total).toLocaleString()}
                        </p>
                        {isUpdating === order.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500 ml-auto mt-1" />
                        ) : (
                          <span
                            className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {order.paymentStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {order.guestName ? order.guestName.charAt(0).toUpperCase() : "G"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {order.guestName || "Guest Customer"}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{order.guestPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[11px] font-medium text-gray-500">
                        {order.items?.length || 0} items
                      </p>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[11px] font-semibold text-gray-400 hover:text-blue-600 flex items-center gap-0.5 transition-colors"
                      >
                        Details <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
