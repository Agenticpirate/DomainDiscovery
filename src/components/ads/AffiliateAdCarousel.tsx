'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  BILLBOARD_CAROUSEL_MS,
  adSrcSet,
  getCarouselAdsForPlacement,
  type AffiliateAdCreative,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';
import { CrispAffiliateStrip, isCrispStrip } from '@/components/ads/CrispAffiliateStrip';

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

  // Only rotate when carousel is visible — keeps lab tools' main thread idle
  useEffect(() => {
    if (count < 2 || intervalMs <= 0 || paused) return;
    const el = rootRef.current;
    let id = 0;
    let inView = false;

    const start = () => {
      if (id || !inView || paused) return;
      id = window.setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        setIndex((i) => (i + 1) % count);
      }, intervalMs);
    };
    const stop = () => {
      if (id) window.clearInterval(id);
      id = 0;
    };

    if (!el || typeof IntersectionObserver === 'undefined') {
      inView = true;
      start();
      return () => stop();
    }

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView) start();
        else stop();
      },
      { rootMargin: '40px', threshold: 0.1 }
    );
    io.observe(el);
    return () => {
      stop();
      io.disconnect();
    };
  }, [count, intervalMs, paused]);

  if (!active) return null;

  const aboveFold = placement === 'home-hero' || placement === 'ada-hero';

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
        className={`group relative block w-full overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-500 ease-out active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 ${
          isLight
            ? 'shadow-[0_12px_36px_-20px_rgba(15,23,42,0.4)] hover:shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)] focus-visible:ring-offset-white border border-slate-200/80'
            : 'shadow-[0_16px_44px_-22px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] focus-visible:ring-offset-[#000000] border border-white/[0.1]'
        }`}
        aria-label={`${active.alt} (sponsored)`}
      >
        {/* Ghost watermark SPONSORED indicator — completely borderless, seamless & non-intrusive */}
        {/* Text strips: top-left (logo is vertically centred, CTA sits right).
            Image creatives: bottom-right pill, clear of the advertiser logo. */}
        <span
          className={`pointer-events-none absolute z-[4] select-none text-[9px] font-semibold uppercase leading-[1.4] tracking-[0.14em] ${
            isCrispStrip(active)
              ? 'left-3 top-1 text-white/60 min-[390px]:left-4 sm:left-8 sm:top-2'
              : 'right-2.5 bottom-1.5 rounded-full bg-black/25 px-1.5 py-px text-white/70 backdrop-blur-sm sm:right-3 sm:bottom-2'
          }`}
        >
          SPONSORED
        </span>

        <div className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {ads.map((ad) => {
              const crisp = isCrispStrip(ad);
              return (
                <div
                  key={ad.id}
                  className={`relative flex w-full shrink-0 grow-0 basis-full items-stretch ${
                    crisp ? 'max-h-[84px] sm:max-h-none overflow-hidden' : ''
                  }`}
                >
                  {crisp ? (
                    <CrispAffiliateStrip creative={ad} />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ad.localSrc}
                      alt={ad.alt}
                      width={ad.width}
                      height={ad.height}
                      loading={aboveFold && ad.id === active.id ? 'eager' : 'lazy'}
                      decoding="async"
                      className="block h-auto w-full select-none"
                      style={{
                        aspectRatio: `${ad.width} / ${ad.height}`,
                      }}
                      srcSet={adSrcSet(ad.localSrc)}
                      sizes="100vw"
                      draggable={false}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.removeAttribute('srcset');
                        if (el.currentSrc.endsWith('.webp') || el.src.endsWith('.webp')) {
                          el.src = ad.localSrc.replace(/\.webp$/i, '.png');
                        } else if (ad.displayAdCdn) {
                          el.src = ad.displayAdCdn;
                        }
                      }}
                    />
                  )}
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
          fetchPriority="low"
          style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0, border: 0 }}
          aria-hidden
        />
      ))}
    </div>
  );
}
