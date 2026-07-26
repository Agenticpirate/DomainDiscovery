'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ADA_BRAND } from '@/lib/adaConfig';
import {
  LAYERS,
  WHY_NOW,
  PROTOCOLS,
  TIERS,
  POSITIONING,
  SOURCES,
} from '@/lib/adaIndustryContent';

/**
 * Opaque plate — inline fill so ambient dots never show through cards/text.
 * Same formula as /ada/docs, /ada/agent-card, home tools cards.
 */
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

export default function AdaIndustryPage() {
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
    <div className="relative z-10 px-4 sm:px-6 pt-10 sm:pt-14 pb-14">
      <div className="relative max-w-4xl mx-auto">
        {/* Hero — solid plate under nav + title + intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <SolidPlate isLight={isLight} tone="hero" className="rounded-3xl p-5 sm:p-8 mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Link
                href="/ada/docs"
                className={`text-[11px] font-bold uppercase tracking-[0.14em] ${faint} hover:underline`}
              >
                ← Agent docs
              </Link>
              <span className={faint}>·</span>
              <Link
                href="/ada/docs/registrars"
                className={`text-[11px] font-bold uppercase tracking-[0.14em] ${muted} hover:underline`}
              >
                Registrars →
              </Link>
            </div>

            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-2 ${faint}`}>
              {ADA_BRAND.domain} · Industry
            </p>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mb-3 ${ink}`}>
              Why domains matter for AI agents
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed max-w-2xl mb-6 ${muted}`}>
              Agents are moving from chat demos to operators that ship products. Domains remain the first
              durable internet asset — and the trust root for emerging agent identity standards. Here is
              the industry map behind {ADA_BRAND.name}.
            </p>

            <SolidPlate isLight={isLight} tone="inset" className="rounded-2xl p-4 sm:p-5">
              <p className={`text-sm leading-relaxed ${ink}`}>{POSITIONING}</p>
              <p className={`text-[11px] mt-3 font-semibold uppercase tracking-wider ${faint}`}>
                Research only · Not a registrar · No auto-purchase in v1
              </p>
            </SolidPlate>
          </SolidPlate>
        </motion.div>

        {/* Two layers */}
        <section className="mb-12">
          <SectionHead isLight={isLight} className="mb-5">
            <h2 className={`text-xl font-black tracking-tight mb-2 ${ink}`}>
              Two layers — do not mix them
            </h2>
            <p className={`text-sm ${muted}`}>
              The industry is solving two different problems that both use domains. Confusing them leads
              to wrong product claims.
            </p>
          </SectionHead>
          <div className="grid sm:grid-cols-2 gap-4">
            {LAYERS.map((L, i) => (
              <motion.div
                key={L.layer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <SolidPlate isLight={isLight} className="shine-border rounded-2xl p-5 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                        isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                      }`}
                    >
                      {L.layer}
                    </span>
                    <h3 className={`text-sm font-black ${ink}`}>{L.name}</h3>
                  </div>
                  <p className={`text-xs font-semibold mb-3 ${muted}`}>{L.question}</p>
                  <dl className="space-y-2 text-xs">
                    <div>
                      <dt className={`font-bold uppercase tracking-wider ${faint}`}>What</dt>
                      <dd className={muted}>{L.what}</dd>
                    </div>
                    <div>
                      <dt className={`font-bold uppercase tracking-wider ${faint}`}>Who</dt>
                      <dd className={muted}>{L.who}</dd>
                    </div>
                    <div>
                      <dt className={`font-bold uppercase tracking-wider ${faint}`}>Protocols</dt>
                      <dd className={muted}>{L.protocols}</dd>
                    </div>
                    <div>
                      <dt className={`font-bold uppercase tracking-wider ${faint}`}>ADA</dt>
                      <dd className={ink}>{L.ada}</dd>
                    </div>
                  </dl>
                </SolidPlate>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why now */}
        <section className="mb-12">
          <SectionHead isLight={isLight} className="mb-5">
            <h2 className={`text-xl font-black tracking-tight mb-2 ${ink}`}>
              Why this matters now
            </h2>
            <p className={`text-sm ${muted}`}>
              2025–2026 is the inflection: tool-calling agents, MCP, and open DNS-based identity drafts
              arrived at the same time as demand for real brand assets.
            </p>
          </SectionHead>
          <div className="space-y-3">
            {WHY_NOW.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <SolidPlate isLight={isLight} className="shine-border rounded-2xl p-4 sm:p-5">
                  <div className="flex gap-3">
                    <span
                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-black"
                      style={{
                        backgroundColor: isLight ? '#e2e8f0' : '#121214',
                        color: isLight ? '#334155' : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className={`text-sm font-black mb-1 ${ink}`}>{w.title}</h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${muted}`}>{w.body}</p>
                    </div>
                  </div>
                </SolidPlate>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Protocols */}
        <section className="mb-12">
          <SectionHead isLight={isLight} className="mb-5">
            <h2 className={`text-xl font-black tracking-tight mb-2 ${ink}`}>Protocol stack</h2>
            <p className={`text-sm ${muted}`}>
              What “supporting the protocols” means in practice — agents almost never speak EPP raw;
              they call registrar APIs and publish DNS.
            </p>
          </SectionHead>
          <div
            className="overflow-x-auto shine-border relative isolate rounded-2xl border"
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
            <table className="relative z-[1] w-full text-left text-xs sm:text-sm min-w-[520px]">
              <thead>
                <tr style={thStyle} className={isLight ? 'text-slate-600' : 'text-white/55'}>
                  <th className="px-4 py-3 font-bold">Protocol</th>
                  <th className="px-4 py-3 font-bold">Role</th>
                  <th className="px-4 py-3 font-bold">Layer</th>
                </tr>
              </thead>
              <tbody>
                {PROTOCOLS.map((p) => (
                  <tr
                    key={p.name}
                    className="border-t"
                    style={{
                      borderColor: isLight ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)',
                      backgroundColor: plateFill,
                    }}
                  >
                    <td className={`px-4 py-3 font-semibold ${ink}`}>{p.name}</td>
                    <td className={`px-4 py-3 ${muted}`}>{p.role}</td>
                    <td className={`px-4 py-3 font-mono text-[11px] ${faint}`}>{p.layer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tiers */}
        <section className="mb-12">
          <SectionHead isLight={isLight} className="mb-5">
            <h2 className={`text-xl font-black tracking-tight mb-2 ${ink}`}>
              How {ADA_BRAND.shortName} fits — automation tiers
            </h2>
            <p className={`text-sm ${muted}`}>
              We ship trust before autonomy. Registration only after human confirm and hard budget.
            </p>
          </SectionHead>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIERS.map((t) => (
              <SolidPlate key={t.tier} isLight={isLight} className="shine-border rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className={`text-sm font-black ${ink}`}>{t.tier}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${muted}`}
                    style={{
                      backgroundColor: insetFill,
                      borderColor: isLight ? 'rgba(226,232,240,1)' : 'rgba(255,255,255,0.12)',
                    }}
                  >
                    {t.status}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${muted}`}>{t.behavior}</p>
              </SolidPlate>
            ))}
          </div>
        </section>

        {/* ANS callout */}
        <section className="mb-12">
          <SolidPlate isLight={isLight} className="shine-border rounded-2xl p-5 sm:p-6">
            <h2 className={`text-lg font-black tracking-tight mb-2 ${ink}`}>
              GoDaddy ANS vs brand domain APIs
            </h2>
            <p className={`text-sm leading-relaxed mb-4 ${muted}`}>
              <strong className={ink}>GoDaddy ANS</strong> (Agent Name Service) is Layer A: register an
              AI agent with domain-anchored identity, certificates, and discovery DNS — similar in
              spirit to registering a website domain, but for the agent itself. Complementary work
              from Infoblox (DNS-AID) focuses on discovery metadata over DNS.
            </p>
            <p className={`text-sm leading-relaxed mb-4 ${muted}`}>
              <strong className={ink}>GoDaddy Domains API</strong> (and Porkbun, Namecheap, Cloudflare,
              etc.) is Layer B: register <em>customer brand domains</em> and set DNS. Related
              infrastructure, separate integrations.
            </p>
            <Link
              href="/ada/docs/registrars"
              className={`inline-flex text-sm font-bold underline underline-offset-2 ${ink}`}
            >
              Full registrar matrix →
            </Link>
          </SolidPlate>
        </section>

        {/* Sources */}
        <section className="mb-10">
          <SolidPlate isLight={isLight} className="rounded-2xl p-5 sm:p-6">
            <h2 className={`text-lg font-black tracking-tight mb-3 ${ink}`}>Public sources</h2>
            <ul className="space-y-2">
              {SOURCES.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs sm:text-sm underline underline-offset-2 ${
                      isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className={`text-[11px] mt-4 ${faint}`}>
              Some ANS console deep links require login; public blog and press posts describe the same
              direction. Matrix facts are for engineering evaluation — not partnership endorsements.
            </p>
          </SolidPlate>
        </section>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/ada/docs/registrars"
            className={`relative isolate rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            Registrar matrix
          </Link>
          <Link
            href="/ada/docs"
            className={`relative isolate rounded-2xl border px-5 py-2.5 text-sm font-bold ${ink}`}
            style={{
              backgroundColor: plateFill,
              borderColor: isLight ? 'rgba(226,232,240,1)' : 'rgba(255,255,255,0.12)',
            }}
          >
            Agent docs &amp; MCP
          </Link>
          <Link
            href="/ada/app"
            className={`relative isolate rounded-2xl border px-5 py-2.5 text-sm font-bold ${muted}`}
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
