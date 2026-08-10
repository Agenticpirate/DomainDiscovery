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
 * ALL Spaceship register/buy CTAs must open the sjv.io tracking hop first.
 * Never link raw www.spaceship.com for registration — that skips commission.
 *
 * Tracking: https://spaceship.sjv.io/c/7521997/1859616/21274
 * Impression: https://imp.pxf.io/i/7521997/1859616/21274
 * Deep-link: append Impact `u=` with encoded Spaceship domain-search URL.
 */
export const SPACESHIP_AFFILIATE = {
  /** Impact click tracking base (Account / Ad / Campaign) */
  clickBase: 'https://spaceship.sjv.io/c/7521997/1859616/21274',
  /** 1×1 view pixel — optional on promotional placements */
  impressionPixel: 'https://imp.pxf.io/i/7521997/1859616/21274',
  /** Final merchant URL after the Impact hop (domain prefilled) */
  domainSearchDestination: (domain: string) => {
    const q = domain.trim().toLowerCase();
    return `https://www.spaceship.com/domain-search/?query=${encodeURIComponent(q)}`;
  },
} as const;

/** True if URL is our Impact click tracker (not a raw merchant link). */
export function isSpaceshipAffiliateUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'spaceship.sjv.io' || host.endsWith('.sjv.io') || host === 'imp.pxf.io';
  } catch {
    return false;
  }
}

/**
 * Build a Spaceship affiliate URL (always sjv.io first).
 * - With domain: Impact hop → Spaceship domain search with that name
 * - Without domain: bare Impact tracking link
 */
export function getSpaceshipAffiliateUrl(domain?: string | null): string {
  const cleaned = (domain || '').trim().toLowerCase();
  if (!cleaned) {
    return SPACESHIP_AFFILIATE.clickBase;
  }
  // Ensure TLD so Spaceship search is useful
  const withTld = cleaned.includes('.') ? cleaned : `${cleaned}.com`;
  const destination = SPACESHIP_AFFILIATE.domainSearchDestination(withTld);

  // Use URL API so encoding is correct and params are stable
  const tracked = new URL(SPACESHIP_AFFILIATE.clickBase);
  tracked.searchParams.set('u', destination);
  // Sub-IDs help reconcile generator/search traffic in Impact reports
  tracked.searchParams.set('subId1', 'domaindiscovery');
  tracked.searchParams.set('subId2', 'register');
  return tracked.toString();
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
};

/**
 * Resolve the URL for a Register / Go / Continue CTA on any domain tool
 * (search, bulk, generator, geo, keywords, extensions, saved, assistant).
 *
 * Monetization rule:
 * - Default / Spaceship CTAs ALWAYS open Impact affiliate:
 *   https://spaceship.sjv.io/c/7521997/1859616/21274 (+ domain deep-link)
 * - Never open raw www.spaceship.com for a register CTA.
 *
 * Premium note:
 * - Premium *pricing data* may come from GoDaddy (shown in UI labels).
 * - Primary Go still uses Spaceship affiliate unless the user explicitly
 *   picks another registrar in the menu (or chooses GoDaddy to view the listing).
 */
export function resolveRegisterUrl(
  domain: string,
  registrarName?: string | null,
  marketplaceBuyUrl?: string | null,
  options?: ResolveRegisterOptions
): string {
  const cleaned = (domain || '').trim();
  const isPremium = Boolean(options?.premium);
  const explicit =
    registrarName && isRegistrarName(registrarName) ? registrarName : null;
  const buy = (marketplaceBuyUrl || '').trim();

  // Explicit non-Spaceship registrar from the menu (GoDaddy, Namecheap, …)
  if (explicit && explicit !== 'Spaceship') {
    // Premium + GoDaddy: prefer marketplace deep-link when API provided one
    if (isPremium && explicit === 'GoDaddy' && buy && /godaddy\.com/i.test(buy)) {
      return buy;
    }
    if (explicit === 'GoDaddy') {
      return getGoDaddyRegisterUrl(cleaned);
    }
    return getRegistrarUrl(cleaned, explicit);
  }

  // Default partner + Spaceship selection → always Impact affiliate hop
  // (covers free available domains AND premium when Spaceship is preferred)
  return getSpaceshipAffiliateUrl(cleaned);
}

/**
 * Effective registrar for the primary Go CTA.
 * Always Spaceship (Impact affiliate) unless user picked another registrar.
 * Premium data may still be labeled “from GoDaddy” in the UI.
 */
export function getEffectiveRegisterRegistrar(
  selectedRegistrar: RegistrarName | string | null | undefined,
  _isPremium?: boolean
): RegistrarName {
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
