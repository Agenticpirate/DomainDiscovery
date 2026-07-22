'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';
import { ParticleText } from '../ui/ParticleText';
import { DottedGlowBackground } from '../ui/DottedGlowBackground';
import { EvervaultHover } from '../ui/EvervaultHover';
import { ProductFactsBlock } from '@/components/seo/ProductFactsBlock';
import { useTheme } from '@/contexts/ThemeContext';
import { SITE_BRAND } from '@/lib/seoSiteFacts';

const BRAND = SITE_BRAND.name;

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { theme } = useTheme();
  const isLight = mounted ? theme === 'light' : false;

  const footerLinks: Record<string, { label: string; href: string }[]> = {
    Product: [
      { label: 'Domain Search', href: '/search' },
      { label: 'AI Generator', href: '/generator' },
      { label: 'Bulk Search', href: '/bulk-search' },
      { label: 'Extensions', href: '/domain-extensions' },
      { label: 'Price Compare', href: '/tools/compare' },
    ],
    Tools: [
      { label: 'WHOIS Lookup', href: '/tools/whois' },
      { label: 'Keyword Domains', href: '/tools/keyword' },
      { label: 'Geo Domain Generator', href: '/tools/geo' },
      { label: 'Domain Value', href: '/tools/value' },
    ],
    Learn: [
      { label: 'Domain name search guide', href: '/learn/domain-name-search-guide' },
      { label: 'How to register a domain', href: '/learn/how-to-register-a-domain' },
      { label: 'Domain registration explained', href: '/learn/domain-registration-explained' },
      { label: 'Geo domains for local SEO', href: '/learn/geo-domains-local-seo' },
      { label: 'WHOIS lookup guide', href: '/learn/whois-lookup-guide' },
      { label: 'Bulk domain search', href: '/learn/bulk-domain-search-guide' },
      { label: 'What is a TLD?', href: '/learn/what-is-a-tld-domain-extension' },
      { label: 'What is DomainDiscovery?', href: '/learn/what-is-domaindiscovery' },
      { label: 'All guides', href: '/learn' },
      { label: 'FAQ', href: '/faq' },
    ],
    Company: [
      { label: 'Blog & TLD encyclopedia', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  };

  // Solid surfaces: light matches page bg for seamless sync; dark keeps ink black
  const solidBg = isLight ? 'bg-[#f5f7fa]' : 'bg-[#050505]';
  const hairline = isLight ? 'border-slate-200/80' : 'border-white/[0.06]';

  return (
    <footer className={`relative overflow-hidden border-t ${hairline} ${solidBg}`}>
      {/* —— Menu + brand (solid — never mixed into animation) —— */}
      <div className={`relative z-[2] ${solidBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-5 pt-7 sm:pt-11 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 sm:gap-10 mb-0">
            <div className="max-w-xs">
              <Link href="/" className="inline-block mb-2.5">
                <Logo size="md" showText />
              </Link>
              <p
                className="text-[12px] sm:text-[13px] leading-relaxed mb-3"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
              >
                {SITE_BRAND.tagline}. Also known as Domain Discovery or Domains Discovery. Live availability,
                AI names, geo domains, WHOIS, bulk checks, and price compare — shortlists stay on your device.
                Not a registrar checkout.
              </p>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border ${
                  isLight
                    ? 'bg-white text-slate-600 border-slate-200 shadow-sm'
                    : 'bg-white/[0.04] text-white/70 border-white/12'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLight ? 'bg-slate-500' : 'bg-white/55'
                  }`}
                />
                Local · Private · Free
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 flex-1 sm:max-w-3xl sm:pt-1">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h3
                    className="text-[11px] sm:text-[12px] font-bold mb-2.5 sm:mb-3 tracking-wide uppercase"
                    style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.38)' }}
                  >
                    {category}
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {links.map((link) => (
                      <li key={`${category}-${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          className={`text-[11px] sm:text-[13px] font-medium transition-colors ${
                            isLight
                              ? 'text-slate-600 hover:text-slate-900'
                              : 'text-white/65 hover:text-white'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Canonical product facts for humans + LLM crawlers (~150 words) */}
          <div className={`mt-8 sm:mt-10 pt-6 border-t ${hairline}`}>
            <div className="max-w-3xl">
              <ProductFactsBlock variant="footer" />
            </div>
          </div>
        </div>
      </div>

      {/* —— Brand band: dots → Evervault matrix spotlight → brand particles —— */}
      <div className={`relative z-[1] border-t ${hairline}`}>
        <DottedGlowBackground
          gap={18}
          radius={1.2}
          opacity={isLight ? 0.12 : 0.16}
          speedMin={0.22}
          speedMax={0.65}
          speedScale={0.5}
        />
        <EvervaultHover className="w-full" radius={280}>
          <div className="relative z-[1] max-w-6xl mx-auto px-2 sm:px-4 py-7 sm:py-12 flex items-center justify-center">
            <ParticleText text={BRAND} height={200} className="w-full" />
          </div>
        </EvervaultHover>
      </div>

      {/* —— Legal bar —— */}
      <div className={`relative z-[2] border-t ${hairline} ${solidBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3.5 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
          <p
            className="text-[10px] sm:text-[11px] text-center sm:text-left"
            style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)' }}
          >
            &copy; {currentYear} DomainDiscovery. Built for private domain discovery.
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            {[
              { label: 'Terms', href: '/terms' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Contact', href: '/contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[10px] sm:text-[11px] transition-colors hover:underline underline-offset-4 ${
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
