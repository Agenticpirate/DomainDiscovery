/**
 * WHOIS-related type definitions
 * @module types/whois
 */

/**
 * Information about a domain registrant
 */
export interface RegistrantInfo {
  /** Name of the registrant */
  name?: string;
  /** Organization name */
  organization?: string;
  /** Country of the registrant */
  country?: string;
  /** Contact email address */
  email?: string;
}

/**
 * Result of a WHOIS lookup
 */
export interface WHOISResult {
  /** The domain name that was looked up */
  domain: string;
  /** Name of the registrar */
  registrar: string;
  /** Optional registrant information (may be redacted for privacy) */
  registrant?: RegistrantInfo;
  /** Important dates related to the domain registration */
  dates: {
    /** Date the domain was first registered */
    created: Date;
    /** Date the domain record was last updated */
    updated: Date;
    /** Date the domain registration expires */
    expires: Date;
  };
  /** List of name servers for the domain */
  nameServers: string[];
  /** Whether DNSSEC is enabled for the domain */
  dnssec: boolean;
  /** Raw WHOIS data as returned by the WHOIS server */
  rawData: string;
}
