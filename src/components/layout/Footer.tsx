'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { theme } = useTheme();
  const isLight = mounted ? theme === 'light' : false;

  // Only routes that actually exist are linked here.
  const footerLinks: Record<string, { label: string; href: string }[]> = {
    'Find domains': [
      { label: 'Domain search', href: '/' },
      { label: 'Extensions', href: '/domain-extensions' },
      { label: 'Generator', href: '/generator' },
      { label: 'Bulk search', href: '/bulk-search' },
    ],
    'Tools': [
      { label: 'Brandable names', href: '/tools/brandable' },
      { label: 'Keyword domains', href: '/tools/keyword' },
      { label: 'Price comparison', href: '/tools/compare' },
      { label: 'Geo finder', href: '/tools/geo' },
      { label: 'WHOIS lookup', href: '/tools/whois' },
    ],
    'Resources': [
      { label: 'Learn', href: '/learn' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  };

  const linkColor = isLight ? '#64748b' : 'rgba(255,255,255,0.55)';

  return (
    <footer
      className={`relative border-t ${
        isLight ? 'border-slate-200 bg-white/70' : 'border-white/[0.06] bg-black/30'
      } backdrop-blur-xl`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-7 sm:py-14">
        <div className="lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          {/* Brand */}
          <div className="max-w-xs mb-6 lg:mb-0">
            <Link href="/" className="inline-block mb-2.5 sm:mb-3">
              <Logo size="sm" showText={true} />
            </Link>
            <p
              className="text-[12px] sm:text-[13px] leading-relaxed mb-3.5 sm:mb-5"
              style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.55)' }}
            >
              Instant domain search across 1,600+ extensions. Compare prices and register in one click.
            </p>
            <Link href="/" className="btn-accent px-4 py-1.5 sm:py-2 text-[12px]">
              Search free
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Link columns — two side-by-side on mobile, inline on desktop */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:contents">
            {Object.entries(footerLinks).map(([category, links]) => {
              const isResources = category === 'Resources';
              return (
                <div key={category} className={isResources ? 'col-span-2 lg:col-span-1' : ''}>
                  <h3
                    className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] mb-2.5 sm:mb-3"
                    style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)' }}
                  >
                    {category}
                  </h3>
                  <ul className={isResources ? 'grid grid-cols-2 gap-x-6 gap-y-2 lg:block lg:space-y-2.5' : 'space-y-2 sm:space-y-2.5'}>
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="footer-link text-[12px] sm:text-[13px] transition-colors duration-200"
                          style={{ color: linkColor }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className={`mt-6 sm:mt-12 pt-4 sm:pt-5 border-t ${
            isLight ? 'border-slate-200' : 'border-white/[0.06]'
          } flex flex-row items-center justify-between gap-3`}
        >
          <p className="text-[11px] sm:text-[12px]" style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)' }}>
            &copy; {currentYear} DomainDiscovery
          </p>
          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/terms"
              className="footer-link text-[11px] sm:text-[12px] transition-colors"
              style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.45)' }}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="footer-link text-[11px] sm:text-[12px] transition-colors"
              style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.45)' }}
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
