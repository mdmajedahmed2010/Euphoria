"use client";

/**
 * Euphoria — Sales Celebration System
 * Confetti burst + animated banner when a new order is detected via polling.
 * Uses existing canvas-confetti dependency. Polls /api/admin/latest-order every 30s.
 */

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShoppingCart, X } from "lucide-react";

interface CelebrationOrder {
  id: string;
  orderNumber: string;
  total: number;
}

let confettiLib: ((opts: object) => void) | null = null;

async function loadConfetti() {
  if (!confettiLib) {
    const mod = await import("canvas-confetti");
    confettiLib = mod.default;
  }
  return confettiLib;
}

function fireConfetti() {
  loadConfetti().then((confetti) => {
    // Gold + brand colors burst
    const colors = ["#f59e0b", "#10b981", "#3b82f6", "#a78bfa", "#f97316"];

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.3 },
      colors,
      scalar: 1.1,
      gravity: 0.9,
    });

    // Second burst slightly offset
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { x: 0.35, y: 0.35 },
        colors,
        scalar: 0.9,
        angle: 60,
      });
    }, 200);

    // Third burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { x: 0.65, y: 0.35 },
        colors,
        scalar: 0.9,
        angle: 120,
      });
    }, 350);
  });
}

function CelebrationBanner({ order, onClose }: { order: CelebrationOrder; onClose: () => void }) {
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    const target = order.total;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayTotal(target);
    };

    requestAnimationFrame(animate);
  }, [order.total]);

  // Auto-dismiss after 5s
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      className="fixed top-4 left-1/2 z-[9999] w-[90vw] max-w-sm"
      style={{ translateX: "-50%" }}
      initial={{ y: -120, opacity: 0, scale: 0.88 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -120, opacity: 0, scale: 0.88 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
    >
      {/* Screen flash overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.06, 0] }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 p-0.5 shadow-2xl shadow-emerald-500/30">
        <div className="rounded-[14px] bg-gray-950 p-4 flex items-center gap-3">
          {/* Bouncing cart icon */}
          <motion.div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400"
            animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            <ShoppingCart className="h-5 w-5" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              🎉 New Sale!
            </p>
            <p className="text-sm font-black text-white truncate mt-0.5">{order.orderNumber}</p>
            <p className="text-xl font-black text-emerald-400 font-mono">
              ৳{displayTotal.toLocaleString("en-BD")}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <motion.div
        className="mt-1 h-0.5 rounded-full bg-emerald-400/60 mx-1"
        initial={{ scaleX: 1, originX: 0 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.div>
  );
}

export function SalesCelebration() {
  const [celebrationOrder, setCelebrationOrder] = useState<CelebrationOrder | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);
  const initialized = useRef(false);

  const checkForNewOrder = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/latest-order", { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      if (!data.order) return;

      const order = data.order as { id: string; orderNumber: string; total: number };

      // First poll: initialize without celebrating
      if (!initialized.current) {
        lastOrderIdRef.current = order.id;
        initialized.current = true;
        return;
      }

      // New order detected
      if (order.id !== lastOrderIdRef.current) {
        lastOrderIdRef.current = order.id;
        setCelebrationOrder({ id: order.id, orderNumber: order.orderNumber, total: order.total });
        fireConfetti();
      }
    } catch {
      // Silently fail — non-critical feature
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      checkForNewOrder();
    }, 0);
    const interval = setInterval(checkForNewOrder, 30_000);
    return () => clearInterval(interval);
  }, [checkForNewOrder]);

  return (
    <AnimatePresence>
      {celebrationOrder && (
        <CelebrationBanner
          key={celebrationOrder.id}
          order={celebrationOrder}
          onClose={() => setCelebrationOrder(null)}
        />
      )}
    </AnimatePresence>
  );
}
