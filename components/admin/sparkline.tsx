"use client";

/**
 * Euphoria — Stock Sparkline
 * Animated SVG sparkline showing stock trend. Path draws itself in.
 * Red danger zone pulses when stock < 5.
 */

import { motion } from "framer-motion";
import { useState } from "react";

interface SparklineProps {
  data: number[]; // stock values over time (oldest → newest)
  currentStock: number;
  width?: number;
  height?: number;
}

function buildPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${points.join(" L ")}`;
}

export function Sparkline({ data, currentStock, width = 80, height = 32 }: SparklineProps) {
  const [hovered, setHovered] = useState(false);

  if (!data || data.length < 2) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const isLow = currentStock < 5;
  const lastVal = data[data.length - 1]!;
  const firstVal = data[0]!;
  const isTrendingDown = lastVal < firstVal;

  const strokeColor = isLow ? "#f43f5e" : isTrendingDown ? "#f59e0b" : "#10b981";
  const path = buildPath(data, width, height);
  const lastX = width - 4;
  const lastY =
    height -
    4 -
    ((lastVal - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - 8);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg width={width} height={height} className="overflow-visible">
        {/* Danger zone fill */}
        {isLow && (
          <motion.rect
            x={0}
            y={height - 8}
            width={width}
            height={8}
            rx={2}
            fill="rgba(244,63,94,0.12)"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* Area fill under line */}
        <defs>
          <linearGradient id={`grad-${currentStock}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
          <clipPath id={`clip-${currentStock}`}>
            <motion.rect
              x={0}
              y={0}
              height={height}
              initial={{ width: 0 }}
              animate={{ width }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </clipPath>
        </defs>

        {/* Animated sparkline path */}
        <motion.path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Last data point dot */}
        <motion.circle
          cx={lastX}
          cy={lastY}
          r={2.5}
          fill={strokeColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 400 }}
        />

        {/* Pulsing ring on last dot when low */}
        {isLow && (
          <motion.circle
            cx={lastX}
            cy={lastY}
            r={2.5}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            animate={{ r: [2.5, 6], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <motion.div
          className="absolute left-full ml-2 z-50 rounded-lg border border-gray-200 bg-white shadow-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
        >
          <p className="font-bold text-gray-900">Stock: {currentStock}</p>
          <p className="font-medium mt-0.5" style={{ color: strokeColor }}>
            {isLow ? "⚠ Low stock!" : isTrendingDown ? "↘ Trending down" : "↗ Healthy"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
