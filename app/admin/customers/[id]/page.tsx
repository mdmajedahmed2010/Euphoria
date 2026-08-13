/**
 * Sitara — Admin Customer Detail Page
 * SOP §৬F — Customer detail + order history + delete
 */

import { getCustomerDetail } from "@/actions/customer.actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import { auth } from "@/lib/auth";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (!["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role || "")) {
    redirect("/admin");
  }

  const { id } = await params;
  const result = await getCustomerDetail(id);

  if (!result.success || !result.customer) {
    notFound();
  }

  const customer = result.customer;
  const addresses = (customer.addresses || []) as {
    id: string;
    name: string;
    phone: string;
    street: string;
    area: string;
    city: string;
    postalCode: string;
  }[];
  const orders = customer.orders || [];

  const totalSpent = orders.reduce((sum, o) => {
    if (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status)) {
      return sum + Number(o.total);
    }
    return sum;
  }, 0);

  const isGuest = "isGuest" in customer && Boolean((customer as { isGuest?: boolean }).isGuest);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              {isGuest ? (
                <span className="inline-flex rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                  Guest Buyer
                </span>
              ) : (
                <span className="inline-flex rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Registered Account
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              First order / Joined on{" "}
              {new Date(customer.createdAt).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div>
          {!isGuest && <DeleteCustomerButton customerId={customer.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column — Order History */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order History Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ShoppingBag className="h-5 w-5 text-gray-500" />
              Order History ({customer._count.orders})
            </h2>

            {orders.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                This customer has not placed any orders yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-400">
                      <th className="pb-3 pr-4">Order #</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-sm font-semibold text-gray-900">
                          ৳{Number(order.total).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-700"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Saved Addresses Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="h-5 w-5 text-gray-500" />
              Saved Addresses ({addresses.length})
            </h2>

            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No addresses saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-lg border border-gray-100 p-4 space-y-1 text-sm"
                  >
                    <p className="font-bold text-gray-800">{addr.name}</p>
                    <p className="text-gray-600">{addr.street}</p>
                    <p className="text-gray-600">
                      {addr.area}, {addr.city}
                    </p>
                    <p className="text-gray-600">{addr.postalCode}</p>
                    <p className="text-xs text-gray-400 mt-2">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Summary & Stats */}
        <div className="space-y-6">
          {/* Customer Spent Summary */}
          <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Lifetime Value
            </p>
            <h2 className="mt-2 text-3xl font-extrabold font-heading text-white">
              ৳{totalSpent.toLocaleString()}
            </h2>
            <div className="mt-4 border-t border-gray-700/60 pt-4 flex justify-between text-xs text-gray-400">
              <span>Orders Placed: {customer._count.orders}</span>
              <span>Reviews Posted: {customer._count.reviews}</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Profile Overview
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Full Name
                  </p>
                  <p className="font-semibold text-gray-800">{customer.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Email Address
                  </p>
                  <p className="font-semibold text-gray-800 truncate">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Phone Number
                  </p>
                  <p className="font-semibold text-gray-800">{customer.phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
