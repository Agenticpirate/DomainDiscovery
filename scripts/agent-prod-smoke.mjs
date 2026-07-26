#!/usr/bin/env node
/**
 * Production readiness smoke for AI Domain Assistant agents.
 *
 *   npm run agent:prod-smoke
 *   MCP_BASE=http://localhost:5001 npm run agent:prod-smoke
 *   AGENT_API_KEY=secret npm run agent:prod-smoke
 */
const base = (process.env.MCP_BASE || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5001').replace(
  /\/$/,
  ''
);
const key = process.env.AGENT_API_KEY?.trim() || '';

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
if (key) headers.Authorization = `Bearer ${key}`;

let passed = 0;
let failed = 0;

function ok(label, detail = '') {
  passed += 1;
  console.log(`PASS  ${label}${detail ? ` — ${detail}` : ''}`);
}
function bad(label, detail = '') {
  failed += 1;
  console.error(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
}

async function get(path) {
  const res = await fetch(`${base}${path}`, { headers: { Accept: 'application/json', ...(key ? { Authorization: headers.Authorization } : {}) } });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function rpc(method, params = {}, id = 1, extraHeaders = {}) {
  const res = await fetch(`${base}/api/mcp`, {
    method: 'POST',
    headers: { ...headers, ...extraHeaders },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log(`Agent production smoke → ${base}\n`);

  // 1 Health
  {
    const { status, body } = await get('/api/agent/health');
    if ((status === 200 || status === 503) && body && typeof body.ok === 'boolean') {
      if (body.ok) {
        const scale = body.scale;
        const scaleNote = scale
          ? `backend=${scale.redisBackend} heavyLimit=${scale.concurrency?.localLimit}`
          : 'no-scale';
        ok('GET /api/agent/health', `v${body.version} tools=${body.tools} ${scaleNote}`);
        if (scale && scale.tiers && scale.concurrency) {
          ok('health.scale foundation', `tiers=${scale.tiers.join('+')} redisConfigured=${scale.redisConfigured}`);
        } else {
          bad('health.scale foundation', 'missing scale object');
        }
      } else bad('GET /api/agent/health', `ok=false status=${status} ${JSON.stringify(body.auth || {})}`);
    } else {
      bad('GET /api/agent/health', `HTTP ${status}`);
    }
  }

  // 2 Agent cards
  for (const path of ['/.well-known/agent-card.json', '/ada/.well-known/agent-card.json']) {
    const { status, body } = await get(path);
    if (status === 200 && body?.name && Array.isArray(body.tools)) {
      ok(`Agent Card ${path}`, `${body.name} tools=${body.tools.length} v${body.version || '?'}`);
    } else {
      bad(`Agent Card ${path}`, `HTTP ${status}`);
    }
  }

  // 3 Manifest
  {
    const { status, body } = await get('/api/agent/manifest');
    if (status === 200 && body?.mcpReady != null && body?.endpoints?.health) {
      ok('GET /api/agent/manifest', `v${body.version} tools=${(body.tools || []).length}`);
    } else {
      bad('GET /api/agent/manifest', `HTTP ${status}`);
    }
  }

  // 4 Skills
  {
    const { status, body } = await get('/api/agent/skills');
    if (status === 200 && Array.isArray(body?.skills) && body.skills.length >= 4) {
      ok('GET /api/agent/skills', `${body.skills.length} skills`);
    } else {
      bad('GET /api/agent/skills', `HTTP ${status}`);
    }
  }

  // 5 MCP initialize
  {
    const { status, body } = await rpc('initialize', {});
    const name = body?.result?.serverInfo?.name;
    if (status === 200 && name) ok('MCP initialize', name);
    else bad('MCP initialize', JSON.stringify(body).slice(0, 160));
  }

  // 6 tools/list
  {
    const { status, body } = await rpc('tools/list', {}, 2);
    const tools = body?.result?.tools || [];
    const names = tools.map((t) => t.name);
    if (status === 200 && names.includes('find_brand_domains')) {
      ok('MCP tools/list', `${tools.length} tools`);
    } else {
      bad('MCP tools/list', JSON.stringify(body).slice(0, 160));
    }
  }

  // 7 find_brand_domains
  {
    const { status, body } = await rpc(
      'tools/call',
      {
        name: 'find_brand_domains',
        arguments: {
          text: 'Minimal apparel brand for young professionals',
          style: 'brandable',
          maxBudgetUsd: 25,
          count: 4,
        },
      },
      3
    );
    let data = null;
    try {
      const text = body?.result?.content?.[0]?.text;
      data = text ? JSON.parse(text) : body?.result?.structuredContent || body?.result;
    } catch {
      data = body?.result;
    }
    const sl = data?.shortlist;
    if (status === 200 && Array.isArray(sl) && sl.length > 0) {
      ok('find_brand_domains', `shortlist=${sl.length} top=${sl[0]?.domain}`);
    } else {
      bad('find_brand_domains', JSON.stringify(body).slice(0, 220));
    }
  }

  // 8 availability
  {
    const { status, body } = await rpc(
      'tools/call',
      { name: 'check_domain_availability', arguments: { domains: ['google.com'] } },
      4
    );
    let data = {};
    try {
      data = JSON.parse(body?.result?.content?.[0]?.text || '{}');
    } catch {
      /* ignore */
    }
    const row = (data.results || [])[0];
    if (status === 200 && row && row.available === false) {
      ok('check_domain_availability', 'google.com unavailable (expected)');
    } else {
      bad('check_domain_availability', JSON.stringify(body).slice(0, 200));
    }
  }

  // 9 register fail-closed
  {
    const { status, body } = await rpc(
      'tools/call',
      { name: 'register_domain', arguments: { domain: 'example-not-real-xyz.com', dryRun: true } },
      5
    );
    let data = {};
    try {
      data = JSON.parse(body?.result?.content?.[0]?.text || '{}');
    } catch {
      /* ignore */
    }
    if (
      status === 200 &&
      (data.code === 'tier3_disabled' ||
        data.code === 'byok_registrar_required' ||
        data.ok === false)
    ) {
      ok('register_domain safety', data.code || 'fail-closed');
    } else {
      bad('register_domain safety', JSON.stringify(body).slice(0, 200));
    }
  }

  // 10 Auth probe when key configured: request without key must 401
  if (key) {
    const res = await fetch(`${base}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 9, method: 'tools/list', params: {} }),
    });
    if (res.status === 401) ok('auth enforces 401 without key');
    else bad('auth enforces 401 without key', `HTTP ${res.status}`);
  } else {
    ok('auth probe skipped', 'AGENT_API_KEY not set in env for this run');
  }

  console.log(`\n=== ${passed} passed · ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
