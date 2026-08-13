"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteOrder, bulkDeleteOrders, bulkUpdateOrderStatus } from "@/actions/order.actions";
import { Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrdersTable({ orders }: { orders: any[] }) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedOrders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedOrders(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setIsProcessing(true);
    const res = await deleteOrder(id);
    if (res.success) {
      toast.success("Order deleted");
    } else {
      toast.error(res.error || "Failed to delete order");
    }
    setIsProcessing(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedOrders.size} orders?`)) return;
    setIsProcessing(true);
    const res = await bulkDeleteOrders(Array.from(selectedOrders));
    if (res.success) {
      toast.success(`${res.count} orders deleted`);
      setSelectedOrders(new Set());
    } else {
      toast.error(res.error || "Failed to delete orders");
    }
    setIsProcessing(false);
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) return toast.error("Please select a status");
    if (!confirm(`Update ${selectedOrders.size} orders to ${bulkStatus}?`)) return;

    setIsProcessing(true);
    const res = await bulkUpdateOrderStatus(
      Array.from(selectedOrders),
      bulkStatus as
        | "PENDING"
        | "CONFIRMED"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
        | "RETURNED"
        | "REFUNDED"
    );
    if (res.success) {
      toast.success(`${res.updated} orders updated successfully`);
      setSelectedOrders(new Set());
      setBulkStatus("");
    } else {
      toast.error(res.error || "Failed to update orders");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      {selectedOrders.size > 0 && (
        <div className="flex flex-wrap items-center justify-between rounded-lg bg-indigo-50 px-4 py-3 border border-indigo-100 gap-4 shadow-sm">
          <span className="text-sm font-bold text-indigo-900 bg-white px-2 py-1 rounded-md shadow-sm border border-indigo-100">
            {selectedOrders.size} orders selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Change Status...</option>
              <option value="CONFIRMED">Confirm</option>
              <option value="PROCESSING">Process</option>
              <option value="SHIPPED">Ship</option>
              <option value="DELIVERED">Deliver</option>
              <option value="CANCELLED">Cancel</option>
            </select>
            <button
              onClick={handleBulkStatusUpdate}
              disabled={isProcessing || !bulkStatus}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              <Edit3 className="h-3.5 w-3.5" /> Update
            </button>
            <div className="h-5 w-px bg-indigo-200 mx-1"></div>
            <button
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selectedOrders.size === orders.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </th>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.guestName || order.user?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.guestPhone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} item(s)</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ৳{Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={isProcessing}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Delete Order"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-indigo-100 text-indigo-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    RETURNED: "bg-orange-100 text-orange-700",
    REFUNDED: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UNPAID: "bg-red-100 text-red-700",
    PAID: "bg-green-100 text-green-700",
    PARTIALLY_REFUNDED: "bg-orange-100 text-orange-700",
    REFUNDED: "bg-gray-100 text-gray-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
