'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { PageBreadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferredRegistrar } from '@/hooks/usePreferredRegistrar';
import { resolveRegisterUrl } from '@/lib/registrars';
import {
  type SavedDomainRecord,
  type SavedFolder,
  type FolderColorId,
  type FolderFilter,
  FOLDER_COLORS,
  loadSavedDomains,
  loadFolders,
  removeSavedDomain,
  clearAllSavedDomains,
  moveDomainToFolder,
  createFolder,
  renameFolder,
  setFolderColor,
  deleteFolder,
  filterDomains,
  countInFolder,
} from '@/lib/savedDomainsStore';
import {
  type ExportFormat,
  type CopyFormat,
  EXPORT_FORMAT_OPTIONS,
  COPY_FORMAT_OPTIONS,
  exportDomains,
  buildForCopy,
  copyText,
} from '@/lib/savedDomainsExport';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function SavedDomainsPage() {
  const [domains, setDomains] = useState<SavedDomainRecord[]>([]);
  const [folders, setFolders] = useState<SavedFolder[]>([]);
  const [filter, setFilter] = useState<FolderFilter>('all');
  const [mounted, setMounted] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<FolderColorId>('sand');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [query, setQuery] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [copyFormat, setCopyFormat] = useState<CopyFormat>('plain');
  const [exportScope, setExportScope] = useState<'all' | 'visible'>('all');
  const [busyExport, setBusyExport] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);

  const { showToast } = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { selectedRegistrar } = usePreferredRegistrar();

  const refresh = useCallback(() => {
    setDomains(loadSavedDomains());
    setFolders(loadFolders());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const onSync = () => refresh();
    window.addEventListener('savedDomainsUpdated', onSync);
    window.addEventListener('storage', onSync);
    return () => {
      window.removeEventListener('savedDomainsUpdated', onSync);
      window.removeEventListener('storage', onSync);
    };
  }, [refresh]);

  const folderById = useMemo(() => {
    const m = new Map<string, SavedFolder>();
    folders.forEach((f) => m.set(f.id, f));
    return m;
  }, [folders]);

  const visible = useMemo(() => {
    let list = filterDomains(domains, filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((d) => d.domain.includes(q));
    return list;
  }, [domains, filter, query]);

  const handleRemoveDomain = (domain: string) => {
    setDomains(removeSavedDomain(domain));
    showToast(`Removed ${domain}`, 'success');
  };

  const handleClearAll = () => {
    if (
      !confirm(
        'Clear all saved domains on this device? This cannot be undone. Download or copy a backup first if you need it.'
      )
    ) {
      return;
    }
    clearAllSavedDomains();
    setDomains([]);
    showToast('All saved domains cleared', 'success');
  };

  const listForExport = useCallback(
    (scope: 'all' | 'visible' = exportScope) => {
      return scope === 'visible' ? visible : domains;
    },
    [domains, visible, exportScope]
  );

  const scopeLabel = useCallback(
    (scope: 'all' | 'visible') => {
      if (scope === 'all') return 'all';
      if (filter !== 'all' && filter !== 'unfiled') {
        const name = folderById.get(filter)?.name;
        return name ? `folder-${name}` : 'visible';
      }
      if (filter === 'unfiled') return 'unfiled';
      if (query.trim()) return 'filtered';
      return 'visible';
    },
    [filter, folderById, query]
  );

  const handleExport = async (scope: 'all' | 'visible' = exportScope, format: ExportFormat = exportFormat) => {
    const list = listForExport(scope);
    if (list.length === 0) {
      showToast('Nothing to download', 'error');
      return;
    }
    setBusyExport(true);
    try {
      await exportDomains(format, list, folders, { scope: scopeLabel(scope) });
      const fmt = EXPORT_FORMAT_OPTIONS.find((f) => f.id === format)?.label || format.toUpperCase();
      showToast(
        `Downloaded ${list.length} domain${list.length === 1 ? '' : 's'} as ${fmt} (DomainDiscovery branded)`,
        'success'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Download failed', 'error');
    } finally {
      setBusyExport(false);
    }
  };

  const handleCopy = async (scope: 'all' | 'visible' = exportScope, format: CopyFormat = copyFormat) => {
    const list = listForExport(scope);
    if (list.length === 0) {
      showToast('Nothing to copy', 'error');
      return;
    }
    const text = buildForCopy(format, list, folders);
    const ok = await copyText(text);
    if (ok) {
      const label = COPY_FORMAT_OPTIONS.find((f) => f.id === format)?.label || format;
      showToast(`Copied ${list.length} domain${list.length === 1 ? '' : 's'} (${label})`, 'success');
    } else {
      showToast('Clipboard blocked — try download instead', 'error');
    }
  };

  const handleCopySingle = async (domain: string) => {
    const ok = await copyText(domain);
    if (ok) showToast(`Copied ${domain}`, 'success', 1500);
    else showToast('Could not copy', 'error');
  };

  const handleBuyDomain = (domain: string) => {
    // Spaceship (default) → Impact affiliate; other registrars use their search URL
    const href = resolveRegisterUrl(domain, selectedRegistrar);
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleCreateFolder = (e?: React.FormEvent) => {
    e?.preventDefault();
    const folder = createFolder(newFolderName, newFolderColor);
    if (!folder) {
      showToast('Enter a folder name (max 40 folders)', 'error');
      return;
    }
    setFolders(loadFolders());
    setNewFolderName('');
    setCreatingFolder(false);
    setFilter(folder.id);
    showToast(`Folder “${folder.name}” created`, 'success');
  };

  const handleRenameFolder = (id: string) => {
    if (!editFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }
    setFolders(renameFolder(id, editFolderName));
    setEditingFolderId(null);
    showToast('Folder renamed', 'success');
  };

  const handleDeleteFolder = (id: string, name: string) => {
    if (
      !confirm(
        `Delete folder “${name}”? Domains in it stay saved and move to Unfiled.`
      )
    ) {
      return;
    }
    const { folders: nextFolders, domains: nextDomains } = deleteFolder(id);
    setFolders(nextFolders);
    setDomains(nextDomains);
    if (filter === id) setFilter('all');
    showToast(`Folder “${name}” deleted`, 'success');
  };

  const handleMove = (domain: string, folderId: string | null) => {
    setDomains(moveDomainToFolder(domain, folderId));
    const label =
      folderId && folderById.get(folderId)
        ? folderById.get(folderId)!.name
        : 'Unfiled';
    showToast(`Moved to ${label}`, 'success', 1500);
  };

  const shell = isLight
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-white/[0.02] border-white/10';
  const muted = isLight ? 'text-slate-500' : 'text-white/50';
  const ink = isLight ? 'text-slate-900' : 'text-white';
  const faint = isLight ? 'text-slate-400' : 'text-white/35';
  const inputCls = isLight
    ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
    : 'border-white/12 bg-white/[0.04] text-white placeholder:text-white/30';

  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      <Navigation />

      <main className="relative page-main">
        <PageBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Saved Domains' }]} />
        {/* Hero */}
        <SectionAmbient intensity="hero" contentClassName="page-gutter pb-4 sm:pb-5">
          <div className="max-w-5xl mx-auto text-center">
            <h1
              className={`text-3xl sm:text-5xl md:text-[3.4rem] font-black tracking-tight mb-3 ${
                mounted ? 'animate-slide-up' : 'opacity-0'
              }`}
            >
              <span
                className={`bg-gradient-to-r ${
                  isLight
                    ? 'from-indigo-900 via-indigo-600 to-sky-500'
                    : 'from-white via-white to-white/60'
                } bg-clip-text text-transparent`}
              >
                Saved Domains
              </span>
            </h1>
            <p
              className={`text-sm sm:text-base ${muted} max-w-2xl mx-auto mb-4 ${
                mounted ? 'animate-fade-in' : 'opacity-0'
              }`}
            >
              Organize shortlists into folders (e.g. AI brands, client projects). Everything stays
              on this device only — we never store your list on our servers.
            </p>
          </div>
        </SectionAmbient>

        {/* Critical local-storage notice */}
        <section className="px-3 sm:px-6 pb-5 sm:pb-6">
          <div className="max-w-5xl mx-auto">
            <div
              className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
                isLight
                  ? 'border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-stone-50'
                  : 'border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    isLight
                      ? 'border-amber-200 bg-amber-100/80 text-amber-900'
                      : 'border-white/10 bg-white/[0.06] text-[#e8d4a8]'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-1 ${
                      isLight ? 'text-amber-800/70' : 'text-[#c4a574]'
                    }`}
                  >
                    Local only · download recommended
                  </p>
                  <h2 className={`text-base sm:text-lg font-black tracking-tight mb-1.5 ${ink}`}>
                    We do not save your domains on our end
                  </h2>
                  <p className={`text-sm leading-relaxed ${muted}`}>
                    This shortlist lives in your browser&apos;s local storage. If you clear site data,
                    cookies, or cache — or use a different browser/device —{' '}
                    <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white/85'}`}>
                      every saved domain and folder here will be gone permanently
                    </span>
                    . We cannot recover it. Copy or download a branded backup whenever you care about the list.
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setShowSharePanel(true);
                        setExportScope('all');
                      }}
                      variant="primary"
                      size="sm"
                      className="gap-2"
                      disabled={domains.length === 0}
                    >
                      <Icons.Download />
                      Copy or download
                    </Button>
                    <Button
                      onClick={() => handleCopy('all', 'plain')}
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      disabled={domains.length === 0}
                    >
                      Copy all domains
                    </Button>
                    <Button
                      onClick={() => handleExport('all', 'csv')}
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      disabled={domains.length === 0 || busyExport}
                    >
                      <Icons.Download />
                      Quick CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="px-3 sm:px-6 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-[240px_1fr] gap-4 sm:gap-5">
              {/* Folder sidebar */}
              <aside className={`rounded-2xl border p-3 sm:p-3.5 h-fit lg:sticky lg:top-24 ${shell}`}>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${faint}`}>
                    Folders
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreatingFolder((v) => !v)}
                    className={`text-[11px] font-bold rounded-lg px-2 py-1 transition ${
                      isLight
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {creatingFolder ? 'Cancel' : '+ New'}
                  </button>
                </div>

                {creatingFolder && (
                  <form
                    onSubmit={handleCreateFolder}
                    className={`mb-3 rounded-xl border p-2.5 space-y-2 ${
                      isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <input
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g. AI brands"
                      maxLength={40}
                      className={`w-full rounded-lg border px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-offset-0 ${inputCls} ${
                        isLight ? 'focus:ring-slate-300' : 'focus:ring-white/20'
                      }`}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(FOLDER_COLORS) as FolderColorId[]).map((id) => (
                        <button
                          key={id}
                          type="button"
                          title={FOLDER_COLORS[id].label}
                          onClick={() => setNewFolderColor(id)}
                          className={`h-6 w-6 rounded-full border-2 transition ${
                            newFolderColor === id
                              ? isLight
                                ? 'border-slate-900 scale-110'
                                : 'border-white scale-110'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: FOLDER_COLORS[id].swatch }}
                        />
                      ))}
                    </div>
                    <Button type="submit" size="sm" variant="primary" className="w-full">
                      Create folder
                    </Button>
                  </form>
                )}

                <nav className="space-y-0.5">
                  {(
                    [
                      { id: 'all' as const, label: 'All domains', count: domains.length },
                      {
                        id: 'unfiled' as const,
                        label: 'Unfiled',
                        count: countInFolder(domains, 'unfiled'),
                      },
                    ] as const
                  ).map((item) => {
                    const active = filter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFilter(item.id)}
                        className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-semibold transition ${
                          active
                            ? isLight
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-black'
                            : isLight
                              ? 'text-slate-600 hover:bg-slate-100'
                              : 'text-white/65 hover:bg-white/8'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <span
                          className={`text-[11px] tabular-nums ${
                            active
                              ? isLight
                                ? 'text-white/70'
                                : 'text-black/50'
                              : faint
                          }`}
                        >
                          {item.count}
                        </span>
                      </button>
                    );
                  })}

                  {folders.length > 0 && (
                    <div className={`my-2 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`} />
                  )}

                  {folders.map((folder) => {
                    const active = filter === folder.id;
                    const count = countInFolder(domains, folder.id);
                    const color = FOLDER_COLORS[folder.color] || FOLDER_COLORS.sand;
                    const isEditing = editingFolderId === folder.id;

                    return (
                      <div key={folder.id} className="group">
                        {isEditing ? (
                          <div className="px-1 py-1 space-y-1.5">
                            <input
                              autoFocus
                              value={editFolderName}
                              onChange={(e) => setEditFolderName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameFolder(folder.id);
                                if (e.key === 'Escape') setEditingFolderId(null);
                              }}
                              className={`w-full rounded-lg border px-2 py-1.5 text-sm outline-none ${inputCls}`}
                            />
                            <div className="flex flex-wrap gap-1">
                              {(Object.keys(FOLDER_COLORS) as FolderColorId[]).map((id) => (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setFolders(setFolderColor(folder.id, id))}
                                  className={`h-5 w-5 rounded-full border ${
                                    folder.color === id
                                      ? isLight
                                        ? 'border-slate-900'
                                        : 'border-white'
                                      : 'border-transparent'
                                  }`}
                                  style={{ backgroundColor: FOLDER_COLORS[id].swatch }}
                                />
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleRenameFolder(folder.id)}
                                className={`flex-1 rounded-lg px-2 py-1 text-[11px] font-bold ${
                                  isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
                                }`}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFolderId(null)}
                                className={`rounded-lg px-2 py-1 text-[11px] font-bold ${muted}`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`flex items-center gap-0.5 rounded-xl ${
                              active
                                ? isLight
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white text-black'
                                : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setFilter(folder.id)}
                              className={`min-w-0 flex-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-semibold transition ${
                                active
                                  ? ''
                                  : isLight
                                    ? 'text-slate-600 hover:bg-slate-100'
                                    : 'text-white/65 hover:bg-white/8'
                              }`}
                            >
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: color.swatch }}
                              />
                              <span className="truncate">{folder.name}</span>
                              <span
                                className={`ml-auto text-[11px] tabular-nums ${
                                  active
                                    ? isLight
                                      ? 'text-white/70'
                                      : 'text-black/50'
                                    : faint
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                            <div
                              className={`pr-1 flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition ${
                                active ? 'opacity-100' : ''
                              }`}
                            >
                              <button
                                type="button"
                                title="Rename / color"
                                onClick={() => {
                                  setEditingFolderId(folder.id);
                                  setEditFolderName(folder.name);
                                }}
                                className={`rounded-md p-1 text-[10px] font-bold ${
                                  active
                                    ? isLight
                                      ? 'text-white/70 hover:bg-white/10'
                                      : 'text-black/50 hover:bg-black/5'
                                    : muted
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                title="Delete folder"
                                onClick={() => handleDeleteFolder(folder.id, folder.name)}
                                className={`rounded-md p-1 text-[10px] font-bold ${
                                  active
                                    ? 'text-red-300 hover:bg-white/10'
                                    : 'text-red-400/80 hover:text-red-400'
                                }`}
                              >
                                Del
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                <p className={`mt-3 px-1 text-[10px] leading-relaxed ${faint}`}>
                  Example: create “AI brands” and move every AI-related name into that folder.
                </p>
              </aside>

              {/* Domain list panel */}
              <div>
                {domains.length > 0 ? (
                  <>
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-3.5 rounded-2xl border ${shell}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${muted}`}>
                          <span className={`font-bold ${ink}`}>{visible.length}</span>
                          {filter !== 'all' || query
                            ? ` shown · ${domains.length} total`
                            : ` saved ${domains.length === 1 ? 'domain' : 'domains'}`}
                        </p>
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Filter by name…"
                          className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none ${inputCls}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
                        <Button
                          onClick={() => setShowSharePanel((v) => !v)}
                          variant="secondary"
                          size="sm"
                          className="gap-2"
                        >
                          <Icons.Download />
                          {showSharePanel ? 'Hide export' : 'Export'}
                        </Button>
                        <Button
                          onClick={handleClearAll}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          Clear all
                        </Button>
                      </div>
                    </div>

                    {/* Copy + multi-format download panel */}
                    {showSharePanel && (
                      <div
                        className={`mb-4 rounded-2xl border p-3.5 sm:p-4 space-y-4 ${
                          isLight
                            ? 'border-slate-200 bg-gradient-to-br from-white via-slate-50/80 to-white'
                            : 'border-white/10 bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-1 ${faint}`}>
                              Share · backup
                            </p>
                            <h3 className={`text-sm sm:text-base font-black tracking-tight ${ink}`}>
                              Copy or download your shortlist
                            </h3>
                            <p className={`mt-1 text-xs leading-relaxed ${muted}`}>
                              Every file includes <span className={`font-semibold ${ink}`}>DomainDiscovery</span>{' '}
                              and{' '}
                              <span className={`font-semibold ${ink}`}>domainsdiscovery.com</span> branding.
                            </p>
                          </div>
                          <div
                            className={`inline-flex rounded-xl border p-0.5 self-start ${
                              isLight ? 'border-slate-200 bg-white' : 'border-white/12 bg-black/20'
                            }`}
                          >
                            {(
                              [
                                { id: 'all' as const, label: 'All' },
                                { id: 'visible' as const, label: 'This view' },
                              ] as const
                            ).map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setExportScope(s.id)}
                                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                                  exportScope === s.id
                                    ? isLight
                                      ? 'bg-slate-900 text-white'
                                      : 'bg-white text-black'
                                    : isLight
                                      ? 'text-slate-600 hover:bg-slate-50'
                                      : 'text-white/55 hover:bg-white/5'
                                }`}
                              >
                                {s.label}
                                <span className="ml-1 opacity-70 tabular-nums">
                                  ({s.id === 'all' ? domains.length : visible.length})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Copy row */}
                        <div
                          className={`rounded-xl border p-3 ${
                            isLight ? 'border-slate-200 bg-white' : 'border-white/[0.08] bg-white/[0.02]'
                          }`}
                        >
                          <p className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-2 ${faint}`}>
                            Copy to clipboard
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {COPY_FORMAT_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setCopyFormat(opt.id)}
                                title={opt.hint}
                                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                                  copyFormat === opt.id
                                    ? isLight
                                      ? 'border-slate-900 bg-slate-900 text-white'
                                      : 'border-white bg-white text-black'
                                    : isLight
                                      ? 'border-slate-200 text-slate-600 hover:border-slate-300'
                                      : 'border-white/12 text-white/60 hover:border-white/25'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <Button
                            onClick={() => handleCopy(exportScope, copyFormat)}
                            variant="primary"
                            size="sm"
                            className="gap-2 w-full sm:w-auto"
                            disabled={listForExport(exportScope).length === 0}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy {listForExport(exportScope).length} domain
                            {listForExport(exportScope).length === 1 ? '' : 's'}
                          </Button>
                        </div>

                        {/* Download row */}
                        <div
                          className={`rounded-xl border p-3 ${
                            isLight ? 'border-slate-200 bg-white' : 'border-white/[0.08] bg-white/[0.02]'
                          }`}
                        >
                          <p className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-2 ${faint}`}>
                            Download file
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-3">
                            {EXPORT_FORMAT_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setExportFormat(opt.id)}
                                title={opt.hint}
                                className={`rounded-xl border px-2 py-2 text-left transition ${
                                  exportFormat === opt.id
                                    ? isLight
                                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                      : 'border-white bg-white text-black shadow-sm'
                                    : isLight
                                      ? 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                      : 'border-white/12 text-white/70 hover:border-white/25 hover:bg-white/[0.04]'
                                }`}
                              >
                                <span className="block text-[12px] font-black tracking-tight">{opt.label}</span>
                                <span
                                  className={`block text-[10px] mt-0.5 ${
                                    exportFormat === opt.id
                                      ? isLight
                                        ? 'text-white/70'
                                        : 'text-black/50'
                                      : faint
                                  }`}
                                >
                                  {opt.ext} · {opt.hint}
                                </span>
                              </button>
                            ))}
                          </div>
                          <Button
                            onClick={() => handleExport(exportScope, exportFormat)}
                            variant="primary"
                            size="sm"
                            className="gap-2 w-full sm:w-auto"
                            disabled={listForExport(exportScope).length === 0 || busyExport}
                          >
                            <Icons.Download />
                            {busyExport
                              ? 'Preparing…'
                              : `Download ${exportFormat.toUpperCase()} · DomainDiscovery branded`}
                          </Button>
                          <p className={`mt-2 text-[10px] leading-relaxed ${faint}`}>
                            Open source: Clipboard API + Blob downloads + jsPDF (MIT). Files name like{' '}
                            <span className={isLight ? 'text-slate-600' : 'text-white/50'}>
                              DomainDiscovery-saved-domains-….
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {visible.length === 0 ? (
                      <div
                        className={`text-center py-12 rounded-2xl border ${shell}`}
                      >
                        <p className={`font-semibold mb-1 ${ink}`}>No domains in this view</p>
                        <p className={`text-sm ${muted}`}>
                          {query
                            ? 'Try a different search.'
                            : 'Save domains from search, or move some into this folder.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {visible.map((item) => {
                          const folder = item.folderId
                            ? folderById.get(item.folderId)
                            : null;
                          const color = folder
                            ? FOLDER_COLORS[folder.color] || FOLDER_COLORS.sand
                            : null;

                          return (
                            <div
                              key={item.domain}
                              className={`group p-3.5 sm:p-4 border rounded-xl transition-all ${
                                isLight
                                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                                  : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`font-mono text-sm sm:text-lg font-semibold ${ink} mb-1 break-all sm:truncate`}
                                  >
                                    {item.domain}
                                  </div>
                                  <div className={`flex flex-wrap items-center gap-2 text-xs ${faint}`}>
                                    <span>Saved {formatDate(item.savedAt)}</span>
                                    {folder && color && (
                                      <span
                                        className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold"
                                        style={{
                                          borderColor: color.soft,
                                          backgroundColor: color.soft,
                                          color: isLight ? '#44403c' : '#e7e5e4',
                                        }}
                                      >
                                        <span
                                          className="h-1.5 w-1.5 rounded-full"
                                          style={{ backgroundColor: color.swatch }}
                                        />
                                        {folder.name}
                                      </span>
                                    )}
                                    {!folder && (
                                      <span
                                        className={`rounded-full border px-2 py-0.5 font-medium ${
                                          isLight
                                            ? 'border-slate-200 text-slate-500'
                                            : 'border-white/10 text-white/40'
                                        }`}
                                      >
                                        Unfiled
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                  <label className="sr-only" htmlFor={`folder-${item.domain}`}>
                                    Move to folder
                                  </label>
                                  <select
                                    id={`folder-${item.domain}`}
                                    value={item.folderId || ''}
                                    onChange={(e) =>
                                      handleMove(
                                        item.domain,
                                        e.target.value ? e.target.value : null
                                      )
                                    }
                                    className={`rounded-lg border px-2.5 py-2 text-xs font-semibold outline-none min-w-[8.5rem] flex-1 sm:flex-none ${inputCls}`}
                                  >
                                    <option value="">Unfiled</option>
                                    {folders.map((f) => (
                                      <option key={f.id} value={f.id}>
                                        {f.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySingle(item.domain)}
                                    className={`p-2 rounded-lg transition-all ${
                                      isLight
                                        ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                                        : 'text-white/40 hover:text-white hover:bg-white/10'
                                    }`}
                                    title="Copy domain"
                                    aria-label={`Copy ${item.domain}`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.75}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                  <Button
                                    onClick={() => handleBuyDomain(item.domain)}
                                    variant="primary"
                                    size="sm"
                                    className="gap-2 flex-1 sm:flex-none"
                                  >
                                    <Icons.Globe />
                                    Register
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDomain(item.domain)}
                                    className={`p-2 rounded-lg transition-all ${
                                      isLight
                                        ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                        : 'text-white/40 hover:text-red-400 hover:bg-red-400/10'
                                    }`}
                                    title="Remove from saved"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Secondary privacy reminder */}
                    <div
                      className={`mt-6 p-3.5 sm:p-4 rounded-xl border ${
                        isLight
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white/[0.02] border-white/10'
                      }`}
                    >
                      <p className={`text-sm leading-relaxed ${muted}`}>
                        <span className={`font-bold ${ink}`}>Privacy: </span>
                        Saved domains and folders never leave this browser unless you copy, download,
                        or register them yourself. Clearing cache removes them — keep a branded
                        TXT/CSV/JSON/MD/PDF backup from Export.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <div
                      className={`inline-flex p-4 sm:p-6 rounded-full border mb-4 sm:mb-6 ${
                        isLight
                          ? 'bg-slate-100 border-slate-200'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <svg
                        className={`w-12 h-12 ${isLight ? 'text-slate-300' : 'text-white/40'}`}
                        fill="none"
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
                    </div>
                    <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${ink}`}>
                      No saved domains yet
                    </h3>
                    <p className={`${muted} text-sm sm:text-base mb-3 max-w-md mx-auto`}>
                      Save names from search or the assistant. Create folders like “AI brands” to
                      keep shortlists organized.
                    </p>
                    <p className={`text-xs ${faint} mb-6 sm:mb-8 max-w-sm mx-auto`}>
                      Remember: lists are local only. Download a CSV if you need them after clearing
                      browser data.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Link href="/search">
                        <Button variant="primary" size="lg" className="gap-2">
                          <Icons.Search />
                          Search domains
                        </Button>
                      </Link>
                      <Link href="/assistant">
                        <Button variant="secondary" size="lg" className="gap-2">
                          AI Assistant
                        </Button>
                      </Link>
                    </div>
                    {!creatingFolder && (
                      <button
                        type="button"
                        onClick={() => setCreatingFolder(true)}
                        className={`mt-5 text-sm font-semibold underline underline-offset-4 ${muted}`}
                      >
                        Or create your first folder
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
