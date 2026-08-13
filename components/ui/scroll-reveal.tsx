"use client";

/**
 * Euphoria — Scroll Reveal Animation Trigger
 * Robust client component that registers an IntersectionObserver & MutationObserver
 * to ensure all elements with 'reveal' class smoothly reveal on load and scroll.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px 150px 0px", // Generous margin so elements reveal smoothly
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll(".reveal:not(.visible)");
      elements.forEach((el) => {
        // If element is already above bottom of viewport, show immediately
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight + 150) {
          el.classList.add("visible");
        } else {
          observer.observe(el);
        }
      });
    };

    let rafId: number | null = null;
    const debouncedObserve = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        observeElements();
      });
    };

    // Run immediately and after short timeouts for App Router navigation transitions
    observeElements();
    const timer1 = setTimeout(observeElements, 50);
    const timer2 = setTimeout(observeElements, 200);

    // Watch for dynamically rendered elements with debounced rAF
    const mutationObserver = new MutationObserver(() => {
      debouncedObserve();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
