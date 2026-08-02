'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { APPLE_EASE, PAGE_ENTER } from '@/lib/motion/premium';

type PageTransitionProps = {
  children: React.ReactNode;
};

/**
 * Premium route enter — soft fade + rise on every navigation.
 * Used from app/template.tsx so each page remount animates cleanly.
 * Nav/footer inside pages ride along so remounts feel intentional, not glitchy.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      className="min-h-screen w-full gpu-layer"
      initial={PAGE_ENTER.initial}
      animate={PAGE_ENTER.animate}
      transition={{
        duration: PAGE_ENTER.duration,
        ease: APPLE_EASE,
      }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}
