"use client";

/**
 * Euphoria — Trust Badges
 * Euphoria | Authentic Pakistani Luxury Suits
 */

import { useEffect, useRef, useState } from "react";
import { Truck, ShieldCheck, CreditCard, Star, Award, Users } from "lucide-react";

const badges = [
  {
    icon: Award,
    title: "100% অরিজিনাল",
    description: "Authentic Luxury Jewellery",
  },
  {
    icon: CreditCard,
    title: "Cash on Delivery",
    description: "পাওয়ার পর টাকা দিন",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Dhaka ৳80 | Outside Dhaka ৳150",
  },
  {
    icon: ShieldCheck,
    title: "সহজ রিটার্ন",
    description: "3 Days Guarantee",
  },
  {
    icon: Star,
    title: "98% Recommend",
    description: "Verified Customer Ratings",
  },
  {
    icon: Users,
    title: "32K+ ফলোয়ার",
    description: "Trusted by thousands in BD",
  },
];

export function TrustBadges() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#fcfaf6] border-y border-[#0a0a0a]/15 py-14 md:py-18 relative">
      {/* Gold divider line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
          {badges.map((badge, i) => (
            <div
              key={badge.title}
              className={`group flex flex-col items-center text-center gap-3 p-5 md:p-6 rounded-sm bg-white border border-[#e8e0d0] shadow-sm transition-all duration-500 hover:shadow-md hover:border-[#d4af37]/50 hover:-translate-y-1 ${
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-6 scale-[0.98]"
              }`}
              style={{
                transitionDelay: isVisible ? `${i * 80}ms` : "0ms",
              }}
            >
              <div className="flex items-center justify-center size-12 md:size-13 rounded-full bg-[#fcf5f7] text-[#0a0a0a] transition-all duration-500 group-hover:bg-[#0a0a0a] group-hover:text-white shadow-sm">
                <badge.icon className="h-5.5 w-5.5 stroke-[1.4]" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a] font-sans">
                  {badge.title}
                </p>
                <p className="text-[10px] md:text-[11px] text-neutral-500 leading-relaxed font-sans font-medium">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
