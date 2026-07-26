'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Enable shine-border silver hover (site-wide CSS) */
  shine?: boolean;
  /** Hover lift */
  lift?: boolean;
  as?: 'div' | 'article' | 'section';
  onClick?: () => void;
};

/**
 * Shared premium card shell — silver border sheen + optional motion lift.
 * Works on light and dark via existing .shine-border tokens.
 */
export function PremiumCard({
  children,
  className = '',
  shine = true,
  lift = true,
  as = 'div',
  onClick,
}: PremiumCardProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  return (
    <Comp
      onClick={onClick}
      whileHover={
        reduce || !lift
          ? undefined
          : { y: -3, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }
      }
      className={cn(
        'relative overflow-hidden rounded-2xl border',
        shine && 'shine-border',
        className
      )}
    >
      {children}
    </Comp>
  );
}
