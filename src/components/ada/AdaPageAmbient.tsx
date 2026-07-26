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
 * Standard ADA internal-page hero ambient:
 * silver bubble field + soft spotlight behind content.
 * Panels should use solid fills so dots never cover UI.
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
