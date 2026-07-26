'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  y?: number;
  once?: boolean;
  /** Tighter mobile motion */
  compact?: boolean;
};

/**
 * Viewport reveal — Framer Motion (works great with React/Next).
 * Uses UI/UX pro motion timings; skips when reduced-motion is on.
 */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  once = true,
  compact = true,
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
      className={className}
      initial={{ opacity: 0, y: dy }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-8% 0px -6% 0px', amount: 0.15 }}
      transition={{ duration: 0.42, delay, ease: EASE }}
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

/** Stagger children that are direct motion.div or use data-stagger */
export function Stagger({ children, className = '', delay = 0, stagger = 0.05 }: StaggerProps) {
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
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: EASE },
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
