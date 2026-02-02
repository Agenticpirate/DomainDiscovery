import { NextRequest, NextResponse } from 'next/server';

// In-memory cache
const cache = new Map<string, { available: boolean; premium?: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { domain, domains } = await request.json();
    const domainsToCheck: string[] = domains || (domain ? [domain] : []);
    
    if (domainsToCheck.length === 0) {
      return NextResponse.json({ error: 'Domain(s) required' }, { status: 400 });
    }

    const limitedDomains = domainsToCheck.slice(0, 500);
    const results: { domain: string; available: boolean; premium?: boolean }[] = [];
    const uncachedDomains: string[] = [];

    // Check cache first
    for (const d of limitedDomains) {
      const normalizedDomain = d.toLowerCase().trim();
      const cached = cache.get(normalizedDomain);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        results.push({ 
          domain: normalizedDomain, 
          available: cached.available,
          premium: cached.premium 
        });
        continue;
      }
      uncachedDomains.push(normalizedDomain);
    }

    // Check uncached domains via DNS (no premium detection)
    if (uncachedDomains.length > 0) {
      console.log(`Checking ${uncachedDomains.length} domains via DNS...`);
      const dnsResults = await checkDomainsViaDNS(uncachedDomains);
      
      for (const result of dnsResults) {
        // DNS can only tell us if domain is available or taken
        // We cannot detect premium domains without registrar API access
        cache.set(result.domain, { 
          available: result.available,
          premium: false, // Never mark as premium without definitive data
          timestamp: Date.now() 
        });
        
        results.push({
          domain: result.domain,
          available: result.available,
          premium: false,
        });
      }
      
      console.log(`✅ DNS check complete: ${dnsResults.length} results`);
    }

    // Return results in original order
    const orderedResults = limitedDomains.map(d => {
      const normalizedDomain = d.toLowerCase().trim();
      return results.find(r => r.domain === normalizedDomain) || { 
        domain: normalizedDomain, 
        available: false 
      };
    });

    console.log(`Checked ${limitedDomains.length} domains in ${Date.now() - startTime}ms`);
    return NextResponse.json(domain ? orderedResults[0] : orderedResults);

  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}

// Fallback DNS checking (less accurate, doesn't detect premium domains)
async function checkDomainsViaDNS(domains: string[]): Promise<{ domain: string; available: boolean }[]> {
  const promises = domains.map(domain => checkSingleDomain(domain));
  return Promise.all(promises);
}

async function checkSingleDomain(domain: string): Promise<{ domain: string; available: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 500);

    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      { signal: controller.signal, headers: { 'Accept': 'application/dns-json' } }
    );

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      // Status 3 = NXDOMAIN (domain doesn't exist, likely available)
      // Note: This doesn't detect premium domains, only if domain resolves
      return { domain, available: data.Status === 3 };
    }
  } catch {
    // Timeout or error - assume not available to be safe
  }
  return { domain, available: false };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 });
  }
  const body = JSON.stringify({ domain });
  const newRequest = new NextRequest(request.url, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' }
  });
  return POST(newRequest);
}
