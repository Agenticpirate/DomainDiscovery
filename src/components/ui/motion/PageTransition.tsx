'use client';

import React from 'react';

type PageTransitionProps = {
  children: React.ReactNode;
};

/**
 * Route shell. Full-page fade/rise was promoting the entire tree and
 * made navigation feel stuck, so pages render immediately.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>;
}
