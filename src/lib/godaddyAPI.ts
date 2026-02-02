/**
 * GoDaddy Domain API Client
 * 
 * Official GoDaddy API for domain availability checking
 * Docs: https://developer.godaddy.com/doc/endpoint/domains
 */

interface GoDaddyDomainAvailability {
  available: boolean;
  domain: string;
  definitive: boolean;
  price?: number;
  currency?: string;
  period?: number;
}

/**
 * Check domain availability using GoDaddy API
 */
export async function checkDomainWithGoDaddy(
  domain: string
): Promise<{ domain: string; available: boolean; premium?: boolean; price?: number }> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('GoDaddy API credentials not configured');
  }

  try {
    const response = await fetch(
      `https://api.godaddy.com/v1/domains/available?domain=${encodeURIComponent(domain)}&checkType=FULL`,
      {
        method: 'GET',
        headers: {
          'Authorization': `sso-key ${apiKey}:${apiSecret}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GoDaddy API error (${response.status}) for ${domain}:`, errorText);
      
      // Try to parse error JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error details:', errorJson);
      } catch (e) {
        // Not JSON
      }
      
      throw new Error(`GoDaddy API returned ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data: GoDaddyDomainAvailability = await response.json();

    // GoDaddy returns price in micro-units (1,000,000 = $1)
    const priceInDollars = data.price ? data.price / 1000000 : undefined;
    
    // Premium domains typically have higher prices
    const isPremium = priceInDollars ? priceInDollars > 20 : false;

    return {
      domain: data.domain,
      available: data.available,
      premium: isPremium,
      price: priceInDollars,
    };
  } catch (error) {
    console.error(`GoDaddy API error for ${domain}:`, error);
    throw error;
  }
}

/**
 * Check multiple domains in parallel
 */
export async function checkDomainsWithGoDaddy(
  domains: string[]
): Promise<Array<{ domain: string; available: boolean; premium?: boolean; price?: number }>> {
  // GoDaddy API doesn't have a bulk endpoint, so we check in parallel
  // Limit concurrency to avoid rate limits (60 requests/minute)
  const batchSize = 10;
  const results: Array<{ domain: string; available: boolean; premium?: boolean; price?: number }> = [];

  for (let i = 0; i < domains.length; i += batchSize) {
    const batch = domains.slice(i, i + batchSize);
    const batchPromises = batch.map(domain => 
      checkDomainWithGoDaddy(domain).catch(error => {
        console.error(`Failed to check ${domain}:`, error);
        return { domain, available: false };
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < domains.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Search for domain suggestions using GoDaddy API
 */
export async function searchDomainsWithGoDaddy(
  query: string,
  tlds: string[] = ['.com', '.net', '.org']
): Promise<Array<{ domain: string; available: boolean; premium?: boolean }>> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('GoDaddy API credentials not configured');
  }

  try {
    // Build domain list from query + TLDs
    const domains = tlds.map(tld => `${query}${tld}`);
    
    // Check all domains
    return await checkDomainsWithGoDaddy(domains);
  } catch (error) {
    console.error('GoDaddy domain search error:', error);
    throw error;
  }
}

/**
 * Get domain suggestions from GoDaddy
 */
export async function getDomainSuggestions(
  query: string,
  limit: number = 10
): Promise<Array<{ domain: string; available: boolean }>> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('GoDaddy API credentials not configured');
  }

  try {
    const response = await fetch(
      `https://api.godaddy.com/v1/domains/suggest?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `sso-key ${apiKey}:${apiSecret}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GoDaddy API returned ${response.status}`);
    }

    const suggestions = await response.json();
    
    return suggestions.map((item: any) => ({
      domain: item.domain,
      available: item.available ?? true,
    }));
  } catch (error) {
    console.error('GoDaddy suggestions error:', error);
    throw error;
  }
}
