export type DnsAvailability = 'available' | 'taken' | 'unknown';

type DohResult = 'nxdomain' | 'exists' | 'error';

const DOH_TIMEOUT_MS = 2500;

async function queryDoh(name: string, type: 'NS' | 'A'): Promise<DohResult> {
  const encoded = encodeURIComponent(name);
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encoded}&type=${type}`,
    `https://dns.google/resolve?name=${encoded}&type=${type}`,
  ];

  for (const url of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/dns-json' },
      });
      if (!response.ok) continue;
      const data = (await response.json()) as { Status?: number };
      if (data.Status === 3) return 'nxdomain';
      if (data.Status === 0) return 'exists';
    } catch {
      /* try the next resolver */
    } finally {
      clearTimeout(timeout);
    }
  }

  return 'error';
}

/**
 * Registration signal from public DNS.
 * NXDOMAIN means the name is not in the zone (free to register).
 * An answer means it is delegated (taken). A failed lookup is unknown —
 * never reported as taken.
 */
export async function checkDnsAvailability(domain: string): Promise<DnsAvailability> {
  const ns = await queryDoh(domain, 'NS');
  if (ns === 'nxdomain') return 'available';
  if (ns === 'exists') return 'taken';

  const address = await queryDoh(domain, 'A');
  if (address === 'nxdomain') return 'available';
  if (address === 'exists') return 'taken';
  return 'unknown';
}
