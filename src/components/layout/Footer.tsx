'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import { SITE_BRAND } from '@/lib/seoSiteFacts';
import { AffiliateAdBanner } from '@/components/ads/AffiliateAdBanner';
import { isLabAutomation, prefersReducedMotion } from '@/lib/perfRuntime';

const ParticleText = dynamic(
  () => import('../ui/ParticleText').then((m) => m.ParticleText),
  { ssr: false }
);
const EvervaultHover = dynamic(
  () => import('../ui/EvervaultHover').then((m) => m.EvervaultHover),
  { ssr: false }
);

const BRAND = SITE_BRAND.name;

type IconProps = { className?: string };

/** Compact stroke icons for footer rows */
const Fi = {
  search: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m16 16 4 4" />
    </svg>
  ),
  bolt: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3 4 14h7l-1 7 9-11h-7l1-7z" />
    </svg>
  ),
  spark: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" d="M12 3.5 13.8 9h5.7l-4.6 3.3 1.8 5.5L12 14.7 7.3 17.8l1.8-5.5L4.5 9h5.7L12 3.5Z" />
    </svg>
  ),
  layers: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinejoin="round" d="m4 8 8-4 8 4-8 4-8-4Zm0 5 8 4 8-4M4 18l8 4 8-4" />
    </svg>
  ),
  globe: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M3.5 12h17M12 3.75c2.2 2.4 3.4 5.1 3.4 8.25S14.2 17.85 12 20.25C9.8 17.85 8.6 15.15 8.6 12S9.8 6.15 12 3.75Z" />
    </svg>
  ),
  external: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V14M14 5h5v5M19 5l-8 8" />
    </svg>
  ),
  info: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
    </svg>
  ),
  dollar: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 7.5v9M14.4 9.2c0-.9-.9-1.5-2.4-1.5s-2.4.6-2.4 1.5.9 1.4 2.4 1.6 2.4.7 2.4 1.6-.9 1.5-2.4 1.5-2.4-.6-2.4-1.5" />
    </svg>
  ),
  keyword: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" d="M4 7h12M4 12h8M4 17h10M15 12l3-3m0 0 3 3m-3-3v10" />
    </svg>
  ),
  book: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinejoin="round" d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5V5.5Z" />
      <path strokeLinecap="round" d="M5 18.5A2.5 2.5 0 0 1 7.5 16H19" />
    </svg>
  ),
  help: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M9.5 9.5a2.5 2.5 0 1 1 3.8 2.1c-.9.5-1.3 1-1.3 2.1M12 16.5h.01" />
    </svg>
  ),
  badge: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinejoin="round" d="M12 3.5 14.2 9h5.8l-4.7 3.4 1.8 5.6L12 14.8 6.9 18l1.8-5.6L4 9h5.8L12 3.5Z" />
    </svg>
  ),
  pen: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5.5 18.5 9.5M5 19l1.6-6.2L16.2 3.2a2 2 0 0 1 2.8 0l1.8 1.8a2 2 0 0 1 0 2.8L11.2 17.4 5 19Z" />
    </svg>
  ),
  mail: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path strokeLinecap="round" d="m5 8 7 5 7-5" />
    </svg>
  ),
  shield: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinejoin="round" d="M12 3.5 19.5 6.5v5.2c0 4.3-2.9 7.5-7.5 9.3-4.6-1.8-7.5-5-7.5-9.3V6.5L12 3.5Z" />
    </svg>
  ),
  file: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinejoin="round" d="M8 3.5h5.5L18.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5Z" />
      <path strokeLinecap="round" d="M13.5 3.5V8h4.5" />
    </svg>
  ),
  cookie: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinejoin="round" d="M12 3.5a8.5 8.5 0 1 0 8.3 10.4 3.2 3.2 0 0 1-3.8-3.8A3.2 3.2 0 0 1 12 3.5Z" />
      <circle cx="9" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  ),
  alert: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinejoin="round" d="M12 4.5 3.8 18.5h16.4L12 4.5Z" />
      <path strokeLinecap="round" d="M12 10v4M12 16.5h.01" />
    </svg>
  ),
};

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  Icon: (p: IconProps) => React.ReactElement;
};

type FooterSection = {
  category: string;
  links: FooterLink[];
};

const FOOTER_SECTIONS: FooterSection[] = [
  {
    category: 'Product',
    links: [
      { label: 'Domain Search', href: '/search', Icon: Fi.search },
      { label: 'AI Assistant', href: '/assistant', Icon: Fi.bolt },
      { label: 'AI Generator', href: '/generator', Icon: Fi.spark },
      { label: 'Bulk Search', href: '/bulk-search', Icon: Fi.layers },
      { label: 'Extensions', href: '/domain-extensions', Icon: Fi.globe },
      {
        label: 'ADA site',
        href: 'https://www.aidomainassistant.com',
        external: true,
        Icon: Fi.external,
      },
    ],
  },
  {
    category: 'Tools',
    links: [
      { label: 'WHOIS', href: '/tools/whois', Icon: Fi.info },
      { label: 'Geo Domains', href: '/tools/geo', Icon: Fi.globe },
      { label: 'Price Compare', href: '/tools/compare', Icon: Fi.dollar },
      { label: 'Keyword Domains', href: '/tools/keyword', Icon: Fi.keyword },
    ],
  },
  {
    category: 'Learn',
    links: [
      { label: 'All guides', href: '/learn', Icon: Fi.book },
      { label: 'FAQ', href: '/faq', Icon: Fi.help },
      { label: 'What is DD?', href: '/learn/what-is-domaindiscovery', Icon: Fi.badge },
      { label: 'For AI / LLMs', href: '/for-ai', Icon: Fi.bolt },
    ],
  },
  {
    category: 'Company',
    links: [
      { label: 'Blog', href: '/blog', Icon: Fi.pen },
      { label: 'Contact', href: '/contact', Icon: Fi.mail },
      { label: 'Privacy', href: '/privacy', Icon: Fi.shield },
      { label: 'Terms', href: '/terms', Icon: Fi.file },
      { label: 'Cookies', href: '/cookies', Icon: Fi.cookie },
      { label: 'Disclaimer', href: '/disclaimer', Icon: Fi.alert },
    ],
  },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = React.useState(false);
  const [showParticles, setShowParticles] = React.useState(false);
  const brandBandRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Particle canvas only when brand band is near viewport — never in lab tools
  React.useEffect(() => {
    if (!mounted) return;
    if (isLabAutomation() || prefersReducedMotion()) return;
    const el = brandBandRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShowParticles(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowParticles(true);
          io.disconnect();
        }
      },
      { rootMargin: '120px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  const { theme } = useTheme();
  const isLight = mounted ? theme === 'light' : false;

  const solidBg = isLight ? 'bg-gradient-to-b from-indigo-50 via-sky-50/80 to-violet-50/50' : 'bg-[#050505]';
  const hairline = isLight ? 'border-indigo-200/70' : 'border-white/[0.06]';
  const muted = isLight ? '#64748b' : 'rgba(255,255,255,0.45)';
  const faint = isLight ? '#818cf8' : 'rgba(255,255,255,0.35)';
  const link = isLight
    ? 'text-slate-600 hover:text-slate-900'
    : 'text-white/60 hover:text-white';

  const mobilePanel = isLight
    ? 'border-slate-200/90 bg-white shadow-[0_12px_36px_-20px_rgba(15,23,42,0.22)]'
    : 'border-white/[0.09] bg-[#0a0a0c] shadow-[0_20px_48px_-28px_rgba(0,0,0,0.95)]';
  const mobileCellBorder = isLight ? 'border-slate-100' : 'border-white/[0.06]';
  const iconWell = isLight
    ? 'border-slate-200/90 bg-slate-50 text-slate-600'
    : 'border-white/[0.08] bg-[#121214] text-white/70';
  const mobileLabel = isLight ? 'text-slate-800' : 'text-white/88';
  const mobileMutedLabel = isLight ? 'text-slate-400' : 'text-white/32';

  const linkContent = (item: FooterLink, mobile: boolean) => {
    if (mobile) {
      return (
        <>
          <span
            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${iconWell}`}
          >
            <item.Icon className="h-3 w-3" />
          </span>
          <span className={`min-w-0 flex-1 truncate text-[10.5px] font-semibold leading-tight ${mobileLabel}`}>
            {item.label}
          </span>
        </>
      );
    }
    return item.label;
  };

  const renderLink = (item: FooterLink, className: string, mobile: boolean) => {
    const inner = linkContent(item, mobile);
    if (item.external) {
      return (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={item.href} className={className}>
        {inner}
      </Link>
    );
  };

  return (
    <footer className={`relative overflow-hidden border-t ${hairline} ${solidBg}`}>
      {/* Sitewide Spacemail strip — sharp 668×105 (1825519), not stretched 320×50 */}
      <div className={`relative z-[3] border-b ${hairline} ${solidBg}`}>
        <div className="max-w-2xl mx-auto px-3 sm:px-5 py-3 sm:py-4 flex justify-center">
          <AffiliateAdBanner placement="footer" variant="card" />
        </div>
      </div>
      <div className={`relative z-[2] ${solidBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-5 pt-3.5 sm:pt-7 pb-3 sm:pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-8">
            {/* Brand */}
            <div className="sm:max-w-[15rem] shrink-0">
              <Link href="/" className="inline-flex items-center mb-1 sm:mb-2">
                <Logo size="md" showText />
              </Link>
              <p
                className="text-[10.5px] sm:text-[12px] leading-snug mb-1.5 sm:mb-2 max-w-[17rem]"
                style={{ color: muted }}
              >
                Free domain search &amp; tools. Local shortlists. Not a registrar.
              </p>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[8.5px] sm:text-[9px] font-bold uppercase tracking-[0.12em] sm:tracking-wide border ${
                  isLight
                    ? 'bg-white text-slate-600 border-slate-200 shadow-sm'
                    : 'bg-[#121214] text-white/65 border-white/12'
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${isLight ? 'bg-slate-500' : 'bg-white/55'}`}
                />
                Local · Private · Free
              </div>
            </div>

            {/* ── Mobile: premium icon menu ── */}
            <div className={`sm:hidden relative w-full overflow-hidden rounded-2xl border ${mobilePanel}`}>
              {/* Top sheen */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background: isLight
                    ? 'linear-gradient(90deg, transparent, rgba(15,23,42,0.12), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background: isLight
                    ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(248,250,252,0.9), transparent 70%)'
                    : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.04), transparent 70%)',
                }}
              />

              <div className="relative z-[1] grid grid-cols-2">
                {FOOTER_SECTIONS.map((section, idx) => {
                  const isRight = idx % 2 === 1;
                  const isBottom = idx >= 2;
                  return (
                    <div
                      key={section.category}
                      className={`min-w-0 px-2 pt-2.5 pb-2 ${
                        isRight ? '' : `border-r ${mobileCellBorder}`
                      } ${isBottom ? '' : `border-b ${mobileCellBorder}`}`}
                    >
                      <p
                        className={`mb-1.5 px-0.5 text-[8px] font-black uppercase tracking-[0.18em] ${mobileMutedLabel}`}
                      >
                        {section.category}
                      </p>
                      <ul className="space-y-0.5">
                        {section.links.map((item) => (
                          <li key={`${section.category}-${item.href}-${item.label}`}>
                            {renderLink(
                              item,
                              'group flex items-center gap-1.5 rounded-lg px-0.5 py-[3px] transition-colors active:opacity-80',
                              true
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTA strip */}
              <div
                className={`relative z-[1] flex items-center justify-between gap-2 border-t px-2.5 py-2 ${
                  isLight
                    ? 'border-slate-100 bg-gradient-to-r from-slate-50 to-white'
                    : 'border-white/[0.06] bg-gradient-to-r from-[#0c0c0e] to-[#0a0a0c]'
                }`}
              >
                <span className={`flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] ${mobileMutedLabel}`}>
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-md border ${iconWell}`}
                  >
                    <Fi.shield className="h-2.5 w-2.5" />
                  </span>
                  Free · No account
                </span>
                <Link
                  href="/search"
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-900 shadow-sm'
                      : 'border-white/12 bg-white text-black shadow-[0_4px_12px_-4px_rgba(255,255,255,0.15)]'
                  }`}
                >
                  <Fi.search className="h-3 w-3" />
                  Search
                  <span aria-hidden className="text-[11px] font-light opacity-50">
                    ›
                  </span>
                </Link>
              </div>
            </div>

            {/* ── Desktop: 4 columns + subtle icons ── */}
            <div className="hidden sm:grid grid-cols-4 gap-6 flex-1 sm:max-w-3xl">
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.category} className="min-w-0">
                  <h3
                    className="text-[11px] font-bold mb-2 tracking-wide uppercase"
                    style={{ color: faint }}
                  >
                    {section.category}
                  </h3>
                  <ul className="space-y-1.5">
                    {section.links.map((item) => (
                      <li key={`${section.category}-${item.href}-${item.label}`}>
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group inline-flex items-center gap-1.5 text-[12px] font-medium leading-snug transition-colors ${link}`}
                          >
                            <item.Icon className="h-3.5 w-3.5 opacity-50 group-hover:opacity-80 shrink-0" />
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className={`group inline-flex items-center gap-1.5 text-[12px] font-medium leading-snug transition-colors ${link}`}
                          >
                            <item.Icon className="h-3.5 w-3.5 opacity-50 group-hover:opacity-80 shrink-0" />
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand band — larger premium wordmark; particle FX when in view */}
      <div
        ref={brandBandRef}
        className={`relative z-[1] min-h-[10.5rem] sm:min-h-[15rem] md:min-h-[17rem] border-t overflow-hidden ${hairline}`}
      >
        {/* Ambient depth — soft vignette + brand glow for premium feel */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: isLight
              ? 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(148,163,184,0.16) 0%, rgba(14,165,233,0.05) 38%, transparent 72%)'
              : 'radial-gradient(ellipse 90% 75% at 50% 42%, rgba(255,255,255,0.07) 0%, rgba(148,163,184,0.04) 36%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
          aria-hidden
          style={{
            background: isLight
              ? 'linear-gradient(90deg, transparent, rgba(100,116,139,0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
          }}
        />

        {mounted && showParticles ? (
          <EvervaultHover className="w-full" radius={360}>
            <div className="relative z-[1] max-w-7xl mx-auto px-3 sm:px-6 pt-6 sm:pt-10 pb-5 sm:pb-8 flex flex-col items-center justify-center overflow-hidden">
              <ParticleText
                key={`footer-particle-${isLight ? 'l' : 'd'}`}
                text={BRAND}
                height={212}
                className="w-full max-w-full"
              />
              <div className="mt-1.5 sm:mt-3 flex w-full max-w-lg items-center justify-center gap-3 sm:gap-4 px-6">
                <span
                  aria-hidden
                  className={`h-px flex-1 bg-gradient-to-r from-transparent ${isLight ? 'to-slate-300' : 'to-white/20'}`}
                />
                <p
                  className={`shrink-0 text-center text-[10px] sm:text-[12px] font-semibold tracking-[0.18em] sm:tracking-[0.22em] uppercase ${
                    isLight ? 'text-slate-500/80' : 'text-white/40'
                  }`}
                >
                  Domain research · Built for builders
                </p>
                <span
                  aria-hidden
                  className={`h-px flex-1 bg-gradient-to-l from-transparent ${isLight ? 'to-slate-300' : 'to-white/20'}`}
                />
              </div>
            </div>
          </EvervaultHover>
        ) : (
          <div className="relative z-[1] flex min-h-[10.5rem] sm:min-h-[15rem] md:min-h-[17rem] flex-col items-center justify-center gap-2 sm:gap-3 px-4 py-8 sm:py-10">
            <p
              className={`text-center text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.03em] leading-none select-none ${
                isLight
                  ? 'bg-gradient-to-b from-slate-700 via-indigo-600 to-slate-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-b from-white via-white/85 to-white/25 bg-clip-text text-transparent'
              }`}
              style={{
                textShadow: isLight ? undefined : '0 0 80px rgba(255,255,255,0.12)',
              }}
            >
              {BRAND}
            </p>
            <div className="flex w-full max-w-lg items-center justify-center gap-3 sm:gap-4 px-6">
              <span
                aria-hidden
                className={`h-px flex-1 bg-gradient-to-r from-transparent ${isLight ? 'to-slate-300' : 'to-white/20'}`}
              />
              <p
                className={`shrink-0 text-center text-[10px] sm:text-[12px] font-semibold tracking-[0.18em] sm:tracking-[0.22em] uppercase ${
                  isLight ? 'text-slate-500/80' : 'text-white/40'
                }`}
              >
                Domain research · Built for builders
              </p>
              <span
                aria-hidden
                className={`h-px flex-1 bg-gradient-to-l from-transparent ${isLight ? 'to-slate-300' : 'to-white/20'}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Legal bar */}
      <div className={`relative z-[2] border-t ${hairline} ${solidBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-1.5 sm:py-3 flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-2">
          <p className="text-[9px] sm:text-[10px] text-center sm:text-left" style={{ color: faint }}>
            &copy; {currentYear} {SITE_BRAND.name}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 sm:gap-x-4 sm:gap-y-1">
            {[
              { label: 'Terms', href: '/terms' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Cookies', href: '/cookies' },
              { label: 'Disclaimer', href: '/disclaimer' },
              { label: 'Contact', href: '/contact' },
              { label: 'Sitemap', href: '/sitemap.xml' },
              { label: 'For AI', href: '/for-ai' },
              { label: 'llms.txt', href: '/llms.txt' },
              { label: 'llms-full', href: '/llms-full.txt' },
              { label: 'RSS', href: '/feed.xml' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[9px] sm:text-[10px] transition-colors hover:underline underline-offset-4 ${
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/35 hover:text-white/65'
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
