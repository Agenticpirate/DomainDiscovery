/**
 * Instant Domain Search MCP Client
 * 
 * Connects to the Instant Domain Search MCP server for real-time domain availability.
 * MCP Server: https://instantdomainsearch.com/mcp/sse
 * 
 * Available tools:
 * - search_domains: Check bulk availability across multiple TLDs
 * - generate_domain_variations: Get intelligent alternatives
 * - check_domain_availability: Verify any list of domains
 */

interface MCPMessage {
  jsonrpc: '2.0';
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: number; message: string };
}

interface DomainCheckResult {
  domain: string;
  available: boolean;
  premium?: boolean;
  price?: string;
  buyUrl?: string;
  purchaseInfo?: string;
}

function getGoDaddyListingUrl(domain: string): string {
  return `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`;
}

function normalizeDomainFromItem(item: Record<string, unknown>, fallbackLabel?: string): string | null {
  const explicitDomain = typeof item.domain === 'string' ? item.domain.trim().toLowerCase() : '';
  if (explicitDomain) {
    return explicitDomain;
  }

  const label = typeof item.label === 'string' ? item.label.trim().toLowerCase() : fallbackLabel?.trim().toLowerCase() || '';
  const tld = typeof item.tld === 'string' ? item.tld.trim().toLowerCase().replace(/^\./, '') : '';

  if (!label) {
    return null;
  }

  return tld ? `${label}.${tld}` : label;
}

function getBooleanValue(item: Record<string, unknown>, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
}

function hasSaleKeyword(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /premium|aftermarket|marketplace|for sale|forsale|buy now|brokered|resale|secondary/i.test(value)
  );
}

function inferPremiumFromMarkets(markets: Array<Record<string, unknown>>): boolean {
  return markets.some((market) => {
    const rawPrice = market.price ?? market.min_price;
    if (typeof rawPrice === 'number' && rawPrice > 0) {
      return true;
    }

    const explicitBoolean = getBooleanValue(market, [
      'premium',
      'isPremium',
      'forSale',
      'isForSale',
      'aftermarket',
      'isAftermarket',
      'brokered',
      'isBrokered',
      'secondary',
      'isSecondary',
    ]);

    if (explicitBoolean) {
      return true;
    }

    return ['type', 'listingType', 'kind', 'status', 'source', 'marketType', 'channel'].some((key) =>
      hasSaleKeyword(market[key])
    );
  });
}

function formatMarketPrice(markets: Array<Record<string, unknown>>): string | undefined {
  const firstPrice = markets.find((market) => typeof market.price === 'number' || typeof market.min_price === 'number');
  const rawPrice = firstPrice?.price ?? firstPrice?.min_price;
  return typeof rawPrice === 'number' && rawPrice > 0 ? `$${(rawPrice / 100).toFixed(2)}` : undefined;
}

function getPremiumListingUrl(domain: string, markets: Array<Record<string, unknown>>, fallbackBuyUrl?: string): string | undefined {
  if (markets.length > 0) {
    return getGoDaddyListingUrl(domain);
  }

  if (typeof fallbackBuyUrl === 'string' && fallbackBuyUrl.trim()) {
    return /instantdomainsearch\.com\/get\//i.test(fallbackBuyUrl)
      ? getGoDaddyListingUrl(domain)
      : fallbackBuyUrl;
  }

  return undefined;
}

function getPurchaseInfo(markets: Array<Record<string, unknown>>, fallbackPurchaseInfo?: string): string | undefined {
  if (markets.length > 0) {
    return 'View listing on GoDaddy';
  }

  if (typeof fallbackPurchaseInfo === 'string' && fallbackPurchaseInfo.trim()) {
    return /instantdomainsearch\.com\/get\//i.test(fallbackPurchaseInfo)
      ? 'View listing on GoDaddy'
      : fallbackPurchaseInfo;
  }

  return undefined;
}

function parseDomainItem(
  item: Record<string, unknown>,
  options?: { fallbackLabel?: string }
): DomainCheckResult | null {
  const domain = normalizeDomainFromItem(item, options?.fallbackLabel);
  if (!domain) {
    return null;
  }

  const markets = Array.isArray(item.markets) ? (item.markets as Array<Record<string, unknown>>) : [];
  const explicitPremium = getBooleanValue(item, ['premium', 'isPremium', 'forSale', 'isForSale']);
  const premium = explicitPremium === true || inferPremiumFromMarkets(markets);

  const explicitAvailable = getBooleanValue(item, ['available', 'isAvailable']);
  const explicitRegistered = getBooleanValue(item, ['isRegistered', 'registered']);

  let available: boolean | undefined;
  if (typeof explicitAvailable === 'boolean') {
    available = explicitAvailable;
  } else if (typeof explicitRegistered === 'boolean') {
    available = !explicitRegistered;
  } else if (premium) {
    available = false;
  }

  if (typeof available !== 'boolean') {
    return null;
  }

  return {
    domain,
    available: available && !premium,
    premium,
    price: formatMarketPrice(markets),
    buyUrl: getPremiumListingUrl(domain, markets, typeof item.buy_url === 'string' ? item.buy_url : undefined),
    purchaseInfo: getPurchaseInfo(markets, typeof item.purchase_info === 'string' ? item.purchase_info : undefined),
  };
}

let messageId = 0;

interface MCPToolResponse {
  result?: {
    content?: Array<{
      type?: string;
      text?: string;
    }>;
    isError?: boolean;
  };
  error?: { message?: string };
}

function extractJsonFromText(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('MCP response did not include JSON content');
  }
  return JSON.parse(text.slice(start, end + 1));
}

function parseToolPayload(result: unknown): unknown {
  if (!result) return null;
  if (typeof result === 'string') return extractJsonFromText(result);
  return result;
}

async function callMCPTool(
  toolName: string, 
  args: Record<string, unknown>,
  timeoutMs: number = 1_200
): Promise<unknown> {
  const url = 'https://instantdomainsearch.com/mcp/streamable-http';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const id = ++messageId;
    const request: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status}`);
    }

    const data = (await response.json()) as MCPToolResponse;
    if (data.error?.message) {
      throw new Error(data.error.message);
    }

    const textPayload = data.result?.content?.find((item) => item.type === 'text' && item.text)?.text;
    if (!textPayload) {
      return null;
    }

    return parseToolPayload(textPayload);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Check domain availability using Instant Domain Search MCP
 */
export async function checkDomainAvailabilityViaMCP(params: { domains: string[] }): Promise<DomainCheckResult[]> {
  try {
    const result = await callMCPTool('check_domain_availability', {
      domains: params.domains
    }, 900);

    const items = (result as { results?: Array<Record<string, unknown>> } | null)?.results;
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item) => parseDomainItem(item))
      .filter((item): item is DomainCheckResult => item !== null);
  } catch (error) {
    console.error('MCP check_domain_availability error:', error);
    return [];
  }
}

/**
 * Search domains using Instant Domain Search MCP
 */
export async function searchDomainsViaMCP(params: { query: string; tlds?: string[] }): Promise<DomainCheckResult[]> {
  try {
    const result = await callMCPTool('search_domains', {
      name: params.query,
      tlds: (params.tlds || ['.com', '.net', '.org', '.ai', '.io', '.co']).map((tld) => tld.replace(/^\./, '')),
      limit: Math.min((params.tlds || []).length || 6, 100),
    }, 700);

    const items = (result as { domains?: Array<Record<string, unknown>> } | null)?.domains;
    if (Array.isArray(items)) {
      return items
        .map((item) => parseDomainItem(item, { fallbackLabel: params.query }))
        .filter((entry): entry is DomainCheckResult => entry !== null)
        .map((entry) => ({
          ...entry,
          price: undefined,
        }));
    }

    return [];
  } catch (error) {
    console.error('MCP search_domains error:', error);
    return [];
  }
}

/**
 * Generate domain variations using Instant Domain Search MCP
 */
export async function generateDomainVariationsViaMCP(params: { keyword: string; count?: number }): Promise<DomainCheckResult[]> {
  try {
    const result = await callMCPTool('generate_domain_variations', {
      name: params.keyword,
      limit: params.count || 10,
    }, 1_000);

    const items = (result as { variations?: Array<Record<string, unknown>> } | null)?.variations;
    if (Array.isArray(items)) {
      return items
        .map((item) => parseDomainItem(item, { fallbackLabel: params.keyword }))
        .filter((entry): entry is DomainCheckResult => entry !== null)
        .map((entry) => ({
          ...entry,
          price: undefined,
        }));
    }

    return [];
  } catch (error) {
    console.error('MCP generate_domain_variations error:', error);
    return [];
  }
}
