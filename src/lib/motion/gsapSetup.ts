/**
 * GSAP setup for Next.js (client-only).
 * Core + ScrollTrigger — free, production-safe defaults for mobile.
 */
'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

export function ensureGsap(): typeof gsap {
  if (typeof window === 'undefined') return gsap;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({
      force3D: true,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    // Respect reduced motion globally — effectively skip animated timelines
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.globalTimeline.timeScale(100);
      ScrollTrigger.config({ limitCallbacks: true });
    }
    // Fewer layout thrash events on mobile scroll
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    registered = true;
  }
  return gsap;
}

export { gsap, ScrollTrigger };
