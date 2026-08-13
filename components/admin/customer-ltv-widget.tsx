"use client";

/**
 * Euphoria — Customer Lifetime Value (CLV) Widget
 * Top 5 customers by total spend, linked to customer details.
 */

import Link from "next/link";
import { Crown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface CustomerLTV {
  id: string;
  name: string | null;
  email: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: Date | null;
}

interface CustomerLTVWidgetProps {
  customers: CustomerLTV[];
}

const rankColors = [
  "text-yellow-500 bg-yellow-50 border-yellow-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-amber-600 bg-amber-50 border-amber-200",
  "text-gray-500 bg-gray-50 border-gray-200",
  "text-gray-500 bg-gray-50 border-gray-200",
];

export function CustomerLTVWidget({ customers }: CustomerLTVWidgetProps) {
  if (!customers || customers.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-xl shadow-sm overflow-hidden p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
          <div className="p-1.5 bg-purple-100/50 rounded-md">
            <Crown className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Top Customers (CLV)</h2>
            <p className="text-xs text-gray-500">Highest lifetime value</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 py-4 text-center">No customer data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-xl shadow-sm overflow-hidden p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
        <div className="p-1.5 bg-purple-100/50 rounded-md">
          <Crown className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Top Customers (CLV)</h2>
          <p className="text-xs text-gray-500">Highest lifetime value patrons</p>
        </div>
      </div>

      <div className="space-y-3">
        {customers.slice(0, 5).map((customer, index) => {
          const initials = (customer.name || customer.email)
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
            >
              <Link
                href={`/admin/customers/${customer.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {/* Rank badge */}
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${
                    rankColors[index] || rankColors[4]
                  }`}
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {initials}
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                    {customer.name || "Guest"}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{customer.totalOrders} orders</p>
                </div>

                {/* CLV */}
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">
                    ৳{customer.totalSpend.toLocaleString("en-BD")}
                  </p>
                  <div className="flex items-center gap-0.5 justify-end">
                    <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                    <p className="text-[9px] text-emerald-600 font-bold">LTV</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
