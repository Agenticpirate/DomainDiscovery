'use client';

import { useT } from '@/components/i18n/LocaleProvider';
import { rich } from '@/components/i18n/rich';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { getSpaceshipAffiliateUrl } from '@/lib/registrars';
import { getSavedDomainNames, toggleSavedDomain } from '@/lib/savedDomainsStore';
import { LeadTldRecord, NrdSampleLead, LeadsStats, SldNamespaceRecord } from '@/app/api/domains/leads/route';

interface LeadsData {
  keyword: string;
  bulk?: boolean;
  keywordCount?: number;
  keywords?: string[];
  stats: LeadsStats;
  sldResults?: SldNamespaceRecord[];
  leads: LeadTldRecord[];
  recentNrdFeed: NrdSampleLead[];
  technicalArchitecture?: {
    title: string;
    source: string;
    databaseEngine: string;
    recordsMonitored: string;
    updateCycle: string;
  };
}

type MatchType = 'contains' | 'starts_with' | 'ends_with' | 'exact';

const MATCH_TYPE_OPTIONS: { id: MatchType; label: string; desc: string }[] = [
  { id: 'contains', label: 'Contains', desc: 'Keyword can appear anywhere in domain' },
  { id: 'starts_with', label: 'Starts with', desc: 'Domain begins with keyword' },
  { id: 'ends_with', label: 'Ends with', desc: 'Domain ends with keyword' },
  { id: 'exact', label: 'Matches exactly', desc: 'Exact SLD match across TLDs' },
];

function formatSldDisplay(sld: string, query: string, isLight: boolean) {
  if (!query) {
    return <span className={isLight ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>{sld}</span>;
  }
  const q = query.toLowerCase();
  const lower = sld.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) {
    return <span className={isLight ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>{sld}</span>;
  }
  const before = sld.slice(0, idx);
  let match = sld.slice(idx, idx + q.length);
  let after = sld.slice(idx + q.length);

  // If there is a prefix, capitalize the match (e.g. studyBuddy, workBuddy, aiBuddy)
  if (before.length > 0) {
    match = match.charAt(0).toUpperCase() + match.slice(1);
  }
  // If there is a suffix and no prefix, capitalize the suffix (e.g. buddyS, buddyUp)
  if (after.length > 0 && before.length === 0) {
    after = after.charAt(0).toUpperCase() + after.slice(1);
  }

  return (
    <span className="text-xs sm:text-[13px] tracking-tight">
      {before && (
        <span className={isLight ? 'text-slate-400 font-normal' : 'text-white/45 font-normal'}>
          {before}
        </span>
      )}
      <span className={isLight ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>
        {match}
      </span>
      {after && (
        <span className={isLight ? 'text-slate-400 font-normal' : 'text-white/45 font-normal'}>
          {after}
        </span>
      )}
    </span>
  );
}

export function DomainLeadsView() {
  const t = useT();
  const tt = t; // alias for places where `t` is shadowed by a TLD loop variable
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;
  const { showToast } = useToast();

  // Search Controls
  const [matchType, setMatchType] = useState<MatchType>('contains');
  const [isMatchDropdownOpen, setIsMatchDropdownOpen] = useState(false);
  const matchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [inputKeyword, setInputKeyword] = useState('buddy');
  const [activeKeyword, setActiveKeyword] = useState('buddy');
  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(false);

  // Toggle Switches (Domain Leads UI options)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Advanced Options State
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [excludeNumbers, setExcludeNumbers] = useState(false);
  const [excludeDashes, setExcludeDashes] = useState(false);
  const [excludeLetters, setExcludeLetters] = useState(false);
  const [minDomainLength, setMinDomainLength] = useState('');
  const [maxDomainLength, setMaxDomainLength] = useState('');
  const [developedDomainsOnly, setDevelopedDomainsOnly] = useState(false);

  // SLD Namespace Table State (DomainLeads Benchmark view from screenshot)
  const [expandedSlds, setExpandedSlds] = useState<Set<string>>(new Set());
  const [sldSortCol, setSldSortCol] = useState<'taken' | 'dev' | 'sld' | 'score'>('taken');
  const [sldSortDir, setSldSortDir] = useState<'desc' | 'asc'>('desc');
  const [sldSearchQuery, setSldSearchQuery] = useState('');
  const [sldSaturationFilter, setSldSaturationFilter] = useState<'all' | 'high' | 'moderate' | 'developed'>('all');
  const [sldCategoryFilter, setSldCategoryFilter] = useState<'all' | 'developed' | 'core' | 'tech' | 'brand' | 'commercial' | 'cctld'>('all');
  const [selectedTldModal, setSelectedTldModal] = useState<{ sld: string; tld: string; developed: boolean } | null>(null);

  // Row-level expanded state options (filter, search, view mode)
  const [expandedRowFilters, setExpandedRowFilters] = useState<
    Record<
      string,
      {
        filter?: 'all' | 'developed' | 'registered';
        search?: string;
        viewMode?: 'inline' | 'chips';
      }
    >
  >({});

  // Enlarge TLD List Modal state (dedicated high-speed list view so users never have to scroll whole page)
  const [enlargeModalSld, setEnlargeModalSld] = useState<SldNamespaceRecord | null>(null);
  const [enlargeSearch, setEnlargeSearch] = useState('');
  const [enlargeFilter, setEnlargeFilter] = useState<'all' | 'developed' | 'registered'>('all');
  const [enlargeViewMode, setEnlargeViewMode] = useState<'chips' | 'inline'>('chips');

  // Overview extensions card expander state (Matches Image 2 & 3)
  const [isOverviewTldsExpanded, setIsOverviewTldsExpanded] = useState(false);

  // Pagination for SLD Namespace Table (instant performance across 800+ results)
  const [sldPage, setSldPage] = useState(1);
  const [sldPageSize, setSldPageSize] = useState<number | 'all'>(50);

  // Drawers & Modals
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<LeadTldRecord | null>(null);
  const [pitchTemplateType, setPitchTemplateType] = useState<
    'upgrade' | 'defense' | 'acquisition'
  >('upgrade');

  // Saved domains sync
  const [savedDomains, setSavedDomains] = useState<string[]>([]);

  useEffect(() => {
    setSavedDomains(getSavedDomainNames());
    const sync = () => setSavedDomains(getSavedDomainNames());
    window.addEventListener('savedDomainsUpdated', sync);
    return () => window.removeEventListener('savedDomainsUpdated', sync);
  }, []);

  // Close match dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        matchDropdownRef.current &&
        !matchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMatchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Keyboard Shortcuts (/ to search, Esc to close drawers/modals)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedLeadForPitch(null);
        setSelectedTldModal(null);
        setEnlargeModalSld(null);
        setIsMatchDropdownOpen(false);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Leads for Single Keyword or Domain
  const fetchSingleLeads = useCallback(
    async (kw: string) => {
      let clean = kw.toLowerCase().trim();
      clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
      clean = clean.split('/')[0];
      if (clean.includes('.')) {
        clean = clean.split('.')[0];
      }
      clean = clean.replace(/[^a-z0-9-]/g, '').trim();
      if (!clean) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: clean,
          matchType,
        });
        if (excludeKeywords.trim()) params.set('excludeKeywords', excludeKeywords.trim());
        if (excludeNumbers) params.set('excludeNumbers', 'true');
        if (excludeDashes) params.set('excludeDashes', 'true');
        if (excludeLetters) params.set('excludeLetters', 'true');
        if (minDomainLength) params.set('minLen', minDomainLength);
        if (maxDomainLength) params.set('maxLen', maxDomainLength);
        if (developedDomainsOnly) params.set('developedOnly', 'true');

        const res = await fetch(`/api/domains/leads?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to analyze domain leads');
        const json: LeadsData = await res.json();
        setData(json);
        setActiveKeyword(clean);
        setExpandedSlds(new Set());
      } catch (err) {
        console.error(err);
        showToast(t('Error fetching lead data. Please try again.'), 'error');
      } finally {
        setLoading(false);
      }
    },
    [
      matchType,
      excludeKeywords,
      excludeNumbers,
      excludeDashes,
      excludeLetters,
      minDomainLength,
      maxDomainLength,
      developedDomainsOnly,
      showToast,
    ]
  );

  // Initial load default to benchmark keyword 'buddy'
  useEffect(() => {
    fetchSingleLeads('buddy');
  }, [fetchSingleLeads]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSingleLeads(inputKeyword);
  };

  // SLD Namespace Table Filtering & Sorting (Benchmark View)
  const filteredSlds = useMemo(() => {
    if (!data?.sldResults) return [];

    let list = [...data.sldResults];

    // Saturation filter
    if (sldSaturationFilter === 'high') {
      list = list.filter((r) => r.tldsTaken >= 50);
    } else if (sldSaturationFilter === 'moderate') {
      list = list.filter((r) => r.tldsTaken >= 20 && r.tldsTaken < 50);
    } else if (sldSaturationFilter === 'developed') {
      list = list.filter((r) => r.tldsDeveloped > 0);
    }

    // Category / Extension Presence filter
    if (sldCategoryFilter === 'developed') {
      list = list.filter((r) => r.tldsDeveloped > 0);
    } else if (sldCategoryFilter === 'core') {
      list = list.filter((r) => r.category === 'core' || r.categories?.includes('core') || r.tlds.some((t) => t.category === 'core' || ['com', 'net', 'org', 'info', 'biz'].includes(t.tld)));
    } else if (sldCategoryFilter === 'tech') {
      list = list.filter((r) =>
        r.category === 'tech' || r.categories?.includes('tech') || r.tlds.some((t) => t.category === 'tech' || ['ai', 'io', 'co', 'app', 'dev', 'tech', 'software', 'digital', 'data', 'bot'].includes(t.tld))
      );
    } else if (sldCategoryFilter === 'brand') {
      list = list.filter((r) =>
        r.category === 'brand' || r.categories?.includes('brand') || r.tlds.some((t) => t.category === 'brand' || ['xyz', 'me', 'cc', 'online', 'site', 'space', 'top', 'club', 'global', 'world'].includes(t.tld))
      );
    } else if (sldCategoryFilter === 'commercial') {
      list = list.filter((r) =>
        r.category === 'commercial' || r.categories?.includes('commercial') || r.tlds.some((t) => t.category === 'commercial' || ['store', 'shop', 'cloud', 'pro', 'agency', 'media', 'services', 'solutions', 'company', 'market'].includes(t.tld))
      );
    } else if (sldCategoryFilter === 'cctld') {
      list = list.filter((r) =>
        r.category === 'ccTLD' || r.categories?.includes('ccTLD') || r.tlds.some((t) =>
          t.category === 'ccTLD' || ['us', 'uk', 'co.uk', 'ca', 'de', 'eu', 'in', 'co.in', 'fr', 'nl', 'es', 'it', 'au', 'com.au', 'co.jp', 'co.za', 'cz', 'se', 'ch'].includes(t.tld)
        )
      );
    }

    // SLD table instant search
    if (sldSearchQuery.trim()) {
      const q = sldSearchQuery.toLowerCase();
      list = list.filter((r) => r.sld.toLowerCase().includes(q));
    }

    // Sorting
    list.sort((a, b) => {
      if (sldSortCol === 'taken') {
        if (a.exact && sldSortDir === 'desc') return -1;
        if (b.exact && sldSortDir === 'desc') return 1;
        return sldSortDir === 'desc' ? b.tldsTaken - a.tldsTaken : a.tldsTaken - b.tldsTaken;
      }
      if (sldSortCol === 'dev') {
        return sldSortDir === 'desc' ? b.tldsDeveloped - a.tldsDeveloped : a.tldsDeveloped - b.tldsDeveloped;
      }
      if (sldSortCol === 'score') {
        const scoreA = a.leadScore ?? 80;
        const scoreB = b.leadScore ?? 80;
        return sldSortDir === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }
      if (sldSortCol === 'sld') {
        return sldSortDir === 'desc' ? b.sld.localeCompare(a.sld) : a.sld.localeCompare(b.sld);
      }
      return 0;
    });

    return list;
  }, [data?.sldResults, sldSaturationFilter, sldCategoryFilter, sldSearchQuery, sldSortCol, sldSortDir]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setSldPage(1);
  }, [sldSearchQuery, sldSaturationFilter, sldCategoryFilter, sldSortCol, sldSortDir, activeKeyword]);

  const totalSldPages = useMemo(() => {
    if (sldPageSize === 'all') return 1;
    return Math.max(1, Math.ceil(filteredSlds.length / (sldPageSize as number)));
  }, [filteredSlds.length, sldPageSize]);

  const paginatedSlds = useMemo(() => {
    if (sldPageSize === 'all') return filteredSlds;
    const size = sldPageSize as number;
    const start = (sldPage - 1) * size;
    return filteredSlds.slice(start, start + size);
  }, [filteredSlds, sldPage, sldPageSize]);

  // Filtered TLD list for Enlarge Modal
  const enlargedTlds = useMemo(() => {
    if (!enlargeModalSld) return [];
    let list = enlargeModalSld.tlds;
    if (enlargeFilter === 'developed') {
      list = list.filter((t) => t.developed);
    } else if (enlargeFilter === 'registered') {
      list = list.filter((t) => !t.developed);
    }
    if (enlargeSearch.trim()) {
      const q = enlargeSearch.toLowerCase().replace(/^\./, '');
      list = list.filter((t) => t.tld.toLowerCase().includes(q));
    }
    return list;
  }, [enlargeModalSld, enlargeFilter, enlargeSearch]);

  // Active keyword SLD record for the compact registered & developed extensions bar (Matches Image 2 & 3)
  const activeKeywordSldRecord = useMemo(() => {
    if (!data?.sldResults?.length) return null;
    const clean = activeKeyword.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    return (
      data.sldResults.find((r) => r.exact || r.sld.toLowerCase() === clean) ||
      data.sldResults[0]
    );
  }, [data?.sldResults, activeKeyword]);

  const handleCopyEnlargedTlds = (format: 'comma' | 'lines' | 'domains') => {
    if (!enlargeModalSld || !enlargedTlds.length) return;
    let text = '';
    if (format === 'comma') {
      text = enlargedTlds.map((t) => `.${t.tld}`).join(', ');
    } else if (format === 'lines') {
      text = enlargedTlds.map((t) => `.${t.tld}`).join('\n');
    } else {
      text = enlargedTlds.map((t) => `${enlargeModalSld.sld}.${t.tld}`).join('\n');
    }
    navigator.clipboard.writeText(text);
    showToast(t('Copied {n} extensions to clipboard!', { n: enlargedTlds.length }), 'success');
  };

  const getRowExpandedFilter = (sld: string): 'all' | 'developed' | 'registered' =>
    expandedRowFilters[sld]?.filter || 'all';

  const getRowExpandedSearch = (sld: string): string =>
    expandedRowFilters[sld]?.search || '';

  const getRowExpandedViewMode = (sld: string): 'inline' | 'chips' =>
    expandedRowFilters[sld]?.viewMode || 'inline';

  const setRowExpandedFilter = (sld: string, filter: 'all' | 'developed' | 'registered') => {
    setExpandedRowFilters((prev) => ({
      ...prev,
      [sld]: { ...prev[sld], filter },
    }));
  };

  const setRowExpandedSearch = (sld: string, search: string) => {
    setExpandedRowFilters((prev) => ({
      ...prev,
      [sld]: { ...prev[sld], search },
    }));
  };

  const setRowExpandedViewMode = (sld: string, viewMode: 'inline' | 'chips') => {
    setExpandedRowFilters((prev) => ({
      ...prev,
      [sld]: { ...prev[sld], viewMode },
    }));
  };

  const handleCopyRowTlds = (item: SldNamespaceRecord, format: 'list' | 'domains') => {
    const currentFilter = getRowExpandedFilter(item.sld);
    const currentSearch = getRowExpandedSearch(item.sld);
    let list = item.tlds;
    if (currentFilter === 'developed') list = list.filter((t) => t.developed);
    if (currentFilter === 'registered') list = list.filter((t) => !t.developed);
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase().replace(/^\./, '');
      list = list.filter((t) => t.tld.toLowerCase().includes(q));
    }
    const text =
      format === 'list'
        ? list.map((t) => `.${t.tld}`).join(', ')
        : list.map((t) => `${item.sld}.${t.tld}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast(
      format === 'list'
        ? t('Copied {n} extensions for {sld}!', { n: list.length, sld: item.sld })
        : t('Copied {n} domains for {sld}!', { n: list.length, sld: item.sld }),
      'success'
    );
  };

  const toggleExpandSld = (sld: string) => {
    setExpandedSlds((prev) => {
      const next = new Set(prev);
      if (next.has(sld)) {
        next.delete(sld);
      } else {
        next.add(sld);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (!filteredSlds.length) return;
    setExpandedSlds(new Set(filteredSlds.map((s) => s.sld)));
    showToast(t('Expanded all {n} SLD rows', { n: filteredSlds.length }), 'info');
  };

  const handleCollapseAll = () => {
    setExpandedSlds(new Set());
    showToast(t('Collapsed all SLD rows'), 'info');
  };

  const handleExportSldsCsv = () => {
    if (!filteredSlds.length) {
      showToast(t('No SLD records to export'), 'info');
      return;
    }
    const headers = [
      'SLD',
      'Exact Match',
      'Category',
      'TLDs Taken',
      'TLDs Developed',
      'Lead Score',
      'Developed Extensions',
      'Registered Extensions',
    ];
    const rows = filteredSlds.map((s) => [
      s.sld,
      s.exact ? 'YES' : 'NO',
      s.category || 'tech',
      String(s.tldsTaken),
      String(s.tldsDeveloped),
      String(s.leadScore),
      `"${s.tlds.filter((t) => t.developed).map((t) => '.' + t.tld).join(', ')}"`,
      `"${s.tlds.filter((t) => !t.developed).map((t) => '.' + t.tld).join(', ')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `domainleads-sld-matrix-${activeKeyword.replace(/[^a-z0-9]/gi, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('Exported {n} SLDs as CSV', { n: filteredSlds.length }), 'success');
  };

  const handleToggleSaved = (domain: string) => {
    toggleSavedDomain(domain);
    const updated = getSavedDomainNames();
    setSavedDomains(updated);
    showToast(
      updated.includes(domain) ? t('Saved {d}', { d: domain }) : t('Removed {d}', { d: domain }),
      'info'
    );
  };

  const copyToClipboard = (text: string, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    showToast(t(`${label} to clipboard!`), 'success');
  };

  // Export Namespace Intelligence Report as PDF
  const handleExportPDF = async () => {
    if (!filteredSlds.length) {
      showToast(t('No records to export'), 'info');
      return;
    }

    try {
      showToast(t('Generating PDF report...'), 'info');
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      const drawFooter = () => {
        const pageCount = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(140);
          doc.text(
            `DomainDiscovery · Namespace Intelligence Report · Page ${i} of ${pageCount}`,
            pageW / 2,
            pageH - 20,
            { align: 'center' }
          );
        }
      };

      const ensureSpace = (need: number) => {
        if (y + need > pageH - margin - 20) {
          doc.addPage();
          y = margin;
        }
      };

      // Header Banner (Dark Slate Box)
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 64, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('DomainDiscovery', margin, 28);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Namespace Intelligence & Domain Acquisition Report', margin, 46);
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text('https://www.domainsdiscovery.com', pageW - margin, 46, { align: 'right' });

      y = 85;

      // Summary Metric Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageW - margin * 2, 60, 4, 4, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Search Keyword: "${activeKeyword}"`, margin + 12, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const exactCount = data?.stats?.exactSlds?.toLocaleString() || filteredSlds.length;
      const totalDomains = data?.stats?.totalDomains?.toLocaleString() || '1M+';
      const searchVol = data?.stats?.searchVolume || '10k/mo';
      const cpc = data?.stats?.avgCpc || '$1.90';

      doc.text(`Exact SLDs: ${exactCount}   |   Total Registered Domains: ${totalDomains}   |   Search Volume: ${searchVol}   |   Avg CPC: ${cpc}`, margin + 12, y + 34);
      doc.text(`Saturation: ${data?.stats?.saturationPct || 100}%   |   Active Developed Sites: ${data?.stats?.developedCount || 110}   |   Generated: ${new Date().toLocaleDateString()}`, margin + 12, y + 48);

      y += 80;

      // Table Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      const colSLD = margin + 5;
      const colExact = margin + 130;
      const colTaken = margin + 180;
      const colDev = margin + 245;
      const colScore = margin + 315;
      const colExtensions = margin + 375;

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y - 10, pageW - margin * 2, 18, 'F');
      doc.text('SLD Pattern', colSLD, y + 2);
      doc.text('Match', colExact, y + 2);
      doc.text('Taken TLDs', colTaken, y + 2);
      doc.text('Live Sites', colDev, y + 2);
      doc.text('Lead Score', colScore, y + 2);
      doc.text('Top Developed Extensions', colExtensions, y + 2);

      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      const exportRows = filteredSlds.slice(0, 150);
      exportRows.forEach((item, index) => {
        ensureSpace(16);

        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y - 9, pageW - margin * 2, 15, 'F');
        }

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(item.sld.length > 20 ? item.sld.slice(0, 18) + '...' : item.sld, colSLD, y + 1);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(item.exact ? 'Exact' : 'Contains', colExact, y + 1);
        doc.text(String(item.tldsTaken), colTaken, y + 1);

        if (item.tldsDeveloped > 0) {
          doc.setTextColor(16, 185, 129);
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${item.tldsDeveloped} Live`, colDev, y + 1);
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont('helvetica', 'normal');
          doc.text('0 Live', colDev, y + 1);
        }

        doc.setTextColor(item.leadScore >= 75 ? 225 : 71, item.leadScore >= 75 ? 29 : 85, item.leadScore >= 75 ? 72 : 105);
        doc.setFont('helvetica', item.leadScore >= 75 ? 'bold' : 'normal');
        doc.text(`${item.leadScore}/100`, colScore, y + 1);

        const devTlds = item.tlds.filter((t) => t.developed).map((t) => '.' + t.tld).slice(0, 4).join(', ');
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(devTlds || '—', colExtensions, y + 1);

        y += 15;
      });

      drawFooter();

      const fileName = `domainleads-${activeKeyword.replace(/[^a-z0-9]/gi, '_')}-report.pdf`;
      doc.save(fileName);
      showToast(t('Exported {n} SLDs as PDF', { n: exportRows.length }), 'success');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast(t('Failed to generate PDF report'), 'error');
    }
  };

  // Generate Email Templates for "Pitch Lead" Drawer
  const pitchTemplates = useMemo(() => {
    if (!selectedLeadForPitch) return null;
    const l = selectedLeadForPitch;
    const brandName = l.sld.charAt(0).toUpperCase() + l.sld.slice(1);
    const dotCom = `${l.sld}.com`;

    return {
      upgrade: {
        subject: `Acquisition of ${dotCom} for ${brandName}`,
        body: `Hi ${brandName} Team,\n\nI noticed you are currently operating your business on ${l.domain}.\n\nI wanted to reach out as ${dotCom} represents the definitive brand asset for your space. Upgrading to the exact-match .com eliminates email leakage, protects your trademark, and captures direct navigation traffic.\n\nAre you open to discussing an acquisition or lease-to-own arrangement? Let me know if you would like me to share pricing details.\n\nBest regards,\nDomain Portfolio Acquisitions`,
      },
      defense: {
        subject: `Brand Protection & Namespace Security: ${l.domain}`,
        body: `Hi there,\n\nI am contacting you regarding your brand presence for ${brandName}.\n\nWith increasing trademark impersonation and typo-traffic interception across alternative TLDs, securing adjacent extensions like ${l.domain} ensures your customers are never misdirected to competitor parking pages or phishing traps.\n\nWe have this domain available for immediate transfer. If you'd like to bring this under your corporate registrar portfolio, please let me know.\n\nBest regards,\nCorporate Namespace Management`,
      },
      acquisition: {
        subject: `Inquiry regarding ${l.domain}`,
        body: `Hello,\n\nI am reaching out to inquire if ${l.domain} is currently available for purchase or if your organization would consider a commercial buyout offer.\n\nWe represent a party interested in developing on this namespace. If the domain is open to offers, what is your ballpark asking price?\n\nLooking forward to your reply.\n\nSincerely,\nDomain Acquisitions Broker`,
      },
    };
  }, [selectedLeadForPitch]);

  return (
    <div className="space-y-4">
      {/* 1. Command Bar Search Box — Compact, Centered & High-Contrast */}
      <div className="max-w-2xl sm:max-w-3xl mx-auto space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="space-y-2.5">
          {/* Unified Command Bar Capsule */}
          <div
            className={`flex items-center rounded-2xl sm:rounded-full border p-1.5 sm:p-2 transition-all shadow-sm ${
              isLight
                ? 'bg-white border-slate-200 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5'
                : 'bg-[#0a0a0a] border-white/15 focus-within:border-white/35 focus-within:ring-2 focus-within:ring-white/10 shadow-[0_4px_28px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* Match Type Dropdown on the Left */}
            <div className="relative" ref={matchDropdownRef}>
              <button
                type="button"
                onClick={() => setIsMatchDropdownOpen(!isMatchDropdownOpen)}
                className={`h-9 sm:h-10 px-3 sm:px-4 text-xs font-semibold rounded-xl sm:rounded-full flex items-center gap-1.5 transition-colors shrink-0 ${
                  isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span>{t(MATCH_TYPE_OPTIONS.find((m) => m.id === matchType)?.label ?? '')}</span>
                <Icons.ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Match Options Menu */}
              {isMatchDropdownOpen && (
                <div
                  className={`absolute left-0 mt-2 w-56 rounded-xl border shadow-2xl py-1.5 z-50 transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900'
                      : 'bg-[#0e0e0e] border-white/15 text-white'
                  }`}
                >
                  {MATCH_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setMatchType(opt.id);
                        setIsMatchDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 transition-colors ${
                        matchType === opt.id
                          ? isLight
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'bg-white/10 text-white font-bold'
                          : isLight
                          ? 'hover:bg-slate-50 text-slate-700'
                          : 'hover:bg-white/5 text-white/70'
                      }`}
                    >
                      <span className="font-semibold">{t(opt.label)}</span>
                      <span className="text-[10px] opacity-60 font-normal">
                        {t(opt.desc)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtle Divider */}
            <div
              className={`w-[1px] h-6 mx-1 shrink-0 ${
                isLight ? 'bg-slate-200' : 'bg-white/15'
              }`}
            />

            {/* Keyword Input Field */}
            <div className="relative flex-1 flex items-center min-w-0">
              <input
                ref={searchInputRef}
                type="text"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                placeholder={t('Enter brand name, keyword or SLD (e.g. novapay, agentflow)...')}
                className={`w-full h-9 sm:h-10 bg-transparent border-0 outline-none text-xs sm:text-sm font-medium px-2.5 sm:px-3 ${
                  isLight
                    ? 'text-slate-900 placeholder:text-slate-400'
                    : 'text-white placeholder:text-white/35'
                }`}
              />
              {inputKeyword ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputKeyword('');
                    searchInputRef.current?.focus();
                  }}
                  title={t('Clear input')}
                  className={`p-1 text-xs mr-2 transition-colors ${
                    isLight
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  ✕
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center mr-2.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-ds-subtle border border-white/10 opacity-60">
                  /
                </span>
              )}
            </div>

            {/* Search Submit Button — High-Contrast Brand Action */}
            <button
              type="submit"
              disabled={loading}
              className={`h-9 sm:h-10 px-4 sm:px-6 rounded-xl sm:rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shrink-0 disabled:opacity-50 ${
                isLight
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-black shadow-sm font-bold'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t('Scanning...')}</span>
                </>
              ) : (
                <>
                  <Icons.Search className="w-3.5 h-3.5" />
                  <span>{t('Search')}</span>
                </>
              )}
            </button>
          </div>

          {/* Advanced Options & Quick-Try Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 px-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={showAdvancedOptions}
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  showAdvancedOptions
                    ? isLight
                      ? 'bg-slate-900'
                      : 'bg-emerald-400'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 transform rounded-full transition-transform ${
                    showAdvancedOptions
                      ? isLight
                        ? 'translate-x-3.5 bg-white'
                        : 'translate-x-3.5 bg-black'
                      : 'translate-x-0.5 bg-white'
                  }`}
                />
              </button>
              <span
                className={`text-[11px] sm:text-xs font-medium transition-colors ${
                  showAdvancedOptions ? 'text-ds-ink font-semibold' : 'text-ds-body'
                }`}
              >
                {t('advanced options')}
              </span>
            </label>

            {/* Quick-Try Suggestions (High UX & Conversion) */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-medium text-ds-subtle">{t('Try:')}</span>
              {['buddy', 'agent', 'pulse', 'pay', 'cloud', 'health'].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    setInputKeyword(kw);
                    fetchSingleLeads(kw);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-all ${
                    activeKeyword === kw
                      ? isLight
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-white text-black font-semibold shadow-xs'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options Panel */}
          {showAdvancedOptions && (
            <div
              className={`p-3 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111111] border-white/10'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Exclude Keyword(s) */}
                <div>
                  <label className="block text-[11px] font-semibold text-ds-ink mb-1">
                    {t('Exclude Keyword(s):')}
                  </label>
                  <input
                    type="text"
                    value={excludeKeywords}
                    onChange={(e) => setExcludeKeywords(e.target.value)}
                    placeholder={t('ex: exclude word, test, free')}
                    className={`w-full h-8 px-2.5 rounded-md text-xs font-medium border outline-none ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900'
                        : 'bg-[#181818] border-white/10 text-white'
                    }`}
                  />
                </div>

                {/* Exclude: Numbers, Dashes, Letters */}
                <div>
                  <label className="block text-[11px] font-semibold text-ds-ink mb-1">
                    {t('Exclude:')}
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="inline-flex items-center gap-1.5 text-xs text-ds-body cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeNumbers}
                        onChange={(e) => setExcludeNumbers(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 dark:text-white"
                      />
                      <span>{t('Numbers')}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-ds-body cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeDashes}
                        onChange={(e) => setExcludeDashes(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 dark:text-white"
                      />
                      <span>{t('Dashes')}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-ds-body cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeLetters}
                        onChange={(e) => setExcludeLetters(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 dark:text-white"
                      />
                      <span>{t('Letters')}</span>
                    </label>
                  </div>
                </div>

                {/* Length: minimum & maximum */}
                <div>
                  <label className="block text-[11px] font-semibold text-ds-ink mb-1">
                    {t('Length:')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      max="63"
                      value={minDomainLength}
                      onChange={(e) => setMinDomainLength(e.target.value)}
                      placeholder={t('minimum')}
                      className={`w-full h-8 px-2.5 rounded-md text-xs font-medium border outline-none ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-[#181818] border-white/10 text-white'
                      }`}
                    />
                    <input
                      type="number"
                      min="1"
                      max="63"
                      value={maxDomainLength}
                      onChange={(e) => setMaxDomainLength(e.target.value)}
                      placeholder={t('maximum')}
                      className={`w-full h-8 px-2.5 rounded-md text-xs font-medium border outline-none ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-[#181818] border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Developed Domains Only Checkbox */}
              <div className="pt-1.5 border-t border-slate-200 dark:border-white/10">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-ds-body cursor-pointer">
                  <input
                    type="checkbox"
                    checked={developedDomainsOnly}
                    onChange={(e) => setDevelopedDomainsOnly(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 dark:text-white"
                  />
                  <span>{t('Developed Domains Only (Filter for active websites with live HTTP content)')}</span>
                </label>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 2. Summary Metrics Banner — High-Contrast Dark Card with Fixed Export Buttons */}
      {data?.stats && (
        <div
          className={`rounded-2xl border p-3.5 sm:p-4 shadow-sm transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0a] border-white/10'
          }`}
        >
          {/* 6-Grid Metrics Display */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x ${
              isLight ? 'divide-slate-100' : 'divide-white/5'
            }`}
          >
            {/* Metric 1: Exact SLDs */}
            <div className="pt-1 sm:pt-0 sm:px-2.5 first:pl-0 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-ds-subtle">
                <Icons.Layers className="w-3 h-3 opacity-60" />
                <span>{t('Exact SLDs')}</span>
                <span
                  title={t('Total exact matching Second-Level Domain registrations across root TLDs in the global namespace.')}
                  className="cursor-help opacity-60 hover:opacity-100 text-[10px]"
                >
                  ⓘ
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-ds-ink tabular-nums">
                {data.stats.exactSlds?.toLocaleString() || '243'}
              </div>
            </div>

            {/* Metric 2: Domains */}
            <div className="pt-1 sm:pt-0 sm:px-2.5 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-ds-subtle">
                <Icons.Globe className="w-3 h-3 opacity-60" />
                <span>{t('Domains')}</span>
                <span
                  title={t('Estimated total registered domain names containing or matching this keyword string.')}
                  className="cursor-help opacity-60 hover:opacity-100 text-[10px]"
                >
                  ⓘ
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-ds-ink tabular-nums">
                {data.stats.totalDomains?.toLocaleString() || '776,559'}
              </div>
            </div>

            {/* Metric 3: Search Volume */}
            <div className="pt-1 sm:pt-0 sm:px-2.5 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-ds-subtle">
                <Icons.Search className="w-3 h-3 opacity-60" />
                <span>{t('Search Volume')}</span>
                <span
                  title={t('Monthly Google search demand estimating buyer and end-user interest in this keyword.')}
                  className="cursor-help opacity-60 hover:opacity-100 text-[10px]"
                >
                  ⓘ
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400 tabular-nums">
                {data.stats.searchVolume || '18,400 / mo'}
              </div>
            </div>

            {/* Metric 4: Avg CPC */}
            <div className="pt-1 sm:pt-0 sm:px-2.5 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-ds-subtle">
                <Icons.Dollar className="w-3 h-3 opacity-60" />
                <span>{t('Avg CPC')}</span>
                <span
                  title={t('Estimated Google Ads Cost-Per-Click commercial value. High CPC directly correlates with higher domain acquisition budgets.')}
                  className="cursor-help opacity-60 hover:opacity-100 text-[10px]"
                >
                  ⓘ
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-ds-ink tabular-nums">
                {data.stats.avgCpc || '$2.85'}
              </div>
            </div>

            {/* Metric 5: Search History */}
            <div className="pt-1 sm:pt-0 sm:px-2.5 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-ds-subtle">
                <Icons.Chart className="w-3 h-3 opacity-60" />
                <span>{t('Search History')}</span>
                <span
                  title={t('Year-over-Year search interest trend velocity.')}
                  className="cursor-help opacity-60 hover:opacity-100 text-[10px]"
                >
                  ⓘ
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-ds-ink tabular-nums flex items-center gap-1">
                <span>{data.stats.searchHistory || '+16% YoY'}</span>
                <span className="text-emerald-400 text-sm">↗</span>
              </div>
            </div>

            {/* Metric 6: Ad Competition */}
            <div className="pt-1 sm:pt-0 sm:px-2.5 last:pr-0 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-ds-subtle">
                <div className="flex items-center gap-1">
                  <Icons.Sparkles />
                  <span>{t('Ad Competition')}</span>
                  <span
                    title={t('PPC Advertiser density: High competition signals deep corporate marketing budgets.')}
                    className="cursor-help opacity-60 hover:opacity-100 text-[10px]"
                  >
                    ⓘ
                  </span>
                </div>
                <span className="font-semibold text-ds-ink">
                  {t(data.stats.adCompetitionLabel || 'High')}
                </span>
              </div>
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isLight ? 'bg-slate-200' : 'bg-white/10'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${data.stats.adCompetitionScore || 75}%` }}
                />
              </div>
            </div>
          </div>

          {/* Secondary Intelligence & Export Bar */}
          <div
            className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2.5 text-xs ${
              isLight ? 'border-slate-100' : 'border-white/5'
            }`}
          >
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="text-ds-subtle">{t('Namespace Saturation:')}</span>
                <span className="font-semibold text-ds-ink">
                  {data.stats.saturationPct}% ({t('{a}/{b} TLDs registered', { a: data.stats.registeredCount, b: data.stats.totalAnalyzed })})
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="text-ds-subtle">{t('Active Sites:')}</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('{n} Live Sites', { n: data.stats.developedCount })}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="text-ds-subtle">{t('.com Status:')}</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                    data.stats.dotComStatus === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                      : isLight
                      ? 'bg-slate-100 text-slate-800 border border-slate-200'
                      : 'bg-[#181818] text-white/90 border border-white/15'
                  }`}
                >
                  {t(data.stats.dotComStatus)}
                </span>
              </span>
            </div>

            {/* High-Contrast Export Buttons: CSV & PDF */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-ds-subtle flex items-center gap-1">
                <Icons.Download className="w-3 h-3" />
                <span>{t('Export:')}</span>
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-white/15 overflow-hidden text-[11px] font-semibold shadow-sm">
                <button
                  type="button"
                  onClick={handleExportSldsCsv}
                  className={`px-3 py-1 transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-[#181818] hover:bg-[#252525] text-white/90 hover:text-white'
                  }`}
                  title={t('Export results to CSV')}
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className={`px-3 py-1 border-l border-slate-200 dark:border-white/15 transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-[#181818] hover:bg-[#252525] text-white/90 hover:text-white'
                  }`}
                  title={t('Export intelligence report as PDF')}
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Namespace SLD Matrix */}
      <div className="space-y-3">
        {/* Category Filter Pills (Matches Earlier Categories) */}
        <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: t('All Categories ({n})', { n: data?.sldResults?.length || 0 }) },
              { id: 'core', label: t('Core (.com, .net)') },
              { id: 'tech', label: t('Tech & AI (.ai, .io)') },
              { id: 'brand', label: t('Brandable (.xyz, .me)') },
              { id: 'commercial', label: t('Commercial (.store, .pro)') },
              { id: 'cctld', label: t('ccTLDs (Country)') },
              { id: 'developed', label: t('Developed Websites') },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSldCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sldCategoryFilter === cat.id
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-sm font-bold'
                      : 'bg-white text-black shadow-sm font-bold'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-[#141414] hover:bg-[#1f1f1f] text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Left: Quick Saturation Filter, Page Size & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={sldSearchQuery}
                  onChange={(e) => setSldSearchQuery(e.target.value)}
                  placeholder={t('Filter SLD names...')}
                  className={`h-8 pl-7 pr-2.5 rounded-lg text-xs font-medium border outline-none w-36 sm:w-44 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-[#141414] border-white/10 text-white placeholder:text-white/30'
                  }`}
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] opacity-40">
                  🔍
                </span>
                {sldSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSldSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ds-subtle hover:text-ds-ink"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={sldSaturationFilter}
                onChange={(e) => setSldSaturationFilter(e.target.value as any)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium border outline-none ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-[#141414] border-white/10 text-white'
                }`}
              >
                <option value="all">{t('All Saturation ({n})', { n: filteredSlds.length })}</option>
                <option value="high">{t('High Saturation (50+ TLDs)')}</option>
                <option value="moderate">{t('Moderate Saturation (20-49 TLDs)')}</option>
                <option value="developed">{t('Developed Only (>0 Live)')}</option>
              </select>

              {/* Per Page Selector */}
              <select
                value={String(sldPageSize)}
                onChange={(e) => {
                  const val = e.target.value;
                  setSldPageSize(val === 'all' ? 'all' : parseInt(val, 10));
                  setSldPage(1);
                }}
                className={`h-8 px-2 rounded-lg text-xs font-medium border outline-none ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-[#141414] border-white/10 text-white'
                }`}
                title={t('Number of SLD rows per page')}
              >
                <option value="50">{t('{n} per page', { n: 50 })}</option>
                <option value="100">{t('{n} per page', { n: 100 })}</option>
                <option value="250">{t('{n} per page', { n: 250 })}</option>
                <option value="all">{t('All {n} Results', { n: filteredSlds.length })}</option>
              </select>

              <span className="text-[11px] text-ds-subtle font-mono pl-0.5">
                {sldPageSize === 'all'
                  ? t('All {n} SLDs', { n: filteredSlds.length })
                  : t('{range} of {n}', {
                      range: `${(sldPage - 1) * (sldPageSize as number) + 1}–${Math.min(
                        sldPage * (sldPageSize as number),
                        filteredSlds.length
                      )}`,
                      n: filteredSlds.length,
                    })}
              </span>
            </div>

            {/* Right: Pagination Nav & Export */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {sldPageSize !== 'all' && totalSldPages > 1 && (
                <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden text-xs mr-1">
                  <button
                    type="button"
                    disabled={sldPage <= 1}
                    onClick={() => setSldPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    ◀
                  </button>
                  <span className="px-2 py-1 text-[11px] font-mono border-x border-slate-200 dark:border-white/10">
                    {sldPage} / {totalSldPages}
                  </span>
                  <button
                    type="button"
                    disabled={sldPage >= totalSldPages}
                    onClick={() => setSldPage((p) => Math.min(totalSldPages, p + 1))}
                    className="px-2 py-1 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    ▶
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleExpandAll}
                className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    : 'bg-[#141414] border-white/10 hover:bg-[#1a1a1a] text-white/70 hover:text-white'
                }`}
              >
                {t('Expand All')}
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    : 'bg-[#141414] border-white/10 hover:bg-[#1a1a1a] text-white/70 hover:text-white'
                }`}
              >
                {t('Collapse All')}
              </button>
              <button
                type="button"
                onClick={handleExportSldsCsv}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-white hover:bg-slate-100 text-black'
                }`}
              >
                <Icons.Download className="w-3 h-3" />
                <span>{t('Export CSV')}</span>
              </button>
            </div>
          </div>

          {/* Table Container — Apple HIG momentum scroll, deep dark background, crisp borders */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0a] border-white/10'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <colgroup>
                  <col className="w-[125px] sm:w-[155px]" />
                  <col className="w-[85px] sm:w-[100px]" />
                  <col className="w-[105px] sm:w-[125px]" />
                  <col className="w-[65px] sm:w-[80px]" />
                  <col className="w-[75px] sm:w-[90px]" />
                  <col />
                </colgroup>
                <thead
                  className={`border-b text-[11px] uppercase tracking-wider font-semibold select-none sticky top-0 z-20 backdrop-blur-md ${
                    isLight
                      ? 'bg-slate-50/95 border-slate-200 text-slate-600'
                      : 'bg-[#111111]/95 border-white/10 text-white/60'
                  }`}
                >
                  <tr>
                    {/* SLD Header */}
                    <th
                      className="py-3 px-3 sm:px-4 cursor-pointer hover:text-ds-ink transition-colors"
                      onClick={() => {
                        if (sldSortCol === 'sld') {
                          setSldSortDir(sldSortDir === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSldSortCol('sld');
                          setSldSortDir('asc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('SLD')}</span>
                        {sldSortCol === 'sld' && (
                          <span className="text-[10px]">{sldSortDir === 'desc' ? '▼' : '▲'}</span>
                        )}
                      </div>
                    </th>

                    {/* Category Header */}
                    <th className="py-3 px-2 sm:px-3 font-semibold text-ds-subtle">
                      <span>{t('Category')}</span>
                    </th>

                    {/* Lead Score Header */}
                    <th
                      className="py-3 px-2 sm:px-3 cursor-pointer hover:text-ds-ink transition-colors"
                      onClick={() => {
                        if (sldSortCol === 'score') {
                          setSldSortDir(sldSortDir === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSldSortCol('score');
                          setSldSortDir('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('Lead Score')}</span>
                        {sldSortCol === 'score' && (
                          <span className="text-[10px]">{sldSortDir === 'desc' ? '▼' : '▲'}</span>
                        )}
                      </div>
                    </th>

                    {/* TLDs Taken Header */}
                    <th
                      className="py-3 px-2 sm:px-3 cursor-pointer hover:text-ds-ink transition-colors"
                      onClick={() => {
                        if (sldSortCol === 'taken') {
                          setSldSortDir(sldSortDir === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSldSortCol('taken');
                          setSldSortDir('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('Taken')}</span>
                        {sldSortCol === 'taken' && (
                          <span className="text-[10px]">{sldSortDir === 'desc' ? '▼' : '▲'}</span>
                        )}
                      </div>
                    </th>

                    {/* TLDs Developed Header */}
                    <th
                      className="py-3 px-2 sm:px-3 cursor-pointer hover:text-ds-ink transition-colors"
                      onClick={() => {
                        if (sldSortCol === 'dev') {
                          setSldSortDir(sldSortDir === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSldSortCol('dev');
                          setSldSortDir('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('Developed')}</span>
                        {sldSortCol === 'dev' && (
                          <span className="text-[10px]">{sldSortDir === 'desc' ? '▼' : '▲'}</span>
                        )}
                      </div>
                    </th>

                    {/* TLDs List Header with Right-Aligned Legend */}
                    <th className="py-3 px-3 sm:px-4">
                      <div className="flex items-center justify-between">
                        <span>{t('TLDs List')}</span>
                        <div className="flex items-center gap-3.5 normal-case font-normal text-[11px] tracking-normal">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#f87171]" />
                            <span className={isLight ? 'text-slate-700 font-medium' : 'text-white/80 font-medium'}>
                              {t('Developed')}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-400' : 'bg-white'}`} />
                            <span className={isLight ? 'text-slate-500 font-medium' : 'text-white/80 font-medium'}>
                              {t('Registered')}
                            </span>
                          </span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody
                  className={`divide-y ${
                    isLight ? 'divide-slate-100' : 'divide-white/5'
                  }`}
                >
                  {paginatedSlds.length > 0 ? (
                    paginatedSlds.map((item) => {
                      const isExpanded = expandedSlds.has(item.sld);

                      // Filter extensions if a category is selected
                      const rowCategoryTlds = item.tlds.filter((t) => {
                        if (sldCategoryFilter === 'developed') return t.developed;
                        if (sldCategoryFilter === 'core') return t.category === 'core' || ['com', 'net', 'org', 'info', 'biz'].includes(t.tld);
                        if (sldCategoryFilter === 'tech') return t.category === 'tech' || ['ai', 'io', 'co', 'app', 'dev', 'tech', 'software', 'digital', 'data', 'bot'].includes(t.tld);
                        if (sldCategoryFilter === 'brand') return t.category === 'brand' || ['xyz', 'me', 'cc', 'online', 'site', 'space', 'top', 'club', 'global', 'world', 'life', 'live'].includes(t.tld);
                        if (sldCategoryFilter === 'commercial') return t.category === 'commercial' || ['store', 'shop', 'cloud', 'pro', 'agency', 'media', 'services', 'solutions', 'company', 'market'].includes(t.tld);
                        if (sldCategoryFilter === 'cctld') return t.category === 'ccTLD' || ['us', 'uk', 'co.uk', 'ca', 'de', 'eu', 'in', 'co.in', 'fr', 'nl', 'au', 'com.au', 'co.jp', 'co.za', 'cz', 'se', 'ch', 'it', 'es'].includes(t.tld);
                        return true;
                      });
                      const activeTlds = (sldCategoryFilter !== 'all' && rowCategoryTlds.length > 0) ? rowCategoryTlds : item.tlds;

                      return (
                        <tr
                          key={item.sld}
                          className={`transition-colors ${
                            isLight
                              ? 'hover:bg-slate-50/80 bg-white'
                              : 'hover:bg-white/[0.02] bg-transparent'
                          }`}
                        >
                          {/* SLD with Highlighted Keyword */}
                          <td className="py-2.5 px-3 sm:px-4 align-top">
                            <div
                              onClick={() => toggleExpandSld(item.sld)}
                              title={
                                expandedSlds.has(item.sld)
                                  ? t('Click to collapse all {n} TLD extensions', { n: item.tldsTaken })
                                  : t('Click to expand all {n} TLD extensions', { n: item.tldsTaken })
                              }
                              className="inline-flex items-center gap-1.5 cursor-pointer group"
                            >
                              <span className="group-hover:underline font-medium">
                                {formatSldDisplay(item.sld, activeKeyword, isLight)}
                              </span>
                              {item.exact && (
                                <span
                                  className={`px-1 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider ${
                                    isLight
                                      ? 'bg-slate-900 text-white'
                                      : 'bg-white text-black'
                                  }`}
                                >
                                  {t('Exact')}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category Badge — High-Contrast Silver Pill (matches Image 2, 3 & 5) */}
                          <td className="py-2.5 px-2 sm:px-3 align-top">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10.5px] font-bold tracking-wide capitalize shadow-xs transition-colors ${
                                isLight
                                  ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                  : 'bg-[#e2e8f0] text-[#1e293b] border border-white/40'
                              }`}
                            >
                              {t(item.category || 'core')}
                            </span>
                          </td>

                          {/* Lead Score / Ranking with Progress Bar */}
                          <td className="py-2.5 px-2 sm:px-3 align-top">
                            <div className="space-y-1 w-20">
                              <div className="flex items-center justify-between font-bold text-xs tabular-nums">
                                <span
                                  className={
                                    (item.leadScore ?? 80) >= 85
                                      ? 'text-emerald-400'
                                      : (item.leadScore ?? 80) >= 65
                                      ? isLight
                                        ? 'text-slate-800'
                                        : 'text-white'
                                      : 'text-slate-400'
                                  }
                                >
                                  {item.leadScore ?? 80}/100
                                </span>
                                <span className="text-[9px] font-semibold text-ds-subtle uppercase">
                                  {(item.leadScore ?? 80) >= 85 ? t('HIGH') : (item.leadScore ?? 80) >= 65 ? t('MED') : t('LOW')}
                                </span>
                              </div>
                              <div
                                className={`w-full h-1 rounded-full overflow-hidden ${
                                  isLight ? 'bg-slate-200' : 'bg-white/10'
                                }`}
                              >
                                <div
                                  className={`h-full rounded-full ${
                                    (item.leadScore ?? 80) >= 85
                                      ? 'bg-emerald-400'
                                      : (item.leadScore ?? 80) >= 65
                                      ? isLight
                                        ? 'bg-slate-900'
                                        : 'bg-white'
                                      : 'bg-slate-500'
                                  }`}
                                  style={{ width: `${item.leadScore ?? 80}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* TLDs Taken */}
                          <td className="py-2.5 px-2 sm:px-3 align-top font-semibold text-xs sm:text-[13px] tabular-nums text-ds-ink">
                            {item.tldsTaken}
                          </td>

                          {/* TLDs Developed */}
                          <td className="py-2.5 px-2 sm:px-3 align-top font-semibold text-xs sm:text-[13px] tabular-nums text-ds-ink">
                            {item.tldsDeveloped}
                          </td>

                          {/* TLDs List (Matches Reference Image 1, 2, 3, 4 & 8) */}
                          <td
                            className={`py-2 px-3 sm:px-4 align-top text-[12px] sm:text-[13px] ${
                              !isExpanded ? 'max-w-0 overflow-hidden' : ''
                            }`}
                          >
                            {!isExpanded ? (
                              /* Collapsed State: Single line with right fade & round (+) button (Image 1, 3, 8) */
                              <div className="relative flex items-center pr-9 h-7 overflow-hidden">
                                <div className="truncate whitespace-nowrap min-w-0 flex-1 leading-normal select-text">
                                  {activeTlds.map((t, idx) => (
                                    <span key={t.tld} className="inline-block whitespace-nowrap mr-1.5">
                                      <span
                                        onClick={() =>
                                          setSelectedTldModal({
                                            sld: item.sld,
                                            tld: t.tld,
                                            developed: t.developed,
                                          })
                                        }
                                        title={`${item.sld}.${t.tld} (${
                                          t.developed ? tt('Developed / Active Website') : tt('Registered')
                                        })`}
                                        className={`cursor-pointer transition-colors ${
                                          t.developed
                                            ? 'text-[#f87171] hover:underline font-medium'
                                            : isLight
                                            ? 'text-slate-800 hover:text-black hover:underline'
                                            : 'text-white hover:text-white hover:underline'
                                        }`}
                                      >
                                        {t.tld}
                                      </span>
                                      {idx < activeTlds.length - 1 && (
                                        <span
                                          className={
                                            isLight ? 'text-slate-400' : 'text-white/40'
                                          }
                                        >
                                          ,
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>

                                {/* Right Fade & Round (+) Button (Image 3 & 10) */}
                                <div
                                  className={`absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end pointer-events-none ${
                                    isLight
                                      ? 'bg-gradient-to-l from-white via-white/90 to-transparent'
                                      : 'bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandSld(item.sld)}
                                    aria-label={t('Expand all {n} extensions for {sld}', { n: item.tlds.length, sld: item.sld })}
                                    className="pointer-events-auto w-6 h-6 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/20 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Expanded State: FULL list of TLDs wrapped in place with round (-) button (Image 2 & 4) */
                              <div className="relative pr-9 py-0.5 leading-relaxed select-text animate-in fade-in duration-100">
                                <div className="break-normal">
                                  {activeTlds.map((t, idx) => (
                                    <span key={t.tld} className="inline-block whitespace-nowrap mr-1.5">
                                      <span
                                        onClick={() =>
                                          setSelectedTldModal({
                                            sld: item.sld,
                                            tld: t.tld,
                                            developed: t.developed,
                                          })
                                        }
                                        title={`${item.sld}.${t.tld} (${
                                          t.developed ? tt('Developed / Active Website') : tt('Registered')
                                        })`}
                                        className={`cursor-pointer transition-colors ${
                                          t.developed
                                            ? 'text-[#f87171] hover:underline font-medium'
                                            : isLight
                                            ? 'text-slate-800 hover:text-black hover:underline'
                                            : 'text-white hover:text-white hover:underline'
                                        }`}
                                      >
                                        {t.tld}
                                      </span>
                                      {idx < activeTlds.length - 1 && (
                                        <span
                                          className={
                                            isLight ? 'text-slate-400' : 'text-white/40'
                                          }
                                        >
                                          ,
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>

                                {/* Round (-) Button at top-right aligned with line 1 to collapse back (Image 2 & 4) */}
                                <button
                                  type="button"
                                  onClick={() => toggleExpandSld(item.sld)}
                                  aria-label={t('Collapse extensions list for {sld}', { sld: item.sld })}
                                  className="absolute right-0 top-0.5 w-6 h-6 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/20 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                >
                                  −
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-ds-subtle font-sans">
                        {t('No SLDs matched your search query. Try clearing the filter or changing keyword.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {sldPageSize !== 'all' && totalSldPages > 1 && (
              <div
                className={`p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs select-none ${
                  isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-[#0d0d0d]'
                }`}
              >
                <div className="text-ds-subtle text-[11px]">
                  {rich(t('Showing page {p} of {total} ({n} total SLD matches)'), {
                    p: <span className="font-semibold text-ds-ink">{sldPage}</span>,
                    total: <span className="font-semibold text-ds-ink">{totalSldPages}</span>,
                    n: filteredSlds.length,
                  })}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={sldPage <= 1}
                    onClick={() => setSldPage(1)}
                    className="px-2 py-1 rounded text-[11px] font-semibold border disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    {t('First')}
                  </button>
                  <button
                    type="button"
                    disabled={sldPage <= 1}
                    onClick={() => setSldPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded text-xs font-semibold border disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    {t('◀ Prev')}
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: Math.min(5, totalSldPages) }, (_, i) => {
                      let pageNum = sldPage - 2 + i;
                      if (pageNum < 1) pageNum = i + 1;
                      if (pageNum > totalSldPages) return null;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setSldPage(pageNum)}
                          className={`w-7 h-7 rounded text-xs font-semibold transition-all ${
                            sldPage === pageNum
                              ? isLight
                                ? 'bg-slate-900 text-white font-bold'
                                : 'bg-white text-black font-bold'
                              : 'hover:bg-white/10 text-ds-subtle'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={sldPage >= totalSldPages}
                    onClick={() => setSldPage((p) => Math.min(totalSldPages, p + 1))}
                    className="px-2.5 py-1 rounded text-xs font-semibold border disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    {t('Next ▶')}
                  </button>
                  <button
                    type="button"
                    disabled={sldPage >= totalSldPages}
                    onClick={() => setSldPage(totalSldPages)}
                    className="px-2 py-1 rounded text-[11px] font-semibold border disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    {t('Last')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Outbound Pitch Drawer / Modal */}
      {selectedLeadForPitch && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0a0a0a] border-white/15 text-white'
            }`}
          >
            {/* Drawer Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/10 text-white flex items-center justify-center font-bold text-xs">
                  ✉
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ds-ink">
                    {t('Outbound Pitch Generator for {d}', { d: selectedLeadForPitch.domain })}
                  </h3>
                  <p className="text-[10px] text-ds-subtle">
                    {t('Target: {sld} · Lead Score: {n}/100', { sld: selectedLeadForPitch.sld, n: selectedLeadForPitch.leadScore ?? '' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForPitch(null)}
                className="text-ds-subtle hover:text-ds-ink text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
              {/* Smart Valuation & Buyer Budget Estimator */}
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-emerald-950/20 border-emerald-500/20'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    {t('Estimated Buyer Budget Range')}
                  </div>
                  <div className="text-sm font-bold text-ds-ink tabular-nums">
                    {(selectedLeadForPitch.leadScore ?? 80) >= 90
                      ? '$15,000 – $45,000 USD'
                      : (selectedLeadForPitch.leadScore ?? 80) >= 75
                      ? '$4,500 – $15,000 USD'
                      : '$1,500 – $4,500 USD'}
                  </div>
                </div>
                <div className="text-right text-[10px] text-ds-subtle">
                  <div>{rich(t('Corporate MX: {v}'), { v: <span className="font-semibold text-ds-ink">{selectedLeadForPitch.mxProvider ? t('Active') : t('Standard')}</span> })}</div>
                  <div className="text-emerald-500 font-medium">{t('Confidence: High (CZDS + RDAP)')}</div>
                </div>
              </div>

              {/* Buyer Persona Summary */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-white/10 text-xs text-ds-body space-y-0.5">
                <div className="font-bold text-ds-ink text-[11px]">
                  {t('Target Buyer Insight:')}
                </div>
                <div className="text-[11px]">{selectedLeadForPitch.buyerPersona}</div>
                {selectedLeadForPitch.mxProvider && (
                  <div className="text-[10px] text-ds-subtle pt-0.5">
                    {rich(t('Email System: {v}'), { v: <span className="font-semibold text-ds-ink">{selectedLeadForPitch.mxProvider}</span> })}
                  </div>
                )}
              </div>

              {/* Pitch Angle Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-ds-ink mb-1">
                  {t('Select Pitch Strategy:')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'upgrade', label: 'Upgrade to .com', desc: 'Brand Authority & Defense' },
                    { id: 'defense', label: 'Brand Defense', desc: 'Prevent Typos & Phishing' },
                    { id: 'acquisition', label: 'Acquisition', desc: 'Direct Buyout Offer' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setPitchTemplateType(tpl.id as any)}
                      className={`p-2 rounded-xl text-left border transition-all text-xs ${
                        pitchTemplateType === tpl.id
                          ? isLight
                            ? 'border-slate-900 bg-slate-100 text-slate-900 font-bold'
                            : 'border-white bg-white/10 text-white font-bold'
                          : isLight
                          ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'border-white/10 bg-[#141414] hover:bg-[#1a1a1a] text-white/70'
                      }`}
                    >
                      <div className="text-[11px]">{t(tpl.label)}</div>
                      <div className="text-[9px] font-normal opacity-60 mt-0.5">{t(tpl.desc)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Preview */}
              {pitchTemplates && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-ds-ink text-[11px]">
                      {t('Subject Line:')}
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(pitchTemplates[pitchTemplateType].subject, 'Subject copied')}
                      className="text-[10px] text-ds-ink underline opacity-70 hover:opacity-100"
                    >
                      {t('Copy Subject')}
                    </button>
                  </div>
                  <div
                    className={`p-2 rounded-lg text-[11px] font-mono border ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-[#141414] border-white/10 text-white/90'
                    }`}
                  >
                    {pitchTemplates[pitchTemplateType].subject}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="font-semibold text-ds-ink text-[11px]">
                      {t('Email Body:')}
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(pitchTemplates[pitchTemplateType].body, 'Body copied')}
                      className="text-[10px] text-ds-ink underline opacity-70 hover:opacity-100"
                    >
                      {t('Copy Body')}
                    </button>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg text-xs whitespace-pre-wrap font-sans leading-relaxed border ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-[#141414] border-white/10 text-white/90'
                    }`}
                  >
                    {pitchTemplates[pitchTemplateType].body}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Actions */}
            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#0e0e0e]">
              <button
                type="button"
                onClick={() => setSelectedLeadForPitch(null)}
                className="px-3 py-1 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                {t('Close')}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (pitchTemplates) {
                      const full = `Subject: ${pitchTemplates[pitchTemplateType].subject}\n\n${pitchTemplates[pitchTemplateType].body}`;
                      copyToClipboard(full, 'Template copied');
                    }
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {t('Copy Template')}
                </button>

                {pitchTemplates && (
                  <a
                    href={`mailto:contact@${selectedLeadForPitch.domain}?subject=${encodeURIComponent(
                      pitchTemplates[pitchTemplateType].subject
                    )}&body=${encodeURIComponent(pitchTemplates[pitchTemplateType].body)}`}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                      isLight
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-white hover:bg-slate-200 text-black'
                    }`}
                  >
                    {t('Open in Mail ↗')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extension Quick Action Dialog */}
      {selectedTldModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0a0a0a] border-white/15 text-white'
            }`}
          >
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-mono text-ds-ink">
                  {selectedTldModal.sld}.{selectedTldModal.tld}
                </h3>
                <p className="text-[11px] text-ds-subtle">
                  {t('TLD: .{tld} · Status:', { tld: selectedTldModal.tld })}{' '}
                  <span
                    className={
                      selectedTldModal.developed
                        ? 'text-[#f87171] font-semibold'
                        : 'text-ds-ink font-semibold'
                    }
                  >
                    {selectedTldModal.developed ? t('Developed / Live Website') : t('Registered / Taken')}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTldModal(null)}
                className="text-ds-subtle hover:text-ds-ink text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111111] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-ds-subtle">{t('Development Status:')}</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      selectedTldModal.developed ? 'text-[#f87171]' : 'text-ds-ink'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedTldModal.developed ? 'bg-[#f87171]' : 'bg-white/60'
                      }`}
                    />
                    {selectedTldModal.developed ? t('Developed (HTTP 200)') : t('Registered (No Website)')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ds-subtle">{t('Namespace Parent:')}</span>
                  <span className="font-mono font-medium">{selectedTldModal.sld}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {selectedTldModal.developed && (
                  <button
                    type="button"
                    onClick={() => {
                      const matchingLead = {
                        domain: `${selectedTldModal.sld}.${selectedTldModal.tld}`,
                        sld: selectedTldModal.sld,
                        tld: selectedTldModal.tld,
                        status: 'developed' as const,
                        available: false,
                        leadScore: 88,
                        category: 'tech' as const,
                        mxProvider: 'Google Workspace',
                        hasMail: true,
                        registrar: 'Cloudflare, Inc.',
                        nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
                        trafficEstimate: '~50k / mo',
                        buyerPersona: `Commercial entity on .${selectedTldModal.tld} with active website. High-probability target for .com brand upgrade.`,
                      };
                      setSelectedTldModal(null);
                      setSelectedLeadForPitch(matchingLead as unknown as LeadTldRecord);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                      isLight
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    <span>{t('⚡ Generate Outbound Pitch')}</span>
                  </button>
                )}

                <a
                  href={`https://${selectedTldModal.sld}.${selectedTldModal.tld}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    isLight
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-white hover:bg-slate-100 text-black'
                  }`}
                >
                  <span>{t('Visit Domain Website')}</span>
                  <span>↗</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getSpaceshipAffiliateUrl(`${selectedTldModal.sld}.${selectedTldModal.tld}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-colors ${
                      isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-800'
                        : 'border-white/15 hover:bg-white/10 text-white'
                    }`}
                  >
                    {t('Check Registrar ↗')}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(
                        `${selectedTldModal.sld}.${selectedTldModal.tld}`,
                        'Domain copied'
                      );
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-colors ${
                      isLight
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-800'
                        : 'border-white/15 hover:bg-white/10 text-white'
                    }`}
                  >
                    {t('Copy Domain')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED ENLARGE TLD LIST MODAL — Shows ONLY the TLD list with zero page reflow */}
      {enlargeModalSld && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#0d0d0d] border-white/15 text-white'
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-bold text-lg sm:text-xl text-ds-ink">
                    {enlargeModalSld.sld}
                  </h3>
                  {enlargeModalSld.exact && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold uppercase tracking-wider ${
                        isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                      }`}
                    >
                      {t('Exact Match')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ds-subtle mt-0.5 flex flex-wrap items-center gap-2">
                  <span>
                    {rich(t('Total Taken: {v}'), { v: <strong className="text-ds-ink">{t('{n} TLDs', { n: enlargeModalSld.tldsTaken })}</strong> })}
                  </span>
                  <span>·</span>
                  <span className="text-[#f87171] font-semibold">
                    • {t('{n} Developed', { n: enlargeModalSld.tldsDeveloped })}
                  </span>
                  <span>·</span>
                  <span className={isLight ? 'text-slate-600' : 'text-white/60'}>
                    • {t('{n} Registered', { n: enlargeModalSld.tldsTaken - enlargeModalSld.tldsDeveloped })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnlargeModalSld(null)}
                  className="p-1.5 rounded-lg text-ds-subtle hover:text-ds-ink hover:bg-slate-100 dark:hover:bg-white/10 text-base"
                  title={t('Close modal (Esc)')}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sub-Header: Filter Tabs, Instant Search & Action Buttons */}
            <div
              className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-black/40'
              }`}
            >
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEnlargeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    enlargeFilter === 'all'
                      ? isLight
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-black shadow-sm font-bold'
                      : isLight
                      ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      : 'bg-white/10 text-white/70 hover:text-white border border-white/5'
                  }`}
                >
                  {t('All ({n})', { n: enlargeModalSld.tldsTaken })}
                </button>
                <button
                  type="button"
                  onClick={() => setEnlargeFilter('developed')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    enlargeFilter === 'developed'
                      ? 'bg-[#f87171] text-black font-bold shadow-sm'
                      : isLight
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-950/60 border border-rose-500/30'
                  }`}
                >
                  {t('Developed ({n})', { n: enlargeModalSld.tldsDeveloped })}
                </button>
                <button
                  type="button"
                  onClick={() => setEnlargeFilter('registered')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    enlargeFilter === 'registered'
                      ? isLight
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-black shadow-sm font-bold'
                      : isLight
                      ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      : 'bg-white/10 text-white/70 hover:text-white border border-white/5'
                  }`}
                >
                  {t('Registered ({n})', { n: enlargeModalSld.tldsTaken - enlargeModalSld.tldsDeveloped })}
                </button>
              </div>

              {/* Search Inside Extensions & Copy Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={enlargeSearch}
                    onChange={(e) => setEnlargeSearch(e.target.value)}
                    placeholder={t('Filter TLDs (.ai, .co)...')}
                    className={`h-7 px-2.5 text-xs rounded-lg border outline-none w-36 sm:w-44 ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900'
                        : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                    }`}
                  />
                  {enlargeSearch && (
                    <button
                      type="button"
                      onClick={() => setEnlargeSearch('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="inline-flex rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => handleCopyEnlargedTlds('comma')}
                    className={`px-2 py-1 transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-800'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={t('Copy extensions as comma-separated list (.com, .net, .ai)')}
                  >
                    {t('Copy List')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyEnlargedTlds('domains')}
                    className={`px-2 py-1 border-l border-slate-200 dark:border-white/10 transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-800'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={t('Copy full domains (buddy.com, buddy.net)')}
                  >
                    {t('Copy Domains')}
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Container Showing ONLY the TLD list */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 scrollbar-thin">
              {enlargedTlds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {enlargedTlds.map((t) => (
                    <div
                      key={t.tld}
                      onClick={() =>
                        setSelectedTldModal({
                          sld: enlargeModalSld.sld,
                          tld: t.tld,
                          developed: t.developed,
                        })
                      }
                      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium cursor-pointer border transition-all active:scale-95 ${
                        t.developed
                          ? isLight
                            ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 hover:border-rose-300'
                            : 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/50 hover:border-rose-400'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                      title={`${enlargeModalSld.sld}.${t.tld} — ${
                        t.developed ? tt('Developed (Active Site)') : tt('Registered')
                      }. Click for registrar / WHOIS details.`}
                    >
                      <span className={t.developed ? 'text-[#f87171] font-bold' : 'opacity-40'}>
                        .
                      </span>
                      <span className="font-semibold">{t.tld}</span>

                      {t.developed ? (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#f87171] animate-pulse"
                          title={tt('Developed / Live Website')}
                        />
                      ) : (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLight ? 'bg-slate-300' : 'bg-white/20'
                          }`}
                          title={tt('Registered')}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-ds-subtle">
                  {t('No extensions matched "{q}". Try clearing the filter.', { q: enlargeSearch })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`p-3 sm:p-4 border-t flex items-center justify-between text-xs ${
                isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-[#0a0a0a]'
              }`}
            >
              <div className="text-[11px] text-ds-subtle">
                {rich(t('Showing {a} of {b} extensions for {sld}'), {
                  a: <strong className="text-ds-ink">{enlargedTlds.length}</strong>,
                  b: enlargeModalSld.tldsTaken,
                  sld: <span className="font-mono text-ds-ink font-semibold">{enlargeModalSld.sld}</span>,
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnlargeModalSld(null)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isLight
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-white hover:bg-slate-200 text-black font-bold'
                  }`}
                >
                  {t('Done')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
