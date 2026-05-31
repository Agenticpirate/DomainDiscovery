'use client';

import React from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[40rem] max-w-[92vw] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 text-center max-w-lg">
        <div className="eyebrow mb-3">Something broke</div>
        <h1 className="display-2 mb-3" style={{ color: 'var(--text-primary)' }}>
          We hit an unexpected error
        </h1>
        <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          This one&apos;s on us. Try again, and if it keeps happening, head back home and
          we&apos;ll get you on track.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn-accent text-[14px]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try again
          </button>
          <Link href="/" className="btn-secondary text-[14px]">
            Go home
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-8 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
