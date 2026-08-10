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
import { resolveRegisterUrl, type RegistrarName } from '@/lib/registrars';
import { searchDomains, checkDomainAvailability } from '@/services/instantDomainService';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { TOOL_GUIDE_PACKS } from '@/components/seo/toolGuidePacks';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import { AffiliateAdRail } from '@/components/ads/AffiliateAdRail';
import { getSavedDomainNames, toggleSavedDomain } from '@/lib/savedDomainsStore';
import extensionsData from '@/data/extensions.json';
import {
  extensionsCatalogHref as buildExtensionsCatalogHref,
  normalizeCatalogKeyword,
  writeCatalogSeed,
} from '@/lib/catalogHandoff';

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

  /** Keyword to hand off to Full catalog / TLDs — prefer live state, fall back to URL */
  const catalogHandoffQuery = normalizeCatalogKeyword(query || initialQuery || '');
  const extensionsCatalogHref = buildExtensionsCatalogHref(catalogHandoffQuery);

  const handleCatalogHandoff = useCallback(() => {
    if (catalogHandoffQuery) writeCatalogSeed(catalogHandoffQuery);
  }, [catalogHandoffQuery]);
  const [results, setResults] = useState<DomainResult[]>([]);
  const [brandableResults, setBrandableResults] = useState<DomainResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBrandableLoading, setIsBrandableLoading] = useState(false);
  const [savedDomains, setSavedDomains] = useState<string[]>([]);
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

  const handleSave = (domain: string) => {
    const { saved } = toggleSavedDomain(domain);
    setSavedDomains(getSavedDomainNames());
    showToast(saved ? `Saved ${domain}` : `Removed ${domain}`, 'success', 1500);
  };

  /** Block clipboard copy of domain names — save only */
  const blockCopy = (e: React.ClipboardEvent | React.MouseEvent) => {
    e.preventDefault();
  };

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

  const checkedCount = allGridResults.length;
  const progressPct = isLoading
    ? Math.min(92, Math.max(12, Math.round((checkedCount / Math.max(ALL_TLDS.length, 1)) * 100)))
    : checkedCount > 0
      ? 100
      : 0;


  return (
    <div
      className="page-x-lock flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden select-none"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
      onCopy={blockCopy}
      onCut={blockCopy}
    >
      {/* No hero orbs / dots on search output — solid surface only */}
      <PageBackground variant="minimal" />
      <Navigation activeTool="search" onToolSelect={() => {}} />

      {/*
        Split layout: chrome is flex-none (never overlaps results).
        Only the results pane scrolls — fixes first row clipped under sticky filters.
      */}
      <main className="page-main relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
        {/* Compact tool UI — visible title would fight the search chrome; keep H1 for SEO/a11y */}
        <h1 className="sr-only">Domain availability checker — instant domain search</h1>
        <SectionAmbient
          intensity="hero"
          solidBase
          /* Results list is dense — keep dots off so status rows stay crystal clear */
          disabled
          spotlight={false}
          className="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden"
          contentClassName="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden"
        >
        {/* Search chrome — fixed height, not sticky over the list */}
        <div
          className={`relative z-40 w-full max-w-full shrink-0 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#050505] border-white/[0.07]'
          }`}
        >
          <div className="w-full max-w-full sm:max-w-[100rem] mx-auto px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 box-border space-y-2">
            {/* Row 1 — search + registrar */}
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
                className="hidden md:flex shrink-0 [&>span]:hidden [&>select]:min-w-[7.5rem] [&>select]:rounded-full [&>select]:py-2 [&>select]:px-3 [&>select]:text-[11px] [&>select]:font-semibold"
              />
            </div>

            {/* Row 2 — tools + clear as one segmented bar */}
            <div
              className={`flex items-center gap-1 w-full min-w-0 rounded-2xl border p-1 ${
                isLight
                  ? 'bg-slate-100/80 border-slate-200/90'
                  : 'bg-white/[0.035] border-white/[0.08]'
              }`}
            >
              <nav
                aria-label="Domain tools"
                className={`grid min-w-0 flex-1 gap-0.5 ${
                  query ? 'grid-cols-5' : 'grid-cols-5'
                }`}
              >
                {(
                  [
                    { href: '/search', label: 'Search', short: 'Search', active: true, catalog: false },
                    {
                      href: extensionsCatalogHref,
                      label: 'Extensions',
                      short: 'TLDs',
                      active: false,
                      catalog: true,
                    },
                    { href: '/generator', label: 'Generator', short: 'Gen', active: false, catalog: false },
                    { href: '/premium', label: 'Aftermarket', short: 'Market', active: false, catalog: false },
                    { href: '/tools/keyword', label: 'Research', short: 'Tools', active: false, catalog: false },
                  ] as const
                ).map((tab) => {
                  const cls = `min-w-0 inline-flex items-center justify-center rounded-xl px-1 sm:px-2.5 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-semibold tracking-tight transition-colors duration-150 text-center leading-tight ${
                    tab.active
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/[0.04]'
                        : 'bg-white text-black shadow-[0_1px_0_rgba(255,255,255,0.1)_inset]'
                      : isLight
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-white/40 hover:text-white/80'
                  }`;
                  return tab.active ? (
                    <span key={tab.label} className={cls} aria-current="page" title={tab.label}>
                      <span className="sm:hidden">{tab.short}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  ) : (
                    <Link
                      key={tab.label}
                      href={tab.href}
                      className={cls}
                      title={tab.label}
                      onClick={tab.catalog ? handleCatalogHandoff : undefined}
                    >
                      <span className="sm:hidden">{tab.short}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Link>
                  );
                })}
              </nav>
              {query && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className={`shrink-0 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-colors ${
                    isLight
                      ? 'text-slate-400 hover:text-slate-800 hover:bg-white'
                      : 'text-white/35 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Row 3 — availability segment control */}
            {checkedCount > 0 && (
              <div className="w-full max-w-full min-w-0">
                {isLoading && (
                  <div className="flex items-center gap-2 mb-1.5 min-w-0 px-0.5">
                    <div
                      className={`h-1 flex-1 min-w-0 rounded-full overflow-hidden ${
                        isLight ? 'bg-slate-200' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLight ? 'bg-slate-900' : 'bg-white/45'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-medium tabular-nums shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Checking {checkedCount}…
                    </span>
                  </div>
                )}

                <div
                  role="tablist"
                  aria-label="Filter by availability status"
                  className={`grid grid-cols-4 gap-0.5 w-full rounded-2xl border p-1 ${
                    isLight
                      ? 'bg-slate-100/70 border-slate-200/90'
                      : 'bg-white/[0.03] border-white/[0.08]'
                  }`}
                >
                  {(
                    [
                      {
                        id: 'available' as const,
                        label: 'Available',
                        n: availableExts.length,
                        dot: isLight ? 'bg-emerald-500' : 'bg-emerald-400',
                        activeDot: isLight ? 'bg-emerald-600' : 'bg-emerald-500',
                      },
                      {
                        id: 'premium' as const,
                        label: 'Premium',
                        n: premiumOnly.length,
                        dot: 'bg-amber-400',
                        activeDot: isLight ? 'bg-amber-500' : 'bg-amber-400',
                      },
                      {
                        id: 'taken' as const,
                        label: 'Taken',
                        n: taken.length,
                        dot: isLight ? 'bg-rose-500' : 'bg-rose-400',
                        activeDot: isLight ? 'bg-rose-600' : 'bg-rose-400',
                      },
                      {
                        id: 'all' as const,
                        label: 'All',
                        n: checkedCount,
                        dot: isLight ? 'bg-slate-400' : 'bg-white/45',
                        activeDot: isLight ? 'bg-slate-700' : 'bg-black/50',
                      },
                    ] as const
                  ).map((f) => {
                    const active = extFilter === f.id;
                    const empty = f.n === 0;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setExtFilter(f.id)}
                        className={`group/seg relative flex flex-col items-center justify-center gap-0.5 min-h-[2.75rem] sm:min-h-[3rem] w-full min-w-0 rounded-[0.85rem] px-1 py-1.5 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                          active
                            ? isLight
                              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/[0.05]'
                              : 'bg-white text-black shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]'
                            : isLight
                              ? 'bg-transparent text-slate-600 hover:text-slate-900'
                              : 'bg-transparent text-white/55 hover:text-white/90'
                        } ${empty && !active ? 'opacity-55' : ''}`}
                      >
                        <span className="flex items-center justify-center gap-1.5 max-w-full">
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              active ? f.activeDot : f.dot
                            } ${
                              active && f.id === 'available'
                                ? 'shadow-[0_0_6px_rgba(16,185,129,0.45)]'
                                : ''
                            }`}
                          />
                          <span
                            className={`text-[10px] sm:text-[11px] font-semibold leading-none tracking-tight truncate ${
                              active
                                ? isLight
                                  ? 'text-slate-800'
                                  : 'text-black/80'
                                : ''
                            }`}
                          >
                            {f.label}
                          </span>
                        </span>
                        <span
                          className={`text-[15px] sm:text-[16px] font-black tabular-nums leading-none tracking-tight ${
                            active
                              ? isLight
                                ? 'text-slate-950'
                                : 'text-black'
                              : isLight
                                ? 'text-slate-800'
                                : 'text-white/90'
                          }`}
                        >
                          {f.n.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results pane — only this region scrolls; chrome stays clear above */}
        <div
          className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
          style={{ backgroundColor: isLight ? '#ffffff' : '#050505' }}
        >
        <div className="mx-auto w-full max-w-full min-w-0 sm:max-w-[100rem] box-border px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3">
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

          {!isLoading && results.length === 0 && !!query && (
            <div className="text-center py-16 px-4 max-w-md mx-auto space-y-3">
              <p className="text-[15px] font-bold">No results for “{query}”</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Try another spelling, fewer special characters, or explore ideas in Generator or
                Keyword tools.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <Link
                  href="/generator"
                  className={`rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  Domain generator
                </Link>
                <Link
                  href="/tools/keyword"
                  className={`rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  Keyword finder
                </Link>
              </div>
            </div>
          )}

          {/* Domain grid — full list (no separate primary strip that clipped under sticky chrome) */}
          {checkedCount > 0 && (
            <div
              className={`rounded-2xl border p-1.5 sm:p-2 w-full max-w-full min-w-0 overflow-x-clip box-border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0c] border-white/[0.08]'
              }`}
            >
              {visibleExtensions.length === 0 ? (
                <p className="text-center text-[12px] py-12" style={{ color: 'var(--text-muted)' }}>
                  Nothing in this filter
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 w-full max-w-full min-w-0">
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
                      href={extensionsCatalogHref}
                      onClick={handleCatalogHandoff}
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

        <div className="hidden sm:block">
          <CiteableDefinition definition={SITE_PAGE_DEFINITIONS.search} compact />
          <SeoGuidePack {...TOOL_GUIDE_PACKS.search} />
        </div>
        <div className="px-0 sm:px-0 pt-3 pb-2">
          <AffiliateAdRail placement="search" variant="auto" />
        </div>
        <div className="pb-6 sm:pb-8">
          <Footer />
        </div>
        </div>
        </SectionAmbient>
      </main>
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

  // Available + premium: affiliate-safe registrar URL (Spaceship → Impact sjv.io)
  const domainHref =
    isAvailable || isPremium
      ? resolveRegisterUrl(result.domain, selectedRegistrar, result.buyUrl)
      : result.buyUrl
        ? result.buyUrl
        : `https://who.is/whois/${encodeURIComponent(result.domain)}`;
  const domainTitle =
    isAvailable || isPremium
      ? `Search ${result.domain} on ${selectedRegistrar}`
      : result.buyUrl
        ? result.purchaseInfo || 'View listing'
        : 'View WHOIS';

  // Status: soft color on dot + label only (not on the CTA)
  const statusDot = isAvailable
    ? isLight
      ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
      : 'bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.45)]'
    : isPremium
      ? isLight
        ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.35)]'
        : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]'
      : isLight
        ? 'bg-rose-500'
        : 'bg-rose-400';

  // Quiet ghost CTAs — domain name + status stay primary (no solid white pills)
  const ctaFill = isLight
    ? 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium'
    : 'bg-transparent text-white/45 hover:bg-white/[0.06] hover:text-white/85 font-medium';

  const ctaSize =
    'pl-2 pr-1.5 py-0.5 text-[10px] sm:text-[11px] !font-medium !shadow-none';

  const desktopCta = isAvailable
    ? ctaText
    : isPremium
      ? showPremiumPrice
        ? ctaText
        : 'Search'
      : ctaText;
  const ctaLabel = isAvailable ? 'Go' : showPremiumPrice ? ctaText : isPremium ? 'Buy' : 'WHOIS';

  return (
    <div
      className={`shine-border no-lift group flex items-center gap-2.5 w-full max-w-full min-w-0 rounded-xl py-2.5 px-3 sm:py-3 sm:px-3.5 transition-colors box-border overflow-hidden ${
        isLight
          ? 'bg-white hover:bg-slate-50 border border-slate-100'
          : 'bg-[#0c0c0e] hover:bg-[#121214] border border-white/[0.06]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} aria-hidden />
        <div className="min-w-0 flex-1 overflow-hidden">
          <a
            href={domainHref}
            target="_blank"
            rel={
              isAvailable || isPremium
                ? selectedRegistrar === 'Spaceship'
                  ? 'sponsored noopener noreferrer'
                  : 'noopener noreferrer'
                : 'noopener noreferrer'
            }
            data-affiliate={
              (isAvailable || isPremium) && selectedRegistrar === 'Spaceship'
                ? 'spaceship'
                : undefined
            }
            data-placement="search-domain-link"
            title={domainTitle}
            onCopy={onBlockCopy}
            className={`block font-mono text-[13px] sm:text-[14px] font-medium leading-snug select-none transition-colors truncate ${
              isAvailable
                ? isLight
                  ? 'text-slate-900 hover:text-slate-950'
                  : 'text-white hover:text-white'
                : isLight
                  ? 'text-slate-600 hover:text-slate-800'
                  : 'text-white/75 hover:text-white/90'
            }`}
          >
            {result.domain}
          </a>
          <span
            className={`mt-0.5 inline-flex text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] ${
              isAvailable
                ? isLight
                  ? 'text-emerald-600'
                  : 'text-emerald-400'
                : isPremium
                  ? isLight
                    ? 'text-amber-600'
                    : 'text-amber-400'
                  : isLight
                    ? 'text-rose-600'
                    : 'text-rose-400'
            }`}
          >
            {isAvailable ? 'Available' : isPremium ? 'Premium · GoDaddy' : 'Taken'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onSave(result.domain)}
          className={`h-7 w-7 inline-flex items-center justify-center rounded-full border transition-colors ${
            isSaved
              ? isLight
                ? 'text-slate-900 border-slate-900 bg-slate-100'
                : 'text-white border-white/30 bg-white/10'
              : isLight
                ? 'text-slate-400 border-slate-200 hover:text-slate-700'
                : 'text-white/40 border-white/10 hover:text-white/75'
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
          isPremium={isPremium}
          primaryLabel={
            <>
              <span className="sm:hidden">{isPremium ? 'GoDaddy' : ctaLabel}</span>
              <span className="hidden sm:inline">
                {isPremium ? 'Go · GoDaddy' : desktopCta}
              </span>
            </>
          }
          premiumUrl={isPremium ? result.buyUrl : undefined}
          premiumLabel={
            result.purchaseInfo ||
            (isPremium ? 'Premium pricing from GoDaddy' : undefined)
          }
          shellClassName={
            isLight
              ? 'shadow-none ring-slate-200/80'
              : 'shadow-none ring-white/[0.08]'
          }
          primaryButtonClassName={`${ctaFill} ${ctaSize}`}
          chevronButtonClassName={`${ctaFill} px-1.5 py-0.5 ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
          fallbackButtonClassName={`${ctaFill} ${ctaSize} rounded-full ring-1 ${
            isLight ? 'ring-slate-200' : 'ring-white/10'
          }`}
        />
      </div>
    </div>
  );
}
