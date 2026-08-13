"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type RevenueData = { date: string; revenue: number; orders: number };
type VisitorData = { date: string; views: number; visitors: number };

export function AnalyticsCharts({
  revenueData,
  visitorData,
}: {
  revenueData: RevenueData[];
  visitorData: VisitorData[];
}) {
  const [activeTab, setActiveTab] = useState<"revenue" | "traffic">("revenue");

  // Format date for better readability (e.g. "2026-06-04" -> "Jun 04")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (dateStr: any) => {
    try {
      const d = new Date(String(dateStr));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl relative overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-gray-900">Performance Overview</h2>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Visual trends for your business operations
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "revenue"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sales & Orders
          </button>
          <button
            onClick={() => setActiveTab("traffic")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "traffic"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Traffic & Views
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "revenue" ? (
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                labelFormatter={formatDate}
              />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Gross Revenue (৳)"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Total Orders"
                stroke="#6366f1"
                strokeWidth={3}
                fill="none"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={visitorData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                labelFormatter={formatDate}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
              <Bar dataKey="views" name="Page Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="visitors" name="Unique Visitors" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
