'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  BILLBOARD_CAROUSEL_MS,
  getCarouselAdsForPlacement,
  type AffiliateAdCreative,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  placement: AffiliateAdPlacement;
  ads?: AffiliateAdCreative[];
  className?: string;
  intervalMs?: number;
  /**
   * compact — smaller section width from parent (does not crop art)
   */
  size?: 'default' | 'compact';
};

/**
 * Premium full-bleed carousel — creative only, Sponsored · Ad, auto-slide.
 */
export function AffiliateAdCarousel({
  placement,
  ads: adsProp,
  className = '',
  intervalMs = BILLBOARD_CAROUSEL_MS,
  size = 'default',
}: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const impressed = useRef<Set<string>>(new Set());
  const reactId = useId();

  useEffect(() => setMounted(true), []);

  const ads: AffiliateAdCreative[] =
    adsProp ?? getCarouselAdsForPlacement(placement);

  const active = ads[index] ?? ads[0];
  const count = ads.length;

  useEffect(() => {
    setIndex(0);
  }, [ads.length, ads[0]?.id]);

  const fireImpression = useCallback((creative: AffiliateAdCreative) => {
    if (typeof window === 'undefined') return;
    if (impressed.current.has(creative.id)) return;
    impressed.current.add(creative.id);
    const img = new window.Image(1, 1);
    img.src = `${creative.impressionPixel}${
      creative.impressionPixel.includes('?') ? '&' : '?'
    }cachebuster=${Date.now()}`;
  }, []);

  useEffect(() => {
    if (!active || !mounted) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      fireImpression(active);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.1)) {
          fireImpression(active);
        }
      },
      { threshold: 0.12, rootMargin: '40px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, fireImpression, mounted, index]);

  useEffect(() => {
    if (count < 2 || intervalMs <= 0 || paused) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs, paused]);

  if (!active) return null;

  // compact = smaller *section* (narrower max-width from parent), never crop the art
  const compact = size === 'compact';

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <a
        id={`${active.id}-${placement}-carousel`}
        href={active.clickUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        data-affiliate="spaceship"
        data-ad-id={active.id}
        data-campaign={active.campaignId}
        data-placement={placement}
        data-creative-format="billboard-carousel"
        className={`group relative block w-full overflow-hidden rounded-xl sm:rounded-2xl transition-[transform,box-shadow] duration-500 ease-out active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 ${
          isLight
            ? 'shadow-[0_12px_36px_-20px_rgba(15,23,42,0.4)] hover:shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)] focus-visible:ring-offset-white border border-slate-200/80'
            : 'shadow-[0_16px_44px_-22px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] focus-visible:ring-offset-[#050505] border border-white/[0.1]'
        }`}
        aria-label={`${active.alt} (sponsored)`}
      >
        {/* Sponsored · Ad disclosure */}
        <span
          className={`pointer-events-none absolute left-2 top-2 z-[2] sm:left-2.5 sm:top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-semibold tracking-wide backdrop-blur-md ${
            isLight
              ? 'bg-white/90 text-slate-600 border border-slate-200/90 shadow-sm'
              : 'bg-black/55 text-white/75 border border-white/12'
          }`}
        >
          <span>Sponsored</span>
          <span className={isLight ? 'text-slate-300' : 'text-white/30'}>·</span>
          <span className="uppercase tracking-[0.12em] text-[7px] opacity-70">Ad</span>
        </span>

        <div className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {ads.map((ad) => {
              // Cap upscale for small leaderboards so 668px art stays crisp
              const isLeaderboard = ad.format === 'leaderboard';
              const maxW = isLeaderboard ? Math.round(ad.width * 1.15) : undefined;
              return (
                <div
                  key={ad.id}
                  className="relative w-full shrink-0 grow-0 basis-full flex justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.localSrc}
                    alt={ad.alt}
                    width={ad.width}
                    height={ad.height}
                    loading={ad.id === active.id ? 'eager' : 'lazy'}
                    decoding="async"
                    className="block w-full h-auto select-none"
                    style={{
                      aspectRatio: `${ad.width} / ${ad.height}`,
                      maxWidth: maxW,
                      imageRendering: 'auto',
                    }}
                    sizes={maxW ? `${maxW}px` : '100vw'}
                    draggable={false}
                    onError={(e) => {
                      if (ad.displayAdCdn) {
                        (e.target as HTMLImageElement).src = ad.displayAdCdn;
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </a>

      {ads.map((ad) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`pix-${ad.id}-${reactId}`}
          height={0}
          width={0}
          alt=""
          src={ad.impressionPixel}
          style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0, border: 0 }}
          aria-hidden
        />
      ))}
    </div>
  );
}
