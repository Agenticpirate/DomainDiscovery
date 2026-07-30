/**
 * Runtime helpers for Core Web Vitals / Lighthouse friendliness.
 * Lab tools (PSI, GTmetrix) fail with "No CPU idle period" when rAF/intervals never stop.
 */

/** True in Lighthouse, PageSpeed, GTmetrix, WebPageTest headless sessions. */
export function isLabAutomation(): boolean {
  if (typeof navigator === 'undefined') return false;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  const ua = navigator.userAgent || '';
  return /HeadlessChrome|Lighthouse|PageSpeed|GTmetrix|Chrome-Lighthouse|PTST|WebPageTest/i.test(
    ua
  );
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Schedule non-critical work after first paint / idle (best-effort). */
export function scheduleIdle(fn: () => void, timeoutMs = 2500): () => void {
  if (typeof window === 'undefined') return () => {};
  let cancelled = false;
  const run = () => {
    if (!cancelled) fn();
  };

  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(run, { timeout: timeoutMs });
    return () => {
      cancelled = true;
      w.cancelIdleCallback?.(id);
    };
  }

  const id = window.setTimeout(run, Math.min(timeoutMs, 1800));
  return () => {
    cancelled = true;
    window.clearTimeout(id);
  };
}
