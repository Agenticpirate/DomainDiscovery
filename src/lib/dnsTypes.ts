/** Client-safe DNS constants (kept apart from dnsLookup.ts, which pulls in the RDAP client). */
export const DNS_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'CAA'] as const;
export type DnsType = (typeof DNS_TYPES)[number];
export type DnsRecord = { name: string; type: string; ttl: number; data: string };
