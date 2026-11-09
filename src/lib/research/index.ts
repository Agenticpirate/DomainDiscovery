/**
 * Server-only registry of research reports. Loads the large pricing dataset,
 * so never import this from a client component.
 */
import aboutIndex from '@/data/tld-about/index.json';
import { getAllTldPriceDetails, getTldPriceDatasetMeta } from '@/lib/tldPriceData';
import {
  buildDomainPriceReport,
  cheapExtensionRows,
  CHEAP_MAX_PRICE,
  CHEAP_MIN_REGISTRARS,
  CHEAP_MIN_LIST_SIZE,
  type StudyRow,
} from '@/lib/research/domainPriceStudy';
import { buildTldTypeReport, type TldTypeRow } from '@/lib/research/tldTypeStudy';
import type { Report } from '@/lib/research/report';

let cachedRows: StudyRow[] | null = null;

export function getPriceStudyRows(): StudyRow[] {
  if (cachedRows) return cachedRows;
  cachedRows = getAllTldPriceDetails().map((d) => ({
    tld: d.tld,
    cheapestRegistration: { registrar: d.cheapestRegistration.registrar, value: d.cheapestRegistration.value },
    cheapestRenewal: { registrar: d.cheapestRenewal.registrar, value: d.cheapestRenewal.value },
    offers: d.registrars.map((o) => ({
      registrar: o.registrar,
      registration: o.registration?.value ?? null,
      renewal: o.renewal?.value ?? null,
      whoisPrivacy: o.whoisPrivacy?.value ?? null,
    })),
  }));
  return cachedRows;
}

export function getPriceDataDate(): string {
  return getTldPriceDatasetMeta().generatedAt.slice(0, 10);
}

export function getCheapExtensions(): StudyRow[] {
  return cheapExtensionRows(getPriceStudyRows(), CHEAP_MAX_PRICE, CHEAP_MIN_REGISTRARS);
}

/** The list page only exists while it has enough rows; callers redirect to the parent otherwise. */
export function cheapListIsLargeEnough(): boolean {
  return getCheapExtensions().length >= CHEAP_MIN_LIST_SIZE;
}

export function getReports(): Report[] {
  return [getReport('domain-prices'), getReport('tld-types')].filter((r): r is Report => r !== null);
}

export function getReport(slug: string): Report | null {
  if (slug === 'domain-prices') return buildDomainPriceReport(getPriceStudyRows(), getPriceDataDate());
  if (slug === 'tld-types') {
    const rows = (aboutIndex as { extensions: TldTypeRow[] }).extensions;
    return buildTldTypeReport(rows, String(aboutIndex.generatedAt).slice(0, 10));
  }
  return null;
}
