'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { PageBackground } from '@/components/ui/PageBackground';
import { Icons } from '@/components/ui/Icons';
import { PreferredRegistrarSelect, RegistrarActionMenu } from '@/components/domain/RegistrarControls';
import { SearchInterface } from '@/components/domain/SearchInterface';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { getRegistrarUrl, type RegistrarName } from '@/lib/registrars';
import { searchDomains, checkDomainAvailability } from '@/services/instantDomainService';
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
  const [premiumEnrichmentMap, setPremiumEnrichmentMap] = useState<Record<string, PremiumEnrichment>>({});
  const searchRequestIdRef = useRef(0);
  const premiumFetchKeyRef = useRef('');
  const premiumFetchInFlightRef = useRef(false);
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { selectedRegistrar, setSelectedRegistrar } = usePreferredRegistrar();
  const isLight = theme === 'light';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved_domains');
      if (saved) setSavedDomains(JSON.parse(saved));
    } catch {}
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
    const isSaved = savedDomains.includes(domain);
    const newSaved = isSaved ? savedDomains.filter(d => d !== domain) : [...savedDomains, domain];
    setSavedDomains(newSaved);
    try {
      localStorage.setItem('saved_domains', JSON.stringify(newSaved));
      window.dispatchEvent(new Event('savedDomainsUpdated'));
      showToast(isSaved ? `Removed ${domain}` : `Saved ${domain}`, 'success', 1500);
    } catch {}
  };

  const handleCopyURL = (domain: string) => {
    navigator.clipboard.writeText(domain);
    showToast('Copied to clipboard!', 'success', 1500);
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
  const extensions = useMemo(
    () => results.filter((result) => result !== primary && !premiumDomainSet.has(result.domain.toLowerCase())),
    [results, primary, premiumDomainSet]
  );
  const taken = useMemo(
    () => extensions.filter((result) => !result.available),
    [extensions]
  );

  const midpoint = Math.ceil(extensions.length / 2);
  const col1 = extensions.slice(0, midpoint);
  const col2 = extensions.slice(midpoint);

  const btnClass = `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isLight ? 'border-slate-200 hover:bg-slate-50 text-slate-600' : 'border-white/10 hover:bg-white/5 text-white/60'}`;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <PageBackground variant="hero" />
      <Navigation activeTool="search" onToolSelect={() => {}} />

      <main className="relative pt-14 sm:pt-20">
        <div className={`px-3 sm:px-6 py-3 sm:py-4 ${isLight ? 'bg-white/80' : 'bg-black/40'} backdrop-blur-sm border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <div className="max-w-5xl mx-auto space-y-3">
            <SearchInterface
              initialQuery={query}
              placeholder="Search domains instantly"
              onSearch={handleLiveSearch}
              onClear={handleResetSearch}
              autoFocus={true}
              showRecentSearches={false}
              debounceMs={120}
              isLoading={isLoading}
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Icons.Search />
                <span className={`text-xs sm:text-sm font-mono truncate ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                  {query ? query : 'Enter a domain query to begin'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PreferredRegistrarSelect
                  selectedRegistrar={selectedRegistrar}
                  onSelectRegistrar={setSelectedRegistrar}
                  label="Registrar"
                />
                <button
                  onClick={handleResetSearch}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/15 text-white/70 hover:bg-white/10'
                  }`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`px-3 sm:px-6 border-b ${isLight ? 'border-slate-200 bg-white/60' : 'border-white/5 bg-black/20'} backdrop-blur-sm`}>
          <div className="max-w-5xl mx-auto flex items-center gap-5 text-sm">
            <button className={`py-2.5 border-b-2 font-medium ${isLight ? 'border-slate-900 text-slate-900' : 'border-white text-white'}`}>
              <span className="flex items-center gap-1.5"><Icons.Search /> Search</span>
            </button>
            <Link href="/domain-extensions" className={`py-2.5 border-b-2 border-transparent font-medium ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/40 hover:text-white/70'}`}>
              <span className="flex items-center gap-1.5"><Icons.Layers /> Extensions</span>
            </Link>
            <Link href="/generator" className={`py-2.5 border-b-2 border-transparent font-medium ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/40 hover:text-white/70'}`}>
              <span className="flex items-center gap-1.5"><Icons.Magic /> Generator</span>
            </Link>
          </div>
        </div>

        {/* Results */}
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">

            {/* Loading */}
            {isLoading && results.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)', borderTopColor: isLight ? '#334155' : '#fff' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Searching domains...</span>
                </div>
              </div>
            )}

            {/* Empty */}
            {!isLoading && results.length === 0 && !query && (
              <div className="text-center py-20">
                <div className={`inline-flex p-5 rounded-full mb-4 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}><Icons.Search /></div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Search for a domain</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Type a name above to check availability across {ALL_TLDS.length}+ extensions
                </p>
              </div>
            )}

            {/* Primary domain highlight */}
            {primary && (
              <div className="mb-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (primary.available) {
                        handleBuy(primary.domain);
                        return;
                      }
                      window.open(`https://who.is/whois/${encodeURIComponent(primary.domain)}`, '_blank', 'noopener,noreferrer');
                    }}
                    className={`text-left text-xl sm:text-4xl font-black font-mono transition-opacity hover:opacity-90 truncate min-w-0 ${primary.available ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-red-600' : 'text-red-400')}`}
                  >
                    {primary.domain}
                  </button>
                  <button onClick={() => primary.available ? handleBuy(primary.domain) : window.open(`https://who.is/whois/${encodeURIComponent(primary.domain)}`, '_blank', 'noopener,noreferrer')} className={`shrink-0 px-3 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
                    primary.available
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}>
                    {primary.available ? `Buy` : 'Lookup'} &rarr;
                  </button>
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap relative">
                  <button onClick={() => handleSave(primary.domain)} className={btnClass}>
                    <svg className="w-3.5 h-3.5" fill={savedDomains.includes(primary.domain) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    <span className="hidden sm:inline">Bookmark</span>
                  </button>
                  <button onClick={() => handleCopyURL(primary.domain)} className={btnClass}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="hidden sm:inline">Copy URL</span>
                  </button>
                  <button onClick={() => handlePronounce(primary.domain)} className={btnClass}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5.586v12.828a1 1 0 01-1.707.707L5.586 15z" /></svg>
                    <span className="hidden sm:inline">Pronounce</span>
                  </button>
                  <button onClick={() => window.open(`https://www.godaddy.com/domain-value-appraisal/appraisal/?domain=${primary.domain}`, '_blank')} className={btnClass}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="hidden sm:inline">Appraise</span>
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowMoreActions(!showMoreActions)} className={btnClass}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                    </button>
                    {showMoreActions && (
                      <div className={`absolute top-full left-0 mt-1 rounded-lg z-50 py-1 min-w-[160px] ${isLight ? 'bg-white border border-slate-200 shadow-lg' : 'bg-neutral-900 border border-white/10 shadow-xl'}`}>
                        <button onClick={() => { window.open(`https://web.archive.org/web/*/${primary.domain}`, '_blank'); setShowMoreActions(false); }} className={`w-full text-left px-3 py-2 text-xs transition-colors ${isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-white/5 text-white/60'}`}>Wayback Machine</button>
                        <button onClick={() => { window.open(`https://www.google.com/search?q=site:${primary.domain}`, '_blank'); setShowMoreActions(false); }} className={`w-full text-left px-3 py-2 text-xs transition-colors ${isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-white/5 text-white/60'}`}>Google Index Check</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Legend + Grid */}
            {extensions.length > 0 && (
              <>
                {/* Legend */}
                <div className="flex items-center justify-end gap-4 mb-2">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Available</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Premium</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Taken</span></div>
                </div>

                {/* 3-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6">
                  {/* Domain extensions - 2 cols */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                        Domain extensions <span className="font-normal ml-1" style={{ color: 'var(--text-muted)' }}>({taken.length} taken)</span>
                      </h3>
                      <Link href="/domain-extensions" className="text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--text-muted)' }}>See all</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <div>{col1.map(r => <DomainRow key={r.domain} result={r} isLight={isLight} onSave={handleSave} isSaved={savedDomains.includes(r.domain)} selectedRegistrar={selectedRegistrar} onSelectRegistrar={setSelectedRegistrar} />)}</div>
                      <div>{col2.map(r => <DomainRow key={r.domain} result={r} isLight={isLight} onSave={handleSave} isSaved={savedDomains.includes(r.domain)} selectedRegistrar={selectedRegistrar} onSelectRegistrar={setSelectedRegistrar} />)}</div>
                    </div>
                  </div>

                  {/* Premium domains sidebar */}
                  <div>
                    <div className="flex items-center justify-between mb-2 mt-4 lg:mt-0">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                        Premium domains
                        {premiumResults.length > 0 && (
                          <span className="font-normal ml-1 text-amber-500">({premiumResults.length})</span>
                        )}
                      </h3>
                      <Link href="/premium" className="text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--text-muted)' }}>See all</Link>
                    </div>
                    {isBrandableLoading ? (
                      <div className="flex items-center gap-2 py-6 justify-center">
                        <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)', borderTopColor: isLight ? '#334155' : '#fff' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Building premium suggestions...</span>
                      </div>
                    ) : premiumResults.length > 0 ? (
                      <>
                        {premiumResults.map(r => (
                          <DomainRow key={r.domain} result={r} isLight={isLight} onSave={handleSave} isSaved={savedDomains.includes(r.domain)} selectedRegistrar={selectedRegistrar} onSelectRegistrar={setSelectedRegistrar} />
                        ))}
                      </>
                    ) : (
                      <p className="text-xs py-4" style={{ color: 'var(--text-muted)' }}>No premium suggestions yet. Try a new keyword.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Loading more */}
            {isLoading && results.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)', borderTopColor: isLight ? '#334155' : '#fff' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Checking more extensions...</span>
              </div>
            )}
          </div>
        </div>
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

/* ── Domain Extension Row ── */
function DomainRow({ result, isLight, onSave, isSaved, selectedRegistrar, onSelectRegistrar }: {
  result: DomainResult;
  isLight: boolean;
  onSave: (d: string) => void;
  isSaved: boolean;
  selectedRegistrar: RegistrarName;
  onSelectRegistrar: (registrar: RegistrarName) => void;
}) {
  const isAvailable = result.available;
  const price = result.price ? parseFloat(result.price.replace(/[^0-9.]/g, '')) : null;
  const showPremiumPrice = !!result.premium && !isAvailable && !!price;
  const ctaText = isAvailable ? 'Go' : (showPremiumPrice ? `$${price!.toFixed(0)}` : 'WHOIS');
  const domainHref = isAvailable
    ? getRegistrarUrl(result.domain, selectedRegistrar)
    : result.premium && result.buyUrl
      ? result.buyUrl
      : `https://who.is/whois/${encodeURIComponent(result.domain)}`;
  const domainTitle = isAvailable
    ? `Register on ${selectedRegistrar}`
    : result.premium && result.buyUrl
      ? (result.purchaseInfo || 'View premium listing')
      : 'View WHOIS';

  return (
    <div className={`flex items-center justify-between gap-1.5 py-[5px] px-1 rounded transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.03]'}`}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${result.premium ? 'bg-amber-500' : isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <a
          href={domainHref}
          target="_blank"
          rel="noopener noreferrer"
          title={domainTitle}
          className={`text-[11px] sm:text-[13px] font-mono transition-colors break-all line-clamp-1 ${isAvailable ? (isLight ? 'text-slate-800 hover:text-slate-950' : 'text-white/90 hover:text-white') : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/35 hover:text-white/55')}`}
        >
          {result.domain}
        </a>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={() => onSave(result.domain)} className={`hidden sm:block p-0.5 sm:p-1 rounded transition-colors ${isSaved ? 'text-emerald-400' : isLight ? 'text-slate-200 hover:text-slate-400' : 'text-white/10 hover:text-white/40'}`} aria-label="Save">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        </button>
        <RegistrarActionMenu
          domain={result.domain}
          selectedRegistrar={selectedRegistrar}
          onSelectRegistrar={onSelectRegistrar}
          canRegister={isAvailable}
          primaryLabel={ctaText}
          premiumUrl={result.premium ? result.buyUrl : undefined}
          premiumLabel={result.purchaseInfo}
          primaryButtonClassName={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded transition-colors ${
            showPremiumPrice
              ? (isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')
              : isAvailable
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : isLight ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
          }`}
          chevronButtonClassName={`rounded p-1 sm:p-1.5 transition-colors ${
            showPremiumPrice
              ? (isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')
              : isAvailable
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : isLight ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
          }`}
          fallbackButtonClassName={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded transition-colors ${
            showPremiumPrice
              ? (isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')
              : isLight ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
          }`}
        />
      </div>
    </div>
  );
}
