"use client";

import { useState } from "react";
import { sendRecoveryEmail } from "@/actions/cart.actions";
import { Mail, Clock, ShoppingCart, User, AlertCircle, CheckCircle2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AbandonedCartsTable({ carts }: { carts: any[] }) {
  const [sending, setSending] = useState<string | null>(null);

  async function handleSendEmail(cartId: string) {
    if (confirm("Send recovery email to this customer?")) {
      setSending(cartId);
      const res = await sendRecoveryEmail(cartId);
      if (res.success) {
        alert("Email sent successfully!");
        window.location.reload();
      } else {
        alert(res.error || "Failed to send email");
      }
      setSending(null);
    }
  }

  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
          <ShoppingCart className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-900">No abandoned carts found</p>
        <p className="mt-1 text-sm text-gray-500">
          When customers leave products in their cart, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-medium">Customer</th>
            <th className="px-6 py-4 font-medium">Cart Value</th>
            <th className="px-6 py-4 font-medium">Abandoned At</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {carts.map((cart) => {
            const email = cart.guestEmail || cart.user?.email || "No Email";
            const name = cart.user?.name || "Guest";
            const isSent = !!cart.emailSentAt;

            return (
              <tr key={cart.id} className="transition-colors hover:bg-gray-50/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">৳{cart.totalAmount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(cart.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isSent ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                      <CheckCircle2 className="h-3 w-3" /> Email Sent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      <AlertCircle className="h-3 w-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSendEmail(cart.id)}
                    disabled={sending === cart.id || email === "No Email"}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                  >
                    {sending === cart.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 text-gray-500" />
                    )}
                    {isSent ? "Resend Email" : "Send Recovery"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
