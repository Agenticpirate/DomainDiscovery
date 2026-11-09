/** Markdown for the research hub, the research reports and the cheapest-extensions list. */
import { getCheapExtensions, getPriceDataDate, getReport, getReports } from '@/lib/research';
import { CHEAP_MAX_PRICE, CHEAP_MIN_LIST_SIZE, CHEAP_MIN_REGISTRARS } from '@/lib/research/domainPriceStudy';
import { formatInt, formatUsd, median, reportToMarkdown } from '@/lib/research/report';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';
import { heading, listItem, page, table } from '../format';
import type { MdDoc, MdRouteDef } from '../types';

/** Hub title and description match the metadata of src/app/research/page.tsx. */
const RESEARCH_HUB = {
  title: 'Domain Name Research & Statistics | DomainDiscovery',
  description:
    'Original statistics from the DomainDiscovery datasets: domain extension prices, renewal markups, WHOIS privacy and extension types. Every number links to its method.',
};

function renderResearchHub(): MdDoc {
  const reports = getReports();
  const body = [
    'Statistics counted from the datasets behind DomainDiscovery. Each report states its source, its denominator and when the data was collected.',
    heading(2, 'Reports'),
    reports.map((r) => listItem(r.h1, r.path, `${r.summary} (data as of ${r.updated})`)).join('\n'),
  ];
  return {
    ...RESEARCH_HUB,
    path: '/research',
    markdown: page({
      title: 'Domain name research',
      summary: RESEARCH_HUB.description,
      path: '/research',
      body: body.join('\n\n'),
      related: [
        { text: 'Compare registrar prices', href: '/tools/compare' },
        { text: 'Browse all domain extensions', href: '/domain-extensions' },
      ],
    }),
  };
}

function renderReport(slug: string): MdDoc | null {
  const report = getReport(slug);
  if (!report) return null;
  return {
    title: report.title,
    description: report.description,
    path: report.path,
    lastModified: report.updated,
    // Same document the old /research/<slug>.md route served.
    markdown: reportToMarkdown(report, getSiteBaseUrl()),
  };
}

/** Mirrors src/app/cheapest-domain-extensions/page.tsx, including its minimum-size rule. */
function cheapestCopy() {
  const rows = getCheapExtensions();
  const updated = getPriceDataDate();
  const year = new Date(`${updated}T00:00:00Z`).getUTCFullYear();
  const n = rows.length;
  const title = `${formatInt(n)} Cheapest Domain Extensions Under $${CHEAP_MAX_PRICE} (${year})`;
  const prices = rows.map((r) => r.cheapestRegistration.value as number);
  const top3 = rows.slice(0, 3).map((r) => `${r.tld} (${formatUsd(r.cheapestRegistration.value as number)})`);
  const summary = `${formatInt(n)} domain extensions have a lowest listed registration price under $${CHEAP_MAX_PRICE} at ${CHEAP_MIN_REGISTRARS} or more registrars, ranked by that price. The median is ${formatUsd(median(prices) ?? 0)} and the three cheapest are ${top3.join(', ')}. Prices checked ${updated}.`;
  return { rows, updated, title, summary };
}

function renderCheapest(): MdDoc | null {
  const { rows, updated, title, summary } = cheapestCopy();
  // The HTML page redirects below the minimum size; there is nothing to mirror then.
  if (rows.length < CHEAP_MIN_LIST_SIZE) return null;
  const path = '/cheapest-domain-extensions';
  const body = [
    table(
      ['#', 'Extension', 'Lowest registration', 'Registrar', 'Lowest renewal', 'Registrars'],
      rows.map((r, i) => [
        String(i + 1),
        r.tld,
        formatUsd(r.cheapestRegistration.value as number),
        r.cheapestRegistration.registrar ?? 'n/a',
        r.cheapestRenewal.value != null ? formatUsd(r.cheapestRenewal.value) : 'n/a',
        String(r.offers.filter((o) => o.registration != null).length),
      ])
    ),
    `How this list is built: extensions with a listed registration price under $${CHEAP_MAX_PRICE} and prices from at least ${CHEAP_MIN_REGISTRARS} registrars, ranked by lowest registration price, then by number of registrars. Prices are from the ${updated} dataset and can change. Renewal is often higher than the first-year price, so check it before you buy.`,
  ];
  return {
    title,
    description: summary,
    path,
    lastModified: updated,
    markdown: page({
      title,
      summary,
      path,
      updated,
      body: body.join('\n\n'),
      related: [
        { text: 'Domain extension price statistics', href: '/research/domain-prices' },
        { text: 'Compare registrar prices', href: '/tools/compare' },
        { text: 'Browse all domain extensions', href: '/domain-extensions' },
      ],
    }),
  };
}

export const RESEARCH_ROUTES: MdRouteDef[] = [
  {
    pattern: '/research',
    group: 'core',
    render: renderResearchHub,
    list: () => [{ path: '/research', ...RESEARCH_HUB }],
  },
  // One static route per report page in src/app/research/<slug>/page.tsx.
  ...['domain-prices', 'tld-types'].map(
    (slug): MdRouteDef => ({
      pattern: `/research/${slug}`,
      group: 'core',
      render: () => renderReport(slug),
      list: () =>
        getReports()
          .filter((r) => r.slug === slug)
          .map((r) => ({ path: r.path, title: r.title, description: r.description })),
    })
  ),
  {
    pattern: '/cheapest-domain-extensions',
    group: 'core',
    render: renderCheapest,
    list: () => {
      const { rows, title, summary } = cheapestCopy();
      return rows.length < CHEAP_MIN_LIST_SIZE
        ? []
        : [{ path: '/cheapest-domain-extensions', title, description: summary }];
    },
  },
];
