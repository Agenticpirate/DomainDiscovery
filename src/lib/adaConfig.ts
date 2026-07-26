/**
 * AI Domain Assistant (aidomainassistant.com) brand + host config.
 */

export const ADA_BRAND = {
  name: 'AI Domain Assistant',
  shortName: 'ADA',
  domain: 'aidomainassistant.com',
  wwwHost: 'www.aidomainassistant.com',
  tagline: 'Tell agents your brand. Get ranked domains under budget.',
  description:
    'AI Domain Assistant finds and ranks brandable domains from a business brief, with a hard research budget (for example $20). Powered by DomainDiscovery research APIs. Research only — registration is confirmed by you at a registrar.',
  /** Transparent brand mark (public path) — bump query when replacing assets */
  logoMark: '/ada/logo-mark.png?v=3',
  logoFull: '/ada/logo.png?v=3',
  logo512: '/ada/logo-512.png?v=3',
  /** Tight head-only icon for chat FAB (minimal padding) */
  fabIcon: '/ada/fab-icon.png?v=1',
} as const;

/** Hosts that should render the ADA product skin */
export function isAdaHost(host: string | null): boolean {
  if (!host) return false;
  const h = host.toLowerCase().split(':')[0];
  const configured = (process.env.NEXT_PUBLIC_ADA_HOST || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split(':')[0];
  if (configured && (h === configured || h === `www.${configured.replace(/^www\./, '')}`)) {
    return true;
  }
  return (
    h === 'aidomainassistant.com' ||
    h === 'www.aidomainassistant.com' ||
    h === 'assistant.localhost' ||
    h === 'ada.localhost'
  );
}

/** Public URL for the ADA product */
export function getAdaPublicUrl(): string {
  if (process.env.NEXT_PUBLIC_ADA_URL) {
    return process.env.NEXT_PUBLIC_ADA_URL.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5001/ada';
  }
  return `https://${ADA_BRAND.wwwHost}`;
}

/** DomainDiscovery API base (agent/MCP). Same origin in local monorepo. */
export function getDdApiBase(): string {
  if (process.env.NEXT_PUBLIC_DD_API_BASE) {
    return process.env.NEXT_PUBLIC_DD_API_BASE.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';
}
