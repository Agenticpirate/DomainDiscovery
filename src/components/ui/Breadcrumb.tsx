'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale } from '@/components/i18n/LocaleProvider';

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
  const { href: localize, messages } = useLocale();
  const isLight = theme === 'light';
  const homeLabel = messages.nav.home;

  const trail = useMemo(() => {
    const first = items[0];
    const firstHref = first?.href?.split('?')[0]?.split('#')[0] || '';
    const alreadyHome =
      !!first &&
      (firstHref === '/' ||
        first.label === homeLabel ||
        first.label.toLowerCase() === 'home');
    const withHome = !items.length
      ? ([{ label: homeLabel, href: '/' }] as BreadcrumbItem[])
      : alreadyHome
        ? items
        : ([{ label: homeLabel, href: '/' }, ...items] as BreadcrumbItem[]);
    return withHome.map((item) =>
      item.href ? { ...item, href: localize(item.href) } : item
    );
  }, [items, localize, homeLabel]);

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

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <svg
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${chevronCls}`}
                width="14"
                height="14"
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
                {item.label}
              </Link>
            ) : (
              <span
                className={`page-breadcrumb-current inline-flex items-center gap-1 truncate max-w-[16rem] sm:max-w-none ${currentCls}`}
                aria-current={isLast ? 'page' : undefined}
              >
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
 * Standard main top offset under fixed nav (see --nav-clearance in globals.css).
 * Do not stack extra pt-* here — that created a large empty gap under the header.
 */
export const PAGE_MAIN_CLASS = 'relative page-main';

/** Standard horizontal padding for content bands */
export const PAGE_GUTTER_CLASS = 'page-gutter';
