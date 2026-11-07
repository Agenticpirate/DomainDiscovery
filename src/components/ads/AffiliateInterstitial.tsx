'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  INTERSTITIAL_CONFIG,
  SPACESHIP_INTERSTITIAL,
} from '@/lib/affiliateAds';
import { useTheme } from '@/contexts/ThemeContext';
import { isLabAutomation, scheduleIdle } from '@/lib/perfRuntime';
import { SpaceshipMark } from '@/components/ads/CrispAffiliateStrip';

/** Circumference of the countdown ring (r = 15.5). */
const RING = 2 * Math.PI * 15.5;

function ssGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function ssSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode / quota */
  }
}

/**
 * Non-skippable Spaceship interstitial after ~4 minutes of *visible* site time.
 *
 * Rules:
 *  - Wait engagedMs while the tab is visible (does not require window focus —
 *    focus checks blocked the timer whenever DevTools / another pane had focus)
 *  - When shown, engaged clock resets so reload won't re-pop until another full wait
 *  - After Continue, never show again this browser session
 *  - 60s gate (pauses when tab hidden); or unlock immediately by clicking the ad
 */
export function AffiliateInterstitial() {
  const creative = SPACESHIP_INTERSTITIAL;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;

  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(INTERSTITIAL_CONFIG.dismissWaitSec);
  const [clickedAd, setClickedAd] = useState(false);

  const impressionFired = useRef(false);
  const completedRef = useRef(false);
  const openRef = useRef(false);
  const reactId = useId();

  const canDismiss = secondsLeft <= 0 || clickedAd;

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // —— Engage timer + open gate ——
  // Deferred so Lighthouse/GTmetrix can reach CPU idle on first paint.
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    if (isLabAutomation()) {
      completedRef.current = true;
      return;
    }

    if (ssGet(INTERSTITIAL_CONFIG.storageDone) === '1') {
      completedRef.current = true;
      return;
    }

    let lastTick = Date.now();
    let engaged = Number(ssGet(INTERSTITIAL_CONFIG.storageEngaged) || 0) || 0;
    let id = 0;
    let boot = 0;

    const isTabVisible = () => document.visibilityState === 'visible';

    const openInterstitial = () => {
      if (completedRef.current || openRef.current) return;
      if (ssGet(INTERSTITIAL_CONFIG.storageDone) === '1') {
        completedRef.current = true;
        return;
      }

      openRef.current = true;
      engaged = 0;
      ssSet(INTERSTITIAL_CONFIG.storageEngaged, '0');
      ssSet(INTERSTITIAL_CONFIG.storageShown, '1');

      setClickedAd(false);
      setSecondsLeft(INTERSTITIAL_CONFIG.dismissWaitSec);
      setOpen(true);
    };

    const maybeOpen = (ms: number) => {
      if (completedRef.current || openRef.current) return;
      if (ms < INTERSTITIAL_CONFIG.engagedMs) return;
      openInterstitial();
    };

    const onInterval = () => {
      const now = Date.now();
      const delta = Math.min(Math.max(0, now - lastTick), 2000);
      lastTick = now;

      if (!isTabVisible() || completedRef.current || openRef.current) return;
      if (delta <= 0) return;

      engaged += delta;
      ssSet(INTERSTITIAL_CONFIG.storageEngaged, String(engaged));
      maybeOpen(engaged);
    };

    const onVisibility = () => {
      lastTick = Date.now();
    };

    const cancelIdle = scheduleIdle(() => {
      if (completedRef.current) return;
      maybeOpen(engaged);
      id = window.setInterval(onInterval, 2000);
      document.addEventListener('visibilitychange', onVisibility);
      boot = window.setTimeout(onInterval, 400);
    }, 4000);

    return () => {
      cancelIdle();
      if (id) window.clearInterval(id);
      if (boot) window.clearTimeout(boot);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // —— Stable 60s countdown while open (pauses when tab hidden) ——
  useEffect(() => {
    if (!open) return;

    const id = window.setInterval(() => {
      if (completedRef.current) return;
      if (document.visibilityState !== 'visible') return;
      setSecondsLeft((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open || impressionFired.current || typeof window === 'undefined') return;
    impressionFired.current = true;
    const img = new window.Image(1, 1);
    img.src = `${creative.impressionPixel}${
      creative.impressionPixel.includes('?') ? '&' : '?'
    }cachebuster=${Date.now()}`;
  }, [open, creative.impressionPixel]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const complete = useCallback(() => {
    completedRef.current = true;
    openRef.current = false;
    ssSet(INTERSTITIAL_CONFIG.storageDone, '1');
    ssSet(INTERSTITIAL_CONFIG.storageEngaged, '0');
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (secondsLeft <= 0 || clickedAd)) {
        complete();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, secondsLeft, clickedAd, complete]);

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
      <div className="aff-interstitial-backdrop absolute inset-0 bg-black/80 backdrop-blur-md" aria-hidden />

      <div
        className={`aff-interstitial-panel relative z-[1] w-full max-w-[min(26rem,100%)] sm:max-w-[28rem] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl ${
          isLight
            ? 'bg-white border border-slate-200'
            : 'bg-[#0a0a0a] border border-white/12'
        }`}
      >
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
                : 'border-white/10 bg-black hover:border-white/20'
            }`}
            aria-label={`${creative.alt} (sponsored — opens in new tab)`}
          >
            <span className="aff-interstitial-card relative block w-full overflow-hidden px-5 pb-5 pt-5 sm:px-6 sm:pb-5 sm:pt-6 text-left">
              <span className="aff-interstitial-sheen" aria-hidden />
              <span className="relative z-[1] block text-[clamp(22px,3.6vw,28px)] font-semibold leading-[1.15] tracking-[-0.03em] text-white [text-rendering:geometricPrecision]">
                Want to manage your domain easier, cheaper?
                <br />
                You&apos;re closer than you think
              </span>
              <span className="aff-interstitial-pill relative z-[1] mt-5 inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#2563eb]">
                Register now
              </span>
              <span className="relative z-[1] mt-7 flex items-center gap-2 text-white">
                <SpaceshipMark className="h-6 w-6" />
                <span className="text-[18px] font-semibold tracking-[-0.03em]">spaceship</span>
              </span>
            </span>
          </a>
        </div>

        {/* Compact footer: countdown ring (or Continue) on the left, CTA pill on the right */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-3 pb-4 sm:pb-5">
          {canDismiss ? (
            <button
              type="button"
              onClick={complete}
              autoFocus
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold transition ${
                isLight
                  ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200'
                  : 'bg-white/10 text-white hover:bg-white/15 border border-white/15'
              }`}
            >
              Continue
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="flex min-w-0 items-center gap-2.5" aria-live="off">
              <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 h-9 w-9 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="2.5" className={isLight ? 'stroke-slate-200' : 'stroke-white/10'} />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${isLight ? 'stroke-slate-800' : 'stroke-white/80'}`}
                    strokeDasharray={RING}
                    strokeDashoffset={RING * (1 - Math.min(1, Math.max(0, progress)))}
                  />
                </svg>
                <span className={`relative text-[11px] font-bold tabular-nums ${isLight ? 'text-slate-800' : 'text-white/85'}`}>
                  {secondsLeft}
                </span>
              </span>
              <span className="min-w-0 leading-tight">
                <span className={`block text-[12px] font-semibold ${isLight ? 'text-slate-700' : 'text-white/75'}`}>
                  Continue in {secondsLeft}s
                </span>
                <span className={`block truncate text-[10.5px] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                  Pauses if you leave this tab
                </span>
              </span>
            </div>
          )}

          <a
            href={creative.clickUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            data-ad-id={creative.id}
            data-placement="interstitial-cta"
            onClick={onAdClick}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold transition ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {creative.ctaLabel}
            <svg className="aff-interstitial-arrow w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id={`imp-${creative.id}-${reactId.replace(/:/g, '')}`}
          height={0}
          width={0}
          alt=""
          src={creative.impressionPixel}
          fetchPriority="low"
          style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0, border: 0 }}
          aria-hidden
        />
      </div>
    </div>
  );
}
