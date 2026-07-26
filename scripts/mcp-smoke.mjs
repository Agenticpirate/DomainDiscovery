#!/usr/bin/env node
/**
 * Smoke-test AI Domain Assistant MCP (HTTP JSON-RPC).
 *
 *   npm run mcp:smoke
 *   MCP_BASE=http://localhost:5001 npm run mcp:smoke
 *   AGENT_API_KEY=... npm run mcp:smoke
 */
const base = (process.env.MCP_BASE || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5001').replace(
  /\/$/,
  ''
);
const url = `${base}/api/mcp`;
const key = process.env.AGENT_API_KEY?.trim() || '';

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
if (key) {
  headers.Authorization = `Bearer ${key}`;
}

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

async function rpc(method, params = {}, id = 1) {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log(`MCP smoke → ${url}\n`);

  // Discovery GET
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (res.ok && (data.name || data.tools)) {
      ok('GET /api/mcp discovery', `name=${data.name} tools=${(data.tools || []).length}`);
    } else {
      bad('GET /api/mcp discovery', `HTTP ${res.status}`);
    }
  } catch (e) {
    bad('GET /api/mcp discovery', e instanceof Error ? e.message : String(e));
  }

  // initialize
  {
    const { status, body } = await rpc('initialize', {});
    const name = body?.result?.serverInfo?.name;
    if (status === 200 && name) ok('initialize', name);
    else bad('initialize', JSON.stringify(body).slice(0, 160));
  }

  // tools/list
  let toolNames = [];
  {
    const { status, body } = await rpc('tools/list', {}, 2);
    toolNames = (body?.result?.tools || []).map((t) => t.name);
    if (status === 200 && toolNames.includes('find_brand_domains')) {
      ok('tools/list', `${toolNames.length} tools`);
    } else {
      bad('tools/list', JSON.stringify(body).slice(0, 160));
    }
  }

  // find_brand_domains
  {
    const { status, body } = await rpc(
      'tools/call',
      {
        name: 'find_brand_domains',
        arguments: {
          text: 'Coffee subscription for remote workers',
          maxBudgetUsd: 20,
          count: 4,
          preferredTlds: ['.com'],
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
      sl.slice(0, 4).forEach((d, i) => {
        console.log(
          `      ${i + 1}. ${d.domain}  score=${d.score}  avail=${d.available}  budget=${d.budgetStatus}`
        );
      });
    } else {
      bad('find_brand_domains', JSON.stringify(body).slice(0, 220));
    }
  }

  // whois
  {
    const { status, body } = await rpc(
      'tools/call',
      { name: 'whois_lookup', arguments: { domain: 'example.com' } },
      4
    );
    let data = {};
    try {
      data = JSON.parse(body?.result?.content?.[0]?.text || '{}');
    } catch {
      /* ignore */
    }
    if (status === 200 && (data.domain || data.success)) {
      ok('whois_lookup', data.domain || 'ok');
    } else {
      bad('whois_lookup', JSON.stringify(body).slice(0, 160));
    }
  }

  console.log(`\n=== ${passed} passed · ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
