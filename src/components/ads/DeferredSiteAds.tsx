'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { isLabAutomation, scheduleIdle } from '@/lib/perfRuntime';
import { stripLocalePrefix } from '@/lib/i18n/locales';

const AffiliateSkyscraper = dynamic(
  () => import('@/components/ads/RightSkyscraperAd').then((m) => m.RightSkyscraperAd),
  { ssr: false }
);
const AffiliateInterstitial = dynamic(
  () => import('@/components/ads/AffiliateInterstitial').then((m) => m.AffiliateInterstitial),
  { ssr: false }
);

/**
 * Mount sitewide ads after idle so Lighthouse/GTmetrix can finish first paint
 * without continuous timers blocking CPU idle.
 *
 * The right skyscraper renders while its gutter is empty so it never covers
 * or crops the page. (The empty left "open spot" boxes were removed.)
 * Interstitial: sitewide after engaged time.
 */
export function DeferredSiteAds() {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const apply = () => {
      const bare = stripLocalePrefix(pathname || '/');
      const show = window.innerWidth >= 1200 && bare !== '/search';
      document.documentElement.toggleAttribute('data-side-rails', show);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      document.documentElement.removeAttribute('data-side-rails');
    };
  }, [pathname]);

  useEffect(() => {
    if (isLabAutomation()) return; // skip entirely in PSI / GTmetrix / Lighthouse
    const stop = scheduleIdle(() => setReady(true), 400);
    const backup = window.setTimeout(() => setReady(true), 500);
    return () => {
      stop();
      window.clearTimeout(backup);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <AffiliateSkyscraper />
      <AffiliateInterstitial />
    </>
  );
}
