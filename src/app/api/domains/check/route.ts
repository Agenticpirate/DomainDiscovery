import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolveDns = promisify(dns.resolve);

/**
 * Domain Availability Check API Route
 * 
 * Uses DNS lookup to check if domains are registered.
 * If a domain has DNS records, it's taken. If not, it might be available.
 */

export async function POST(request: NextRequest) {
  try {
    const { domains } = await request.json();

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        { error: 'Domains array is required' },
        { status: 400 }
      );
    }

    // Limit to 100 domains per request
    const domainsToCheck = domains.slice(0, 100);
    
    const results = await Promise.all(
      domainsToCheck.map(async (domain: string) => {
        const available = await checkDomainAvailability(domain);
        return { domain, available };
      })
    );

    return NextResponse.json(results);

  } catch (error) {
    console.error('❌ Domain check error:', error);
    return NextResponse.json(
      { error: 'Failed to check domain availability' },
      { status: 500 }
    );
  }
}

/**
 * Check if a domain is available using DNS lookup
 * 
 * Strategy:
 * 1. Try to resolve DNS records (A, AAAA, MX, NS)
 * 2. If any records exist, domain is taken
 * 3. If no records and NXDOMAIN, domain might be available
 */
async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    // Try multiple record types
    const recordTypes = ['A', 'AAAA', 'MX', 'NS'];
    
    for (const type of recordTypes) {
      try {
        const records = await resolveDns(domain, type);
        if (records && (Array.isArray(records) ? records.length > 0 : true)) {
          // Domain has DNS records - it's taken
          return false;
        }
      } catch (err: any) {
        // ENOTFOUND or ENODATA means no records for this type
        // Continue checking other record types
        if (err.code !== 'ENOTFOUND' && err.code !== 'ENODATA' && err.code !== 'SERVFAIL') {
          // Some other error, continue
        }
      }
    }
    
    // No DNS records found - domain might be available
    // Note: This isn't 100% accurate as some registered domains don't have DNS records
    // For production, you'd want to use WHOIS or a domain registrar API
    return true;
    
  } catch (error) {
    console.error(`Error checking ${domain}:`, error);
    // On error, assume taken to be safe
    return false;
  }
}

// Also support GET for single domain check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      { error: 'Domain parameter is required' },
      { status: 400 }
    );
  }

  try {
    const available = await checkDomainAvailability(domain);
    return NextResponse.json({ domain, available });
  } catch (error) {
    console.error('Domain check error:', error);
    return NextResponse.json(
      { error: 'Failed to check domain' },
      { status: 500 }
    );
  }
}
