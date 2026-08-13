"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  Package,
  CheckCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

// ═══════════════════════════════════════════
// Animation Variants
// ═══════════════════════════════════════════
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ═══════════════════════════════════════════
// AnimatedNumber
// ═══════════════════════════════════════════
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    if (start === end) {
      // Defer state update out of current render cycle
      const timeout = setTimeout(() => setDisplayValue(end), 0);
      return () => clearTimeout(timeout);
    }

    const totalDuration = 1500;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / totalDuration, 1);

      const easeOutExpo = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

      setDisplayValue(Math.floor(end * easeOutExpo));

      if (progress < totalDuration) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <>
      {prefix}
      {displayValue.toLocaleString("en-BD")}
      {suffix}
    </>
  );
}

// ═══════════════════════════════════════════
// 3D Tilt Wrapper
// ═══════════════════════════════════════════
export function TiltWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// StatCard
// ═══════════════════════════════════════════
export function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  color,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  color: "blue" | "emerald" | "amber" | "rose";
  href?: string;
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50/50",
      text: "text-blue-600",
      icon: "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/20",
    },
    emerald: {
      bg: "bg-emerald-50/50",
      text: "text-emerald-600",
      icon: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-50/50",
      text: "text-amber-600",
      icon: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20",
    },
    rose: {
      bg: "bg-rose-50/50",
      text: "text-rose-600",
      icon: "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-500/20",
    },
  };

  const trendColors = {
    up: "text-emerald-500 bg-emerald-50 border-emerald-100",
    down: "text-rose-500 bg-rose-50 border-rose-100",
    neutral: "text-gray-500 bg-gray-50 border-gray-100",
  };

  const content = (
    <TiltWrapper>
      <div className="group relative h-full overflow-hidden rounded-2xl border border-gray-200/60 bg-white/40 p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] backdrop-blur-xl transition-all hover:border-gray-300/80 hover:shadow-lg hover:shadow-blue-500/5 sm:p-5">
        <div
          className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${colorMap[color].bg}`}
        />
        <div className="relative flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg sm:h-12 sm:w-12 ${colorMap[color].icon}`}
          >
            {icon}
          </div>
          <div
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${trendColors[trend]}`}
          >
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            <span className="hidden sm:inline">{trendValue}</span>
          </div>
        </div>
        <div className="relative mt-4">
          <p className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{value}</p>
          <p className="mt-1 text-xs font-semibold text-gray-500 sm:text-sm">{title}</p>
        </div>
      </div>
    </TiltWrapper>
  );

  return (
    <motion.div variants={itemVariants} className="h-full" style={{ perspective: "1000px" }}>
      {href ? (
        <Link href={href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// QuickStatCard
// ═══════════════════════════════════════════
export function QuickStatCard({
  label,
  value,
  icon,
  href,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
  color: "amber" | "indigo" | "teal" | "blue" | "emerald" | "rose";
}) {
  const colorStyles = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <Link href={href} className="block w-full">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorStyles[color]}`}
          >
            {icon}
          </div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════
// VisitorStatCard (Dark Neon Mode)
// ═══════════════════════════════════════════
export function VisitorStatCard({
  label,
  visitors,
  views,
  prevVisitors,
}: {
  label: string;
  visitors: number;
  views: number;
  prevVisitors?: number;
}) {
  let trend: "up" | "down" | "neutral" = "neutral";
  let trendPercent = 0;

  if (prevVisitors !== undefined && prevVisitors > 0) {
    const change = ((visitors - prevVisitors) / prevVisitors) * 100;
    trendPercent = Math.abs(Math.round(change));
    trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
  }

  return (
    <motion.div variants={itemVariants} style={{ perspective: "1000px" }}>
      <TiltWrapper>
        <div className="group relative rounded-xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl transition-all hover:border-white/20 hover:bg-white/10">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-2xl font-black tracking-tight text-white mt-1">
            <AnimatedNumber value={visitors} />
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] font-medium text-gray-500">
              <AnimatedNumber value={views} /> views
            </p>
            {prevVisitors !== undefined && trend !== "neutral" && (
              <span
                className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend === "up" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trendPercent}%
              </span>
            )}
          </div>
        </div>
      </TiltWrapper>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// AdvancedMetricCard (Dark Mode)
// ═══════════════════════════════════════════
export function AdvancedMetricCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <motion.div variants={itemVariants} style={{ perspective: "1000px" }} className="h-full">
      <TiltWrapper className="h-full">
        <div className="group relative h-full rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl transition-all hover:border-white/20 hover:bg-white/10 overflow-hidden">
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
          />
          <div className="relative flex flex-col h-full justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  {title}
                </p>
                <p className="text-3xl font-black tracking-tighter text-white">
                  {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
                </p>
              </div>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                {icon}
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-400 mt-4 border-t border-white/10 pt-3">
              {subtitle}
            </p>
          </div>
        </div>
      </TiltWrapper>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Top Selling Products Widget
// ═══════════════════════════════════════════
export function TopProductsList({
  products,
}: {
  products: Array<{
    id: string;
    name: string;
    category: string;
    sku: string;
    sold: number;
    revenue: number;
    image: string | null;
  }>;
}) {
  if (!products || products.length === 0)
    return <p className="text-sm text-gray-500 p-4">No sales data yet.</p>;

  return (
    <div className="space-y-3">
      {products.map((p) => (
        <motion.div
          variants={itemVariants}
          key={p.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors shadow-sm"
        >
          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <Package className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
            <p className="text-xs text-gray-500 truncate">{p.category}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-900">৳{p.revenue.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
              {p.sold} Sold
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Activity Feed Widget
// ═══════════════════════════════════════════
export function ActivityFeed({
  activities,
}: {
  activities: Array<{ id: string; title: string; message: string; type: string; createdAt: Date }>;
}) {
  if (!activities || activities.length === 0)
    return <p className="text-sm text-gray-500 p-4">No recent activity.</p>;

  return (
    <div className="space-y-4 pr-2">
      {activities.map((a, i) => {
        const isOrder = a.type === "NEW_ORDER";
        const isStock = a.type === "LOW_STOCK";

        return (
          <motion.div variants={itemVariants} key={a.id} className="flex gap-3 relative">
            {i !== activities.length - 1 && (
              <div className="absolute top-8 bottom-[-16px] left-[15px] w-px bg-gray-100" />
            )}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                isOrder
                  ? "bg-blue-100 text-blue-600"
                  : isStock
                    ? "bg-rose-100 text-rose-600"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {isOrder ? (
                <CheckCircle className="h-4 w-4" />
              ) : isStock ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            <div className="pt-1 flex-1">
              <p className="text-sm font-semibold text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.message}</p>
              <p className="text-[10px] font-medium text-gray-400 mt-1">
                {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════
// Device Breakdown Chart (Donut) (Dark Mode)
// ═══════════════════════════════════════════

interface DeviceTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

const DeviceTooltip = ({ active, payload }: DeviceTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-gray-900/90 backdrop-blur-md px-3 py-2 text-xs font-semibold text-white shadow-xl z-50">
        <span className="capitalize">{payload[0]?.name}</span>: {payload[0]?.value}%
      </div>
    );
  }
  return null;
};

export function DeviceBreakdownChart({
  devices,
}: {
  devices: { device: string; percentage: number }[];
}) {
  if (!devices || devices.length === 0) return <p className="text-xs text-gray-500">No data yet</p>;

  const COLORS = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24"];

  return (
    <motion.div variants={itemVariants} className="flex h-full items-center gap-4">
      <div className="h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={devices}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={60}
              paddingAngle={5}
              dataKey="percentage"
              nameKey="device"
              stroke="none"
              animationBegin={200}
              animationDuration={1500}
            >
              {devices.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={<DeviceTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-3">
        {devices.map((d, i) => {
          const DeviceIcon =
            d.device === "mobile" ? Smartphone : d.device === "tablet" ? Tablet : Monitor;
          return (
            <div key={d.device} className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-md"
                style={{
                  backgroundColor: `${COLORS[i % COLORS.length]}20`,
                  color: COLORS[i % COLORS.length],
                }}
              >
                <DeviceIcon className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium text-gray-300 capitalize flex-1">
                {d.device}
              </span>
              <span className="text-xs font-bold text-white">
                <AnimatedNumber value={d.percentage} />%
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Top Pages Progress Bars (Dark Mode)
// ═══════════════════════════════════════════
export function TopPagesList({ topPages }: { topPages: { path: string; views: number }[] }) {
  if (!topPages || topPages.length === 0) return null;
  const maxViews = Math.max(...topPages.map((p) => p.views));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 mt-2"
    >
      {topPages.map((page, i) => {
        const percentage = Math.max((page.views / maxViews) * 100, 2);
        return (
          <motion.div variants={itemVariants} key={page.path} className="group relative">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-gray-500 w-4">{i + 1}.</span>
                <span className="font-medium text-gray-300 truncate">{page.path}</span>
              </div>
              <span className="font-bold text-white shrink-0">
                <AnimatedNumber value={page.views} />
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Wrapper for generic staggered grids
// ═══════════════════════════════════════════
export function StaggeredGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}
