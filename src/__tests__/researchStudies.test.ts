import {
  CHEAP_MAX_PRICE,
  CHEAP_MIN_LIST_SIZE,
  CHEAP_MIN_REGISTRARS,
  COVERAGE_BANDS,
  REGISTRATION_BANDS,
  buildDomainPriceReport,
  cheapExtensionRows,
  compareValues,
  computeDomainPriceStudy,
  type StudyRow,
} from '@/lib/research/domainPriceStudy';
import { buildTldTypeReport, computeTldTypeStudy, type TldTypeRow } from '@/lib/research/tldTypeStudy';
import { MIN_SAMPLE, percent, reportToMarkdown } from '@/lib/research/report';

function row(tld: string, reg: number, ren: number | null, offerCount = 3, privacy: number | null = 0): StudyRow {
  return {
    tld,
    cheapestRegistration: { registrar: 'A', value: reg },
    cheapestRenewal: { registrar: 'A', value: ren },
    offers: Array.from({ length: offerCount }, (_, i) => ({
      registrar: `R${i}`,
      registration: reg + i,
      renewal: ren,
      whoisPrivacy: privacy,
    })),
  };
}

function rows(n: number, price: (i: number) => number, comPrice?: number): StudyRow[] {
  const list = Array.from({ length: n }, (_, i) => row(`.t${i}`, price(i), price(i) * 1.2));
  if (comPrice != null) list.push(row('.com', comPrice, comPrice));
  return list;
}

describe('domain price study', () => {
  const data = rows(100, (i) => 1 + i * 0.7, 10);
  const study = computeDomainPriceStudy(data);

  it('puts every priced extension in exactly one price band', () => {
    expect(study.registrationBands.reduce((n, b) => n + b.count, 0)).toBe(study.pricedTldCount);
  });

  it('puts every priced extension in exactly one coverage band', () => {
    expect(study.coverageBands.reduce((n, b) => n + b.count, 0)).toBe(study.pricedTldCount);
  });

  it('uses bands that do not overlap and leave no gaps', () => {
    for (const bands of [REGISTRATION_BANDS, COVERAGE_BANDS]) {
      for (let i = 1; i < bands.length; i++) expect(bands[i].min).toBe(bands[i - 1].max);
    }
  });

  it('counts a price exactly on a boundary in the higher band only', () => {
    const s = computeDomainPriceStudy([...rows(MIN_SAMPLE, () => 10), row('.x', 10, 10)]);
    const ten = s.registrationBands.find((b) => b.band.id === '10-20');
    const under = s.registrationBands.find((b) => b.band.id === '5-10');
    expect(ten?.count).toBe(MIN_SAMPLE + 1);
    expect(under?.count).toBe(0);
  });

  it('states count, denominator and percent in each finding', () => {
    const f = study.findings.find((x) => x.id === 'under-10');
    expect(f?.text).toMatch(/^\d[\d,]* of 101 domain extensions \(\d+%\)/);
  });

  it('flips the .com comparison with the data', () => {
    const cheapCom = computeDomainPriceStudy(rows(60, () => 20, 5)).findings.find((f) => f.id === 'com-vs-median');
    const dearCom = computeDomainPriceStudy(rows(60, () => 20, 40)).findings.find((f) => f.id === 'com-vs-median');
    const sameCom = computeDomainPriceStudy(rows(60, () => 20, 20.5)).findings.find((f) => f.id === 'com-vs-median');
    expect(cheapCom?.text).toContain('is lower than the median');
    expect(dearCom?.text).toContain('is higher than the median');
    expect(sameCom?.text).toContain('is about the same as the median');
  });

  it('treats small gaps as about the same', () => {
    expect(compareValues(10.2, 10)).toBe('about the same as');
    expect(compareValues(9, 10)).toBe('lower than');
    expect(compareValues(11, 10)).toBe('higher than');
  });

  it('produces no findings when the data is too thin', () => {
    const thin = computeDomainPriceStudy(rows(MIN_SAMPLE - 5, () => 5));
    expect(thin.findings).toHaveLength(0);
  });

  it('says renewal markup only counts rows with both prices', () => {
    const mixed = [...rows(25, () => 5), ...Array.from({ length: 30 }, (_, i) => row(`.n${i}`, 5, null))];
    const f = computeDomainPriceStudy(mixed).findings.find((x) => x.id === 'renewal-markup');
    expect(f?.text).toContain('of 25 extensions with both prices');
  });

  it('builds a report with unique anchors and a title within 60 characters', () => {
    const report = buildDomainPriceReport(data, '2026-07-28');
    const ids = [
      ...report.findings.map((f) => f.id),
      ...report.tables.map((t) => t.id),
      ...report.faq.map((q) => q.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
    expect(report.title.length).toBeLessThanOrEqual(60);
    expect(report.title).toContain('2026');
    expect(report.title).toContain('101');
  });

  it('writes Markdown containing every finding', () => {
    const report = buildDomainPriceReport(data, '2026-07-28');
    const md = reportToMarkdown(report, 'https://example.com');
    for (const f of report.findings) expect(md).toContain(f.text);
    expect(md).toContain('https://example.com/research/domain-prices#under-10');
  });
});

describe('cheap extension list', () => {
  it('keeps only rows under the price with enough registrars, sorted by price', () => {
    const data = [
      row('.a', 1.5, 3, CHEAP_MIN_REGISTRARS),
      row('.b', 0.9, 3, CHEAP_MIN_REGISTRARS),
      row('.thin', 0.5, 3, CHEAP_MIN_REGISTRARS - 1),
      row('.dear', CHEAP_MAX_PRICE, 3, 5),
      row('.A', 1.7, 3, 5),
    ];
    const list = cheapExtensionRows(data, CHEAP_MAX_PRICE, CHEAP_MIN_REGISTRARS);
    expect(list.map((r) => r.tld)).toEqual(['.b', '.a']);
  });

  it('meets the minimum list size on the real dataset', () => {
    // Loaded lazily: the pricing JSON is large.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const raw = require('@/data/tld-price-comparison.json') as {
      extensions: {
        tld: string;
        cheapestRegistration: { registrar: string | null; value: number | null };
        cheapestRenewal: { registrar: string | null; value: number | null };
        registrars: { registrar: string; registration?: { value: number | null }; renewal?: { value: number | null }; whoisPrivacy?: { value: number | null } }[];
      }[];
    };
    const real: StudyRow[] = raw.extensions.map((d) => ({
      tld: d.tld,
      cheapestRegistration: d.cheapestRegistration,
      cheapestRenewal: d.cheapestRenewal,
      offers: d.registrars.map((o) => ({
        registrar: o.registrar,
        registration: o.registration?.value ?? null,
        renewal: o.renewal?.value ?? null,
        whoisPrivacy: o.whoisPrivacy?.value ?? null,
      })),
    }));
    expect(cheapExtensionRows(real, CHEAP_MAX_PRICE, CHEAP_MIN_REGISTRARS).length).toBeGreaterThanOrEqual(
      CHEAP_MIN_LIST_SIZE
    );
    const study = computeDomainPriceStudy(real);
    expect(study.registrationBands.reduce((n, b) => n + b.count, 0)).toBe(study.pricedTldCount);
  });
});

describe('tld type study', () => {
  const data: TldTypeRow[] = [
    ...Array.from({ length: 30 }, (_, i) => ({ tld: `.g${i}`, type: 'gTLD', primaryCategory: 'brand' })),
    ...Array.from({ length: 10 }, (_, i) => ({ tld: `.c${i}`, type: 'ccTLD', primaryCategory: 'geo' })),
    { tld: '.G0', type: 'gTLD', primaryCategory: 'brand' },
  ];

  it('counts each extension once and shares add up', () => {
    const s = computeTldTypeStudy(data);
    expect(s.total).toBe(40);
    expect(s.types.reduce((n, t) => n + t.count, 0)).toBe(40);
    expect(percent(30, 40)).toBe(75);
  });

  it('produces no findings for thin data', () => {
    expect(computeTldTypeStudy(data.slice(0, 5)).findings).toHaveLength(0);
  });

  it('builds unique anchors and a title within 60 characters', () => {
    const report = buildTldTypeReport(data, '2026-07-22');
    const ids = [...report.findings, ...report.tables, ...report.faq].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(report.title.length).toBeLessThanOrEqual(60);
  });
});
