import { normalizeDomain } from '@/lib/rdapClient';

import { DNS_TYPES, type DnsRecord, type DnsType } from '@/lib/dnsTypes';

export { DNS_TYPES };
export type { DnsRecord, DnsType };

export type DnsResult = {
  domain: string;
  type: DnsType;
  /** DNS RCODE: 0 = NOERROR, 3 = NXDOMAIN */
  status: number;
  records: DnsRecord[];
  resolver: string;
};

const TYPE_NUMBERS: Record<number, string> = { 1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 15: 'MX', 16: 'TXT', 28: 'AAAA', 257: 'CAA' };
const BLOCKED_SUFFIXES = ['local', 'localhost', 'internal', 'lan', 'home', 'corp', 'test', 'invalid', 'onion', 'arpa'];
const TIMEOUT_MS = 5000;

const RESOLVERS = [
  { name: 'cloudflare-dns.com', url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'dns.google', url: 'https://dns.google/resolve' },
];

export function isDnsType(value: string): value is DnsType {
  return (DNS_TYPES as readonly string[]).includes(value);
}

/** Returns a public hostname or null for invalid input, IP literals and local names. */
export function validateDnsName(input: string): string | null {
  const domain = normalizeDomain(input);
  if (!domain) return null;
  const tld = domain.split('.').pop() ?? '';
  if (/^\d+$/.test(tld)) return null; // IPv4 literal or numeric TLD
  if (BLOCKED_SUFFIXES.includes(tld)) return null;
  return domain;
}

type DohAnswer = { name: string; type: number; TTL: number; data: string };
type DohResponse = { Status: number; Answer?: DohAnswer[] };

export function normalizeAnswers(answers: DohAnswer[] | undefined): DnsRecord[] {
  return (answers ?? []).map((a) => ({
    name: a.name.replace(/\.$/, ''),
    type: TYPE_NUMBERS[a.type] ?? String(a.type),
    ttl: a.TTL,
    data: a.type === 16 ? a.data.replace(/^"|"$/g, '') : a.data.replace(/\.$/, ''),
  }));
}

export async function lookupDns(rawDomain: string, type: DnsType): Promise<DnsResult> {
  const domain = validateDnsName(rawDomain);
  if (!domain) throw new Error('Enter a valid public domain name (e.g. example.com).');

  let lastError: unknown;
  for (const resolver of RESOLVERS) {
    try {
      const res = await fetch(`${resolver.url}?name=${encodeURIComponent(domain)}&type=${type}`, {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Resolver ${resolver.name} returned ${res.status}`);
      const body = (await res.json()) as DohResponse;
      return { domain, type, status: body.Status, records: normalizeAnswers(body.Answer), resolver: resolver.name };
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`DNS lookup failed: ${lastError instanceof Error ? lastError.message : 'unknown error'}`);
}
