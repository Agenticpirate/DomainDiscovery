'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion/ScrollReveal';

function IconShortlist({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" d="M8 7h11M8 12h11M8 17h7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7.2 1.2 1.2L7 5.8M4 12.2l1.2 1.2L7 10.8M4 17.2l1.2 1.2L7 15.8" />
    </svg>
  );
}

function IconBudget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 7.5v9M14.5 9.25c0-1-.9-1.75-2.5-1.75s-2.5.75-2.5 1.75.9 1.5 2.5 1.75 2.5.75 2.5 1.75-.9 1.75-2.5 1.75-2.5-.75-2.5-1.75" />
    </svg>
  );
}

function IconLive({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.4 6.4l1.55 1.55M16.05 16.05l1.55 1.55M17.6 6.4l-1.55 1.55M7.95 16.05 6.4 17.6" />
    </svg>
  );
}

function IconMcp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path strokeLinecap="round" d="M17 13.5V17m0 0h3.5M17 17l3.5 3.5" />
    </svg>
  );
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path strokeLinecap="round" d="M3.5 9.5h17M8 14h4" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinejoin="round" d="M12 3.5 19.5 6.5v5.2c0 4.3-2.9 7.5-7.5 9.3-4.6-1.8-7.5-5-7.5-9.3V6.5L12 3.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.2 12 1.9 1.9 3.7-3.8" />
    </svg>
  );
}

const ITEMS = [
  {
    n: '01',
    title: 'Brand-aware shortlists',
    body: 'Turn a business brief into ranked domain candidates with explainable scores.',
    points: ['Length & radio-test fit', 'Keyword + industry alignment', 'Risk flags, not black-box picks'],
    tag: 'Core',
    href: '/ada/chat',
    cta: 'Try in chat',
    Icon: IconShortlist,
  },
  {
    n: '02',
    title: 'Budget as a hard constraint',
    body: 'Agents pass maxBudgetUsd. Results stay honest about price confidence.',
    points: ['within · over · unknown flags', 'Never invent create fees', 'Prefer available under cap'],
    tag: 'Policy',
    href: '/ada/docs#budget',
    cta: 'Budget contract',
    Icon: IconBudget,
  },
  {
    n: '03',
    title: 'Live availability research',
    body: 'Instant Domain–style checks when enabled. Snapshots — re-verify at checkout.',
    points: ['Live free availability path', 'RDAP fallback if needed', 'Registrar re-check required'],
    tag: 'Live',
    href: '/ada/app',
    cta: 'Run a shortlist',
    Icon: IconLive,
  },
  {
    n: '04',
    title: 'MCP-native integration',
    body: 'Primary tool find_brand_domains plus WHOIS, geo, prices, and ranking.',
    points: ['HTTP JSON-RPC + stdio', 'Cursor / Claude friendly', 'Copy-paste curl samples'],
    tag: 'MCP',
    href: '/ada/docs#integration',
    cta: 'Integration guide',
    Icon: IconMcp,
  },
  {
    n: '05',
    title: 'Discoverable Agent Card',
    body: 'Machine-readable Agent Card for capabilities, endpoints, and constraints.',
    points: ['/.well-known/agent-card.json', 'ANS-style discovery', 'Clear v1 boundaries'],
    tag: 'Discovery',
    href: '/ada/agent-card',
    cta: 'Open Agent Card',
    Icon: IconCard,
  },
  {
    n: '06',
    title: 'Human confirmation by design',
    body: 'Research by default. Optional registrar BYOK still requires explicit confirm.',
    points: ['No silent auto-buy', 'DNS only with confirm + flag', 'Human owns checkout'],
    tag: 'Trust',
    href: '/ada/disclaimer',
    cta: 'Read disclaimer',
    Icon: IconShield,
  },
] as const;

export function AdaCapabilities({ isLight }: { isLight: boolean }) {
  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/55';
  const faint = isLight ? 'text-slate-500' : 'text-white/40';
  const line = isLight ? 'border-slate-200' : 'border-white/[0.09]';
  const surface = isLight
    ? 'bg-white shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)]'
    : 'bg-[#0b0b0d] shadow-[0_24px_56px_-34px_rgba(0,0,0,0.9)]';
  const iconWrap = isLight
    ? 'border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-800 shadow-sm'
    : 'border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-white/90';
  const pointDot = isLight ? 'bg-slate-400' : 'bg-white/35';
  const ctaCls = isLight
    ? 'text-slate-900 hover:text-slate-700'
    : 'text-white hover:text-white/80';

  const plate = isLight ? '#ffffff' : '#0c0c0e';

  return (
    <section className="relative overflow-hidden px-3 sm:px-6 py-5 sm:py-16">
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          className="mb-3 sm:mb-10"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2.5 sm:gap-5">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-3">
                <span className={`h-px w-6 sm:w-8 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] ${faint}`}>
                  Capabilities
                </p>
              </div>
              <h2 className={`text-base sm:text-4xl font-black tracking-tight leading-[1.1] ${ink}`}>
                What agents get
              </h2>
              <p className={`mt-1 sm:mt-3 text-[11px] sm:text-base leading-snug sm:leading-relaxed ${muted}`}>
                <span className="sm:hidden">Ranked shortlists, budget discipline, discoverable tools.</span>
                <span className="hidden sm:inline">
                  Structured domain-layer capabilities — ranked shortlists, budget discipline, and discoverable
                  tools. Not a black-box chatbot alone.
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Link
                href="/ada/docs#integration"
                className={`rounded-lg sm:rounded-full border px-2.5 sm:px-4 py-1 sm:py-2 text-[10.5px] sm:text-[11px] font-bold transition ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'
                    : 'border-white/12 bg-[#0a0a0c] text-white/65 hover:border-white/25 hover:text-white/90'
                }`}
              >
                Integration
              </Link>
              <Link
                href="/ada/agent-card"
                className={`rounded-lg sm:rounded-full border px-2.5 sm:px-4 py-1 sm:py-2 text-[10.5px] sm:text-[11px] font-bold transition ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'
                    : 'border-white/12 bg-[#0a0a0c] text-white/65 hover:border-white/25 hover:text-white/90'
                }`}
              >
                Agent Card
              </Link>
              <Link
                href="/ada/app"
                className={`rounded-lg sm:rounded-full px-2.5 sm:px-4 py-1 sm:py-2 text-[10.5px] sm:text-[11px] font-bold transition ${
                  isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                Try the app
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Mobile: dense list rows */}
        <div className="sm:hidden space-y-1.5">
          {ITEMS.map((item) => {
            const Icon = item.Icon;
            return (
              <div
                key={item.title}
                className={`relative isolate overflow-hidden rounded-xl border ${line}`}
                style={{ backgroundColor: plate }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{ backgroundColor: plate }}
                />
                <div className="relative z-[1] flex gap-2.5 p-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconWrap}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className={`text-[12.5px] font-black tracking-tight leading-tight ${ink}`}>
                        {item.title}
                      </h3>
                      <span className={`shrink-0 text-[9px] font-black tabular-nums tracking-widest ${faint}`}>
                        {item.n}
                      </span>
                    </div>
                    <p className={`text-[10.5px] leading-snug ${muted}`}>{item.body}</p>
                    <p className={`mt-1 text-[10px] leading-snug ${faint}`}>
                      {item.points.join(' · ')}
                    </p>
                    <Link
                      href={item.href}
                      className={`mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-bold ${ctaCls}`}
                    >
                      {item.cta}
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: full cards */}
        <ScrollReveal
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
          itemSelector=".scroll-reveal-item"
          y={22}
          stagger={0.06}
        >
          {ITEMS.map((item) => {
            const Icon = item.Icon;
            return (
              <article
                key={item.title}
                className={`scroll-reveal-item shine-border group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${line} ${surface} ${
                  isLight
                    ? 'hover:border-slate-300 hover:shadow-[0_12px_36px_-16px_rgba(15,23,42,0.18)]'
                    : 'hover:border-white/18 hover:bg-[#0e0e12] hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.85)]'
                }`}
                style={{ backgroundColor: isLight ? undefined : '#0c0c0e' }}
              >
                <div className="relative flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ease-out will-change-transform ${iconWrap} ${
                      isLight
                        ? 'group-hover:scale-110 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45)]'
                        : 'group-hover:scale-110 group-hover:border-white/35 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_28px_-6px_rgba(255,255,255,0.45)]'
                    }`}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${
                        isLight
                          ? 'border-slate-200 text-slate-600 bg-slate-50 group-hover:border-slate-300 group-hover:text-slate-800'
                          : 'border-white/10 text-white/45 bg-[#121214] group-hover:border-white/20 group-hover:text-white/70'
                      }`}
                    >
                      {item.tag}
                    </span>
                    <span
                      className={`text-[11px] font-black tabular-nums tracking-widest transition-colors duration-300 ${faint} group-hover:opacity-90`}
                    >
                      {item.n}
                    </span>
                  </div>
                </div>

                <h3 className={`relative text-base font-black tracking-tight mb-1.5 transition-colors duration-300 ${ink}`}>
                  {item.title}
                </h3>
                <p className={`relative text-[13px] leading-snug ${muted}`}>{item.body}</p>

                <ul className="relative mt-3 space-y-1.5 flex-1">
                  {item.points.map((p) => (
                    <li key={p} className={`flex items-start gap-2 text-[12px] leading-snug ${muted}`}>
                      <span
                        className={`mt-1.5 h-1 w-1 shrink-0 rounded-full transition-colors duration-300 ${pointDot} ${
                          isLight ? 'group-hover:bg-slate-700' : 'group-hover:bg-white/70'
                        }`}
                        aria-hidden
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative mt-4 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${faint}`}>
                    Agent capability
                  </span>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1 text-[12px] font-bold transition-all duration-300 ${ctaCls} group-hover:gap-1.5`}
                  >
                    {item.cta}
                    <svg
                      className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </ScrollReveal>

        <motion.p
          className={`mt-3 sm:mt-7 text-center text-[11px] sm:text-[13px] ${muted}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          Full tools &amp; curl on{' '}
          <Link
            href="/ada/docs"
            className={`font-bold underline underline-offset-2 ${
              isLight ? 'text-slate-900 hover:text-slate-700' : 'text-white hover:text-white/80'
            }`}
          >
            agent docs
          </Link>
          .
        </motion.p>
      </div>
    </section>
  );
}
