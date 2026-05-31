import React from 'react';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

interface RouteLoaderProps {
  /** Optional heading shown above the skeleton grid (defaults to a generic line). */
  label?: string;
  /** How many domain-row skeletons to render. Default 6. */
  rows?: number;
  /** Grid (default) for result tools, or stack for single-column tools. */
  layout?: 'grid' | 'stack';
}

/**
 * RouteLoader — the instant, branded fallback rendered by App Router `loading.tsx`
 * files while a route's client bundle compiles/streams. It mirrors the real page
 * chrome (nav offset, a title shimmer, a results skeleton) so navigation feels
 * seamless instead of showing a blank frozen frame.
 *
 * Token-driven and theme-aware via SkeletonLoader. Decorative and inert.
 */
export function RouteLoader({ label, rows = 6, layout = 'grid' }: RouteLoaderProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <main className="relative pt-[4.75rem] sm:pt-24" aria-busy="true" aria-live="polite">
        <section className="px-4 sm:px-6 pb-6">
          <div className="mx-auto max-w-5xl">
            {/* Title shimmer */}
            <div className="mb-6 text-center">
              <div
                className="mx-auto mb-3 h-8 w-64 max-w-[80%] rounded-lg animate-pulse"
                style={{ background: 'var(--icon-bg)' }}
              />
              <div
                className="mx-auto h-4 w-80 max-w-[90%] rounded animate-pulse"
                style={{ background: 'var(--icon-bg)' }}
              />
              <span className="sr-only">{label || 'Loading'}</span>
            </div>

            {/* Results skeleton */}
            {layout === 'grid' ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: rows }).map((_, i) => (
                  <SkeletonLoader key={i} variant="domain" />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-2.5">
                {Array.from({ length: rows }).map((_, i) => (
                  <SkeletonLoader key={i} variant="domain" />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RouteLoader;
