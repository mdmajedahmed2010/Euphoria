"use client";

/**
 * Euphoria — Revenue Ticker (Casino-Style Animated Counter)
 * Premium slot-machine style digits that roll up on page load.
 * SOP-compliant: TypeScript strict, Framer Motion, no new deps.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { DollarSign } from "lucide-react";

interface RevenueTickerProps {
  value: number;
  label?: string;
  prefix?: string;
}

// Individual animated digit that rolls like a slot machine
function SlotDigit({ digit, index }: { digit: string; index: number }) {
  const isNumber = !isNaN(Number(digit));

  if (!isNumber) {
    // Static separator (comma, period)
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
        className="text-gray-400 font-light"
      >
        {digit}
      </motion.span>
    );
  }

  return (
    <span className="relative inline-block w-[0.6em] h-[1.2em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`${index}-${digit}`}
          initial={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: index * 0.05,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Pulsing glow ring that animates when value changes
function PulseRing({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.15 + i * 0.08, opacity: 0 }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            repeat: 2,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

// Sparkle particle that bursts on milestone
function SparkleParticle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-amber-400"
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: x,
        y: y,
        opacity: 0,
        scale: 0,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: "easeOut",
      }}
      style={{ left: "50%", top: "50%" }}
    />
  );
}

export function RevenueTicker({
  value,
  label = "Today's Revenue",
  prefix = "৳",
}: RevenueTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [showPulse, setShowPulse] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>(
    []
  );
  const prevValue = useRef(0);
  const sparkleId = useRef(0);

  // Animate to target value with easing
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 20 });

  const triggerSparkles = useCallback(() => {
    const newSparkles = Array.from({ length: 8 }, () => ({
      id: sparkleId.current++,
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 60,
      delay: Math.random() * 0.3,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1200);
  }, []);

  useEffect(() => {
    motionVal.set(value);

    const unsubscribe = springVal.on("change", (v) => {
      setDisplayValue(Math.round(v));
    });

    // Trigger pulse on value increase
    if (value > prevValue.current && prevValue.current > 0) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);

      // Sparkle on milestones
      if (Math.floor(value / 10000) > Math.floor(prevValue.current / 10000)) {
        triggerSparkles();
      }
    }

    prevValue.current = value;
    return () => unsubscribe();
  }, [value, motionVal, springVal, triggerSparkles]);

  const formattedValue = displayValue.toLocaleString("en-BD");
  const digits = formattedValue.split("");

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 via-white/60 to-teal-50/40 p-5 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ perspective: "800px" }}
    >
      {/* Ambient glow */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/15 blur-3xl transition-all duration-700 group-hover:bg-emerald-400/30" />
      <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-teal-400/10 blur-2xl" />

      {/* Pulse rings */}
      <PulseRing active={showPulse} />

      {/* Sparkle particles */}
      <AnimatePresence>
        {sparkles.map((s) => (
          <SparkleParticle key={s.id} x={s.x} y={s.y} delay={s.delay} />
        ))}
      </AnimatePresence>

      <div className="relative">
        {/* Icon + Label */}
        <div className="flex items-start justify-between">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <DollarSign className="h-5 w-5" />
          </motion.div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <motion.div
              className="h-2 w-2 rounded-full bg-emerald-500"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Live
            </span>
          </div>
        </div>

        {/* Value Display — Slot Machine */}
        <div className="mt-4">
          <motion.div
            className="flex items-baseline gap-0.5 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Currency prefix */}
            <motion.span
              className="text-emerald-500 text-2xl mr-0.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
            >
              {prefix}
            </motion.span>

            {/* Animated digits */}
            {digits.map((d, i) => (
              <SlotDigit key={`${i}-pos`} digit={d} index={i} />
            ))}
          </motion.div>

          <p className="mt-1.5 text-xs font-semibold text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
