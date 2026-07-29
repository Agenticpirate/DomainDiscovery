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
};

/**
 * Premium full-bleed billboard carousel.
 * Creative only + one CTA · auto-slide · no chrome (no 1/2, dots, arrows, title copy).
 */
export function AffiliateAdCarousel({
  placement,
  ads: adsProp,
  className = '',
  intervalMs = BILLBOARD_CAROUSEL_MS,
}: Props) {
  const ads = adsProp ?? getCarouselAdsForPlacement(placement);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const impressed = useRef<Set<string>>(new Set());
  const reactId = useId();

  const active = ads[index] ?? ads[0];
  const count = ads.length;

  useEffect(() => setMounted(true), []);

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
        className={`group relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl transition-[transform,box-shadow] duration-500 ease-out active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 ${
          isLight
            ? 'shadow-[0_20px_60px_-28px_rgba(15,23,42,0.45)] hover:shadow-[0_28px_70px_-24px_rgba(15,23,42,0.5)] focus-visible:ring-offset-white'
            : 'shadow-[0_28px_80px_-32px_rgba(0,0,0,0.9)] hover:shadow-[0_32px_90px_-28px_rgba(0,0,0,0.95)] focus-visible:ring-offset-[#050505]'
        }`}
        aria-label={`${active.alt} (sponsored)`}
      >
        {/* Micro sponsored mark only (disclosure) */}
        <span
          className={`pointer-events-none absolute left-3 top-3 z-[2] sm:left-4 sm:top-4 inline-flex items-center rounded-full px-2 py-0.5 text-[7.5px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md ${
            isLight
              ? 'bg-white/75 text-slate-500 border border-white/60'
              : 'bg-black/40 text-white/55 border border-white/10'
          }`}
        >
          Ad
        </span>

        {/* Full-bleed slides only — CTA lives in the creative art (e.g. “Start free”) */}
        <div className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {ads.map((ad) => (
              <div key={ad.id} className="relative w-full shrink-0 grow-0 basis-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.localSrc}
                  alt={ad.alt}
                  width={ad.width}
                  height={ad.height}
                  loading={ad.id === active.id ? 'eager' : 'lazy'}
                  decoding="async"
                  className="block w-full h-auto select-none"
                  style={{ aspectRatio: `${ad.width} / ${ad.height}` }}
                  draggable={false}
                  onError={(e) => {
                    if (ad.displayAdCdn) {
                      (e.target as HTMLImageElement).src = ad.displayAdCdn;
                    }
                  }}
                />
              </div>
            ))}
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
