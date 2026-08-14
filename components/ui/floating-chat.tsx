"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X } from "lucide-react";

export function FloatingChat({ 
  phoneNumber = "+8801741875914",
  messengerUrl = "https://m.me/Euphoria2222"
}: { 
  phoneNumber?: string;
  messengerUrl?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const waHref = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}`;
  const phoneHref = `tel:${phoneNumber.replace(/[^0-9+]/g, "")}`;

  // Animation variants for the child buttons
  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 15, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-28 md:bottom-12 right-6 md:right-10 z-[100] flex flex-col items-center gap-3"
        >
          {/* Expanded Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  visible: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
                  exit: { transition: { staggerChildren: 0.05, staggerDirection: 1 } }
                }}
                className="flex flex-col gap-3 items-center mb-2"
              >
                {/* Messenger */}
                <motion.a
                  variants={itemVariants}
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0a0a0a] text-white shadow-lg hover:scale-110 hover:shadow-[#d4af37]/30 transition-all duration-300 border border-[#d4af37]/20"
                  aria-label="Contact on Messenger"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.822 1.442 5.347 3.738 7.026v3.294a.45.45 0 00.672.394l3.193-1.758a10.428 10.428 0 002.397.284c5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.093 12.381l-2.617-2.793-5.112 2.793 5.617-5.966 2.643 2.793 5.086-2.793-5.617 5.966z" />
                  </svg>
                  <span className="absolute right-14 whitespace-nowrap bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-border/40 text-[10px] font-semibold text-foreground pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Messenger
                  </span>
                </motion.a>

                {/* Phone */}
                <motion.a
                  variants={itemVariants}
                  href={phoneHref}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0a0a0a] text-white shadow-lg hover:scale-110 hover:shadow-[#d4af37]/30 transition-all duration-300 border border-[#d4af37]/20"
                  aria-label="Call Us"
                >
                  <Phone className="h-5 w-5 fill-current" />
                  <span className="absolute right-14 whitespace-nowrap bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-border/40 text-[10px] font-semibold text-foreground pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Call Us
                  </span>
                </motion.a>

                {/* WhatsApp */}
                <motion.a
                  variants={itemVariants}
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0a0a0a] text-[#d4af37] shadow-lg hover:scale-110 hover:shadow-[#d4af37]/30 transition-all duration-300 border border-[#d4af37]/20"
                  aria-label="Contact on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="absolute right-14 whitespace-nowrap bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-border/40 text-[10px] font-semibold text-foreground pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    WhatsApp
                  </span>
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative flex h-[56px] w-[56px] items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.25)] border-[1.5px] border-accent/20 z-[100] transition-all duration-400 ease-out ${
              isOpen 
                ? "bg-primary text-accent rotate-180" 
                : "bg-primary text-accent hover:scale-105 hover:bg-primary/95 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(201,169,110,0.25)]"
            }`}
            aria-label="Toggle contact menu"
          >
            {/* Very subtle background pulse behind the button to draw attention without being messy */}
            {!isOpen && (
              <div className="absolute inset-0 rounded-full bg-accent opacity-15 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
            )}
            
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-7 w-7" strokeWidth={2.5} />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Custom Solid Chat Bubble with Dots matching the screenshot perfectly */}
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.48 5.43 3.79 7.08-.34 1.76-1.57 3.39-1.66 3.52-.1.14-.14.33-.06.49.07.16.24.26.41.26 2.45 0 4.31-1.01 5.39-1.8 1.48.45 3.09.7 4.73.7 5.52 0 10-4.03 10-9S17.52 2 12 2zm-4 10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
