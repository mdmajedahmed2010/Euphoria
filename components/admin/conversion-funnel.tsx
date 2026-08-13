"use client";

/**
 * Euphoria — Conversion Funnel
 * Animated funnel: Visitors → Cart Adds → Checkout Starts → Orders.
 * Trapezoid shapes narrow with stagger animation; drop-off shown.
 */

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/admin/dashboard-ui";

interface FunnelStage {
  label: string;
  value: number;
  color: string;
  bg: string;
  dropoff?: number; // % lost from previous stage
}

interface ConversionFunnelProps {
  visitors: number;
  cartAdds?: number;
  checkoutStarts?: number;
  orders: number;
  conversionRate?: string;
}

export function ConversionFunnel({
  visitors,
  cartAdds,
  checkoutStarts,
  orders,
  conversionRate,
}: ConversionFunnelProps) {
  // Build funnel stages with estimated values where real data isn't available
  const estimatedCartAdds = cartAdds ?? Math.round(visitors * 0.12);
  const estimatedCheckouts = checkoutStarts ?? Math.round(estimatedCartAdds * 0.65);

  const stages: FunnelStage[] = [
    { label: "Visitors", value: visitors, color: "from-blue-400 to-blue-600", bg: "bg-blue-500" },
    {
      label: "Cart Adds",
      value: estimatedCartAdds,
      color: "from-indigo-400 to-indigo-600",
      bg: "bg-indigo-500",
      dropoff: visitors > 0 ? Math.round((1 - estimatedCartAdds / visitors) * 100) : 0,
    },
    {
      label: "Checkout",
      value: estimatedCheckouts,
      color: "from-purple-400 to-purple-600",
      bg: "bg-purple-500",
      dropoff:
        estimatedCartAdds > 0 ? Math.round((1 - estimatedCheckouts / estimatedCartAdds) * 100) : 0,
    },
    {
      label: "Orders",
      value: orders,
      color: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-500",
      dropoff: estimatedCheckouts > 0 ? Math.round((1 - orders / estimatedCheckouts) * 100) : 0,
    },
  ];

  const maxVal = stages[0]?.value || 1;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            🎯 Conversion Funnel
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Visitor to order journey</p>
        </div>
        {conversionRate && (
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-400 font-medium">Conv. Rate</p>
            <p className="text-xl font-black text-emerald-400">{conversionRate}</p>
          </div>
        )}
      </div>

      {stages.map((stage, i) => {
        const widthPct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0;
        const clampedWidth = Math.max(widthPct, 18); // min visual width

        return (
          <div key={stage.label}>
            {/* Drop-off label */}
            {stage.dropoff !== undefined && stage.dropoff > 0 && (
              <motion.div
                className="flex items-center justify-center gap-1 py-0.5"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 + 0.4 }}
              >
                <motion.div
                  className="text-[10px] text-rose-400 font-bold flex items-center gap-1"
                  animate={{ y: [0, 2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                >
                  ▼ {stage.dropoff}% drop-off
                </motion.div>
              </motion.div>
            )}

            {/* Funnel bar (trapezoid via border-radius trick) */}
            <motion.div
              className="relative mx-auto flex items-center justify-center"
              style={{
                width: "100%",
                maxWidth: "100%",
              }}
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: i * 0.12 }}
            >
              <motion.div
                className={`relative flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r ${stage.color} shadow-lg`}
                style={{ width: `${clampedWidth}%` }}
                initial={{ width: "20%" }}
                animate={{ width: `${clampedWidth}%` }}
                transition={{ duration: 0.9, delay: i * 0.15 + 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-xs font-bold text-white/90 truncate">{stage.label}</span>
                <span className="text-sm font-black text-white ml-2 shrink-0">
                  <AnimatedNumber value={stage.value} />
                </span>
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
