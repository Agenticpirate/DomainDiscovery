'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  INTERSTITIAL_CONFIG,
  SPACESHIP_INTERSTITIAL,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Non-skippable Spaceship interstitial after 5+ minutes of *visible* site time.
 *
 * Dismiss paths:
 *  1. Wait 60s while this page/tab stays visible (timer pauses when hidden / blurred)
 *  2. Click the sponsored ad (then Continue unlocks)
 *
 * Once completed in a browser session, does not show again (sessionStorage).
 */
export function AffiliateInterstitial() {
  const creative = SPACESHIP_INTERSTITIAL;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;

  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(INTERSTITIAL_CONFIG.dismissWaitSec);
  const [clickedAd, setClickedAd] = useState(false);
  const [imgSrc, setImgSrc] = useState(creative.localSrc);
  const impressionFired = useRef(false);
  const completedRef = useRef(false);
  const reactId = useId();

  const canDismiss = secondsLeft <= 0 || clickedAd;

  // —— Accumulate engaged (visible) time sitewide ——
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    try {
      if (sessionStorage.getItem(INTERSTITIAL_CONFIG.storageDone) === '1') {
        completedRef.current = true;
        return;
      }
    } catch {
      /* private mode */
    }

    let lastTick = Date.now();
    let engaged = 0;
    try {
      engaged = Number(sessionStorage.getItem(INTERSTITIAL_CONFIG.storageEngaged) || 0) || 0;
    } catch {
      engaged = 0;
    }

    const isActive = () =>
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible' &&
      // hasFocus is false when another window is frontmost
      (typeof document.hasFocus !== 'function' || document.hasFocus());

    const maybeOpen = (ms: number) => {
      if (completedRef.current || open) return;
      if (ms >= INTERSTITIAL_CONFIG.engagedMs) {
        setOpen(true);
        setSecondsLeft(INTERSTITIAL_CONFIG.dismissWaitSec);
      }
    };

    // Catch up if they already crossed threshold this session
    maybeOpen(engaged);

    const onInterval = () => {
      const now = Date.now();
      if (isActive() && !completedRef.current) {
        const delta = Math.min(now - lastTick, 2000); // clamp tab-sleep spikes
        if (delta > 0) {
          engaged += delta;
          try {
            sessionStorage.setItem(INTERSTITIAL_CONFIG.storageEngaged, String(engaged));
          } catch {
            /* ignore */
          }
          maybeOpen(engaged);
        }
      }
      lastTick = now;
    };

    const onVisibilityOrFocus = () => {
      // Reset baseline so hidden gaps never count
      lastTick = Date.now();
    };

    const id = window.setInterval(onInterval, 1000);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);
    window.addEventListener('blur', onVisibilityOrFocus);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
      window.removeEventListener('blur', onVisibilityOrFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open intentionally not in deps (maybeOpen uses ref + setState)
  }, []);

  // —— 60s dismiss countdown: only ticks while tab/window is visible & focused ——
  useEffect(() => {
    if (!open || secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      const active =
        document.visibilityState === 'visible' &&
        (typeof document.hasFocus !== 'function' || document.hasFocus());
      if (!active) return;
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [open, secondsLeft]);

  // —— Impression once when modal opens ——
  useEffect(() => {
    if (!open || impressionFired.current || typeof window === 'undefined') return;
    impressionFired.current = true;
    const img = new window.Image(1, 1);
    img.src = `${creative.impressionPixel}${
      creative.impressionPixel.includes('?') ? '&' : '?'
    }cachebuster=${Date.now()}`;
  }, [open, creative.impressionPixel]);

  // —— Lock body scroll while open ——
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape only works after unlock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canDismiss) {
        complete();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, canDismiss]);

  const complete = useCallback(() => {
    completedRef.current = true;
    try {
      sessionStorage.setItem(INTERSTITIAL_CONFIG.storageDone, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  const onAdClick = () => {
    setClickedAd(true);
  };

  if (!mounted || !open) return null;

  const progress =
    INTERSTITIAL_CONFIG.dismissWaitSec <= 0
      ? 1
      : 1 - secondsLeft / INTERSTITIAL_CONFIG.dismissWaitSec;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aff-interstitial-title"
      aria-describedby="aff-interstitial-desc"
    >
      {/* Scrim — not clickable to dismiss */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        aria-hidden
      />

      <div
        className={`relative z-[1] w-full max-w-[min(26rem,100%)] sm:max-w-[28rem] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl ${
          isLight
            ? 'bg-white border border-slate-200'
            : 'bg-[#0a0a0c] border border-white/12'
        }`}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5 text-center">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.18em] mb-1.5 ${
              isLight ? 'text-slate-400' : 'text-white/40'
            }`}
          >
            Sponsored partner · Spaceship
          </p>
          <h2
            id="aff-interstitial-title"
            className={`text-[1.05rem] sm:text-lg font-black tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {creative.title}
          </h2>
          <p
            id="aff-interstitial-desc"
            className={`mt-1 text-[12px] sm:text-[13px] leading-snug ${
              isLight ? 'text-slate-500' : 'text-white/50'
            }`}
          >
            {creative.subtitle}
          </p>
        </div>

        {/* Tracked creative */}
        <div className="px-3 sm:px-4">
          <a
            id={creative.id}
            href={creative.clickUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            data-affiliate="spaceship"
            data-ad-id={creative.id}
            data-campaign={creative.campaignId}
            data-placement="interstitial"
            onClick={onAdClick}
            className={`group relative flex justify-center rounded-xl overflow-hidden border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isLight
                ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                : 'border-white/10 bg-black/40 hover:border-white/20'
            }`}
            aria-label={`${creative.alt} (sponsored — opens in new tab)`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={creative.alt}
              width={creative.width}
              height={creative.height}
              className="block w-full h-auto max-h-[min(52vh,420px)] object-contain"
              onError={() => {
                if (creative.displayAdCdn && imgSrc !== creative.displayAdCdn) {
                  setImgSrc(creative.displayAdCdn);
                }
              }}
            />
          </a>
        </div>

        {/* CTA + timer */}
        <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-5 space-y-3">
          <a
            href={creative.clickUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            data-ad-id={creative.id}
            data-placement="interstitial-cta"
            onClick={onAdClick}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {creative.ctaLabel}
            <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          {/* Progress bar for 60s gate */}
          <div>
            <div
              className={`h-1.5 w-full overflow-hidden rounded-full ${
                isLight ? 'bg-slate-100' : 'bg-white/10'
              }`}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
                  canDismiss
                    ? isLight
                      ? 'bg-emerald-500'
                      : 'bg-emerald-400'
                    : isLight
                      ? 'bg-slate-800'
                      : 'bg-white/70'
                }`}
                style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
              />
            </div>
            <p
              className={`mt-2 text-center text-[11px] font-medium ${
                isLight ? 'text-slate-500' : 'text-white/45'
              }`}
            >
              {canDismiss ? (
                clickedAd && secondsLeft > 0 ? (
                  <span>Thanks — you can continue anytime</span>
                ) : (
                  <span>You can continue to DomainDiscovery</span>
                )
              ) : (
                <span>
                  Non-skippable ·{' '}
                  <span className="tabular-nums font-bold">
                    {secondsLeft}s
                  </span>{' '}
                  remaining
                  <span className="block sm:inline sm:before:content-['·_'] mt-0.5 sm:mt-0 opacity-80">
                    timer pauses if you leave this tab
                  </span>
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={!canDismiss}
            onClick={complete}
            className={`w-full rounded-xl px-4 py-2.5 text-[12.5px] font-bold transition ${
              canDismiss
                ? isLight
                  ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200'
                  : 'bg-white/10 text-white hover:bg-white/15 border border-white/15'
                : isLight
                  ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                  : 'bg-white/[0.04] text-white/25 border border-white/[0.06] cursor-not-allowed'
            }`}
          >
            {canDismiss ? 'Continue to DomainDiscovery' : `Continue available in ${secondsLeft}s`}
          </button>
        </div>

        {/* Impact impression pixel in DOM */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id={`imp-${creative.id}-${reactId.replace(/:/g, '')}`}
          height={0}
          width={0}
          alt=""
          src={creative.impressionPixel}
          style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0, border: 0 }}
          aria-hidden
        />
      </div>
    </div>
  );
}
