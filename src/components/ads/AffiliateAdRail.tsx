'use client';

import React from 'react';
import { AffiliateAdBanner } from '@/components/ads/AffiliateAdBanner';
import { AffiliateAdCarousel } from '@/components/ads/AffiliateAdCarousel';
import {
  getAdForPlacement,
  getCarouselAdsForPlacement,
  placementUsesCarousel,
  placementUsesStripCarousel,
  STRIP_CAROUSEL_MS,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';

type Props = {
  placement: AffiliateAdPlacement;
  variant?: 'leaderboard' | 'card' | 'strip' | 'billboard' | 'skyscraper' | 'auto';
  className?: string;
  contained?: boolean;
  noCarousel?: boolean;
};

/**
 * Page-level ad rail.
 * Billboard + strip placements auto-rotate creatives with tracking intact.
 */
export function AffiliateAdRail({
  placement,
  variant = 'auto',
  className = '',
  contained = true,
  noCarousel = false,
}: Props) {
  const useBillboardCarousel = !noCarousel && placementUsesCarousel(placement);
  const useStripCarousel = !noCarousel && placementUsesStripCarousel(placement);
  const useCarousel = useBillboardCarousel || useStripCarousel;
  const creative = getAdForPlacement(placement);
  const wide =
    useCarousel ||
    creative.format === 'billboard' ||
    creative.format === 'leaderboard';

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
        {useCarousel ? (
          <AffiliateAdCarousel
            placement={placement}
            ads={getCarouselAdsForPlacement(placement)}
            intervalMs={useStripCarousel ? STRIP_CAROUSEL_MS : undefined}
          />
        ) : (
          <AffiliateAdBanner placement={placement} variant={variant} />
        )}
      </div>
    </aside>
  );
}
