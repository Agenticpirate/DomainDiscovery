import { NextRequest } from 'next/server';
import { jsonResponse, corsPreflightResponse } from '@/lib/apiHelpers';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { useInstantDomainMcp } from '@/lib/ada/freeMode';
import { agentAuthStatus } from '@/lib/agent/mcp/auth';
import { AGENT_TOOL_CATALOG } from '@/lib/agent/tools/registry';
import { listWiredAdapterIds } from '@/lib/agent/registrars/dispatch';
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/agent/mcp/server';
import { getXaiConfig } from '@/lib/ada/spacexai';
import { redisPing, getRedisBackend, isRedisConfigured } from '@/lib/scale/redisClient';
import { concurrencyStatus } from '@/lib/scale/concurrency';
import { jobStoreStats } from '@/lib/scale/jobStore';
import {
  defaultHeavyRpm,
  defaultLightRpm,
  defaultIpHeavyRpm,
  defaultIpLightRpm,
} from '@/lib/scale/agentKeys';

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

/**
 * GET /api/agent/health — load balancer / agent readiness probe.
 * Never leaks secrets.
 */
export async function GET(request: NextRequest) {
  const auth = agentAuthStatus();
  const llm = getXaiConfig();
  const mutations =
    (process.env.ADA_ENABLE_REGISTRAR_MUTATIONS || '').trim().toLowerCase() === 'true' ||
    (process.env.ADA_ENABLE_REGISTRAR_MUTATIONS || '').trim() === '1';

  const domainAgent = FEATURE_FLAGS.domainAgent;
  const redis = await redisPing();
  const ok = domainAgent && !(auth.required && !auth.keyConfigured);

  const body = {
    ok,
    service: 'ai-domain-assistant',
    version: MCP_SERVER_VERSION,
    mcpServer: MCP_SERVER_NAME,
    time: new Date().toISOString(),
    flags: {
      domainAgent,
      instantDomainMcp: useInstantDomainMcp(),
      registrarMutations: mutations,
      serverLlmEnabled: llm.enabled && llm.source === 'env',
    },
    auth,
    scale: {
      redisConfigured: isRedisConfigured(),
      redisBackend: getRedisBackend(),
      redisOk: redis.ok,
      redisLatencyMs: redis.latencyMs,
      rateLimits: {
        lightRpmDefault: defaultLightRpm(),
        heavyRpmDefault: defaultHeavyRpm(),
        ipLightRpm: defaultIpLightRpm(),
        ipHeavyRpm: defaultIpHeavyRpm(),
      },
      concurrency: concurrencyStatus(),
      jobs: jobStoreStats(),
      tiers: ['light', 'heavy'],
      headers: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-ADA-Agent-Id',
        'X-ADA-Scale-Tier',
      ],
    },
    tools: AGENT_TOOL_CATALOG.length,
    wiredAdapters: listWiredAdapterIds(),
    endpoints: {
      mcp: '/api/mcp',
      auto: '/api/agent/auto',
      chat: '/api/ada/chat',
      skills: '/api/agent/skills',
      register: '/api/agent/register',
      jobs: '/api/agent/jobs/{id}',
      manifest: '/api/agent/manifest',
      health: '/api/agent/health',
      agentCard: '/.well-known/agent-card.json',
      adaAgentCard: '/ada/.well-known/agent-card.json',
    },
    layers: {
      L0: 'live — brand brain + Instant Domain + RDAP',
      L1: 'optional — BYOK LLM invent',
      L2: 'live — guided purchase links',
      L3: mutations ? 'enabled (flag on)' : 'adapters ready, flag off',
    },
  };

  const resp = jsonResponse(body, request, 0);
  resp.headers.set('Cache-Control', 'no-store');
  if (!ok) {
    return new Response(JSON.stringify(body), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
  return resp;
}
