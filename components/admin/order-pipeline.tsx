"use client";

/**
 * Euphoria — Order Flow Pipeline
 * Horizontal animated pipeline showing order stages with flowing connectors.
 * Particle dots travel along connector lines simulating orders in transit.
 */

import { motion } from "framer-motion";

interface Stage {
  label: string;
  status: string;
  count: number;
  color: string;
  glow: string;
  bg: string;
  icon: string;
}

interface OrderPipelineProps {
  pendingCount: number;
  confirmedCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
}

export function OrderPipeline({
  pendingCount,
  confirmedCount,
  processingCount,
  shippedCount,
  deliveredCount,
}: OrderPipelineProps) {
  const stages: Stage[] = [
    {
      label: "Pending",
      status: "PENDING",
      count: pendingCount,
      color: "text-amber-600",
      glow: "shadow-amber-500/30",
      bg: "from-amber-50 to-amber-100/50 border-amber-200/60",
      icon: "⏳",
    },
    {
      label: "Confirmed",
      status: "CONFIRMED",
      count: confirmedCount,
      color: "text-blue-600",
      glow: "shadow-blue-500/30",
      bg: "from-blue-50 to-blue-100/50 border-blue-200/60",
      icon: "✅",
    },
    {
      label: "Processing",
      status: "PROCESSING",
      count: processingCount,
      color: "text-indigo-600",
      glow: "shadow-indigo-500/30",
      bg: "from-indigo-50 to-indigo-100/50 border-indigo-200/60",
      icon: "⚙️",
    },
    {
      label: "Shipped",
      status: "SHIPPED",
      count: shippedCount,
      color: "text-purple-600",
      glow: "shadow-purple-500/30",
      bg: "from-purple-50 to-purple-100/50 border-purple-200/60",
      icon: "🚚",
    },
    {
      label: "Delivered",
      status: "DELIVERED",
      count: deliveredCount,
      color: "text-emerald-600",
      glow: "shadow-emerald-500/30",
      bg: "from-emerald-50 to-emerald-100/50 border-emerald-200/60",
      icon: "🎉",
    },
  ];

  const total = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-xl shadow-sm p-5 overflow-hidden">
      <div className="mb-4">
        <h2 className="text-sm font-black text-gray-900">Order Flow Pipeline</h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{total} total orders in system</p>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {stages.map((stage, i) => (
          <div key={stage.status} className="flex items-center shrink-0">
            {/* Stage Node */}
            <motion.div
              className={`relative flex flex-col items-center justify-center rounded-xl border bg-gradient-to-b ${stage.bg} px-4 py-3 shadow-md ${stage.glow} min-w-[100px]`}
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              {/* Pulse dot for non-zero stages */}
              {stage.count > 0 && (
                <motion.div
                  className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-current opacity-80"
                  style={{ color: stage.color.replace("text-", "") }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.4, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <span className="text-lg mb-1">{stage.icon}</span>

              {/* Animated count */}
              <motion.p
                className={`text-2xl font-black ${stage.color} font-mono`}
                key={stage.count}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {stage.count}
              </motion.p>
              <p className="text-[10px] font-bold text-gray-500 mt-0.5">{stage.label}</p>

              {/* Percentage bar */}
              {total > 0 && (
                <div className="mt-2 w-full h-1 rounded-full bg-gray-200/60 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${stage.color.replace("text-", "bg-")}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / total) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                  />
                </div>
              )}
            </motion.div>

            {/* Animated connector between stages */}
            {i < stages.length - 1 && (
              <div className="relative flex items-center mx-1">
                {/* Static track */}
                <div className="w-8 h-1 bg-gray-200 rounded-full relative overflow-hidden">
                  {/* Flowing gradient */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-400"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                  />
                </div>
                {/* Traveling particle dot */}
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                  style={{ left: 0, top: "50%", translateY: "-50%" }}
                  animate={{ x: [0, 32] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
