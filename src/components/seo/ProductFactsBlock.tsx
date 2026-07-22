'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { SITE_BRAND, SITE_PRODUCT_FACTS } from '@/lib/seoSiteFacts';

type Props = {
  /** Where the block is used — tweaks density */
  variant?: 'footer' | 'page';
  className?: string;
};

/**
 * Canonical product facts for humans + LLMs (~150 words).
 * Keep in sync with SITE_PRODUCT_FACTS — do not invent metrics.
 */
export function ProductFactsBlock({ variant = 'page', className = '' }: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;
  const isFooter = variant === 'footer';

  return (
    <section
      className={className}
      aria-labelledby="product-facts-heading"
      data-product-facts="domaindiscovery"
    >
      <h2
        id="product-facts-heading"
        className={
          isFooter
            ? `text-[11px] sm:text-[12px] font-bold mb-2 tracking-wide uppercase ${
                isLight ? 'text-slate-400' : 'text-white/38'
              }`
            : `text-lg sm:text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`
        }
      >
        {isFooter ? 'About' : `What is ${SITE_BRAND.name}?`}
      </h2>
      <p
        className={
          isFooter
            ? `text-[12px] sm:text-[13px] leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-white/50'
              }`
            : `text-sm sm:text-[15px] leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-white/60'
              }`
        }
      >
        {SITE_PRODUCT_FACTS}
      </p>
      {!isFooter && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/learn/what-is-domaindiscovery"
            className={`text-xs sm:text-sm font-semibold underline-offset-2 hover:underline ${
              isLight ? 'text-slate-800' : 'text-white/80'
            }`}
          >
            Brand guide →
          </Link>
          <Link
            href="/llms.txt"
            className={`text-xs sm:text-sm font-semibold underline-offset-2 hover:underline ${
              isLight ? 'text-slate-500' : 'text-white/45'
            }`}
          >
            llms.txt
          </Link>
        </div>
      )}
      {isFooter && (
        <p className={`mt-2 text-[11px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
          <Link href="/learn/what-is-domaindiscovery" className="underline-offset-2 hover:underline">
            What is DomainDiscovery?
          </Link>
          {' · '}
          <Link href="/llms.txt" className="underline-offset-2 hover:underline">
            llms.txt
          </Link>
        </p>
      )}
    </section>
  );
}
