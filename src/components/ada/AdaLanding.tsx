'use client';

import React from 'react';
import Link from 'next/link';
import { ADA_BRAND } from '@/lib/adaConfig';
import { AdaStatsStrip } from '@/components/ada/AdaStatsStrip';
import { AdaHowItWorks } from '@/components/ada/AdaHowItWorks';
import { AdaCapabilities } from '@/components/ada/AdaCapabilities';
import { AdaConnectCta } from '@/components/ada/AdaConnectCta';
import { motion } from 'framer-motion';
import { useAdaTheme } from '@/hooks/useAdaTheme';
import { Reveal } from '@/components/ui/motion/Reveal';
import { Pressable } from '@/components/ui/motion/Pressable';

const FOR_WHOM = [
  {
    title: 'AI agents & orchestrators',
    body: 'Call MCP or REST from multi-agent workflows that need domain research without scraping registrar UIs.',
  },
  {
    title: 'Founders & brand teams',
    body: 'Use the app to describe the product, cap budget, and walk away with a ranked shortlist in minutes.',
  },
  {
    title: 'Agencies & operators',
    body: 'Standardize naming research for clients with repeatable tools, not one-off spreadsheet chaos.',
  },
];

/** Icons sit in a fixed box so stroke glyphs share the same optical center as text */
function IconSlot({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center overflow-visible">
      {children}
    </span>
  );
}

function ChatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
      aria-hidden
    >
      {/* Classic chat cloud — bubble + corner tail */}
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function AppIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
      aria-hidden
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}

function IndustryIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
      aria-hidden
    >
      <path d="M3 21h18M5 21V8l6 3V8l6 3V3h2v18" />
    </svg>
  );
}

export function AdaLanding() {
  const t = useAdaTheme();
  const { isLight, ink, muted, faint, card, pill, band, btnPrimary, btnSecondary, btnGhost } = t;

  return (
    <div className="relative overflow-hidden">
      {/*
        Ambient field comes from AdaShell (page-level).
        Hero only keeps solid UI + soft scrim so dots never cover badge / CTAs / copy.
      */}
      <section className="relative px-3 sm:px-6 pt-5 sm:pt-16 pb-5 sm:pb-14">
        <div className="relative z-[1] max-w-4xl mx-auto text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[70%] w-[min(100%,42rem)] -translate-x-1/2 rounded-[3rem]"
            style={{
              background: isLight
                ? 'radial-gradient(ellipse 80% 70% at 50% 35%, rgba(248,250,252,0.92) 0%, rgba(248,250,252,0.55) 45%, transparent 72%)'
                : 'radial-gradient(ellipse 80% 70% at 50% 35%, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.55) 45%, transparent 72%)',
            }}
          />

          <div className="relative z-[1] max-w-md sm:max-w-none mx-auto">
            <Reveal className="flex justify-center mb-2.5 sm:mb-5" y={8}>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-0.5 sm:py-1 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-[0.11em] sm:tracking-[0.14em] isolate ${pill} ${
                  isLight ? 'bg-white' : 'bg-[#0a0a0c]'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-emerald-500' : 'bg-white/55'}`} />
                Built for AI agents · Domain industry
              </span>
            </Reveal>

            <Reveal y={12}>
              <h1
                className={`text-[1.55rem] sm:text-5xl md:text-[3.35rem] font-black tracking-tight leading-[1.1] mb-2 sm:mb-5 ${ink}`}
              >
                The domain layer
                <br />
                <span className={isLight ? 'text-slate-500' : 'text-white/55'}>for agentic brands</span>
              </h1>
            </Reveal>

            <Reveal delay={0.05} y={10}>
              {/* Mobile: short copy. Desktop: full copy. */}
              <p className={`sm:hidden text-[12px] leading-snug mx-auto mb-3.5 ${muted}`}>
                Budget-aware brand shortlists for AI agents &amp; operators — generate, check, rank, shortlist.
              </p>
              <p className={`hidden sm:block text-lg leading-relaxed max-w-2xl mx-auto mb-9 ${muted}`}>
                {ADA_BRAND.name} is a purpose-built surface for AI agents and operators who need{' '}
                <span className={isLight ? 'text-slate-900 font-semibold' : 'text-white/85 font-semibold'}>
                  brandable domain research under a hard budget
                </span>
                . Generate, check, rank, and shortlist — with MCP-native tools and a public Agent Card for
                discovery.
              </p>
            </Reveal>

            {/*
              Mobile: one tight CTA block (2 primary + 3 secondary in a grid)
              Desktop: original stacked primary row + chip row
            */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="sm:hidden mb-5"
            >
              <div
                className={`rounded-2xl border p-2.5 ${
                  isLight ? 'border-slate-200 bg-white/90 shadow-sm' : 'border-white/10 bg-[#0a0a0c]'
                }`}
                style={{ backgroundColor: isLight ? undefined : '#0a0a0c' }}
              >
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/ada/chat"
                    className={`cta-mobile-tap cta-mobile-tap-primary relative isolate inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-[12px] font-bold ${btnPrimary}`}
                  >
                    <IconSlot>
                      <ChatIcon />
                    </IconSlot>
                    <span>Open chat</span>
                  </Link>
                  <Link
                    href="/ada/app"
                    className={`cta-mobile-tap cta-mobile-tap-ghost relative isolate inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2 text-[12px] font-bold ${btnSecondary} ${
                      isLight ? 'bg-white' : 'bg-[#121214]'
                    }`}
                  >
                    <IconSlot>
                      <AppIcon />
                    </IconSlot>
                    <span>App</span>
                  </Link>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-1">
                  {[
                    { href: '/ada/docs', label: 'Docs' },
                    { href: '/ada/agent-card', label: 'Card' },
                    { href: '/ada/docs/industry', label: 'Industry' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`cta-mobile-tap cta-mobile-tap-ghost relative isolate inline-flex h-8 items-center justify-center rounded-lg border px-1 text-[10.5px] font-semibold ${btnGhost} ${
                        isLight ? 'bg-white' : 'bg-[#121214]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/*
              Desktop CTAs — clean professional hierarchy (mobile block above is untouched)
              Primary pair (auto-width) + quiet utility nav links. No dock/box.
            */}
            <div className="hidden sm:flex flex-col items-center mb-12">
              {/* Primary actions */}
              <div className="relative flex flex-row items-center justify-center gap-3">
                {/* Soft focus bloom under primary only */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-1/2 top-1/2 -z-0 h-20 w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
                    isLight
                      ? 'bg-slate-900/[0.06]'
                      : 'bg-white/[0.06]'
                  }`}
                />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group/cta-wrap"
                >
                  <Link
                    href="/ada/chat"
                    className={`cta-shine cta-shine-primary group/cta relative isolate inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-8 text-[14px] font-semibold tracking-[-0.01em] ${btnPrimary} ${
                      isLight
                        ? 'shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_-6px_rgba(15,23,42,0.35)]'
                        : 'shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_1px_2px_rgba(0,0,0,0.2),0_10px_28px_-8px_rgba(255,255,255,0.18)]'
                    }`}
                  >
                    <span className="cta-shine-sweep" aria-hidden />
                    <IconSlot>
                      <span className="inline-flex transition-transform duration-300 ease-out group-hover/cta:scale-[1.06]">
                        <ChatIcon />
                      </span>
                    </IconSlot>
                    <span>Open chat</span>
                    <span className="inline-flex opacity-70 transition-all duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:opacity-100">
                      <ArrowIcon />
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href="/ada/app"
                    className={`cta-shine cta-shine-secondary group/cta relative isolate inline-flex h-12 items-center justify-center gap-2.5 rounded-full border px-8 text-[14px] font-semibold tracking-[-0.01em] ${btnSecondary} ${
                      isLight
                        ? 'bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,23,42,0.04),0_6px_16px_-8px_rgba(15,23,42,0.12)]'
                        : 'bg-[#0c0c0e] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_1px_2px_rgba(0,0,0,0.4),0_8px_20px_-10px_rgba(0,0,0,0.6)]'
                    }`}
                  >
                    <span className="cta-shine-sweep" aria-hidden />
                    <IconSlot>
                      <span className="inline-flex transition-transform duration-300 ease-out group-hover/cta:scale-[1.06]">
                        <AppIcon />
                      </span>
                    </IconSlot>
                    <span>Structured app</span>
                    <span className="inline-flex opacity-45 transition-all duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:opacity-90">
                      <ArrowIcon />
                    </span>
                  </Link>
                </motion.div>
              </div>

              {/* Utility nav — quiet professional links, not chips-in-a-box */}
              <motion.nav
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                aria-label="Product resources"
                className="mt-6 flex flex-wrap items-center justify-center gap-x-1 gap-y-2"
              >
                {(
                  [
                    { href: '/ada/docs', label: 'Agent docs & MCP', Icon: DocsIcon },
                    { href: '/ada/agent-card', label: 'Agent Card', Icon: CardIcon },
                    { href: '/ada/docs/industry', label: 'Industry & registrars', Icon: IndustryIcon },
                  ] as const
                ).map((item, i) => (
                  <React.Fragment key={item.href}>
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={`mx-1.5 h-1 w-1 rounded-full ${
                          isLight ? 'bg-slate-300' : 'bg-white/20'
                        }`}
                      />
                    )}
                    <Link
                      href={item.href}
                      className={`group/link relative isolate inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium tracking-tight transition-colors duration-200 ${
                        isLight
                          ? 'text-slate-500 hover:text-slate-900'
                          : 'text-white/45 hover:text-white/90'
                      }`}
                    >
                      <span
                        className={`inline-flex opacity-70 transition-opacity duration-200 group-hover/link:opacity-100 ${
                          isLight ? '' : ''
                        }`}
                      >
                        <item.Icon />
                      </span>
                      <span className="relative">
                        {item.label}
                        <span
                          aria-hidden
                          className={`absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 ease-out group-hover/link:w-full ${
                            isLight ? 'bg-slate-900/40' : 'bg-white/40'
                          }`}
                        />
                      </span>
                    </Link>
                  </React.Fragment>
                ))}
              </motion.nav>
            </div>

            <AdaStatsStrip isLight={isLight} />
          </div>
        </div>
      </section>

      {/* Positioning band — clean (no ambient dots) */}
      <section className={`relative border-y ${band}`}>
        <Reveal className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
          <p className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-2 ${faint}`}>Domain industry · Agentic era</p>
          <p className={`text-[14px] sm:text-xl font-semibold leading-snug ${ink}`}>
            Domain tools were built for human dashboards. Agents need structured tools, discoverable capabilities,
            budget discipline, and honest constraints — not scraped UIs.
          </p>
          <p className={`mt-2 text-[12px] sm:text-sm leading-relaxed ${muted}`}>
            {ADA_BRAND.name} is dedicated to that job: a domain research assistant agents can call, and a premium
            app humans can use, powered by DomainDiscovery research infrastructure. Registration stays at your
            registrar until you explicitly choose automation later.
          </p>
        </Reveal>
      </section>

      <AdaHowItWorks isLight={isLight} />

      <AdaCapabilities isLight={isLight} />

      {/* Who it's for — clean, no dots */}
      <section className={`relative border-y ${band}`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-12">
          <Reveal>
            <h2 className={`text-base sm:text-3xl font-black tracking-tight mb-2.5 sm:mb-6 ${ink}`}>Who it serves</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-2 sm:gap-4">
            {FOR_WHOM.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.04}>
                <Pressable className={`shine-border rounded-2xl border p-3 sm:p-5 h-full ${card}`}>
                  <h3 className={`text-[13px] sm:text-sm font-bold mb-1 ${ink}`}>{f.title}</h3>
                  <p className={`text-[11px] sm:text-[13px] leading-relaxed ${muted}`}>{f.body}</p>
                </Pressable>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AdaConnectCta isLight={isLight} />
    </div>
  );
}
