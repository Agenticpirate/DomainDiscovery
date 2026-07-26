'use client';

import React from 'react';
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
 * Inner trail control. Prefer <PageBreadcrumb> so position matches every route.
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <nav
      aria-label="Breadcrumb"
      className={`page-breadcrumb flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] leading-none ${
        isLight ? 'text-slate-400' : 'text-white/45'
      } ${className}`}
    >
      <Link
        href="/"
        className={`inline-flex shrink-0 items-center justify-center rounded-md p-0.5 transition-colors ${
          isLight ? 'hover:text-indigo-700' : 'hover:text-white'
        }`}
        aria-label="Home"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <svg
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isLight ? 'text-slate-300' : 'text-white/25'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={`truncate max-w-[10rem] sm:max-w-none transition-colors ${
                  isLight ? 'hover:text-indigo-700' : 'hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`page-breadcrumb-current truncate max-w-[14rem] sm:max-w-none font-medium ${
                  isLight ? 'text-indigo-600' : 'text-white/80'
                }`}
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
 * Full-width breadcrumb rail — ALWAYS the same X/Y under the fixed nav.
 * Place as the first child of <main className={PAGE_MAIN_CLASS}>.
 * Do not nest inside narrower max-w-* content columns.
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
        <Breadcrumb items={items} />
      </div>
    </div>
  );
}

/** Standard main top offset under fixed nav */
export const PAGE_MAIN_CLASS = 'relative page-main';

/** Standard horizontal padding for content bands */
export const PAGE_GUTTER_CLASS = 'page-gutter';
