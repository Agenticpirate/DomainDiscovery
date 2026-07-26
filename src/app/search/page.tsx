'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { Icons } from '@/components/ui/Icons';
import { PreferredRegistrarSelect, RegistrarActionMenu } from '@/components/domain/RegistrarControls';
import { SearchInterface } from '@/components/domain/SearchInterface';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { getRegistrarUrl, type RegistrarName } from '@/lib/registrars';
import { searchDomains, checkDomainAvailability } from '@/services/instantDomainService';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { getSavedDomainNames, toggleSavedDomain } from '@/lib/savedDomainsStore';
import extensionsData from '@/data/extensions.json';

interface DomainResult {
  domain: string;
  available: boolean;
  tld: string;
  price?: string;
  premium?: boolean;
  registrar?: string;
  buyUrl?: string;
  purchaseInfo?: string;
}

interface PremiumEnrichment {
  domain: string;
  available: boolean;
  premium: boolean;
  price?: string;
  source?: 'godaddy' | 'mcp' | 'cache' | 'fallback';
  buyUrl?: string;
  purchaseInfo?: string;
}

const MAX_SEARCH_TLDS = 260;
const QUICK_TLDS_COUNT = 28;
const LONG_TAIL_BATCH_SIZE = 90;
const PRIORITY_TLDS = [
  '.com', '.co.in', '.org.in', '.org', '.io', '.app', '.info',
  '.store', '.online', '.in', '.net.in', '.net', '.ai', '.xyz',
  '.shop', '.co', '.site', '.dev', '.tech', '.me', '.biz', '.us',
  '.club', '.pro', '.live', '.world', '.today', '.link', '.blog',
  '.design', '.art', '.one', '.digital', '.space', '.media', '.host',
  '.ltd', '.agency', '.stream', '.work', '.love', '.cool',
  '.guru', '.fit', '.luxury', '.vip', '.top', '.tv', '.cloud',
  '.studio', '.fun', '.global', '.plus', '.email', '.page',
  '.social', '.zone', '.team', '.life', '.best', '.care',
  '.marketing', '.solutions', '.lol',
];

const ALL_TLDS = (() => {
  const seen = new Set<string>();
  const normalizedPriority = PRIORITY_TLDS.map((tld) =>
    tld.startsWith('.') ? tld.toLowerCase() : `.${tld.toLowerCase()}`
  );

  const fromData = (extensionsData as Array<{ tld: string }>)
    .map((ext) => ext.tld?.trim().toLowerCase())
    .filter((tld): tld is string => Boolean(tld))
    .map((tld) => (tld.startsWith('.') ? tld : `.${tld}`));

  const ordered = [...normalizedPriority, ...fromData].filter((tld) => {
    if (seen.has(tld)) return false;
    seen.add(tld);
    return true;
  });

  return ordered.slice(0, MAX_SEARCH_TLDS);
})();

// Generate brandable .com domain name variations
function generateBrandableDomains(query: string): string[] {
  const clean = query.toLowerCase().replace(/\s+/g, '');
  const domains: string[] = [];
  const prefixes = ['get', 'my', 'the', 'go', 'try', 'use', 'hey', 'join', 'be'];
  const suffixes = ['hq', 'app', 'hub', 'pro', 'labs', 'now', 'co', 'dev', 'ly', 'ify', 'ful', 'er', 'ize', 'up', 'it', 'on', 'ai', 'x', 'io', 'eo'];
  // Prefix combos
  for (const p of prefixes) domains.push(`${p}${clean}.com`);
  // Suffix combos
  for (const s of suffixes) domains.push(`${clean}${s}.com`);
  // Short variations
  if (clean.length > 5) {
    domains.push(`${clean.slice(0, 4)}.com`);
    domains.push(`${clean.slice(0, 5)}.com`);
    domains.push(`${clean.slice(0, 3)}${clean.slice(-2)}.com`);
  }
  // Double letter removal
  if (/(.)\1/.test(clean)) {
    domains.push(`${clean.replace(/(.)\1+/g, '$1')}.com`);
  }
  // Vowel removal
  const noVowels = clean.replace(/[aeiou]/g, '');
  if (noVowels.length >= 3 && noVowels !== clean) domains.push(`${noVowels}.com`);
  return Array.from(new Set(domains));
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<DomainResult[]>([]);
  const [brandableResults, setBrandableResults] = useState<DomainResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBrandableLoading, setIsBrandableLoading] = useState(false);
  const [savedDomains, setSavedDomains] = useState<string[]>([]);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [extFilter, setExtFilter] = useState<'all' | 'available' | 'premium' | 'taken'>('all');
  const [showAllExts, setShowAllExts] = useState(false);
  const [premiumEnrichmentMap, setPremiumEnrichmentMap] = useState<Record<string, PremiumEnrichment>>({});
  const searchRequestIdRef = useRef(0);
  const premiumFetchKeyRef = useRef('');
  const premiumFetchInFlightRef = useRef(false);
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? theme === 'light' : false;

  useEffect(() => {
    setMounted(true);
    setSavedDomains(getSavedDomainNames());
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setBrandableResults([]);
      setIsLoading(false);
      setIsBrandableLoading(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    setPremiumEnrichmentMap({});
    premiumFetchKeyRef.current = '';
    premiumFetchInFlightRef.current = false;
    setIsLoading(true);
    setIsBrandableLoading(true);
    const cleanQuery = q.toLowerCase().replace(/\s+/g, '');
    const quickTlds = ALL_TLDS.slice(0, QUICK_TLDS_COUNT);
    const longTailTlds = ALL_TLDS.slice(QUICK_TLDS_COUNT);

    const mergeResults = (existing: DomainResult[], incoming: DomainResult[]) => {
      const merged = new Map<string, DomainResult>();
      existing.forEach((item) => merged.set(item.domain, item));
      incoming.forEach((item) => merged.set(item.domain, item));
      return Array.from(merged.values());
    };

    let quickResults: DomainResult[] = [];
    try {
      quickResults = await searchDomains(cleanQuery, quickTlds);
      if (requestId !== searchRequestIdRef.current) return;
      setResults(quickResults);
    } catch {
      if (requestId !== searchRequestIdRef.current) return;
    }

    if (longTailTlds.length > 0) {
      for (let i = 0; i < longTailTlds.length; i += LONG_TAIL_BATCH_SIZE) {
        const batch = longTailTlds.slice(i, i + LONG_TAIL_BATCH_SIZE);
        try {
          const batchResults = await searchDomains(cleanQuery, batch);
          if (requestId !== searchRequestIdRef.current) return;
          setResults((prev) => mergeResults(prev, batchResults));
        } catch {
          if (requestId !== searchRequestIdRef.current) return;
        }
      }
    }

    if (requestId === searchRequestIdRef.current) {
      setIsLoading(false);
    }

    try {
      const brandableDomains = generateBrandableDomains(cleanQuery).slice(0, 24);
      const checked = await checkDomainAvailability(brandableDomains);
      if (requestId !== searchRequestIdRef.current) return;
      const brandable: DomainResult[] = checked.map((d) => ({
        domain: d.domain,
        available: d.available,
        tld: 'com',
        price: d.price || (d.available ? '$12.99' : undefined),
        premium: !!d.premium,
      }));
      setBrandableResults(brandable);
      setIsBrandableLoading(false);
    } catch {
      if (requestId !== searchRequestIdRef.current) return;
      setIsBrandableLoading(false);
    }
  }, []);

  const handleResetSearch = () => {
    setQuery('');
    setResults([]);
    setBrandableResults([]);
    setPremiumEnrichmentMap({});
    premiumFetchKeyRef.current = '';
    premiumFetchInFlightRef.current = false;
    router.replace('/search', { scroll: false });
  };

  const handleLiveSearch = useCallback((nextQuery: string) => {
    const clean = nextQuery.trim();
    setQuery(clean);
    router.replace(clean ? `/search?q=${encodeURIComponent(clean)}` : '/search', { scroll: false });
    void doSearch(clean);
  }, [doSearch, router]);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) doSearch(initialQuery);
    else {
      setResults([]);
      setBrandableResults([]);
    }
  }, [initialQuery, doSearch]);

  const handleBuy = useCallback((domain: string) => {
    window.open(getRegistrarUrl(domain, selectedRegistrar), '_blank', 'noopener,noreferrer');
  }, [selectedRegistrar]);

  const handleSave = (domain: string) => {
    const { saved } = toggleSavedDomain(domain);
    setSavedDomains(getSavedDomainNames());
    showToast(saved ? `Saved ${domain}` : `Removed ${domain}`, 'success', 1500);
  };

  /** Block clipboard copy of domain names — save only */
  const blockCopy = (e: React.ClipboardEvent | React.MouseEvent) => {
    e.preventDefault();
  };

  const handlePronounce = (domain: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(domain.replace('.', ' dot '));
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const primary = results.find(r => r.domain.endsWith('.com')) || results[0];
  const brandableTaken = brandableResults.filter(r => !r.available);

  const premiumCandidates = useMemo(() => {
    const seen = new Set<string>();
    const domains: string[] = [];
    const push = (domain: string) => {
      const key = domain.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      domains.push(key);
    };

    results.filter(r => !r.available && (r.domain.endsWith('.com') || r.premium)).slice(0, 18).forEach(r => push(r.domain));
    brandableTaken.slice(0, 6).forEach(r => push(r.domain));
    return domains.slice(0, 20);
  }, [results, brandableTaken]);

  useEffect(() => {
    if (premiumCandidates.length === 0) return;
    const key = `${query.toLowerCase()}::${premiumCandidates.join(',')}`;
    if (premiumFetchKeyRef.current === key || premiumFetchInFlightRef.current) return;
    premiumFetchKeyRef.current = key;

    let cancelled = false;
    premiumFetchInFlightRef.current = true;

    const loadPremium = async () => {
      try {
        const res = await fetch('/api/domains/premium-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domains: premiumCandidates }),
        });
        if (!res.ok) return;
        const data: PremiumEnrichment[] = await res.json();
        if (cancelled) return;

        setPremiumEnrichmentMap(prev => {
          const next = { ...prev };
          data.forEach(item => {
            if (!item?.domain) return;
            next[item.domain.toLowerCase()] = item;
          });
          return next;
        });
      } catch {
        // no-op; premium rows still render without enrichment
      } finally {
        premiumFetchInFlightRef.current = false;
      }
    };

    void loadPremium();
    return () => {
      cancelled = true;
    };
  }, [premiumCandidates, query]);

  const premiumResults = useMemo(() => {
    const seen = new Set<string>();
    const collected: DomainResult[] = [];

    const pushIfNew = (candidate: DomainResult) => {
      const key = candidate.domain.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      collected.push(candidate);
    };

    results.filter(r => r.premium).forEach(pushIfNew);
    results
      .filter(r => !r.available && r.domain.endsWith('.com'))
      .filter(r => {
        const enriched = premiumEnrichmentMap[r.domain.toLowerCase()];
        return !!enriched?.premium || !!enriched?.price;
      })
      .slice(0, 30)
      .forEach(r => {
        const enriched = premiumEnrichmentMap[r.domain.toLowerCase()];
        pushIfNew({ ...r, price: enriched?.price || r.price });
      });
    brandableTaken
      .filter((result) => {
        const enriched = premiumEnrichmentMap[result.domain.toLowerCase()];
        return !!enriched?.premium || !!enriched?.price;
      })
      .forEach((result) => {
        const enriched = premiumEnrichmentMap[result.domain.toLowerCase()];
        pushIfNew({ ...result, price: enriched?.price || result.price, premium: !!enriched?.premium });
      });

    const enrichedCollected = collected.map(item => {
      const enriched = premiumEnrichmentMap[item.domain.toLowerCase()];
      if (!enriched) return item;
      return {
        ...item,
        premium: enriched.premium || item.premium,
        price: enriched.price || item.price,
      };
    });

    return enrichedCollected
      .filter(item => item.premium)
      .slice(0, 36);
  }, [results, brandableTaken, premiumEnrichmentMap]);

  const premiumDomainSet = useMemo(
    () => new Set(premiumResults.map((result) => result.domain.toLowerCase())),
    [premiumResults]
  );

  /** All results in one dense grid (primary + extensions + premium) — full-space IDS style */
  const allGridResults = useMemo(() => {
    const map = new Map<string, DomainResult>();
    const push = (r: DomainResult) => {
      const key = r.domain.toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, r);
        return;
      }
      // Prefer premium enrichment / price
      if (r.premium || r.price) {
        map.set(key, { ...existing, ...r, premium: r.premium || existing.premium });
      }
    };
    results.forEach(push);
    premiumResults.forEach(push);
    return Array.from(map.values());
  }, [results, premiumResults]);

  const availableExts = useMemo(
    () => allGridResults.filter((r) => r.available && !premiumDomainSet.has(r.domain.toLowerCase())),
    [allGridResults, premiumDomainSet]
  );
  const taken = useMemo(
    () => allGridResults.filter((r) => !r.available && !premiumDomainSet.has(r.domain.toLowerCase())),
    [allGridResults, premiumDomainSet]
  );
  const premiumOnly = useMemo(
    () => allGridResults.filter((r) => premiumDomainSet.has(r.domain.toLowerCase()) || r.premium),
    [allGridResults, premiumDomainSet]
  );

  const filteredExtensions = useMemo(() => {
    let list: DomainResult[];
    if (extFilter === 'available') list = availableExts;
    else if (extFilter === 'taken') list = taken;
    else if (extFilter === 'premium') list = premiumOnly;
    else list = allGridResults;

    if (extFilter === 'all') {
      // Available first, then premium, then taken — fills the grid like the reference
      list = [...list].sort((a, b) => {
        const score = (r: DomainResult) => {
          if (r.available) return 0;
          if (r.premium || premiumDomainSet.has(r.domain.toLowerCase())) return 1;
          return 2;
        };
        return score(a) - score(b);
      });
    }
    return list;
  }, [extFilter, allGridResults, availableExts, taken, premiumOnly, premiumDomainSet]);

  // Full-space: show many rows by default; mobile still compact
  const EXT_PREVIEW_MOBILE = 24;
  const EXT_PREVIEW_DESKTOP = 80;
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  const extPreview = isDesktop ? EXT_PREVIEW_DESKTOP : EXT_PREVIEW_MOBILE;
  const visibleExtensions = showAllExts
    ? filteredExtensions
    : filteredExtensions.slice(0, extPreview);
  const hiddenExtCount = Math.max(0, filteredExtensions.length - visibleExtensions.length);

  useEffect(() => {
    setShowAllExts(false);
  }, [query, extFilter]);

  const btnClass = `inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-[11px] font-semibold rounded-full border transition-colors ${
    isLight
      ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      : 'border-white/12 bg-white/[0.04] text-white/65 hover:border-white/20 hover:bg-white/[0.07]'
  }`;

  const primarySaved = primary ? savedDomains.includes(primary.domain) : false;
  const checkedCount = allGridResults.length;
  const progressPct = isLoading
    ? Math.min(92, Math.max(12, Math.round((checkedCount / Math.max(ALL_TLDS.length, 1)) * 100)))
    : checkedCount > 0
      ? 100
      : 0;


  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-clip select-none"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
      onCopy={blockCopy}
      onCut={blockCopy}
    >
      {/* No hero orbs / dots on search output — solid surface only */}
      <PageBackground variant="minimal" />
      <Navigation activeTool="search" onToolSelect={() => {}} />

      <main className="relative w-full max-w-full overflow-x-clip pt-[3.05rem] sm:pt-[3.9rem] pb-6">
        {/* Dots disabled on search — results must stay free of ambient bubbles */}
        <SectionAmbient
          intensity="page"
          solidBase
          disabled
          className="min-h-[70vh] w-full max-w-full overflow-x-clip"
        >
        {/* Full-width sticky chrome — fully opaque (no glass bleed) */}
        <div
          className={`relative sticky top-[2.95rem] sm:top-[3.75rem] z-40 border-b w-full max-w-full ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#050505] border-white/[0.07]'
          }`}
        >
          <div className="w-full max-w-full sm:max-w-[100rem] mx-auto px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 box-border">
            <div className="flex items-center gap-2 min-w-0 w-full max-w-full">
              <div className="min-w-0 flex-1 overflow-hidden">
                <SearchInterface
                  initialQuery={query}
                  placeholder="Search a domain…"
                  onSearch={handleLiveSearch}
                  onClear={handleResetSearch}
                  autoFocus={true}
                  showRecentSearches={false}
                  debounceMs={120}
                  isLoading={isLoading}
                />
              </div>
              <PreferredRegistrarSelect
                selectedRegistrar={selectedRegistrar}
                onSelectRegistrar={setSelectedRegistrar}
                label=""
                className="hidden md:flex shrink-0 [&>span]:hidden [&>select]:min-w-[7rem] [&>select]:py-1.5 [&>select]:px-2 [&>select]:text-[11px]"
              />
            </div>

            {/* Tabs: scroll row + Clear fixed so labels never collide */}
            <div className="mt-1.5 flex items-center gap-1.5 w-full max-w-full min-w-0">
              <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain scrollbar-hide">
                <div className="flex items-center gap-0.5 sm:gap-1 w-max pr-1">
                  {[
                    { href: '/search', label: 'Search', active: true },
                    { href: '/domain-extensions', label: 'Extensions', active: false },
                    { href: '/generator', label: 'Generator', active: false },
                    { href: '/premium', label: 'Aftermarket', active: false },
                    { href: '/tools', label: 'Research', active: false },
                  ].map((tab) =>
                    tab.active ? (
                      <span
                        key={tab.label}
                        className={`shrink-0 inline-flex items-center px-2 py-1 text-[11px] font-bold border-b-2 ${
                          isLight
                            ? 'text-slate-900 border-slate-900'
                            : 'text-white border-white'
                        }`}
                      >
                        {tab.label}
                      </span>
                    ) : (
                      <Link
                        key={tab.label}
                        href={tab.href}
                        className={`shrink-0 inline-flex items-center px-2 py-1 text-[11px] font-semibold border-b-2 border-transparent ${
                          isLight
                            ? 'text-slate-500 hover:text-slate-800'
                            : 'text-white/40 hover:text-white/75'
                        }`}
                      >
                        {tab.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
              {query && (
                <button type="button" onClick={handleResetSearch} className={`${btnClass} shrink-0`}>
                  Clear
                </button>
              )}
            </div>

            {/* Status filters live in sticky chrome so they never clip under the bar */}
            {checkedCount > 0 && (
              <div className="mt-2 w-full max-w-full">
                <div className="flex items-center gap-2 mb-1.5 min-w-0">
                  <div
                    className={`h-1 flex-1 min-w-0 rounded-full overflow-hidden ${
                      isLight ? 'bg-slate-200' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium tabular-nums shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isLoading ? `Checking ${checkedCount}…` : `${checkedCount} extensions`}
                  </span>
                </div>

                <div
                  role="tablist"
                  aria-label="Filter by availability status"
                  className="grid grid-cols-4 gap-1.5 w-full"
                >
                  {(
                    [
                      {
                        id: 'available' as const,
                        label: 'Available',
                        n: availableExts.length,
                        dot: isLight ? 'bg-emerald-500' : 'bg-emerald-400',
                      },
                      {
                        id: 'premium' as const,
                        label: 'Premium',
                        n: premiumOnly.length,
                        dot: 'bg-amber-400',
                      },
                      {
                        id: 'taken' as const,
                        label: 'Taken',
                        n: taken.length,
                        dot: isLight ? 'bg-rose-500' : 'bg-rose-400',
                      },
                      {
                        id: 'all' as const,
                        label: 'All',
                        n: checkedCount,
                        dot: isLight ? 'bg-slate-400' : 'bg-white/50',
                      },
                    ] as const
                  ).map((f) => {
                    const active = extFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setExtFilter(f.id)}
                        className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] w-full rounded-xl border px-1 py-1.5 transition-colors ${
                          active
                            ? isLight
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-black border-white'
                            : isLight
                              ? 'bg-slate-50 text-slate-700 border-slate-200'
                              : 'bg-[#121214] text-white border-white/12'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1 max-w-full">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${f.dot}`} />
                          <span className="text-[10px] sm:text-[11px] font-bold leading-tight text-center">
                            {f.label}
                          </span>
                        </span>
                        <span
                          className={`text-[13px] sm:text-[14px] font-black tabular-nums leading-none ${
                            active
                              ? isLight
                                ? 'text-white'
                                : 'text-black'
                              : isLight
                                ? 'text-slate-900'
                                : 'text-white'
                          }`}
                        >
                          {f.n}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results panel — solid plate, locked to viewport width (no side pan) */}
        <div
          className="w-full max-w-full sm:max-w-[100rem] mx-auto px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 box-border overflow-x-clip"
          style={{ backgroundColor: isLight ? '#ffffff' : '#050505' }}
        >
          {isLoading && results.length === 0 && (
            <div className="py-16 text-center">
              <div className="inline-flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
                    borderTopColor: isLight ? '#0f172a' : '#fff',
                  }}
                />
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  Checking…
                </span>
              </div>
            </div>
          )}

          {!isLoading && results.length === 0 && !query && (
            <div className="text-center py-16">
              <p className="text-[15px] font-bold mb-1">Search any name</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Live availability across {ALL_TLDS.length}+ extensions
              </p>
            </div>
          )}

          {/* Compact primary strip — solid, full domain visible on mobile */}
          {primary && (
            <div
              className={`shine-border no-lift flex flex-col gap-2 rounded-xl border px-3 sm:px-3.5 py-2.5 sm:py-2 mb-2 sm:mb-2.5 w-full max-w-full min-w-0 box-border ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-[#0c0c0e] border-white/10'
              }`}
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 w-full min-w-0">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    primary.available
                      ? isLight
                        ? 'bg-emerald-500'
                        : 'bg-emerald-400'
                      : isLight
                        ? 'bg-rose-500'
                        : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`font-mono text-[13px] sm:text-[15px] font-bold break-all select-none min-w-0 ${
                    primary.available
                      ? isLight
                        ? 'text-slate-900'
                        : 'text-white'
                      : isLight
                        ? 'text-slate-500'
                        : 'text-white/70'
                  }`}
                  onCopy={blockCopy}
                >
                  {primary.domain}
                </span>
                <span
                  className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                    primary.available
                      ? isLight
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-emerald-400/15 text-emerald-300'
                      : isLight
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-rose-400/15 text-rose-300'
                  }`}
                >
                  {primary.available ? 'Available' : 'Taken'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 w-full max-w-full flex-wrap justify-end">
                <button type="button" onClick={() => handlePronounce(primary.domain)} className={btnClass}>
                  <span className="sm:hidden">Say</span>
                  <span className="hidden sm:inline">Pronounce</span>
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setShowMoreActions(!showMoreActions)} className={btnClass}>
                    More
                  </button>
                  {showMoreActions && (
                    <div
                      className={`absolute top-full right-0 mt-1 rounded-lg z-50 py-0.5 min-w-[140px] border ${
                        isLight
                          ? 'bg-white border-slate-200 shadow-lg'
                          : 'bg-neutral-900 border-white/10 shadow-xl'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          window.open(
                            `https://www.godaddy.com/domain-value-appraisal/appraisal/?domain=${primary.domain}`,
                            '_blank'
                          );
                          setShowMoreActions(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] font-medium ${
                          isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-white/5 text-white/60'
                        }`}
                      >
                        Value
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.open(`https://web.archive.org/web/*/${primary.domain}`, '_blank');
                          setShowMoreActions(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] font-medium ${
                          isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-white/5 text-white/60'
                        }`}
                      >
                        Wayback
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSave(primary.domain)}
                  className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border shrink-0 ${
                    primarySaved
                      ? isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                      : isLight
                        ? 'border-slate-200 text-slate-500 bg-white'
                        : 'border-white/12 text-white/45 bg-[#0c0c0e]'
                  }`}
                  aria-label="Save"
                >
                  <svg className="w-3.5 h-3.5" fill={primarySaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    primary.available
                      ? handleBuy(primary.domain)
                      : window.open(
                          `https://who.is/whois/${encodeURIComponent(primary.domain)}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                  }
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] font-bold shrink-0 ${
                    primary.available
                      ? isLight
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : isLight
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-white/10 text-white/70'
                  }`}
                >
                  {primary.available ? 'Continue' : 'Lookup'}
                </button>
              </div>
            </div>
          )}

          {/* Domain grid — solid rows, full names, compact CTAs; never wider than viewport */}
          {checkedCount > 0 && (
            <div
              className={`rounded-xl border p-1 sm:p-1.5 w-full max-w-full min-w-0 overflow-x-clip box-border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0c] border-white/[0.08]'
              }`}
            >
              {visibleExtensions.length === 0 ? (
                <p className="text-center text-[12px] py-12" style={{ color: 'var(--text-muted)' }}>
                  Nothing in this filter
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-x-1 gap-y-0.5 w-full max-w-full min-w-0">
                  {visibleExtensions.map((r) => (
                    <DomainRow
                      key={r.domain}
                      result={r}
                      isLight={isLight}
                      onSave={handleSave}
                      isSaved={savedDomains.includes(r.domain)}
                      selectedRegistrar={selectedRegistrar}
                      onSelectRegistrar={setSelectedRegistrar}
                      onBlockCopy={blockCopy}
                    />
                  ))}
                </div>
              )}

              {(hiddenExtCount > 0 || showAllExts) && (
                <div className="mt-4 flex flex-col items-center gap-3 py-6">
                  {/* Quiet divider */}
                  <div
                    aria-hidden
                    className={`h-px w-12 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}
                  />

                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                    {hiddenExtCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAllExts(true)}
                        className={`group inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[13px] font-semibold tracking-[-0.01em] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                          isLight
                            ? 'border-slate-900/10 bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] hover:border-slate-900/20 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_12px_28px_-12px_rgba(15,23,42,0.16)] focus-visible:ring-slate-300 focus-visible:ring-offset-white'
                            : 'border-white/[0.1] bg-white/[0.06] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-sm hover:border-white/18 hover:bg-white/[0.09] focus-visible:ring-white/25 focus-visible:ring-offset-[#050505]'
                        }`}
                      >
                        <span className="tracking-tight">
                          View{' '}
                          <span
                            className={`tabular-nums ${
                              isLight ? 'text-slate-500' : 'text-white/50'
                            }`}
                          >
                            {hiddenExtCount.toLocaleString()}
                          </span>{' '}
                          more
                        </span>
                        <svg
                          className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-px ${
                            isLight ? 'text-slate-400' : 'text-white/40'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {showAllExts && (
                      <button
                        type="button"
                        onClick={() => setShowAllExts(false)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[12px] font-medium tracking-tight transition-colors duration-200 ${
                          isLight
                            ? 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                            : 'border-white/[0.08] bg-transparent text-white/45 hover:border-white/15 hover:text-white/80'
                        }`}
                      >
                        Show less
                      </button>
                    )}

                    <Link
                      href="/domain-extensions"
                      className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[12px] font-medium tracking-tight transition-colors duration-200 ${
                        isLight
                          ? 'text-slate-400 hover:text-slate-800'
                          : 'text-white/35 hover:text-white/75'
                      }`}
                    >
                      Full catalog
                      <span
                        aria-hidden
                        className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && results.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 py-2">
              <div
                className="w-2.5 h-2.5 border-2 rounded-full animate-spin"
                style={{
                  borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
                  borderTopColor: isLight ? '#0f172a' : '#fff',
                }}
              />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Checking more extensions…
              </span>
            </div>
          )}
        </div>

        <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.search} compact />
        <SeoGuidePack {...TOOL_GUIDE_PACKS.search} />
        </SectionAmbient>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }} />}>
      <SearchPageContent />
    </Suspense>
  );
}

/* ── Dense grid row — Continue / Lookup / $price (IDS-style, full-width columns) ── */
function DomainRow({
  result,
  isLight,
  onSave,
  isSaved,
  selectedRegistrar,
  onSelectRegistrar,
  onBlockCopy,
}: {
  result: DomainResult;
  isLight: boolean;
  onSave: (d: string) => void;
  isSaved: boolean;
  selectedRegistrar: RegistrarName;
  onSelectRegistrar: (registrar: RegistrarName) => void;
  onBlockCopy: (e: React.ClipboardEvent | React.MouseEvent) => void;
}) {
  const isAvailable = result.available;
  const price = result.price ? parseFloat(result.price.replace(/[^0-9.]/g, '')) : null;
  const showPremiumPrice = (!!result.premium || !!price) && !isAvailable && !!price && price > 50;
  const isPremium = !!result.premium || showPremiumPrice;

  const ctaText = isAvailable
    ? 'Continue'
    : showPremiumPrice
      ? `$${price!.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : 'Lookup';

  // Available + premium: open preferred registrar search for this exact domain
  const domainHref =
    isAvailable || isPremium
      ? getRegistrarUrl(result.domain, selectedRegistrar)
      : result.buyUrl
        ? result.buyUrl
        : `https://who.is/whois/${encodeURIComponent(result.domain)}`;
  const domainTitle =
    isAvailable || isPremium
      ? `Search ${result.domain} on ${selectedRegistrar}`
      : result.buyUrl
        ? result.purchaseInfo || 'View listing'
        : 'View WHOIS';

  const statusDot = isAvailable
    ? isLight
      ? 'bg-emerald-500'
      : 'bg-emerald-400'
    : isPremium
      ? 'bg-amber-400'
      : isLight
        ? 'bg-rose-500'
        : 'bg-rose-400';

  const ctaClass = isAvailable
    ? isLight
      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
      : 'bg-emerald-500/90 text-black hover:bg-emerald-400'
    : showPremiumPrice
      ? isLight
        ? 'bg-amber-500 text-black hover:bg-amber-400'
        : 'bg-amber-400 text-black hover:bg-amber-300'
      : isLight
        ? 'bg-slate-100 text-rose-600 hover:bg-slate-200'
        : 'bg-white/[0.08] text-rose-300 hover:bg-white/12';

  const desktopCta = isAvailable
    ? ctaText
    : isPremium
      ? showPremiumPrice
        ? ctaText
        : 'Search'
      : ctaText;
  // Compact mobile label so domain names are not crushed by "Continue"
  const ctaLabel = (
    <>
      <span className="sm:hidden">{isAvailable ? 'Go' : showPremiumPrice ? ctaText : 'WHOIS'}</span>
      <span className="hidden sm:inline">{desktopCta}</span>
    </>
  );

  return (
    <div
      className={`shine-border no-lift group grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg py-2 px-2 sm:px-2.5 transition-colors box-border ${
        isLight
          ? 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200'
          : 'bg-[#0a0a0c] hover:bg-[#101014] border border-transparent hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} aria-hidden />
        <a
          href={domainHref}
          target="_blank"
          rel="noopener noreferrer"
          title={domainTitle}
          onCopy={onBlockCopy}
          className={`font-mono text-[12px] sm:text-[12.5px] leading-snug select-none transition-colors break-all min-w-0 ${
            isAvailable
              ? isLight
                ? 'text-slate-900 hover:text-slate-950'
                : 'text-white hover:text-white'
              : isLight
                ? 'text-slate-600 hover:text-slate-800'
                : 'text-white/70 hover:text-white/90'
          }`}
        >
          {result.domain}
        </a>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
            isAvailable
              ? isLight
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-emerald-400/15 text-emerald-300'
              : isPremium
                ? isLight
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-amber-400/15 text-amber-300'
                : isLight
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-rose-400/15 text-rose-300'
          }`}
        >
          {isAvailable ? 'Available' : isPremium ? 'Premium' : 'Taken'}
        </span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0 justify-end">
        <button
          type="button"
          onClick={() => onSave(result.domain)}
          className={`p-1.5 rounded-md transition-colors sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 ${
            isSaved
              ? isLight
                ? 'text-slate-900 opacity-100'
                : 'text-white opacity-100'
              : isLight
                ? 'text-slate-400 hover:text-slate-600'
                : 'text-white/40 hover:text-white/70'
          }`}
          aria-label={isSaved ? 'Remove save' : 'Save domain'}
          title={isSaved ? 'Saved' : 'Save'}
        >
          <svg
            className="w-3.5 h-3.5"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
        <RegistrarActionMenu
          domain={result.domain}
          selectedRegistrar={selectedRegistrar}
          onSelectRegistrar={onSelectRegistrar}
          canRegister={isAvailable || isPremium}
          primaryLabel={ctaLabel}
          premiumUrl={result.premium ? result.buyUrl : undefined}
          premiumLabel={result.purchaseInfo}
          primaryButtonClassName={`min-w-0 sm:min-w-[4.25rem] px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-colors whitespace-nowrap ${ctaClass}`}
          chevronButtonClassName={`rounded-md p-1 transition-colors ${ctaClass}`}
          fallbackButtonClassName={`min-w-0 sm:min-w-[4.25rem] px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-colors whitespace-nowrap ${ctaClass}`}
        />
      </div>
    </div>
  );
}
