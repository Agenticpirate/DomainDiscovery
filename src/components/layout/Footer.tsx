'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
    <footer className="relative border-t border-white/[0.08] bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Logo size="md" showText={true} />
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Instant domain search with real-time availability checking.
            </p>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-bold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">
              © {currentYear} DomainsDiscovery. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/contact"
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
