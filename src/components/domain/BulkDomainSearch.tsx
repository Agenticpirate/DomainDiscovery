'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { BulkDomainSearchLanding } from './BulkDomainSearchLanding';
import { PreferredRegistrarSelect, RegistrarActionMenu } from './RegistrarControls';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { getRegistrarUrl, type RegistrarName } from '@/lib/registrars';

interface DomainTag {
  domain: string;
  status: 'checking' | 'available' | 'taken' | 'premium' | 'error';
  price?: string;
  buyUrl?: string;
  purchaseInfo?: string;
}
type FilterType = 'all' | 'available' | 'taken' | 'premium';

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
    .map((item) => ({
      domain: item.domain,
      status: item.status,
      price: item.price,
      buyUrl: item.buyUrl,
      purchaseInfo: item.purchaseInfo,
    }))
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
  sortAZ: boolean;
  setSortAZ: (v: boolean) => void;
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
  sortAZ,
  setSortAZ,
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
    list.sort((a, b) => sortAZ ? a.domain.localeCompare(b.domain) : a.domain.length - b.domain.length);
    return list;
  }, [domains, filter, tldFilter, sortAZ]);

  const results = filtered();
  const counts = getDomainCounts(domains);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:gap-6 w-full max-w-7xl mx-auto px-2 sm:px-0">
      {/* Sidebar */}
      <div className={`lg:w-56 lg:shrink-0 space-y-3 sm:space-y-4 ${isLight ? 'lg:text-slate-800' : 'lg:text-white'}`}>
        <Button onClick={reset} variant="ghost" size="sm" className="justify-start gap-2 -ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          New bulk search
        </Button>

        <div className={`rounded-2xl border p-3 sm:p-4 ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-black/35 backdrop-blur-xl'}`}>
          <div className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Display</div>
          <div className="flex sm:block gap-1.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
          {[
            { k: 'all', l: 'All domains', c: counts.all, color: 'bg-white/20' },
            { k: 'available', l: 'Available', c: counts.available, color: 'bg-emerald-500' },
            { k: 'taken', l: 'Taken', c: counts.taken, color: 'bg-red-500/60' },
            { k: 'premium', l: 'Premium', c: counts.premium, color: 'bg-amber-500' },
          ].map(x => (
            <button
              key={x.k}
              onClick={() => setFilter(x.k as FilterType)}
              className={`sm:w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap ${filter === x.k ? (isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white') : (isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-white/60 hover:text-white hover:bg-white/5')}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${x.color}`} />
                {x.l}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{x.c}</span>
            </button>
          ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-3 sm:p-4 ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-black/35 backdrop-blur-xl'}`}>
          <div className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Filters</div>
          <button onClick={() => setShowTlds(!showTlds)} className={`w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <span>TLDs</span>
            {tldFilter.length > 0 && <Badge variant="success" size="sm">{tldFilter.length}</Badge>}
          </button>
          {showTlds && tlds.length > 0 && (
            <div className={`pl-4 py-2 space-y-1 border-l ml-3 mt-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              {tlds.map(t => (
                <label key={t} className={`flex items-center gap-2 text-xs cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white'}`}>
                  <input type="checkbox" checked={tldFilter.includes(t)} onChange={e => setTldFilter(e.target.checked ? [...tldFilter, t] : tldFilter.filter(x => x !== t))} className="w-3 h-3 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-0" />
                  .{t}
                </label>
              ))}
            </div>
          )}
          <button onClick={() => setSortAZ(!sortAZ)} className={`w-full flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            Sort: {sortAZ ? 'A-Z' : 'Length'}
          </button>
        </div>

        <div className={`hidden lg:block rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-black/35 backdrop-blur-xl'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Actions</div>
          <p className={`text-xs mb-3 italic ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Export includes available, taken, and premium domains.</p>
          <div className="space-y-2">
            <Button onClick={exportCSV} variant="secondary" size="sm" className="w-full justify-start gap-2">
              <Icons.Download />
              Export CSV
            </Button>
            <Button onClick={exportPDF} variant="secondary" size="sm" className="w-full justify-start gap-2">
              <Icons.Download />
              Export PDF
            </Button>
          </div>
          {recentSearches.length > 0 && (
            <div className="mt-5">
              <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Recent searches</div>
              <div className="space-y-2">
                {recentSearches.slice(0, 4).map((snapshot) => {
                  const snapshotCounts = getDomainCounts(snapshot.domains);
                  return (
                    <div
                      key={snapshot.id}
                      className={`rounded-lg border p-2.5 ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/[0.02]'}`}
                    >
                      <button
                        type="button"
                        onClick={() => onLoadSearch(snapshot)}
                        className="w-full text-left"
                      >
                        <div className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white/90'}`}>
                          {snapshot.domains.length} domains
                        </div>
                        <div className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                          {snapshotCounts.available} available • {snapshotCounts.taken} taken • {snapshotCounts.premium} premium
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSearch(snapshot.id)}
                        className={`mt-2 text-xs ${isLight ? 'text-slate-400 hover:text-red-500' : 'text-white/35 hover:text-red-400'}`}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Button onClick={reset} variant="ghost" size="sm" className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Reset
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 min-w-0">
        <div className={`rounded-2xl border p-3 sm:p-4 ${isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-black/35 backdrop-blur-xl'}`}>
        <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{results.length} domains</span>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="text-emerald-400">{counts.available} available</span>
              <span className="text-amber-400">{counts.premium} premium</span>
              <span className={isLight ? 'text-slate-400' : 'text-white/40'}>{counts.taken} taken</span>
              {counts.checking > 0 && <span className={isLight ? 'text-slate-400' : 'text-white/40'}>{counts.checking} checking</span>}
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <PreferredRegistrarSelect
              selectedRegistrar={selectedRegistrar}
              onSelectRegistrar={setSelectedRegistrar}
              label="Registrar"
              className="justify-between sm:justify-start"
            />
            <div className="flex gap-2 sm:hidden">
              <Button onClick={exportCSV} variant="secondary" size="sm" className="flex-1 gap-2">
              <Icons.Download />
              CSV
              </Button>
              <Button onClick={exportPDF} variant="secondary" size="sm" className="flex-1 gap-2">
              <Icons.Download />
              PDF
              </Button>
            </div>
          </div>
        </div>

        {counts.checking > 0 && (
          <div className={`h-1 rounded-full mb-4 overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} />
          </div>
        )}

        <div 
          className={`grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-0 sm:pr-1 select-none rounded-2xl ${isLight ? '' : '[background-image:none]'}`}
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
        >
          {results.map(d => (
            (() => {
              const domainHref = d.status === 'available'
                ? getRegistrarUrl(d.domain, selectedRegistrar)
                : d.status === 'premium' && d.buyUrl
                  ? d.buyUrl
                : `https://who.is/whois/${encodeURIComponent(d.domain)}`;
              const domainTitle = d.status === 'available'
                ? `Register on ${selectedRegistrar}`
                : d.status === 'premium' && d.buyUrl
                  ? (d.purchaseInfo || 'View premium listing')
                  : 'View WHOIS';

              return (
                <div
                  key={d.domain}
                  className={`relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl transition-all group ${
                    isLight
                      ? 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm'
                      : 'bg-[#101113]/95 border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/15'
                  }`}
                >
                  {!isLight && (
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.03),transparent_55%)]" />
                  )}
                  <div className="relative flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full shrink-0 ${
                      d.status === 'checking' ? 'bg-white/40 animate-pulse' :
                      d.status === 'available' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse' :
                      d.status === 'premium' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse' :
                      'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]'
                    }`} />
                    <a
                      href={domainHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-w-0 font-mono text-xs sm:text-sm truncate transition-colors cursor-pointer ${isLight ? 'text-slate-800 hover:text-slate-950' : 'text-white/92 hover:text-white'}`}
                      title={domainTitle}
                    >
                      {d.domain}
                    </a>
                    {d.status === 'premium' && <Badge variant="warning" size="sm">Premium</Badge>}
                    {d.price && <span className={`shrink-0 text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{d.price}</span>}
                  </div>
                  <div className="relative shrink-0">
                    <RegistrarActionMenu
                      domain={d.domain}
                      selectedRegistrar={selectedRegistrar}
                      onSelectRegistrar={setSelectedRegistrar}
                      canRegister={d.status === 'available'}
                      primaryLabel="Register"
                      premiumUrl={d.status === 'premium' ? d.buyUrl : undefined}
                      premiumLabel={d.purchaseInfo}
                      primaryButtonClassName="text-[11px] px-2 py-0.5 rounded bg-white text-slate-950 font-semibold transition-colors hover:bg-slate-100"
                      chevronButtonClassName={`rounded p-2 ${isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800'}`}
                      fallbackButtonClassName={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/8 text-white/80 hover:bg-white/12'}`}
                    />
                  </div>
                </div>
              );
            })()
          ))}
        </div>
        {results.length === 0 && <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>No domains match your filter</div>}
        </div>
      </div>
    </div>
  );
};

export const BulkDomainSearch: React.FC<{ onSelect?: (d: string) => void }> = () => {
  const [input, setInput] = useState('');
  const [domains, setDomains] = useState<DomainTag[]>([]);
  const [recentSearches, setRecentSearches] = useState<BulkSearchSnapshot[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortAZ, setSortAZ] = useState(true);
  const [tldFilter, setTldFilter] = useState<string[]>([]);
  const [showTlds, setShowTlds] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef(false);
  const queuedCheckRef = useRef<string[]>([]);
  const lastPersistedSnapshotRef = useRef('');
  const { showToast } = useToast();
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();

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
      })),
    };

    const nextHistory = [snapshot, ...loadBulkSearchHistory().filter((item) => serializeDomains(item.domains) !== fingerprint)].slice(
      0,
      BULK_SEARCH_HISTORY_LIMIT
    );
    saveBulkSearchHistory(nextHistory);
    setRecentSearches(nextHistory);
  }, [domains, checking]);

  const parse = (t: string) => {
    const out: string[] = [];
    for (let l of t.split(/[\n,;\s]+/).map(x => x.trim().toLowerCase())) {
      if (!l) continue;
      l = l.replace(/^https?:\/\//, '').split('/')[0];
      if (!/\.[a-z]{2,}$/.test(l)) l += '.com';
      if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(l) && !out.includes(l)) out.push(l);
    }
    return out.slice(0, 1000);
  };

  const add = useCallback((t: string) => {
    const names = parse(t), existing = domains.map(d => d.domain);
    const newOnes: DomainTag[] = names.filter(n => !existing.includes(n)).map(d => ({ domain: d, status: 'checking' }));
    if (newOnes.length) { setDomains([...domains, ...newOnes].slice(0, 1000)); checkBg(newOnes.map(d => d.domain)); }
  }, [domains]);

  const checkBg = async (list: string[]) => {
    if (checkRef.current) {
      queuedCheckRef.current = Array.from(new Set([...queuedCheckRef.current, ...list]));
      return;
    }
    checkRef.current = true; setChecking(true); setProgress({ done: 0, total: list.length });
    let done = 0;
    await checkDomainsInstant(list, (d, a, p, price, buyUrl, purchaseInfo) => {
      done++; setProgress(x => ({ ...x, done }));
      setDomains(prev => prev.map(x => x.domain === d ? {
        ...x,
        status: a ? 'available' : p ? 'premium' : 'taken',
        price: a ? (price || getPrice(d.split('.').pop() || 'com')) : p ? price : undefined,
        buyUrl: p ? buyUrl : undefined,
        purchaseInfo: p ? purchaseInfo : undefined,
      } : x));
    });
    checkRef.current = false; setChecking(false);

    if (queuedCheckRef.current.length > 0) {
      const nextBatch = [...queuedCheckRef.current];
      queuedCheckRef.current = [];
      await checkBg(nextBatch);
    }
  };

  const reset = () => { setDomains([]); setShowResults(false); setInput(''); setFilter('all'); setSortAZ(true); setTldFilter([]); setShowTlds(false); setProgress({ done: 0, total: 0 }); checkRef.current = false; setChecking(false); };

  const exportCSV = () => {
    const csv = ['Domain,Status,Price,TLD', ...domains.map((d) => `${d.domain},${d.status},${d.price || ''},.${d.domain.split('.').pop() || ''}`)].join('\n');
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
        const priceLabel = domain.price ? `  ${domain.price}` : domain.status === 'premium' ? '  Premium pricing' : '';
        writeLine(`${index + 1}. ${domain.domain}  ${domain.status.toUpperCase()}${priceLabel}`, { fontSize: 10 });
      });

      y += 6;
    });

    doc.save(`bulk-domains-${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Bulk search exported as PDF', 'success');
  };

  const counts = getDomainCounts(domains);

  const loadPreviousSearch = useCallback((snapshot: BulkSearchSnapshot) => {
    setDomains(snapshot.domains);
    setShowResults(true);
    setFilter('all');
    setSortAZ(true);
    setTldFilter([]);
    setShowTlds(false);
    setProgress({ done: snapshot.domains.length, total: snapshot.domains.length });
    showToast(`Loaded ${snapshot.domains.length} domains from a recent bulk search`, 'success');
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
        sortAZ={sortAZ}
        setSortAZ={setSortAZ}
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

  // File upload handler
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => add(ev.target?.result as string);
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
      onCheck={() => domains.length > 0 && setShowResults(true)}
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
