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
  rating?: number;
  reviewCount?: number;
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

const CURATED_POPULAR_TLDS = [
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

const POPULAR_TLD_ORDER = new Map<string, number>(CURATED_POPULAR_TLDS.map((tld, index) => [tld, index]));

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

function getTrackedCoverage(entry: TldPricingDetail) {
  return TOP_COMPARISON_REGISTRARS.reduce((count, registrar) => {
    return count + (getRegistrarOfferForTld(entry, registrar)?.registration.value != null ? 1 : 0);
  }, 0);
}

function getCuratedDetails(): TldPricingDetail[] {
  return raw.extensions
    .filter((entry) => POPULAR_TLD_ORDER.has(entry.tld))
    .filter((entry) => getTrackedCoverage(entry) >= 2)
    .sort((a, b) => (POPULAR_TLD_ORDER.get(a.tld) ?? Number.MAX_SAFE_INTEGER) - (POPULAR_TLD_ORDER.get(b.tld) ?? Number.MAX_SAFE_INTEGER));
}

export function getAllTldPriceDetails(): TldPricingDetail[] {
  return getCuratedDetails();
}

export function getTldPriceDatasetMeta() {
  const curatedDetails = getCuratedDetails();
  return {
    generatedAt: raw.generatedAt,
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    extensionCount: curatedDetails.length,
    failedExtensions: raw.failedExtensions,
  };
}

export function getTldPriceSummaryList(): TldPricingSummary[] {
  return getCuratedDetails().map((entry) => ({
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
