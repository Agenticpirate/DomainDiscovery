'use client';

import React, { useEffect, useState } from 'react';

const X_PROFILE = 'https://x.com/Agenticpirate';
/** Stores the dismissal timestamp. The note comes back after DISMISS_MS. */
const STORAGE_KEY = 'dd-hero-note-dismissed-at';
const DISMISS_MS = 24 * 60 * 60 * 1000;

const AUDIENCES = ['Brands', 'Domain investors'];

/**
 * Dismissible sticky note pinned to the left of the hero (1280px and wider).
 * A dismissal is remembered for 24 hours, then the note returns.
 */
export function HeroStickyNote() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      const at = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
      if (!at || Date.now() - at > DISMISS_MS) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setLeaving(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* storage unavailable: dismissal lasts for this view only */
    }
    window.setTimeout(() => setVisible(false), 220);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Advertise with us"
      className="absolute left-2.5 top-44 z-[5] hidden w-[10rem] min-[1280px]:block min-[1440px]:left-5 min-[1440px]:w-[11.5rem]"
    >
      <div className={`sticky-card ${leaving ? 'sticky-card--out' : ''}`}>
        <span className="sticky-tape" aria-hidden />

        <div className="sticky-sheet sticky-paper px-3.5 pb-7 pt-5 min-[1440px]:px-4">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss note"
            className="absolute right-1.5 top-2 grid h-7 w-7 place-items-center rounded-full text-[#6b5710] transition-colors hover:bg-black/[0.08] hover:text-[#2c2306] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b5710]"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>

          <p className="flex items-center gap-1.5 pr-6 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f5c12]">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="home-live-dot absolute inset-0 rounded-full bg-emerald-600" />
            </span>
            Spot open
          </p>

          <p className="mt-2 text-[15px] font-semibold leading-snug tracking-[-0.015em]">
            Want to promote your brand or domains here?
          </p>
          <p className="mt-1.5 text-[12px] leading-snug text-[#54440f]">
            Put your name in front of people picking theirs.
          </p>

          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Who it is for">
            {AUDIENCES.map((a) => (
              <li
                key={a}
                className="rounded-full border border-[#6b5710]/25 bg-[#fff8d6]/45 px-2 py-0.5 text-[10.5px] font-medium text-[#54440f]"
              >
                {a}
              </li>
            ))}
          </ul>

          <a
            href={X_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#2c2306] px-3 text-[12px] font-semibold text-[#f3e7ae] transition-all hover:bg-black hover:pr-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c2306] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e6d58e]"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="min-[1440px]:hidden">Hit me up</span>
            <span className="hidden min-[1440px]:inline">Hit me up on X</span>
            <span aria-hidden className="hidden transition-transform group-hover:translate-x-0.5 min-[1440px]:inline">
              →
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <span className="sticky-fold" aria-hidden />
      </div>
    </aside>
  );
}
