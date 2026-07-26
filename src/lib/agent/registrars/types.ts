/**
 * Shared types for L3 registrar adapters (BYOK register + DNS).
 */

export type DnsRecordInput = {
  type: string;
  name: string;
  data: string;
  ttl?: number;
  priority?: number;
};

export type RegistrantContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  organization?: string;
};

export type RegisterDomainArgs = {
  domain: string;
  years?: number;
  maxBudgetUsd?: number;
  /** Default true — never charge unless explicitly false + human confirm */
  dryRun?: boolean;
  contact?: RegistrantContact;
  agreeToTerms?: boolean;
};

export type SetDnsArgs = {
  domain: string;
  records: DnsRecordInput[];
  dryRun?: boolean;
};

export type AdapterResult = {
  ok: boolean;
  code?: string;
  message: string;
  provider: string;
  domain?: string;
  dryRun?: boolean;
  priceUsd?: number | null;
  raw?: unknown;
  next?: string[];
};

export type RegistrarCredentials = {
  apiKey: string;
  secret?: string;
  /** Namecheap API user (defaults to username) */
  username?: string;
  /** Namecheap ClientIp whitelist */
  clientIp?: string;
  /** Cloudflare account id */
  accountId?: string;
  /** Optional email for Cloudflare global key auth */
  email?: string;
};

export interface RegistrarAdapter {
  id: string;
  name: string;
  registerDomain(creds: RegistrarCredentials, args: RegisterDomainArgs): Promise<AdapterResult>;
  setDns(creds: RegistrarCredentials, args: SetDnsArgs): Promise<AdapterResult>;
  checkPrice?(creds: RegistrarCredentials, domain: string): Promise<{
    available: boolean;
    priceUsd: number | null;
    raw?: unknown;
  }>;
}
