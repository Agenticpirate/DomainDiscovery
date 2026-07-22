import priceData from '@/data/tld-price-comparison.json';

export interface PriceCell {
  value: number | null;
  display: string | null;
  hasPromo?: boolean;
  regularValue?: number;
  regularDisplay?: string | null;
  promoCode?: string;
  limitPerCustomer?: string;
}

export interface RegistrarOffer {
  registrar: string;
  url: string | null;
  registration: PriceCell;
  renewal: PriceCell;
  transfer: PriceCell;
  whoisPrivacy: PriceCell;
  taxAndFees?: string;
  features?: string[];
  rating?: number | null;
  reviewCount?: number | null;
  payments?: string[];
  score: number | null;
}

export interface TldPricingDetail {
  tld: string;
  sourceUrl: string;
  registrarCount: number;
  pricingSummary: Record<string, Record<string, number | null>>;
  cheapestRegistration: { registrar: string | null; price: string | null; value: number | null };
  cheapestRenewal: { registrar: string | null; price: string | null; value: number | null };
  cheapestTransfer: { registrar: string | null; price: string | null; value: number | null };
  bestValue: { registrar: string | null; score: number | null; registration: string | null };
  registrars: RegistrarOffer[];
}

export interface TldPricingSummary {
  tld: string;
  registrarCount: number;
  cheapestRegistration: { registrar: string | null; price: string | null; value: number | null };
  cheapestRenewal: { registrar: string | null; price: string | null; value: number | null };
  cheapestTransfer: { registrar: string | null; price: string | null; value: number | null };
  bestValue: { registrar: string | null; score: number | null; registration: string | null };
  averageRegistration: number | null;
  averageRenewal: number | null;
  averageTransfer: number | null;
  medianRegistration: number | null;
  medianRenewal: number | null;
  medianTransfer: number | null;
}

type RawData = {
  generatedAt: string;
  sourceName: string;
  sourceUrl: string;
  extensionCount: number;
  extensions: TldPricingDetail[];
  failedExtensions: string[];
};

const raw = priceData as RawData;

/** High-signal extensions pinned to the top of the matrix. */
const PRIORITY_TLDS = [
  '.com',
  '.net',
  '.org',
  '.ai',
  '.io',
  '.co',
  '.app',
  '.dev',
  '.in',
  '.us',
  '.xyz',
  '.info',
  '.biz',
  '.me',
  '.tv',
  '.shop',
  '.store',
  '.online',
  '.site',
  '.tech',
  '.blog',
  '.page',
  '.cloud',
  '.software',
  '.live',
  '.world',
  '.today',
  '.one',
  '.link',
  '.website',
  '.space',
  '.digital',
  '.email',
  '.tools',
  '.support',
  '.click',
  '.club',
  '.news',
  '.fun',
  '.cc',
  '.uk',
  '.co.uk',
  '.ca',
  '.de',
  '.au',
  '.eu',
  '.nl',
  '.fr',
  '.it',
  '.es',
] as const;

const PRIORITY_ORDER = new Map<string, number>(PRIORITY_TLDS.map((tld, index) => [tld, index]));

export const TOP_COMPARISON_REGISTRARS = [
  'Spaceship',
  'GoDaddy',
  'Namecheap',
  'Porkbun',
  'Dynadot',
  'NameSilo',
  'Sav',
  'Cloudflare',
  'Hostinger',
  'Unstoppable Domains',
] as const;

export const REGISTRAR_LOGO_PATHS: Record<string, string> = {
  Spaceship: '/registrars/spaceship.png',
  GoDaddy: '/registrars/godaddy.png',
  Namecheap: '/registrars/namecheap.png',
  Porkbun: '/registrars/porkbun.png',
  Dynadot: '/registrars/dynadot.png',
  NameSilo: '/registrars/namesilo.png',
  Sav: '/registrars/sav.png',
  Cloudflare: '/registrars/cloudflare.png',
  Hostinger: '/registrars/hostinger.png',
  'Unstoppable Domains': '/registrars/unstoppable.png',
};

function getTrackedCoverage(entry: TldPricingDetail) {
  return TOP_COMPARISON_REGISTRARS.reduce((count, registrar) => {
    return count + (getRegistrarOfferForTld(entry, registrar)?.registration.value != null ? 1 : 0);
  }, 0);
}

/** Any registrar offer with a real registration price (includes secondary / fallback). */
function getAnyPriceCoverage(entry: TldPricingDetail) {
  return entry.registrars.reduce((count, offer) => {
    return count + (offer.registration?.value != null ? 1 : 0);
  }, 0);
}

/**
 * All extensions with at least one registrar price.
 * Priority TLDs first, then by tracked coverage, then alphabetical.
 */
function getVisibleDetails(): TldPricingDetail[] {
  return raw.extensions
    .filter((entry) => getAnyPriceCoverage(entry) >= 1)
    .sort((a, b) => {
      const orderA = PRIORITY_ORDER.get(a.tld) ?? Number.MAX_SAFE_INTEGER;
      const orderB = PRIORITY_ORDER.get(b.tld) ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const coverageDiff = getTrackedCoverage(b) - getTrackedCoverage(a);
      if (coverageDiff !== 0) {
        return coverageDiff;
      }
      const anyDiff = getAnyPriceCoverage(b) - getAnyPriceCoverage(a);
      if (anyDiff !== 0) {
        return anyDiff;
      }
      return a.tld.localeCompare(b.tld);
    });
}

export function getAllTldPriceDetails(): TldPricingDetail[] {
  return getVisibleDetails();
}

export function getTldPriceDatasetMeta() {
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
  return getVisibleDetails().map((entry) => ({
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
}

export function getTldPriceDetail(tld: string): TldPricingDetail | null {
  const normalized = tld.startsWith('.') ? tld.toLowerCase() : `.${tld.toLowerCase()}`;
  return raw.extensions.find((entry) => entry.tld.toLowerCase() === normalized) ?? null;
}

export function getRegistrarOfferForTld(entry: TldPricingDetail, registrarName: string): RegistrarOffer | null {
  return entry.registrars.find((offer) => offer.registrar === registrarName) ?? null;
}
