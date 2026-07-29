'use client';

import React from 'react';
import { AffiliateAdBanner } from '@/components/ads/AffiliateAdBanner';
import { AffiliateAdCarousel } from '@/components/ads/AffiliateAdCarousel';
import {
  getAdForPlacement,
  placementUsesCarousel,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';

type Props = {
  placement: AffiliateAdPlacement;
  variant?: 'leaderboard' | 'card' | 'strip' | 'billboard' | 'skyscraper' | 'auto';
  className?: string;
  /** Max width container; billboards get a wider shell */
  contained?: boolean;
  /** Force carousel off even on billboard placements */
  noCarousel?: boolean;
};

/**
 * Page-level ad rail with consistent spacing above footers / below tools.
 * Billboard placements auto-use a highlighted multi-ad slide carousel.
 */
export function AffiliateAdRail({
  placement,
  variant = 'auto',
  className = '',
  contained = true,
  noCarousel = false,
}: Props) {
  const useCarousel = !noCarousel && placementUsesCarousel(placement);
  const creative = getAdForPlacement(placement);
  const wide = useCarousel || creative.format === 'billboard';

  return (
    <aside className={`w-full ${className}`} aria-label="Sponsored offer">
      <div
        className={
          contained
            ? wide
              ? 'max-w-5xl mx-auto px-3.5 sm:px-6'
              : 'max-w-4xl mx-auto px-3.5 sm:px-6'
            : 'w-full max-w-5xl mx-auto'
        }
      >
        {useCarousel ? (
          <AffiliateAdCarousel placement={placement} />
        ) : (
          <AffiliateAdBanner placement={placement} variant={variant} />
        )}
      </div>
    </aside>
  );
}
