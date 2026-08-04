'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SPRING_PRESS, SPRING_SOFT } from '@/lib/motion/premium';

type PressableProps = HTMLMotionProps<'div'> & {
  /** Scale on press (default 0.975) */
  pressScale?: number;
  /** Subtle hover lift */
  lift?: boolean;
};

/**
 * Micro-interaction — Apple-like spring press + Vercel hover lift.
 * Disabled under reduced-motion.
 */
export function Pressable({
  children,
  className = '',
  pressScale = 0.975,
  lift = true,
  ...rest
}: PressableProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children as React.ReactNode}</div>;
  }

  return (
    <motion.div
      className={cn('gpu-layer will-change-transform', className)}
      whileHover={
        lift
          ? { y: -3, transition: SPRING_SOFT }
          : undefined
      }
      whileTap={{ scale: pressScale, transition: SPRING_PRESS }}
      transition={SPRING_SOFT}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
