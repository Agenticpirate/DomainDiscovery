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
  /**
   * compact = smaller *section* width only (home).
   * Does not crop or shrink the creative art — natural aspect ratio inside a narrower rail.
   */
  size?: 'default' | 'compact';
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
  size = 'default',
}: Props) {
  const useBillboardCarousel = !noCarousel && placementUsesCarousel(placement);
  const useStripCarousel = !noCarousel && placementUsesStripCarousel(placement);
  const useCarousel = useBillboardCarousel || useStripCarousel;
  const creative = getAdForPlacement(placement);
  const wide =
    useCarousel ||
    creative.format === 'billboard' ||
    creative.format === 'leaderboard';

  // Home / strip: keep section tight so 668px leaderboard isn’t blown up (blur)
  const maxW =
    size === 'compact'
      ? placement === 'home-hero'
        ? 'max-w-[720px] mx-auto'
        : 'max-w-2xl sm:max-w-3xl mx-auto'
      : placementUsesStripCarousel(placement)
        ? 'max-w-[720px] mx-auto'
        : wide
          ? 'max-w-5xl mx-auto'
          : 'max-w-4xl mx-auto';

  return (
    <aside className={`w-full ${className}`} aria-label="Sponsored offer">
      <div
        className={
          contained
            ? `${maxW} px-3.5 sm:px-6`
            : size === 'compact'
              ? `${maxW} w-full`
              : 'w-full'
        }
      >
        {useCarousel ? (
          <AffiliateAdCarousel
            placement={placement}
            ads={getCarouselAdsForPlacement(placement)}
            intervalMs={useStripCarousel ? STRIP_CAROUSEL_MS : undefined}
            size={size}
          />
        ) : (
          <AffiliateAdBanner placement={placement} variant={variant} />
        )}
      </div>
    </aside>
  );
}
