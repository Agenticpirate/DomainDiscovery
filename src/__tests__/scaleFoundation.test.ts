/**
 * Scale foundation unit tests (memory path — no Redis required).
 */

import {
  authorizeAgentIdentity,
  listNamedAgentKeys,
  defaultHeavyRpm,
} from '../lib/scale/agentKeys';
import {
  checkDistributedRateLimit,
  resetMemoryRateLimits,
} from '../lib/scale/distributedRateLimit';
import { toolTier, mcpMethodTier } from '../lib/scale/gate';
import {
  saveAgentJob,
  getAgentJobDurable,
  getAgentJobMemory,
} from '../lib/scale/jobStore';
import type { AgentJob } from '../lib/agent/types';

function mockRequest(headers: Record<string, string> = {}): Request {
  return {
    headers: {
      get: (name: string) => {
        const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
        return key ? headers[key] : null;
      },
    },
  } as unknown as Request;
}

describe('scale agent keys', () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it('parses AGENT_API_KEYS named partners', () => {
    process.env.AGENT_API_KEYS = 'sk_a:acme:40:200,sk_b:beta:10';
    delete process.env.AGENT_API_KEYS_JSON;
    const keys = listNamedAgentKeys();
    expect(keys.length).toBe(2);
    expect(keys[0]).toMatchObject({ key: 'sk_a', agentId: 'acme', heavyRpm: 40, lightRpm: 200 });
    expect(keys[1]).toMatchObject({ key: 'sk_b', agentId: 'beta', heavyRpm: 10 });
  });

  it('authorizes named key identity', () => {
    process.env.AGENT_API_KEYS = 'sk_a:acme:40';
    process.env.AGENT_REQUIRE_AUTH = 'false';
    delete process.env.AGENT_API_KEY;
    const res = authorizeAgentIdentity(
      mockRequest({ Authorization: 'Bearer sk_a' })
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.identity.agentId).toBe('acme');
      expect(res.identity.keyKind).toBe('named');
      expect(res.identity.heavyRpm).toBe(40);
    }
  });

  it('rejects bad key when keys configured', () => {
    process.env.AGENT_API_KEY = 'master';
    process.env.AGENT_REQUIRE_AUTH = 'true';
    const res = authorizeAgentIdentity(mockRequest({ Authorization: 'Bearer wrong' }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(401);
  });
});

describe('scale rate limit memory', () => {
  beforeEach(() => {
    resetMemoryRateLimits();
  });

  it('allows then blocks at limit', async () => {
    const key = `test-${Date.now()}`;
    const a = await checkDistributedRateLimit(key, 2);
    const b = await checkDistributedRateLimit(key, 2);
    const c = await checkDistributedRateLimit(key, 2);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(c.allowed).toBe(false);
    expect(c.retryAfter).toBeGreaterThan(0);
  });
});

describe('scale tool tiers', () => {
  it('classifies heavy and light tools', () => {
    expect(toolTier('find_brand_domains')).toBe('heavy');
    expect(toolTier('get_product_facts')).toBe('light');
    expect(mcpMethodTier('initialize')).toBe('light');
    expect(mcpMethodTier('tools/call', 'find_brand_domains')).toBe('heavy');
  });

  it('has positive default heavy rpm', () => {
    expect(defaultHeavyRpm()).toBeGreaterThan(0);
  });
});

describe('scale job store memory', () => {
  it('saves and loads a job', async () => {
    const job: AgentJob = {
      id: `job_test_${Date.now().toString(36)}`,
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
    };
    await saveAgentJob(job);
    expect(getAgentJobMemory(job.id)?.id).toBe(job.id);
    const loaded = await getAgentJobDurable(job.id);
    expect(loaded?.id).toBe(job.id);
    expect(loaded?.status).toBe('running');
  });
});
