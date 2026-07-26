'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ADA_BRAND } from '@/lib/adaConfig';
import {
  REGISTRARS,
  DOMAIN_CONNECT_PROVIDERS,
  ADAPTER_PRIORITY,
  ADAPTER_CHECKLIST,
  RISKS,
  TIERS,
} from '@/lib/adaIndustryContent';

/** Opaque plate — ambient dots never show through cards/text */
function SolidPlate({
  isLight,
  children,
  className = '',
  tone = 'surface',
}: {
  isLight: boolean;
  children: React.ReactNode;
  className?: string;
  tone?: 'surface' | 'inset' | 'hero';
}) {
  const fill =
    tone === 'hero'
      ? isLight
        ? '#ffffff'
        : '#050505'
      : tone === 'inset'
        ? isLight
          ? '#f8fafc'
          : '#121214'
        : isLight
          ? '#ffffff'
          : '#0c0c0e';
  const border = isLight ? 'border-slate-200' : 'border-white/10';

  return (
    <div
      className={`relative isolate overflow-hidden border ${border} ${className}`}
      style={{ backgroundColor: fill }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ backgroundColor: fill }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function SectionHead({
  isLight,
  children,
  className = '',
}: {
  isLight: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative isolate ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-2xl"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse 100% 100% at 20% 40%, #f8fafc 0%, #f8fafc 58%, rgba(248,250,252,0) 100%)'
            : 'radial-gradient(ellipse 100% 100% at 20% 40%, #050505 0%, #050505 58%, rgba(5,5,5,0) 100%)',
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export default function AdaRegistrarsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/55';
  const faint = isLight ? 'text-slate-500' : 'text-white/40';
  const plateFill = isLight ? '#ffffff' : '#0c0c0e';
  const insetFill = isLight ? '#f8fafc' : '#121214';
  const thStyle = {
    backgroundColor: isLight ? '#f8fafc' : '#121214',
  } as const;

  return (
    <div className="relative z-10 px-3 sm:px-6 pt-6 sm:pt-14 pb-10 sm:pb-14">
      <div className="relative max-w-5xl mx-auto">
        {/* Hero — compact mobile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <SolidPlate
            isLight={isLight}
            tone="hero"
            className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 mb-5 sm:mb-8"
          >
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Link
                href="/ada/docs"
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] ${faint} hover:underline`}
              >
                ← Agent docs
              </Link>
              <span className={faint}>·</span>
              <Link
                href="/ada/docs/industry"
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] ${muted} hover:underline`}
              >
                Industry →
              </Link>
            </div>

            <p
              className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] mb-1 sm:mb-2 ${faint}`}
            >
              {ADA_BRAND.domain} · Registrars
            </p>
            <h1
              className={`text-2xl sm:text-4xl font-black tracking-tight mb-1.5 sm:mb-3 ${ink}`}
            >
              Agent-ready registrars
            </h1>
            <p
              className={`text-xs sm:text-base leading-snug sm:leading-relaxed max-w-2xl ${muted}`}
            >
              Almost no registrar sells a product labeled “AI agent registration.” What matters is
              full programmatic coverage — availability, register, DNS, and funding — plus Domain
              Connect for post-register setup. Agent identity (ANS) is a separate layer.
            </p>
          </SolidPlate>
        </motion.div>

        {/* Checklist */}
        <section className="mb-6 sm:mb-12">
          <SectionHead isLight={isLight} className="mb-2.5 sm:mb-4">
            <h2
              className={`text-base sm:text-xl font-black tracking-tight mb-1 sm:mb-2 ${ink}`}
            >
              What “agent-ready” means
            </h2>
            <p className={`text-xs sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
              A registrar qualifies for automation adapters when an agent (with user-linked
              credentials) can:
            </p>
          </SectionHead>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mb-2.5 sm:mb-4">
            {ADAPTER_CHECKLIST.map((item, i) => (
              <li key={item}>
                <SolidPlate
                  isLight={isLight}
                  className="shine-border rounded-lg sm:rounded-xl p-2 sm:p-3 h-full"
                >
                  <div className="flex gap-1.5 sm:gap-2 items-start text-[11px] sm:text-sm">
                    <span
                      className={`shrink-0 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md text-[9px] sm:text-[10px] font-black ${
                        isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`leading-snug ${muted}`}>{item}</span>
                  </div>
                </SolidPlate>
              </li>
            ))}
          </ol>
          <p className={`text-[10px] sm:text-xs leading-snug ${faint}`}>
            Bonus: sandbox, webhooks, Domain Connect, premium-domain flags, WHOIS privacy defaults.
          </p>
        </section>

        {/* Matrix */}
        <section className="mb-6 sm:mb-12">
          <SectionHead isLight={isLight} className="mb-3 sm:mb-5">
            <h2
              className={`text-base sm:text-xl font-black tracking-tight mb-1 sm:mb-2 ${ink}`}
            >
              Registrar capability matrix
            </h2>
            <p className={`text-xs sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
              Grades reflect automation fitness for agents, not overall consumer rankings. Not
              partnerships.
            </p>
          </SectionHead>

          {/* Desktop table */}
          <div
            className="hidden lg:block overflow-x-auto shine-border relative isolate rounded-2xl border"
            style={{
              backgroundColor: plateFill,
              borderColor: isLight ? 'rgba(226,232,240,1)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ backgroundColor: plateFill }}
            />
            <table className="relative z-[1] w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr style={thStyle} className={isLight ? 'text-slate-600' : 'text-white/55'}>
                  <th className="px-3 py-3 font-bold">Platform</th>
                  <th className="px-3 py-3 font-bold">Register API</th>
                  <th className="px-3 py-3 font-bold">DNS API</th>
                  <th className="px-3 py-3 font-bold">Domain Connect</th>
                  <th className="px-3 py-3 font-bold">ANS / identity</th>
                  <th className="px-3 py-3 font-bold">Grade</th>
                  <th className="px-3 py-3 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {REGISTRARS.map((r) => (
                  <tr
                    key={r.name}
                    className="border-t align-top"
                    style={{
                      borderColor: isLight ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)',
                      backgroundColor: plateFill,
                    }}
                  >
                    <td className={`px-3 py-3 font-semibold ${ink}`}>{r.name}</td>
                    <td className={`px-3 py-3 ${muted}`}>{r.registerApi}</td>
                    <td className={`px-3 py-3 ${muted}`}>{r.dnsApi}</td>
                    <td className={`px-3 py-3 ${muted}`}>{r.domainConnect}</td>
                    <td className={`px-3 py-3 ${muted}`}>{r.ansLayer}</td>
                    <td className={`px-3 py-3 font-mono font-bold ${ink}`}>{r.grade}</td>
                    <td className={`px-3 py-3 ${faint}`}>{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — dense key/value rows */}
          <div className="lg:hidden space-y-2">
            {REGISTRARS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
              >
                <SolidPlate
                  isLight={isLight}
                  className="shine-border rounded-xl p-2.5 sm:p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className={`text-xs sm:text-sm font-black leading-tight min-w-0 ${ink}`}>
                      {r.name}
                    </h3>
                    <span
                      className="shrink-0 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: insetFill,
                        borderColor: isLight
                          ? 'rgba(226,232,240,1)'
                          : 'rgba(255,255,255,0.12)',
                        color: isLight ? '#334155' : 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {r.grade}
                    </span>
                  </div>
                  <dl className="space-y-1 text-[10px] sm:text-xs">
                    {(
                      [
                        ['Register', r.registerApi],
                        ['DNS', r.dnsApi],
                        ['Domain Connect', r.domainConnect],
                        ['ANS', r.ansLayer],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex gap-2 items-baseline justify-between border-t pt-1 first:border-t-0 first:pt-0"
                        style={{
                          borderColor: isLight
                            ? 'rgba(226,232,240,0.7)'
                            : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <dt className={`shrink-0 font-bold uppercase tracking-wide ${faint}`}>
                          {label}
                        </dt>
                        <dd className={`text-right leading-snug min-w-0 ${muted}`}>{value}</dd>
                      </div>
                    ))}
                    <div
                      className="border-t pt-1"
                      style={{
                        borderColor: isLight
                          ? 'rgba(226,232,240,0.7)'
                          : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <dt className={`font-bold uppercase tracking-wide mb-0.5 ${faint}`}>
                        Notes
                      </dt>
                      <dd className={`leading-snug ${faint}`}>{r.notes}</dd>
                    </div>
                  </dl>
                </SolidPlate>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GoDaddy split */}
        <section className="mb-6 sm:mb-12">
          <SolidPlate
            isLight={isLight}
            className="shine-border rounded-xl sm:rounded-2xl p-3 sm:p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div>
                <p
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] mb-1 sm:mb-2 ${faint}`}
                >
                  Layer B
                </p>
                <h3 className={`text-xs sm:text-sm font-black mb-1 sm:mb-2 ${ink}`}>
                  GoDaddy Domains API
                </h3>
                <p className={`text-[11px] sm:text-xs leading-snug sm:leading-relaxed ${muted}`}>
                  Register and manage customer brand domains and DNS. Large install base; Domain
                  Connect supported. Production agent use needs proper API credentials and policy
                  review.
                </p>
              </div>
              <div
                className="border-t sm:border-t-0 pt-3 sm:pt-0"
                style={{
                  borderColor: isLight ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <p
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] mb-1 sm:mb-2 ${faint}`}
                >
                  Layer A
                </p>
                <h3 className={`text-xs sm:text-sm font-black mb-1 sm:mb-2 ${ink}`}>
                  GoDaddy ANS / Agent Registrar
                </h3>
                <p className={`text-[11px] sm:text-xs leading-snug sm:leading-relaxed ${muted}`}>
                  Register AI agents with domain-anchored identity, certificates, and discovery DNS.
                  Not a substitute for buying <code className="font-mono">example.com</code> for a
                  brand.
                </p>
              </div>
            </div>
          </SolidPlate>
        </section>

        {/* Domain Connect */}
        <section className="mb-6 sm:mb-12">
          <SectionHead isLight={isLight} className="mb-2.5 sm:mb-4">
            <h2
              className={`text-base sm:text-xl font-black tracking-tight mb-1 sm:mb-2 ${ink}`}
            >
              Domain Connect providers
            </h2>
            <p className={`text-xs sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
              Even before full auto-register, agents and apps can request standard DNS setup at
              providers that implement Domain Connect:
            </p>
          </SectionHead>
          <SolidPlate isLight={isLight} className="rounded-xl sm:rounded-2xl p-2.5 sm:p-5">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {DOMAIN_CONNECT_PROVIDERS.map((p) => (
                <span
                  key={p}
                  className={`relative isolate rounded-full border px-2 sm:px-3 py-0.5 sm:py-1.5 text-[10px] sm:text-[11px] font-bold ${muted}`}
                  style={{
                    backgroundColor: insetFill,
                    borderColor: isLight
                      ? 'rgba(226,232,240,1)'
                      : 'rgba(255,255,255,0.12)',
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
            <p className={`text-[10px] sm:text-[11px] mt-2 sm:mt-3 leading-snug ${faint}`}>
              Source: domainconnect.org DNS Providers list (public). Implementations evolve — verify
              before shipping integrations.
            </p>
          </SolidPlate>
        </section>

        {/* Priority */}
        <section className="mb-6 sm:mb-12">
          <SectionHead isLight={isLight} className="mb-2.5 sm:mb-4">
            <h2
              className={`text-base sm:text-xl font-black tracking-tight mb-1 sm:mb-2 ${ink}`}
            >
              {ADA_BRAND.shortName} adapter priority
            </h2>
            <p className={`text-xs sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
              Recommended order for confirmed register + DNS (Tier 2). Human “continue at registrar”
              links can stay multi-registrar forever.
            </p>
          </SectionHead>
          <div className="space-y-1.5 sm:space-y-2">
            {ADAPTER_PRIORITY.map((p) => (
              <SolidPlate
                key={p.priority}
                isLight={isLight}
                className="shine-border rounded-lg sm:rounded-xl p-2.5 sm:p-4"
              >
                <div className="flex gap-2 sm:gap-3 items-start">
                  <span
                    className={`shrink-0 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black ${
                      isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                    }`}
                  >
                    {p.priority}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-xs sm:text-sm font-black leading-tight ${ink}`}>
                      {p.registrar}
                    </div>
                    <div className={`text-[10px] sm:text-xs mt-0.5 leading-snug ${muted}`}>
                      {p.why}
                    </div>
                  </div>
                </div>
              </SolidPlate>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section className="mb-6 sm:mb-12">
          <SectionHead isLight={isLight} className="mb-2 sm:mb-3">
            <h2 className={`text-sm sm:text-lg font-black tracking-tight ${ink}`}>
              Automation tiers
            </h2>
          </SectionHead>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
            {TIERS.map((t) => (
              <SolidPlate
                key={t.tier}
                isLight={isLight}
                className="shine-border rounded-lg sm:rounded-xl p-2 sm:p-3"
              >
                <div className={`text-[11px] sm:text-xs font-black mb-0.5 sm:mb-1 ${ink}`}>
                  {t.tier}
                </div>
                <div
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5 sm:mb-1 ${faint}`}
                >
                  {t.status}
                </div>
                <p className={`text-[10px] sm:text-[11px] leading-snug sm:leading-relaxed ${muted}`}>
                  {t.behavior}
                </p>
              </SolidPlate>
            ))}
          </div>
        </section>

        {/* Risks */}
        <section className="mb-6 sm:mb-12">
          <SectionHead isLight={isLight} className="mb-2 sm:mb-3">
            <h2 className={`text-base sm:text-xl font-black tracking-tight ${ink}`}>
              Risks &amp; compliance
            </h2>
          </SectionHead>
          <div className="space-y-1.5 sm:space-y-2">
            {RISKS.map((r) => (
              <SolidPlate
                key={r.risk}
                isLight={isLight}
                className="shine-border rounded-lg sm:rounded-xl p-2.5 sm:p-4"
              >
                <div className={`text-xs sm:text-sm font-black mb-0.5 sm:mb-1 leading-tight ${ink}`}>
                  {r.risk}
                </div>
                <div className={`text-[10px] sm:text-xs leading-snug ${muted}`}>
                  <span className={`font-bold ${faint}`}>Mitigation: </span>
                  {r.mitigation}
                </div>
              </SolidPlate>
            ))}
          </div>
          <p className={`text-[10px] sm:text-xs mt-2.5 sm:mt-4 leading-snug ${faint}`}>
            Not trademark clearance. Prices change. Aftermarket negotiation is not a create API.{' '}
            {ADA_BRAND.name} does not auto-register domains in v1.
          </p>
        </section>

        {/* CTAs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-3">
          <Link
            href="/ada/docs/industry"
            className={`relative isolate cta-mobile-tap rounded-lg sm:rounded-2xl px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm font-bold transition ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            Industry explainer
          </Link>
          <Link
            href="/ada/docs"
            className={`relative isolate cta-mobile-tap rounded-lg sm:rounded-2xl border px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm font-bold ${ink}`}
            style={{
              backgroundColor: plateFill,
              borderColor: isLight ? 'rgba(226,232,240,1)' : 'rgba(255,255,255,0.12)',
            }}
          >
            Agent docs &amp; MCP
          </Link>
          <Link
            href="/ada/app"
            className={`relative isolate cta-mobile-tap rounded-lg sm:rounded-2xl border px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm font-bold ${muted}`}
            style={{
              backgroundColor: plateFill,
              borderColor: isLight ? 'rgba(226,232,240,1)' : 'rgba(255,255,255,0.12)',
            }}
          >
            Open app
          </Link>
        </div>
      </div>
    </div>
  );
}
