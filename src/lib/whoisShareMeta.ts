/** Shared helpers for public WHOIS share pages + OG cards. */

export type WhoisShareSnapshot = {
  domain: string;
  registrar: string;
  status: string;
  registrationDate: string | null;
  expirationDate: string | null;
  updatedDate?: string | null;
  nameServers: string[];
  dnssec?: boolean;
  available?: boolean;
};

export function normalizeShareDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .replace(/\.$/, '');
}

export function buildWhoisSharePath(domain: string): string {
  return `/share/whois/${encodeURIComponent(normalizeShareDomain(domain))}`;
}

/**
 * Prefer a public site origin so social crawlers can fetch OG images.
 * Order: NEXT_PUBLIC_BASE_URL → NEXT_PUBLIC_APP_URL → window.location.origin → production default.
 * Set NEXT_PUBLIC_BASE_URL in production so LLM/social crawlers resolve absolute share URLs.
 */
export function getShareOrigin(): string {
  const fromEnv =
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL)) ||
    '';

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return 'https://www.domainsdiscovery.com';
}

export function isLocalShareOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local');
  } catch {
    return /localhost|127\.0\.0\.1/.test(origin);
  }
}

/** True when X/LinkedIn/Facebook can crawl this origin for card previews. */
export function isSociallyCrawlableOrigin(origin: string): boolean {
  if (isLocalShareOrigin(origin)) return false;
  return origin.startsWith('https://') || origin.startsWith('http://');
}

export function buildWhoisShareUrl(domain: string, origin?: string): string {
  const base = (origin || getShareOrigin()).replace(/\/$/, '');
  return `${base}${buildWhoisSharePath(domain)}`;
}

/** Caption only (no URL) — pair with platform `url=` so the link isn’t doubled. */
export function buildSocialCaption(domain: string): string {
  return [
    `WHOIS card · ${normalizeShareDomain(domain)}`,
    'Status · registrar · dates · name servers',
    'via DomainDiscovery · free RDAP',
  ].join('\n');
}

/** Caption + link for WhatsApp / email / clipboard. */
export function buildSocialPostText(domain: string, shareUrl: string): string {
  return `${buildSocialCaption(domain)}\n\n${shareUrl}`;
}
