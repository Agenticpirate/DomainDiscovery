'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import type { AgentAutoResult, AgentJobStep } from '@/lib/agent/types';
import { useTheme } from '@/contexts/ThemeContext';
import { BriefForm } from './BriefForm';
import { RunSteps } from './RunSteps';
import { RankedResults } from './RankedResults';
import { AssistantDisclaimer } from './AssistantDisclaimer';
import { AgentHowTo } from './AgentHowTo';
import { budgetToUsd, DEFAULT_FORM, type AssistantFormState, type AssistantRunState } from './types';

import { getSavedDomainNames, addSavedDomain } from '@/lib/savedDomainsStore';

function loadSaved(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  return new Set(getSavedDomainNames());
}

function persistSave(domain: string) {
  addSavedDomain(domain);
}

export function AssistantShell() {
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
    const sync = () => setSaved(loadSaved());
    window.addEventListener('savedDomainsUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('savedDomainsUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const onSave = (domain: string) => {
    persistSave(domain);
    setSaved(loadSaved());
  };

  const onSubmit = async () => {
    if (!FEATURE_FLAGS.domainAgent) return;
    setRun({ status: 'loading', steps: [], result: null, error: null, jobId: null });
    try {
      const markets = form.markets
        .split(/[,;\n]/)
        .map((m) => m.trim())
        .filter(Boolean);
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
            mustInclude: form.mustInclude
              .split(/[,;\n]/)
              .map((s) => s.trim())
              .filter(Boolean),
            avoid: form.avoid
              .split(/[,;\n]/)
              .map((s) => s.trim())
              .filter(Boolean),
            strategies: form.strategies,
          },
          skipAvailability: !form.liveCheck,
          sync: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
      }
      const steps = (data.steps || []) as AgentJobStep[];
      const result = (data.result || null) as AgentAutoResult | null;
      if (!result) {
        throw new Error(data.error || 'No result returned');
      }
      setRun({
        status: 'success',
        steps,
        result,
        error: null,
        jobId: data.jobId || null,
      });
    } catch (e) {
      setRun({
        status: 'error',
        steps: [],
        result: null,
        error: e instanceof Error ? e.message : 'Something went wrong',
        jobId: null,
      });
    }
  };

  if (!FEATURE_FLAGS.domainAgent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <PageBackground variant="default" />
        <Navigation activeTool="assistant" />
        <main className="relative pt-24 px-4 max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-black mb-2">AI Domain Assistant</h1>
          <p className="text-sm opacity-60 mb-4">This feature is currently disabled.</p>
          <Link href="/" className="underline text-sm font-semibold">
            Back to search
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <PageBackground variant="default" />
      <Navigation activeTool="assistant" />

      <main className={`${PAGE_MAIN_CLASS} pb-10 sm:pb-14`}>
        <PageBreadcrumb items={[{ label: 'Tools', href: '/' }, { label: 'Agent Hub' }]} />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="relative z-[1]">
        <section className="page-gutter pb-5 sm:pb-7">
          <div className="max-w-3xl mx-auto text-center mt-1 sm:mt-2 relative isolate">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-full w-[min(100%,36rem)] -translate-x-1/2 rounded-[2rem]"
              style={{
                background: isLight
                  ? 'radial-gradient(ellipse 90% 80% at 50% 40%, #f8fafc 0%, #f8fafc 50%, rgba(248,250,252,0) 100%)'
                  : 'radial-gradient(ellipse 90% 80% at 50% 40%, #050505 0%, #050505 50%, rgba(5,5,5,0) 100%)',
              }}
            />
            <div className="relative z-[1]">
            <p
              className={`relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide mb-3 ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-white/12 text-white/40'
              }`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
              />
              <span className="relative z-[1] inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isLight ? 'bg-slate-500' : 'bg-white/60'}`} />
                Agent Hub · MCP · Budget-aware research
              </span>
            </p>
            <h1
              className={`text-3xl sm:text-5xl font-black tracking-tight mb-3 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              AI Domain Assistant
            </h1>
            <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Agent-ready domain intelligence on DomainDiscovery. Demo auto shortlists with a budget cap, or connect
              via MCP / REST so agents can find and rank brands. Research only — you confirm registration.
            </p>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-[1fr_0.95fr] gap-5 sm:gap-6 items-start">
            <div className="space-y-4">
              <BriefForm
                isLight={isLight}
                value={form}
                onChange={setForm}
                onSubmit={onSubmit}
                loading={run.status === 'loading'}
              />
              {run.steps.length > 0 && (
                <div>
                  <h2 className={`text-sm font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
                    Pipeline
                  </h2>
                  <RunSteps steps={run.steps} isLight={isLight} />
                </div>
              )}
              <AssistantDisclaimer isLight={isLight} />
            </div>

            <div>
              {run.status === 'idle' && (
                <div
                  className={`shine-border relative isolate overflow-hidden rounded-2xl border border-dashed p-6 text-sm ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-white/12 text-white/45'
                  }`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                  />
                  <p className="relative z-[1]">
                    Your ranked shortlist will appear here after you run{' '}
                    <span className="font-semibold">Find domains</span>.
                  </p>
                </div>
              )}
              {run.status === 'loading' && (
                <div
                  className={`shine-border relative isolate overflow-hidden rounded-2xl border p-6 text-sm animate-pulse ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-white/45'
                  }`}
                  style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ backgroundColor: isLight ? '#ffffff' : '#0a0a0c' }}
                  />
                  <p className="relative z-[1]">
                    Running auto pipeline — generating names
                    {form.liveCheck ? ', checking availability' : ''}, and ranking brand fit…
                  </p>
                </div>
              )}
              {run.status === 'error' && (
                <div
                  className={`shine-border relative isolate overflow-hidden rounded-2xl border p-5 text-sm ${
                    isLight
                      ? 'border-rose-200 text-rose-800'
                      : 'border-rose-500/30 text-rose-200'
                  }`}
                  style={{ backgroundColor: isLight ? '#fff1f2' : '#140a0c' }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ backgroundColor: isLight ? '#fff1f2' : '#140a0c' }}
                  />
                  <div className="relative z-[1]">
                  <p className="font-bold mb-1">Couldn’t complete the run</p>
                  <p>{run.error}</p>
                  <button
                    type="button"
                    onClick={onSubmit}
                    className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-bold ${
                      isLight ? 'bg-rose-900 text-white' : 'bg-white text-black'
                    }`}
                  >
                    Retry
                  </button>
                  </div>
                </div>
              )}
              {run.status === 'success' && run.result && (
                <RankedResults result={run.result} isLight={isLight} saved={saved} onSave={onSave} />
              )}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 mt-12 sm:mt-16 pb-4">
          <div className="max-w-4xl mx-auto">
            <AgentHowTo isLight={isLight} />
          </div>
        </section>

        <div className="mt-8">
          <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.assistant} compact />
        </div>
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}
