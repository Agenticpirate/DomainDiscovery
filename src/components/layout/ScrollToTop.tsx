'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Always land at the top when changing routes (unless the URL has a #hash).
 * Fixes "open Chat and end up in the footer" and the same issue on other pages.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prefer manual control — browser restore often leaves you mid-page
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {
      /* ignore */
    }

    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      // Deep link: let the target section handle scroll (after paint)
      const id = decodeURIComponent(hash.slice(1));
      const t = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      }, 50);
      return () => window.clearTimeout(t);
    }

    // Instant top — no smooth animation (avoids fighting page transition)
    // Multiple ticks: Next paint + client page effects (e.g. chat) can re-shift scroll
    const jump = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    jump();
    const id = window.requestAnimationFrame(jump);
    const t = window.setTimeout(jump, 0);
    const t2 = window.setTimeout(jump, 120);
    const t3 = window.setTimeout(jump, 280);
    return () => {
      window.cancelAnimationFrame(id);
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname]);

  return null;
}
