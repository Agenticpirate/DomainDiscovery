/** sessionStorage key for search → catalog keyword handoff */
export const CATALOG_SEED_KEY = 'dd_catalog_keyword';

/**
 * Normalize a handoff keyword for the extensions catalog.
 * "Acme Co" → "acmeco", "acme.com" → "acme", ".ai" stays filter-style ".ai"
 */
export function normalizeCatalogKeyword(raw: string): string {
  let q = (raw || '').trim();
  if (!q) return '';
  // Keep TLD-filter mode (starts with ".")
  if (q.startsWith('.')) {
    return q.toLowerCase().replace(/\s+/g, '');
  }
  q = q.toLowerCase().replace(/\s+/g, '');
  // Strip scheme / path if a full URL was pasted
  q = q.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  // If it looks like name.tld, keep the label only (so we check name.com, name.io, …)
  const dot = q.lastIndexOf('.');
  if (dot > 0) {
    const label = q.slice(0, dot);
    const tld = q.slice(dot);
    if (label && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(label) && /^\.[a-z0-9.-]+$/i.test(tld)) {
      return label;
    }
  }
  return q;
}

export function readCatalogSeed(): string {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeCatalogKeyword(sessionStorage.getItem(CATALOG_SEED_KEY) || '');
  } catch {
    return '';
  }
}

export function writeCatalogSeed(keyword: string): void {
  const clean = normalizeCatalogKeyword(keyword);
  if (typeof window === 'undefined') return;
  try {
    if (clean) sessionStorage.setItem(CATALOG_SEED_KEY, clean);
    else sessionStorage.removeItem(CATALOG_SEED_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearCatalogSeed(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CATALOG_SEED_KEY);
  } catch {
    /* ignore */
  }
}

/** Build /domain-extensions href that carries the search keyword */
export function extensionsCatalogHref(keyword: string): string {
  const clean = normalizeCatalogKeyword(keyword);
  return clean
    ? `/domain-extensions?q=${encodeURIComponent(clean)}`
    : '/domain-extensions';
}
