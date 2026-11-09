import {
  MIN_SAMPLE,
  formatInt,
  formatUsd,
  median,
  percent,
  type Report,
  type ReportFinding,
  type ReportTable,
} from '@/lib/research/report';

/** Minimal row shape the study needs, so tests can pass plain objects. */
export type StudyOffer = {
  registrar: string;
  registration: number | null;
  renewal: number | null;
  whoisPrivacy: number | null;
};

export type StudyRow = {
  tld: string;
  cheapestRegistration: { registrar: string | null; value: number | null };
  cheapestRenewal: { registrar: string | null; value: number | null };
  offers: StudyOffer[];
};

export type PriceBand = { id: string; label: string; min: number; max: number };

/** Half-open bands [min, max): no overlap, no gaps. */
export const REGISTRATION_BANDS: PriceBand[] = [
  { id: 'under-5', label: 'Under $5', min: 0, max: 5 },
  { id: '5-10', label: '$5 to under $10', min: 5, max: 10 },
  { id: '10-20', label: '$10 to under $20', min: 10, max: 20 },
  { id: '20-50', label: '$20 to under $50', min: 20, max: 50 },
  { id: '50-plus', label: '$50 or more', min: 50, max: Number.POSITIVE_INFINITY },
];

export const COVERAGE_BANDS: PriceBand[] = [
  { id: 'one', label: '1 registrar', min: 1, max: 2 },
  { id: '2-4', label: '2 to 4 registrars', min: 2, max: 5 },
  { id: '5-9', label: '5 to 9 registrars', min: 5, max: 10 },
  { id: '10-19', label: '10 to 19 registrars', min: 10, max: 20 },
  { id: '20-plus', label: '20 or more registrars', min: 20, max: Number.POSITIVE_INFINITY },
];

/** A gap smaller than this share of the comparison value is reported as "about the same". */
export const SAME_TOLERANCE = 0.05;
export const RENEWAL_MARKUP_FACTOR = 1.5;
export const PRICE_UNDER_USD = 10;

export const PRICE_STUDY_PATH = '/research/domain-prices';

export type DomainPriceStudy = {
  tldCount: number;
  pricedTldCount: number;
  offerCount: number;
  medianCheapestRegistration: number | null;
  registrationBands: { band: PriceBand; count: number }[];
  coverageBands: { band: PriceBand; count: number }[];
  findings: ReportFinding[];
  topRegistrars: { registrar: string; cheapestFor: number; listed: number }[];
};

function pricedOffers(row: StudyRow): StudyOffer[] {
  return row.offers.filter((o) => o.registration != null);
}

function inBand(value: number, band: PriceBand): boolean {
  return value >= band.min && value < band.max;
}

/** Plain-language comparison that flips with the data. */
export function compareValues(a: number, b: number): 'lower than' | 'higher than' | 'about the same as' {
  if (b === 0) return a === 0 ? 'about the same as' : 'higher than';
  if (Math.abs(a - b) / b < SAME_TOLERANCE) return 'about the same as';
  return a < b ? 'lower than' : 'higher than';
}

export function computeDomainPriceStudy(rows: StudyRow[]): DomainPriceStudy {
  const priced = rows.filter((r) => r.cheapestRegistration.value != null);
  const cheapest = priced.map((r) => r.cheapestRegistration.value as number);
  const medianCheapest = median(cheapest);
  const offerCount = rows.reduce((n, r) => n + pricedOffers(r).length, 0);

  const registrationBands = REGISTRATION_BANDS.map((band) => ({
    band,
    count: cheapest.filter((v) => inBand(v, band)).length,
  }));
  const coverageBands = COVERAGE_BANDS.map((band) => ({
    band,
    count: priced.filter((r) => inBand(pricedOffers(r).length, band)).length,
  }));

  // Registrars: how often each is listed as cheapest, next to how many TLDs it lists.
  const listed = new Map<string, number>();
  for (const r of rows) for (const o of pricedOffers(r)) listed.set(o.registrar, (listed.get(o.registrar) ?? 0) + 1);
  const cheapestFor = new Map<string, number>();
  for (const r of priced) {
    const name = r.cheapestRegistration.registrar;
    if (name) cheapestFor.set(name, (cheapestFor.get(name) ?? 0) + 1);
  }
  const topRegistrars = Array.from(cheapestFor.entries())
    .map(([registrar, count]) => ({ registrar, cheapestFor: count, listed: listed.get(registrar) ?? 0 }))
    .sort((a, b) => b.cheapestFor - a.cheapestFor || a.registrar.localeCompare(b.registrar))
    .slice(0, 8);

  const findings: ReportFinding[] = [];

  // 1. Share of extensions under $10
  if (priced.length >= MIN_SAMPLE) {
    const under = cheapest.filter((v) => v < PRICE_UNDER_USD).length;
    findings.push({
      id: 'under-10',
      text: `${formatInt(under)} of ${formatInt(priced.length)} domain extensions (${percent(under, priced.length)}%) have a lowest listed registration price under $${PRICE_UNDER_USD}.`,
    });
  }

  // 2. Median of the lowest listed price
  if (priced.length >= MIN_SAMPLE && medianCheapest != null) {
    findings.push({
      id: 'median-cheapest',
      text: `The median lowest listed registration price across ${formatInt(priced.length)} domain extensions is ${formatUsd(medianCheapest)}.`,
    });
  }

  // 3. .com against the median (the wording flips with the data)
  const com = priced.find((r) => r.tld === '.com');
  if (com && medianCheapest != null && priced.length >= MIN_SAMPLE) {
    const comPrice = com.cheapestRegistration.value as number;
    const rel = compareValues(comPrice, medianCheapest);
    findings.push({
      id: 'com-vs-median',
      text: `The lowest listed .com registration price (${formatUsd(comPrice)}) is ${rel} the median across all extensions (${formatUsd(medianCheapest)}).`,
    });
  }

  // 4. Renewal markup
  const both = priced.filter((r) => r.cheapestRenewal.value != null);
  if (both.length >= MIN_SAMPLE) {
    const marked = both.filter(
      (r) => (r.cheapestRenewal.value as number) > (r.cheapestRegistration.value as number) * RENEWAL_MARKUP_FACTOR
    ).length;
    findings.push({
      id: 'renewal-markup',
      text: `${formatInt(marked)} of ${formatInt(both.length)} extensions with both prices listed (${percent(marked, both.length)}%) have a lowest renewal price more than ${RENEWAL_MARKUP_FACTOR} times their lowest registration price.`,
    });
  }

  // 5. Registrar most often listed as cheapest, with its coverage
  if (priced.length >= MIN_SAMPLE && topRegistrars.length) {
    const top = topRegistrars[0];
    findings.push({
      id: 'cheapest-registrar',
      text: `${top.registrar} is listed as the lowest-priced registrar for ${formatInt(top.cheapestFor)} of ${formatInt(priced.length)} extensions (${percent(top.cheapestFor, priced.length)}%), and lists prices for ${formatInt(top.listed)} extensions in total. Coverage differs by registrar, so this is not a ranking of overall value.`,
    });
  }

  // 6. Free WHOIS privacy, counted per registrar offer
  const privacyKnown = rows.flatMap((r) => r.offers).filter((o) => o.whoisPrivacy != null);
  if (priced.length >= MIN_SAMPLE && privacyKnown.length >= MIN_SAMPLE) {
    const free = privacyKnown.filter((o) => o.whoisPrivacy === 0).length;
    const share = percent(free, privacyKnown.length);
    const lead = share >= 55 ? 'most' : share <= 45 ? 'fewer than half of' : 'about half of';
    findings.push({
      id: 'free-privacy',
      text: `${formatInt(free)} of ${formatInt(privacyKnown.length)} registrar offers with a listed WHOIS privacy price (${share}%) include it for $0, so ${lead} offers include free privacy. This counts registrar offers, not extensions.`,
    });
  }

  // 7. Thin comparisons
  if (priced.length >= MIN_SAMPLE) {
    const single = priced.filter((r) => pricedOffers(r).length === 1).length;
    findings.push({
      id: 'single-registrar',
      text: `${formatInt(single)} of ${formatInt(priced.length)} extensions (${percent(single, priced.length)}%) have a price from only one registrar, so there is nothing to compare them against.`,
    });
  }

  return {
    tldCount: rows.length,
    pricedTldCount: priced.length,
    offerCount,
    medianCheapestRegistration: medianCheapest,
    registrationBands,
    coverageBands,
    findings,
    topRegistrars,
  };
}

/** Rows for the list page: priced by at least `minRegistrars` registrars, under `maxPrice`. */
export function cheapExtensionRows(rows: StudyRow[], maxPrice: number, minRegistrars: number): StudyRow[] {
  const seen = new Set<string>();
  return rows
    .filter((r) => {
      const v = r.cheapestRegistration.value;
      if (v == null || v >= maxPrice) return false;
      if (pricedOffers(r).length < minRegistrars) return false;
      // Same extension listed twice (case or leading dot differences) counts once.
      const key = r.tld.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        (a.cheapestRegistration.value as number) - (b.cheapestRegistration.value as number) ||
        pricedOffers(b).length - pricedOffers(a).length ||
        a.tld.localeCompare(b.tld)
    );
}

export const CHEAP_MAX_PRICE = 2;
export const CHEAP_MIN_REGISTRARS = 3;
export const CHEAP_MIN_LIST_SIZE = 20;

export function buildDomainPriceReport(rows: StudyRow[], generatedAt: string): Report {
  const study = computeDomainPriceStudy(rows);
  const year = new Date(`${generatedAt}T00:00:00Z`).getUTCFullYear();

  const tables: ReportTable[] = [
    {
      id: 'by-price',
      caption: 'Extensions by lowest listed registration price',
      headers: ['Price band', 'Extensions', `Share of ${formatInt(study.pricedTldCount)}`],
      rows: study.registrationBands.map(({ band, count }) => [
        band.label,
        formatInt(count),
        `${percent(count, study.pricedTldCount)}%`,
      ]),
    },
    {
      id: 'by-coverage',
      caption: 'Extensions by number of registrars with a listed price',
      headers: ['Coverage', 'Extensions', `Share of ${formatInt(study.pricedTldCount)}`],
      rows: study.coverageBands.map(({ band, count }) => [
        band.label,
        formatInt(count),
        `${percent(count, study.pricedTldCount)}%`,
      ]),
    },
    {
      id: 'by-registrar',
      caption: 'Registrars most often listed as lowest-priced',
      headers: ['Registrar', 'Lowest-priced for', 'Extensions it lists'],
      rows: study.topRegistrars.map((r) => [r.registrar, formatInt(r.cheapestFor), formatInt(r.listed)]),
    },
  ];

  const faq = [] as Report['faq'];
  const find = (id: string) => study.findings.find((f) => f.id === id)?.text;
  const add = (id: string, question: string, source: string | undefined) => {
    if (source) faq.push({ id, question, answer: source });
  };
  add('faq-under-10', 'How many domain extensions cost under $10 to register?', find('under-10'));
  add('faq-median', 'What is the typical lowest price to register a domain extension?', find('median-cheapest'));
  add('faq-renewal', 'Do domain renewals cost more than first-year registration?', find('renewal-markup'));
  add('faq-privacy', 'Is WHOIS privacy free at most registrars?', find('free-privacy'));

  return {
    slug: 'domain-prices',
    path: PRICE_STUDY_PATH,
    title: `Domain Extension Price Statistics ${year}: ${formatInt(study.pricedTldCount)} TLDs`,
    h1: `Domain extension price statistics ${year}`,
    description: `Registration price data for ${formatInt(study.pricedTldCount)} domain extensions across ${formatInt(study.offerCount)} registrar offers. ${study.findings[0]?.text ?? ''}`,
    summary: `${formatInt(study.pricedTldCount)} extensions, ${formatInt(study.offerCount)} registrar offers. ${study.findings[0]?.text ?? ''}`,
    intro: `Prices for ${formatInt(study.pricedTldCount)} domain extensions from ${formatInt(study.offerCount)} registrar offers, as collected in our price comparison dataset.`,
    updated: generatedAt,
    datasetName: `DomainDiscovery domain extension price comparison (${year})`,
    variables: [
      'Lowest listed registration price (USD)',
      'Lowest listed renewal price (USD)',
      'Registrars with a listed price per extension',
      'WHOIS privacy price per registrar offer (USD)',
    ],
    technique:
      'Prices collected from a public registrar price comparison source and stored as a static dataset. Each figure is counted from the full dataset, not a sample.',
    findings: study.findings,
    tables,
    methodology: [
      `Source: TLD-List registrar price comparison, collected ${generatedAt}. Prices are not live and can change at any time.`,
      'Prices are retail-style registration signals in USD. Promotional first-year rates, premium names, taxes and multi-year rules can differ at checkout.',
      `Extensions without any listed registration price are excluded. ${formatInt(study.pricedTldCount)} of ${formatInt(study.tldCount)} extensions are included.`,
      'Registrar counts use only offers that list a registration price.',
      'Price bands are half-open: a price of exactly $10.00 falls in the $10 to under $20 band.',
      `"About the same" means two values differ by less than ${Math.round(SAME_TOLERANCE * 100)}%.`,
      `A finding is published only when at least ${MIN_SAMPLE} rows are behind it.`,
      'Percentages are rounded to the nearest whole number, so a column can add up to 99% or 101%.',
      'No field in this dataset is entered by visitors.',
    ],
    faq,
    related: [
      { href: '/tools/compare', label: 'Compare registrar prices by extension' },
      { href: '/domain-extensions', label: 'Browse all domain extensions' },
      { href: '/research/tld-types', label: 'Domain extension types: gTLD vs ccTLD' },
    ],
  };
}
