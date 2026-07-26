'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ADA_BRAND } from '@/lib/adaConfig';

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path strokeLinecap="round" d="M3.5 9.5h17M8 14h5" />
    </svg>
  );
}
function IconTool({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5 17.5 9.5M4 20l6.2-1.6L19 9.6a2.1 2.1 0 0 0-3-3L7.2 15.4 4 20Z" />
    </svg>
  );
}
function IconBudget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 7.75v8.5M14.25 9.5c0-.85-.75-1.5-2.25-1.5S9.75 8.65 9.75 9.5s.75 1.35 2.25 1.5 2.25.65 2.25 1.5-.75 1.5-2.25 1.5-2.25-.65-2.25-1.5" />
    </svg>
  );
}
function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" d="M9 7h10M9 12h10M9 17h7" />
      <path strokeLinecap="round" d="M5 7h.01M5 12h.01M5 17h.01" />
    </svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="9" r="3.25" />
      <path strokeLinecap="round" d="M5.5 19.25c1.2-2.7 3.4-4 6.5-4s5.3 1.3 6.5 4" />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="8.25" opacity="0.35" />
      <path strokeLinecap="round" d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}

const CONNECT_STEPS = [
  { n: '01', t: 'Fetch Agent Card', d: 'Discover tools, endpoints, and constraints.', Icon: IconCard },
  { n: '02', t: 'Call find_brand_domains', d: 'MCP or REST with a business brief.', Icon: IconTool },
  { n: '03', t: 'Pass maxBudgetUsd', d: 'Hard cap, e.g. 20 — never invent prices.', Icon: IconBudget },
  { n: '04', t: 'Read ranked shortlist', d: 'Scores, reasons, budgetStatus flags.', Icon: IconList },
  { n: '05', t: 'Human continues', d: 'Confirm purchase — optional registrar BYOK is opt-in only.', Icon: IconUser },
] as const;

const CONSTRAINTS = [
  { t: 'Not a registrar', d: 'No silent checkout or payment capture.', Icon: IconX },
  { t: 'No auto-DNS', d: 'DNS mutations require explicit confirm + flag.', Icon: IconX },
  { t: 'No invented prices', d: 'Unknown stays unknown.', Icon: IconX },
  { t: 'Not legal advice', d: 'Trademark risk stays with you.', Icon: IconX },
  { t: 'Research APIs', d: 'Powered by DomainDiscovery infrastructure.', Icon: IconList },
] as const;

export function AdaConnectCta({ isLight }: { isLight: boolean }) {
  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/50';
  const faint = isLight ? 'text-slate-500' : 'text-white/35';
  const line = isLight ? 'border-slate-200' : 'border-white/[0.09]';
  const surface = isLight
    ? 'bg-white border-slate-200 shadow-[0_12px_36px_-18px_rgba(15,23,42,0.14)]'
    : 'bg-[#0b0b0d] shadow-[0_28px_64px_-38px_rgba(0,0,0,0.92)]';
  const row = isLight
    ? 'border-slate-200 bg-slate-50 hover:bg-white'
    : 'border-white/[0.06] bg-[#121214] hover:bg-[#16161a]';
  const iconBox = isLight
    ? 'border-slate-200 bg-white text-slate-800 shadow-sm'
    : 'border-white/[0.1] bg-[#0a0a0c] text-white/90';

  const plate = isLight ? '#ffffff' : '#0c0c0e';
  const inset = isLight ? '#f8fafc' : '#121214';

  return (
    <>
      {/* Mobile-first compact; sm+ keeps roomier two-column cards */}
      <section className="relative overflow-hidden px-3 sm:px-6 py-5 sm:py-16">
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-2.5 sm:gap-5 items-stretch">
          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`shine-border relative isolate flex flex-col overflow-hidden rounded-xl sm:rounded-[1.5rem] border p-3 sm:p-8 ${line} ${surface}`}
            style={{ backgroundColor: plate }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ backgroundColor: plate }}
            />
            <div className="relative z-[1] mb-2.5 sm:mb-6">
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] mb-1 sm:mb-3 ${faint}`}>
                For agents
              </p>
              <h2 className={`text-base sm:text-[1.85rem] font-black tracking-tight ${ink}`}>
                Connect in minutes
              </h2>
              <p className={`mt-1 sm:mt-2 text-[11px] sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
                Same path as the app — structured for MCP and REST.
              </p>
            </div>

            <ol className="relative z-[1] flex-1 space-y-1 sm:space-y-0">
              {CONNECT_STEPS.map((s, i) => {
                const Icon = s.Icon;
                const isLast = i === CONNECT_STEPS.length - 1;
                return (
                  <motion.li
                    key={s.n}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 + i * 0.055, duration: 0.4 }}
                    className={`relative flex gap-2 sm:gap-3.5 ${isLast ? '' : 'sm:pb-2.5'}`}
                  >
                    {/* Timeline rail — desktop only */}
                    <div className="hidden sm:flex w-10 shrink-0 flex-col items-center self-stretch">
                      <motion.span
                        whileHover={{ scale: 1.04 }}
                        className={`relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconBox}`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </motion.span>
                      {!isLast && (
                        <span
                          aria-hidden
                          className={`mt-1.5 w-px flex-1 rounded-full ${
                            isLight
                              ? 'bg-gradient-to-b from-slate-200 to-slate-100'
                              : 'bg-gradient-to-b from-white/16 to-white/[0.04]'
                          }`}
                        />
                      )}
                    </div>

                    {/* Mobile: icon inline in the row */}
                    <div
                      className={`shine-border min-w-0 flex-1 flex gap-2 sm:block rounded-lg sm:rounded-2xl border p-2 sm:p-4 transition-colors ${row}`}
                      style={{ backgroundColor: inset }}
                    >
                      <span
                        className={`sm:hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${iconBox}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <p className={`text-[12px] sm:text-sm font-black tracking-tight leading-tight ${ink}`}>
                            {s.t}
                          </p>
                          <span className={`text-[9px] sm:text-[10px] font-black tabular-nums tracking-widest shrink-0 ${faint}`}>
                            {s.n}
                          </span>
                        </div>
                        <p className={`text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed ${muted}`}>{s.d}</p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>

            <div className="relative z-[1] mt-3 sm:mt-7 flex flex-wrap gap-1.5 sm:gap-2">
              <Link
                href="/ada/docs#integration"
                className={`rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-bold transition ${
                  isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                Integration
              </Link>
              <Link
                href="/ada/docs#security"
                className={`rounded-lg sm:rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-bold transition ${line} ${
                  isLight
                    ? 'text-slate-700 hover:border-slate-300 bg-white'
                    : 'text-white/75 hover:border-white/25 bg-[#0a0a0c]'
                }`}
              >
                Security
              </Link>
              <Link
                href="/ada/agent-card"
                className={`rounded-lg sm:rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-bold transition ${line} ${
                  isLight
                    ? 'text-slate-700 hover:border-slate-300 bg-white'
                    : 'text-white/75 hover:border-white/25 bg-[#0a0a0c]'
                }`}
              >
                Agent Card
              </Link>
            </div>
          </motion.div>

          {/* Constraints */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`shine-border relative isolate flex flex-col overflow-hidden rounded-xl sm:rounded-[1.5rem] border p-3 sm:p-8 ${line} ${surface}`}
            style={{ backgroundColor: plate }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ backgroundColor: plate }}
            />
            <div className="relative z-[1] mb-2.5 sm:mb-6">
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] mb-1 sm:mb-3 ${faint}`}>
                Constraints · honest
              </p>
              <h2 className={`text-base sm:text-[1.85rem] font-black tracking-tight ${ink}`}>
                What we will not pretend
              </h2>
              <p className={`mt-1 sm:mt-2 text-[11px] sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
                Clear boundaries. Trust compounds when we refuse to over-claim.
              </p>
            </div>

            <ul className="relative z-[1] flex-1 space-y-1 sm:space-y-2.5">
              {CONSTRAINTS.map((c, i) => {
                const Icon = c.Icon;
                return (
                  <motion.li
                    key={c.t}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.07 + i * 0.05, duration: 0.4 }}
                    whileHover={{ x: -2 }}
                    className={`shine-border flex gap-2 sm:gap-3.5 rounded-lg sm:rounded-2xl border p-2 sm:p-4 transition-colors ${row}`}
                    style={{ backgroundColor: inset }}
                  >
                    <span
                      className={`flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-md sm:rounded-xl border ${iconBox}`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className={`text-[12px] sm:text-sm font-black tracking-tight leading-tight ${ink}`}>
                        {c.t}
                      </p>
                      <p className={`text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed ${muted}`}>
                        {c.d}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <div
              className="relative z-[1] mt-2.5 sm:mt-6 rounded-lg sm:rounded-2xl border px-2.5 sm:px-4 py-2 sm:py-3.5 text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed"
              style={{
                backgroundColor: inset,
                borderColor: isLight ? 'rgba(226,232,240,1)' : 'rgba(255,255,255,0.1)',
                color: isLight ? '#475569' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span className={`font-black ${ink}`}>Shipped · </span>
              Chat, brand brain, BYOK skills, and opt-in registrar adapters. Next: broader automation with hard budget stops.
            </div>
            <p className={`relative z-[1] mt-2 sm:mt-4 text-[10px] sm:text-xs ${faint}`}>
              Research APIs by{' '}
              <a
                href="https://www.domainsdiscovery.com"
                className={`underline underline-offset-2 font-semibold ${isLight ? 'text-slate-600' : 'text-white/55'}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                DomainDiscovery
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA — compact on mobile, roomy on sm+ */}
      <section className="relative px-3 sm:px-6 pb-8 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`shine-border relative isolate max-w-4xl mx-auto overflow-hidden rounded-xl sm:rounded-[1.75rem] border ${line} ${
            isLight
              ? 'bg-white shadow-[0_28px_70px_-40px_rgba(15,23,42,0.4)]'
              : 'bg-[#0a0a0c] shadow-[0_32px_80px_-40px_rgba(0,0,0,0.95)]'
          }`}
          style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
        >
          {/* Opaque slab so ambient dots never show through */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden sm:block"
            style={{
              background: isLight
                ? 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(15,23,42,0.05), transparent 65%)'
                : 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(255,255,255,0.05), transparent 65%)',
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 hidden sm:block"
            style={{
              background: isLight
                ? 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.75) 50%, transparent 60%)'
                : 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
              backgroundSize: '220% 100%',
            }}
            animate={{ backgroundPosition: ['110% 0%', '-30% 0%'] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative z-[1] px-3.5 sm:px-12 py-4 sm:py-14 text-center">
            <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] mb-1.5 sm:mb-3 ${faint}`}>
              {ADA_BRAND.domain}
            </p>
            <h2 className={`text-[15px] sm:text-3xl md:text-[2.15rem] font-black tracking-tight leading-snug sm:leading-tight mb-1.5 sm:mb-3 ${ink}`}>
              Give agents a domain skill they can trust
            </h2>
            <p className={`text-[11px] sm:text-base max-w-lg mx-auto mb-3.5 sm:mb-8 leading-snug sm:leading-relaxed ${muted}`}>
              Budget shortlist in the app, or wire MCP with a public Agent Card.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3">
              <Link
                href="/ada/chat"
                className={`group relative overflow-hidden rounded-lg sm:rounded-2xl px-3.5 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-sm font-bold transition shadow-lg sm:shadow-xl ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                    : 'bg-white text-black hover:bg-white/90 shadow-white/15'
                }`}
              >
                <span className="relative">Open chat</span>
              </Link>
              <Link
                href="/ada/app"
                className={`rounded-lg sm:rounded-2xl border px-3.5 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-sm font-bold transition ${line} ${
                  isLight
                    ? 'bg-white text-slate-800 hover:border-slate-300'
                    : 'bg-[#0c0c0e] text-white/85 hover:border-white/25'
                }`}
              >
                Start with a brief
              </Link>
              <Link
                href="/ada/docs"
                className={`rounded-lg sm:rounded-2xl border px-3.5 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-sm font-bold transition ${line} ${
                  isLight
                    ? 'text-slate-600 hover:border-slate-300'
                    : 'bg-[#0c0c0e] text-white/55 hover:border-white/25'
                }`}
              >
                Read agent docs
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
