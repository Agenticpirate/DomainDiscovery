'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LOCALES, persistLocaleChoice, type LocaleId } from '@/lib/i18n/locales';
import { preloadMessages } from '@/lib/i18n/loadMessages';
import { useLocale } from './LocaleProvider';

function warmCatalogs() {
  for (const item of LOCALES) preloadMessages(item.id);
}

export function LanguageSwitcher({
  className = '',
  compact = false,
}: {
  className?: string;
  /** Icon-only trigger. Used in the phone header so the wordmark is not clipped. */
  compact?: boolean;
}) {
  const pathname = usePathname() || '/';
  const { locale, messages, switchHref } = useLocale();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(warmCatalogs, { timeout: 800 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(warmCatalogs, 200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <details ref={detailsRef} className={`group relative ${className}`}>
      <summary
        className={
          compact
            ? 'flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl text-ds-body marker:content-none [&::-webkit-details-marker]:hidden'
            : 'flex min-h-[34px] cursor-pointer list-none items-center gap-1.5 rounded-lg border border-ds-hairline bg-white/[0.04] px-2.5 text-[12px] font-semibold text-ds-ink marker:content-none [.light_&]:bg-[#f4f5f5] [&::-webkit-details-marker]:hidden'
        }
        aria-label={`${messages.nav.language}: ${current.name}`}
        onPointerEnter={warmCatalogs}
        onFocus={warmCatalogs}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="shrink-0 text-ds-body">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.75 5.6 3.75 9S14.5 18.4 12 21c-2.5-2.6-3.75-5.6-3.75-9S9.5 5.6 12 3z" />
        </svg>
        {!compact && (
          <>
            <span className="hidden sm:inline">{messages.nav.language}</span>
            <span lang={current.htmlLang}>{current.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="shrink-0 text-ds-body transition-transform group-open:rotate-180">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </>
        )}
      </summary>
      <ul className="absolute right-0 z-[220] mt-1 max-h-[70vh] w-48 overflow-auto rounded-xl border border-ds-hairline bg-ds-canvas p-1 shadow-lg">
        {LOCALES.map((item) => {
          const active = item.id === locale;
          return (
            <li key={item.id}>
              <Link
                href={switchHref(item.id, pathname)}
                hrefLang={item.hreflang}
                lang={item.htmlLang}
                prefetch={false}
                aria-current={active ? 'true' : undefined}
                onPointerEnter={() => preloadMessages(item.id as LocaleId)}
                onClick={() => {
                  persistLocaleChoice(item.id);
                  preloadMessages(item.id);
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
                className={`block rounded-lg px-2.5 py-2 text-[13px] font-medium ${
                  active ? 'bg-ds-ink text-ds-canvas' : 'text-ds-ink hover:bg-ds-hairline/40'
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
