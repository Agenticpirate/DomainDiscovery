'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Smooth crossfade + slight rise when switching ADA menu routes.
 * Scroll-to-top is handled globally by <ScrollToTop />.
 */
export function AdaPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/ada';
  const reduce = useReducedMotion();

  const transitionKey = pathname.replace(/\/$/, '') || '/ada';

  if (reduce) {
    return (
      <div className="flex-1 w-full min-h-full" id="ada-page-top">
        {children}
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full min-h-full" id="ada-page-top">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{
            duration: 0.26,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full min-h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
