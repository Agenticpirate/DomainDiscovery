/**
 * MCP Proxy for Server-Side MCP Tool Calls
 * 
 * This proxy allows Next.js API routes to call MCP tools that are configured in Kiro.
 * It connects to the MCP server directly using the same configuration.
 */

interface MCPToolCall {
  tool: string;
  arguments: Record<string, any>;
}

interface MCPResponse {
  content: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
}

/**
 * Call an MCP tool from the GoDaddy MCP server
 */
export async function callInstantDomainSearchMCP(
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  try {
    // GoDaddy MCP endpoint for direct integration
    const mcpServerUrl = 'https://api.godaddy.com/v1/domains/mcp';
    
    const requestBody = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    };

    console.log(`Calling GoDaddy MCP tool: ${toolName}`, args);

    const response = await fetch(mcpServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MCP server error (${response.status}):`, errorText);
      throw new Error(`MCP server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('MCP response:', JSON.stringify(data, null, 2));
    
    // Parse MCP response
    if (data.result) {
      if (data.result.content) {
        return parseMCPContent(data.result.content);
      }
      return data.result;
    }
    
    if (data.error) {
      throw new Error(data.error.message || 'MCP tool call failed');
    }
    
    return data;
  } catch (error) {
    console.error(`MCP tool call failed (${toolName}):`, error);
    throw error;
  }
}

/**
 * Parse MCP content array into usable data
 */
function parseMCPContent(content: Array<any>): any {
  if (!Array.isArray(content)) return content;
  
  // Find text content
  const textContent = content.find(item => item.type === 'text');
  if (textContent && textContent.text) {
    // Try to parse as JSON
    try {
      return JSON.parse(textContent.text);
    } catch {
      return textContent.text;
    }
  }
  
  // Find resource content
  const resourceContent = content.find(item => item.type === 'resource');
  if (resourceContent) {
    return resourceContent;
  }
  
  return content;
}

/**
 * Check domain availability using Instant Domain Search MCP
 */
export async function checkDomainsViaMCP(
  domains: string[]
): Promise<Array<{ domain: string; available: boolean; premium?: boolean }>> {
  try {
    const result = await callInstantDomainSearchMCP('check_domain_availability', {
      domains,
    });
    
    // Parse the result
    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        domain: item.domain || item.name,
        available: item.available ?? item.isAvailable ?? false,
        premium: item.premium ?? item.isPremium ?? item.type === 'premium' ?? false,
      }));
    }
    
    // If result is a string, try to extract domain info
    if (typeof result === 'string') {
      // Parse formatted text response
      return parseDomainTextResponse(result, domains);
    }
    
    // Fallback: return domains as unavailable
    return domains.map(domain => ({
      domain,
      available: false,
      premium: false,
    }));
  } catch (error) {
    console.error('MCP check_domain_availability failed:', error);
    throw error;
  }
}

/**
 * Parse text response from MCP into domain results
 */
function parseDomainTextResponse(
  text: string,
  domains: string[]
): Array<{ domain: string; available: boolean; premium?: boolean }> {
  const results: Array<{ domain: string; available: boolean; premium?: boolean }> = [];
  
  for (const domain of domains) {
    const domainLower = domain.toLowerCase();
    
    // Check if domain is mentioned as available
    const isAvailable = 
      text.toLowerCase().includes(`${domainLower}`) &&
      (text.toLowerCase().includes('available') || text.toLowerCase().includes('✅'));
    
    // Check if domain is mentioned as premium
    const isPremium = 
      text.toLowerCase().includes(`${domainLower}`) &&
      (text.toLowerCase().includes('premium') || text.toLowerCase().includes('⭐'));
    
    // Check if domain is mentioned as unavailable
    const isUnavailable = 
      text.toLowerCase().includes(`${domainLower}`) &&
      (text.toLowerCase().includes('unavailable') || 
       text.toLowerCase().includes('taken') || 
       text.toLowerCase().includes('❌'));
    
    results.push({
      domain,
      available: isAvailable || isPremium,
      premium: isPremium,
    });
  }
  
  return results;
}

/**
 * Search domains across TLDs using Instant Domain Search MCP
 */
export async function searchDomainsViaMCP(
  query: string,
  tlds: string[] = ['.com', '.net', '.org', '.io', '.ai', '.co']
): Promise<Array<{ domain: string; available: boolean; premium?: boolean }>> {
  try {
    const result = await callInstantDomainSearchMCP('search_domains', {
      query,
      tlds,
    });
    
    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        domain: item.domain || `${query}${item.tld}`,
        available: item.available ?? item.isAvailable ?? false,
        premium: item.premium ?? item.isPremium ?? false,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('MCP search_domains failed:', error);
    throw error;
  }
}

/**
 * Generate domain variations using Instant Domain Search MCP
 */
export async function generateDomainVariationsViaMCP(
  keyword: string,
  count: number = 10
): Promise<Array<{ domain: string; available: boolean; score?: number }>> {
  try {
    const result = await callInstantDomainSearchMCP('generate_domain_variations', {
      keyword,
      count,
    });
    
    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        domain: item.domain || item.name,
        available: item.available ?? item.isAvailable ?? false,
        score: item.score,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('MCP generate_domain_variations failed:', error);
    throw error;
  }
}
