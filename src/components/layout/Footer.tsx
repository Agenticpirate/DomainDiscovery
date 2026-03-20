'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';
import { useTheme } from '@/contexts/ThemeContext';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const footerLinks = {
    'Find domain names': [
      { label: 'Domain name search', href: '/' },
      { label: 'Domain extensions', href: '/domain-extensions' },
      { label: 'Domain generator', href: '/generator' },
      { label: 'Premium domains', href: '/premium' },
      { label: 'Expired domains', href: '/expired' },
      { label: 'Bulk domain search', href: '/bulk-search' },
    ],
    'Tools': [
      { label: 'Brandable name generator', href: '/tools/brandable' },
      { label: 'MCP Server', href: '/tools/mcp' },
      { label: 'Keyword', href: '/tools/keyword' },
      { label: 'WHOIS', href: '/tools/whois' },
      { label: 'Bulk domain search', href: '/bulk-search' },
    ],
    'Resources': [
      { label: 'Learn', href: '/learn' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact us', href: '/contact' },
    ],
    'Legal': [
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-9">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="lg:col-span-1 col-span-2">
            <Link href="/" className="inline-block mb-2">
              <Logo size="sm" showText={true} />
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.68)' }}>
              Instant domain search with real-time availability checking.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2.5" style={{ color: 'var(--text-primary)' }}>{category}</h3>
              <ul className="space-y-1 sm:space-y-1.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[11px] sm:text-sm transition-colors duration-200 hover:underline underline-offset-4"
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

        <div className={`pt-3 sm:pt-5 border-t ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
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
