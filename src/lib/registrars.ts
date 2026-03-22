export const REGISTRAR_STORAGE_KEY = 'preferred_registrar_v1';
export const PREFERRED_REGISTRAR_EVENT = 'preferredRegistrarUpdated';

export type RegistrarName =
  | 'GoDaddy'
  | 'Spaceship'
  | 'Namecheap'
  | 'Unstoppable Domains'
  | 'Dynadot'
  | 'Sav'
  | 'Porkbun';

export interface RegistrarDefinition {
  name: RegistrarName;
  getUrl: (domain: string) => string;
}

export const REGISTRARS: RegistrarDefinition[] = [
  {
    name: 'GoDaddy',
    getUrl: (domain) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Spaceship',
    getUrl: (domain) => `https://www.spaceship.com/domain-search/?query=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Namecheap',
    getUrl: (domain) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Unstoppable Domains',
    getUrl: (domain) => `https://unstoppabledomains.com/search?searchTerm=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Dynadot',
    getUrl: (domain) => `https://www.dynadot.com/domain/search?domain=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Sav',
    getUrl: (domain) => `https://marketing.sav.com/domains/whois?domain=${encodeURIComponent(domain)}`,
  },
  {
    name: 'Porkbun',
    getUrl: (domain) => `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
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
