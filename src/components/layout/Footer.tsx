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
        ? 'border-gray-200 bg-white/60'
        : 'border-white/[0.08] bg-black/40'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Logo size="md" showText={true} />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              Instant domain search with real-time availability checking.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-bold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`pt-8 border-t ${isLight ? 'border-gray-200' : 'border-white/[0.08]'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              &copy; {currentYear} DomainsDiscovery. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Terms', 'Privacy', 'Contact'].map((label) => (
                <Link
                  key={label}
                  href={`/${label.toLowerCase()}`}
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}
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
