'use client';

import React from 'react';
import { AffiliateAdBanner } from '@/components/ads/AffiliateAdBanner';
import { getAdForPlacement, type AffiliateAdPlacement } from '@/lib/affiliateAds';

type Props = {
  placement: AffiliateAdPlacement;
  variant?: 'leaderboard' | 'card' | 'strip' | 'billboard' | 'skyscraper' | 'auto';
  className?: string;
  /** Max width container; billboards get a wider shell */
  contained?: boolean;
};

/**
 * Page-level ad rail with consistent spacing above footers / below tools.
 */
export function AffiliateAdRail({
  placement,
  variant = 'auto',
  className = '',
  contained = true,
}: Props) {
  const creative = getAdForPlacement(placement);
  const wide = creative.format === 'billboard';

  return (
    <aside className={`w-full ${className}`} aria-label="Sponsored offer">
      <div
        className={
          contained
            ? wide
              ? 'max-w-5xl mx-auto px-3.5 sm:px-6'
              : 'max-w-4xl mx-auto px-3.5 sm:px-6'
            : 'w-full'
        }
      >
        <AffiliateAdBanner placement={placement} variant={variant} />
      </div>
    </aside>
  );
}
