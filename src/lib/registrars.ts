export const REGISTRAR_STORAGE_KEY = 'preferred_registrar_v1';
export const PREFERRED_REGISTRAR_EVENT = 'preferredRegistrarUpdated';

/** Registrars offered for available domain registration */
export type RegistrarName =
  | 'GoDaddy'
  | 'Spaceship'
  | 'Unstoppable Domains'
  | 'Namecheap'
  | 'Dynadot'
  | 'Sav'
  | 'Porkbun'
  | 'Atom';

export interface RegistrarDefinition {
  name: RegistrarName;
  /** Menu label shown to users (e.g. GoDaddy.com) */
  host: string;
  /** Local brand mark under /public/registrars */
  logo: string;
  getUrl: (domain: string) => string;
}

/**
 * Spaceship Impact.com affiliate (Text Link 1859616).
 *
 * CRITICAL: Commissions only track when the browser opens the FULL Impact hop URL:
 *   https://spaceship.sjv.io/c/7521997/1859616/21274?u=<encoded Spaceship destination>
 *
 * Never open raw https://www.spaceship.com/... for register/Go CTAs — that skips commission.
 *
 * Impression pixel: https://imp.pxf.io/i/7521997/1859616/21274
 */
export const SPACESHIP_AFFILIATE = {
  /** Full Impact click base (must be the complete path — do not shorten) */
  clickBase: 'https://spaceship.sjv.io/c/7521997/1859616/21274',
  /** 1×1 view pixel */
  impressionPixel: 'https://imp.pxf.io/i/7521997/1859616/21274',
  /** Merchant landing page after the Impact hop (domain prefilled) */
  domainSearchDestination: (domain: string) => {
    const q = domain.trim().toLowerCase();
    const withTld = q.includes('.') ? q : `${q}.com`;
    return `https://www.spaceship.com/domain-search/?query=${encodeURIComponent(withTld)}`;
  },
} as const;

/** True if URL is our Impact click tracker (full sjv.io hop). */
export function isSpaceshipAffiliateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === 'imp.pxf.io') return true;
    // Must be the full tracking path, not a random sjv.io URL
    return (
      host === 'spaceship.sjv.io' &&
      u.pathname.startsWith('/c/7521997/1859616/21274')
    );
  } catch {
    return false;
  }
}

/**
 * Full Spaceship Impact affiliate URL (required for tracking + commissions).
 *
 * Example:
 * https://spaceship.sjv.io/c/7521997/1859616/21274?u=https%3A%2F%2Fwww.spaceship.com%2Fdomain-search%2F%3Fquery%3Dexample.com
 *
 * - Always starts with the full clickBase above
 * - `u` is a single encodeURIComponent of the merchant URL (Impact deep-link)
 * - No extra params that could break attribution
 */
export function getSpaceshipAffiliateUrl(domain?: string | null): string {
  const base = SPACESHIP_AFFILIATE.clickBase;
  const cleaned = (domain || '').trim().toLowerCase();
  if (!cleaned) {
    // Bare tracking link (still full affiliate URL)
    return base;
  }
  const destination = SPACESHIP_AFFILIATE.domainSearchDestination(cleaned);
  // Build the complete tracked URL manually so encoding is exactly once
  return `${base}?u=${encodeURIComponent(destination)}`;
}

/**
 * Primary Go for free/available domains — full Spaceship Impact affiliate URL.
 */
export function getPrimaryRegisterAffiliateUrl(domain: string): string {
  return getSpaceshipAffiliateUrl(domain);
}

/**
 * Primary Go for premium / aftermarket domains — GoDaddy (listing source).
 * Prefer API buyUrl when it already points at GoDaddy.
 * Never returns Spaceship / Impact — premium inventory is GoDaddy only.
 */
export function getPremiumRegisterUrl(
  domain: string,
  marketplaceBuyUrl?: string | null
): string {
  const buy = (marketplaceBuyUrl || '').trim();
  // Accept only real GoDaddy listing URLs — never sjv.io / spaceship / IDS hops
  if (
    buy &&
    /godaddy\.com/i.test(buy) &&
    !/spaceship|sjv\.io|instantdomainsearch/i.test(buy)
  ) {
    return buy;
  }
  return getGoDaddyRegisterUrl(domain);
}

/**
 * Detect premium / aftermarket intent from flags + buy URL signals.
 * Used so CTAs still open GoDaddy when API forgets premium:true but attaches a listing URL.
 */
export function isPremiumListingSignal(options?: {
  premium?: boolean | null;
  marketplaceBuyUrl?: string | null;
  purchaseInfo?: string | null;
  available?: boolean | null;
}): boolean {
  if (options?.premium) return true;
  // Free/available registrations are never treated as premium listings
  if (options?.available === true) return false;
  const buy = (options?.marketplaceBuyUrl || '').trim();
  const info = (options?.purchaseInfo || '').trim();
  if (buy && /godaddy\.com/i.test(buy) && !/spaceship|sjv\.io/i.test(buy)) {
    // GoDaddy buy URL on a non-available name → aftermarket / premium path
    if (options?.available === false || /listing|premium|aftermarket|purchase/i.test(info)) {
      return true;
    }
  }
  if (/premium listing|listing on godaddy|aftermarket/i.test(info)) return true;
  return false;
}

/**
 * Primary Go CTA by domain type:
 * - free/available → Spaceship full affiliate URL
 * - premium / aftermarket → GoDaddy (never Spaceship)
 */
export function getPrimaryGoUrl(
  domain: string,
  options?: {
    premium?: boolean;
    marketplaceBuyUrl?: string | null;
    purchaseInfo?: string | null;
    available?: boolean | null;
  }
): string {
  const premium = isPremiumListingSignal(options);
  if (premium) {
    return getPremiumRegisterUrl(domain, options?.marketplaceBuyUrl);
  }
  return getPrimaryRegisterAffiliateUrl(domain);
}

/**
 * Options for domains available for registration.
 * Spaceship first — default affiliate partner for “register” CTAs.
 */
export const REGISTRARS: RegistrarDefinition[] = [
  {
    name: 'Spaceship',
    host: 'Spaceship.com',
    logo: '/registrars/spaceship.png',
    // Always Impact affiliate — never raw spaceship.com for registration CTAs
    getUrl: (domain) => getSpaceshipAffiliateUrl(domain),
  },
  {
    name: 'GoDaddy',
    host: 'GoDaddy.com',
    logo: '/registrars/godaddy.png',
    getUrl: (domain) =>
      `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Namecheap',
    host: 'Namecheap.com',
    logo: '/registrars/namecheap.png',
    getUrl: (domain) =>
      `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Porkbun',
    host: 'Porkbun.com',
    logo: '/registrars/porkbun.png',
    getUrl: (domain) =>
      `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Dynadot',
    host: 'Dynadot.com',
    logo: '/registrars/dynadot.png',
    getUrl: (domain) =>
      `https://www.dynadot.com/domain/search?domain=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Sav',
    host: 'Sav.com',
    logo: '/registrars/sav.png',
    getUrl: (domain) =>
      `https://www.sav.com/domain/search?domain=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Unstoppable Domains',
    host: 'UnstoppableDomains.com',
    logo: '/registrars/unstoppable.png',
    getUrl: (domain) =>
      `https://unstoppabledomains.com/search?searchTerm=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Atom',
    host: 'Atom.com',
    logo: '/registrars/atom.png',
    getUrl: (domain) =>
      `https://www.atom.com/register?domain=${encodeURIComponent(domain)}`,
  },
];

/** Default “register at” partner — Spaceship Impact affiliate */
export const DEFAULT_REGISTRAR: RegistrarName = 'Spaceship';

export function isRegistrarName(value: string): value is RegistrarName {
  return REGISTRARS.some((registrar) => registrar.name === value);
}

export function getRegistrar(name?: string | null): RegistrarDefinition {
  return REGISTRARS.find((registrar) => registrar.name === name) ?? REGISTRARS[0];
}

/**
 * Registration / buy URL for the chosen registrar.
 * Spaceship is always forced through Impact sjv.io (never raw spaceship.com).
 */
export function getRegistrarUrl(domain: string, registrarName?: string | null): string {
  const reg = getRegistrar(registrarName);
  const cleaned = (domain || '').trim();
  if (reg.name === 'Spaceship') {
    return getSpaceshipAffiliateUrl(cleaned);
  }
  const url = reg.getUrl(cleaned);
  // Belt-and-suspenders: if anything ever emitted raw Spaceship, rewrite it
  if (/spaceship\.com/i.test(url) && !isSpaceshipAffiliateUrl(url)) {
    return getSpaceshipAffiliateUrl(cleaned);
  }
  return url;
}

/**
 * If a URL would open Spaceship untracked, rewrite it to our Impact hop.
 * Safe no-op for non-Spaceship URLs.
 */
export function ensureSpaceshipAffiliate(url: string, domainHint?: string | null): string {
  const raw = (url || '').trim();
  if (!raw) return getSpaceshipAffiliateUrl(domainHint);
  if (isSpaceshipAffiliateUrl(raw)) return raw;
  if (!/spaceship\.com/i.test(raw)) return raw;

  // Prefer explicit domain hint; else try to pull query/domain from the merchant URL
  let domain = (domainHint || '').trim();
  if (!domain) {
    try {
      const u = new URL(raw);
      domain =
        u.searchParams.get('query') ||
        u.searchParams.get('domain') ||
        u.searchParams.get('domainToCheck') ||
        u.searchParams.get('search') ||
        '';
    } catch {
      /* ignore */
    }
  }
  return getSpaceshipAffiliateUrl(domain || null);
}

/** GoDaddy domain search (premium aftermarket data source) */
export function getGoDaddyRegisterUrl(domain: string): string {
  const cleaned = (domain || '').trim().toLowerCase();
  const withTld = cleaned.includes('.') ? cleaned : `${cleaned}.com`;
  return `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(withTld)}`;
}

export type ResolveRegisterOptions = {
  /**
   * Premium / aftermarket listing — availability & pricing come from GoDaddy.
   * Primary CTA defaults to GoDaddy (not Spaceship).
   */
  premium?: boolean;
  /** Optional purchase copy from availability APIs (listing signals) */
  purchaseInfo?: string | null;
  /** When true, never treat as premium listing (free registration) */
  available?: boolean | null;
};

/**
 * Resolve the URL for a Register / Go / Continue CTA on any domain tool
 * (search, bulk, generator, geo, keywords, extensions, saved, assistant).
 *
 * Rules:
 * - Free / available + Spaceship (default) → full Impact affiliate URL
 *   https://spaceship.sjv.io/c/7521997/1859616/21274?u=...
 * - Premium (default) → GoDaddy (premium inventory/pricing source)
 * - Explicit menu registrar → that registrar (Spaceship still full affiliate)
 * - Never open raw www.spaceship.com for a Spaceship register CTA
 */
export function resolveRegisterUrl(
  domain: string,
  registrarName?: string | null,
  marketplaceBuyUrl?: string | null,
  options?: ResolveRegisterOptions
): string {
  const cleaned = (domain || '').trim();
  const buy = (marketplaceBuyUrl || '').trim();
  const isPremium = isPremiumListingSignal({
    premium: options?.premium,
    marketplaceBuyUrl: buy,
    purchaseInfo: options?.purchaseInfo,
    available: options?.available,
  });
  const explicit =
    registrarName && isRegistrarName(registrarName) ? registrarName : null;

  /**
   * Premium / aftermarket:
   * Always open GoDaddy for the primary path — including when preferred registrar
   * is Spaceship. Menu items that intentionally offer Spaceship call
   * getSpaceshipAffiliateUrl() directly (see RegistrarControls).
   */
  if (isPremium) {
    if (explicit && explicit !== 'Spaceship' && explicit !== 'GoDaddy') {
      return getRegistrarUrl(cleaned, explicit);
    }
    return getPremiumRegisterUrl(cleaned, buy);
  }

  // Free / available
  if (!explicit || explicit === 'Spaceship') {
    return getSpaceshipAffiliateUrl(cleaned);
  }
  if (explicit === 'GoDaddy') {
    return getGoDaddyRegisterUrl(cleaned);
  }
  return getRegistrarUrl(cleaned, explicit);
}

/**
 * Effective registrar for the primary Go CTA.
 * Premium → GoDaddy · Free → Spaceship (Impact affiliate)
 */
export function getEffectiveRegisterRegistrar(
  selectedRegistrar?: RegistrarName | string | null,
  isPremium?: boolean
): RegistrarName {
  if (isPremium) return 'GoDaddy';
  return selectedRegistrar && isRegistrarName(selectedRegistrar)
    ? selectedRegistrar
    : DEFAULT_REGISTRAR;
}

export function getRegistrarHost(name?: string | null): string {
  return getRegistrar(name).host;
}

export function getRegistrarLogo(name?: string | null): string {
  return getRegistrar(name).logo;
}
