/**
 * Shared price-comparison types & constants (safe for client imports).
 * Heavy JSON lives only in tldPriceData.ts (server / API).
 */

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

/** Compact per-registrar cell for the matrix (top 10 only). Numbers only — format $ on client. */
export interface TldMatrixCell {
  /** registration value */
  rv: number | null;
  /** renewal value */
  wv: number | null;
  /** transfer value */
  tv: number | null;
}

/**
 * One matrix row — enough to render the table without the full 6MB dataset.
 * `cells` order matches TOP_COMPARISON_REGISTRARS.
 * Compact fields only (no nested cheapest objects) for small JSON payloads.
 */
export interface TldMatrixRow {
  tld: string;
  coverage: number;
  /** cheapest registration value (sort) */
  cr: number | null;
  /** cheapest renewal value */
  cw: number | null;
  /** cheapest transfer value */
  ct: number | null;
  /** best-value score */
  bv: number | null;
  cells: TldMatrixCell[];
}

export interface TldPriceDatasetMeta {
  generatedAt: string;
  sourceName: string;
  sourceUrl: string;
  extensionCount: number;
  rawExtensionCount?: number;
  failedExtensions?: string[];
}

/** High-signal extensions pinned to the top of the matrix. */
export const PRIORITY_TLDS = [
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

export type TopComparisonRegistrar = (typeof TOP_COMPARISON_REGISTRARS)[number];

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

/** Initial matrix rows on mobile / desktop before "Show more". */
export const MATRIX_PAGE_MOBILE = 28;
export const MATRIX_PAGE_DESKTOP = 60;
export const MATRIX_PAGE_STEP = 40;
