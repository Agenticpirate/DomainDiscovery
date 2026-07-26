import { NextRequest } from 'next/server';
import { jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { getSiteBaseUrl, SITE_BRAND, SITE_PRODUCT_FACTS } from '@/lib/seoSiteFacts';
import { AGENT_TOOL_CATALOG } from '@/lib/agent/tools/registry';
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/agent/mcp/server';
import { agentAuthStatus } from '@/lib/agent/mcp/auth';
import { useInstantDomainMcp } from '@/lib/ada/freeMode';
import { listWiredAdapterIds } from '@/lib/agent/registrars/dispatch';
import { skillsManifest } from '@/lib/agent/skills/catalog';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

/**
 * GET /api/agent/manifest — machine-readable agent capabilities + MCP tools.
 */
export async function GET(request: NextRequest) {
  const base = getSiteBaseUrl();
  const auth = agentAuthStatus();
  const mutations =
    (process.env.ADA_ENABLE_REGISTRAR_MUTATIONS || '').trim().toLowerCase() === 'true' ||
    (process.env.ADA_ENABLE_REGISTRAR_MUTATIONS || '').trim() === '1';

  return jsonResponse(
    {
      name: SITE_BRAND.name,
      alternateNames: SITE_BRAND.alternateNames,
      product: 'AI Domain Assistant',
      mcpServer: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      agentReady: FEATURE_FLAGS.domainAgent,
      mcpReady: FEATURE_FLAGS.domainAgent,
      productFacts: SITE_PRODUCT_FACTS,
      auth: {
        ...auth,
        note: auth.required
          ? 'Send Authorization: Bearer <AGENT_API_KEY> or x-agent-api-key on agent endpoints.'
          : 'Auth optional in this environment; if AGENT_API_KEY is set, it is enforced.',
      },
      runtime: {
        instantDomainMcp: useInstantDomainMcp(),
        registrarMutations: mutations,
        wiredAdapters: listWiredAdapterIds(),
      },
      endpoints: {
        health: `${base}/api/agent/health`,
        auto: `${base}/api/agent/auto`,
        job: `${base}/api/agent/jobs/{id}`,
        manifest: `${base}/api/agent/manifest`,
        skills: `${base}/api/agent/skills`,
        register: `${base}/api/agent/register`,
        mcp: `${base}/api/mcp`,
        chat: `${base}/api/ada/chat`,
        agentCard: `${base}/.well-known/agent-card.json`,
        adaAgentCard: `${base}/ada/.well-known/agent-card.json`,
        mcpJsonRpc: `${base}/api/mcp (Accept: application/json, method tools/call|tools/list)`,
      },
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
      byok: skillsManifest().byok,
      install: {
        stdio: 'npm run mcp:server',
        http: `${base}/api/mcp`,
        cursor: {
          mcpServers: {
            'ai-domain-assistant': {
              url: `${base}/api/mcp`,
              headers: auth.keyConfigured
                ? { Authorization: 'Bearer <AGENT_API_KEY>' }
                : {},
            },
          },
        },
        docs: 'docs/agent/MCP.md',
        production: 'docs/agent/PRODUCTION.md',
      },
      notes: [
        'Primary tool: find_brand_domains (brand brain → Instant Domain check → rank).',
        'Availability is always from live tools, never pure LLM invention.',
        'Not a registrar by default — L3 register/DNS is opt-in BYOK + human confirm.',
        'Optional BYOK LLM: x-ada-llm-provider + x-ada-llm-api-key.',
        'Smoke: npm run agent:prod-smoke',
      ],
    },
    request,
    120
  );
}
