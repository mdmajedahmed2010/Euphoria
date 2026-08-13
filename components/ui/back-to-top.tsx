"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate scroll progress
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      
      setScrollProgress(Number(scroll));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-12 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-border/30 text-foreground hover:bg-neutral-50 transition-colors group cursor-pointer"
          aria-label="Back to top"
        >
          {/* SVG Progress Ring */}
          <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none">
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border/40"
            />
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
              strokeDasharray={125.6} // 2 * PI * 20
              strokeDashoffset={125.6 - 125.6 * scrollProgress}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-150"
            />
          </svg>
          <ChevronUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
