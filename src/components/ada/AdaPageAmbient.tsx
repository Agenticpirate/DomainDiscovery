'use client';

import React from 'react';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { cn } from '@/lib/utils';

type AdaPageAmbientProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * ADA page ambient (matches DomainDiscovery landing + AdaShell):
 * silver bubble field with hero radial clear under titles/badges/CTAs.
 * Prefer solid plates on cards so dots never show through UI.
 * Note: AdaShell already wraps all /ada routes in intensity="hero" — this is for
 * standalone use if a route is ever rendered outside the shell.
 */
export function AdaPageAmbient({
  children,
  className = '',
  contentClassName = '',
}: AdaPageAmbientProps) {
  return (
    <SectionAmbient
      intensity="hero"
      className={cn('min-h-full w-full', className)}
      contentClassName={cn('relative z-[1]', contentClassName)}
    >
      {children}
    </SectionAmbient>
  );
}
