/**
 * Euphoria — Newsletter Section (Premium v2.0)
 * Dark background, elegant, minimal
 * Design Guide: Integrated before footer, dark bg
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/newsletter.actions";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await subscribeNewsletter(email.trim());
      if (result.success) {
        toast.success(result.message || "Subscribed!", {
          description: "You'll receive updates on new arrivals and offers.",
        });
        setEmail("");
      } else {
        toast.error(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#1a1a1a] py-16 md:py-20">
      <div className="container mx-auto px-6 md:px-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37] font-medium mb-3">
          Stay Updated
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.02em] mb-3">
          Join the Euphoria Family
        </h2>
        <p className="text-sm text-white/50 max-w-sm mx-auto mb-8">
          Subscribe for exclusive offers, new arrivals, and style inspiration.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 h-12 px-4 bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 bg-white text-[#1a1a1a] text-sm font-medium tracking-wide hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "..." : "Subscribe"}
          </button>
        </form>

        <p className="text-[11px] text-white/30 mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
