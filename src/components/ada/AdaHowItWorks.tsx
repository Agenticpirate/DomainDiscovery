'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion/ScrollReveal';
import { Reveal } from '@/components/ui/motion/Reveal';

function IconBrief({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8M8 10h8M8 14h5" />
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
    </svg>
  );
}

function IconBudget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 7.5v9M14.5 9.25c0-1-.9-1.75-2.5-1.75s-2.5.75-2.5 1.75.9 1.5 2.5 1.75 2.5.75 2.5 1.75-.9 1.75-2.5 1.75-2.5-.75-2.5-1.75" />
    </svg>
  );
}

function IconRank({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19V11M10 19V7M15 19v-5M20 19V5" />
    </svg>
  );
}

function IconDecide({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5 9.5 17 19 7.5" />
      <circle cx="12" cy="12" r="9" opacity="0.35" />
    </svg>
  );
}

function IconArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

const STEPS = [
  {
    n: '01',
    t: 'Brief',
    d: 'Describe the business, audience, style, preferred TLDs, and markets.',
    dMobile: 'Business, audience, style, TLDs & markets.',
    detail: 'Humans use the app form. Agents send a structured brief via MCP or REST.',
    detailMobile: 'App form or MCP / REST brief.',
    Icon: IconBrief,
  },
  {
    n: '02',
    t: 'Budget',
    d: 'Set a hard max registration spend in USD (for example $20).',
    dMobile: 'Hard max spend in USD (e.g. $20).',
    detail: 'Results labeled within, over, or unknown price — never invented fees.',
    detailMobile: 'within · over · unknown — never invent fees.',
    Icon: IconBudget,
  },
  {
    n: '03',
    t: 'Rank',
    d: 'Generate candidates, check availability, score brand fit, apply filters.',
    dMobile: 'Generate, check availability, score & filter.',
    detail: 'Explainable scores: brandability, length, TLD fit, keywords, risk flags.',
    detailMobile: 'Brand fit, length, TLD, keywords, risk.',
    Icon: IconRank,
  },
  {
    n: '04',
    t: 'Decide',
    d: 'Review the shortlist with reasons — then continue at a registrar.',
    dMobile: 'Review shortlist — continue at a registrar.',
    detail: 'Research by default. You confirm purchase — optional registrar BYOK is opt-in.',
    detailMobile: 'Research default. You confirm purchase.',
    Icon: IconDecide,
  },
] as const;

/**
 * Pipeline / How it works.
 * Mobile: dense horizontal step rows. Desktop (sm+): unchanged card row.
 */
export function AdaHowItWorks({ isLight }: { isLight: boolean }) {
  const reduce = useReducedMotion();
  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/50';
  const faint = isLight ? 'text-slate-500' : 'text-white/35';
  const line = isLight ? 'border-slate-200' : 'border-white/[0.09]';
  const surface = isLight
    ? 'bg-white border-slate-200 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)]'
    : 'bg-[#0c0c0e] shadow-[0_24px_56px_-36px_rgba(0,0,0,0.9)]';
  const iconWrap = isLight
    ? 'border-slate-200 bg-slate-50 text-slate-800 shadow-sm'
    : 'border-white/[0.1] bg-[#121214] text-white/90';

  return (
    <section className="relative overflow-hidden px-3 sm:px-6 py-5 sm:py-16">
      <div className="relative max-w-6xl mx-auto">
        <Reveal className="text-center mb-3 sm:mb-12" y={10}>
          <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.22em] mb-1 sm:mb-3 ${faint}`}>
            Pipeline
          </p>
          <h2 className={`text-base sm:text-3xl md:text-[2.2rem] font-black tracking-tight ${ink}`}>
            How it works
          </h2>
          <p className={`mt-1 sm:mt-2 text-[11px] sm:text-[15px] max-w-lg mx-auto leading-snug sm:leading-relaxed ${muted}`}>
            One pipeline for the app and for MCP agents — brief to shortlist under budget.
          </p>
        </Reveal>

        {/* —— Mobile: compact vertical list (dense) —— */}
        <div className="sm:hidden space-y-1.5">
          {STEPS.map((s, i) => {
            const Icon = s.Icon;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={s.n} className="relative">
                <div
                  className={`relative isolate overflow-hidden rounded-xl border ${line} ${surface}`}
                  style={{ backgroundColor: isLight ? undefined : '#0c0c0e' }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
                  />
                  <div className="relative z-[1] flex gap-2.5 p-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconWrap}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <h3 className={`text-[13px] font-black tracking-tight ${ink}`}>{s.t}</h3>
                        <span className={`text-[9px] font-black tabular-nums tracking-widest shrink-0 ${faint}`}>
                          {s.n}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-snug ${muted}`}>{s.dMobile}</p>
                      <p className={`mt-1 text-[10px] leading-snug ${faint}`}>{s.detailMobile}</p>
                    </div>
                  </div>
                </div>
                {/* slim mobile connector */}
                {!isLast && (
                  <div className="flex justify-center py-0.5" aria-hidden>
                    <div className={`h-2.5 w-px ${isLight ? 'bg-slate-200' : 'bg-white/12'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* —— Desktop: original card row —— */}
        <ScrollReveal
          className="hidden sm:flex flex-row items-stretch gap-0"
          itemSelector=".how-step-card"
          y={20}
          stagger={0.07}
        >
          {STEPS.map((s, i) => {
            const Icon = s.Icon;
            const isLast = i === STEPS.length - 1;
            return (
              <React.Fragment key={s.n}>
                <motion.article
                  whileHover={reduce ? undefined : { y: -3 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className={`how-step-card scroll-reveal-item shine-border relative flex-1 rounded-[1.25rem] border p-6 ${line} ${surface}`}
                  style={{ backgroundColor: isLight ? undefined : '#0c0c0e' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${iconWrap}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[11px] font-black tabular-nums tracking-widest ${faint}`}>
                      {s.n}
                    </span>
                  </div>

                  <h3 className={`text-[1.05rem] font-black tracking-tight mb-2 ${ink}`}>{s.t}</h3>
                  <p className={`text-[13px] leading-relaxed ${muted}`}>{s.d}</p>
                  <div
                    className={`mt-4 pt-3 border-t text-[11px] leading-relaxed ${faint} ${
                      isLight ? 'border-slate-200/80' : 'border-white/[0.06]'
                    }`}
                  >
                    {s.detail}
                  </div>
                </motion.article>

                {!isLast && (
                  <div
                    className="flex items-center justify-center w-7 md:w-9 shrink-0 self-center"
                    aria-hidden
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        isLight
                          ? 'border-slate-200 bg-white text-slate-400 shadow-sm'
                          : 'border-white/[0.1] bg-[#0c0c0e] text-white/35'
                      }`}
                    >
                      <IconArrow className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </ScrollReveal>

        <Reveal className="mt-4 sm:mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3" delay={0.08} y={8}>
          <Link
            href="/ada/app"
            className={`rounded-lg sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'
                : 'bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5'
            }`}
          >
            Run the pipeline
          </Link>
          <Link
            href="/ada/docs#integration"
            className={`rounded-lg sm:rounded-2xl border px-4 sm:px-6 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition ${
              isLight
                ? 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white/80'
                : 'border-white/12 text-white/75 hover:border-white/25 bg-[#0a0a0c]'
            }`}
          >
            Call it from an agent
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
