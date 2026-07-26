'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumFaqGrid } from '@/components/sections/PremiumFaqGrid';

export const GeneratorContent: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const faqs = [
    {
      icon: <Icons.Magic />,
      question: 'What is a domain name generator?',
      answer:
        'An AI tool that turns a keyword into creative, brandable domain ideas — prefixes, suffixes, morphs, and semantic alternatives — then checks real-time availability so you can register winners fast.',
    },
    {
      icon: <Icons.Layers />,
      question: 'How does the DomainDiscovery generator work?',
      answer:
        'Your keyword expands with 3,000+ prefixes and suffixes, semantic maps, and brand morphs — up to 5,000 unique .com ideas. Availability streams in progressive batches while you browse.',
    },
    {
      icon: <Icons.Sparkles />,
      question: 'Why should I use a domain name generator?',
      answer:
        'It saves hours of manual brainstorming, surfaces names you would not invent alone, and shows live availability so you only chase domains you can actually buy.',
    },
    {
      icon: <Icons.Shield />,
      question: 'Can I trust the availability results?',
      answer:
        'Yes — we use the same live check API as our domain search. Results are accurate at the moment shown; popular names can still get taken, so register quickly when you find a fit.',
    },
    {
      icon: <Icons.Search />,
      question: 'How specific should my keywords be?',
      answer:
        'Start with short single words (3–10 characters) like “cloud”, “mint”, or “spark”. Broad terms maximize variety; tighter terms focus industry meaning. Try both.',
    },
    {
      icon: <Icons.Check />,
      question: 'What makes a good domain name?',
      answer:
        'Short (ideally under 15 characters), memorable, easy to spell, and brand-relevant. Avoid hyphens and numbers when possible. Prefer .com for trust and recall.',
    },
    {
      icon: <Icons.Star />,
      question: 'Can I brainstorm without registering immediately?',
      answer:
        'Yes — explore freely with no account. Remember available names can disappear anytime; if you love one, register it even if you are not ready to launch.',
    },
    {
      icon: <Icons.Globe />,
      question: 'What are semantic alternatives?',
      answer:
        'Related words by industry context — “cloud” → compute, host, storage; “mint” → finance, wealth. That yields relevant brandable names, not random word soup.',
    },
  ];

  const tips: {
    step: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    tags?: string[];
  }[] = [
    {
      step: '01',
      icon: <Icons.Star />,
      title: 'Start with core keywords',
      description:
        'Use simple, memorable words that represent your brand or niche. Single words work best for generating diverse options.',
      tags: ['Brand', 'Niche'],
    },
    {
      step: '02',
      icon: <Icons.Magic />,
      title: 'Explore semantic alternatives',
      description:
        'Context-aware keywords surface industry-relevant names — not random padding — so suggestions match your market.',
      tags: ['cloud', 'mint', 'spark'],
    },
    {
      step: '03',
      icon: <Icons.Check />,
      title: 'Prioritize .com domains',
      description:
        'Other TLDs work, but .com remains the most trusted and memorable extension for most businesses and projects.',
      tags: ['.com'],
    },
    {
      step: '04',
      icon: <Icons.Globe />,
      title: 'Keep it short and simple',
      description:
        'Aim for under 15 characters. Shorter names are easier to remember, type, and share in marketing and social.',
      tags: ['≤15 chars'],
    },
    {
      step: '05',
      icon: <Icons.Search />,
      title: 'Check trademark conflicts',
      description:
        'Before you buy, search existing trademarks in official databases for your region so the brand stays clear to own.',
      tags: ['Clearance'],
    },
    {
      step: '06',
      icon: <Icons.Dollar />,
      title: 'Act fast on good finds',
      description:
        'Available domains can disappear anytime. When you find the right name, register it immediately to lock it in.',
      tags: ['Register'],
    },
  ];

  const benefits = [
    {
      title: 'Thousands of ideas',
      description:
        'Type one keyword and expand it into up to 5,000 brandable .com combinations — prefixes, suffixes, morphs, and compounds.',
      stat: '5K',
      statLabel: 'ideas / keyword',
      icon: <Icons.Sparkles />,
    },
    {
      title: 'Semantic creativity',
      description:
        'Context-aware alternatives (cloud → compute, host, storage) so suggestions match your industry, not random padding.',
      stat: '25+',
      statLabel: 'semantic maps',
      icon: <Icons.Magic />,
    },
    {
      title: 'Live availability',
      description:
        'Results stream with progressive .com checks against live registrar data — see available names as they land.',
      stat: 'Live',
      statLabel: '.com checks',
      icon: <Icons.Check />,
    },
    {
      title: 'Massive keyword library',
      description:
        '3,000+ prefixes and suffixes drawn from top domain naming patterns (my, online, hub, network, jobs, buddy…).',
      stat: '3K+',
      statLabel: 'affixes',
      icon: <Icons.Layers />,
    },
  ];

  return (
    <div className="space-y-10 py-10 sm:space-y-12 sm:py-12">
      {/* What is Domain Generator — premium explainer */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
        <div className="text-center mb-5 sm:mb-8">
          <p
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Domain discovery, explained
          </p>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-2">
            What is an AI domain name generator?
          </h2>
          <p
            className="text-[13px] sm:text-[15px] max-w-2xl mx-auto leading-relaxed"
            style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
          >
            A faster way to invent brandable names: one keyword becomes thousands of ideas, ranked by meaning,
            with live availability so you only chase domains you can buy.
          </p>
        </div>

        <div
          className={`shine-border relative overflow-hidden rounded-2xl border p-5 sm:p-7 mb-3 sm:mb-4 ${
            isLight
              ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.03]'
              : 'bg-white/[0.03] border-white/10'
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-px ${
              isLight
                ? 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'
                : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
            }`}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
              <p
                className="text-[13px] sm:text-[15px] leading-relaxed"
                style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.65)' }}
              >
                Instead of brainstorming and checking names one by one, the generator expands your keyword into
                creative, brandable .com suggestions — prefixes, suffixes, morphs, and compounds — so founders,
                creators, and teams can explore a full shortlist in minutes.
              </p>
              <p
                className="text-[13px] sm:text-[15px] leading-relaxed"
                style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.65)' }}
              >
                What sets it apart is{' '}
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  semantic understanding
                </span>
                . Basic tools pad random words; we read domain context so industry intent stays intact — computing
                for cloud, finance for mint — and names match your vision, not the weather report.
              </p>
              <p
                className="text-[13px] sm:text-[15px] leading-relaxed"
                style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.65)' }}
              >
                Every idea is checked live against registrar data. Spot a winner, open your preferred registrar,
                and register before someone else does.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                {
                  label: 'Keyword in',
                  detail: 'Brand word or niche term',
                  icon: <Icons.Search />,
                },
                {
                  label: 'Semantic expand',
                  detail: 'Industry-aware variations',
                  icon: <Icons.Magic />,
                },
                {
                  label: 'Live .com out',
                  detail: 'Available · premium · taken',
                  icon: <Icons.Check />,
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 sm:py-3 ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-black/40 border-white/[0.08]'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border [&>svg]:h-3.5 [&>svg]:w-3.5 ${
                      isLight
                        ? 'bg-white text-slate-800 border-slate-200'
                        : 'bg-white/[0.08] text-white border-white/10'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black tabular-nums ${
                          isLight ? 'text-slate-300' : 'text-white/25'
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <span className="text-[12px] sm:text-[13px] font-bold tracking-tight">
                        {item.label}
                      </span>
                    </div>
                    <p
                      className="text-[11px] leading-snug mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {[
            {
              title: 'For startups',
              text: 'Ship a shortlist before your next brand workshop.',
            },
            {
              title: 'For creators',
              text: 'Find a clean name for the channel, product, or studio.',
            },
            {
              title: 'For experiments',
              text: 'Test project ideas without burning hours on WHOIS.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border px-3.5 py-3 sm:px-4 sm:py-3.5 ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-white/[0.02] border-white/[0.08]'
              }`}
            >
              <div
                className={`text-[12px] sm:text-[13px] font-bold mb-1 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {card.title}
              </div>
              <p
                className="text-[11px] sm:text-[12px] leading-relaxed"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.45)' }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why use — premium benefits */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
        <div className="text-center mb-5 sm:mb-8">
          <p
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Built for founders
          </p>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-2">
            Why use our domain generator?
          </h2>
          <p
            className="text-[13px] sm:text-[14px] max-w-xl mx-auto leading-relaxed"
            style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
          >
            One keyword. Thousands of brandable names. Live availability. Sort, filter, and register when you find the one.
          </p>
        </div>

        {/* Stat strip */}
        <div
          className={`shine-border grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl border overflow-hidden mb-4 sm:mb-6 ${
            isLight ? 'border-slate-200 bg-slate-200' : 'border-white/10 bg-white/10'
          }`}
        >
          {[
            { value: '3,000+', label: 'Prefixes & suffixes' },
            { value: '5,000', label: 'Ideas per keyword' },
            { value: 'Live', label: '.com availability' },
            { value: '8', label: 'Registrar options' },
          ].map((s) => (
            <div
              key={s.label}
              className={`px-3 py-3.5 sm:py-4 text-center ${
                isLight ? 'bg-white' : 'bg-[#0a0a0a]'
              }`}
            >
              <div className="text-base sm:text-xl font-black tracking-tight tabular-nums">{s.value}</div>
              <div
                className="text-[9px] sm:text-[10px] font-medium mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className={`shine-border group relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.03] hover:border-slate-300 hover:shadow-md'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/18 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-3.5">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105 [&>svg]:w-4 [&>svg]:h-4 ${
                    isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-black border-white'
                  }`}
                >
                  {benefit.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[14px] sm:text-[15px] font-bold tracking-tight leading-snug">
                      {benefit.title}
                    </h3>
                    <div className="text-right shrink-0">
                      <div
                        className={`text-[13px] sm:text-[14px] font-black tabular-nums leading-none ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {benefit.stat}
                      </div>
                      <div
                        className="text-[8px] sm:text-[9px] font-medium mt-0.5 uppercase tracking-wide"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {benefit.statLabel}
                      </div>
                    </div>
                  </div>
                  <p
                    className="text-[12px] sm:text-[13px] leading-relaxed"
                    style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
                  >
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Expert tips — clean solid cards, no sheen lines */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
        <div className="text-center mb-5 sm:mb-8">
          <p
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Naming playbook
          </p>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-2">
            Expert tips for choosing domain names
          </h2>
          <p
            className="text-[13px] sm:text-[14px] max-w-lg mx-auto leading-relaxed"
            style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
          >
            Six rules that separate forgettable names from brandable ones you can own with confidence.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl border overflow-hidden ${
            isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
          }`}
        >
          {tips.map((tip) => (
            <article
              key={tip.step}
              className={`group flex flex-col p-4 sm:p-5 transition-colors duration-200 ${
                isLight
                  ? 'bg-white hover:bg-slate-50'
                  : 'bg-[#0c0c0e] hover:bg-[#121214]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-colors duration-200 [&>svg]:w-3.5 [&>svg]:h-3.5 ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                      : 'bg-white/[0.06] text-white/75 border-white/[0.1] group-hover:bg-white group-hover:text-black group-hover:border-white'
                  }`}
                >
                  {tip.icon}
                </div>
                <span
                  className={`text-[11px] sm:text-[12px] font-black tabular-nums tracking-tight ${
                    isLight ? 'text-slate-300' : 'text-white/20'
                  }`}
                >
                  {tip.step}
                </span>
              </div>

              <h3
                className={`text-[13px] sm:text-[14px] font-bold tracking-tight leading-snug mb-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {tip.title}
              </h3>
              <p
                className="text-[12px] sm:text-[12.5px] leading-relaxed flex-1"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}
              >
                {tip.description}
              </p>

              {tip.tags && tip.tags.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {tip.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                        isLight
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-white/[0.04] text-white/50 border-white/[0.08]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* How it works — premium step rail */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
        <div className="text-center mb-5 sm:mb-8">
          <p
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Simple flow
          </p>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-2">
            How our AI generator works
          </h2>
          <p
            className="text-[13px] sm:text-[14px] max-w-lg mx-auto leading-relaxed"
            style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
          >
            From keyword to registration in four clean steps — no account, no clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            {
              step: '01',
              title: 'Enter your keyword',
              description:
                'Type a brand word or pick a chip (ai, cloud, buddy…). Suggestions start as you type.',
              meta: 'Instant input',
            },
            {
              step: '02',
              title: 'Expand variations',
              description:
                'We pair it with 3,000+ prefixes & suffixes, semantic maps, and brand morphs — up to 5,000 ideas.',
              meta: '3K+ affixes',
            },
            {
              step: '03',
              title: 'Check availability',
              description:
                'Live .com status streams in batches. Available, premium, and taken names are clearly marked.',
              meta: 'Live .com',
            },
            {
              step: '04',
              title: 'Register & go',
              description:
                'Continue on available names via GoDaddy, Spaceship, Namecheap, Porkbun, Atom, and more.',
              meta: '8 registrars',
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`shine-border group rounded-2xl border p-4 sm:p-5 transition-[border-color,background-color,box-shadow] duration-300 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm shadow-slate-900/[0.03] hover:border-slate-300 hover:shadow-md'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/16 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border text-[11px] sm:text-[12px] font-black tabular-nums transition-colors duration-300 ${
                    isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-black border-white'
                  }`}
                >
                  {item.step}
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold border ${
                    isLight
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : 'bg-white/[0.04] text-white/40 border-white/10'
                  }`}
                >
                  {item.meta}
                </span>
              </div>

              <h3
                className={`text-[13px] sm:text-[14px] font-bold tracking-tight leading-snug mb-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {item.title}
              </h3>
              <p
                className="text-[12px] sm:text-[12.5px] leading-relaxed"
                style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.48)' }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Homepage FAQ design system */}
      <PremiumFaqGrid
        id="generator-faqs"
        title="Domain generator FAQs"
        subtitle="Everything about keywords, availability, and brandable names."
        items={faqs}
        maxWidthClass="max-w-4xl"
      />

      {/* Popular keywords + CTA — clean premium footer */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
        <div className="text-center mb-5 sm:mb-7">
          <p
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Jump in
          </p>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-1.5">
            Popular keywords to try
          </h2>
          <p
            className="text-[12px] sm:text-[14px] max-w-md mx-auto leading-relaxed"
            style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)' }}
          >
            One tap seeds the generator — prefixes, suffixes, and live .com checks start immediately.
          </p>
        </div>

        {(() => {
          const seedKeyword = (keyword: string) => {
            const url = new URL(window.location.href);
            url.searchParams.set('q', keyword);
            window.history.replaceState({}, '', url.toString());
            window.dispatchEvent(new CustomEvent('generator-seed', { detail: { keyword } }));
            document.getElementById('top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };

          const groups = [
            {
              label: 'Trending',
              blurb: 'Hot brand stems right now',
              words: ['ai', 'agent', 'copilot', 'nova', 'pulse', 'spark', 'nexus', 'edge', 'core', 'stack'],
            },
            {
              label: 'Tech',
              blurb: 'Product & platform names',
              words: ['cloud', 'data', 'code', 'app', 'hub', 'lab', 'crypto', 'digital', 'platform', 'engine'],
            },
            {
              label: 'Brand',
              blurb: 'Commerce & studio vibes',
              words: ['mint', 'shop', 'pro', 'studio', 'forge', 'craft', 'vault', 'portal', 'network', 'market'],
            },
          ] as const;

          return (
            <>
              <div
                className={`grid grid-cols-1 lg:grid-cols-3 gap-px rounded-2xl border overflow-hidden mb-3 sm:mb-4 ${
                  isLight ? 'border-slate-200 bg-slate-200' : 'border-white/[0.1] bg-white/[0.08]'
                }`}
              >
                {groups.map((group) => (
                  <div
                    key={group.label}
                    className={`flex flex-col p-4 sm:p-5 ${
                      isLight ? 'bg-white' : 'bg-[#0c0c0e]'
                    }`}
                  >
                    <div className="mb-3 sm:mb-3.5">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <h3
                          className={`text-[13px] sm:text-[14px] font-bold tracking-tight ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {group.label}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold tabular-nums ${
                            isLight ? 'text-slate-400' : 'text-white/30'
                          }`}
                        >
                          {group.words.length}
                        </span>
                      </div>
                      <p
                        className="text-[11px] leading-snug"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {group.blurb}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 content-start flex-1">
                      {group.words.map((keyword) => (
                        <button
                          key={keyword}
                          type="button"
                          onClick={() => seedKeyword(keyword)}
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors duration-150 ${
                            isLight
                              ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                              : 'bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white hover:text-black hover:border-white'
                          }`}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA — solid black / silver, no sheen lines */}
              <div
                className={`relative overflow-hidden rounded-2xl border px-5 py-6 sm:px-10 sm:py-8 ${
                  isLight
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/15'
                    : 'bg-[#0c0c0e] border-white/[0.12]'
                }`}
              >
                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
                  <div className="text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight mb-1.5 text-white">
                      Ready to find your perfect domain?
                    </h2>
                    <p className="text-[12px] sm:text-[13px] leading-relaxed text-white/55">
                      Free · Live availability · Thousands of brandable ideas — no account required.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                      {['3,000+ affixes', 'Live .com checks', '8 registrars'].map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-white/40"
                        >
                          <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 shrink-0">
                    <a
                      href="#top"
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 sm:px-5 py-2.5 text-[12px] sm:text-[13px] font-bold bg-white text-black hover:bg-white/90 transition-colors duration-150"
                    >
                      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">
                        <Icons.Magic />
                      </span>
                      Start generating
                    </a>
                    <a
                      href="/search"
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 sm:px-5 py-2.5 text-[12px] sm:text-[13px] font-semibold border border-white/15 text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors duration-150"
                    >
                      <Icons.Search className="w-3.5 h-3.5" />
                      Full search
                    </a>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </section>
    </div>
  );
};
