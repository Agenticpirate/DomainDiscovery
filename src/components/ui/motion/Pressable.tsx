'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

type PressableProps = HTMLMotionProps<'div'> & {
  /** Scale on press (default 0.985) */
  pressScale?: number;
  /** Subtle hover lift */
  lift?: boolean;
};

/**
 * Micro-interaction wrapper — press scale + optional hover lift.
 * UI/UX Pro style timings; disabled under reduced-motion.
 */
export function Pressable({
  children,
  className = '',
  pressScale = 0.985,
  lift = true,
  ...rest
}: PressableProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children as React.ReactNode}</div>;
  }

  return (
    <motion.div
      className={cn('gpu-layer', className)}
      whileHover={lift ? { y: -2, transition: { duration: 0.22, ease: EASE } } : undefined}
      whileTap={{ scale: pressScale, transition: { duration: 0.12 } }}
      transition={{ duration: 0.22, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
