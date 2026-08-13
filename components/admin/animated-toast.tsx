"use client";

/**
 * Euphoria — Animated Toast System
 * Premium notification toasts: elastic bounce-in, progress bar countdown,
 * type-specific icon animations, spring-stacked queue.
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { useToastStore, type Toast, type ToastType } from "@/store/toast-store";

const toastConfig: Record<
  ToastType,
  {
    icon: React.ReactNode;
    bar: string;
    border: string;
    bg: string;
    iconBg: string;
    iconMotion: object;
  }
> = {
  order: {
    icon: <ShoppingCart className="h-4 w-4 text-blue-600" />,
    bar: "bg-blue-500",
    border: "border-blue-100",
    bg: "bg-blue-50/90",
    iconBg: "bg-blue-100",
    iconMotion: {
      animate: { y: [0, -4, 0], scale: [1, 1.15, 1] },
      transition: { duration: 0.5, repeat: 2 },
    },
  },
  alert: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    bar: "bg-amber-500",
    border: "border-amber-100",
    bg: "bg-amber-50/90",
    iconBg: "bg-amber-100",
    iconMotion: {
      animate: { rotate: [-5, 5, -5, 5, 0] },
      transition: { duration: 0.5, repeat: 1 },
    },
  },
  success: {
    icon: <CheckCircle className="h-4 w-4 text-emerald-600" />,
    bar: "bg-emerald-500",
    border: "border-emerald-100",
    bg: "bg-emerald-50/90",
    iconBg: "bg-emerald-100",
    iconMotion: {
      animate: { scale: [0.8, 1.2, 1] },
      transition: { type: "spring", stiffness: 400 },
    },
  },
  error: {
    icon: <XCircle className="h-4 w-4 text-rose-600" />,
    bar: "bg-rose-500",
    border: "border-rose-100",
    bg: "bg-rose-50/90",
    iconBg: "bg-rose-100",
    iconMotion: {
      animate: { x: [-3, 3, -3, 3, 0] },
      transition: { duration: 0.4 },
    },
  },
  info: {
    icon: <Info className="h-4 w-4 text-gray-600" />,
    bar: "bg-gray-500",
    border: "border-gray-100",
    bg: "bg-white/90",
    iconBg: "bg-gray-100",
    iconMotion: {
      animate: { rotate: [0, 360] },
      transition: { duration: 0.6 },
    },
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    bar: "bg-amber-500",
    border: "border-amber-100",
    bg: "bg-amber-50/90",
    iconBg: "bg-amber-100",
    iconMotion: {
      animate: { rotate: [-5, 5, -5, 5, 0] },
      transition: { duration: 0.5, repeat: 1 },
    },
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const config = toastConfig[toast.type];

  return (
    <motion.div
      layout
      key={toast.id}
      initial={{ x: 320, opacity: 0, scale: 0.88 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 320, opacity: 0, scale: 0.88, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`relative flex w-80 items-start gap-3 overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-4 shadow-2xl backdrop-blur-xl`}
    >
      {/* Animated progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[3px] ${config.bar} rounded-b-2xl`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
      />

      {/* Icon with type-specific animation */}
      <motion.div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}
        {...config.iconMotion}
      >
        {config.icon}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-bold text-gray-900 truncate">{toast.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>

      {/* Close */}
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mt-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function AnimatedToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Hook to conveniently add toasts anywhere in admin */
export function useAdminToast() {
  const { addToast } = useToastStore();
  return {
    orderToast: (title: string, message: string) => addToast({ type: "order", title, message }),
    alertToast: (title: string, message: string) => addToast({ type: "alert", title, message, duration: 8000 }),
    successToast: (title: string, message: string) => addToast({ type: "success", title, message }),
    errorToast: (title: string, message: string) => addToast({ type: "error", title, message, duration: 8000 }),
    infoToast: (title: string, message: string) => addToast({ type: "info", title, message }),
  };
}
