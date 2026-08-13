"use client";

/**
 * Euphoria — Revenue Heatmap
 * 7×24 animated grid showing revenue intensity by day and hour.
 * Cells cascade in with stagger; hover shows exact revenue tooltip.
 */

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HeatmapCell } from "@/actions/heatmap.actions";

const HOUR_LABELS = [
  "12a",
  "1a",
  "2a",
  "3a",
  "4a",
  "5a",
  "6a",
  "7a",
  "8a",
  "9a",
  "10a",
  "11a",
  "12p",
  "1p",
  "2p",
  "3p",
  "4p",
  "5p",
  "6p",
  "7p",
  "8p",
  "9p",
  "10p",
  "11p",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getColor(revenue: number, maxRevenue: number): string {
  if (maxRevenue === 0 || revenue === 0) return "hsla(220,13%,91%,1)";
  const ratio = revenue / maxRevenue;
  if (ratio < 0.15) return "hsla(210,80%,94%,1)";
  if (ratio < 0.35) return "hsla(210,80%,80%,1)";
  if (ratio < 0.55) return "hsla(220,75%,65%,1)";
  if (ratio < 0.75) return "hsla(250,70%,55%,1)";
  return "hsla(280,65%,45%,1)";
}

interface TooltipState {
  cell: HeatmapCell;
  x: number;
  y: number;
}

interface RevenueHeatmapProps {
  data: HeatmapCell[];
}

export function RevenueHeatmap({ data }: RevenueHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxRevenue = Math.max(...data.map((c) => c.revenue), 1);

  // Group by day (0-6), then hour (0-23)
  const grid: HeatmapCell[][] = Array.from({ length: 7 }, (_, day) =>
    data.filter((c) => c.day === day).sort((a, b) => a.hour - b.hour)
  );

  const handleMouseEnter = (cell: HeatmapCell, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      cell,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-xl shadow-sm p-6 overflow-hidden">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-gray-900">Revenue Heatmap</h2>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            Revenue intensity by day & hour — last 7 days
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-medium">Low</span>
          {[
            "hsla(210,80%,94%,1)",
            "hsla(210,80%,80%,1)",
            "hsla(220,75%,65%,1)",
            "hsla(250,70%,55%,1)",
            "hsla(280,65%,45%,1)",
          ].map((c, i) => (
            <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span className="text-[10px] text-gray-400 font-medium">High</span>
        </div>
      </div>

      <div ref={containerRef} className="relative overflow-x-auto">
        {/* Hour labels */}
        <div className="flex ml-10 mb-1">
          {HOUR_LABELS.map((h, i) => (
            <div
              key={i}
              className="text-[8px] text-gray-400 font-medium text-center flex-1 min-w-[18px]"
            >
              {i % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {grid.map((row, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-0.5 mb-0.5">
            {/* Day label */}
            <div className="w-9 text-[9px] font-bold text-gray-500 shrink-0 text-right pr-2">
              {DAY_LABELS[dayIdx]}
            </div>

            {/* Hour cells */}
            {row.map((cell, hourIdx) => {
              const color = getColor(cell.revenue, maxRevenue);
              const delay = (dayIdx * 24 + hourIdx) * 0.004;

              return (
                <motion.div
                  key={hourIdx}
                  className="flex-1 min-w-[18px] h-5 rounded-sm cursor-pointer"
                  style={{ backgroundColor: color }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay, ease: "easeOut" }}
                  whileHover={{ scale: 1.4, zIndex: 10 }}
                  onMouseEnter={(e) => handleMouseEnter(cell, e)}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              key="tooltip"
              className="absolute z-50 pointer-events-none rounded-xl border border-gray-200 bg-white shadow-2xl px-3 py-2.5 text-xs"
              style={{
                left: Math.min(tooltip.x + 12, 600),
                top: tooltip.y - 60,
              }}
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
            >
              <p className="font-bold text-gray-900">
                {DAY_LABELS[tooltip.cell.day]} at {HOUR_LABELS[tooltip.cell.hour]}
              </p>
              <p className="text-emerald-600 font-black mt-0.5">
                ৳{tooltip.cell.revenue.toLocaleString("en-BD")}
              </p>
              <p className="text-gray-400 font-medium">
                {tooltip.cell.orders} order{tooltip.cell.orders !== 1 ? "s" : ""}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
