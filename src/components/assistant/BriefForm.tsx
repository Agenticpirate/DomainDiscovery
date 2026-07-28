'use client';

import React from 'react';
import type { DomainStyle } from '@/lib/agent/types';
import { DOMAIN_STRATEGIES, type DomainNamingStrategy } from '@/lib/agent/domainStrategies';
import { ExamplePrompts } from './ExamplePrompts';
import {
  BUDGET_CURRENCIES,
  DEFAULT_FORM,
  TLD_OPTIONS,
  type AssistantFormState,
  type BudgetCurrency,
} from './types';

const STYLES: { id: DomainStyle; label: string }[] = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'brandable', label: 'Brandable' },
  { id: 'keyword', label: 'Keyword' },
  { id: 'geo', label: 'Geo / local' },
];

export function BriefForm({
  isLight,
  value,
  onChange,
  onSubmit,
  loading,
}: {
  isLight: boolean;
  value: AssistantFormState;
  onChange: (next: AssistantFormState) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const [advanced, setAdvanced] = React.useState(false);
  const set = <K extends keyof AssistantFormState>(key: K, v: AssistantFormState[K]) =>
    onChange({ ...value, [key]: v });

  const toggleTld = (tld: string) => {
    const has = value.preferredTlds.includes(tld);
    const next = has
      ? value.preferredTlds.filter((t) => t !== tld)
      : [...value.preferredTlds, tld];
    set('preferredTlds', next.length ? next : ['.com']);
  };

  const toggleStrategy = (id: DomainNamingStrategy) => {
    const has = value.strategies.includes(id);
    const next = has ? value.strategies.filter((s) => s !== id) : [...value.strategies, id];
    // always keep available_first if empty
    set('strategies', next.length ? next : ['available_first']);
  };

  const surface = isLight
    ? 'border-slate-200 bg-white shadow-sm'
    : 'border-white/10 bg-[#0a0a0c]';
  const field = isLight
    ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
    : 'border-white/12 bg-[#121214] text-white placeholder:text-white/30 focus:border-white/25';
  const chipOff = isLight
    ? 'border-slate-200 bg-white text-slate-600'
    : 'border-white/12 bg-[#121214] text-white/55';
  const chipOn = isLight
    ? 'bg-slate-900 text-white border-slate-900'
    : 'bg-white text-black border-white';

  return (
    <div className={`shine-border relative isolate overflow-hidden rounded-2xl border p-4 sm:p-5 ${surface}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
      />
      <div className="relative z-[1]">
      <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
        Describe your business
      </label>
      <textarea
        value={value.text}
        onChange={(e) => set('text', e.target.value)}
        rows={4}
        placeholder="e.g. AI scheduling SaaS for dental clinics that need automated appointments…"
        className={`w-full rounded-xl border px-3 py-2.5 text-sm leading-relaxed outline-none resize-y min-h-[96px] ${field}`}
      />

      <div className="mt-3">
        <p className={`text-[11px] font-semibold mb-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
          Try an example
        </p>
        <ExamplePrompts isLight={isLight} onPick={(t) => set('text', t)} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <label className={`text-xs font-semibold flex flex-wrap items-center gap-2 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
          <span className="shrink-0">Agent budget</span>
          <select
            value={value.budgetCurrency}
            onChange={(e) => set('budgetCurrency', e.target.value as BudgetCurrency)}
            aria-label="Budget currency"
            className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none ${
              isLight
                ? 'border-slate-200 bg-slate-50 text-slate-800'
                : 'border-white/12 bg-[#121214] text-white'
            }`}
          >
            {BUDGET_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
          <span className="inline-flex items-center gap-1">
            <span className={`font-mono text-[12px] ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
              {BUDGET_CURRENCIES.find((c) => c.code === value.budgetCurrency)?.symbol || '$'}
            </span>
            <input
              type="number"
              min={1}
              max={100000}
              value={value.maxBudgetUsd}
              onChange={(e) =>
                set('maxBudgetUsd', Math.min(100000, Math.max(1, Number(e.target.value) || 20)))
              }
              className={`w-20 rounded-lg border px-2 py-1.5 font-mono ${
                isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-900'
                  : 'border-white/12 bg-[#121214] text-white'
              }`}
            />
          </span>
          <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
            research cap · not a payment
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className={`mt-3 text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-white/55'}`}
      >
        {advanced ? 'Hide options ▲' : 'More options ▼'}
      </button>

      {advanced && (
        <div className="mt-3 space-y-3 border-t pt-3" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}>
          <div>
            <p className={`text-[11px] font-bold mb-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Style</p>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set('style', s.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                    value.style === s.id ? chipOn : chipOff
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-[11px] font-bold mb-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              Preferred extensions (TLDs)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TLD_OPTIONS.map((tld) => {
                const on = value.preferredTlds.includes(tld);
                return (
                  <button
                    key={tld}
                    type="button"
                    onClick={() => toggleTld(tld)}
                    className={`rounded-full px-2.5 py-1 text-xs font-mono font-semibold border ${
                      on ? chipOn : chipOff
                    }`}
                  >
                    {tld}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                Keywords to include
              </label>
              <input
                value={value.mustInclude}
                onChange={(e) => set('mustInclude', e.target.value)}
                placeholder="fit, strength"
                className={`w-full rounded-xl border px-3 py-2 text-sm ${field}`}
              />
            </div>
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                Keywords to avoid
              </label>
              <input
                value={value.avoid}
                onChange={(e) => set('avoid', e.target.value)}
                placeholder="cheap, free, xxx"
                className={`w-full rounded-xl border px-3 py-2 text-sm ${field}`}
              />
            </div>
          </div>

          <div>
            <p className={`text-[11px] font-bold mb-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              Ranking strategies (radio test & more)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DOMAIN_STRATEGIES.map((s) => {
                const on = value.strategies.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={s.description}
                    onClick={() => toggleStrategy(s.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition ${
                      on ? chipOn : chipOff
                    }`}
                  >
                    {s.short}
                  </button>
                );
              })}
            </div>
            <p className={`mt-1.5 text-[10px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
              Radio = easy to say/spell over the phone. Hover chips for details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              Shortlist size
              <input
                type="number"
                min={5}
                max={15}
                value={value.count}
                onChange={(e) => set('count', Math.min(15, Math.max(5, Number(e.target.value) || 10)))}
                className={`w-16 rounded-lg border px-2 py-1 ${
                  isLight ? 'border-slate-200 bg-white' : 'border-white/12 bg-[#121214] text-white'
                }`}
              />
            </label>
            <label className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              <input
                type="checkbox"
                checked={value.liveCheck}
                onChange={(e) => set('liveCheck', e.target.checked)}
              />
              Live availability checks
            </label>
            <label className={`text-xs font-semibold flex flex-wrap items-center gap-2 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              Max budget
              <select
                value={value.budgetCurrency}
                onChange={(e) => set('budgetCurrency', e.target.value as BudgetCurrency)}
                className={`rounded-lg border px-2 py-1 text-xs ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-800'
                    : 'border-white/12 bg-[#121214] text-white'
                }`}
              >
                {BUDGET_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={100000}
                value={value.maxBudgetUsd}
                onChange={(e) =>
                  set('maxBudgetUsd', Math.min(100000, Math.max(1, Number(e.target.value) || 20)))
                }
                className={`w-20 rounded-lg border px-2 py-1 ${
                  isLight ? 'border-slate-200 bg-white' : 'border-white/12 bg-[#121214] text-white'
                }`}
              />
              <span className="opacity-60">/ reg year</span>
            </label>
          </div>

          {value.style === 'geo' && (
            <div>
              <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                Markets (cities/countries, comma-separated)
              </label>
              <input
                value={value.markets}
                onChange={(e) => set('markets', e.target.value)}
                placeholder="Austin, Denver, Miami"
                className={`w-full rounded-xl border px-3 py-2 text-sm ${field}`}
              />
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={loading || value.text.trim().length < 8}
        onClick={onSubmit}
        className={`mt-4 w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:opacity-40 ${
          isLight
            ? 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-white text-black hover:bg-white/90'
        }`}
      >
        {loading ? 'Finding domains…' : 'Find domains'}
      </button>
      {value.text.trim().length > 0 && value.text.trim().length < 8 && (
        <p className={`mt-2 text-[11px] ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
          Add a bit more detail (at least 8 characters).
        </p>
      )}
      <button
        type="button"
        className={`ml-0 sm:ml-3 mt-2 sm:mt-0 text-xs font-semibold ${isLight ? 'text-slate-400' : 'text-white/35'}`}
        onClick={() => onChange({ ...DEFAULT_FORM })}
      >
        Reset
      </button>
      </div>
    </div>
  );
}
