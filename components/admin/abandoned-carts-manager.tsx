"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateAbandonedCartStatus } from "@/actions/abandoned-cart.actions";
import {
  MessageCircle,
  Mail,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Clock,
  Eye,
  X,
} from "lucide-react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AbandonedCartsManager({ carts }: { carts: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCart, setSelectedCart] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "recovered":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1 w-max">
            <CheckCircle className="w-3 h-3" /> Recovered
          </span>
        );
      case "lost":
        return (
          <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-200 flex items-center gap-1 w-max">
            <XCircle className="w-3 h-3" /> Lost
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1 w-max">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateWhatsAppLink = (cart: any) => {
    const phone = cart.user?.phone || "";
    if (!phone) {
      toast.error("No phone number available for this customer.");
      return;
    }
    const message = `Hi ${cart.user?.name || "there"}, we noticed you left some items in your cart! Complete your checkout today and get 10% off using code: COMEBACK10 🛍️`;
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await updateAbandonedCartStatus(id, status);
    if (res.success) {
      toast.success(`Cart marked as ${status}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-700 border-b border-gray-200/60">
              <tr>
                <th className="px-6 py-4 font-bold">Customer Details</th>
                <th className="px-6 py-4 font-bold">Cart Value</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Abandoned Time</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {carts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium text-gray-500">No abandoned carts found.</p>
                  </td>
                </tr>
              )}
              {carts.map((cart) => (
                <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{cart.user?.name || "Guest User"}</p>
                    <p className="text-xs text-gray-500 mt-1 flex gap-2">
                      {cart.guestEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {cart.guestEmail}
                        </span>
                      )}
                      {cart.user?.phone && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {cart.user.phone}
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-emerald-600">
                    ৳{Number(cart.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(cart.status)}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(cart.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedCart(cart)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                        title="View Cart Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => generateWhatsAppLink(cart)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <div className="h-8 w-px bg-gray-200 mx-1 self-center" />
                      <select
                        className="text-xs font-bold rounded-lg border-gray-200 bg-gray-50 text-gray-700 py-1.5 px-3 focus:ring-2 focus:ring-indigo-500"
                        value={cart.status}
                        onChange={(e) => handleStatusUpdate(cart.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="recovered">Recovered</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart Details Modal */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Cart Snapshot</h3>
                <p className="text-xs text-gray-500">
                  Left behind on {new Date(selectedCart.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedCart(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {Array.isArray(selectedCart.cartData) && selectedCart.cartData.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                selectedCart.cartData.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="h-16 w-16 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {item.variantId} {item.size && `• Size: ${item.size}`}{" "}
                        {item.color && `• Color: ${item.color}`}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-black text-indigo-600">
                          ৳{Number(item.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 py-8">
                  No specific item data found.
                </p>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="font-bold text-gray-600">Total Abandoned Value</span>
              <span className="text-2xl font-black text-gray-900">
                ৳{Number(selectedCart.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
