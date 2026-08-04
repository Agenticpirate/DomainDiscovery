'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SPRING_SOFT } from '@/lib/motion/premium';

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
 * Premium card — Vercel monochrome shell + Apple spring lift + shine.
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
          : { y: -4, scale: 1.01, transition: SPRING_SOFT }
      }
      whileTap={reduce || !lift ? undefined : { scale: 0.99, transition: SPRING_SOFT }}
      className={cn(
        'relative overflow-hidden rounded-2xl border gpu-layer',
        'transition-[border-color,box-shadow,background-color] duration-300 ease-out',
        shine && 'shine-border',
        className
      )}
    >
      {children}
    </Comp>
  );
}
