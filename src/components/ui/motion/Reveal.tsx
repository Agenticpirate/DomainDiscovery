'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { APPLE_EASE, SPRING_SOFT, VERCEL_EASE } from '@/lib/motion/premium';

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  y?: number;
  once?: boolean;
  /** Tighter mobile motion */
  compact?: boolean;
  /** Use spring physics (Apple product feel) */
  spring?: boolean;
};

/**
 * Viewport reveal — Vercel-clean fade + Apple-like spring option.
 * Skips when reduced-motion is on.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  once = true,
  compact = true,
  spring = true,
  className = '',
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  const dy = compact ? Math.min(y, 12) : y;

  if (reduce) {
    return <div className={className}>{children as React.ReactNode}</div>;
  }

  return (
    <motion.div
      className={`gpu-layer ${className}`}
      initial={{ opacity: 0, y: dy }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-8% 0px -6% 0px', amount: 0.12 }}
      transition={
        spring
          ? { ...SPRING_SOFT, delay }
          : { duration: 0.55, delay, ease: APPLE_EASE }
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
};

/** Stagger children — premium product grid entrance */
export function Stagger({ children, className = '', delay = 0, stagger = 0.055 }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-6% 0px' }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div
            className="gpu-layer"
            variants={{
              hidden: { opacity: 0, y: 14, scale: 0.985 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { ...SPRING_SOFT },
              },
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/** Instant mount fade (hero / critical above-fold) */
export function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={`gpu-layer ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: VERCEL_EASE }}
    >
      {children}
    </motion.div>
  );
}
