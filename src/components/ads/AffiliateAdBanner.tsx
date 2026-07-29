'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  getAdForPlacement,
  getDefaultVariant,
  SPACESHIP_SPACEMAIL_MOBILE,
  type AffiliateAdCreative,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

export type AffiliateAdBannerProps = {
  placement: AffiliateAdPlacement;
  creative?: AffiliateAdCreative;
  variant?: 'leaderboard' | 'card' | 'strip' | 'billboard' | 'skyscraper' | 'auto';
  className?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
};

/**
 * Tracked display unit — full-bleed creative, Sponsored · Ad label, site chrome.
 */
export function AffiliateAdBanner({
  placement,
  creative: creativeProp,
  variant: variantProp = 'auto',
  className = '',
  hideOnMobile = false,
  hideOnDesktop = false,
}: AffiliateAdBannerProps) {
  const desktopCreative = creativeProp ?? getAdForPlacement(placement);
  const variant =
    variantProp === 'auto' ? getDefaultVariant(placement) : variantProp;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const firedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const reactId = useId();

  // Mobile strip uses dedicated Impact 1825519 creative
  const creative =
    mounted &&
    isMobile &&
    (variant === 'strip' || variant === 'card' || variant === 'leaderboard') &&
    desktopCreative.format === 'leaderboard'
      ? SPACESHIP_SPACEMAIL_MOBILE
      : desktopCreative;

  const [imgSrc, setImgSrc] = useState(creative.localSrc);
  const pixelId = `imp-${creative.id}-${placement}-${reactId.replace(/:/g, '')}`;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setImgSrc(creative.localSrc);
  }, [creative.localSrc]);

  useEffect(() => {
    if (firedRef.current || typeof window === 'undefined') return;
    firedRef.current = false; // reset when creative changes
  }, [creative.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      const img = new window.Image(1, 1);
      img.src = `${creative.impressionPixel}${
        creative.impressionPixel.includes('?') ? '&' : '?'
      }cachebuster=${Date.now()}`;
    };

    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      fire();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0)) {
          fire();
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '48px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [creative.impressionPixel, creative.id]);

  const visibility = [
    hideOnMobile ? 'hidden sm:block' : '',
    hideOnDesktop ? 'sm:hidden' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isBillboard = creative.format === 'billboard' || variant === 'billboard';
  const isSkyscraper = creative.format === 'skyscraper' || variant === 'skyscraper';

  const trackedAnchor = (children: React.ReactNode, extraClass = '') => (
    <a
      id={`${creative.id}-${placement}`}
      href={creative.clickUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      data-affiliate="spaceship"
      data-ad-id={creative.id}
      data-campaign={creative.campaignId}
      data-placement={placement}
      data-creative-format={creative.format}
      className={`group relative inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500/70 rounded-2xl ${extraClass}`}
      aria-label={`${creative.alt} (sponsored)`}
    >
      {children}
    </a>
  );

  const noscriptPixel = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      id={pixelId}
      height={0}
      width={0}
      alt=""
      src={creative.impressionPixel}
      style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0, border: 0 }}
      aria-hidden
    />
  );

  const sponsoredBadge = (
    <span
      className={`pointer-events-none absolute left-2.5 top-2 z-[2] sm:left-3 sm:top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-semibold tracking-wide backdrop-blur-md ${
        isLight
          ? 'bg-black/45 text-white/90 border border-white/15'
          : 'bg-black/50 text-white/85 border border-white/12'
      }`}
    >
      <span>Sponsored</span>
      <span className="text-white/35">·</span>
      <span className="uppercase tracking-[0.12em] text-[7.5px] text-white/60">Ad</span>
    </span>
  );

  if (variant === 'skyscraper' || isSkyscraper) {
    return (
      <div ref={rootRef} className={`relative flex justify-center ${visibility}`}>
        {trackedAnchor(
          <span className="relative block overflow-hidden rounded-2xl shadow-lg">
            {sponsoredBadge}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={creative.alt}
              width={160}
              height={600}
              className="block h-[600px] w-[160px] max-h-[70vh] object-cover object-center"
              onError={() => {
                if (creative.displayAdCdn) setImgSrc(creative.displayAdCdn);
              }}
            />
          </span>
        )}
        {noscriptPixel}
      </div>
    );
  }

  if (variant === 'billboard' || (variant === 'card' && isBillboard)) {
    return (
      <div ref={rootRef} className={`relative w-full ${visibility}`}>
        {trackedAnchor(
          <span
            className={`relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-28px_rgba(0,0,0,0.55)] transition-transform active:scale-[0.997] ${
              isLight ? '' : ''
            }`}
          >
            {sponsoredBadge}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={creative.alt}
              width={creative.width}
              height={creative.height}
              loading="lazy"
              className="block w-full h-auto select-none"
              style={{ aspectRatio: `${creative.width} / ${creative.height}` }}
              onError={() => {
                if (creative.displayAdCdn) setImgSrc(creative.displayAdCdn);
              }}
            />
          </span>,
          'w-full block'
        )}
        {noscriptPixel}
      </div>
    );
  }

  // strip / card / leaderboard — full-bleed wide creative, no empty side panel
  return (
    <div ref={rootRef} className={`relative w-full ${visibility}`}>
      {trackedAnchor(
        <span className="relative block w-full overflow-hidden rounded-2xl shadow-[0_14px_44px_-20px_rgba(0,0,0,0.55)] transition-transform active:scale-[0.997]">
          {sponsoredBadge}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={creative.alt}
            width={creative.width}
            height={creative.height}
            loading="lazy"
            decoding="async"
            className="block w-full h-auto select-none"
            style={{ aspectRatio: `${creative.width} / ${creative.height}` }}
            onError={() => {
              if (creative.displayAdCdn) setImgSrc(creative.displayAdCdn);
            }}
          />
        </span>,
        'w-full block'
      )}
      {noscriptPixel}
    </div>
  );
}
