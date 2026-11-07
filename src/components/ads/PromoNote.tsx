import React from 'react';

type Props = {
  className?: string;
};

const X_PROFILE = 'https://x.com/Agenticpirate';

/**
 * One-line sticky note (footer). Same paper style as the hero note:
 * dotted grid, tape, folded corner. Links to the owner's X profile.
 */
export function PromoNote({ className = '' }: Props) {
  return (
    <aside className={`flex w-full justify-center ${className}`} aria-label="Advertise with us">
      <div
        className="relative max-w-full -rotate-[0.8deg] motion-reduce:rotate-0"
        style={{ filter: 'drop-shadow(0 1px 1px rgba(60,40,0,.18)) drop-shadow(0 8px 10px rgba(60,40,0,.16))' }}
      >
        <span className="sticky-tape !top-[-8px] !h-4 !w-12" aria-hidden />
        <p className="sticky-sheet sticky-paper flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-2.5 pr-7 text-[13px] leading-snug sm:text-[14px]">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a6414]">
            Advertise
          </span>
          <span className="font-medium">
            Want to promote your brand or domains here?{' '}
            <a
              href={X_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c2306]"
            >
              Hit me up on X
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </span>
        </p>
        <span className="sticky-fold" aria-hidden />
      </div>
    </aside>
  );
}
