'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { SPACESHIP_SPACEMAIL_SKYSCRAPER } from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Desktop-only sticky Spacemail 160×600 skyscraper (right edge).
 * Hidden below xl so mobile/tablet stay clean.
 * Click + impression use Impact tracking on the creative.
 */
export function AffiliateSkyscraper() {
  const creative = SPACESHIP_SPACEMAIL_SKYSCRAPER;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;
  const firedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [imgSrc, setImgSrc] = useState(creative.localSrc);
  const [dismissed, setDismissed] = useState(false);
  const reactId = useId();

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

  // Impression once when visible
  useEffect(() => {
    if (dismissed || firedRef.current || typeof window === 'undefined') return;

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
        if (entries.some((e) => e.isIntersecting)) {
          fire();
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [dismissed, creative.impressionPixel]);

  if (!mounted || dismissed) return null;

  return (
    <aside
      ref={rootRef}
      className="pointer-events-none fixed z-[80] hidden xl:block"
      style={{
        // Clear fixed nav (~3.5–4rem) and sit mid-right
        top: 'max(5.5rem, calc(50vh - 300px))',
        right: 'max(0.75rem, calc((100vw - 80rem) / 2 - 11rem))',
      }}
      aria-label="Sponsored Spacemail offer"
    >
      <div
        className={`pointer-events-auto relative flex flex-col items-center gap-1.5 rounded-2xl p-2 shadow-2xl transition-transform hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white/95 border border-slate-200 shadow-slate-900/15'
            : 'bg-[#0a0a0c]/95 border border-white/12 shadow-black/50'
        }`}
      >
        <div className="flex w-full items-center justify-between gap-1 px-0.5">
          <span
            className={`text-[7.5px] font-black uppercase tracking-[0.14em] ${
              isLight ? 'text-slate-400' : 'text-white/35'
            }`}
          >
            Sponsored
          </span>
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

        <a
          id={`${creative.id}-skyscraper`}
          href={creative.clickUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          data-affiliate="spaceship"
          data-ad-id={creative.id}
          data-campaign={creative.campaignId}
          data-placement="skyscraper"
          data-creative-format="skyscraper"
          className="block overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label={`${creative.alt} (sponsored)`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={creative.alt}
            width={creative.width}
            height={creative.height}
            loading="lazy"
            decoding="async"
            className="block h-auto w-[160px] max-h-[min(600px,70vh)] object-contain"
            onError={() => {
              if (creative.displayAdCdn && imgSrc !== creative.displayAdCdn) {
                setImgSrc(creative.displayAdCdn);
              }
            }}
          />
        </a>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id={`imp-sky-${reactId.replace(/:/g, '')}`}
          height={0}
          width={0}
          alt=""
          src={creative.impressionPixel}
          style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0, border: 0 }}
          aria-hidden
        />
      </div>
    </aside>
  );
}
