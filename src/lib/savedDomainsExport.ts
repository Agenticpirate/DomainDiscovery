/**
 * Branded export / copy helpers for local saved domains.
 * Open-source stack: native Blob + Clipboard API + jsPDF (MIT).
 * Every file includes DomainDiscovery brand + public URL.
 */

import type { SavedDomainRecord, SavedFolder, SavedTag } from '@/lib/savedDomainsStore';
import { SITE_BRAND, getSiteBaseUrl } from '@/lib/seoSiteFacts';

export type ExportFormat = 'txt' | 'csv' | 'json' | 'md' | 'pdf';
export type CopyFormat = 'plain' | 'csv' | 'md';

export type ExportScopeLabel = 'all' | 'visible' | 'folder';

const BRAND = {
  name: SITE_BRAND.name,
  url: () => getSiteBaseUrl() || `https://${SITE_BRAND.domain}`,
  tagline: SITE_BRAND.tagline,
};

function folderName(
  domain: SavedDomainRecord,
  folders: SavedFolder[]
): string {
  if (!domain.folderId) return 'Unfiled';
  return folders.find((f) => f.id === domain.folderId)?.name || 'Unfiled';
}

function tagNames(domain: SavedDomainRecord, tags: SavedTag[] = []): string[] {
  const ids = domain.tagIds || [];
  return ids
    .map((id) => tags.find((t) => t.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

function tagLabel(domain: SavedDomainRecord, tags: SavedTag[] = []): string {
  return tagNames(domain, tags).join('; ');
}

function stamp(): string {
  return new Date().toISOString();
}

function dateSlug(): string {
  return new Date().toISOString().split('T')[0];
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Shared header lines for text-like formats */
export function brandTextHeader(meta: {
  count: number;
  scope?: string;
}): string {
  const url = BRAND.url();
  const lines = [
    `${BRAND.name} — Saved Domains`,
    url,
    BRAND.tagline,
    `Generated: ${stamp()}`,
    `Domains: ${meta.count}${meta.scope ? ` · Scope: ${meta.scope}` : ''}`,
    'Source: local browser shortlist (not stored on DomainDiscovery servers)',
    'Re-check availability at a registrar before purchase.',
    '',
  ];
  return lines.join('\n');
}

export function buildTxt(
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  opts?: { includeFolders?: boolean; scope?: string; tags?: SavedTag[] }
): string {
  const includeFolders = opts?.includeFolders !== false;
  const header = brandTextHeader({ count: domains.length, scope: opts?.scope });
  const body = domains
    .map((d) => {
      if (!includeFolders) return d.domain;
      const f = folderName(d, folders);
      const tags = tagLabel(d, opts?.tags);
      const note = [f === 'Unfiled' ? '' : f, tags].filter(Boolean).join(' · ');
      return note ? `${d.domain}\t# ${note}` : d.domain;
    })
    .join('\n');
  const footer = [
    '',
    '—',
    `Exported from ${BRAND.name}`,
    BRAND.url(),
    'https://www.domainsdiscovery.com',
  ].join('\n');
  return `${header}${body}\n${footer}\n`;
}

export function buildCsv(
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  opts?: { scope?: string; tags?: SavedTag[] }
): string {
  const url = BRAND.url();
  // Comment rows (Excel/Sheets ignore lines starting with # when opening as text;
  // we also put brand columns on a metadata preamble as comments for humans)
  const comments = [
    `# ${BRAND.name} — Saved Domains`,
    `# Website: ${url}`,
    `# Tagline: ${BRAND.tagline}`,
    `# Generated: ${stamp()}`,
    `# Count: ${domains.length}${opts?.scope ? ` | Scope: ${opts.scope}` : ''}`,
    `# Note: Local shortlist backup. DomainDiscovery does not host your list.`,
    `# Always re-verify availability at registrar checkout.`,
  ];
  const header = 'domain,folder,categories,saved_at,source_brand,source_url';
  const rows = domains.map((d) => {
    const folder = folderName(d, folders);
    const date = new Date(d.savedAt).toISOString();
    return [
      escapeCsv(d.domain),
      escapeCsv(folder),
      escapeCsv(tagLabel(d, opts?.tags)),
      escapeCsv(date),
      escapeCsv(BRAND.name),
      escapeCsv(url),
    ].join(',');
  });
  return [...comments, header, ...rows, ''].join('\n');
}

export function buildJson(
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  opts?: { scope?: string; tags?: SavedTag[] }
): string {
  const url = BRAND.url();
  const nameById = new Map(folders.map((f) => [f.id, f.name]));
  const payload = {
    brand: {
      name: BRAND.name,
      url,
      tagline: BRAND.tagline,
      domain: SITE_BRAND.domain,
    },
    meta: {
      generatedAt: stamp(),
      count: domains.length,
      scope: opts?.scope || 'all',
      notice:
        'Local browser shortlist export. DomainDiscovery does not store this list on its servers. Re-check availability before purchase.',
      product: 'DomainDiscovery saved domains export',
    },
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color,
    })),
    categories: (opts?.tags || []).map((t) => ({
      id: t.id,
      name: t.name,
    })),
    domains: domains.map((d) => ({
      domain: d.domain,
      folder: d.folderId ? nameById.get(d.folderId) || null : null,
      folderId: d.folderId,
      categories: tagNames(d, opts?.tags),
      tagIds: d.tagIds || [],
      savedAt: new Date(d.savedAt).toISOString(),
      notes: d.notes || null,
    })),
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function buildMarkdown(
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  opts?: { scope?: string; tags?: SavedTag[] }
): string {
  const url = BRAND.url();
  const lines: string[] = [
    `# ${BRAND.name} — Saved Domains`,
    '',
    `> **${BRAND.tagline}**  `,
    `> [${url.replace(/^https?:\/\//, '')}](${url})`,
    '',
    `| | |`,
    `| --- | --- |`,
    `| Generated | ${stamp()} |`,
    `| Domains | ${domains.length} |`,
    `| Scope | ${opts?.scope || 'all'} |`,
    `| Storage | Local browser only |`,
    '',
    '---',
    '',
    '## Domains',
    '',
    '| # | Domain | Folder | Categories | Saved |',
    '| ---: | --- | --- | --- | --- |',
  ];

  domains.forEach((d, i) => {
    const categories = tagLabel(d, opts?.tags) || '—';
    lines.push(
      `| ${i + 1} | \`${d.domain}\` | ${folderName(d, folders)} | ${categories} | ${new Date(d.savedAt).toISOString().slice(0, 10)} |`
    );
  });

  lines.push(
    '',
    '---',
    '',
    '## Notes',
    '',
    '- This file is a backup of a **local** shortlist. Clearing browser data removes the in-app list.',
    '- DomainDiscovery is **not a registrar**. Complete purchase at a third-party registrar.',
    '- Availability can change — re-verify at checkout.',
    '',
    `Exported with ♥ from **[${BRAND.name}](${url})**  `,
    `Official site: ${url}`,
    ''
  );

  return lines.join('\n');
}

/** Plain list for clipboard — brand footer optional */
export function buildPlainList(
  domains: SavedDomainRecord[],
  opts?: { branded?: boolean }
): string {
  const list = domains.map((d) => d.domain).join('\n');
  if (opts?.branded === false) return list;
  return [
    list,
    '',
    `— ${BRAND.name}`,
    BRAND.url(),
  ].join('\n');
}

export function mimeFor(format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return 'text/csv;charset=utf-8';
    case 'json':
      return 'application/json;charset=utf-8';
    case 'md':
      return 'text/markdown;charset=utf-8';
    case 'pdf':
      return 'application/pdf';
    case 'txt':
    default:
      return 'text/plain;charset=utf-8';
  }
}

export function filenameFor(format: ExportFormat, scope?: string): string {
  const date = dateSlug();
  const scopePart = scope && scope !== 'all' ? `-${scope.replace(/[^a-z0-9]+/gi, '-').slice(0, 24)}` : '';
  return `DomainDiscovery-saved-domains${scopePart}-${date}.${format === 'md' ? 'md' : format}`;
}

export function downloadBlob(filename: string, blob: Blob): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime: string
): void {
  // UTF-8 BOM helps Excel open CSV correctly
  const bom = mime.includes('csv') ? '\uFEFF' : '';
  const blob = new Blob([bom + content], { type: mime });
  downloadBlob(filename, blob);
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function buildForFormat(
  format: Exclude<ExportFormat, 'pdf'>,
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  opts?: { scope?: string; tags?: SavedTag[] }
): string {
  switch (format) {
    case 'csv':
      return buildCsv(domains, folders, opts);
    case 'json':
      return buildJson(domains, folders, opts);
    case 'md':
      return buildMarkdown(domains, folders, opts);
    case 'txt':
    default:
      return buildTxt(domains, folders, opts);
  }
}

export function buildForCopy(
  format: CopyFormat,
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  tags: SavedTag[] = []
): string {
  switch (format) {
    case 'csv':
      return buildCsv(domains, folders, { scope: 'clipboard', tags });
    case 'md':
      return buildMarkdown(domains, folders, { scope: 'clipboard', tags });
    case 'plain':
    default:
      return buildPlainList(domains, { branded: true });
  }
}

/**
 * PDF via jsPDF (MIT, open source).
 * Dynamic import keeps the main bundle lean.
 */
export async function downloadPdf(
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  opts?: { scope?: string; tags?: SavedTag[] }
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const url = BRAND.url();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const drawFooter = () => {
    const page = doc.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `${BRAND.name} · ${url} · Page ${page}`,
      pageW / 2,
      pageH - 24,
      { align: 'center' }
    );
  };

  const ensureSpace = (need: number) => {
    if (y + need > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Brand header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 72, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(BRAND.name, margin, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Saved Domains · Local shortlist export', margin, 50);
  doc.setFontSize(9);
  doc.text(url, pageW - margin, 50, { align: 'right' });

  y = 96;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(BRAND.tagline, margin, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const meta = [
    `Generated: ${stamp()}`,
    `Domains: ${domains.length}${opts?.scope ? ` · Scope: ${opts.scope}` : ''}`,
    'Note: This list lived in the browser only. DomainDiscovery does not host your shortlist.',
    'Always re-check availability at a registrar before purchase.',
  ];
  meta.forEach((line) => {
    ensureSpace(14);
    doc.text(line, margin, y);
    y += 14;
  });

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('#', margin, y);
  doc.text('Domain', margin + 28, y);
  doc.text('Folder · categories', margin + 250, y);
  doc.text('Saved', margin + 430, y);
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageW - margin, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  domains.forEach((d, i) => {
    ensureSpace(16);
    const folder = folderName(d, folders);
    const categories = tagLabel(d, opts?.tags);
    const place = categories ? `${folder} · ${categories}` : folder;
    const date = new Date(d.savedAt).toISOString().slice(0, 10);
    doc.setTextColor(100, 116, 139);
    doc.text(String(i + 1), margin, y);
    doc.setTextColor(15, 23, 42);
    const domainLines = doc.splitTextToSize(d.domain, 210);
    doc.text(domainLines[0], margin + 28, y);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(place, 160)[0], margin + 250, y);
    doc.text(date, margin + 430, y);
    y += Math.max(14, domainLines.length * 12);
  });

  y += 20;
  ensureSpace(48);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Exported from ${BRAND.name}`, margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.textWithLink(url, margin, y, { url });
  y += 12;
  doc.setTextColor(100, 116, 139);
  doc.text('https://www.domainsdiscovery.com', margin, y);

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter();
  }

  const name = filenameFor('pdf', opts?.scope);
  doc.save(name);
}

export async function exportDomains(
  format: ExportFormat,
  domains: SavedDomainRecord[],
  folders: SavedFolder[],
  opts?: { scope?: string; tags?: SavedTag[] }
): Promise<void> {
  if (domains.length === 0) {
    throw new Error('Nothing to export');
  }
  if (format === 'pdf') {
    await downloadPdf(domains, folders, opts);
    return;
  }
  const content = buildForFormat(format, domains, folders, opts);
  downloadTextFile(filenameFor(format, opts?.scope), content, mimeFor(format));
}

export const EXPORT_FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  ext: string;
  hint: string;
}[] = [
  { id: 'txt', label: 'Text', ext: '.txt', hint: 'One domain per line' },
  { id: 'csv', label: 'CSV', ext: '.csv', hint: 'Sheets / Excel' },
  { id: 'json', label: 'JSON', ext: '.json', hint: 'Structured backup' },
  { id: 'md', label: 'Markdown', ext: '.md', hint: 'Notes & docs' },
  { id: 'pdf', label: 'PDF', ext: '.pdf', hint: 'Printable branded' },
];

export const COPY_FORMAT_OPTIONS: {
  id: CopyFormat;
  label: string;
  hint: string;
}[] = [
  { id: 'plain', label: 'Domain list', hint: 'One per line + brand' },
  { id: 'csv', label: 'CSV', hint: 'Paste into a spreadsheet' },
  { id: 'md', label: 'Markdown', hint: 'Paste into docs / Notion' },
];
