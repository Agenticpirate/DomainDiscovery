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
 * Options for domains available for registration.
 * Order matches product priority.
 */
export const REGISTRARS: RegistrarDefinition[] = [
  {
    name: 'GoDaddy',
    host: 'GoDaddy.com',
    logo: '/registrars/godaddy.png',
    getUrl: (domain) =>
      `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Spaceship',
    host: 'Spaceship.com',
    logo: '/registrars/spaceship.png',
    getUrl: (domain) =>
      `https://www.spaceship.com/domain-search/?query=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Unstoppable Domains',
    host: 'UnstoppableDomains.com',
    logo: '/registrars/unstoppable.png',
    getUrl: (domain) =>
      `https://unstoppabledomains.com/search?searchTerm=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Namecheap',
    host: 'Namecheap.com',
    logo: '/registrars/namecheap.png',
    getUrl: (domain) =>
      `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
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
    name: 'Porkbun',
    host: 'Porkbun.com',
    logo: '/registrars/porkbun.png',
    getUrl: (domain) =>
      `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Atom',
    host: 'Atom.com',
    logo: '/registrars/atom.png',
    getUrl: (domain) =>
      `https://www.atom.com/register?domain=${encodeURIComponent(domain)}`,
  },
];

export const DEFAULT_REGISTRAR: RegistrarName = 'GoDaddy';

export function isRegistrarName(value: string): value is RegistrarName {
  return REGISTRARS.some((registrar) => registrar.name === value);
}

export function getRegistrar(name?: string | null): RegistrarDefinition {
  return REGISTRARS.find((registrar) => registrar.name === name) ?? REGISTRARS[0];
}

export function getRegistrarUrl(domain: string, registrarName?: string | null): string {
  return getRegistrar(registrarName).getUrl(domain);
}

export function getRegistrarHost(name?: string | null): string {
  return getRegistrar(name).host;
}

export function getRegistrarLogo(name?: string | null): string {
  return getRegistrar(name).logo;
}
