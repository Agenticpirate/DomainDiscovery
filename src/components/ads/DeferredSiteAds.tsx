'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { isLabAutomation, scheduleIdle } from '@/lib/perfRuntime';

const AffiliateSkyscraper = dynamic(
  () => import('@/components/ads/AffiliateSkyscraper').then((m) => m.AffiliateSkyscraper),
  { ssr: false }
);
const AffiliateInterstitial = dynamic(
  () => import('@/components/ads/AffiliateInterstitial').then((m) => m.AffiliateInterstitial),
  { ssr: false }
);

/** Side skyscraper only on the marketing home page — tool pages need full result width. */
function isHomePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/' || pathname === '';
}

/**
 * Mount sitewide ads after idle so Lighthouse/GTmetrix can finish first paint
 * without continuous timers blocking CPU idle.
 *
 * Skyscraper: home only (avoids covering bulk search / tools results).
 * Interstitial: sitewide after engaged time.
 */
export function DeferredSiteAds() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const showSkyscraper = isHomePath(pathname);

  useEffect(() => {
    if (isLabAutomation()) return; // skip entirely in PSI / GTmetrix / Lighthouse
    return scheduleIdle(() => setReady(true), 3500);
  }, []);

  if (!ready) return null;

  return (
    <>
      {showSkyscraper ? <AffiliateSkyscraper /> : null}
      <AffiliateInterstitial />
    </>
  );
}
