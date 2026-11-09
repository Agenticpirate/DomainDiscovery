import {
  MIN_SAMPLE,
  formatInt,
  percent,
  type Report,
  type ReportFinding,
  type ReportTable,
} from '@/lib/research/report';

export type TldTypeRow = { tld: string; type: string; primaryCategory?: string | null };

export const TLD_TYPE_PATH = '/research/tld-types';

const TYPE_LABELS: Record<string, string> = {
  gTLD: 'Generic (gTLD)',
  ccTLD: 'Country-code (ccTLD)',
  sTLD: 'Sponsored (sTLD)',
  infrastructure: 'Infrastructure',
  other: 'Other',
};

export type TldTypeStudy = {
  total: number;
  types: { type: string; label: string; count: number }[];
  categories: { category: string; count: number }[];
  findings: ReportFinding[];
};

function countBy<T>(items: T[], key: (item: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export function computeTldTypeStudy(rows: TldTypeRow[]): TldTypeStudy {
  // One entry per extension, whatever the case or leading dot.
  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    const key = r.tld.toLowerCase().replace(/^\./, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const total = unique.length;

  const types = Array.from(countBy(unique, (r) => r.type || 'other').entries())
    .map(([type, count]) => ({ type, label: TYPE_LABELS[type] ?? type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));

  const categories = Array.from(countBy(unique.filter((r) => r.primaryCategory), (r) => r.primaryCategory as string).entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  const findings: ReportFinding[] = [];
  const count = (t: string) => types.find((x) => x.type === t)?.count ?? 0;

  if (total >= MIN_SAMPLE) {
    const g = count('gTLD');
    findings.push({
      id: 'gtld-share',
      text: `${formatInt(g)} of ${formatInt(total)} extensions in the IANA Root Zone Database (${percent(g, total)}%) are generic top-level domains (gTLDs).`,
    });
    const cc = count('ccTLD');
    if (cc > 0) {
      findings.push({
        id: 'cctld-count',
        text: `${formatInt(cc)} of ${formatInt(total)} extensions (${percent(cc, total)}%) are country-code top-level domains (ccTLDs).`,
      });
    }
    const other = total - g - cc;
    if (other > 0) {
      findings.push({
        id: 'other-types',
        text: `${formatInt(other)} of ${formatInt(total)} extensions (${percent(other, total)}%) are sponsored, infrastructure or other types.`,
      });
    }
  }

  const categorised = categories.reduce((n, c) => n + c.count, 0);
  if (categorised >= MIN_SAMPLE && categories.length) {
    const top = categories[0];
    findings.push({
      id: 'top-category',
      text: `"${top.category}" is the most common category: ${formatInt(top.count)} of ${formatInt(categorised)} categorised extensions (${percent(top.count, categorised)}%). Categories are our own labels, not IANA's.`,
    });
  }

  return { total, types, categories, findings };
}

export function buildTldTypeReport(rows: TldTypeRow[], generatedAt: string): Report {
  const study = computeTldTypeStudy(rows);
  const year = new Date(`${generatedAt}T00:00:00Z`).getUTCFullYear();
  const lead = study.findings[0]?.text ?? '';

  const tables: ReportTable[] = [
    {
      id: 'by-type',
      caption: 'Extensions by type',
      headers: ['Type', 'Extensions', `Share of ${formatInt(study.total)}`],
      rows: study.types.map((t) => [t.label, formatInt(t.count), `${percent(t.count, study.total)}%`]),
    },
    {
      id: 'by-category',
      caption: 'Extensions by primary category (DomainDiscovery label)',
      headers: ['Category', 'Extensions'],
      rows: study.categories.map((c) => [c.category, formatInt(c.count)]),
    },
  ];

  const faq = [] as Report['faq'];
  const find = (id: string) => study.findings.find((f) => f.id === id)?.text;
  const g = find('gtld-share');
  const cc = find('cctld-count');
  if (g) faq.push({ id: 'faq-gtld', question: 'How many generic top-level domains (gTLDs) are there?', answer: g });
  if (cc) faq.push({ id: 'faq-cctld', question: 'How many country-code domains (ccTLDs) are there?', answer: cc });

  return {
    slug: 'tld-types',
    path: TLD_TYPE_PATH,
    title: `Domain Extension Types ${year}: ${formatInt(study.total)} TLDs by Type`,
    h1: `Domain extension types ${year}: gTLD vs ccTLD`,
    description: `${formatInt(study.total)} domain extensions grouped by type from the IANA Root Zone Database. ${lead}`,
    summary: `${formatInt(study.total)} extensions by type. ${lead}`,
    intro: `Every extension in the IANA Root Zone Database that we hold an about page for, counted by type.`,
    updated: generatedAt,
    datasetName: `DomainDiscovery TLD encyclopedia (${year})`,
    variables: ['Extension type (gTLD, ccTLD, sTLD, infrastructure, other)', 'Primary category'],
    technique: 'Extension types are copied from the IANA Root Zone Database. Categories are assigned by DomainDiscovery.',
    findings: study.findings,
    tables,
    methodology: [
      `Source: IANA Root Zone Database, collected ${generatedAt}.`,
      `${formatInt(study.total)} extensions are included, one per extension.`,
      'Type comes from IANA. Primary category is a DomainDiscovery label and is not part of the IANA data.',
      `A finding is published only when at least ${MIN_SAMPLE} rows are behind it.`,
      'Percentages are rounded to the nearest whole number.',
      'No field in this dataset is entered by visitors.',
    ],
    faq,
    related: [
      { href: '/blog/tlds', label: 'TLD encyclopedia' },
      { href: '/domain-extensions', label: 'Browse all domain extensions' },
      { href: '/research/domain-prices', label: 'Domain extension price statistics' },
    ],
  };
}
