'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  SKYSCRAPER_CAROUSEL_ADS,
  SKYSCRAPER_CAROUSEL_MS,
  type AffiliateAdCreative,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Desktop-only sticky skyscraper rail (right edge) with slide carousel.
 * Rotates every 15s (pauses on hover / when tab hidden).
 * Each slide keeps its own Impact click + impression tracking.
 */
export function AffiliateSkyscraper() {
  const ads = SKYSCRAPER_CAROUSEL_ADS;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const impressed = useRef<Set<string>>(new Set());
  const reactId = useId();

  const active = ads[index] ?? ads[0];
  const count = ads.length;

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem('dd_skyscraper_dismissed_v1') === '1') {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fireImpression = useCallback((creative: AffiliateAdCreative) => {
    if (typeof window === 'undefined') return;
    if (impressed.current.has(creative.id)) return;
    impressed.current.add(creative.id);
    const img = new window.Image(1, 1);
    img.src = `${creative.impressionPixel}${
      creative.impressionPixel.includes('?') ? '&' : '?'
    }cachebuster=${Date.now()}`;
  }, []);

  // Impression when slide is active + rail visible
  useEffect(() => {
    if (dismissed || !active || !mounted) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      fireImpression(active);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fireImpression(active);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, dismissed, fireImpression, mounted, index]);

  // Auto-advance every 15s (pause hover / hidden tab)
  useEffect(() => {
    if (dismissed || count < 2 || paused) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setIndex((i) => (i + 1) % count);
    }, SKYSCRAPER_CAROUSEL_MS);
    return () => window.clearInterval(id);
  }, [count, dismissed, paused]);

  if (!mounted || dismissed || !active) return null;

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

  // Display width: fit both 160 and 335 assets in a consistent rail
  const railWidth = 168;

  return (
    <aside
      ref={rootRef}
      className="pointer-events-none fixed z-[80] hidden xl:block"
      style={{
        top: 'max(5.5rem, calc(50vh - 320px))',
        right: 'max(0.75rem, calc((100vw - 80rem) / 2 - 12rem))',
      }}
      aria-label="Sponsored Spaceship offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`pointer-events-auto relative flex flex-col items-center gap-1.5 rounded-2xl p-2 shadow-2xl ${
          isLight
            ? 'bg-white/95 border border-slate-200 shadow-slate-900/15'
            : 'bg-[#0a0a0c]/95 border border-white/12 shadow-black/50'
        }`}
        style={{ width: railWidth + 16 }}
      >
        <div className="flex w-full items-center justify-between gap-1 px-0.5">
          <span
            className={`text-[7.5px] font-black uppercase tracking-[0.14em] ${
              isLight ? 'text-slate-400' : 'text-white/35'
            }`}
          >
            Sponsored
          </span>
          {count > 1 ? (
            <span
              className={`text-[8px] font-bold tabular-nums ${
                isLight ? 'text-slate-400' : 'text-white/40'
              }`}
            >
              {index + 1}/{count}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              try {
                sessionStorage.setItem('dd_skyscraper_dismissed_v1', '1');
              } catch {
                /* ignore */
              }
            }}
            className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] leading-none ${
              isLight
                ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                : 'text-white/40 hover:bg-white/10 hover:text-white/80'
            }`}
            aria-label="Hide ad"
            title="Hide for this session"
          >
            ×
          </button>
        </div>

        {/* Slide stage — vertical-friendly height, horizontal slide */}
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ width: railWidth, maxHeight: 'min(600px, 70vh)' }}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {ads.map((ad) => (
              <a
                key={ad.id}
                id={`${ad.id}-skyscraper`}
                href={ad.clickUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                data-affiliate="spaceship"
                data-ad-id={ad.id}
                data-campaign={ad.campaignId}
                data-placement="skyscraper"
                data-creative-format="skyscraper-carousel"
                className="relative block shrink-0 grow-0 basis-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                style={{ width: railWidth }}
                aria-label={`${ad.alt} (sponsored)`}
                aria-hidden={ad.id !== active.id}
                tabIndex={ad.id === active.id ? 0 : -1}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.localSrc}
                  alt={ad.alt}
                  width={ad.width}
                  height={ad.height}
                  loading={ad.id === active.id ? 'eager' : 'lazy'}
                  decoding="async"
                  className="block w-full h-auto object-contain object-top"
                  style={{ maxHeight: 'min(600px, 70vh)' }}
                  onError={(e) => {
                    if (ad.displayAdCdn) {
                      (e.target as HTMLImageElement).src = ad.displayAdCdn;
                    }
                  }}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Dots + prev/next */}
        {count > 1 ? (
          <div className="flex w-full items-center justify-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => go(-1)}
              className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                isLight
                  ? 'text-slate-500 hover:bg-slate-100'
                  : 'text-white/50 hover:bg-white/10'
              }`}
              aria-label="Previous ad"
            >
              ‹
            </button>
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
                      ? 'w-4 bg-slate-900'
                      : 'w-4 bg-white'
                    : isLight
                      ? 'w-1.5 bg-slate-300'
                      : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
            <button
              type="button"
              onClick={() => go(1)}
              className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                isLight
                  ? 'text-slate-500 hover:bg-slate-100'
                  : 'text-white/50 hover:bg-white/10'
              }`}
              aria-label="Next ad"
            >
              ›
            </button>
          </div>
        ) : null}

        {/* Hidden impression pixels */}
        {ads.map((ad) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`imp-${ad.id}-${reactId}`}
            height={0}
            width={0}
            alt=""
            src={ad.impressionPixel}
            style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0, border: 0 }}
            aria-hidden
          />
        ))}
      </div>
    </aside>
  );
}
