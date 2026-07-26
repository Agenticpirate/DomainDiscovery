'use client';

/**
 * ADA shortlist app — reuses DomainDiscovery AssistantShell demo logic
 * but sits in ADA chrome (no DD nav).
 */
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { BriefForm } from '@/components/assistant/BriefForm';
import { RunSteps } from '@/components/assistant/RunSteps';
import { RankedResults } from '@/components/assistant/RankedResults';
import {
  budgetToUsd,
  DEFAULT_FORM,
  type AssistantFormState,
  type AssistantRunState,
} from '@/components/assistant/types';
import type { AgentAutoResult, AgentJobStep } from '@/lib/agent/types';
import { ADA_BRAND } from '@/lib/adaConfig';

function loadSaved(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('ada_saved_domains') || localStorage.getItem('saved_domains');
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as Array<{ domain: string } | string>;
    return new Set(arr.map((x) => (typeof x === 'string' ? x : x.domain).toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

function persistSave(domain: string) {
  try {
    const key = 'ada_saved_domains';
    const raw = localStorage.getItem(key);
    const list: Array<{ domain: string; savedAt: number }> = raw ? JSON.parse(raw) : [];
    if (!list.some((x) => x.domain.toLowerCase() === domain.toLowerCase())) {
      list.unshift({ domain: domain.toLowerCase(), savedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
    } else {
      localStorage.setItem(
        key,
        JSON.stringify(list.filter((x) => x.domain.toLowerCase() !== domain.toLowerCase()))
      );
    }
  } catch {
    /* ignore */
  }
}

export default function AdaAppPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  const [form, setForm] = React.useState<AssistantFormState>(DEFAULT_FORM);
  const [run, setRun] = React.useState<AssistantRunState>({
    status: 'idle',
    steps: [],
    result: null,
    error: null,
    jobId: null,
  });
  const [saved, setSaved] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const onSave = (domain: string) => {
    persistSave(domain);
    setSaved(loadSaved());
  };

  const onSubmit = async () => {
    setRun({ status: 'loading', steps: [], result: null, error: null, jobId: null });
    try {
      const markets = form.markets
        .split(/[,;\n]/)
        .map((m) => m.trim())
        .filter(Boolean);
      // Research filter is USD on the server — convert display currency first
      const maxBudgetUsd = budgetToUsd(form.maxBudgetUsd, form.budgetCurrency);
      const res = await fetch('/api/agent/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: form.text.trim(),
          maxBudgetUsd,
          brief: {
            style: form.style,
            count: form.count,
            preferredTlds: form.preferredTlds,
            markets: form.style === 'geo' ? markets : undefined,
            maxBudgetUsd,
          },
          skipAvailability: !form.liveCheck,
          sync: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setRun({
        status: 'success',
        steps: (data.steps || []) as AgentJobStep[],
        result: data.result as AgentAutoResult,
        error: null,
        jobId: data.jobId || null,
      });
    } catch (e) {
      setRun({
        status: 'error',
        steps: [],
        result: null,
        error: e instanceof Error ? e.message : 'Failed',
        jobId: null,
      });
    }
  };

  return (
    <div className="px-3 sm:px-6 py-5 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-6">
          {/* Soft plate under title so dots don’t comb through type */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-3xl"
              style={{
                background: isLight
                  ? 'radial-gradient(ellipse 90% 80% at 20% 40%, rgba(248,250,252,0.9), transparent 70%)'
                  : 'radial-gradient(ellipse 90% 80% at 20% 40%, rgba(5,5,5,0.88), transparent 70%)',
              }}
            />
            <div className="relative z-[1]">
              <h1 className={`text-xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Find domains under budget
              </h1>
              <p className={`mt-1 text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
                {ADA_BRAND.name} · research shortlist · you confirm registration
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          <div className="space-y-3 sm:space-y-4">
            <BriefForm
              isLight={isLight}
              value={form}
              onChange={setForm}
              onSubmit={onSubmit}
              loading={run.status === 'loading'}
            />
            {run.steps.length > 0 && <RunSteps steps={run.steps} isLight={isLight} />}
          </div>
          <div>
            {run.status === 'idle' && (
              <div
                className={`shine-border relative isolate overflow-hidden rounded-2xl border border-dashed p-4 sm:p-6 text-sm ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-500'
                    : 'border-white/12 bg-[#0a0a0c] text-white/40'
                }`}
              >
                Set a budget (e.g. $20), describe the brand, then run Find domains.
              </div>
            )}
            {run.status === 'loading' && (
              <div
                className={`shine-border relative isolate overflow-hidden rounded-2xl border p-4 sm:p-6 text-sm animate-pulse ${
                  isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0a0a0c]'
                }`}
              >
                Running agent pipeline…
              </div>
            )}
            {run.status === 'error' && (
              <div
                className={`shine-border relative isolate overflow-hidden rounded-2xl border p-4 sm:p-5 text-sm ${
                  isLight
                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                    : 'border-rose-500/30 bg-[#140a0c] text-rose-200'
                }`}
              >
                {run.error}
              </div>
            )}
            {run.status === 'success' && run.result && (
              <RankedResults result={run.result} isLight={isLight} saved={saved} onSave={onSave} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
