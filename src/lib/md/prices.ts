/**
 * Registrar price tables rendered as Markdown. Shared by the /tools/compare renderer,
 * llms.txt and llms-full.txt, so the numbers come from one place.
 */
import priceData from '@/data/tld-price-comparison.json';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

export type PriceCell = { value?: number | null; display?: string | null; hasPromo?: boolean };
type RegistrarRow = {
  registrar?: string;
  registration?: PriceCell;
  renewal?: PriceCell;
  transfer?: PriceCell;
  whoisPrivacy?: PriceCell;
};
type TldPriceRow = {
  tld: string;
  registrarCount?: number;
  cheapestRegistration?: { registrar?: string; price?: string; value?: number };
  cheapestRenewal?: { registrar?: string; price?: string; value?: number };
  cheapestTransfer?: { registrar?: string; price?: string; value?: number };
  pricingSummary?: Record<string, { registration?: number | null; renewal?: number | null }>;
  registrars?: RegistrarRow[];
};

export type PriceFile = {
  generatedAt?: string;
  scrapedAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  extensionCount?: number;
  extensions?: TldPriceRow[];
};

const HIGHLIGHT_TLDS = ['.com', '.ai', '.io', '.org', '.net', '.dev', '.app', '.co', '.us', '.uk'];
const HIGHLIGHT_REGISTRARS = [
  'Spaceship',
  'Cloudflare',
  'Porkbun',
  'Namecheap',
  'GoDaddy',
  'Sav',
  'Name.com',
  'Dynadot',
];

export function loadPriceFile(): PriceFile | null {
  return (priceData as PriceFile) ?? null;
}

function fmtPrice(cell?: PriceCell | null): string {
  if (!cell) return '—';
  if (cell.display) return cell.display + (cell.hasPromo ? '*' : '');
  if (typeof cell.value === 'number') return `$${cell.value.toFixed(2)}${cell.hasPromo ? '*' : ''}`;
  return '—';
}

function privacyLabel(cell?: PriceCell | null): string {
  if (!cell || cell.value == null) return 'Varies / restricted';
  if (cell.value === 0) return 'Free / $0';
  return cell.display || `$${cell.value}`;
}

function getTld(data: PriceFile | null, tld: string): TldPriceRow | undefined {
  return data?.extensions?.find((e) => e.tld === tld);
}

function registrarMap(row?: TldPriceRow): Map<string, RegistrarRow> {
  const m = new Map<string, RegistrarRow>();
  for (const r of row?.registrars || []) {
    if (r.registrar) m.set(r.registrar, r);
  }
  return m;
}

export function pricingSection(data: PriceFile | null): string[] {
  const base = getSiteBaseUrl();
  const asOf = data?.scrapedAt || data?.generatedAt || 'unknown';
  const source = data?.sourceName || 'DomainDiscovery price comparison dataset';
  const lines: string[] = [
    `## Registrar pricing transparency (research signals)`,
    ``,
    `*Dataset last verified in product data: ${asOf}*`,
    `*Source label: ${source}${data?.sourceUrl ? ` (${data.sourceUrl})` : ''}*`,
    `*Coverage: ${data?.extensionCount ?? 'n/a'} extensions in the comparison file.*`,
    `*These are research signals for standard-style registrations — not a live cart quote. Promo first-year rates often differ from renewals. Premium/aftermarket names differ. Always confirm at registrar checkout.*`,
    `*Interactive UI: ${base}/tools/compare*`,
    ``,
  ];

  // Per-TLD cheapest + selected registrar grid for highlight TLDs
  for (const tld of HIGHLIGHT_TLDS) {
    const row = getTld(data, tld);
    if (!row) continue;
    const map = registrarMap(row);
    lines.push(`### ${tld}`);
    lines.push(``);
    if (row.cheapestRegistration) {
      lines.push(
        `- **Cheapest listed registration:** ${row.cheapestRegistration.price ?? '—'} (${row.cheapestRegistration.registrar ?? '—'})`
      );
    }
    if (row.cheapestRenewal) {
      lines.push(
        `- **Cheapest listed renewal:** ${row.cheapestRenewal.price ?? '—'} (${row.cheapestRenewal.registrar ?? '—'})`
      );
    }
    if (row.cheapestTransfer) {
      lines.push(
        `- **Cheapest listed transfer:** ${row.cheapestTransfer.price ?? '—'} (${row.cheapestTransfer.registrar ?? '—'})`
      );
    }
    const avg = row.pricingSummary?.['Average Registrar Prices'];
    if (avg) {
      lines.push(
        `- **Average (dataset):** registration ${avg.registration != null ? `$${avg.registration}` : '—'} · renewal ${avg.renewal != null ? `$${avg.renewal}` : '—'}`
      );
    }
    lines.push(`- **Registrars compared for this TLD:** ${row.registrarCount ?? '—'}`);
    lines.push(``);
    lines.push(`| Registrar | Registration | Renewal | Transfer | WHOIS privacy |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
    for (const name of HIGHLIGHT_REGISTRARS) {
      const r = map.get(name);
      if (!r) continue;
      lines.push(
        `| ${name} | ${fmtPrice(r.registration)} | ${fmtPrice(r.renewal)} | ${fmtPrice(r.transfer)} | ${privacyLabel(r.whoisPrivacy)} |`
      );
    }
    lines.push(``);
    lines.push(`\\* Promo / sale-style first-year rates may apply in the dataset.`);
    lines.push(``);
  }

  // Compact master table of cheapest across highlights
  lines.push(`### Quick reference — cheapest listed signals (highlight TLDs)`);
  lines.push(``);
  lines.push(`| TLD | Cheapest registration | Cheapest renewal |`);
  lines.push(`| :--- | :--- | :--- |`);
  for (const tld of HIGHLIGHT_TLDS) {
    const row = getTld(data, tld);
    if (!row) continue;
    const cr = row.cheapestRegistration;
    const cn = row.cheapestRenewal;
    lines.push(
      `| ${tld} | ${cr?.price ?? '—'} (${cr?.registrar ?? '—'}) | ${cn?.price ?? '—'} (${cn?.registrar ?? '—'}) |`
    );
  }
  lines.push(``);

  return lines;
}

export function tldCatalogSection(data: PriceFile | null): string[] {
  const exts = data?.extensions || [];
  if (!exts.length) return [];
  // Top by registrar coverage then alpha — cap for token budget
  const sorted = [...exts]
    .filter((e) => e.tld && e.tld.startsWith('.'))
    .sort((a, b) => (b.registrarCount || 0) - (a.registrarCount || 0));
  const top = sorted.slice(0, 120);
  const lines: string[] = [
    `## TLD catalog snapshot (top ${top.length} by registrar coverage in dataset)`,
    ``,
    `*Full interactive browser: domain-extensions page. Count in file: ${data?.extensionCount ?? exts.length}.*`,
    ``,
    `| TLD | Registrars | Cheapest reg | Cheapest renew |`,
    `| :--- | ---: | :--- | :--- |`,
  ];
  for (const e of top) {
    lines.push(
      `| ${e.tld} | ${e.registrarCount ?? '—'} | ${e.cheapestRegistration?.price ?? '—'} | ${e.cheapestRenewal?.price ?? '—'} |`
    );
  }
  lines.push(``);
  return lines;
}
