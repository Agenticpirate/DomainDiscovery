/**
 * Unified agent scale gate: auth identity + light/heavy rate limits + concurrency.
 */

import { getClientIP, rateLimitResponse, type RateLimitResult } from '@/lib/rateLimiter';
import {
  authorizeAgentIdentity,
  defaultHeavyRpm,
  defaultIpHeavyRpm,
  defaultIpLightRpm,
  defaultLightRpm,
  type AgentIdentity,
} from './agentKeys';
import { checkDistributedRateLimit } from './distributedRateLimit';

export type ScaleTier = 'light' | 'heavy';

export type ScaleGateOk = {
  ok: true;
  identity: AgentIdentity;
  ip: string;
  agentRl: RateLimitResult;
  ipRl: RateLimitResult;
  tier: ScaleTier;
  /** Reserved for compatibility — concurrency is held inside heavy pipelines. */
  release: () => Promise<void>;
};

export type ScaleGateFail = {
  ok: false;
  response: Response;
};

const HEAVY_TOOLS = new Set([
  'find_brand_domains',
  'generate_domain_names',
  'check_domain_availability',
  'rank_domains',
  'whois_lookup',
  'generate_geo_domains',
  'compare_tld_prices',
  'register_domain',
  'set_dns_records',
]);

const LIGHT_TOOLS = new Set([
  'get_product_facts',
  'parse_business_brief',
  'list_agent_skills',
  'list_agent_registrars',
]);

/** Classify MCP tool for rate tier */
export function toolTier(toolName: string | undefined | null): ScaleTier {
  if (!toolName) return 'light';
  if (HEAVY_TOOLS.has(toolName)) return 'heavy';
  if (LIGHT_TOOLS.has(toolName)) return 'light';
  // unknown tools default to heavy (safer)
  return 'heavy';
}

export function mcpMethodTier(method: string, toolName?: string): ScaleTier {
  if (method === 'tools/call' || method === 'call_tool') return toolTier(toolName);
  // initialize, tools/list, ping, etc.
  return 'light';
}

/**
 * Authorize + dual rate-limit (per-agent + per-IP).
 * Heavy concurrency load-shed lives in `withHeavySlot` around pipeline/tool work
 * so async jobs keep a slot for the whole run, not just HTTP accept.
 */
export async function enforceAgentScale(
  request: Request,
  opts: { tier: ScaleTier; route: string }
): Promise<ScaleGateOk | ScaleGateFail> {
  const auth = authorizeAgentIdentity(request);
  if (!auth.ok) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  const { identity } = auth;
  const ip = getClientIP(request);
  const tier = opts.tier;

  const agentLimit =
    tier === 'heavy'
      ? identity.heavyRpm ?? defaultHeavyRpm()
      : identity.lightRpm ?? defaultLightRpm();
  const ipLimit = tier === 'heavy' ? defaultIpHeavyRpm() : defaultIpLightRpm();

  // Agent bucket (per agent id) + IP floor (abuse from shared key / NAT)
  const agentKey = `${tier}:agent:${identity.agentId}:${opts.route}`;
  const ipKey = `${tier}:ip:${ip}:${opts.route}`;

  const agentRl = await checkDistributedRateLimit(agentKey, agentLimit);
  if (!agentRl.allowed) {
    return {
      ok: false,
      response: rateLimitResponse(
        agentRl,
        'Agent quota exceeded. Slow down or request a higher tier.'
      ),
    };
  }

  const ipRl = await checkDistributedRateLimit(ipKey, ipLimit);
  if (!ipRl.allowed) {
    return { ok: false, response: rateLimitResponse(ipRl) };
  }

  return {
    ok: true,
    identity,
    ip,
    agentRl,
    ipRl,
    tier,
    release: async () => {},
  };
}

/** Attach scale headers to a NextResponse-like Response */
export function applyScaleHeaders(
  response: Response,
  gate: ScaleGateOk
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', String(gate.agentRl.limit));
  headers.set('X-RateLimit-Remaining', String(gate.agentRl.remaining));
  headers.set('X-RateLimit-Reset', String(gate.agentRl.resetTime));
  headers.set('X-ADA-Agent-Id', gate.identity.agentId);
  headers.set('X-ADA-Scale-Tier', gate.tier);
  headers.set('X-ADA-IP-Remaining', String(gate.ipRl.remaining));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
