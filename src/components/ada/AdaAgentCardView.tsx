'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import type { AgentCard } from '@/lib/agentCard';
import { adaPath } from '@/lib/adaConfig';

/**
 * Opaque plate — inline fill so ambient dots never show through cards/text.
 * Same formula as /ada/docs and home tools cards.
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
  tone?: 'surface' | 'inset' | 'code' | 'hero';
}) {
  const fill =
    tone === 'code'
      ? isLight
        ? '#020617'
        : '#0a0a0c'
      : tone === 'inset'
        ? isLight
          ? '#f8fafc'
          : '#121214'
        : tone === 'hero'
          ? isLight
            ? '#ffffff'
            : '#050505'
          : isLight
            ? '#ffffff'
            : '#0c0c0e';
  const border =
    tone === 'code'
      ? isLight
        ? 'border-slate-800'
        : 'border-white/10'
      : isLight
        ? 'border-slate-200'
        : 'border-white/10';

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

export function AdaAgentCardView() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [card, setCard] = React.useState<AgentCard | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  React.useEffect(() => {
    fetch('/ada/.well-known/agent-card.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setCard)
      .catch((e) => setError(e.message || 'Failed to load agent card'));
  }, []);

  const ink = isLight ? 'text-slate-900' : 'text-white';
  const muted = isLight ? 'text-slate-600' : 'text-white/55';
  const faint = isLight ? 'text-slate-500' : 'text-white/40';
  const plateFill = isLight ? '#ffffff' : '#0c0c0e';
  const chipFill = isLight ? '#f8fafc' : '#121214';
  const btnGhost = isLight
    ? 'border-slate-200 text-slate-700'
    : 'border-white/15 text-white/80';

  const copyJson = async () => {
    if (!card) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(card, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative z-10 px-3 sm:px-6 py-6 sm:py-14">
      <div className="max-w-5xl mx-auto">
        {/* Hero — compact on mobile, full air on sm+ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <SolidPlate
            isLight={isLight}
            tone="hero"
            className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 mb-4 sm:mb-8"
          >
            <p
              className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] mb-1 sm:mb-2 ${faint}`}
            >
              Discoverable · ANS-inspired
            </p>
            <h1
              className={`text-2xl sm:text-4xl font-black tracking-tight mb-1.5 sm:mb-2 ${ink}`}
            >
              Agent Card
            </h1>
            <p
              className={`text-xs sm:text-base max-w-2xl leading-snug sm:leading-relaxed mb-3.5 sm:mb-6 ${muted}`}
            >
              Machine-readable capability document for AI Domain Assistant. Agents fetch this to learn
              endpoints, tools, budget rules, and hard constraints — before calling MCP.
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <a
                href={adaPath("/.well-known/agent-card.json")}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative isolate cta-mobile-tap rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold ${
                  isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                }`}
              >
                Open raw JSON
              </a>
              <button
                type="button"
                onClick={copyJson}
                className={`relative isolate cta-mobile-tap rounded-lg sm:rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold ${btnGhost}`}
                style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
              >
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
              <Link
                href={adaPath("/docs#integration")}
                className={`relative isolate cta-mobile-tap rounded-lg sm:rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold ${btnGhost}`}
                style={{ backgroundColor: isLight ? '#ffffff' : '#0c0c0e' }}
              >
                Integration
              </Link>
            </div>
          </SolidPlate>
        </motion.div>

        {error && (
          <div
            className={`relative isolate overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-4 text-xs sm:text-sm ${
              isLight
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-rose-500/30 text-rose-200'
            }`}
            style={isLight ? undefined : { backgroundColor: '#140a0c' }}
          >
            {error}
          </div>
        )}

        {!card && !error && (
          <SolidPlate
            isLight={isLight}
            className="shine-border rounded-xl sm:rounded-2xl p-4 sm:p-8 animate-pulse"
          >
            <div className={`h-3.5 sm:h-4 w-32 sm:w-40 rounded mb-3 sm:mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#121214]'}`} />
            <div className={`h-2.5 sm:h-3 w-full rounded mb-2 ${isLight ? 'bg-slate-100' : 'bg-[#121214]'}`} />
            <div className={`h-2.5 sm:h-3 w-5/6 rounded ${isLight ? 'bg-slate-100' : 'bg-[#121214]'}`} />
          </SolidPlate>
        )}

        {card && (
          <div className="space-y-2.5 sm:space-y-4">
            {/* Identity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SolidPlate
                isLight={isLight}
                className="shine-border rounded-xl sm:rounded-3xl p-3.5 sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 mb-2.5 sm:mb-4">
                  <div className="min-w-0">
                    <h2 className={`text-base sm:text-xl font-black leading-tight ${ink}`}>
                      {card.name}
                    </h2>
                    <p className={`text-[10px] sm:text-xs font-mono mt-0.5 sm:mt-1 ${faint}`}>
                      v{card.version} · {card.schemaVersion}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {card.protocols.map((p) => (
                      <span
                        key={p}
                        className={`relative isolate rounded-full border px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${
                          isLight
                            ? 'border-slate-200 text-slate-600'
                            : 'border-white/12 text-white/55'
                        }`}
                        style={{ backgroundColor: chipFill }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <p className={`text-xs sm:text-sm leading-snug sm:leading-relaxed ${muted}`}>
                  {card.description}
                </p>
              </SolidPlate>
            </motion.div>

            {/* Constraints + Budget — denser mobile cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <SolidPlate
                  isLight={isLight}
                  className="shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 h-full"
                >
                  <h3 className={`text-xs sm:text-sm font-bold mb-2 sm:mb-3 ${ink}`}>
                    Constraints
                  </h3>
                  <ul className={`space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm ${muted}`}>
                    <li className="flex justify-between gap-2 items-baseline">
                      <span className="min-w-0">Registers domains</span>
                      <span className="font-mono font-bold text-rose-400 shrink-0 text-[10px] sm:text-sm">
                        {String(card.constraints.registersDomains)}
                      </span>
                    </li>
                    <li className="flex justify-between gap-2 items-baseline">
                      <span className="min-w-0">Modifies DNS</span>
                      <span className="font-mono font-bold text-rose-400 shrink-0 text-[10px] sm:text-sm">
                        {String(card.constraints.modifiesDns)}
                      </span>
                    </li>
                    <li className="flex justify-between gap-2 items-baseline">
                      <span className="min-w-0">Human confirm for purchase</span>
                      <span className="font-mono font-bold text-emerald-400 shrink-0 text-[10px] sm:text-sm">
                        {String(card.constraints.humanConfirmForPurchase)}
                      </span>
                    </li>
                    <li className="flex justify-between gap-2 items-baseline">
                      <span className="min-w-0">Invents prices</span>
                      <span className="font-mono font-bold text-rose-400 shrink-0 text-[10px] sm:text-sm">
                        {String(card.constraints.inventsPrices)}
                      </span>
                    </li>
                  </ul>
                </SolidPlate>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SolidPlate
                  isLight={isLight}
                  className="shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5 h-full"
                >
                  <h3 className={`text-xs sm:text-sm font-bold mb-2 sm:mb-3 ${ink}`}>Budget</h3>
                  <p className={`text-[11px] sm:text-sm mb-1.5 sm:mb-2 leading-snug ${muted}`}>
                    Parameter{' '}
                    <code className="font-mono font-semibold">{card.budget.parameter}</code> (
                    {card.budget.currency})
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                    {card.budget.statuses.map((s) => (
                      <span
                        key={s}
                        className={`relative isolate rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                          isLight ? 'text-slate-700' : 'text-white/70'
                        }`}
                        style={{ backgroundColor: chipFill }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className={`text-[10px] sm:text-xs leading-snug sm:leading-relaxed ${faint}`}>
                    {card.budget.notes}
                  </p>
                </SolidPlate>
              </motion.div>
            </div>

            {/* Capabilities — tighter chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <SolidPlate
                isLight={isLight}
                className="shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5"
              >
                <h3 className={`text-xs sm:text-sm font-bold mb-2 sm:mb-3 ${ink}`}>
                  Capabilities
                </h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {card.capabilities.map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.04 * i }}
                      className={`relative isolate rounded-full border px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold ${
                        isLight
                          ? 'border-slate-200 text-slate-700'
                          : 'border-white/12 text-white/65'
                      }`}
                      style={{ backgroundColor: chipFill }}
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
              </SolidPlate>
            </motion.div>

            {/* Tools — dense list rows */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <SolidPlate isLight={isLight} className="shine-border rounded-xl sm:rounded-2xl">
                <div
                  className={`px-3 sm:px-5 py-2 sm:py-3 border-b ${
                    isLight ? 'border-slate-200' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: isLight ? '#f8fafc' : '#121214' }}
                >
                  <h3 className={`text-xs sm:text-sm font-bold ${ink}`}>
                    Tools ({card.tools.length})
                  </h3>
                </div>
                <ul>
                  {card.tools.map((t, i) => (
                    <motion.li
                      key={t.name}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className={`px-3 sm:px-5 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4 border-t first:border-t-0 ${
                        isLight ? 'border-slate-100' : 'border-white/[0.08]'
                      }`}
                      style={{ backgroundColor: plateFill }}
                    >
                      <code
                        className={`text-[11px] sm:text-xs font-bold font-mono shrink-0 leading-tight ${ink}`}
                      >
                        {t.name}
                      </code>
                      <span className={`text-[10px] sm:text-xs leading-snug ${muted}`}>
                        {t.description}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </SolidPlate>
            </motion.div>

            {/* Endpoints */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <SolidPlate
                isLight={isLight}
                className="shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5"
              >
                <h3 className={`text-xs sm:text-sm font-bold mb-2 sm:mb-3 ${ink}`}>
                  Endpoints
                </h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {Object.entries(card.endpoints).map(([k, v]) => (
                    <li
                      key={k}
                      className="text-[10px] sm:text-sm flex flex-col sm:flex-row sm:gap-3 gap-0.5"
                    >
                      <span
                        className={`font-mono font-bold shrink-0 sm:w-28 leading-tight ${faint}`}
                      >
                        {k}
                      </span>
                      <a
                        href={v.startsWith('http') ? v : v}
                        className={`font-mono break-all underline-offset-2 hover:underline leading-snug ${muted}`}
                      >
                        {v}
                      </a>
                    </li>
                  ))}
                </ul>
              </SolidPlate>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SolidPlate
                isLight={isLight}
                className="shine-border rounded-xl sm:rounded-2xl p-3 sm:p-5"
              >
                <h3 className={`text-xs sm:text-sm font-bold mb-2 sm:mb-3 ${ink}`}>
                  Security recommendations
                </h3>
                <ul className={`space-y-1 sm:space-y-1.5 text-[11px] sm:text-sm leading-snug ${muted}`}>
                  {card.security.recommendations.map((r) => (
                    <li key={r} className="flex gap-1.5">
                      <span className="shrink-0 opacity-50">·</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className={`mt-2 sm:mt-3 text-[10px] sm:text-xs ${faint}`}>
                  Auth: {card.security.auth.join(' · ')}
                </p>
              </SolidPlate>
            </motion.div>

            {/* Raw JSON — capped height on mobile */}
            <SolidPlate
              isLight={isLight}
              tone="code"
              className="rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-[9px] sm:text-[11px] font-mono overflow-x-auto leading-snug sm:leading-relaxed max-h-48 sm:max-h-80 text-emerald-100/90"
            >
              <pre className="whitespace-pre">{JSON.stringify(card, null, 2)}</pre>
            </SolidPlate>
          </div>
        )}
      </div>
    </div>
  );
}
