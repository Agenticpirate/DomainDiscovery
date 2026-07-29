'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  getAdForPlacement,
  type AffiliateAdCreative,
  type AffiliateAdPlacement,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

export type AffiliateAdBannerProps = {
  placement: AffiliateAdPlacement;
  /** Override default creative for this placement */
  creative?: AffiliateAdCreative;
  /**
   * visual — how the unit is framed (creative size stays official Impact size)
   * - leaderboard: compact 320×50 centered (default)
   * - card: enhanced wide card with copy + official banner + CTA
   * - strip: full-width slim strip (mobile-friendly)
   */
  variant?: 'leaderboard' | 'card' | 'strip';
  className?: string;
  /** Hide on small screens */
  hideOnMobile?: boolean;
  /** Hide from sm and up */
  hideOnDesktop?: boolean;
};

/**
 * Tracked Spaceship / Impact display unit.
 * - Click: exact sjv.io tracking URL (rel=sponsored)
 * - View: imp.pxf.io pixel once when unit enters viewport (or on mount if IO unavailable)
 * - Creative: local PNG preferred; CDN fallback on error
 */
export function AffiliateAdBanner({
  placement,
  creative: creativeProp,
  variant = 'card',
  className = '',
  hideOnMobile = false,
  hideOnDesktop = false,
}: AffiliateAdBannerProps) {
  const creative = creativeProp ?? getAdForPlacement(placement);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const firedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [imgSrc, setImgSrc] = useState(creative.localSrc);
  const reactId = useId();
  const pixelId = `imp-${creative.id}-${placement}-${reactId.replace(/:/g, '')}`;

  useEffect(() => setMounted(true), []);

  // Fire impression once when visible (or immediately if IntersectionObserver missing)
  useEffect(() => {
    if (firedRef.current || typeof window === 'undefined') return;

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      // 1×1 pixel via Image constructor (reliable, no layout)
      const img = new window.Image(1, 1);
      img.src = `${creative.impressionPixel}${creative.impressionPixel.includes('?') ? '&' : '?'}cachebuster=${Date.now()}`;
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
      { threshold: 0.15, rootMargin: '40px' }
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

  const bannerImg = (
    // eslint-disable-next-line @next/next/no-img-element -- affiliate creative must stay exact dimensions
    <img
      src={imgSrc}
      alt={creative.alt}
      width={creative.width}
      height={creative.height}
      loading="lazy"
      decoding="async"
      className="block max-w-full h-auto rounded-md"
      style={{ width: creative.width, height: creative.height, maxWidth: '100%' }}
      onError={() => {
        if (imgSrc !== creative.displayAdCdn) setImgSrc(creative.displayAdCdn);
      }}
    />
  );

  const trackedLinkClass =
    'group relative inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500/70 rounded-lg';

  const trackedAnchor = (children: React.ReactNode, extraClass = '') => (
    <a
      id={creative.id}
      href={creative.clickUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      data-affiliate="spaceship"
      data-ad-id={creative.id}
      data-campaign={creative.campaignId}
      data-placement={placement}
      className={`${trackedLinkClass} ${extraClass}`}
      aria-label={`${creative.alt} (sponsored)`}
    >
      {children}
    </a>
  );

  // Hidden Impact-style pixel also in DOM for crawlers that expect it
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

  if (variant === 'leaderboard') {
    return (
      <div ref={rootRef} className={`relative flex justify-center ${visibility}`}>
        {trackedAnchor(
          <span
            className={`inline-flex flex-col items-center gap-1 rounded-xl p-2 transition-transform active:scale-[0.99] ${
              isLight
                ? 'bg-white/90 border border-slate-200 shadow-sm'
                : 'bg-[#0c0c0e]/90 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]'
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

  if (variant === 'strip') {
    return (
      <div ref={rootRef} className={`relative w-full ${visibility}`}>
        {trackedAnchor(
          <span
            className={`flex w-full items-center justify-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
              isLight
                ? 'bg-gradient-to-r from-slate-50 via-white to-sky-50 border border-slate-200 hover:border-slate-300'
                : 'bg-gradient-to-r from-[#0a0a0c] via-[#0c0c0e] to-[#0a1218] border border-white/10 hover:border-white/18'
            }`}
          >
            <span
              className={`hidden xs:inline shrink-0 text-[8px] font-bold uppercase tracking-[0.14em] ${
                isLight ? 'text-slate-400' : 'text-white/35'
              }`}
            >
              Ad
            </span>
            {bannerImg}
            <span
              className={`hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
              }`}
            >
              {creative.ctaLabel}
              <span aria-hidden>→</span>
            </span>
          </span>,
          'w-full'
        )}
        {noscriptPixel}
      </div>
    );
  }

  // variant === 'card' (enhanced default)
  return (
    <div ref={rootRef} className={`relative w-full ${visibility}`}>
      {trackedAnchor(
        <span
          className={`relative flex w-full flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 overflow-hidden rounded-2xl px-3.5 py-3.5 sm:px-5 sm:py-4 text-left transition-all active:scale-[0.995] ${
            isLight
              ? 'bg-white border border-slate-200 shadow-[0_10px_36px_-18px_rgba(15,23,42,0.25)] hover:border-slate-300 hover:shadow-md'
              : 'bg-[#0a0a0c] border border-white/[0.12] shadow-[0_16px_48px_-24px_rgba(0,0,0,0.85)] hover:border-white/20'
          }`}
        >
          {/* Accent wash */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background: isLight
                ? 'radial-gradient(ellipse 70% 120% at 0% 50%, rgba(14,165,233,0.08), transparent 55%)'
                : 'radial-gradient(ellipse 70% 120% at 0% 50%, rgba(56,189,248,0.08), transparent 55%)',
            }}
          />

          <span className="relative z-[1] flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
            <span className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] border ${
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
              className={`text-[13px] sm:text-[15px] font-black tracking-tight leading-snug ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {creative.title}
            </span>
            <span
              className={`text-[11px] sm:text-[12.5px] leading-snug ${
                isLight ? 'text-slate-500' : 'text-white/50'
              }`}
            >
              {creative.subtitle}
            </span>
          </span>

          <span className="relative z-[1] flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 shrink-0">
            <span
              className={`rounded-lg p-1 ${
                isLight ? 'bg-slate-50 border border-slate-100' : 'bg-black/40 border border-white/8'
              }`}
            >
              {bannerImg}
            </span>
            <span
              className={`inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-colors ${
                isLight
                  ? 'bg-slate-900 text-white group-hover:bg-slate-800'
                  : 'bg-white text-black group-hover:bg-white/90'
              }`}
            >
              {creative.ctaLabel}
              <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </span>
        </span>,
        'w-full block'
      )}
      {noscriptPixel}
    </div>
  );
}
