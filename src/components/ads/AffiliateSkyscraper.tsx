'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  SKYSCRAPER_CAROUSEL_ADS,
  SKYSCRAPER_CAROUSEL_MS,
  type AffiliateAdCreative,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

/** Same frame for every side ad — full-bleed, no letterbox “bezel” */
const RAIL_W = 160;
const RAIL_H = 600;

/**
 * Desktop sticky skyscraper — identical 160×600 full-bleed slides.
 * Local assets first (eager); CDN only on error so the rail never sits empty.
 */
export function AffiliateSkyscraper() {
  const ads = SKYSCRAPER_CAROUSEL_ADS;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  /** Per-creative resolved src (local → CDN on error) */
  const [srcById, setSrcById] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const ad of SKYSCRAPER_CAROUSEL_ADS) {
      init[ad.id] = ad.localSrc;
    }
    return init;
  });
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

    // Preload both creatives so the first paint is never a blank rail
    for (const ad of SKYSCRAPER_CAROUSEL_ADS) {
      const img = new window.Image();
      img.decoding = 'async';
      img.src = ad.localSrc;
      img.onerror = () => {
        if (!ad.displayAdCdn) return;
        const fallback = new window.Image();
        fallback.src = ad.displayAdCdn;
        fallback.onload = () => {
          setSrcById((prev) =>
            prev[ad.id] === ad.localSrc ? { ...prev, [ad.id]: ad.displayAdCdn } : prev
          );
        };
      };
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
      <div className="pointer-events-auto relative" style={{ width: RAIL_W }}>
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
          className={`absolute -right-1.5 -top-1.5 z-[3] flex h-6 w-6 items-center justify-center rounded-full text-[11px] opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 ${
            isLight
              ? 'bg-white/90 text-slate-500 shadow border border-slate-200/80'
              : 'bg-black/70 text-white/70 border border-white/10'
          }`}
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

        {/* Solid frame so the rail is never an empty black hole while assets load */}
        <div
          className="relative overflow-hidden rounded-[1.25rem] shadow-[0_20px_50px_-18px_rgba(0,0,0,0.65)]"
          style={{
            width: RAIL_W,
            height: RAIL_H,
            maxHeight: 'min(600px, 70vh)',
            background:
              'linear-gradient(165deg, #4c1d95 0%, #5b21b6 38%, #1e1b4b 100%)',
          }}
        >
          <span
            className={`pointer-events-none absolute left-1.5 top-1.5 z-[2] inline-flex items-center gap-0.5 rounded-md px-1.5 py-px text-[6px] font-semibold uppercase tracking-[0.12em] opacity-70 backdrop-blur-md sm:left-2 sm:top-2 sm:gap-1 sm:rounded-full sm:px-2 sm:py-0.5 sm:text-[7px] sm:opacity-100 ${
              isLight
                ? 'bg-black/30 text-white/80 border border-white/10 sm:bg-white/90 sm:text-slate-600 sm:border-white/50'
                : 'bg-black/30 text-white/70 border border-white/[0.08] sm:bg-black/45 sm:text-white/80 sm:border-white/15'
            }`}
          >
            <span className="max-sm:hidden normal-case tracking-wide">Sponsored</span>
            <span className="opacity-40 max-sm:hidden">·</span>
            <span>Ad</span>
          </span>

          <div
            className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${count * 100}%`,
              transform: `translateX(-${(index * 100) / count}%)`,
            }}
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
                className="relative h-full shrink-0 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                style={{ width: `${100 / count}%` }}
                aria-label={`${ad.alt} (sponsored)`}
                aria-hidden={ad.id !== active.id}
                tabIndex={ad.id === active.id ? 0 : -1}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={srcById[ad.id] ?? ad.localSrc}
                  alt={ad.alt}
                  width={RAIL_W}
                  height={RAIL_H}
                  loading="eager"
                  fetchPriority={ad.id === active.id ? 'high' : 'low'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center select-none"
                  draggable={false}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (ad.displayAdCdn && el.src !== ad.displayAdCdn) {
                      el.src = ad.displayAdCdn;
                      setSrcById((prev) => ({ ...prev, [ad.id]: ad.displayAdCdn }));
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
