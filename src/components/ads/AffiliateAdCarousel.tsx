'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  BILLBOARD_CAROUSEL_MS,
  getCarouselAdsForPlacement,
  placementUsesCarousel,
  type AffiliateAdCreative,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  placement: AffiliateAdPlacement;
  /** Override slide list (defaults to placement carousel map) */
  ads?: AffiliateAdCreative[];
  className?: string;
  /** Auto-advance ms; 0 = no auto */
  intervalMs?: number;
};

/**
 * Highlighted full-width billboard carousel — slides one ad after another.
 * Each slide keeps its own Impact click URL + fires impression when shown.
 */
export function AffiliateAdCarousel({
  placement,
  ads: adsProp,
  className = '',
  intervalMs = BILLBOARD_CAROUSEL_MS,
}: Props) {
  const ads =
    adsProp ??
    (placementUsesCarousel(placement)
      ? getCarouselAdsForPlacement(placement)
      : getCarouselAdsForPlacement(placement));

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

  // Fire when slide is active + unit visible
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

  // Auto-advance (pause on hover / when tab hidden)
  useEffect(() => {
    if (count < 2 || intervalMs <= 0 || paused) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs, paused]);

  if (!active) return null;

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      {/* Soft glow ring to draw the eye */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[2px] rounded-[1.35rem] sm:rounded-[1.6rem] opacity-90"
        style={{
          background: isLight
            ? 'linear-gradient(135deg, rgba(56,189,248,0.45), rgba(167,139,250,0.4), rgba(244,114,182,0.35))'
            : 'linear-gradient(135deg, rgba(56,189,248,0.35), rgba(139,92,246,0.4), rgba(236,72,153,0.28))',
          filter: 'blur(0.5px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[1.75rem] opacity-40 animate-pulse"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at center, rgba(56,189,248,0.18), transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(139,92,246,0.22), transparent 70%)',
        }}
      />

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
        className={`group relative block w-full overflow-hidden rounded-2xl sm:rounded-[1.35rem] transition-transform duration-300 active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
          isLight
            ? 'bg-white border border-slate-200/80 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.35)] hover:shadow-[0_20px_56px_-16px_rgba(15,23,42,0.4)] focus-visible:ring-offset-white'
            : 'bg-[#0a0a0c] border border-white/15 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.95)] hover:border-white/25 focus-visible:ring-offset-[#050505]'
        }`}
        aria-label={`${active.alt} (sponsored)`}
      >
        {/* Sponsored + slide indicator */}
        <div className="absolute left-3 top-3 z-[3] sm:left-4 sm:top-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] border backdrop-blur-md ${
              isLight
                ? 'border-white/50 bg-white/90 text-slate-600'
                : 'border-white/20 bg-black/55 text-white/75'
            }`}
          >
            Sponsored
          </span>
          {count > 1 ? (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tabular-nums backdrop-blur-md ${
                isLight ? 'bg-black/50 text-white' : 'bg-white/15 text-white/85'
              }`}
            >
              {index + 1}/{count}
            </span>
          ) : null}
        </div>

        {/* Slide stage */}
        <div className="relative w-full overflow-hidden bg-black/20">
          <div
            className="flex transition-transform duration-500 ease-out"
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
                  className="block w-full h-auto object-cover"
                  style={{ aspectRatio: `${ad.width} / ${ad.height}` }}
                  onError={(e) => {
                    if (ad.displayAdCdn) {
                      (e.target as HTMLImageElement).src = ad.displayAdCdn;
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Hover CTA overlay — entire banner still clickable */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-3.5 pt-14 sm:px-5 sm:pb-4 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity"
          >
            <div className="min-w-0 text-left">
              <p className="text-[13px] sm:text-[15px] font-black tracking-tight text-white drop-shadow">
                {active.title}
              </p>
              <p className="text-[11px] sm:text-[12.5px] text-white/75 mt-0.5 line-clamp-1">
                {active.subtitle}
              </p>
            </div>
            <span className="pointer-events-none inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-[12.5px] font-bold text-black shadow-lg group-hover:scale-[1.03] transition-transform">
              {active.ctaLabel}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>
        </div>
      </a>

      {/* Controls */}
      {count > 1 ? (
        <div className="relative z-[2] mt-2.5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-white/10 border border-white/15 text-white hover:bg-white/15'
            }`}
            aria-label="Previous ad"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {ads.map((ad, i) => (
              <button
                key={ad.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ad ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? isLight
                      ? 'w-6 bg-slate-900'
                      : 'w-6 bg-white'
                    : isLight
                      ? 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-white/10 border border-white/15 text-white hover:bg-white/15'
            }`}
            aria-label="Next ad"
          >
            ›
          </button>
        </div>
      ) : null}

      {/* Impression pixels for all slides (hidden) */}
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
