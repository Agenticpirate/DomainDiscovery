'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Optional extra classes on the <nav> only */
  className?: string;
}

/**
 * Visible page trail: Home › Tools › Current page
 * Prefer <PageBreadcrumb> so it sits in the standard rail under the fixed nav.
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const trail = useMemo(() => {
    if (!items.length) return [{ label: 'Home', href: '/' }] as BreadcrumbItem[];
    const first = items[0];
    if (first.label.toLowerCase() === 'home') return items;
    return [{ label: 'Home', href: '/' }, ...items];
  }, [items]);

  const linkCls = isLight
    ? 'text-ds-body hover:text-ds-ink transition-colors'
    : 'text-white/55 hover:text-white transition-colors';
  const currentCls = isLight
    ? 'text-ds-ink font-semibold'
    : 'text-white/90 font-semibold';
  const chevronCls = isLight ? 'text-ds-mute/80' : 'text-white/25';

  return (
    <nav
      aria-label="Breadcrumb"
      className={`page-breadcrumb flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] leading-none ${className}`}
    >
      {trail.map((item, index) => {
        const isLast = index === trail.length - 1;
        const isHome = index === 0 && item.label.toLowerCase() === 'home';

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <svg
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${chevronCls}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={`inline-flex items-center gap-1 truncate max-w-[11rem] sm:max-w-none font-medium ${linkCls}`}
              >
                {isHome && (
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                )}
                {item.label}
              </Link>
            ) : (
              <span
                className={`page-breadcrumb-current inline-flex items-center gap-1 truncate max-w-[16rem] sm:max-w-none ${currentCls}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {isHome && isLast && (
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                )}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/**
 * Full-width breadcrumb rail under the fixed nav.
 * Place as the first child of <main className={PAGE_MAIN_CLASS}>.
 */
export function PageBreadcrumb({
  items,
  className = '',
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <div className={`page-breadcrumb-bar page-gutter w-full ${className}`}>
      <div className="page-breadcrumb-inner mx-auto w-full max-w-7xl">
        <div className="page-breadcrumb-plate">
          <Breadcrumb items={items} />
        </div>
      </div>
    </div>
  );
}

/**
 * Layout constants re-exported for existing client-component imports.
 * Server Components MUST import these from '@/components/ui/pageChrome'
 * instead — importing them through this 'use client' module turns the
 * strings into client-reference objects ("[object Object]" classNames).
 */
export { PAGE_MAIN_CLASS, PAGE_GUTTER_CLASS } from './pageChrome';
