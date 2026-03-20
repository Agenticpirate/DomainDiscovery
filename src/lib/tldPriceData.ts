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

export function getAllTldPriceDetails(): TldPricingDetail[] {
  return raw.extensions;
}

export function getTldPriceDatasetMeta() {
  return {
    generatedAt: raw.generatedAt,
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    extensionCount: raw.extensionCount,
    failedExtensions: raw.failedExtensions,
  };
}

export function getTldPriceSummaryList(): TldPricingSummary[] {
  return raw.extensions.map((entry) => ({
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
