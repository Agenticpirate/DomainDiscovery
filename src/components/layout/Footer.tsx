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

  const footerLinks = {
    'Find domain names': [
      { label: 'Domain name search', href: '/' },
      { label: 'Domain extensions', href: '/domain-extensions' },
      { label: 'Domain generator', href: '/generator' },
      { label: 'Bulk domain search', href: '/bulk-search' },
    ],
    'Tools': [
      { label: 'Brandable name generator', href: '/tools/brandable' },
      { label: 'Keyword domains', href: '/tools/keyword' },
      { label: 'Price comparison', href: '/tools/compare' },
      { label: 'Bulk domain search', href: '/bulk-search' },
    ],
    'Resources': [
      { label: 'Learn', href: '/learn' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact us', href: '/contact' },
    ],
    'Legal': [
      { label: 'Manifesto', href: '/manifesto' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className={`relative border-t backdrop-blur-xl ${
      isLight
        ? 'border-slate-200 bg-white/80'
        : 'border-white/[0.08] bg-black/40'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-7">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5 mb-4 sm:mb-6">
          <div className="lg:col-span-1 col-span-2">
            <Link href="/" className="inline-block mb-1.5">
              <Logo size="sm" showText={true} />
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.68)' }}>
              Instant domain search with real-time availability checking.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'var(--text-primary)' }}>{category}</h3>
              <ul className="space-y-0.5 sm:space-y-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[11px] sm:text-[13px] transition-colors duration-200 hover:underline underline-offset-4"
                      style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.72)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`pt-3 sm:pt-4 border-t ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-[11px] sm:text-sm" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}>
              &copy; {currentYear} DomainDiscovery. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              {['Terms', 'Privacy', 'Contact'].map((label) => (
                <Link
                  key={label}
                  href={`/${label.toLowerCase()}`}
                  className="text-[11px] sm:text-sm transition-colors hover:underline underline-offset-4"
                  style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.56)' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
