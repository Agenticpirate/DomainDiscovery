/**
 * Local-only saved domains + custom folders.
 * Nothing is sent to our servers — clearing site data wipes this list.
 */

export type SavedDomainRecord = {
  domain: string;
  savedAt: number;
  /** null / missing = Unfiled */
  folderId: string | null;
  /** Category tags. A domain can carry several. */
  tagIds?: string[];
  notes?: string;
};

export type SavedTag = {
  id: string;
  name: string;
  createdAt: number;
};

export type SavedFolder = {
  id: string;
  name: string;
  /** Organic accent token */
  color: FolderColorId;
  createdAt: number;
};

export type FolderColorId =
  | 'slate'
  | 'sand'
  | 'clay'
  | 'stone'
  | 'ink'
  | 'mist';

export const FOLDER_COLORS: Record<
  FolderColorId,
  { label: string; swatch: string; soft: string }
> = {
  slate: { label: 'Slate', swatch: '#6e7679', soft: 'rgba(100,116,139,0.18)' },
  sand: { label: 'Sand', swatch: '#c4a574', soft: 'rgba(196,165,116,0.22)' },
  clay: { label: 'Clay', swatch: '#b07858', soft: 'rgba(176,120,88,0.2)' },
  stone: { label: 'Stone', swatch: '#78716c', soft: 'rgba(120,113,108,0.2)' },
  ink: { label: 'Ink', swatch: '#2a2f31', soft: 'rgba(30,41,59,0.2)' },
  mist: { label: 'Mist', swatch: '#a1a4a5', soft: 'rgba(148,163,184,0.22)' },
};

export const SAVED_DOMAINS_KEY = 'saved_domains';
export const SAVED_FOLDERS_KEY = 'saved_domain_folders';
export const SAVED_TAGS_KEY = 'saved_domain_tags';
export const MAX_SAVED_DOMAINS = 500;
export const MAX_FOLDERS = 40;
export const MAX_TAGS = 60;
export const MAX_TAGS_PER_DOMAIN = 8;

export type FolderFilter = 'all' | 'unfiled' | string; // string = folder id
export type TagFilter = 'all' | 'untagged' | string; // string = tag id

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function notify() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event('savedDomainsUpdated'));
}

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

/** Normalize legacy string[] or mixed object arrays */
export function normalizeDomainList(raw: unknown): SavedDomainRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedDomainRecord[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    let domain = '';
    let savedAt = Date.now();
    let folderId: string | null = null;
    let tagIds: string[] | undefined;
    let notes: string | undefined;

    if (typeof item === 'string') {
      domain = normalizeDomain(item);
    } else if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      domain = normalizeDomain(String(o.domain || o.name || ''));
      if (typeof o.savedAt === 'number') savedAt = o.savedAt;
      if (typeof o.folderId === 'string' && o.folderId) folderId = o.folderId;
      if (o.folderId === null) folderId = null;
      if (Array.isArray(o.tagIds)) {
        const ids = [
          ...new Set(
            o.tagIds.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
          ),
        ].slice(0, MAX_TAGS_PER_DOMAIN);
        if (ids.length) tagIds = ids;
      }
      if (typeof o.notes === 'string') notes = o.notes;
    }

    if (!domain || seen.has(domain)) continue;
    seen.add(domain);
    out.push({ domain, savedAt, folderId, ...(tagIds ? { tagIds } : {}), notes });
  }

  return out;
}

export function loadSavedDomains(): SavedDomainRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(SAVED_DOMAINS_KEY);
    if (!raw) return [];
    return normalizeDomainList(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function persistSavedDomains(list: SavedDomainRecord[]): void {
  if (!canUseStorage()) return;
  const capped = list.slice(0, MAX_SAVED_DOMAINS);
  localStorage.setItem(SAVED_DOMAINS_KEY, JSON.stringify(capped));
  notify();
}

export function loadFolders(): SavedFolder[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(SAVED_FOLDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (f): f is SavedFolder =>
          f &&
          typeof f.id === 'string' &&
          typeof f.name === 'string' &&
          typeof f.createdAt === 'number'
      )
      .map((f) => ({
        ...f,
        color: (f.color in FOLDER_COLORS ? f.color : 'sand') as FolderColorId,
      }));
  } catch {
    return [];
  }
}

export function persistFolders(folders: SavedFolder[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(SAVED_FOLDERS_KEY, JSON.stringify(folders.slice(0, MAX_FOLDERS)));
  notify();
}

export function loadTags(): SavedTag[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(SAVED_TAGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t): t is SavedTag =>
          t &&
          typeof t.id === 'string' &&
          typeof t.name === 'string' &&
          typeof t.createdAt === 'number'
      )
      .slice(0, MAX_TAGS);
  } catch {
    return [];
  }
}

export function persistTags(tags: SavedTag[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(SAVED_TAGS_KEY, JSON.stringify(tags.slice(0, MAX_TAGS)));
  notify();
}

export function getSavedDomainNames(): string[] {
  return loadSavedDomains().map((d) => d.domain);
}

export function isDomainSaved(domain: string): boolean {
  const d = normalizeDomain(domain);
  return loadSavedDomains().some((x) => x.domain === d);
}

export function getSavedCount(): number {
  return loadSavedDomains().length;
}

/** Toggle save from search / tools — preserves folder metadata when re-saving */
export function toggleSavedDomain(domain: string): { saved: boolean; list: SavedDomainRecord[] } {
  const d = normalizeDomain(domain);
  if (!d) return { saved: false, list: loadSavedDomains() };

  const list = loadSavedDomains();
  const idx = list.findIndex((x) => x.domain === d);
  if (idx >= 0) {
    const next = list.filter((_, i) => i !== idx);
    persistSavedDomains(next);
    return { saved: false, list: next };
  }
  const next = [{ domain: d, savedAt: Date.now(), folderId: null }, ...list];
  persistSavedDomains(next);
  return { saved: true, list: next };
}

export function addSavedDomain(
  domain: string,
  opts?: { folderId?: string | null }
): SavedDomainRecord[] {
  const d = normalizeDomain(domain);
  if (!d) return loadSavedDomains();
  const list = loadSavedDomains();
  if (list.some((x) => x.domain === d)) return list;
  const next = [
    {
      domain: d,
      savedAt: Date.now(),
      folderId: opts?.folderId ?? null,
    },
    ...list,
  ];
  persistSavedDomains(next);
  return next;
}

export function removeSavedDomain(domain: string): SavedDomainRecord[] {
  const d = normalizeDomain(domain);
  const next = loadSavedDomains().filter((x) => x.domain !== d);
  persistSavedDomains(next);
  return next;
}

export function clearAllSavedDomains(): void {
  persistSavedDomains([]);
}

export function moveDomainToFolder(
  domain: string,
  folderId: string | null
): SavedDomainRecord[] {
  const d = normalizeDomain(domain);
  const next = loadSavedDomains().map((x) =>
    x.domain === d ? { ...x, folderId } : x
  );
  persistSavedDomains(next);
  return next;
}

export function createTag(name: string): SavedTag | null {
  const trimmed = name.trim().slice(0, 32);
  if (!trimmed) return null;
  const tags = loadTags();
  if (tags.length >= MAX_TAGS) return null;
  if (tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) return null;
  const tag: SavedTag = {
    id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: trimmed,
    createdAt: Date.now(),
  };
  persistTags([tag, ...tags]);
  return tag;
}

export function renameTag(id: string, name: string): SavedTag[] {
  const trimmed = name.trim().slice(0, 32);
  if (!trimmed) return loadTags();
  const tags = loadTags();
  if (tags.some((t) => t.id !== id && t.name.toLowerCase() === trimmed.toLowerCase())) {
    return tags;
  }
  const next = tags.map((t) => (t.id === id ? { ...t, name: trimmed } : t));
  persistTags(next);
  return next;
}

/** Delete a category. Domains stay saved; the tag is removed from each one. */
export function deleteTag(id: string): { tags: SavedTag[]; domains: SavedDomainRecord[] } {
  const tags = loadTags().filter((t) => t.id !== id);
  const domains = loadSavedDomains().map((d) => {
    const tagIds = (d.tagIds || []).filter((t) => t !== id);
    const next = { ...d };
    if (tagIds.length) next.tagIds = tagIds;
    else delete next.tagIds;
    return next;
  });
  persistTags(tags);
  persistSavedDomains(domains);
  return { tags, domains };
}

export function toggleDomainTag(domain: string, tagId: string): SavedDomainRecord[] {
  const d = normalizeDomain(domain);
  const next = loadSavedDomains().map((x) => {
    if (x.domain !== d) return x;
    const current = x.tagIds || [];
    const has = current.includes(tagId);
    if (!has && current.length >= MAX_TAGS_PER_DOMAIN) return x;
    const tagIds = has ? current.filter((t) => t !== tagId) : [...current, tagId];
    const row = { ...x };
    if (tagIds.length) row.tagIds = tagIds;
    else delete row.tagIds;
    return row;
  });
  persistSavedDomains(next);
  return next;
}

export function countWithTag(domains: SavedDomainRecord[], tagId: string): number {
  return domains.filter((d) => d.tagIds?.includes(tagId)).length;
}

export function filterByTag(
  domains: SavedDomainRecord[],
  filter: TagFilter
): SavedDomainRecord[] {
  if (filter === 'all') return domains;
  if (filter === 'untagged') return domains.filter((d) => !d.tagIds?.length);
  return domains.filter((d) => d.tagIds?.includes(filter));
}

export function createFolder(
  name: string,
  color: FolderColorId = 'ink'
): SavedFolder | null {
  const trimmed = name.trim().slice(0, 40);
  if (!trimmed) return null;
  const folders = loadFolders();
  if (folders.length >= MAX_FOLDERS) return null;
  const folder: SavedFolder = {
    id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: trimmed,
    color: color in FOLDER_COLORS ? color : 'sand',
    createdAt: Date.now(),
  };
  persistFolders([folder, ...folders]);
  return folder;
}

export function renameFolder(id: string, name: string): SavedFolder[] {
  const trimmed = name.trim().slice(0, 40);
  if (!trimmed) return loadFolders();
  const next = loadFolders().map((f) => (f.id === id ? { ...f, name: trimmed } : f));
  persistFolders(next);
  return next;
}

export function setFolderColor(id: string, color: FolderColorId): SavedFolder[] {
  const next = loadFolders().map((f) =>
    f.id === id ? { ...f, color: color in FOLDER_COLORS ? color : f.color } : f
  );
  persistFolders(next);
  return next;
}

/** Delete folder; domains move to Unfiled */
export function deleteFolder(id: string): { folders: SavedFolder[]; domains: SavedDomainRecord[] } {
  const folders = loadFolders().filter((f) => f.id !== id);
  const domains = loadSavedDomains().map((d) =>
    d.folderId === id ? { ...d, folderId: null } : d
  );
  persistFolders(folders);
  persistSavedDomains(domains);
  return { folders, domains };
}

export function filterDomains(
  domains: SavedDomainRecord[],
  filter: FolderFilter
): SavedDomainRecord[] {
  if (filter === 'all') return domains;
  if (filter === 'unfiled') return domains.filter((d) => !d.folderId);
  return domains.filter((d) => d.folderId === filter);
}

export function countInFolder(
  domains: SavedDomainRecord[],
  filter: FolderFilter
): number {
  return filterDomains(domains, filter).length;
}

/**
 * @deprecated Prefer `@/lib/savedDomainsExport` for branded multi-format export.
 * Kept for any callers that still expect a simple CSV string.
 */
export function exportDomainsCsv(
  domains: SavedDomainRecord[],
  folders: SavedFolder[]
): string {
  // Lazy require-style import avoided — re-implement thin branded CSV header
  // via dynamic path would cycle; keep lightweight CSV here.
  const nameById = new Map(folders.map((f) => [f.id, f.name]));
  const header = 'domain,folder,saved_at,source_brand,source_url';
  const brand = 'DomainDiscovery';
  const site = 'https://www.domainsdiscovery.com';
  const rows = domains.map((d) => {
    const folder =
      d.folderId && nameById.has(d.folderId)
        ? nameById.get(d.folderId)!
        : 'Unfiled';
    const date = new Date(d.savedAt).toISOString();
    return `${escapeCsv(d.domain)},${escapeCsv(folder)},${escapeCsv(date)},${escapeCsv(brand)},${escapeCsv(site)}`;
  });
  const comments = [
    `# ${brand} — Saved Domains`,
    `# ${site}`,
    `# Generated: ${new Date().toISOString()}`,
  ];
  return [...comments, header, ...rows].join('\n');
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv'): void {
  if (!canUseStorage()) return;
  const bom = mime.includes('csv') ? '\uFEFF' : '';
  const blob = new Blob([bom + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
