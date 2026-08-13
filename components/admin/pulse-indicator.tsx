"use client";

/**
 * Euphoria — Live Pulse Indicator
 * Animated concentric ripple rings for nav items with pending actions.
 * Color-coded: red=urgent, amber=warning, blue=info, green=healthy.
 */

import { motion } from "framer-motion";

type Severity = "urgent" | "warning" | "info" | "healthy";

interface PulseIndicatorProps {
  count: number;
  severity?: Severity;
  size?: "sm" | "md";
}

const severityConfig: Record<Severity, { dot: string; ring: string; badge: string; text: string }> =
  {
    urgent: {
      dot: "bg-rose-500",
      ring: "border-rose-400/40",
      badge: "bg-rose-500 text-white",
      text: "text-rose-500",
    },
    warning: {
      dot: "bg-amber-500",
      ring: "border-amber-400/40",
      badge: "bg-amber-500 text-white",
      text: "text-amber-500",
    },
    info: {
      dot: "bg-blue-500",
      ring: "border-blue-400/40",
      badge: "bg-blue-500 text-white",
      text: "text-blue-500",
    },
    healthy: {
      dot: "bg-emerald-500",
      ring: "border-emerald-400/40",
      badge: "bg-emerald-500 text-white",
      text: "text-emerald-500",
    },
  };

export function PulseIndicator({ count, severity = "info", size = "sm" }: PulseIndicatorProps) {
  if (count <= 0) return null;

  const config = severityConfig[severity];
  const isSmall = size === "sm";

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Concentric ripple rings (3 rings, staggered) */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full border ${config.ring}`}
          style={{
            width: isSmall ? 20 : 28,
            height: isSmall ? 20 : 28,
          }}
          animate={{
            scale: [1, 1.8 + i * 0.3],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.8,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Badge counter with spring bounce */}
      <motion.span
        className={`relative z-10 flex items-center justify-center rounded-full font-bold shadow-sm ${config.badge} ${
          isSmall
            ? "min-w-[18px] h-[18px] text-[9px] px-1"
            : "min-w-[22px] h-[22px] text-[10px] px-1.5"
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        key={count} // Re-triggers animation on count change
      >
        {count > 99 ? "99+" : count}
      </motion.span>
    </span>
  );
}

/** Minimal dot-only pulse (no count badge) */
export function PulseDot({ severity = "info", size = 6 }: { severity?: Severity; size?: number }) {
  const config = severityConfig[severity];

  return (
    <span className="relative inline-flex">
      <motion.span
        className={`absolute inset-0 rounded-full ${config.dot}`}
        animate={{
          scale: [1, 2.5],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{ width: size, height: size }}
      />
      <span
        className={`relative rounded-full ${config.dot} shadow-sm`}
        style={{ width: size, height: size }}
      />
    </span>
  );
}
