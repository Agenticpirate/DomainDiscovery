'use client';

import React from 'react';
import { AffiliateAdBanner } from '@/components/ads/AffiliateAdBanner';
import type { AffiliateAdPlacement } from '@/lib/affiliateAds';

type Props = {
  placement: AffiliateAdPlacement;
  variant?: 'leaderboard' | 'card' | 'strip';
  className?: string;
  /** Max width container; default page-gutter friendly */
  contained?: boolean;
};

/**
 * Page-level ad rail with consistent spacing above footers / below tools.
 */
export function AffiliateAdRail({
  placement,
  variant = 'card',
  className = '',
  contained = true,
}: Props) {
  return (
    <aside
      className={`w-full ${className}`}
      aria-label="Sponsored offer"
    >
      <div className={contained ? 'max-w-4xl mx-auto px-3.5 sm:px-6' : 'w-full'}>
        <AffiliateAdBanner placement={placement} variant={variant} />
      </div>
    </aside>
  );
}
