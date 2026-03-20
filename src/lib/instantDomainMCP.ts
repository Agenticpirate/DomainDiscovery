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
      return params.domains.map(domain => ({
        domain,
        available: false
      }));
    }

    return items.map((item) => {
      const domain = `${item.label || item.domain}.${item.tld || ''}`.replace(/\.+$/, '');
      const markets = Array.isArray(item.markets) ? item.markets as Array<Record<string, unknown>> : [];
      const firstPrice = markets.find((market) => typeof market.price === 'number' || typeof market.min_price === 'number');
      const rawPrice = firstPrice?.price ?? firstPrice?.min_price;
      const price = typeof rawPrice === 'number' && rawPrice > 0 ? `$${(rawPrice / 100).toFixed(2)}` : undefined;
      return {
        domain,
        available: !(item.isRegistered ?? false),
        premium: markets.length > 0,
        price,
      };
    });
  } catch (error) {
    console.error('MCP check_domain_availability error:', error);
    return params.domains.map(domain => ({
      domain,
      available: false
    }));
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
      return items.map((item) => ({
        domain: `${item.label || params.query}.${item.tld || ''}`.replace(/\.+$/, ''),
        available: !(item.isRegistered ?? false),
        premium: Array.isArray(item.markets) && item.markets.length > 0,
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
      return items.map((item) => ({
        domain: `${item.label || params.keyword}.${item.tld || 'com'}`.replace(/\.+$/, ''),
        available: !(item.isRegistered ?? false),
        premium: Array.isArray(item.markets) && item.markets.length > 0,
        price: undefined,
      }));
    }

    return [];
  } catch (error) {
    console.error('MCP generate_domain_variations error:', error);
    return [];
  }
}
