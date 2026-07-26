/**
 * stdio MCP entry (run via tsx) — AI Domain Assistant / DomainDiscovery tools.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  createDomainDiscoveryMcpServer,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from '../src/lib/agent/mcp/server';

async function main() {
  const server = createDomainDiscoveryMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr only — stdout is MCP JSON-RPC
  console.error(
    `AI Domain Assistant MCP (${MCP_SERVER_NAME}@${MCP_SERVER_VERSION}) running on stdio`
  );
}

main().catch((err) => {
  console.error('MCP server failed:', err);
  process.exit(1);
});
