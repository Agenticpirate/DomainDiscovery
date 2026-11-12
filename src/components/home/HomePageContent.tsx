'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { HomeProductRows } from '@/components/home/HomeProductRows';
import { PremiumFaqGrid } from '@/components/sections/PremiumFaqGrid';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { LocalizedDefinition } from '@/components/i18n/LocalizedDefinition';
import { useLocale } from '@/components/i18n/LocaleProvider';

export const HomePageContent: React.FC = () => {
  const { messages, href } = useLocale();
  const home = messages.home;
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted ? theme === 'light' : false;

  const tools = [
    {
      icon: <Icons.Magic />,
      title: 'AI Domain Assistant',
      description: 'Describe your business — get a ranked shortlist with live availability.',
      href: '/assistant',
      featured: true,
      badge: 'Auto',
      cta: 'Open assistant',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Sparkles />,
      title: 'AI Domain Generator',
      description: 'Instant brandable ideas from a keyword, checked live as they appear.',
      href: '/generator',
      featured: true,
      badge: 'AI',
      cta: 'Generate Now',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Search />,
      title: 'Instant Domain Search',
      description: 'Type once — see availability stream across core and long-tail TLDs.',
      href: '/search',
      badge: 'Real-time',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Layers />,
      title: 'Bulk Domain Search',
      description: 'Paste up to 1,000 names and clear free vs taken in one batch.',
      href: '/bulk-search',
      badge: '1,000 at once',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Globe />,
      title: 'Domain Extensions',
      description: 'Explore 1,600+ endings and match the right TLD to your brand.',
      href: '/domain-extensions',
      badge: '1,600+ TLDs',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Dollar />,
      title: 'Price Comparison',
      description: 'Side-by-side registrar prices before you click buy.',
      href: '/tools/compare',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Info />,
      title: 'WHOIS Lookup',
      description: 'Owner, dates, and registration history via RDAP/WHOIS.',
      href: '/tools/whois',
      // Mobile tools grid: hide WHOIS (still shown on desktop lg+)
      hideOnMobile: true,
    },
    {
      icon: <Icons.Globe />,
      title: 'Geo Domain Generator',
      description: 'City + niche lists built for local SEO and multi-location brands.',
      href: '/tools/geo',
      hideOnMobile: false,
    },
    {
      icon: <Icons.Search />,
      title: 'Keyword Domains',
      description: 'Expand one keyword into hundreds of brandable options with live checks.',
      href: '/tools/keyword',
      badge: '5K+',
      hideOnMobile: false,
    },
  ];

  const benefits = [
    {
      icon: <Icons.Magic />,
      title: 'Live results',
      description: 'Availability updates as you type — no waiting on full-page reloads.',
      highlight: false,
    },
    {
      icon: <Icons.Sparkles />,
      title: 'AI + geo tools',
      description: 'Brandable names and city-level lists in one free toolkit.',
      highlight: false,
    },
    {
      icon: <Icons.Dollar />,
      title: 'Price clarity',
      description: 'Compare registrar prices so you buy with confidence, not guesswork.',
      highlight: false,
    },
    {
      icon: <Icons.Check />,
      title: 'Private shortlists',
      description: 'Saved domains stay on your device — we don’t harvest your searches.',
      highlight: true,
    },
    {
      icon: <Icons.Globe />,
      title: '1,600+ TLDs',
      description: 'From .com to niche and country-code extensions in a single search.',
      highlight: false,
    },
    {
      icon: <Icons.Layers />,
      title: 'Mobile-ready',
      description: 'The same fast search and tools on phone, tablet, and desktop.',
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
        'Instant domain search, AI domain generator, bulk domain checker (up to 1,000 names), geo domain generator for city/country lists, keyword domain finder, WHOIS/RDAP lookup, TLD browser, registrar price comparison, — no account required.',
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

  tools.forEach((tool, index) => {
    const copy = home.tools[index];
    tool.title = copy.title;
    tool.description = copy.description;
    if (copy.badge) tool.badge = copy.badge;
    tool.href = href(tool.href);
  });
  benefits.forEach((benefit, index) => {
    benefit.title = home.benefits[index].title;
    benefit.description = home.benefits[index].description;
  });
  extensions.forEach((item, index) => {
    item.desc = home.extLabels[index];
  });
  faqs.forEach((item, index) => {
    item.question = home.faqs[index].question;
    item.answer = home.faqs[index].answer;
  });
  chooseTips.forEach((tip, index) => {
    tip.title = home.tips[index].title;
    tip.desc = home.tips[index].description;
  });

  const card = isLight
    ? 'bg-white border border-[#d7dbdc] shadow-sm'
    : 'surface-premium border border-white/[0.08] hover:border-white/[0.14]';

  /** Opaque fills so ambient dots stay behind cards, not inside them */
  const toolCard = isLight
    ? 'isolate bg-white border border-[#d7dbdc] shadow-sm hover:border-[#a1a4a5]'
    : 'isolate surface-premium border border-white/[0.08] hover:border-white/[0.14]';

  const toolIcon = isLight
    ? 'bg-[#f4f5f5] border-[#d7dbdc] text-[#434a4d] group-hover:bg-[#0a0a0a] group-hover:text-white group-hover:border-[#0a0a0a]'
    : 'bg-[#111111] border-white/[0.08] text-[#f0f0f0] group-hover:bg-[#f0f0f0] group-hover:text-black group-hover:border-[#f0f0f0]';

  return (
    <div className="pb-1 sm:pb-2 pt-4 sm:pt-8">
      <HomeProductRows />

      {/*
        Mobile order: Tools → Why → Popular Extensions (keeps hero zone uncluttered)
        Desktop order: Tools → Popular Extensions → Why
      */}
      <div className="flex flex-col">
      {/* Tools — solid background only (no ambient bubbles/dots) */}
      <section
        className="order-1 w-full !mb-4 sm:!mb-8 py-3 sm:py-10"
        style={{ backgroundColor: 'var(--bg-main)' }}
      >
        <div className="section-shell !mb-0">
          <div className="relative z-[1] text-center mb-1.5 sm:mb-3.5">
            <h2 className="section-title">{home.toolkitTitle}</h2>
            <p className="section-sub mx-auto hidden max-w-md sm:block">
              {home.toolkitSub}
            </p>
          </div>

          <div className="relative z-[1] grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3">
            {tools.map((tool, i) => (
              <Link
                key={tool.title}
                href={tool.href}
                className={`tool-card-enter group relative items-center gap-2 overflow-hidden rounded-xl px-2.5 py-1.5 sm:min-h-[4.75rem] sm:gap-3 sm:rounded-2xl sm:p-3.5 ${
                  tool.hideOnMobile ? 'hidden lg:flex' : 'flex'
                } ${toolCard}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 rounded-[inherit] ${
                    isLight ? 'bg-white' : 'bg-transparent'
                  }`}
                />
                <div
                  className={`pointer-events-none absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block ${
                    isLight
                      ? 'bg-gradient-to-br from-slate-100/90 via-transparent to-transparent'
                      : 'bg-gradient-to-br from-white/[0.05] via-transparent to-transparent'
                  }`}
                />

                <div
                  className={`relative z-[2] flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border max-sm:[&_svg]:h-3.5 max-sm:[&_svg]:w-3.5 sm:h-10 sm:w-10 sm:rounded-xl ${toolIcon}`}
                >
                  {tool.icon}
                </div>

                <div className="relative z-[2] min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[13px] font-semibold leading-tight">
                      {tool.title}
                    </h3>
                    {tool.badge && (
                      <span
                        className={`hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border ${
                          isLight
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-white/[0.06] text-white/60 border-white/10'
                        }`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-px line-clamp-1 text-[11px] leading-snug text-ds-mute sm:mt-0.5 sm:line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <svg
                  className={`relative z-[2] w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 ${
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
        </div>
      </section>

      {/* Popular Extensions — last on mobile (after Why); mid-page on desktop */}
      <section className="defer-section section-shell order-3 sm:order-2 !mt-2 sm:!mt-0 !mb-5 sm:!mb-8">
        <div className="flex items-center sm:items-end justify-between gap-2 mb-2 sm:mb-3">
          <div>
            <h2 className="section-title">
              <span className="sm:hidden">{home.popularMobile}</span>
              <span className="hidden sm:inline">{home.popularDesktop}</span>
            </h2>
            <p className="hidden sm:block section-sub">
              {home.popularSub}
            </p>
          </div>
          <Link
            href={href('/domain-extensions')}
            className="inline-flex min-h-11 items-center gap-1 text-[13px] sm:min-h-0 sm:text-[12px] font-semibold shrink-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            {home.viewAll}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2">
          {extensions.map((item) => (
            <Link
              key={item.ext}
              href={href(`/search?q=example${item.ext}`)}
              className={`flex min-h-[4.25rem] flex-col items-center justify-center rounded-2xl px-1 py-3 text-center sm:min-h-0 sm:py-2.5 ${card}`}
            >
              <div className="text-[16px] sm:text-sm font-semibold tracking-tight">{item.ext}</div>
              <div className="mt-1 text-[12px] sm:text-[10px] text-ds-mute">
                {item.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why — mobile bento; sits above Popular Extensions on mobile only */}
      <section className="defer-section section-shell order-2 sm:order-3 !pt-1 sm:!pt-0 !mb-4 sm:!mb-8">
        <div className="text-center mb-2.5 sm:mb-4">
          <h2 className="section-title">{home.privacyTitle}</h2>
          <p className="section-sub max-w-lg mx-auto px-1">
            {home.privacySub}
          </p>
        </div>

        {/* —— Mobile bento (aligned tiles) —— */}
        <div className="sm:hidden grid grid-cols-2 gap-2">
          {/* Featured privacy tile — full width hero of the bento */}
          {(() => {
            const privacy = benefits.find((b) => b.highlight) ?? benefits[3];
            return (
              <div
                className={`group col-span-2 relative overflow-hidden rounded-2xl p-4 border ${
                  isLight
                    ? 'bg-white border-[#d7dbdc]'
                    : 'surface-premium border-white/[0.08]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${toolIcon}`}
                  >
                    {privacy.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <h3 className="text-[16px] font-semibold leading-snug">{privacy.title}</h3>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                          isLight
                            ? 'bg-[#f4f5f5] text-[#434a4d] border-[#d7dbdc]'
                            : 'bg-[#111111] text-[#a1a4a5] border-white/[0.1]'
                        }`}
                      >
                        {home.local}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed text-ds-body">
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
                className={`relative flex flex-col rounded-2xl p-3.5 border ${
                  isLight
                    ? 'bg-white border-[#d7dbdc]'
                    : 'surface-premium border-white/[0.08]'
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
                <h3 className="text-[14px] font-semibold leading-snug mb-1">{benefit.title}</h3>
                <p className="text-[13px] leading-snug text-ds-body">
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
                className={`col-span-2 relative overflow-hidden rounded-2xl p-3.5 border flex items-center gap-3 ${
                  isLight
                    ? 'bg-white border-[#d7dbdc]'
                    : 'surface-premium border-white/[0.08]'
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
                  <h3 className="text-[14px] font-semibold leading-snug mb-0.5">{last.title}</h3>
                  <p className="text-[13px] leading-snug text-ds-body">
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
              className={`shine-border tool-card-enter group relative rounded-xl p-3.5 transition-all duration-300 overflow-hidden ${toolCard}`}
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
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 mb-2.5 ${toolIcon}`}
                >
                  {benefit.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <h3 className="text-[13px] font-bold leading-snug">{benefit.title}</h3>
                    {benefit.highlight && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${
                          isLight
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-white/[0.08] text-white/70 border-white/15'
                        }`}
                      >
                        {home.local}
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
      <section className="defer-section hidden sm:block section-shell max-w-4xl">
        <div
          className={`rounded-2xl p-5 sm:p-6 mb-3 ${
            isLight
              ? 'bg-white border border-slate-200 shadow-sm shadow-slate-900/[0.04]'
              : 'surface-premium border border-white/[0.08]'
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
                {home.howTitle}
              </h2>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {home.howLead}{' '}
                <Link href={href('/tools/geo')} className="underline underline-offset-2 font-semibold">
                  {home.howGeo}
                </Link>
                {home.howMid}{' '}
                <Link href={href('/tools/whois')} className="underline underline-offset-2 font-semibold">
                  {home.howWhois}
                </Link>
                {home.howAnd}{' '}
                <Link href={href('/tools/compare')} className="underline underline-offset-2 font-semibold">
                  {home.howPrices}
                </Link>
                {home.howTail}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {home.chips.map((item) => (
              <div
                key={item.label}
                className={`rounded-xl px-3 py-2.5 text-center ${
                  isLight ? 'bg-[#f4f5f5] border border-[#d7dbdc]' : 'surface-premium border border-white/[0.08]'
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
          <h3 className="text-[15px] font-bold mb-2.5 tracking-tight">{home.chooseHeading}</h3>
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
              ? 'bg-white border border-[#d7dbdc]'
              : 'surface-premium border border-white/[0.08]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toolIcon}`}>
              <Icons.Globe />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold mb-1">{home.tldTitle}</h3>
              <p className="text-[12px] sm:text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                {home.tldLead}{' '}
                <Link href={href('/learn/domain-name-search-guide')} className="underline underline-offset-2 font-semibold">
                  {home.tldSearch}
                </Link>
                ,{' '}
                <Link href={href('/learn/how-to-register-a-domain')} className="underline underline-offset-2 font-semibold">
                  {home.tldReg}
                </Link>
                ,{' '}
                <Link href={href('/learn/geo-domains-local-seo')} className="underline underline-offset-2 font-semibold">
                  {home.tldGeo}
                </Link>
                ,{' '}
                <Link href={href('/learn/what-is-a-tld-domain-extension')} className="underline underline-offset-2 font-semibold">
                  {home.tldExt}
                </Link>
                ,{' '}
                <Link href={href('/learn/what-is-domaindiscovery')} className="underline underline-offset-2 font-semibold">
                  {home.tldAbout}
                </Link>
                {home.tldTail}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['.com', '.ai', '.io', '.app', '.dev', '.co'].map((tld) => (
                  <Link
                    key={tld}
                    href={href('/domain-extensions')}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        : 'bg-[#111111] border-white/10 text-white/80 hover:border-white/25'
                    }`}
                  >
                    {tld}
                  </Link>
                ))}
                <Link
                  href={href('/domain-extensions')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {home.viewAllArrow}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-page billboards — compact so they stay in sync with page sections */}
      <section className="defer-section section-shell max-w-4xl !mb-4 sm:!mb-6">
        <AffiliateAdRail
          placement="home-mid"
          variant="auto"
          contained={false}
          size="compact"
        />
      </section>

      {/* CTA */}
      <section className="defer-section section-shell max-w-3xl !mb-3 sm:!mb-6">
        <div
          className={`rounded-lg sm:rounded-2xl p-3 sm:p-5 text-center ${
            isLight
              ? 'bg-white border border-[#d7dbdc]'
              : 'surface-premium border border-white/[0.08]'
          }`}
        >
          <h2 className="text-sm sm:text-xl font-semibold tracking-tight mb-0.5 sm:mb-1">
            {home.ctaTitle}
          </h2>
          <p className="text-[12px] sm:text-[13px] mb-2 sm:mb-3" style={{ color: 'var(--text-tertiary)' }}>
            {home.ctaSub}
          </p>
          <a
            href="#top"
            className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[13px]"
          >
            {home.ctaButton}
          </a>
        </div>
      </section>

      {/* Extractable definition for AEO/GEO (AI Overviews / assistants) */}
      <div className="section-shell max-w-3xl !mb-2 sm:!mb-4 !px-0">
        <LocalizedDefinition id="home" compact />
      </div>

      {/* Homepage FAQ design system — shared PremiumFaqGrid */}
      <PremiumFaqGrid
        id="faqs"
        title={home.faqTitle}
        subtitle={home.faqSub}
        items={faqs}
        className="!mb-2 sm:!mb-6"
      />
    </div>
  );
};
