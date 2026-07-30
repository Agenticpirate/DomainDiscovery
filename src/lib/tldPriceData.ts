/**
 * Server / API pricing dataset access.
 * NEVER import this module from client components — it loads ~6MB of JSON.
 * Client code should import from `@/lib/tldPriceTypes` and receive slim props or API data.
 */

import priceData from '@/data/tld-price-comparison.json';
import {
  PRIORITY_TLDS,
  TOP_COMPARISON_REGISTRARS,
  type RegistrarOffer,
  type TldMatrixCell,
  type TldMatrixRow,
  type TldPriceDatasetMeta,
  type TldPricingDetail,
  type TldPricingSummary,
} from '@/lib/tldPriceTypes';

export type {
  PriceCell,
  RegistrarOffer,
  TldMatrixCell,
  TldMatrixRow,
  TldPriceDatasetMeta,
  TldPricingDetail,
  TldPricingSummary,
} from '@/lib/tldPriceTypes';

export {
  MATRIX_PAGE_DESKTOP,
  MATRIX_PAGE_MOBILE,
  MATRIX_PAGE_STEP,
  PRIORITY_TLDS,
  REGISTRAR_LOGO_PATHS,
  TOP_COMPARISON_REGISTRARS,
} from '@/lib/tldPriceTypes';

type RawData = {
  generatedAt: string;
  sourceName: string;
  sourceUrl: string;
  extensionCount: number;
  extensions: TldPricingDetail[];
  failedExtensions: string[];
};

const raw = priceData as RawData;

const PRIORITY_ORDER = new Map<string, number>(PRIORITY_TLDS.map((tld, index) => [tld, index]));

export function getRegistrarOfferForTld(
  entry: TldPricingDetail,
  registrarName: string
): RegistrarOffer | null {
  return entry.registrars.find((offer) => offer.registrar === registrarName) ?? null;
}

function getTrackedCoverage(entry: TldPricingDetail) {
  return TOP_COMPARISON_REGISTRARS.reduce((count, registrar) => {
    return count + (getRegistrarOfferForTld(entry, registrar)?.registration.value != null ? 1 : 0);
  }, 0);
}

function getAnyPriceCoverage(entry: TldPricingDetail) {
  return entry.registrars.reduce((count, offer) => {
    return count + (offer.registration?.value != null ? 1 : 0);
  }, 0);
}

/** Memoized sorted visible details — avoid re-sorting 2.6k rows every call. */
let cachedVisible: TldPricingDetail[] | null = null;
let cachedMatrix: TldMatrixRow[] | null = null;
let cachedSummaries: TldPricingSummary[] | null = null;
let cachedByTld: Map<string, TldPricingDetail> | null = null;

function getVisibleDetails(): TldPricingDetail[] {
  if (cachedVisible) return cachedVisible;
  cachedVisible = raw.extensions
    .filter((entry) => getAnyPriceCoverage(entry) >= 1)
    .sort((a, b) => {
      const orderA = PRIORITY_ORDER.get(a.tld) ?? Number.MAX_SAFE_INTEGER;
      const orderB = PRIORITY_ORDER.get(b.tld) ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      const coverageDiff = getTrackedCoverage(b) - getTrackedCoverage(a);
      if (coverageDiff !== 0) return coverageDiff;
      const anyDiff = getAnyPriceCoverage(b) - getAnyPriceCoverage(a);
      if (anyDiff !== 0) return anyDiff;
      return a.tld.localeCompare(b.tld);
    });
  return cachedVisible;
}

function getDetailMap(): Map<string, TldPricingDetail> {
  if (cachedByTld) return cachedByTld;
  cachedByTld = new Map();
  for (const entry of getVisibleDetails()) {
    cachedByTld.set(entry.tld.toLowerCase(), entry);
  }
  return cachedByTld;
}

export function getAllTldPriceDetails(): TldPricingDetail[] {
  return getVisibleDetails();
}

export function getTldPriceDatasetMeta(): TldPriceDatasetMeta {
  const details = getVisibleDetails();
  return {
    generatedAt: raw.generatedAt,
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    extensionCount: details.length,
    rawExtensionCount: raw.extensionCount,
    failedExtensions: raw.failedExtensions,
  };
}

export function getTldPriceSummaryList(): TldPricingSummary[] {
  if (cachedSummaries) return cachedSummaries;
  cachedSummaries = getVisibleDetails().map((entry) => ({
    tld: entry.tld,
    registrarCount: entry.registrarCount,
    cheapestRegistration: entry.cheapestRegistration,
    cheapestRenewal: entry.cheapestRenewal,
    cheapestTransfer: entry.cheapestTransfer,
    bestValue: entry.bestValue,
    averageRegistration: entry.pricingSummary['Average Registrar Prices']?.registration ?? null,
    averageRenewal: entry.pricingSummary['Average Registrar Prices']?.renewal ?? null,
    averageTransfer: entry.pricingSummary['Average Registrar Prices']?.transfer ?? null,
    medianRegistration: entry.pricingSummary['Median Registrar Prices']?.registration ?? null,
    medianRenewal: entry.pricingSummary['Median Registrar Prices']?.renewal ?? null,
    medianTransfer: entry.pricingSummary['Median Registrar Prices']?.transfer ?? null,
  }));
  return cachedSummaries;
}

export function getTldPriceDetail(tld: string): TldPricingDetail | null {
  const normalized = tld.startsWith('.') ? tld.toLowerCase() : `.${tld.toLowerCase()}`;
  return getDetailMap().get(normalized) ?? null;
}

/**
 * Slim matrix for the compare UI — top-10 registrar cells only.
 * ~10× smaller than shipping full detail objects to the client.
 */
export function getTldMatrixRows(): TldMatrixRow[] {
  if (cachedMatrix) return cachedMatrix;

  cachedMatrix = getVisibleDetails().map((entry) => {
    const cells: TldMatrixCell[] = TOP_COMPARISON_REGISTRARS.map((registrar) => {
      const offer = getRegistrarOfferForTld(entry, registrar);
      return {
        rv: offer?.registration?.value ?? null,
        wv: offer?.renewal?.value ?? null,
        tv: offer?.transfer?.value ?? null,
      };
    });

    return {
      tld: entry.tld,
      coverage: getTrackedCoverage(entry),
      cr: entry.cheapestRegistration?.value ?? null,
      cw: entry.cheapestRenewal?.value ?? null,
      ct: entry.cheapestTransfer?.value ?? null,
      bv: entry.bestValue?.score ?? null,
      cells,
    };
  });

  return cachedMatrix;
}

/** First N rows (priority-sorted) for fast first paint — full set loads via API. */
export function getTldMatrixRowsPreview(limit = 80): TldMatrixRow[] {
  return getTldMatrixRows().slice(0, limit);
}

/**
 * Detail payload for the side panel — strip bulky optional fields.
 * Keeps scores/prices; drops features/payments arrays when empty.
 */
export function getTldPriceDetailSlim(tld: string): TldPricingDetail | null {
  const full = getTldPriceDetail(tld);
  if (!full) return null;

  const registrars: RegistrarOffer[] = full.registrars
    .filter(
      (offer) =>
        offer.registration?.value != null ||
        offer.renewal?.value != null ||
        offer.transfer?.value != null
    )
    .map((offer) => ({
      registrar: offer.registrar,
      url: offer.url,
      registration: {
        value: offer.registration?.value ?? null,
        display: offer.registration?.display ?? null,
        hasPromo: offer.registration?.hasPromo,
      },
      renewal: {
        value: offer.renewal?.value ?? null,
        display: offer.renewal?.display ?? null,
        hasPromo: offer.renewal?.hasPromo,
      },
      transfer: {
        value: offer.transfer?.value ?? null,
        display: offer.transfer?.display ?? null,
        hasPromo: offer.transfer?.hasPromo,
      },
      whoisPrivacy: {
        value: offer.whoisPrivacy?.value ?? null,
        display: offer.whoisPrivacy?.display ?? null,
      },
      score: offer.score ?? null,
    }));

  return {
    tld: full.tld,
    sourceUrl: full.sourceUrl,
    registrarCount: full.registrarCount,
    pricingSummary: full.pricingSummary,
    cheapestRegistration: full.cheapestRegistration,
    cheapestRenewal: full.cheapestRenewal,
    cheapestTransfer: full.cheapestTransfer,
    bestValue: full.bestValue,
    registrars,
  };
}
