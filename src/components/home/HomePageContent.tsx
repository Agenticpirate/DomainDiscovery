'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { DomainTicker } from '@/components/home/DomainTicker';
import { StatsBar } from '@/components/home/StatsBar';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';

export const HomePageContent: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const faqSectionRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close FAQ on outside click / Escape — keeps layout calm
  React.useEffect(() => {
    if (openFaq === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenFaq(null);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const root = faqSectionRef.current;
      if (root && !root.contains(e.target as Node)) setOpenFaq(null);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [openFaq]);

  const isLight = mounted ? theme === 'light' : false;

  const features = [
    {
      icon: <Icons.Search />,
      title: 'Domain availability checker',
      description:
        'See whether a domain is free, registered, or premium as you type — across popular and niche extensions.',
      href: '/search',
      cta: 'Check availability',
      badge: null as string | null,
    },
    {
      icon: <Icons.Layers />,
      title: '1,600+ domain extensions',
      description:
        'Browse TLDs from .com and .ai to country codes and new gTLDs. Filter by use case and price signals.',
      href: '/domain-extensions',
      cta: 'Browse extensions',
      badge: '1,600+ TLDs',
    },
    {
      icon: <Icons.Magic />,
      title: 'AI domain name generator',
      description:
        'Turn a keyword into brandable, short name ideas with live availability — built for startups and local brands.',
      href: '/generator',
      cta: 'Generate names',
      badge: 'AI-Powered',
    },
  ];

  const tools = [
    {
      icon: <Icons.Sparkles />,
      title: 'AI Domain Generator',
      description: 'Brandable name ideas from a keyword with live availability.',
      href: '/generator',
      featured: true,
      badge: 'AI',
      cta: 'Generate Now',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Search />,
      title: 'Instant Domain Search',
      description: 'Live domain availability as you type across core TLDs.',
      href: '/search',
      badge: 'Real-time',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Layers />,
      title: 'Bulk Domain Search',
      description: 'Check up to 1,000 domains in one batch for portfolios.',
      href: '/bulk-search',
      badge: '1,000 at once',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Globe />,
      title: 'Domain Extensions',
      description: 'Explore 1,600+ TLDs and match extensions to your brand.',
      href: '/domain-extensions',
      badge: '1,600+ TLDs',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Dollar />,
      title: 'Price Comparison',
      description: 'Compare regular registrar pricing side by side before you buy.',
      href: '/tools/compare',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Info />,
      title: 'WHOIS Lookup',
      description: 'RDAP/WHOIS ownership, dates, and registration history.',
      href: '/tools/whois',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Globe />,
      title: 'Geo Domain Generator',
      description: 'City and country domain lists for local SEO campaigns.',
      href: '/tools/geo',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Search />,
      title: 'Keyword Domains',
      description: 'Expand keywords into brandable names with live checks.',
      href: '/tools/keyword',
      badge: '5K+',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Chart />,
      title: 'Domain Value Estimator',
      description: 'Quick appraisal signals for aftermarket and brandable names.',
      href: '/tools/value',
      badge: 'Appraisal',
      hideOnMobile: true,
    },
  ];

  const benefits = [
    {
      icon: <Icons.Magic />,
      title: 'Live results',
      description: 'Availability streams as you type — no full-page reloads.',
      highlight: false,
    },
    {
      icon: <Icons.Sparkles />,
      title: 'AI + geo tools',
      description: 'Brandable generators and city-level lists in one product.',
      highlight: false,
    },
    {
      icon: <Icons.Dollar />,
      title: 'Price clarity',
      description: 'Side-by-side registrar prices so you can buy with context.',
      highlight: false,
    },
    {
      icon: <Icons.Check />,
      title: 'Private shortlists',
      description: 'Saved domains stay in your browser unless a feature says otherwise.',
      highlight: true,
    },
    {
      icon: <Icons.Globe />,
      title: '1,600+ TLDs',
      description: 'From .com to niche and country-code extensions in one search.',
      highlight: false,
    },
    {
      icon: <Icons.Layers />,
      title: 'Mobile-ready',
      description: 'The same workflow on desktop, tablet, and phone.',
      highlight: false,
    },
  ];

  const extensions = [
    { ext: '.com', desc: 'Popular' },
    { ext: '.ai', desc: 'AI & Tech' },
    { ext: '.io', desc: 'Startups' },
    { ext: '.co', desc: 'Companies' },
    { ext: '.net', desc: 'Networks' },
    { ext: '.org', desc: 'Orgs' },
    { ext: '.app', desc: 'Apps' },
    { ext: '.xyz', desc: 'Creative' },
  ];

  const faqs = [
    {
      icon: <Icons.Globe />,
      question: 'What is a domain name?',
      answer:
        'A domain name is the human-readable address of a website (for example, domainsdiscovery.com). It maps to infrastructure on the internet so people can find and remember your brand. Use domain name search to check whether a name is still available to register.',
    },
    {
      icon: <Icons.Check />,
      question: 'How do I check if a domain name is available?',
      answer:
        'Enter the name in the search box above. DomainDiscovery runs a live availability check across 1,600+ extensions and shows free, registered, or premium-style outcomes so you can decide quickly.',
    },
    {
      icon: <Icons.Sparkles />,
      question: 'What free domain tools does DomainDiscovery include?',
      answer:
        'Instant domain search, AI domain generator, bulk domain checker (up to 1,000 names), geo domain generator for city/country lists, keyword domain finder, WHOIS/RDAP lookup, TLD browser, registrar price comparison, and a value estimator — no account required.',
    },
    {
      icon: <Icons.Search />,
      question: 'What if the domain I want is already taken?',
      answer:
        'Try another TLD (.net, .ai, .io, .co), generate brandable alternatives with the AI domain generator, expand keywords, or use geo patterns for local markets. Premium or aftermarket names may still be purchasable through a registrar.',
    },
    {
      icon: <Icons.Layers />,
      question: 'What is a TLD or domain extension?',
      answer:
        'A TLD (top-level domain) is the part after the final dot — .com, .org, .ai, .io, or a country code like .uk. .com remains the default for most brands; industry TLDs can signal niche. Browse the full catalog under Domain Extensions.',
    },
    {
      icon: <Icons.Globe />,
      question: 'What are geo domains and who needs them?',
      answer:
        'Geo domains combine a city, region, or country with a niche keyword (for example, plumber + London). Local businesses and agencies use them for local SEO and multi-location campaigns. Build lists with the Geo Domain Generator.',
    },
    {
      icon: <Icons.Dollar />,
      question: 'How do I compare domain prices and buy?',
      answer:
        'After you find an available name, open price comparison to see regular registration pricing across registrars, then complete checkout on the registrar you choose. You only pay the registrar — DomainDiscovery search tools are free.',
    },
    {
      icon: <Icons.Shield />,
      question: 'Is DomainDiscovery free? Do you store my searches?',
      answer:
        'Yes — core search and tools are free. Saved shortlists stay in your browser unless a feature explicitly says otherwise. You pay only when you register a domain with a third-party registrar.',
    },
  ];

  const chooseTips = [
    { title: 'Keep it short', desc: 'Aim for 6–14 characters for easy recall' },
    { title: 'Easy to spell', desc: 'Avoid complex or unusual spellings' },
    { title: 'Prefer .com', desc: 'Most recognized and trusted extension' },
    { title: 'Skip numbers & hyphens', desc: 'They cause confusion and typos' },
    { title: 'Make it brandable', desc: 'Reflect your identity and story' },
    { title: 'Check trademarks', desc: 'Avoid legal conflicts early' },
  ];

  const card = isLight
    ? 'shine-border bg-white border border-slate-200 shadow-sm shadow-slate-900/[0.03] hover:shadow-md hover:shadow-slate-900/[0.05]'
    : 'shine-border bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04]';

  const iconBox = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-700'
    : 'bg-white/[0.04] border-white/10 text-white/80';

  /** All tools share elevated treatment + silver border shine on hover */
  const toolCard = isLight
    ? 'shine-border bg-white border border-slate-200 shadow-sm shadow-slate-900/[0.03] hover:shadow-md hover:shadow-slate-900/[0.05] hover:-translate-y-0.5'
    : 'shine-border bg-gradient-to-b from-white/[0.055] to-white/[0.02] border border-white/[0.1] hover:from-white/[0.08] hover:to-white/[0.03] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]';

  const toolIcon = isLight
    ? 'bg-slate-100 border-slate-200 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
    : 'bg-white/[0.08] border-white/12 text-white/90 group-hover:bg-white group-hover:text-black group-hover:border-white';

  return (
    <div className="pb-1 sm:pb-2">
      {/* Social proof + stats — mobile full-width; desktop centered compact ticker */}
      <section className="section-shell space-y-2 sm:space-y-3 !mb-4 sm:!mb-8 !mt-0 sm:!max-w-[50rem]">
        <DomainTicker />
        <StatsBar />
      </section>

      {/* Features — desktop only (avoids duplicating tools list on mobile) */}
      <section className="hidden sm:block section-shell">
        <div className="text-center mb-2 sm:mb-4">
          <h2 className="section-title">Free domain name search &amp; tools</h2>
          <p className="section-sub max-w-xl mx-auto">
            Check domain availability, explore 1,600+ TLDs, and move from idea to shortlist with AI generation, bulk
            checks, geo lists, WHOIS, and price compare.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2.5">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`group rounded-lg sm:rounded-xl p-2 sm:p-3.5 transition-all duration-200 block ${card}`}
            >
              <div className="flex items-center gap-2.5 sm:block">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconBox}`}>
                  {feature.icon}
                </div>
                <div className="min-w-0 flex-1 sm:mt-2">
                  <div className="flex items-center gap-1.5 mb-0 sm:mb-1">
                    <h3 className="text-[12px] sm:text-[14px] font-bold leading-snug truncate sm:whitespace-normal">
                      {feature.title}
                    </h3>
                    {feature.badge && (
                      <span
                        className={`hidden sm:inline px-1.5 py-0.5 text-[9px] font-bold rounded-full border shrink-0 ${
                          isLight
                            ? 'border-slate-200 bg-slate-50 text-slate-600'
                            : 'border-white/10 bg-white/[0.04] text-white/60'
                        }`}
                      >
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className="hidden sm:block text-[12px] leading-relaxed mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {feature.description}
                  </p>
                  <span
                    className="hidden sm:inline-flex items-center gap-1 text-[12px] font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {feature.cta}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/*
        Mobile order: Tools → Why → Popular Extensions (keeps hero zone uncluttered)
        Desktop order: Tools → Popular Extensions → Why
      */}
      <div className="flex flex-col">
      {/* Tools — 2-col compact on mobile so hero stays primary */}
      <section className="section-shell order-1 !mb-5 sm:!mb-8">
        <div className="text-center mb-1.5 sm:mb-3.5">
          <h2 className="section-title">Domain tools for search, geo &amp; WHOIS</h2>
          <p className="hidden sm:block section-sub">
            Instant search, AI names, bulk checks, geo domains, extensions, pricing, and RDAP lookup
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2.5">
          {tools.map((tool, i) => (
            <Link
              key={tool.title}
              href={tool.href}
              className={`tool-card-enter group relative rounded-lg sm:rounded-xl px-2 py-2 sm:p-3.5 transition-all duration-300 items-center gap-1.5 sm:gap-2.5 min-h-0 sm:min-h-[4.75rem] overflow-hidden ${
                tool.hideOnMobile ? 'hidden lg:flex' : 'flex'
              } ${toolCard}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block ${
                  isLight
                    ? 'bg-gradient-to-br from-slate-100/80 via-transparent to-transparent'
                    : 'bg-gradient-to-br from-white/[0.06] via-transparent to-transparent'
                }`}
              />

              <div
                className={`relative flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border transition-all duration-300 ${toolIcon}`}
              >
                {tool.icon}
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="text-[10px] sm:text-[13px] font-bold leading-tight line-clamp-2 sm:truncate">
                    <span className="sm:hidden">
                      {tool.title
                        .replace(/^Domain /, '')
                        .replace(/ Domains?/g, '')
                        .replace(' Finder', '')}
                    </span>
                    <span className="hidden sm:inline">{tool.title}</span>
                  </h3>
                  {tool.badge && (
                    <span
                      className={`hidden sm:inline text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border ${
                        isLight
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-white/[0.06] text-white/60 border-white/10'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p
                  className="hidden sm:block text-[11px] leading-snug mt-0.5 line-clamp-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {tool.description}
                </p>
              </div>

              <svg
                className={`relative w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 ${
                  isLight
                    ? 'text-slate-300 group-hover:text-slate-600'
                    : 'text-white/25 group-hover:text-white/60'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Extensions — last on mobile (after Why); mid-page on desktop */}
      <section className="section-shell order-3 sm:order-2 !mt-2 sm:!mt-0 !mb-5 sm:!mb-8">
        <div className="flex items-end justify-between gap-2 mb-2 sm:mb-3">
          <div>
            <h2 className="section-title">Popular Extensions</h2>
            <p className="hidden sm:block section-sub">Choose from 1,600+ extensions. Find the perfect TLD.</p>
          </div>
          <Link
            href="/domain-extensions"
            className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-semibold shrink-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            View all
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2">
          {extensions.map((item) => (
            <Link
              key={item.ext}
              href={`/search?q=example${item.ext}`}
              className={`rounded-xl px-1 py-2.5 sm:py-2.5 text-center transition-all ${card}`}
            >
              <div className="text-[13px] sm:text-sm font-black tracking-tight">{item.ext}</div>
              <div className="text-[9px] sm:text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {item.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why — mobile bento; sits above Popular Extensions on mobile only */}
      <section className="section-shell order-2 sm:order-3 !pt-1 sm:!pt-0 !mb-4 sm:!mb-8">
        <div className="text-center mb-2.5 sm:mb-4">
          <h2 className="section-title">Why use DomainDiscovery for domain search?</h2>
          <p className="section-sub max-w-lg mx-auto px-1">
            Fast AI domain search that never harvests your data — saves stay local on your device.
          </p>
        </div>

        {/* —— Mobile bento (aligned tiles) —— */}
        <div className="sm:hidden grid grid-cols-2 gap-2">
          {/* Featured privacy tile — full width hero of the bento */}
          {(() => {
            const privacy = benefits.find((b) => b.highlight) ?? benefits[3];
            return (
              <div
                className={`shine-border col-span-2 relative overflow-hidden rounded-2xl p-3.5 border ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 shadow-sm'
                    : 'bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border-white/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                    }`}
                  >
                    {privacy.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <h3 className="text-[13px] font-bold leading-snug">{privacy.title}</h3>
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${
                          isLight
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-white/[0.08] text-white/70 border-white/15'
                        }`}
                      >
                        Local
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                      {privacy.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Four compact equal tiles */}
          {benefits
            .filter((b) => !b.highlight)
            .slice(0, 4)
            .map((benefit, i) => (
              <div
                key={benefit.title}
                className={`shine-border relative flex flex-col min-h-[7.25rem] rounded-2xl p-3 border ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-white/[0.03] border-white/10'
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border mb-2 ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-white/[0.06] border-white/12 text-white/90'
                  }`}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-[12px] font-bold leading-snug mb-1">{benefit.title}</h3>
                <p className="text-[10px] leading-snug mt-auto" style={{ color: 'var(--text-tertiary)' }}>
                  {benefit.description}
                </p>
              </div>
            ))}

          {/* Bottom full-width closer */}
          {(() => {
            const rest = benefits.filter((b) => !b.highlight);
            const last = rest[4] ?? rest[rest.length - 1];
            if (!last || rest.length < 5) return null;
            return (
              <div
                className={`col-span-2 relative overflow-hidden rounded-2xl p-3 border flex items-center gap-3 ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-white/[0.06] border-white/12 text-white/90'
                  }`}
                >
                  {last.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[12px] font-bold leading-snug mb-0.5">{last.title}</h3>
                  <p className="text-[10px] leading-snug" style={{ color: 'var(--text-tertiary)' }}>
                    {last.description}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* —— Desktop / tablet even grid —— */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {benefits.map((benefit, i) => (
            <div
              key={benefit.title}
              className={`shine-border tool-card-enter group relative rounded-xl p-3.5 transition-all duration-300 overflow-hidden ${
                benefit.highlight
                  ? isLight
                    ? 'bg-slate-50 border border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                    : 'bg-gradient-to-b from-white/[0.07] to-white/[0.025] border border-white/15 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]'
                  : toolCard
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isLight
                    ? 'bg-gradient-to-br from-slate-100/70 via-transparent to-transparent'
                    : 'bg-gradient-to-br from-white/[0.05] via-transparent to-transparent'
                }`}
              />

              <div className="relative">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 mb-2.5 ${
                    benefit.highlight
                      ? isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                      : toolIcon
                  }`}
                >
                  {benefit.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <h3 className="text-[13px] font-bold leading-snug">{benefit.title}</h3>
                    {benefit.highlight && (
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${
                          isLight
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-white/[0.08] text-white/70 border-white/15'
                        }`}
                      >
                        Local
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* SEO / guide — designed cards, not a wall of text */}
      <section className="hidden sm:block section-shell max-w-4xl">
        <div
          className={`rounded-2xl p-5 sm:p-6 mb-3 ${
            isLight
              ? 'bg-white border border-slate-200 shadow-sm shadow-slate-900/[0.04]'
              : 'bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/10'
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-black border-white'
              }`}
            >
              <Icons.Search />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight mb-1.5">
                How domain name search works on DomainDiscovery
              </h2>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Domain name search answers one question first: is this name free to register? Type a brand, keyword, or
                city-niche combo and get live availability across 1,600+ TLDs. Then refine with AI name ideas,{' '}
                <Link href="/tools/geo" className="underline underline-offset-2 font-semibold">
                  geo domain lists
                </Link>
                , bulk checks,{' '}
                <Link href="/tools/whois" className="underline underline-offset-2 font-semibold">
                  WHOIS
                </Link>
                , and{' '}
                <Link href="/tools/compare" className="underline underline-offset-2 font-semibold">
                  registrar prices
                </Link>{' '}
                — before you leave the site.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: '1,600+ TLDs', sub: 'Live availability' },
              { label: 'AI + geo tools', sub: 'Brand & local SEO' },
              { label: 'Private shortlists', sub: 'Saved on device' },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl px-3 py-2.5 text-center ${
                  isLight ? 'bg-slate-50 border border-slate-100' : 'bg-white/[0.03] border border-white/[0.06]'
                }`}
              >
                <div className="text-[12px] font-bold">{item.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-[15px] font-bold mb-2.5 tracking-tight">How to choose a domain name that ranks and sticks</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {chooseTips.map((tip, i) => (
              <div
                key={tip.title}
                className={`tool-card-enter group rounded-xl p-3 transition-all duration-300 ${toolCard}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black border ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-white/[0.06] text-white/80 border-white/10'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <h4 className="text-[12px] font-bold">{tip.title}</h4>
                </div>
                <p className="text-[11px] leading-relaxed pl-8" style={{ color: 'var(--text-tertiary)' }}>
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-2xl p-4 sm:p-5 ${
            isLight
              ? 'bg-slate-50 border border-slate-200'
              : 'bg-white/[0.03] border border-white/10'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toolIcon}`}>
              <Icons.Globe />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold mb-1">Domain extensions (TLDs): which should you choose?</h3>
              <p className="text-[12px] sm:text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                .com remains the most recognized extension for global brands. Industry TLDs like .ai, .io, .app, and
                .dev can signal category fit; country codes support local presence. Browse the full catalog, then verify
                availability with domain name search before you register. New here? Read guides on{' '}
                <Link href="/learn/domain-name-search-guide" className="underline underline-offset-2 font-semibold">
                  domain name search
                </Link>
                ,{' '}
                <Link href="/learn/how-to-register-a-domain" className="underline underline-offset-2 font-semibold">
                  registration
                </Link>
                ,{' '}
                <Link href="/learn/geo-domains-local-seo" className="underline underline-offset-2 font-semibold">
                  geo domains
                </Link>
                ,{' '}
                <Link href="/learn/what-is-a-tld-domain-extension" className="underline underline-offset-2 font-semibold">
                  TLDs
                </Link>
                , and{' '}
                <Link href="/learn/what-is-domaindiscovery" className="underline underline-offset-2 font-semibold">
                  what DomainDiscovery is
                </Link>
                .
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['.com', '.ai', '.io', '.app', '.dev', '.co'].map((tld) => (
                  <Link
                    key={tld}
                    href="/domain-extensions"
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        : 'bg-white/[0.04] border-white/10 text-white/80 hover:border-white/25'
                    }`}
                  >
                    {tld}
                  </Link>
                ))}
                <Link
                  href="/domain-extensions"
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  View all →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-shell max-w-3xl !mb-3 sm:!mb-6">
        <div
          className={`rounded-lg sm:rounded-2xl p-3 sm:p-5 text-center ${
            isLight
              ? 'bg-white border border-slate-200 shadow-sm shadow-slate-900/[0.04]'
              : 'bg-white/[0.03] border border-white/10'
          }`}
        >
          <h2 className="text-sm sm:text-xl font-black mb-0.5 sm:mb-1">Ready to Find Your Perfect Domain?</h2>
          <p className="text-[10px] sm:text-[12px] mb-2 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Free · Real-time · Best prices
          </p>
          <a
            href="#top"
            className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[13px]"
          >
            Start Searching
          </a>
        </div>
      </section>

      {/* Extractable definition for AEO/GEO (AI Overviews / assistants) */}
      <div className="section-shell max-w-3xl !mb-2 sm:!mb-4 !px-0">
        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.home} compact />
      </div>

      {/*
        FAQs — last content block before footer menu.
        Questions stay fixed-height; answer plays in a stable stage below so
        sections above never reflow. Click only (no hover open).
      */}
      <section
        ref={faqSectionRef}
        id="faqs"
        className="section-shell max-w-4xl !mb-2 sm:!mb-6"
        aria-labelledby="faqs-heading"
      >
        <div className="text-center mb-1.5 sm:mb-4">
          <h2 id="faqs-heading" className="section-title">
            FAQs
          </h2>
          <p className="hidden sm:block section-sub">
            Everything you need to know about finding and registering domains
          </p>
        </div>

        {/* Fixed question grid — never grows when an answer is open */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2.5">
          {faqs.map((faq, index) => {
            const open = openFaq === index;
            return (
              <button
                key={faq.question}
                type="button"
                onClick={() => setOpenFaq(open ? null : index)}
                aria-expanded={open}
                aria-controls="faq-answer-stage"
                className={`shine-border tool-card-enter group relative flex items-center gap-2 sm:gap-2.5 w-full min-h-[3rem] sm:min-h-[3.35rem] px-2 py-1.5 sm:px-3.5 sm:py-3 text-left rounded-lg sm:rounded-xl transition-[border-color,box-shadow,background-color,transform] duration-300 ease-out ${
                  open
                    ? isLight
                      ? 'bg-white border border-slate-300 shadow-md scale-[1.01]'
                      : 'bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/22 shadow-[0_8px_28px_rgba(0,0,0,0.28)] scale-[1.01]'
                    : isLight
                      ? 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      : 'bg-white/[0.03] border border-white/10 hover:border-white/18 hover:bg-white/[0.05]'
                }`}
                style={{ animationDelay: `${index * 0.035}s` }}
              >
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ease-out ${
                    open
                      ? isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                      : isLight
                        ? 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200'
                        : 'bg-white/[0.06] text-white/70 border-white/10 group-hover:bg-white/10'
                  }`}
                >
                  {faq.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[11px] sm:text-[13px] font-bold leading-snug pr-1 line-clamp-2 sm:line-clamp-none">
                    {faq.question}
                  </h3>
                </div>
                <span
                  className={`shrink-0 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-transform duration-300 ease-out ${
                    open
                      ? isLight
                        ? 'bg-slate-900 text-white rotate-45'
                        : 'bg-white text-black rotate-45'
                      : isLight
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-white/[0.06] text-white/45'
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
            );
          })}
        </div>

        {/* Stable answer stage — fixed min-height when open so footer doesn't jump around */}
        <div
          id="faq-answer-stage"
          className={`faq-answer-stage mt-2 sm:mt-3 transition-[min-height] duration-300 ease-out ${
            openFaq !== null ? 'min-h-[7.25rem] sm:min-h-[6.5rem]' : 'min-h-0'
          }`}
          aria-live="polite"
        >
          {openFaq !== null && faqs[openFaq] && (
            <div
              key={openFaq}
              className={`faq-answer-panel shine-border rounded-xl border px-3.5 py-3 sm:px-4 sm:py-3.5 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.04]'
                  : 'bg-white/[0.04] border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.28)]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                    isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-black border-white'
                  }`}
                >
                  {faqs[openFaq].icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] sm:text-[13px] font-bold mb-1 leading-snug">
                    {faqs[openFaq].question}
                  </p>
                  <p
                    className="text-[11px] sm:text-[12.5px] leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {faqs[openFaq].answer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenFaq(null)}
                  className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-white/[0.08] text-white/60 hover:bg-white/[0.14] hover:text-white'
                  }`}
                  aria-label="Close answer"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
