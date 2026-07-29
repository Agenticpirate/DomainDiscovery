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

  // —— Billboard: large TW/X creative, full surface clickable ——
  if (variant === 'billboard' || (variant === 'card' && isBillboard)) {
    return (
      <div ref={rootRef} className={`relative w-full ${visibility}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[2px] rounded-[1.35rem] opacity-80"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, rgba(56,189,248,0.4), rgba(167,139,250,0.35))'
              : 'linear-gradient(135deg, rgba(56,189,248,0.3), rgba(139,92,246,0.35))',
          }}
        />
        {trackedAnchor(
          <span
            className={`relative block w-full overflow-hidden rounded-2xl transition-all duration-300 group-hover:scale-[1.01] active:scale-[0.997] ${
              isLight
                ? 'bg-white border border-slate-200 shadow-[0_16px_48px_-18px_rgba(15,23,42,0.35)] hover:shadow-xl'
                : 'bg-[#0a0a0c] border border-white/15 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.95)] hover:border-white/25'
            }`}
          >
            <span className="absolute left-3 top-3 z-[2] sm:left-4 sm:top-4">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] border backdrop-blur-md ${
                  isLight
                    ? 'border-white/40 bg-white/85 text-slate-600'
                    : 'border-white/15 bg-black/55 text-white/70'
                }`}
              >
                Sponsored
              </span>
            </span>

            {/* Full-bleed image — no tiny thumbnail */}
            <span className="block w-full">{bannerImg}</span>

            <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-r from-transparent via-transparent to-transparent">
              <span className="min-w-0">
                <span
                  className={`block text-[14px] sm:text-[16px] font-black tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {creative.title}
                </span>
                <span
                  className={`block text-[12px] sm:text-[13px] mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-white/50'
                  }`}
                >
                  {creative.subtitle}
                </span>
              </span>
              <span
                className={`inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-full px-5 py-3 text-[13px] font-bold shadow-lg transition-transform group-hover:scale-[1.04] ${
                  isLight
                    ? 'bg-slate-900 text-white group-hover:bg-slate-800'
                    : 'bg-white text-black group-hover:bg-white/95'
                }`}
              >
                {creative.ctaLabel}
                <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </span>
          </span>,
          'w-full block group'
        )}
        {noscriptPixel}
      </div>
    );
  }

  if (variant === 'leaderboard') {
    return (
      <div ref={rootRef} className={`relative flex justify-center ${visibility}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-70 blur-[1px]"
          style={{
            background: isLight
              ? 'linear-gradient(90deg, rgba(56,189,248,0.35), rgba(167,139,250,0.3))'
              : 'linear-gradient(90deg, rgba(56,189,248,0.25), rgba(139,92,246,0.3))',
          }}
        />
        {trackedAnchor(
          <span
            className={`relative inline-flex flex-col items-center gap-1.5 rounded-2xl p-3 sm:p-3.5 transition-transform active:scale-[0.99] group-hover:scale-[1.02] ${
              isLight
                ? 'bg-white border border-slate-200 shadow-lg'
                : 'bg-[#0c0c0e] border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.45)]'
            }`}
          >
            <span
              className={`text-[8px] font-bold uppercase tracking-[0.16em] ${
                isLight ? 'text-slate-400' : 'text-white/35'
              }`}
            >
              Sponsored
            </span>
            {/* Scale 320×50 up so it reads as a real unit */}
            <span className="block w-full min-w-[min(100%,20rem)] sm:min-w-[22rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={creative.alt}
                width={creative.width}
                height={creative.height}
                loading="lazy"
                className="block w-full h-auto rounded-lg"
                onError={() => {
                  if (creative.displayAdCdn && imgSrc !== creative.displayAdCdn) {
                    setImgSrc(creative.displayAdCdn);
                  }
                }}
              />
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
              }`}
            >
              {creative.ctaLabel} →
            </span>
          </span>,
          'group'
        )}
        {noscriptPixel}
      </div>
    );
  }

  if (variant === 'strip') {
    return (
      <div ref={rootRef} className={`relative w-full ${visibility}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[1.5px] rounded-[1.15rem] opacity-75"
          style={{
            background: isLight
              ? 'linear-gradient(90deg, rgba(56,189,248,0.45), rgba(167,139,250,0.4), rgba(244,114,182,0.3))'
              : 'linear-gradient(90deg, rgba(56,189,248,0.3), rgba(139,92,246,0.35), rgba(236,72,153,0.25))',
          }}
        />
        {trackedAnchor(
          <span
            className={`relative flex w-full flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl px-3.5 py-3 sm:px-5 sm:py-3.5 transition-all group-hover:scale-[1.01] ${
              isLight
                ? 'bg-white border border-slate-200 shadow-md hover:shadow-lg'
                : 'bg-gradient-to-r from-[#0a0a0c] via-[#0c0c12] to-[#0a1218] border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-white/25'
            }`}
          >
            <span className="flex w-full sm:w-auto items-center gap-3 min-w-0 flex-1">
              <span
                className={`shrink-0 text-[8px] font-black uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full border ${
                  isLight
                    ? 'text-slate-500 border-slate-200 bg-slate-50'
                    : 'text-white/45 border-white/12 bg-white/[0.04]'
                }`}
              >
                Ad
              </span>
              {/* Larger strip creative: full available width on mobile */}
              <span className="min-w-0 flex-1 flex justify-center sm:justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc}
                  alt={creative.alt}
                  width={creative.width}
                  height={creative.height}
                  loading="lazy"
                  className="block w-full max-w-[min(100%,28rem)] h-auto rounded-lg shadow-sm"
                  onError={() => {
                    if (creative.displayAdCdn && imgSrc !== creative.displayAdCdn) {
                      setImgSrc(creative.displayAdCdn);
                    }
                  }}
                />
              </span>
            </span>
            <span
              className={`inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12.5px] font-bold transition-transform group-hover:scale-[1.04] ${
                isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
              }`}
            >
              {creative.ctaLabel}
              <span aria-hidden>→</span>
            </span>
          </span>,
          'w-full group'
        )}
        {noscriptPixel}
      </div>
    );
  }

  // variant === 'card' — leaderboard creative promoted to large highlighted unit
  return (
    <div ref={rootRef} className={`relative w-full ${visibility}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[2px] rounded-[1.35rem] opacity-80"
        style={{
          background: isLight
            ? 'linear-gradient(135deg, rgba(56,189,248,0.4), rgba(167,139,250,0.35), rgba(244,114,182,0.25))'
            : 'linear-gradient(135deg, rgba(56,189,248,0.28), rgba(139,92,246,0.32), rgba(236,72,153,0.22))',
        }}
      />
      {trackedAnchor(
        <span
          className={`relative flex w-full flex-col overflow-hidden rounded-2xl text-left transition-all duration-300 group-hover:scale-[1.01] active:scale-[0.995] ${
            isLight
              ? 'bg-white border border-slate-200 shadow-[0_14px_44px_-16px_rgba(15,23,42,0.3)] hover:shadow-xl'
              : 'bg-[#0a0a0c] border border-white/15 shadow-[0_20px_56px_-20px_rgba(0,0,0,0.9)] hover:border-white/25'
          }`}
        >
          <span className="flex items-center justify-between gap-2 px-3.5 pt-3 sm:px-4 sm:pt-3.5">
            <span className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] border ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-500'
                    : 'border-white/10 bg-white/[0.04] text-white/45'
                }`}
              >
                Sponsored
              </span>
              <span
                className={`text-[10px] font-semibold ${isLight ? 'text-slate-400' : 'text-white/40'}`}
              >
                {creative.brand}
              </span>
            </span>
            <span
              className={`hidden sm:inline text-[10px] font-medium ${
                isLight ? 'text-sky-600' : 'text-sky-300/80'
              }`}
            >
              Tap to open →
            </span>
          </span>

          {/* Large banner area — fill width so 320×50 doesn't look like a postage stamp */}
          <span className="relative z-[1] px-3 sm:px-4 py-3 sm:py-3.5">
            <span
              className={`flex items-center justify-center rounded-xl p-3 sm:p-4 ${
                isLight
                  ? 'bg-gradient-to-b from-slate-50 to-white border border-slate-100'
                  : 'bg-gradient-to-b from-white/[0.06] to-transparent border border-white/8'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={creative.alt}
                width={creative.width}
                height={creative.height}
                loading="lazy"
                className="block w-full max-w-[28rem] sm:max-w-[32rem] h-auto rounded-md shadow-sm"
                style={{ imageRendering: 'auto' }}
                onError={() => {
                  if (creative.displayAdCdn && imgSrc !== creative.displayAdCdn) {
                    setImgSrc(creative.displayAdCdn);
                  }
                }}
              />
            </span>
          </span>

          <span
            className={`relative z-[1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 pb-3.5 sm:px-4 sm:pb-4 ${
              isLight ? 'bg-white' : 'bg-[#0a0a0c]'
            }`}
          >
            <span className="min-w-0">
              <span
                className={`block text-[14px] sm:text-[15px] font-black tracking-tight leading-snug ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {creative.title}
              </span>
              <span
                className={`block text-[12px] leading-snug mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-white/50'
                }`}
              >
                {creative.subtitle}
              </span>
            </span>
            <span
              className={`inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-full px-5 py-3 text-[13px] font-bold shadow-md transition-transform group-hover:scale-[1.04] ${
                isLight
                  ? 'bg-slate-900 text-white group-hover:bg-slate-800'
                  : 'bg-white text-black group-hover:bg-white/95'
              }`}
            >
              {creative.ctaLabel}
              <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </span>
        </span>,
        'w-full block group'
      )}
      {noscriptPixel}
    </div>
  );
}
