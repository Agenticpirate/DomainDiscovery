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

/**
 * Call the Instant Domain Search MCP via SSE
 */
async function callMCPTool(
  toolName: string, 
  args: Record<string, unknown>
): Promise<unknown> {
  const url = 'https://instantdomainsearch.com/mcp/sse';
  
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('MCP request timeout'));
    }, 10000);

    const id = ++messageId;
    
    // Create the JSON-RPC request
    const request: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(request),
      signal: controller.signal
    })
    .then(async response => {
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`MCP request failed: ${response.status}`);
      }

      const text = await response.text();
      
      // Parse SSE response
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.result) {
              resolve(data.result);
              return;
            }
            if (data.error) {
              reject(new Error(data.error.message));
              return;
            }
          } catch (e) {
            // Continue parsing
          }
        }
      }
      
      // Try parsing as plain JSON
      try {
        const json = JSON.parse(text);
        if (json.result) {
          resolve(json.result);
          return;
        }
      } catch (e) {
        // Not JSON
      }
      
      resolve(text);
    })
    .catch(error => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Check domain availability using Instant Domain Search MCP
 */
export async function checkDomainAvailabilityViaMCP(params: { domains: string[] }): Promise<DomainCheckResult[]> {
  try {
    const result = await callMCPTool('check_domain_availability', {
      domains: params.domains
    });
    
    // Parse the result
    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        domain: item.domain || item.name,
        available: item.available ?? item.isAvailable ?? false,
        premium: item.premium ?? item.isPremium ?? false,
        price: item.price
      }));
    }
    
    // Handle text response
    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            domain: item.domain || item.name,
            available: item.available ?? item.isAvailable ?? false,
            premium: item.premium ?? item.isPremium ?? false,
            price: item.price
          }));
        }
      } catch (e) {
        // Not JSON
      }
    }
    
    // Fallback
    return params.domains.map(domain => ({
      domain,
      available: false
    }));
  } catch (error) {
    console.error('MCP check_domain_availability error:', error);
    throw error;
  }
}

/**
 * Search domains using Instant Domain Search MCP
 */
export async function searchDomainsViaMCP(params: { query: string; tlds?: string[] }): Promise<DomainCheckResult[]> {
  try {
    const result = await callMCPTool('search_domains', {
      query: params.query,
      tlds: params.tlds || ['.com', '.net', '.org', '.ai', '.io', '.co']
    });
    
    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        domain: item.domain || item.name,
        available: item.available ?? item.isAvailable ?? false,
        premium: item.premium ?? item.isPremium ?? false,
        price: item.price
      }));
    }
    
    return [];
  } catch (error) {
    console.error('MCP search_domains error:', error);
    throw error;
  }
}

/**
 * Generate domain variations using Instant Domain Search MCP
 */
export async function generateDomainVariationsViaMCP(params: { keyword: string; count?: number }): Promise<DomainCheckResult[]> {
  try {
    const result = await callMCPTool('generate_domain_variations', {
      keyword: params.keyword,
      count: params.count || 10
    });
    
    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        domain: item.domain || item.name,
        available: item.available ?? item.isAvailable ?? false,
        premium: item.premium ?? item.isPremium ?? false,
        price: item.price
      }));
    }
    
    return [];
  } catch (error) {
    console.error('MCP generate_domain_variations error:', error);
    throw error;
  }
}
