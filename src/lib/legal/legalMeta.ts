/**
 * Shared legal meta for DomainDiscovery + AI Domain Assistant.
 * Copy is operational transparency for a US-facing free research product.
 * Not legal advice — operators should have counsel review before launch.
 */

export const LEGAL_LAST_UPDATED = 'July 22, 2026';
export const LEGAL_EFFECTIVE = 'July 22, 2026';

/** Single inbox for DomainDiscovery — support handles privacy, legal, and product. */
export const DD_CONTACT = {
  support: 'support@domainsdiscovery.com',
  /** @deprecated Use support — kept as alias so call sites stay stable */
  privacy: 'support@domainsdiscovery.com',
  /** @deprecated Use support — kept as alias so call sites stay stable */
  legal: 'support@domainsdiscovery.com',
  site: 'https://www.domainsdiscovery.com',
  brand: 'DomainDiscovery',
} as const;

/** Single inbox for AI Domain Assistant. */
export const ADA_CONTACT = {
  support: 'support@aidomainassistant.com',
  /** @deprecated Use support — kept as alias so call sites stay stable */
  privacy: 'support@aidomainassistant.com',
  /** @deprecated Use support — kept as alias so call sites stay stable */
  legal: 'support@aidomainassistant.com',
  site: 'https://www.aidomainassistant.com',
  brand: 'AI Domain Assistant',
  poweredBy: 'DomainDiscovery',
  poweredByUrl: 'https://www.domainsdiscovery.com',
} as const;
