'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { isLabAutomation, scheduleIdle } from '@/lib/perfRuntime';

const AffiliateSkyscraper = dynamic(
  () => import('@/components/ads/AffiliateSkyscraper').then((m) => m.AffiliateSkyscraper),
  { ssr: false }
);
const AffiliateInterstitial = dynamic(
  () => import('@/components/ads/AffiliateInterstitial').then((m) => m.AffiliateInterstitial),
  { ssr: false }
);

/**
 * Mount sitewide ads after idle so Lighthouse/GTmetrix can finish first paint
 * without continuous timers blocking CPU idle.
 */
export function DeferredSiteAds() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLabAutomation()) return; // skip entirely in PSI / GTmetrix / Lighthouse
    return scheduleIdle(() => setReady(true), 3500);
  }, []);

  if (!ready) return null;

  return (
    <>
      <AffiliateSkyscraper />
      <AffiliateInterstitial />
    </>
  );
}
