import { NextRequest, NextResponse } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { applyCORS, corsPreflightResponse, errorResponse, jsonResponse } from '@/lib/apiHelpers';
import {
  createDomainDiscoveryMcpServer,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from '@/lib/agent/mcp/server';
import { AGENT_TOOL_CATALOG, invokeAgentTool } from '@/lib/agent/tools/registry';
import {
  byokFromBody,
  byokFromHeaders,
  mergeByok,
  runWithByokAsync,
  byokStatus,
} from '@/lib/agent/byokContext';
import { skillsManifest } from '@/lib/agent/skills/catalog';
import { applyScaleHeaders, enforceAgentScale, mcpMethodTier } from '@/lib/scale/gate';
import { agentAuthStatus } from '@/lib/agent/mcp/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

function byokForRequest(request: NextRequest, body?: Record<string, unknown>) {
  return mergeByok(byokFromHeaders(request.headers), byokFromBody(body));
}

function toolNameFromBody(body: Record<string, unknown> | undefined): string | undefined {
  if (!body) return undefined;
  const params = (body.params || {}) as { name?: string };
  return params.name || (body as { name?: string }).name;
}

/**
 * Simple JSON-RPC fallback for curl / lightweight agents.
 */
async function handleJsonRpc(request: NextRequest, body: Record<string, unknown>) {
  const id = body.id ?? 1;
  const method = String(body.method || '');
  const byok = byokForRequest(request, body);

  if (method === 'tools/list' || method === 'list_tools') {
    return jsonResponse(
      {
        jsonrpc: '2.0',
        id,
        result: {
          tools: AGENT_TOOL_CATALOG.map((t) => ({
            name: t.name,
            description: t.description,
          })),
          skills: skillsManifest().skills.map((s) => ({
            id: s.id,
            layer: s.layer,
            status: s.status,
            name: s.name,
          })),
          byok: byokStatus(byok),
        },
      },
      request,
      0
    );
  }

  if (method === 'tools/call' || method === 'call_tool') {
    const params = (body.params || {}) as { name?: string; arguments?: Record<string, unknown> };
    const name = params.name || (body as { name?: string }).name;
    const args = params.arguments || (body as { arguments?: Record<string, unknown> }).arguments || {};
    if (!name) {
      return jsonResponse(
        { jsonrpc: '2.0', id, error: { code: -32602, message: 'Missing tool name' } },
        request,
        0
      );
    }
    const result = await runWithByokAsync(byok, () => invokeAgentTool(name, args));
    return jsonResponse({ jsonrpc: '2.0', id, result }, request, 0);
  }

  if (method === 'initialize') {
    return jsonResponse(
      {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {}, resources: {}, prompts: {} },
          serverInfo: {
            name: MCP_SERVER_NAME,
            version: MCP_SERVER_VERSION,
            title: 'AI Domain Assistant MCP',
          },
        },
      },
      request,
      0
    );
  }

  return jsonResponse(
    {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found in JSON-RPC fallback: ${method}` },
    },
    request,
    0
  );
}

export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant / MCP is disabled', 503);
  }

  let body: Record<string, unknown> | undefined;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = undefined;
  }

  const method = body && typeof body.method === 'string' ? String(body.method) : '';
  const tool = toolNameFromBody(body);
  const tier = mcpMethodTier(method || 'tools/list', tool);

  const gate = await enforceAgentScale(request, { tier, route: 'mcp' });
  if (!gate.ok) return gate.response as NextResponse;

  try {
    const wantJsonRpc =
      request.headers.get('x-mcp-mode') === 'jsonrpc' ||
      body?.mode === 'jsonrpc' ||
      (typeof body?.method === 'string' &&
        ['tools/list', 'tools/call', 'list_tools', 'call_tool', 'initialize'].includes(
          String(body.method)
        ) &&
        request.headers.get('accept')?.includes('application/json') &&
        !request.headers.get('accept')?.includes('text/event-stream'));

    const byok = byokForRequest(request, body);

    if (wantJsonRpc && body) {
      const resp = await handleJsonRpc(request, body);
      resp.headers.set('Cache-Control', 'no-store');
      return applyScaleHeaders(resp, gate) as NextResponse;
    }

    try {
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      const server = createDomainDiscoveryMcpServer();
      await server.connect(transport);

      const headers = new Headers(request.headers);
      const init: RequestInit = {
        method: 'POST',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      };
      const req = new Request(request.url, init);
      const response = await runWithByokAsync(byok, () =>
        transport.handleRequest(req, { parsedBody: body })
      );
      const out = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      applyCORS(out, request);
      out.headers.set('Cache-Control', 'no-store');
      return applyScaleHeaders(out, gate) as NextResponse;
    } catch (e) {
      console.error('MCP HTTP error:', e);
      if (body && typeof body.method === 'string') {
        const resp = await handleJsonRpc(request, body);
        return applyScaleHeaders(resp, gate) as NextResponse;
      }
      return errorResponse(e instanceof Error ? e.message : 'MCP request failed', 500);
    }
  } finally {
    await gate.release();
  }
}

export async function GET(request: NextRequest) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant / MCP is disabled', 503);
  }

  const gate = await enforceAgentScale(request, { tier: 'light', route: 'mcp-get' });
  if (!gate.ok) return gate.response as NextResponse;

  try {
    if (request.headers.get('accept')?.includes('text/event-stream')) {
      try {
        const transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });
        const server = createDomainDiscoveryMcpServer();
        await server.connect(transport);
        const response = await transport.handleRequest(request);
        const out = new NextResponse(response.body, {
          status: response.status,
          headers: response.headers,
        });
        applyCORS(out, request);
        return applyScaleHeaders(out, gate) as NextResponse;
      } catch (e) {
        console.error('MCP GET SSE error:', e);
      }
    }

    const auth = agentAuthStatus();
    const resp = jsonResponse(
      {
        name: MCP_SERVER_NAME,
        alternateNames: ['domaindiscovery', 'AI Domain Assistant'],
        version: MCP_SERVER_VERSION,
        product: 'AI Domain Assistant · DomainDiscovery',
        transport: 'streamable-http + jsonrpc-fallback + stdio',
        tools: AGENT_TOOL_CATALOG.map((t) => ({ name: t.name, description: t.description })),
        primaryTool: 'find_brand_domains',
        scale: {
          lightHeavyTiers: true,
          perAgentQuotas: true,
          redis: Boolean(process.env.REDIS_URL),
        },
        auth: {
          optional: !auth.required,
          required: auth.required,
          header: 'Authorization: Bearer <AGENT_API_KEY|named key> or x-agent-api-key',
          identityHeaders: auth.identityHeaders,
          note: 'Named keys via AGENT_API_KEYS; master via AGENT_API_KEY',
        },
        connect: {
          httpJsonRpc: {
            url: '/api/mcp',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            listTools: {
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/list',
              params: {},
            },
            callFindBrandDomains: {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: 'find_brand_domains',
                arguments: {
                  text: 'Yoga studio for beginners',
                  maxBudgetUsd: 20,
                  count: 8,
                },
              },
            },
          },
          stdio: {
            command: 'npm run mcp:server',
            entry: 'scripts/mcp-domaindiscovery.mjs',
          },
          cursorMcpJson: {
            mcpServers: {
              'ai-domain-assistant': {
                url: 'http://localhost:5001/api/mcp',
              },
            },
          },
          agentCard: '/ada/.well-known/agent-card.json',
          docs: '/ada/docs#integration',
          manifest: '/api/agent/manifest',
        },
        constraints: {
          registersDomains: false,
          modifiesDns: false,
          humanConfirmForPurchase: true,
          inventsPrices: false,
        },
      },
      request,
      60
    );
    return applyScaleHeaders(resp, gate) as NextResponse;
  } finally {
    await gate.release();
  }
}

export async function DELETE(request: NextRequest) {
  if (!FEATURE_FLAGS.domainAgent) {
    return errorResponse('AI Domain Assistant / MCP is disabled', 503);
  }
  const gate = await enforceAgentScale(request, { tier: 'light', route: 'mcp-delete' });
  if (!gate.ok) return gate.response as NextResponse;
  try {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = createDomainDiscoveryMcpServer();
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    return new NextResponse(response.body, { status: response.status, headers: response.headers });
  } catch {
    return new NextResponse(null, { status: 204 });
  } finally {
    await gate.release();
  }
}
