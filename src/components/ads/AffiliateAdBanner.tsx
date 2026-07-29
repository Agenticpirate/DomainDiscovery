'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  getAdForPlacement,
  getDefaultVariant,
  type AffiliateAdCreative,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

export type AffiliateAdBannerProps = {
  placement: AffiliateAdPlacement;
  /** Override default creative for this placement */
  creative?: AffiliateAdCreative;
  /**
   * visual frame (creative pixels stay authentic)
   * - leaderboard: compact 320×50
   * - card: copy + small banner + CTA
   * - strip: slim full-width
   * - billboard: large 1200×630-style creative, full clickable
   * - skyscraper: 160×600 tall unit
   */
  variant?: 'leaderboard' | 'card' | 'strip' | 'billboard' | 'skyscraper' | 'auto';
  className?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
};

/**
 * Tracked Spaceship / Impact display unit.
 * Click → sjv.io · View → imp.pxf.io once when visible · rel=sponsored
 */
export function AffiliateAdBanner({
  placement,
  creative: creativeProp,
  variant: variantProp = 'auto',
  className = '',
  hideOnMobile = false,
  hideOnDesktop = false,
}: AffiliateAdBannerProps) {
  const creative = creativeProp ?? getAdForPlacement(placement);
  const variant =
    variantProp === 'auto' ? getDefaultVariant(placement) : variantProp;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const firedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [imgSrc, setImgSrc] = useState(creative.localSrc);
  const reactId = useId();
  const pixelId = `imp-${creative.id}-${placement}-${reactId.replace(/:/g, '')}`;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setImgSrc(creative.localSrc);
  }, [creative.localSrc]);

  // Fire impression once when visible
  useEffect(() => {
    if (firedRef.current || typeof window === 'undefined') return;

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
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
  }, [creative.impressionPixel]);

  const visibility = [
    hideOnMobile ? 'hidden sm:block' : '',
    hideOnDesktop ? 'sm:hidden' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isBillboard = creative.format === 'billboard' || variant === 'billboard';
  const isSkyscraper = creative.format === 'skyscraper' || variant === 'skyscraper';

  const bannerImg = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={creative.alt}
      width={creative.width}
      height={creative.height}
      loading="lazy"
      decoding="async"
      className={
        isBillboard
          ? 'block w-full h-auto rounded-xl sm:rounded-2xl object-cover'
          : isSkyscraper
            ? 'block h-auto w-[160px] max-h-[min(600px,70vh)] object-contain rounded-lg'
            : 'block max-w-full h-auto rounded-md'
      }
      style={
        isBillboard
          ? { width: '100%', height: 'auto', aspectRatio: `${creative.width} / ${creative.height}` }
          : isSkyscraper
            ? { width: 160, height: 'auto', maxWidth: '100%' }
            : { width: creative.width, height: creative.height, maxWidth: '100%' }
      }
      onError={() => {
        if (creative.displayAdCdn && imgSrc !== creative.displayAdCdn) {
          setImgSrc(creative.displayAdCdn);
        }
      }}
    />
  );

  const trackedLinkClass =
    'group relative inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500/70 rounded-lg';

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
      className={`${trackedLinkClass} ${extraClass}`}
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

  // —— Skyscraper: tall 160×600 ——
  if (variant === 'skyscraper' || isSkyscraper) {
    return (
      <div ref={rootRef} className={`relative flex justify-center ${visibility}`}>
        {trackedAnchor(
          <span
            className={`inline-flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-transform active:scale-[0.99] ${
              isLight
                ? 'bg-white border border-slate-200 shadow-md'
                : 'bg-[#0a0a0c] border border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.45)]'
            }`}
          >
            <span
              className={`text-[8px] font-bold uppercase tracking-[0.16em] ${
                isLight ? 'text-slate-400' : 'text-white/35'
              }`}
            >
              Sponsored
            </span>
            {bannerImg}
          </span>
        )}
        {noscriptPixel}
      </div>
    );
  }

  // —— Billboard: full-bleed creative only (CTA lives in the art) ——
  if (variant === 'billboard' || (variant === 'card' && isBillboard)) {
    return (
      <div ref={rootRef} className={`relative w-full ${visibility}`}>
        {trackedAnchor(
          <span
            className={`relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 active:scale-[0.997] ${
              isLight
                ? 'border-slate-200/90 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.4)] hover:shadow-xl'
                : 'border-white/10 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.9)] hover:border-white/16'
            }`}
          >
            <span
              className={`pointer-events-none absolute left-3 top-3 z-[2] sm:left-4 sm:top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide backdrop-blur-md ${
                isLight
                  ? 'bg-white/90 text-slate-600 border border-slate-200/90 shadow-sm'
                  : 'bg-black/55 text-white/75 border border-white/12'
              }`}
            >
              <span>Sponsored</span>
              <span className={isLight ? 'text-slate-300' : 'text-white/30'}>·</span>
              <span className="uppercase tracking-[0.12em] text-[8px] opacity-70">Ad</span>
            </span>
            <span className="block w-full">{bannerImg}</span>
          </span>,
          'w-full block'
        )}
        {noscriptPixel}
      </div>
    );
  }

  // Shared leaderboard (320×50) presentation — full-bleed, site-matched chrome
  if (variant === 'leaderboard' || variant === 'strip' || variant === 'card') {
    return (
      <div ref={rootRef} className={`relative w-full ${visibility}`}>
        {trackedAnchor(
          <span
            className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 active:scale-[0.997] ${
              isLight
                ? 'border-slate-200/90 bg-[#0b0b0f] shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35)] hover:border-slate-300 hover:shadow-lg'
                : 'border-white/[0.1] bg-[#0b0b0f] shadow-[0_16px_48px_-20px_rgba(0,0,0,0.75)] hover:border-white/[0.16]'
            }`}
          >
            {/* Sponsored badge — same language/style as site pills */}
            <span
              className={`pointer-events-none absolute left-2.5 top-2 z-[2] sm:left-3 sm:top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-semibold tracking-wide backdrop-blur-md ${
                isLight
                  ? 'bg-black/50 text-white/85 border border-white/15'
                  : 'bg-black/50 text-white/80 border border-white/12'
              }`}
            >
              <span>Sponsored</span>
              <span className="text-white/35">·</span>
              <span className="uppercase tracking-[0.12em] text-[7.5px] text-white/55">Ad</span>
            </span>

            {/*
              Full-width creative: 320×50 scales to container width.
              Purple fill matches Spacemail art so no empty “dead” panel.
            */}
            <span
              className="relative block w-full overflow-hidden"
              style={{
                background:
                  'linear-gradient(90deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={creative.alt}
                width={creative.width}
                height={creative.height}
                loading="lazy"
                decoding="async"
                className="relative z-[1] block w-full h-auto min-h-[52px] sm:min-h-[64px] object-cover object-left sm:object-center"
                style={{ aspectRatio: `${creative.width} / ${creative.height}` }}
                onError={() => {
                  if (creative.displayAdCdn && imgSrc !== creative.displayAdCdn) {
                    setImgSrc(creative.displayAdCdn);
                  }
                }}
              />
            </span>
          </span>,
          'w-full block'
        )}
        {noscriptPixel}
      </div>
    );
  }

  return null;
}
