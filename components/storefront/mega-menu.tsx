"use client";

/**
 * Euphoria — Mega Menu
 * Animated dropdown menu for storefront header.
 * Displays category links, styles, and a featured product image.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface MegaMenuData {
  categories: { label: string; href: string }[];
  styles: { label: string; href: string }[];
  featured: { title: string; subtitle: string; image: string; href: string };
}

interface MegaMenuProps {
  label: string;
  href: string;
  data: MegaMenuData;
}

export function MegaMenu({ label, href, data }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href={href}
        className="flex h-16 items-center gap-1 text-[13px] font-medium tracking-wide text-foreground/80 transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute left-0 top-full w-full bg-white border-b border-gray-100 shadow-xl overflow-hidden z-50"
          >
            {/* Elegant glass blur underlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl -z-10" />

            <div className="mx-auto flex max-w-7xl justify-between px-8 py-10">
              <div className="flex gap-16">
                {/* Categories Column */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
                    Collections
                  </h3>
                  <ul className="space-y-3">
                    {data.categories.map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Styles Column */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
                    Styles
                  </h3>
                  <ul className="space-y-3">
                    {data.styles.map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.15 }}
                      >
                        <Link
                          href={item.href}
                          className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Featured Product Column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="group relative w-80 overflow-hidden rounded-2xl bg-gray-100"
              >
                <Link href={data.featured.href} className="block h-full w-full">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={data.featured.image}
                      alt={data.featured.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
                      Featured
                    </p>
                    <h4 className="text-lg font-black text-white">{data.featured.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">{data.featured.subtitle}</p>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
