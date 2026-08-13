"use client";

/**
 * Euphoria — Interactive Analytics Dashboard Charts
 * Premium charting component using Recharts and Framer Motion.
 */

import { useState, useEffect, useRef } from "react";
import { getDashboardAnalytics } from "@/actions/order.actions";
import { TrendingUp, RefreshCw, DollarSign, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  label: string;
  revenue: number;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { revenue: number; count: number } }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gray-900/95 p-3 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-gray-800"
      >
        <p className="mb-2 text-gray-400 font-semibold border-b border-gray-700 pb-2">{label}</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-gray-300">Revenue:</span>
            <span className="text-emerald-400 font-bold font-mono">
              ৳{payload[0]?.payload?.revenue.toLocaleString("en-BD")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-gray-300">Orders:</span>
            <span className="text-blue-400 font-bold font-mono">{payload[0]?.payload?.count}</span>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

export function DashboardCharts({ initialData, monthlyGoal }: { initialData: DataPoint[]; monthlyGoal?: number }) {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"revenue" | "orders">("revenue");

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let active = true;

    async function loadData() {
      setLoading(true);
      const res = await getDashboardAnalytics(range);
      if (active && res.success && res.dataPoints) {
        setData(res.dataPoints as DataPoint[]);
      }
      if (active) setLoading(false);
    }

    loadData();
    return () => {
      active = false;
    };
  }, [range]);

  // Analytics Metrics
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-xl p-5 shadow-sm space-y-5"
    >
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
            </div>
            Performance Insights
          </h2>
          <p className="text-xs text-gray-500 mt-1">Visualize store trends and order volume</p>
        </div>

        {/* Filters and Chart Type Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Metric Toggle */}
          <div className="flex rounded-xl bg-gray-100/80 p-1 border border-gray-200/50 text-xs font-semibold backdrop-blur-sm">
            <button
              onClick={() => setChartType("revenue")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === "revenue"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartType("orders")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === "orders"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Orders
            </button>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex rounded-xl bg-gray-100/80 p-1 border border-gray-200/50 text-xs font-semibold backdrop-blur-sm">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "12m", label: "12 Months" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  range === t.id
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview stats block */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-100/80 pt-5">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 rounded-xl ring-1 ring-emerald-500/20 shadow-sm">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Range Revenue
            </p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight">
              ৳{totalRevenue.toLocaleString("en-BD")}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 rounded-xl ring-1 ring-blue-500/20 shadow-sm">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Range Orders
            </p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight">
              {totalOrders} Orders
            </h4>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="relative pt-4 h-[280px] w-full select-none">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm text-gray-600 font-medium">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                Updating Chart...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ResponsiveContainer width="100%" height="100%">
          {chartType === "revenue" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                dy={10}
                minTickGap={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                tickFormatter={(val) => `৳${val >= 1000 ? (val / 1000).toFixed(1) + "k" : val}`}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: "#3b82f6" }}
                animationDuration={1500}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                dy={10}
                minTickGap={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                dx={-10}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Monthly Revenue Goal */}
      {monthlyGoal && monthlyGoal > 0 && (() => {
        const currentMonthRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
        const goalProgress = Math.min((currentMonthRevenue / monthlyGoal) * 100, 100);
        const remaining = Math.max(monthlyGoal - currentMonthRevenue, 0);
        return (
          <div className="pt-4 border-t border-gray-100/80">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Monthly Revenue Goal</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                  ৳{currentMonthRevenue.toLocaleString("en-BD")}{" "}
                  <span className="text-gray-400 font-normal">of ৳{monthlyGoal.toLocaleString("en-BD")}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-gray-900">{goalProgress.toFixed(0)}%</p>
                {remaining > 0 && (
                  <p className="text-[10px] text-gray-400">৳{remaining.toLocaleString("en-BD")} to go</p>
                )}
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${goalProgress}%`,
                  background: goalProgress >= 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : goalProgress >= 75
                    ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                    : "linear-gradient(90deg, #d4af37, #d4af37)"
                }}
              />
            </div>
            {goalProgress >= 100 && (
              <p className="text-[10px] font-bold text-emerald-600 mt-1.5">✓ Monthly goal achieved!</p>
            )}
          </div>
        );
      })()}
    </motion.div>
  );
}
