/**
 * Free domain availability via public RDAP (no API keys).
 * Uses existing rdapClient (IANA bootstrap → registry).
 */

import { lookupWhois } from '@/lib/rdapClient';
import { getRegistrarUrl } from '@/lib/registrars';

export type FreeCheckResult = {
  domain: string;
  available: boolean;
  premium?: boolean;
  price?: string;
  buyUrl?: string;
  source: 'rdap';
  note?: string;
};

const CONCURRENCY = 6;

/**
 * Check domains with free RDAP.
 * - Registered (RDAP 200 object) → available: false
 * - RDAP 404 / not found → available: true (likely free to register)
 * - Timeout / no server → available treated as true with note (optimistic for research)
 *   so shortlist still works offline; UI says re-check at registrar.
 */
export async function checkDomainsFreeRdap(domains: string[]): Promise<FreeCheckResult[]> {
  const unique = Array.from(
    new Set(domains.map((d) => d.toLowerCase().trim()).filter((d) => d.includes('.')))
  );
  const out: FreeCheckResult[] = [];

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const slice = unique.slice(i, i + CONCURRENCY);
    const batch = await Promise.all(
      slice.map(async (domain) => {
        try {
          const result = await lookupWhois(domain);
          if (result.success) {
            return {
              domain,
              available: false,
              premium: false,
              buyUrl: getRegistrarUrl(domain, 'GoDaddy'),
              source: 'rdap' as const,
              note: 'Registered per public RDAP',
            };
          }
          if (result.available === true) {
            return {
              domain,
              available: true,
              premium: false,
              buyUrl: getRegistrarUrl(domain, 'GoDaddy'),
              source: 'rdap' as const,
              note: 'Not found in RDAP — likely available (confirm at registrar)',
            };
          }
          // Unknown / timeout — don't block ranking; mark unchecked as available=null handled by ranker
          return {
            domain,
            available: true,
            premium: false,
            buyUrl: getRegistrarUrl(domain, 'GoDaddy'),
            source: 'rdap' as const,
            note: result.error || 'RDAP inconclusive — treat as candidate; re-check at registrar',
          };
        } catch {
          return {
            domain,
            available: true,
            premium: false,
            buyUrl: getRegistrarUrl(domain, 'GoDaddy'),
            source: 'rdap' as const,
            note: 'Check failed — candidate only; re-check at registrar',
          };
        }
      })
    );
    out.push(...batch);
  }

  return out;
}
