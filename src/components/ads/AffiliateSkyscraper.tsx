'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  SKYSCRAPER_CAROUSEL_ADS,
  SKYSCRAPER_CAROUSEL_MS,
  type AffiliateAdCreative,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Desktop sticky skyscraper — premium creative only.
 * Auto-slides every 15s · no 1/2, dots, or nav chrome.
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
  const railWidth = 160;

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

  useEffect(() => {
    if (dismissed || !active || !mounted) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      fireImpression(active);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) fireImpression(active);
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, dismissed, fireImpression, mounted, index]);

  useEffect(() => {
    if (dismissed || count < 2 || paused) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setIndex((i) => (i + 1) % count);
    }, SKYSCRAPER_CAROUSEL_MS);
    return () => window.clearInterval(id);
  }, [count, dismissed, paused]);

  if (!mounted || dismissed || !active) return null;

  return (
    <aside
      ref={rootRef}
      className="pointer-events-none fixed z-[80] hidden xl:block"
      style={{
        top: 'max(5.5rem, calc(50vh - 300px))',
        right: 'max(0.75rem, calc((100vw - 80rem) / 2 - 11.5rem))',
      }}
      aria-label="Sponsored offer"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-auto relative" style={{ width: railWidth }}>
        {/* Soft dismiss — appears on hover only */}
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
          className={`absolute -right-1.5 -top-1.5 z-[3] flex h-6 w-6 items-center justify-center rounded-full text-[11px] opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover/sky:opacity-100 ${
            isLight
              ? 'bg-white/90 text-slate-500 shadow border border-slate-200/80'
              : 'bg-black/70 text-white/70 border border-white/10'
          }`}
          style={{ opacity: undefined }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '0';
          }}
          aria-label="Hide ad"
          title="Hide"
        >
          ×
        </button>

        <div
          className={`group/sky relative overflow-hidden rounded-2xl border transition-shadow duration-500 ${
            isLight
              ? 'border-slate-200/90 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.4)] bg-white'
              : 'border-white/12 shadow-[0_20px_56px_-18px_rgba(0,0,0,0.85)] bg-[#0a0a0c]'
          }`}
          style={{ width: railWidth, maxHeight: 'min(600px, 70vh)' }}
        >
          {/* Sponsored + Ad disclosure on side rail */}
          <span
            className={`pointer-events-none absolute left-1.5 top-1.5 z-[2] inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md ${
              isLight
                ? 'bg-white/90 text-slate-600 border border-slate-200/90'
                : 'bg-black/55 text-white/70 border border-white/12'
            }`}
          >
            <span>Sponsored</span>
            <span className={isLight ? 'text-slate-300' : 'text-white/30'}>·</span>
            <span>Ad</span>
          </span>

          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
                className="relative block shrink-0 grow-0 basis-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
                  className="block w-full h-auto object-contain object-top select-none"
                  style={{ maxHeight: 'min(600px, 70vh)' }}
                  draggable={false}
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
