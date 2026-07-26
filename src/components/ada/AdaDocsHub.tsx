'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ADA_BRAND } from '@/lib/adaConfig';

const ease = [0.22, 1, 0.36, 1] as const;

const TOOLS: { name: string; description: string; badge?: string }[] = [
  {
    name: 'find_brand_domains',
    description: 'Primary auto path: brief → generate → Instant Domain check → rank → shortlist under budget.',
    badge: 'Primary',
  },
  { name: 'get_product_facts', description: 'Canonical product facts agents can cite without scraping UI.' },
  { name: 'parse_business_brief', description: 'Free text → structured DomainBrief (style, TLDs, keywords).' },
  { name: 'generate_domain_names', description: 'Vertical brand candidates from brief/keywords (local strategies).' },
  { name: 'check_domain_availability', description: 'Live availability via Instant Domain MCP (same free stack as the site).' },
  { name: 'rank_domains', description: 'Explainable scores: brand fit, length, TLD, availability, budget flags.' },
  { name: 'whois_lookup', description: 'Public WHOIS / RDAP registration snapshot.' },
  { name: 'generate_geo_domains', description: 'City / region + niche patterns for local brands.' },
  { name: 'compare_tld_prices', description: 'Research-style TLD price signals (not checkout).' },
  { name: 'list_agent_skills', description: 'Catalog of L0–L3 skill layers (research core, BYOK LLM, registrar opt-in).' },
  { name: 'list_agent_registrars', description: 'Which registrar adapters are wired and their mutation posture.' },
  {
    name: 'register_domain',
    description: 'Opt-in L3: BYOK registrar register with dry-run + human confirm (flag-gated).',
    badge: 'Opt-in',
  },
  {
    name: 'set_dns_records',
    description: 'Opt-in L3: BYOK DNS mutations with dry-run + human confirm (flag-gated).',
    badge: 'Opt-in',
  },
];

const INTEGRATION_STEPS = [
  {
    n: '01',
    t: 'Discover Agent Card',
    d: 'Fetch the public Agent Card for endpoints, tools, and hard constraints.',
    links: [
      { href: '/ada/.well-known/agent-card.json', label: 'ADA card JSON' },
      { href: '/ada/agent-card', label: 'Card UI' },
    ],
  },
  {
    n: '02',
    t: 'Connect MCP or REST',
    d: 'HTTP JSON-RPC at /api/mcp, stdio via npm run mcp:server, or POST /api/agent/auto.',
    links: [
      { href: '/api/mcp', label: '/api/mcp' },
      { href: '/api/agent/auto', label: '/api/agent/auto' },
    ],
  },
  {
    n: '03',
    t: 'Call find_brand_domains',
    d: 'Pass business text, preferred TLDs, include/avoid, strategies, and maxBudgetUsd.',
    links: [{ href: '#examples', label: 'Copy examples' }],
  },
  {
    n: '04',
    t: 'Read shortlist + budgetStatus',
    d: 'within · over · unknown — never invent prices. Prefer available, in-budget names.',
    links: [{ href: '#budget', label: 'Budget contract' }],
  },
  {
    n: '05',
    t: 'Human confirms',
    d: 'Default path is research-only. Optional registrar BYOK requires explicit confirm + feature flag.',
    links: [{ href: '/ada/docs/registrars', label: 'Registrar matrix' }],
  },
];

function CodeBlock({
  title,
  code,
  isLight,
}: {
  title: string;
  code: string;
  isLight: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`group relative isolate overflow-hidden rounded-xl sm:rounded-2xl border ${
        isLight
          ? 'border-slate-200/90 bg-[#0b0c0f] shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)]'
          : 'border-white/[0.1] bg-[#0a0a0c] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)]'
      }`}
    >
      <div
        className={`flex items-center justify-between gap-2 sm:gap-3 border-b px-2.5 sm:px-4 py-1.5 sm:py-2.5 ${
          isLight ? 'border-white/[0.08]' : 'border-white/[0.08]'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="hidden sm:flex gap-1" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
          </span>
          <span className="truncate text-[10px] sm:text-[11px] font-bold tracking-wide text-white/55">{title}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`shrink-0 rounded-md sm:rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide transition ${
            copied
              ? 'bg-white text-black'
              : 'bg-[#121214] text-white/55 hover:bg-[#1a1a1e] hover:text-white/90'
          }`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-2.5 sm:p-4 text-[10px] sm:text-[12px] leading-snug sm:leading-relaxed font-mono text-[#d4e5d8] whitespace-pre-wrap max-h-48 sm:max-h-none">
        {code}
      </pre>
    </div>
  );
}

function SectionLabel({
  children,
  isLight,
}: {
  children: React.ReactNode;
  isLight: boolean;
}) {
  return (
    <div className="relative mb-1.5 sm:mb-3 inline-flex items-center gap-2 sm:gap-2.5">
      <span className={`h-px w-5 sm:w-6 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
      <p
        className={`relative z-[1] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] ${
          isLight ? 'text-slate-500' : 'text-white/40'
        }`}
      >
        {children}
      </p>
    </div>
  );
}

/** Solid-ish plate so ambient dots don’t comb through free-standing section titles */
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
          // Near-opaque core, soft fade only at far edges
          background: isLight
            ? 'radial-gradient(ellipse 100% 100% at 20% 40%, #f8fafc 0%, #f8fafc 55%, rgba(248,250,252,0) 100%)'
            : 'radial-gradient(ellipse 100% 100% at 20% 40%, #050505 0%, #050505 58%, rgba(5,5,5,0) 100%)',
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/**
 * Opaque card shell — inline backgroundColor so ambient canvas never shows through.
 * Same formula as home tools cards.
 */
function SolidPlate({
  isLight,
  children,
  className = '',
  tone = 'surface',
  as: Tag = 'div',
}: {
  isLight: boolean;
  children: React.ReactNode;
  className?: string;
  tone?: 'surface' | 'inset' | 'safety';
  as?: 'div' | 'section' | 'article';
}) {
  const fill =
    tone === 'safety'
      ? isLight
        ? '#fffbeb'
        : '#0c0c0e'
      : tone === 'inset'
        ? isLight
          ? '#f8fafc'
          : '#121214'
        : isLight
          ? '#ffffff'
          : '#0c0c0e';
  const border =
    tone === 'safety'
      ? isLight
        ? 'border-amber-200'
        : 'border-amber-500/30'
      : isLight
        ? 'border-slate-200'
        : 'border-white/10';

  return (
    <Tag
      className={`relative isolate overflow-hidden rounded-[1.35rem] border ${border} ${className}`}
      style={{ backgroundColor: fill }}
    >
      {/* Forced opaque slab — beats any transparent utility / blend */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ backgroundColor: fill }}
      />
      <div className="relative z-[1]">{children}</div>
    </Tag>
  );
}

export function AdaDocsHub() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('integration');

  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  const base =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5001';

  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/55';
  const faint = isLight ? 'text-slate-500' : 'text-white/40';
  const hair = isLight ? 'border-slate-200' : 'border-white/[0.09]';
  // Opaque fills — always pair with style={{ backgroundColor: plateFill }} where possible
  const plateFill = isLight ? '#ffffff' : '#0c0c0e';
  const insetFill = isLight ? '#f8fafc' : '#121214';
  const surface = isLight
    ? 'border-slate-200 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)]'
    : 'border-white/10 shadow-[0_24px_56px_-36px_rgba(0,0,0,0.9)]';
  const inset = isLight ? 'border-slate-200' : 'border-white/10';
  const chip = isLight
    ? 'border-slate-200 bg-white text-slate-600'
    : 'border-white/12 bg-[#0a0a0c] text-white/55';
  const chipSolid = isLight
    ? 'border-slate-200 bg-white text-slate-700'
    : 'border-white/12 bg-[#121214] text-white/70';
  const btnGhost = isLight
    ? 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
    : 'border-white/12 bg-[#0a0a0c] text-white/85 hover:border-white/25';

  const curlList = `curl -s -X POST ${base}/api/mcp \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

  const curlFind = `curl -s -X POST ${base}/api/mcp \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "find_brand_domains",
      "arguments": {
        "text": "AI scheduling SaaS for dental clinics",
        "count": 8,
        "style": "brandable",
        "maxBudgetUsd": 20,
        "skipAvailability": false
      }
    }
  }'`;

  const curlChat = `curl -s -X POST ${base}/api/ada/chat \\
  -H 'Content-Type: application/json' \\
  -d '{
    "client": "agent",
    "skipIntake": true,
    "maxBudgetUsd": 20,
    "messages": [
      {
        "role": "user",
        "content": "Gym for busy professionals. Extensions: .com .fit. Include: fit, strength. Avoid: cheap. Strategies: radio test, brandable, available first."
      }
    ]
  }'`;

  const curlFindFull = `curl -s -X POST ${base}/api/agent/auto \\
  -H 'Content-Type: application/json' \\
  -d '{
    "text": "Fitness gym for professionals",
    "maxBudgetUsd": 20,
    "brief": {
      "preferredTlds": [".com", ".fit"],
      "mustInclude": ["fit", "strength"],
      "avoid": ["cheap"],
      "strategies": ["available_first", "radio_test", "brandable", "short", "no_hyphen"]
    }
  }'`;

  const curlAuto = `curl -s -X POST ${base}/api/agent/auto \\
  -H 'Content-Type: application/json' \\
  -d '{
    "text": "Eco meal kits for busy families",
    "maxBudgetUsd": 20,
    "brief": { "count": 10, "style": "mixed" }
  }'`;

  const mcpConfig = `{
  "mcpServers": {
    "domaindiscovery": {
      "command": "node",
      "args": ["scripts/mcp-domaindiscovery.mjs"],
      "cwd": "/absolute/path/to/DomainDiscovery"
    }
  }
}`;

  const toc = [
    { id: 'integration', label: 'Integration' },
    { id: 'tools', label: 'Tool catalog' },
    { id: 'examples', label: 'Examples' },
    { id: 'budget', label: 'Budget' },
    { id: 'security', label: 'Security' },
    { id: 'endpoints', label: 'Endpoints' },
  ];

  React.useEffect(() => {
    const ids = toc.map((t) => t.id);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.4, 0.7] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Honor deep links like /ada/docs#integration after layout paints
  React.useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [mounted]);

  return (
    <div className="relative">
      {/* Hero — compact on mobile */}
      <section className="relative z-10 px-3 sm:px-6 pt-6 sm:pt-16 pb-4 sm:pb-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="relative max-w-3xl isolate overflow-hidden rounded-2xl sm:rounded-3xl border p-3.5 sm:p-8"
            style={{
              backgroundColor: isLight ? '#ffffff' : '#050505',
              borderColor: isLight ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)',
            }}
          >
            {/* Double slab — guarantees full opacity over canvas */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ backgroundColor: isLight ? '#ffffff' : '#050505' }}
            />
            <div className="relative z-[1]">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] isolate ${chip}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-slate-500' : 'bg-white/50'}`} />
                  Agent docs · MCP · REST
                </span>
                <span
                  className={`inline-flex rounded-full border px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] isolate ${chip}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
                >
                  {ADA_BRAND.shortName}
                </span>
              </div>

              <h1 className={`text-[1.55rem] sm:text-5xl font-black tracking-tight leading-[1.1] mb-2 sm:mb-4 ${ink}`}>
                Connect agents in
                <br />
                <span className={isLight ? 'text-slate-600' : 'text-white/55'}>minutes, not weeks</span>
              </h1>
              <p className={`text-[12px] sm:text-lg leading-snug sm:leading-relaxed max-w-2xl mb-3.5 sm:mb-7 ${muted}`}>
                <span className="sm:hidden">
                  Discovery, MCP, REST, budget contract &amp; examples for {ADA_BRAND.shortName}. Research default.
                </span>
                <span className="hidden sm:inline">
                  Everything an AI agent or developer needs for {ADA_BRAND.name}: discovery, MCP, REST,
                  budget contract, security boundaries, and copy-paste examples. Research by default —
                  humans confirm registration (optional BYOK is flag-gated).
                </span>
              </p>

              <div className="flex flex-wrap gap-1.5 sm:gap-2.5">
                <a
                  href="#integration"
                  className={`relative isolate rounded-lg sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition shadow-lg ${
                    isLight
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/15'
                      : 'bg-white text-black hover:bg-white/95 shadow-white/10'
                  }`}
                >
                  Start with integration
                </a>
                <Link
                  href="/ada/chat"
                  className={`relative isolate rounded-lg sm:rounded-2xl border px-3 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition ${btnGhost}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
                >
                  Open chat
                </Link>
                <Link
                  href="/ada/agent-card"
                  className={`relative isolate rounded-lg sm:rounded-2xl border px-3 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition ${btnGhost}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
                >
                  Agent Card
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick capability strip — denser on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className={`relative isolate mt-4 sm:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-xl sm:rounded-[1.35rem] border ${hair} ${
              isLight ? 'bg-slate-200' : 'bg-[#1a1a1e]'
            }`}
          >
            {[
              { k: '9+', v: 'MCP tools', s: 'find_brand_domains + more' },
              { k: 'USD', v: 'Budget filter', s: 'Hard maxBudgetUsd cap' },
              { k: 'JSON', v: 'Agent Card', s: 'ANS-style discovery' },
              { k: 'off', v: 'Auto-buy', s: 'Human confirm required' },
            ].map((x) => (
              <div
                key={x.v}
                className="relative isolate px-2.5 py-2.5 sm:px-5 sm:py-5"
                style={{ backgroundColor: plateFill }}
              >
                <p className={`text-base sm:text-2xl font-black tracking-tight ${ink}`}>{x.k}</p>
                <p className={`text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-1 ${ink}`}>{x.v}</p>
                <p className={`text-[9.5px] sm:text-[11px] mt-0.5 leading-snug ${faint}`}>{x.s}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Body + sticky TOC */}
      <section className="relative px-3 sm:px-6 pb-12 sm:pb-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[200px_1fr] gap-4 sm:gap-8 lg:gap-12">
          {/* TOC — one solid sticky panel (no dots under nav or “Also explore”) */}
          <aside className="hidden lg:block relative z-10">
            <div
              className="sticky top-24 relative isolate overflow-hidden rounded-2xl border p-3 sm:p-3.5 space-y-4"
              style={{
                backgroundColor: isLight ? '#ffffff' : '#050505',
                borderColor: isLight ? 'rgba(226,232,240,0.95)' : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{ backgroundColor: isLight ? '#ffffff' : '#050505' }}
              />
              <div className="relative z-[1]">
                <p className={`text-[10px] font-bold uppercase tracking-[0.16em] px-1 mb-2 ${faint}`}>
                  On this page
                </p>
                <nav className="space-y-0.5">
                  {toc.map((t) => {
                    const active = activeSection === t.id;
                    return (
                      <a
                        key={t.id}
                        href={`#${t.id}`}
                        className={`block rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                          active
                            ? isLight
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-black'
                            : isLight
                              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              : 'text-white/45 hover:text-white/90 hover:bg-[#121214]'
                        }`}
                      >
                        {t.label}
                      </a>
                    );
                  })}
                </nav>
              </div>

              <div
                className="relative z-[1] rounded-xl border p-3"
                style={{
                  backgroundColor: isLight ? '#f8fafc' : '#0c0c0e',
                  borderColor: isLight ? 'rgba(226,232,240,1)' : 'rgba(255,255,255,0.1)',
                }}
              >
                <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${faint}`}>
                  Also explore
                </p>
                <div className="mt-2 space-y-1">
                  {[
                    { href: '/ada/docs/industry', label: 'Industry research' },
                    { href: '/ada/docs/registrars', label: 'Registrar matrix' },
                    { href: '/ada/app', label: 'Structured app' },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`group/ex flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-[11px] font-semibold transition ${
                        isLight
                          ? 'text-slate-600 hover:bg-white hover:text-slate-900'
                          : 'text-white/50 hover:bg-[#121214] hover:text-white/90'
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="opacity-50 transition-transform group-hover/ex:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-5 sm:space-y-11">
            {/* Mobile jump chips — solid fills, compact */}
            <div className="flex lg:hidden flex-wrap gap-1 -mt-1">
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className={`relative isolate rounded-lg border px-2 py-1 text-[10px] font-bold ${chip}`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
                >
                  {t.label}
                </a>
              ))}
            </div>

            {/* INTEGRATION — compact premium pipeline */}
            <motion.section
              id="integration"
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease }}
            >
              <SectionHead isLight={isLight} className="mb-2.5 sm:mb-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5 sm:gap-3">
                  <div className="min-w-0">
                    <SectionLabel isLight={isLight}>Integration</SectionLabel>
                    <h2 className={`text-base sm:text-2xl font-black tracking-tight ${ink}`}>
                      Zero to shortlist in five steps
                    </h2>
                    <p className={`mt-1 text-[11px] sm:text-sm leading-snug max-w-xl ${muted}`}>
                      Wire MCP or HTTP once — same tools as the product surface.
                    </p>
                  </div>
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] shrink-0 ${faint}`}>
                    5 steps · research only
                  </p>
                </div>
              </SectionHead>

              <div
                className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-2xl border ${surface}`}
                style={{ backgroundColor: plateFill }}
              >
                <ol className="relative z-[1]">
                  {INTEGRATION_STEPS.map((step, i) => {
                    const isLast = i === INTEGRATION_STEPS.length - 1;
                    return (
                      <motion.li
                        key={step.n}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.03 * i, duration: 0.35, ease }}
                        className={`group/step relative flex gap-2 sm:gap-3.5 px-2.5 sm:px-4 py-2 sm:py-3.5 ${
                          !isLast
                            ? isLight
                              ? 'border-b border-slate-100'
                              : 'border-b border-white/[0.08]'
                            : ''
                        }`}
                      >
                        {/* Number + rail */}
                        <div className="relative flex w-7 sm:w-9 shrink-0 flex-col items-center">
                          <span
                            className={`relative z-[1] flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-black tabular-nums transition-all duration-300 ${
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-700 group-hover/step:border-slate-900 group-hover/step:bg-slate-900 group-hover/step:text-white'
                                : 'border-white/10 bg-[#121214] text-white/80 group-hover/step:border-white/30 group-hover/step:bg-white group-hover/step:text-black group-hover/step:shadow-[0_0_24px_-6px_rgba(255,255,255,0.4)]'
                            }`}
                          >
                            {step.n}
                          </span>
                          {!isLast && (
                            <span
                              aria-hidden
                              className={`absolute top-7 sm:top-9 bottom-[-0.65rem] sm:bottom-[-0.85rem] w-px ${
                                isLight ? 'bg-slate-200' : 'bg-white/15'
                              }`}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                            <h3 className={`text-[12px] sm:text-sm font-black tracking-tight ${ink}`}>
                              {step.t}
                            </h3>
                            {step.links?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {step.links.map((l) =>
                                  l.href.startsWith('#') ? (
                                    <a
                                      key={l.href}
                                      href={l.href}
                                      className={`relative isolate rounded-full border px-2 py-0.5 text-[9px] font-bold transition ${chipSolid} ${
                                        isLight
                                          ? 'hover:border-slate-400'
                                          : 'hover:border-white/25 hover:text-white/90'
                                      }`}
                                    >
                                      {l.label}
                                    </a>
                                  ) : (
                                    <Link
                                      key={l.href}
                                      href={l.href}
                                      className={`relative isolate rounded-full border px-2 py-0.5 text-[9px] font-bold transition ${chipSolid} ${
                                        isLight
                                          ? 'hover:border-slate-400'
                                          : 'hover:border-white/25 hover:text-white/90'
                                      }`}
                                    >
                                      {l.label}
                                    </Link>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                          <p className={`mt-0.5 text-[10.5px] sm:text-[12px] leading-snug ${muted}`}>
                            {step.d}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </div>

              {/* Connect channels — dense 2×2 */}
              <div className="mt-2.5 sm:mt-3.5 grid grid-cols-2 gap-1.5 sm:gap-2.5">
                {[
                  {
                    t: 'Agent Card',
                    d: 'ANS-style discovery: capabilities, endpoints, constraints.',
                    href: '/ada/.well-known/agent-card.json',
                    meta: 'JSON',
                  },
                  {
                    t: 'MCP HTTP',
                    d: 'JSON-RPC tools/list + tools/call on one POST endpoint.',
                    href: '/api/mcp',
                    meta: 'POST',
                  },
                  {
                    t: 'REST auto',
                    d: 'One-shot shortlist with optional async job polling.',
                    href: '/api/agent/auto',
                    meta: 'POST',
                  },
                  {
                    t: 'Conversational',
                    d: 'Multi-turn intake + skipIntake for orchestrators.',
                    href: '/api/ada/chat',
                    meta: 'Chat',
                  },
                ].map((c, i) => (
                  <motion.div
                    key={c.t}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.04 * i, duration: 0.35, ease }}
                  >
                    <Link
                      href={c.href}
                      className={`cta-shine cta-shine-secondary group/ch shine-border relative isolate flex h-full flex-col overflow-hidden rounded-lg sm:rounded-xl border p-2 sm:p-3.5 transition-all duration-300 ${surface} ${
                        isLight
                          ? 'hover:border-slate-300'
                          : 'hover:border-white/18'
                      }`}
                      style={{ backgroundColor: plateFill }}
                    >
                      <span className="cta-shine-sweep" aria-hidden />
                      <div className="relative z-[3] flex items-start justify-between gap-1.5 mb-1 sm:mb-1.5">
                        <p className={`text-[11px] sm:text-[13px] font-black tracking-tight leading-tight ${ink}`}>{c.t}</p>
                        <span
                          className={`shrink-0 rounded-md border px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold uppercase tracking-wide ${chipSolid}`}
                        >
                          {c.meta}
                        </span>
                      </div>
                      <p className={`relative z-[3] text-[10px] sm:text-[11px] leading-snug flex-1 ${muted}`}>{c.d}</p>
                      <p
                        className={`relative z-[3] mt-2.5 text-[11px] font-bold transition-all duration-300 ${
                          isLight
                            ? 'text-slate-500 group-hover/ch:text-slate-900'
                            : 'text-white/40 group-hover/ch:text-white/90'
                        }`}
                      >
                        Open
                        <span className="inline-block transition-transform duration-300 group-hover/ch:translate-x-0.5">
                          {' '}
                          →
                        </span>
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* TOOLS */}
            <motion.section
              id="tools"
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
            >
              <SectionHead isLight={isLight} className="mb-2.5 sm:mb-6">
                <SectionLabel isLight={isLight}>Tool catalog</SectionLabel>
                <h2 className={`text-base sm:text-3xl font-black tracking-tight mb-1.5 sm:mb-3 ${ink}`}>
                  Machine-callable capabilities
                </h2>
                <p className={`text-[11px] sm:text-sm leading-snug sm:leading-relaxed max-w-2xl ${muted}`}>
                  Prefer <code className="font-mono text-[11px] sm:text-[12px]">find_brand_domains</code> for end-to-end
                  shortlists. Granular tools support custom pipelines.
                </p>
              </SectionHead>

              <div
                className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-[1.35rem] border ${surface}`}
                style={{ backgroundColor: plateFill }}
              >
                <div
                  className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] gap-0 border-b px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    isLight
                      ? 'border-slate-100 bg-slate-50 text-slate-400'
                      : 'border-white/[0.08] bg-[#121214] text-white/35'
                  }`}
                >
                  <span>Tool</span>
                  <span>What it does</span>
                </div>
                {TOOLS.map((t, i) => (
                  <div
                    key={t.name}
                    className={`grid grid-cols-1 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] gap-0.5 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-3.5 ${
                      i < TOOLS.length - 1
                        ? isLight
                          ? 'border-b border-slate-100'
                          : 'border-b border-white/[0.06]'
                        : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                      <code className={`text-[11px] sm:text-[13px] font-semibold font-mono ${ink}`}>
                        {t.name}
                      </code>
                      {t.badge && (
                        <span
                          className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide ${
                            isLight
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-black'
                          }`}
                        >
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10.5px] sm:text-[13px] leading-snug sm:leading-relaxed ${muted}`}>{t.description}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* EXAMPLES */}
            <motion.section
              id="examples"
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
            >
              <SectionHead isLight={isLight} className="mb-2.5 sm:mb-6">
                <SectionLabel isLight={isLight}>Examples</SectionLabel>
                <h2 className={`text-base sm:text-3xl font-black tracking-tight mb-1.5 sm:mb-3 ${ink}`}>
                  Copy-paste agent calls
                </h2>
                <p className={`text-[11px] sm:text-sm leading-snug sm:leading-relaxed max-w-2xl ${muted}`}>
                  Production-ready snippets against this origin. Swap the host when you deploy.
                </p>
              </SectionHead>

              <div className="grid lg:grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-2 sm:space-y-3">
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] ${faint}`}>MCP · HTTP</p>
                  <CodeBlock title="tools/list" code={curlList} isLight={isLight} />
                  <CodeBlock title="find_brand_domains · $20 budget" code={curlFind} isLight={isLight} />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] ${faint}`}>REST · Chat · stdio</p>
                  <CodeBlock title="POST /api/agent/auto" code={curlAuto} isLight={isLight} />
                  <CodeBlock
                    title="POST /api/agent/auto · TLDs + strategies"
                    code={curlFindFull}
                    isLight={isLight}
                  />
                  <CodeBlock title="POST /api/ada/chat · agents" code={curlChat} isLight={isLight} />
                  <CodeBlock title="Cursor / Claude Desktop (stdio)" code={mcpConfig} isLight={isLight} />
                </div>
              </div>
            </motion.section>

            {/* BUDGET */}
            <motion.section
              id="budget"
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
            >
              <SectionHead isLight={isLight} className="mb-2.5 sm:mb-4">
                <SectionLabel isLight={isLight}>Budget contract</SectionLabel>
              </SectionHead>
              <div
                className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-[1.5rem] border p-3.5 sm:p-8 ${surface}`}
                style={{ backgroundColor: plateFill }}
              >
                <h2 className={`relative z-[1] text-base sm:text-2xl font-black tracking-tight mb-1.5 sm:mb-3 ${ink}`}>
                  Hard caps agents can trust
                </h2>
                <p className={`relative z-[1] text-[11px] sm:text-sm leading-snug sm:leading-relaxed mb-3 sm:mb-6 ${muted}`}>
                  Pass <code className="font-mono text-[11px] sm:text-[12px]">maxBudgetUsd</code> (e.g.{' '}
                  <code className="font-mono text-[11px] sm:text-[12px]">20</code>). Every ranked name carries{' '}
                  <code className="font-mono text-[11px] sm:text-[12px]">budgetStatus</code>. Agents must not invent create fees.
                </p>
                <div className="relative z-[1] grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3">
                  {[
                    {
                      k: 'within',
                      d: 'Known research price ≤ budget. Prefer these first.',
                    },
                    {
                      k: 'unknown',
                      d: 'No reliable fee yet. Re-check at registrar checkout.',
                    },
                    {
                      k: 'over',
                      d: 'Above the hard cap. Keep out of primary shortlist.',
                    },
                  ].map((x) => (
                    <div
                      key={x.k}
                      className={`shine-border relative isolate overflow-hidden rounded-lg sm:rounded-2xl border p-2.5 sm:p-4 ${inset}`}
                      style={{ backgroundColor: insetFill }}
                    >
                      <code className={`text-[12px] sm:text-sm font-black font-mono ${ink}`}>{x.k}</code>
                      <p className={`mt-1 text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed ${muted}`}>{x.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* SECURITY */}
            <motion.section
              id="security"
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
            >
              <SectionHead isLight={isLight} className="mb-2.5 sm:mb-6">
                <SectionLabel isLight={isLight}>Security</SectionLabel>
                <h2 className={`text-base sm:text-3xl font-black tracking-tight mb-1.5 sm:mb-3 ${ink}`}>
                  Boundaries that compound trust
                </h2>
                <p className={`text-[11px] sm:text-sm leading-snug sm:leading-relaxed max-w-2xl ${muted}`}>
                  Agent-facing model for {ADA_BRAND.name}. Research tools are always free-path. Registrar/DNS mutations stay{' '}
                  <strong className={ink}>opt-in, dry-run first, human-confirmed, and flag-gated</strong>.
                </p>
              </SectionHead>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
                {[
                  {
                    t: 'Auth',
                    d: 'Optional AGENT_API_KEY via Authorization: Bearer or x-agent-api-key on MCP/HTTP.',
                  },
                  {
                    t: 'Budget hard filter',
                    d: 'maxBudgetUsd required for trustworthy agents. within / over / unknown only — never invent prices.',
                  },
                  {
                    t: 'No unattended spend',
                    d: 'Default posture: research only. register_domain / set_dns_records need BYOK + confirm + ADA_ENABLE_REGISTRAR_MUTATIONS.',
                  },
                  {
                    t: 'Snapshots',
                    d: 'Availability and prices change. Re-check at registrar before payment.',
                  },
                  {
                    t: 'Idempotent tools',
                    d: 'Safe to retry. Use job ids for long-running auto shortlists.',
                  },
                  {
                    t: 'Secrets',
                    d: 'Never put registrar API keys in browser bundles. Rate-limit agent callers.',
                  },
                ].map((x) => (
                  <div
                    key={x.t}
                    className={`shine-border relative isolate overflow-hidden rounded-lg sm:rounded-2xl border p-2.5 sm:p-5 ${surface}`}
                    style={{ backgroundColor: plateFill }}
                  >
                    <p className={`text-[12px] sm:text-sm font-black ${ink}`}>{x.t}</p>
                    <p className={`mt-1 text-[10.5px] sm:text-[13px] leading-snug sm:leading-relaxed ${muted}`}>{x.d}</p>
                  </div>
                ))}
              </div>

              <SolidPlate isLight={isLight} tone="inset" className="shine-border mt-2.5 sm:mt-4 rounded-xl sm:rounded-2xl p-3 sm:p-5">
                <p className={`text-[12px] sm:text-sm font-black mb-1 ${ink}`}>Industry direction</p>
                <p className={`text-[11px] sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
                  GoDaddy Agent Name Service (ANS) aims for DNS + certificate + Agent Card discovery. We
                  publish an Agent Card now; full ANS registration remains optional later. See{' '}
                  <Link href="/ada/docs/industry" className="font-semibold underline underline-offset-2">
                    industry research
                  </Link>
                  .
                </p>
              </SolidPlate>
            </motion.section>

            {/* ENDPOINTS */}
            <motion.section
              id="endpoints"
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
            >
              <SectionHead isLight={isLight} className="mb-2.5 sm:mb-4">
                <SectionLabel isLight={isLight}>Endpoints</SectionLabel>
              </SectionHead>
              <div
                className={`shine-border relative isolate overflow-hidden rounded-xl sm:rounded-[1.5rem] border ${surface}`}
                style={{ backgroundColor: plateFill }}
              >
                <div className="relative z-[1] p-3 sm:p-6 border-b border-inherit">
                  <h2 className={`text-base sm:text-2xl font-black tracking-tight ${ink}`}>Surface map</h2>
                  <p className={`mt-0.5 sm:mt-1 text-[11px] sm:text-sm ${muted}`}>
                    Local stdio: <code className="font-mono text-[11px] sm:text-[12px]">npm run mcp:server</code>
                  </p>
                </div>
                <ul className="divide-y divide-inherit">
                  {[
                    { path: '/api/mcp', d: 'MCP HTTP + JSON-RPC tools/list & tools/call' },
                    { path: '/api/agent/auto', d: 'Sync auto shortlist (budget-aware)' },
                    { path: '/api/ada/chat', d: 'Conversational intake + ranking for agents/humans' },
                    { path: '/api/agent/manifest', d: 'Machine-readable capabilities' },
                    { path: '/ada/.well-known/agent-card.json', d: 'ADA Agent Card' },
                    { path: '/llms.txt', d: 'Product index for assistants' },
                  ].map((e) => (
                    <li
                      key={e.path}
                      className={`flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3.5 ${
                        isLight ? 'border-slate-200/80' : 'border-white/[0.08]'
                      }`}
                    >
                      <Link
                        href={e.path}
                        className={`font-mono text-[11px] sm:text-[13px] font-semibold shrink-0 underline-offset-2 hover:underline break-all ${ink}`}
                      >
                        {e.path}
                      </Link>
                      <span className={`text-[10.5px] sm:text-sm ${muted}`}>{e.d}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className={`px-3 sm:px-6 py-2.5 sm:py-4 text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed ${
                    isLight ? 'bg-slate-50 text-slate-600' : 'bg-[#121214] text-white/45'
                  }`}
                >
                  Optional auth: set <code className="font-mono">AGENT_API_KEY</code> and send{' '}
                  <code className="font-mono">Authorization: Bearer …</code>. Full notes in{' '}
                  <span className="font-mono">docs/agent/MCP.md</span>.
                </div>
              </div>
            </motion.section>

            {/* Safety + roadmap — forced opaque plates (no dots inside) */}
            <div className="grid lg:grid-cols-2 gap-2 sm:gap-4">
              <SolidPlate isLight={isLight} tone="safety" className="p-3 sm:p-6">
                <p
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-1 sm:mb-2 ${
                    isLight ? 'text-amber-800/70' : 'text-[#c4a574]'
                  }`}
                >
                  Safety
                </p>
                <p className={`text-[12px] sm:text-sm font-black mb-1 sm:mb-2 ${ink}`}>Research only — no auto-spend</p>
                <p className={`text-[10.5px] sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
                  {ADA_BRAND.name} does not process domain payments or change DNS. Availability and price
                  signals can change. Registration happens at your registrar. Not trademark legal advice.
                </p>
              </SolidPlate>

              <SolidPlate isLight={isLight} tone="surface" className="p-3 sm:p-6">
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] mb-1 sm:mb-2 ${faint}`}>
                  Roadmap
                </p>
                <ul className={`space-y-1 sm:space-y-2 text-[10.5px] sm:text-sm ${muted}`}>
                  <li>
                    <strong className={ink}>Now · </strong>
                    Chat, brand brain, Instant Domain checks, budget flags, 13 MCP tools, opt-in registrar adapters.
                  </li>
                  <li>
                    <strong className={ink}>Next · </strong>
                    Always-on budget coaching, richer session memory across clients.
                  </li>
                  <li>
                    <strong className={ink}>Later · </strong>
                    Broader registrar coverage and safer multi-step automation with hard budget stops.
                  </li>
                </ul>
              </SolidPlate>
            </div>

            {/* Final CTA */}
            <SolidPlate
              isLight={isLight}
              tone="surface"
              className={`rounded-xl sm:rounded-[1.5rem] px-3.5 sm:px-10 py-5 sm:py-10 text-center ${surface}`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
                style={{
                  background: isLight
                    ? 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(15,23,42,0.05), transparent 65%)'
                    : 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.04), transparent 65%)',
                }}
              />
              <div className="relative z-[1]">
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-1 sm:mb-2 ${faint}`}>
                  {ADA_BRAND.domain}
                </p>
                <h2 className={`text-base sm:text-2xl font-black tracking-tight mb-1 sm:mb-2 ${ink}`}>
                  Ready to wire your agent?
                </h2>
                <p className={`text-[11px] sm:text-sm max-w-md mx-auto mb-3 sm:mb-6 ${muted}`}>
                  Fetch the Agent Card, call find_brand_domains, and ship a budget-safe shortlist.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5">
                  <Link
                    href="/ada/agent-card"
                    className={`relative isolate rounded-lg sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition ${
                      isLight
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-white text-black hover:bg-white/95'
                    }`}
                  >
                    View Agent Card
                  </Link>
                  <Link
                    href="/ada/chat"
                    className={`relative isolate rounded-lg sm:rounded-2xl border px-3 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition ${btnGhost}`}
                  >
                    Try chat
                  </Link>
                  <a
                    href="#examples"
                    className={`relative isolate rounded-lg sm:rounded-2xl border px-3 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-sm font-bold transition ${btnGhost}`}
                  >
                    Copy examples
                  </a>
                </div>
              </div>
            </SolidPlate>
          </div>
        </div>
      </section>
    </div>
  );
}
