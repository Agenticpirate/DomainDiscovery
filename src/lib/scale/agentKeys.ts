/**
 * Multi-agent API keys + per-agent quotas.
 *
 * Env:
 *   AGENT_API_KEY=master_secret                 # single master key (agentId: "master")
 *   AGENT_API_KEYS=sk_a:partner-a:30,sk_b:partner-b:20
 *     format: <key>:<agentId>[:<heavyRpm>]
 *   AGENT_API_KEYS_JSON={"sk_a":{"id":"partner-a","heavyRpm":30,"lightRpm":120}}
 *
 * Headers (optional identity when using master key):
 *   x-ada-agent-id: partner-a
 *   x-agent-id: partner-a
 */

export type AgentIdentity = {
  agentId: string;
  keyKind: 'open' | 'master' | 'named';
  /** Heavy tier requests/min for this agent (undefined → env default) */
  heavyRpm?: number;
  /** Light tier requests/min for this agent */
  lightRpm?: number;
};

type NamedKey = {
  key: string;
  agentId: string;
  heavyRpm?: number;
  lightRpm?: number;
};

function envTrue(name: string): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function envFalse(name: string): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  return v === '0' || v === 'false' || v === 'no' || v === 'off';
}

function parseIntSafe(v: string | undefined, fallback?: number): number | undefined {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function getMasterAgentApiKey(): string | null {
  const key = process.env.AGENT_API_KEY?.trim();
  return key ? key : null;
}

/** Parse AGENT_API_KEYS + JSON map into named keys. */
export function listNamedAgentKeys(): NamedKey[] {
  const out: NamedKey[] = [];
  const seen = new Set<string>();

  const csv = (process.env.AGENT_API_KEYS || '').trim();
  if (csv) {
    for (const part of csv.split(',')) {
      const seg = part.trim();
      if (!seg) continue;
      const bits = seg.split(':').map((s) => s.trim());
      if (bits.length < 2 || !bits[0] || !bits[1]) continue;
      const key = bits[0];
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        key,
        agentId: bits[1].replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64) || 'agent',
        heavyRpm: parseIntSafe(bits[2]),
        lightRpm: parseIntSafe(bits[3]),
      });
    }
  }

  const jsonRaw = (process.env.AGENT_API_KEYS_JSON || '').trim();
  if (jsonRaw) {
    try {
      const obj = JSON.parse(jsonRaw) as Record<
        string,
        { id?: string; agentId?: string; heavyRpm?: number; lightRpm?: number } | string
      >;
      for (const [key, val] of Object.entries(obj)) {
        if (!key || seen.has(key)) continue;
        seen.add(key);
        if (typeof val === 'string') {
          out.push({ key, agentId: val.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64) || 'agent' });
        } else {
          const agentId = (val.agentId || val.id || 'agent')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 64);
          out.push({
            key,
            agentId,
            heavyRpm: typeof val.heavyRpm === 'number' ? val.heavyRpm : undefined,
            lightRpm: typeof val.lightRpm === 'number' ? val.lightRpm : undefined,
          });
        }
      }
    } catch {
      /* ignore bad JSON */
    }
  }

  return out;
}

export function isAgentAuthRequired(): boolean {
  if (envTrue('AGENT_REQUIRE_AUTH')) return true;
  if (envFalse('AGENT_REQUIRE_AUTH')) return false;
  return process.env.NODE_ENV === 'production';
}

export function anyAgentKeyConfigured(): boolean {
  return Boolean(getMasterAgentApiKey()) || listNamedAgentKeys().length > 0;
}

function extractToken(request: Request): string {
  const header = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const bearer = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const alt = request.headers.get('x-agent-api-key')?.trim();
  return bearer || alt || '';
}

function headerAgentId(request: Request): string | undefined {
  const raw =
    request.headers.get('x-ada-agent-id') ||
    request.headers.get('x-agent-id') ||
    request.headers.get('x-ada-client-id') ||
    '';
  const id = raw.trim().replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
  return id || undefined;
}

/**
 * Authorize + resolve agent identity for rate-limit buckets.
 */
export function authorizeAgentIdentity(
  request: Request
): { ok: true; identity: AgentIdentity } | { ok: false; status: number; error: string } {
  const master = getMasterAgentApiKey();
  const named = listNamedAgentKeys();
  const mustAuth = isAgentAuthRequired();
  const configured = Boolean(master) || named.length > 0;

  if (mustAuth && !configured) {
    return {
      ok: false,
      status: 503,
      error:
        'Agent auth required but no AGENT_API_KEY / AGENT_API_KEYS configured. Set a key or AGENT_REQUIRE_AUTH=false for open demos.',
    };
  }

  // Open mode (dev / demos)
  if (!configured) {
    return {
      ok: true,
      identity: {
        agentId: headerAgentId(request) || `ip-open`,
        keyKind: 'open',
      },
    };
  }

  const token = extractToken(request);
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'Unauthorized — set Authorization: Bearer <key> or x-agent-api-key',
    };
  }

  // Named keys first
  const hit = named.find((n) => n.key === token);
  if (hit) {
    return {
      ok: true,
      identity: {
        agentId: hit.agentId,
        keyKind: 'named',
        heavyRpm: hit.heavyRpm,
        lightRpm: hit.lightRpm,
      },
    };
  }

  // Master key
  if (master && token === master) {
    return {
      ok: true,
      identity: {
        agentId: headerAgentId(request) || 'master',
        keyKind: 'master',
      },
    };
  }

  return {
    ok: false,
    status: 401,
    error: 'Unauthorized — invalid agent API key',
  };
}

export function agentAuthStatus() {
  const named = listNamedAgentKeys();
  return {
    keyConfigured: anyAgentKeyConfigured(),
    required: isAgentAuthRequired(),
    namedKeys: named.length,
    modes: ['Authorization: Bearer', 'x-agent-api-key'],
    identityHeaders: ['x-ada-agent-id', 'x-agent-id'],
  };
}

/** Default RPM from env */
export function defaultLightRpm(): number {
  return parseIntSafe(process.env.RATE_LIMIT_LIGHT_RPM, 120) ?? 120;
}

export function defaultHeavyRpm(): number {
  return parseIntSafe(process.env.RATE_LIMIT_HEAVY_RPM, 20) ?? 20;
}

export function defaultIpHeavyRpm(): number {
  return parseIntSafe(process.env.RATE_LIMIT_IP_HEAVY_RPM, 10) ?? 10;
}

export function defaultIpLightRpm(): number {
  return parseIntSafe(process.env.RATE_LIMIT_IP_LIGHT_RPM, 60) ?? 60;
}
