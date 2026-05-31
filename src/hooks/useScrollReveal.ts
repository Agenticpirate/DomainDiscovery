'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  /** Fraction of the element visible before triggering (0-1) */
  threshold?: number;
  /** Root margin to trigger slightly before fully in view */
  rootMargin?: string;
  /** Only reveal once (default true) */
  once?: boolean;
}

/**
 * useScrollReveal
 * Returns a ref and a boolean that flips to true once the element scrolls
 * into view. Used to orchestrate premium entrance animations per section.
 * Respects prefers-reduced-motion by revealing immediately.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced motion / no IntersectionObserver — show immediately.
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
