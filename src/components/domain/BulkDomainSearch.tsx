'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { BulkDomainSearchLanding, BULK_SAMPLE_TEXT, type BulkAddOptions } from './BulkDomainSearchLanding';
import { PreferredRegistrarSelect, RegistrarActionMenu } from './RegistrarControls';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { resolveRegisterUrl, type RegistrarName } from '@/lib/registrars';

interface DomainTag {
  domain: string;
  status: 'checking' | 'available' | 'taken' | 'premium' | 'error';
  price?: string;
  buyUrl?: string;
  purchaseInfo?: string;
  /** 0–100 brand / opportunity score (local heuristic) */
  score?: number;
}
type FilterType = 'all' | 'available' | 'taken' | 'premium';
type SortMode = 'az' | 'score' | 'length';

/** Brand / opportunity score for bulk results (no API score from instant-check). */
function computeDomainScore(
  domain: string,
  status: DomainTag['status'],
  price?: string
): number {
  const name = (domain.split('.')[0] || domain).toLowerCase();
  const tld = (domain.split('.').pop() || 'com').toLowerCase();
  let score = 42;

  if (status === 'available') score += 28;
  else if (status === 'premium') score += 14;
  else if (status === 'taken') score -= 18;
  else if (status === 'checking') score += 2;

  if (name.length <= 3) score += 22;
  else if (name.length <= 5) score += 16;
  else if (name.length <= 7) score += 12;
  else if (name.length <= 10) score += 6;
  else if (name.length <= 14) score += 2;
  else score -= 6;

  if (/^[a-z]+$/.test(name)) score += 8;
  if (!/\d/.test(name)) score += 4;
  if (!/-/.test(name)) score += 5;
  if (tld === 'com') score += 6;
  else if (['io', 'ai', 'co', 'app'].includes(tld)) score += 3;

  // Slight premium price signal: very high list prices can still score well as brand assets
  if (status === 'premium' && price) {
    const n = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(n)) {
      if (n >= 10000) score += 4;
      else if (n >= 1000) score += 2;
    }
  }

  return Math.max(1, Math.min(99, Math.round(score)));
}

function CrownIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
    </svg>
  );
}

function StatusIcon({
  status,
  isLight,
}: {
  status: DomainTag['status'];
  isLight: boolean;
}) {
  if (status === 'premium') {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
          isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/15 text-amber-400'
        }`}
        title="Premium"
      >
        <CrownIcon className="w-3 h-3" />
      </span>
    );
  }
  if (status === 'available') {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
          isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/15 text-emerald-400'
        }`}
        title="Available"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (status === 'checking') {
    return (
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
          isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/[0.06] text-white/40'
        }`}
        title="Checking"
      >
        <span className="h-2 w-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
      </span>
    );
  }
  // taken / error
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
        isLight ? 'bg-rose-50 text-rose-500' : 'bg-rose-500/10 text-rose-400/90'
      }`}
      title="Taken"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  );
}

interface BulkSearchSnapshot {
  id: string;
  createdAt: number;
  domains: DomainTag[];
}

const BULK_SEARCH_HISTORY_KEY = 'bulk_domain_search_history_v1';
const BULK_SEARCH_DRAFT_KEY = 'bulk_domain_search_draft_v1';
const BULK_SEARCH_HISTORY_LIMIT = 6;

function getDomainCounts(domains: DomainTag[]) {
  return {
    all: domains.length,
    available: domains.filter((d) => d.status === 'available').length,
    taken: domains.filter((d) => d.status === 'taken').length,
    premium: domains.filter((d) => d.status === 'premium').length,
    checking: domains.filter((d) => d.status === 'checking').length,
  };
}

function serializeDomains(domains: DomainTag[]) {
  return JSON.stringify(
    domains.map((domain) => ({
      domain: domain.domain,
      status: domain.status,
      price: domain.price ?? '',
      buyUrl: domain.buyUrl ?? '',
      purchaseInfo: domain.purchaseInfo ?? '',
      score: domain.score ?? '',
    }))
  );
}

function sanitizeStoredDomains(value: unknown): DomainTag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is DomainTag => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.domain === 'string' &&
        ['checking', 'available', 'taken', 'premium', 'error'].includes(String(item.status))
      );
    })
    .map((item) => {
      const status = item.status as DomainTag['status'];
      const rawScore = (item as DomainTag).score;
      const score =
        typeof rawScore === 'number' && rawScore > 0
          ? rawScore
          : computeDomainScore(item.domain, status, item.price);
      return {
        domain: item.domain,
        status,
        price: item.price,
        buyUrl: item.buyUrl,
        purchaseInfo: item.purchaseInfo,
        score,
      };
    })
    .slice(0, 1000);
}

function loadBulkSearchHistory(): BulkSearchSnapshot[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(BULK_SEARCH_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (
          typeof item !== 'object' ||
          item === null ||
          typeof item.id !== 'string' ||
          typeof item.createdAt !== 'number'
        ) {
          return null;
        }

        const domains = sanitizeStoredDomains((item as { domains?: unknown }).domains);
        if (!domains.length) {
          return null;
        }

        return {
          id: item.id,
          createdAt: item.createdAt,
          domains,
        } satisfies BulkSearchSnapshot;
      })
      .filter((item): item is BulkSearchSnapshot => item !== null)
      .slice(0, BULK_SEARCH_HISTORY_LIMIT);
  } catch (error) {
    console.error('Failed to load bulk search history:', error);
    return [];
  }
}

function saveBulkSearchHistory(history: BulkSearchSnapshot[]) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(BULK_SEARCH_HISTORY_KEY, JSON.stringify(history));
}

const checkDomainsInstant = async (
  domains: string[],
  onResult: (
    domain: string,
    available: boolean,
    premium?: boolean,
    price?: string,
    buyUrl?: string,
    purchaseInfo?: string
  ) => void
): Promise<void> => {
  try {
    const res = await fetch('/api/domains/instant-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domains }) });
    if (res.ok) { const data = await res.json(); for (const r of data) onResult(r.domain, r.available, r.premium, r.price, r.buyUrl, r.purchaseInfo); return; }
  } catch (e) { console.error(e); }
  for (const d of domains) onResult(d, false);
};

function getPrice(tld: string): string {
  const p: Record<string, string> = { com: '$12.99', net: '$14.99', org: '$13.99', ai: '$89.99', io: '$49.99', co: '$29.99', app: '$19.99', dev: '$15.99', xyz: '$9.99', tech: '$39.99' };
  return p[tld] || '$19.99';
}

// Results View Component
const ResultsView: React.FC<{
  domains: DomainTag[];
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
  tldFilter: string[];
  setTldFilter: (v: string[]) => void;
  showTlds: boolean;
  setShowTlds: (v: boolean) => void;
  progress: { done: number; total: number };
  reset: () => void;
  exportCSV: () => void;
  exportPDF: () => void;
  recentSearches: BulkSearchSnapshot[];
  onLoadSearch: (snapshot: BulkSearchSnapshot) => void;
  onDeleteSearch: (snapshotId: string) => void;
  selectedRegistrar: RegistrarName;
  setSelectedRegistrar: (registrar: RegistrarName) => void;
}> = ({
  domains,
  filter,
  setFilter,
  sortMode,
  setSortMode,
  tldFilter,
  setTldFilter,
  showTlds,
  setShowTlds,
  progress,
  reset,
  exportCSV,
  exportPDF,
  recentSearches,
  onLoadSearch,
  onDeleteSearch,
  selectedRegistrar,
  setSelectedRegistrar,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const tlds = Array.from(new Set(domains.map(d => d.domain.split('.').pop() || ''))).sort();
  
  const filtered = useCallback(() => {
    let list = [...domains];
    if (filter === 'available') list = list.filter(d => d.status === 'available');
    else if (filter === 'taken') list = list.filter(d => d.status === 'taken');
    else if (filter === 'premium') list = list.filter(d => d.status === 'premium');
    if (tldFilter.length) list = list.filter(d => tldFilter.includes(d.domain.split('.').pop() || ''));
    list.sort((a, b) => {
      if (sortMode === 'score') {
        const sa = a.score ?? computeDomainScore(a.domain, a.status, a.price);
        const sb = b.score ?? computeDomainScore(b.domain, b.status, b.price);
        return sb - sa || a.domain.localeCompare(b.domain);
      }
      if (sortMode === 'length') {
        return a.domain.length - b.domain.length || a.domain.localeCompare(b.domain);
      }
      return a.domain.localeCompare(b.domain);
    });
    return list;
  }, [domains, filter, tldFilter, sortMode]);

  const results = filtered();
  const counts = getDomainCounts(domains);
  const checkingPct = Math.round((progress.done / Math.max(progress.total, 1)) * 100);
  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, d) => sum + (d.score ?? computeDomainScore(d.domain, d.status, d.price)),
            0
          ) / results.length
        )
      : 0;

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors whitespace-nowrap ${
      active
        ? isLight
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-black border-white'
        : isLight
          ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          : 'bg-white/[0.04] text-white/65 border-white/10 hover:bg-white/[0.08] hover:text-white'
    }`;

  const cycleSort = () => {
    setSortMode(sortMode === 'az' ? 'score' : sortMode === 'score' ? 'length' : 'az');
  };
  const sortLabel = sortMode === 'az' ? 'A–Z' : sortMode === 'score' ? 'Score' : 'Length';

  return (
    <div className="w-full max-w-7xl mx-auto px-0 sm:px-0 pb-6 sm:pb-10 animate-fade-in">
      {/* Compact premium toolbar — full width */}
      <div
        className={`rounded-2xl border mb-2.5 sm:mb-3 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0c0e] border-white/[0.1]'
        }`}
      >
        <div className="flex flex-col gap-2.5 sm:gap-3 p-3 sm:p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {/* Highlighted New search */}
              <button
                type="button"
                onClick={reset}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] sm:text-[13px] font-bold transition-all shadow-md ${
                  isLight
                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-slate-900/20 ring-2 ring-slate-900/10'
                    : 'bg-white text-black border-white hover:bg-white/90 shadow-black/40 ring-2 ring-white/15'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New search
              </button>
              <div className={`h-4 w-px hidden sm:block ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { k: 'all' as FilterType, l: 'All', c: counts.all, icon: null as React.ReactNode },
                  {
                    k: 'available' as FilterType,
                    l: 'Available',
                    c: counts.available,
                    icon: (
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ),
                  },
                  {
                    k: 'premium' as FilterType,
                    l: 'Premium',
                    c: counts.premium,
                    icon: <CrownIcon className="w-3 h-3 text-amber-400" />,
                  },
                  {
                    k: 'taken' as FilterType,
                    l: 'Taken',
                    c: counts.taken,
                    icon: (
                      <svg className="w-3 h-3 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ),
                  },
                ].map((x) => (
                  <button key={x.k} type="button" onClick={() => setFilter(x.k)} className={chip(filter === x.k)}>
                    {x.icon}
                    {x.l}
                    <span className={`tabular-nums ${filter === x.k ? 'opacity-80' : 'opacity-50'}`}>{x.c}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <PreferredRegistrarSelect
                selectedRegistrar={selectedRegistrar}
                onSelectRegistrar={setSelectedRegistrar}
                label="Registrar"
                className="justify-start"
              />
              <button type="button" onClick={cycleSort} className={chip(sortMode !== 'az')} title="Cycle sort: A–Z → Score → Length">
                Sort: {sortLabel}
              </button>
              <button type="button" onClick={() => setShowTlds(!showTlds)} className={chip(showTlds || tldFilter.length > 0)}>
                TLD{tldFilter.length > 0 ? ` (${tldFilter.length})` : ''}
              </button>
              <button type="button" onClick={exportCSV} className={chip(false)}>
                <Icons.Download />
                CSV
              </button>
              <button type="button" onClick={exportPDF} className={chip(false)}>
                <Icons.Download />
                PDF
              </button>
            </div>
          </div>

          {showTlds && tlds.length > 0 && (
            <div
              className={`flex flex-wrap gap-1.5 pt-2 border-t animate-fade-in ${
                isLight ? 'border-slate-100' : 'border-white/[0.06]'
              }`}
            >
              {tlds.map((t) => {
                const on = tldFilter.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setTldFilter(on ? tldFilter.filter((x) => x !== t) : [...tldFilter, t])
                    }
                    className={chip(on)}
                  >
                    .{t}
                  </button>
                );
              })}
              {tldFilter.length > 0 && (
                <button type="button" onClick={() => setTldFilter([])} className={chip(false)}>
                  Clear TLDs
                </button>
              )}
            </div>
          )}

          <div
            className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${
              isLight ? 'border-slate-100' : 'border-white/[0.06]'
            }`}
          >
            <p className={`text-[11px] sm:text-[12px] font-medium ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
              Showing{' '}
              <span className={`tabular-nums font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {results.length.toLocaleString()}
              </span>{' '}
              of{' '}
              <span className="tabular-nums">{counts.all.toLocaleString()}</span> domains
              {results.length > 0 && (
                <span className={`ml-1.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                  · avg score{' '}
                  <span className={`tabular-nums font-bold ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
                    {avgScore}
                  </span>
                </span>
              )}
              <span className={`hidden sm:inline ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                {' '}
                · scroll for full list (max 1k)
              </span>
            </p>
            {counts.checking > 0 ? (
              <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[200px]">
                <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${checkingPct}%`,
                      background: isLight
                        ? 'linear-gradient(90deg,#0f172a,#334155)'
                        : 'linear-gradient(90deg,rgba(255,255,255,0.45),#fff)',
                    }}
                  />
                </div>
                <span className={`text-[10px] font-mono tabular-nums ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                  {progress.done}/{progress.total}
                </span>
              </div>
            ) : (
              <span className={`text-[10px] sm:text-[11px] font-semibold ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                Check complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dense 4-col results — scroll full list (max 1k) */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c0c0e] border-white/[0.1]'
        }`}
      >
        <div
          className="max-h-[min(72vh,calc(100vh-11.5rem))] sm:max-h-[min(78vh,calc(100vh-12rem))] overflow-y-auto overscroll-contain select-none"
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
        >
          {results.length === 0 ? (
            <div className={`text-center py-16 px-4 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
              <p className="text-sm font-semibold mb-1">No domains match this filter</p>
              <p className="text-[12px]">Switch to All or clear TLD filters</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px"
              style={{ backgroundColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
            >
              {results.map((d) => {
                const domainHref =
                  d.status === 'available' || d.status === 'premium'
                    ? resolveRegisterUrl(d.domain, selectedRegistrar, d.buyUrl)
                    : d.buyUrl
                      ? d.buyUrl
                      : `https://who.is/whois/${encodeURIComponent(d.domain)}`;
                const domainTitle =
                  d.status === 'available' || d.status === 'premium'
                    ? `Search ${d.domain} on ${selectedRegistrar}`
                    : d.buyUrl
                      ? d.purchaseInfo || 'View listing'
                      : 'View WHOIS';
                const canAct = d.status === 'available' || d.status === 'premium';
                const score = d.score ?? computeDomainScore(d.domain, d.status, d.price);
                const scoreTone =
                  score >= 75
                    ? isLight
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                    : score >= 55
                      ? isLight
                        ? 'text-slate-700 bg-slate-100 border-slate-200'
                        : 'text-white/75 bg-white/[0.06] border-white/12'
                      : isLight
                        ? 'text-slate-500 bg-slate-50 border-slate-200'
                        : 'text-white/45 bg-white/[0.03] border-white/[0.08]';

                return (
                  <div
                    key={d.domain}
                    className={`group flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 min-w-0 transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-[#0c0c0e] hover:bg-[#121214]'
                    } ${
                      d.status === 'premium'
                        ? isLight
                          ? 'ring-1 ring-inset ring-amber-200/80'
                          : 'ring-1 ring-inset ring-amber-500/15'
                        : ''
                    }`}
                  >
                    <StatusIcon status={d.status} isLight={isLight} />
                    <a
                      href={domainHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={domainTitle}
                      className={`min-w-0 flex-1 font-mono text-[11px] sm:text-[12px] truncate transition-colors ${
                        isLight
                          ? 'text-slate-800 hover:text-slate-950'
                          : 'text-white/88 hover:text-white'
                      }`}
                    >
                      {d.domain}
                    </a>
                    <span
                      className={`shrink-0 inline-flex items-center rounded border px-1 py-0.5 text-[9px] font-bold tabular-nums leading-none ${scoreTone}`}
                      title={`Brand score ${score}/100 — based on length, cleanliness, TLD, and availability`}
                    >
                      {score}
                    </span>
                    {d.price && d.status !== 'taken' && d.status !== 'checking' && (
                      <span
                        className={`shrink-0 text-[9px] sm:text-[10px] font-medium tabular-nums max-w-[4.5rem] truncate hidden md:inline ${
                          isLight ? 'text-slate-400' : 'text-white/35'
                        }`}
                        title={d.price}
                      >
                        {d.price}
                      </span>
                    )}
                    <div className="relative shrink-0 opacity-90 group-hover:opacity-100">
                      <RegistrarActionMenu
                        domain={d.domain}
                        selectedRegistrar={selectedRegistrar}
                        onSelectRegistrar={setSelectedRegistrar}
                        canRegister={canAct}
                        primaryLabel={d.status === 'premium' ? 'Go' : d.status === 'available' ? 'Go' : 'Info'}
                        premiumUrl={d.status === 'premium' ? d.buyUrl : undefined}
                        premiumLabel={d.purchaseInfo}
                        primaryButtonClassName={
                          isLight
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-white text-black hover:bg-white/90'
                        }
                        chevronButtonClassName={
                          isLight
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-white text-black hover:bg-white/90'
                        }
                        fallbackButtonClassName={
                          isLight
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-white/[0.08] text-white/70 hover:bg-white/12'
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div
            className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t text-[10px] sm:text-[11px] ${
              isLight ? 'border-slate-100 text-slate-400 bg-slate-50/80' : 'border-white/[0.06] text-white/30 bg-black/20'
            }`}
          >
            <span>
              {results.length.toLocaleString()} row{results.length === 1 ? '' : 's'} in view
              {filter !== 'all' ? ` · filter: ${filter}` : ''}
            </span>
            <span className="font-medium">Scroll for full list · max 1,000 domains</span>
          </div>
        )}
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Recent bulk searches
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentSearches.slice(0, 6).map((snapshot) => {
              const sc = getDomainCounts(snapshot.domains);
              return (
                <div
                  key={snapshot.id}
                  className={`shrink-0 rounded-xl border px-3 py-2 min-w-[150px] ${
                    isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0c0c0e]'
                  }`}
                >
                  <button type="button" onClick={() => onLoadSearch(snapshot)} className="w-full text-left">
                    <div className={`text-[12px] font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {snapshot.domains.length} domains
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {sc.available} free · {sc.premium} prem · {sc.taken} taken
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSearch(snapshot.id)}
                    className={`mt-1.5 text-[10px] font-medium ${
                      isLight ? 'text-slate-400 hover:text-red-500' : 'text-white/30 hover:text-red-400'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const BulkDomainSearch: React.FC<{ onSelect?: (d: string) => void }> = () => {
  const [input, setInput] = useState('');
  const [domains, setDomains] = useState<DomainTag[]>([]);
  const [recentSearches, setRecentSearches] = useState<BulkSearchSnapshot[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortMode, setSortMode] = useState<SortMode>('score');
  const [tldFilter, setTldFilter] = useState<string[]>([]);
  const [showTlds, setShowTlds] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef(false);
  const queuedCheckRef = useRef<string[]>([]);
  const lastPersistedSnapshotRef = useRef('');
  const domainsRef = useRef<DomainTag[]>([]);
  const { showToast } = useToast();
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();

  useEffect(() => {
    domainsRef.current = domains;
  }, [domains]);

  // Prevent context menu on domain names
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('select-none') || target.closest('.select-none')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const draft = localStorage.getItem(BULK_SEARCH_DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as { domains?: unknown };
        const draftDomains = sanitizeStoredDomains(parsed.domains);
        if (draftDomains.length > 0) {
          setDomains(draftDomains);
        }
      }
    } catch (error) {
      console.error('Failed to load bulk search draft:', error);
    }

    setRecentSearches(loadBulkSearchHistory());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!domains.length) {
      localStorage.removeItem(BULK_SEARCH_DRAFT_KEY);
      return;
    }

    localStorage.setItem(
      BULK_SEARCH_DRAFT_KEY,
      JSON.stringify({
        updatedAt: Date.now(),
        domains,
      })
    );
  }, [domains]);

  useEffect(() => {
    if (typeof window === 'undefined' || !domains.length || checking || domains.some((domain) => domain.status === 'checking')) {
      return;
    }

    const fingerprint = serializeDomains(domains);
    if (lastPersistedSnapshotRef.current === fingerprint) {
      return;
    }

    lastPersistedSnapshotRef.current = fingerprint;
    const snapshot: BulkSearchSnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      domains: domains.map((domain) => ({
        domain: domain.domain,
        status: domain.status,
        price: domain.price,
        buyUrl: domain.buyUrl,
        purchaseInfo: domain.purchaseInfo,
        score: domain.score ?? computeDomainScore(domain.domain, domain.status, domain.price),
      })),
    };

    const nextHistory = [snapshot, ...loadBulkSearchHistory().filter((item) => serializeDomains(item.domains) !== fingerprint)].slice(
      0,
      BULK_SEARCH_HISTORY_LIMIT
    );
    saveBulkSearchHistory(nextHistory);
    setRecentSearches(nextHistory);
  }, [domains, checking]);

  const parse = (t: string, options?: BulkAddOptions) => {
    const defaultTld = (options?.defaultTld || 'com').replace(/^\./, '').toLowerCase();
    const autoAppend = options?.autoAppendTld !== false;
    const stripWww = options?.stripWww !== false;
    const max = Math.min(Math.max(options?.maxDomains || 1000, 1), 1000);
    const out: string[] = [];

    // Prefer line / comma / semicolon / tab splits (spaces only as secondary separators)
    const tokens = t
      .split(/[\n\r,;\t]+/)
      .flatMap((chunk) => chunk.split(/\s+/))
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

    for (let l of tokens) {
      // Strip quotes from CSV/JSON-ish exports
      l = l.replace(/^["']+|["']+$/g, '');
      if (!l || l === 'domain' || l === 'domains' || l === 'name') continue;

      if (stripWww) {
        l = l.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
      } else {
        l = l.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
      }

      if (!l) continue;
      if (autoAppend && !/\.[a-z]{2,}$/i.test(l)) {
        l = `${l}.${defaultTld}`;
      }
      if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i.test(l) && !out.includes(l)) {
        out.push(l);
      }
      if (out.length >= max) break;
    }
    return out.slice(0, max);
  };

  const checkBg = useCallback(async (list: string[]) => {
    if (!list.length) return;
    if (checkRef.current) {
      queuedCheckRef.current = Array.from(new Set([...queuedCheckRef.current, ...list]));
      return;
    }
    checkRef.current = true;
    setChecking(true);
    setProgress({ done: 0, total: list.length });
    let done = 0;
    await checkDomainsInstant(list, (d, a, p, price, buyUrl, purchaseInfo) => {
      done++;
      setProgress((x) => ({ ...x, done }));
      const key = d.toLowerCase();
      setDomains((prev) =>
        prev.map((x) => {
          if (x.domain.toLowerCase() !== key) return x;
          const status: DomainTag['status'] = a ? 'available' : p ? 'premium' : 'taken';
          const nextPrice = a ? price || getPrice(x.domain.split('.').pop() || 'com') : p ? price : undefined;
          return {
            ...x,
            status,
            price: nextPrice,
            buyUrl: p ? buyUrl : undefined,
            purchaseInfo: p ? purchaseInfo : undefined,
            score: computeDomainScore(x.domain, status, nextPrice),
          };
        })
      );
    });
    checkRef.current = false;
    setChecking(false);

    if (queuedCheckRef.current.length > 0) {
      const nextBatch = [...queuedCheckRef.current];
      queuedCheckRef.current = [];
      await checkBg(nextBatch);
    }
  }, []);

  const add = useCallback(
    (t: string, options?: BulkAddOptions) => {
      const max = Math.min(Math.max(options?.maxDomains || 1000, 1), 1000);
      const names = parse(t, options);
      if (!names.length) {
        showToast('No valid domains found in that input', 'error');
        return 0;
      }

      const prev = domainsRef.current;
      const existing = new Set(prev.map((d) => d.domain.toLowerCase()));
      const room = Math.max(0, max - prev.length);
      const newOnes: DomainTag[] = names
        .filter((n) => !existing.has(n.toLowerCase()))
        .slice(0, room)
        .map((d) => ({
          domain: d,
          status: 'checking' as const,
          score: computeDomainScore(d, 'checking'),
        }));

      if (!newOnes.length) {
        showToast('Those domains are already in your list', 'info');
        return 0;
      }

      const next = [...prev, ...newOnes].slice(0, max);
      domainsRef.current = next;
      setDomains(next);
      void checkBg(newOnes.map((d) => d.domain));
      showToast(`Added ${newOnes.length} domain${newOnes.length === 1 ? '' : 's'}`, 'success');
      return newOnes.length;
    },
    [checkBg, showToast]
  );

  const loadSample = useCallback(
    (options?: BulkAddOptions) => {
      const added = add(BULK_SAMPLE_TEXT, options);
      if (added > 0) {
        // Keep user on the input panel with tags visible (not results until they click Search all)
        setShowResults(false);
      }
    },
    [add]
  );

  const reset = () => {
    setDomains([]);
    setShowResults(false);
    setInput('');
    setFilter('all');
    setSortMode('score');
    setTldFilter([]);
    setShowTlds(false);
    setProgress({ done: 0, total: 0 });
    checkRef.current = false;
    setChecking(false);
    domainsRef.current = [];
  };

  const exportCSV = () => {
    const csv = [
      'Domain,Status,Score,Price,TLD',
      ...domains.map((d) => {
        const score = d.score ?? computeDomainScore(d.domain, d.status, d.price);
        return `${d.domain},${d.status},${score},${d.price || ''},.${d.domain.split('.').pop() || ''}`;
      }),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `bulk-domains-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Bulk search exported as CSV', 'success');
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const counts = getDomainCounts(domains);
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const lineHeight = 16;
    let y = 46;

    const ensureSpace = (needed = lineHeight) => {
      if (y + needed > pageHeight - 40) {
        doc.addPage();
        y = 46;
      }
    };

    const writeLine = (text: string, opts?: { fontSize?: number; bold?: boolean; color?: [number, number, number] }) => {
      ensureSpace();
      doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
      doc.setFontSize(opts?.fontSize ?? 11);
      if (opts?.color) {
        doc.setTextColor(...opts.color);
      } else {
        doc.setTextColor(17, 24, 39);
      }
      doc.text(text, marginX, y);
      y += lineHeight;
    };

    const sections: Array<{ title: string; items: DomainTag[]; color: [number, number, number] }> = [
      { title: 'Available Domains', items: domains.filter((d) => d.status === 'available'), color: [16, 185, 129] },
      { title: 'Premium Domains', items: domains.filter((d) => d.status === 'premium'), color: [245, 158, 11] },
      { title: 'Taken Domains', items: domains.filter((d) => d.status === 'taken'), color: [239, 68, 68] },
    ];

    writeLine('DomainDiscovery Bulk Search Export', { fontSize: 18, bold: true });
    writeLine(`Generated ${new Date().toLocaleString()}`, { fontSize: 10 });
    y += 4;
    writeLine(`Total: ${counts.all}   Available: ${counts.available}   Premium: ${counts.premium}   Taken: ${counts.taken}`, {
      fontSize: 11,
      bold: true,
    });
    y += 8;

    sections.forEach((section) => {
      ensureSpace(28);
      writeLine(section.title, { fontSize: 13, bold: true, color: section.color });

      if (section.items.length === 0) {
        writeLine('No domains in this group.', { fontSize: 10 });
        y += 4;
        return;
      }

      section.items.forEach((domain, index) => {
        const score = domain.score ?? computeDomainScore(domain.domain, domain.status, domain.price);
        const priceLabel = domain.price ? `  ${domain.price}` : domain.status === 'premium' ? '  Premium pricing' : '';
        writeLine(
          `${index + 1}. ${domain.domain}  ${domain.status.toUpperCase()}  score:${score}${priceLabel}`,
          { fontSize: 10 }
        );
      });

      y += 6;
    });

    doc.save(`bulk-domains-${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Bulk search exported as PDF', 'success');
  };

  const counts = getDomainCounts(domains);

  const loadPreviousSearch = useCallback((snapshot: BulkSearchSnapshot) => {
    const withScores = snapshot.domains.map((d) => ({
      ...d,
      score: d.score ?? computeDomainScore(d.domain, d.status, d.price),
    }));
    domainsRef.current = withScores;
    setDomains(withScores);
    setShowResults(true);
    setFilter('all');
    setSortMode('score');
    setTldFilter([]);
    setShowTlds(false);
    setProgress({ done: withScores.length, total: withScores.length });
    showToast(`Loaded ${withScores.length} domains from a recent bulk search`, 'success');
  }, [showToast]);

  const deletePreviousSearch = useCallback((snapshotId: string) => {
    const nextHistory = recentSearches.filter((snapshot) => snapshot.id !== snapshotId);
    setRecentSearches(nextHistory);
    saveBulkSearchHistory(nextHistory);
    showToast('Removed that recent bulk search', 'success');
  }, [recentSearches, showToast]);

  // Show results view
  if (showResults) {
    return (
      <ResultsView
        domains={domains}
        filter={filter}
        setFilter={setFilter}
        sortMode={sortMode}
        setSortMode={setSortMode}
        tldFilter={tldFilter}
        setTldFilter={setTldFilter}
        showTlds={showTlds}
        setShowTlds={setShowTlds}
        progress={progress}
        reset={reset}
        exportCSV={exportCSV}
        exportPDF={exportPDF}
        recentSearches={recentSearches}
        onLoadSearch={loadPreviousSearch}
        onDeleteSearch={deletePreviousSearch}
        selectedRegistrar={selectedRegistrar}
        setSelectedRegistrar={setSelectedRegistrar}
      />
    );
  }

  // File upload handler — CSV / TXT / TSV / JSON
  const handleFileUpload = (file: File, options?: BulkAddOptions) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = String(ev.target?.result || '');
      const name = file.name.toLowerCase();
      let text = raw;

      if (name.endsWith('.json') || raw.trim().startsWith('[') || raw.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            text = parsed
              .map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object') {
                  const row = item as Record<string, unknown>;
                  return String(row.domain || row.name || row.host || '');
                }
                return '';
              })
              .filter(Boolean)
              .join('\n');
          } else if (parsed && typeof parsed === 'object') {
            const obj = parsed as Record<string, unknown>;
            const list = (obj.domains || obj.data || obj.results) as unknown;
            if (Array.isArray(list)) {
              text = list
                .map((item) => (typeof item === 'string' ? item : String((item as { domain?: string })?.domain || '')))
                .filter(Boolean)
                .join('\n');
            }
          }
        } catch {
          // fall through to raw text parse
        }
      }

      add(text, options);
    };
    reader.onerror = () => showToast('Could not read that file', 'error');
    reader.readAsText(file);
  };

  // Landing Page View - Show the new enhanced landing page with search functionality
  return (
    <BulkDomainSearchLanding 
      onStartSearch={() => setShowResults(true)}
      input={input}
      setInput={setInput}
      domains={domains}
      setDomains={setDomains}
      onAdd={add}
      onLoadSample={loadSample}
      onCheck={() => {
        // Landing may commit draft textarea text via onAdd in the same click —
        // always advance to results; empty list is handled by the results UI.
        setShowResults(true);
      }}
      onReset={reset}
      onFileUpload={handleFileUpload}
      checking={checking}
      progress={progress}
      counts={counts}
      recentSearches={recentSearches}
      onLoadPreviousSearch={loadPreviousSearch}
      onDeletePreviousSearch={deletePreviousSearch}
    />
  );
};
