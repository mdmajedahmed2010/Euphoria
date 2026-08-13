"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Eye, ShoppingCart, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export function ProductInsights({ basePrice }: { basePrice: number }) {
  const [data, setData] = useState<{
    views: number;
    carts: number;
    conversionRate: number;
    trend: number;
    points: number[];
  } | null>(null);

  useEffect(() => {
    const views = Math.floor(Math.random() * 5000) + 1000;
    const carts = Math.floor(views * 0.15);
    const conversionRate = 3.2;
    const trend = Math.random() > 0.3 ? 1 : -1;
    const points = Array.from({ length: 14 }).map((_, i) => {
      return Math.max(0, 20 + Math.sin(i) * 10 + Math.random() * 20 + (trend === 1 ? i : -i));
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({ views, carts, conversionRate, trend, points });
  }, []);

  if (!data)
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-64 animate-pulse" />
    );

  const { views, carts, conversionRate, trend, points } = data;

  const max = Math.max(...points);
  const min = Math.min(...points);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-400" />
        Product Analytics (Last 14 Days)
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-blue-500 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Views
          </p>
          <p className="text-xl font-bold text-blue-900 mt-1">{views.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" /> Added to Cart
          </p>
          <p className="text-xl font-bold text-amber-900 mt-1">{carts.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Conv. Rate
          </p>
          <p className="text-xl font-bold text-emerald-900 mt-1">{conversionRate}%</p>
        </div>
        <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-purple-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Est. Revenue
          </p>
          <p className="text-xl font-bold text-purple-900 mt-1">
            ৳{(Math.floor(carts * (conversionRate / 100)) * basePrice).toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-gray-500">Sales Velocity</p>
          <span
            className={`text-xs font-bold flex items-center gap-1 ${trend === 1 ? "text-emerald-500" : "text-red-500"}`}
          >
            {trend === 1 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(Math.floor(((points[13]! - points[0]!) / points[0]!) * 100))}%
          </span>
        </div>

        {/* Simple CSS-based bar chart sparkline */}
        <div className="flex items-end gap-1 h-20 w-full">
          {points.map((p, i) => {
            const height = ((p - min) / (max - min)) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end h-full relative group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(10, height)}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={`w-full rounded-t-sm ${trend === 1 ? "bg-emerald-200 group-hover:bg-emerald-400" : "bg-red-200 group-hover:bg-red-400"} transition-colors`}
                />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {Math.floor(p)} sales
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
