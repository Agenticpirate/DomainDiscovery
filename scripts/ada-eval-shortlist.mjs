#!/usr/bin/env node
/**
 * ADA shortlist quality eval (validate / verify ranking + strategies).
 *
 * Research basis:
 * - Available-first > aftermarket for standard budgets
 * - Vertical lexicon: gym ≠ random tech glue
 * - Radio / brandable strategies should surface pronounceable names
 *
 * Usage:
 *   node scripts/ada-eval-shortlist.mjs
 *   node scripts/ada-eval-shortlist.mjs --base http://localhost:5001
 *   node scripts/ada-eval-shortlist.mjs --skip-live   # rank without availability API
 *
 * Exit 0 if all cases pass thresholds; 1 otherwise.
 */

const base = (() => {
  const i = process.argv.indexOf('--base');
  return i >= 0 ? process.argv[i + 1].replace(/\/$/, '') : 'http://localhost:5001';
})();
const skipLive = process.argv.includes('--skip-live');

/** Fixed briefs — same as product QA scenarios */
const CASES = [
  {
    id: 'gym',
    text: 'Premium brandable domain for a gym for busy professionals',
    brief: {
      preferredTlds: ['.com', '.fit'],
      mustInclude: ['fit', 'gym', 'strength', 'iron'],
      avoid: ['cheap', 'xxx'],
      strategies: ['available_first', 'radio_test', 'brandable', 'short', 'no_hyphen'],
      count: 8,
      maxBudgetUsd: 20,
    },
    expect: {
      verticalHints: ['fit', 'gym', 'iron', 'strength', 'steel', 'forge', 'pulse', 'core', 'lift'],
      banFragments: ['getpremium', 'domainify', 'premiumhq', 'trydomain'],
      minIndustryHitRate: 0.5,
    },
  },
  {
    id: 'yoga',
    text: 'Yoga studio modern brand for professionals',
    brief: {
      preferredTlds: ['.com', '.co'],
      mustInclude: ['yoga', 'flow'],
      avoid: ['cheap'],
      strategies: ['available_first', 'radio_test', 'brandable', 'no_hyphen'],
      count: 8,
      maxBudgetUsd: 25,
    },
    expect: {
      verticalHints: ['yoga', 'flow', 'breath', 'balance', 'calm', 'stretch', 'mat', 'mind'],
      banFragments: ['getpremium', 'domainify'],
      minIndustryHitRate: 0.4,
    },
  },
  {
    id: 'saas',
    text: 'B2B SaaS analytics platform for ecommerce brands',
    brief: {
      preferredTlds: ['.com', '.io', '.ai'],
      strategies: ['available_first', 'brandable', 'short', 'com_priority'],
      count: 8,
      maxBudgetUsd: 30,
    },
    expect: {
      verticalHints: ['flow', 'stack', 'sync', 'hub', 'grid', 'metric', 'data', 'analytics', 'base'],
      banFragments: [],
      minIndustryHitRate: 0.35,
    },
  },
];

function labelOf(domain) {
  return (domain || '').split('.')[0].toLowerCase();
}

function hitRate(domains, hints) {
  if (!domains.length) return 0;
  let hits = 0;
  for (const d of domains) {
    const lab = labelOf(d.domain);
    if (hints.some((h) => lab.includes(h))) hits += 1;
  }
  return hits / domains.length;
}

function banned(domains, ban) {
  return domains.filter((d) => ban.some((b) => labelOf(d.domain).includes(b)));
}

async function runCase(c) {
  const body = {
    text: c.text,
    maxBudgetUsd: c.brief.maxBudgetUsd,
    brief: c.brief,
    skipAvailability: skipLive,
    sync: true,
  };

  const res = await fetch(`${base}/api/agent/auto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    return {
      id: c.id,
      pass: false,
      error: data.error || data.message || `HTTP ${res.status}`,
    };
  }

  const shortlist = data.result?.shortlist || [];
  const rate = hitRate(shortlist, c.expect.verticalHints);
  const bad = banned(shortlist, c.expect.banFragments);
  const availableFirst =
    !shortlist.length ||
    shortlist[0].available !== false ||
    skipLive ||
    shortlist.every((d) => d.available !== true);

  // When live checks on: prefer that top has available true if any available exist
  let availOk = true;
  if (!skipLive) {
    const anyAvail = shortlist.some((d) => d.available === true && !d.premium);
    if (anyAvail) {
      availOk = shortlist[0].available === true;
    }
  }

  const strategies = data.result?.brief?.strategies || [];
  const pass =
    shortlist.length >= 3 &&
    rate >= c.expect.minIndustryHitRate &&
    bad.length === 0 &&
    availOk;

  return {
    id: c.id,
    pass,
    shortlistSize: shortlist.length,
    industryHitRate: Number(rate.toFixed(3)),
    minRequired: c.expect.minIndustryHitRate,
    bannedHits: bad.map((d) => d.domain),
    top3: shortlist.slice(0, 3).map((d) => `${d.domain}(${d.score})`),
    strategies,
    availableFirstOk: availOk,
    error: pass ? null : 'threshold_failed',
  };
}

async function main() {
  console.log(`ADA shortlist eval → ${base} (skipLive=${skipLive})\n`);

  // Health
  try {
    const h = await fetch(`${base}/api/agent/auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test health check domain', skipAvailability: true, sync: true }),
    });
    if (!h.ok && h.status !== 400) {
      console.error('API not healthy', h.status);
      process.exit(1);
    }
  } catch (e) {
    console.error('Cannot reach API:', e.message);
    console.error('Start dev server: npm run dev');
    process.exit(1);
  }

  const results = [];
  for (const c of CASES) {
    process.stdout.write(`· ${c.id}… `);
    try {
      const r = await runCase(c);
      results.push(r);
      console.log(r.pass ? 'PASS' : 'FAIL', r.top3?.join(', ') || r.error);
      if (!r.pass) {
        console.log(
          `    hitRate=${r.industryHitRate} (need ≥${r.minRequired}) banned=${(r.bannedHits || []).join(',') || '—'} availOk=${r.availableFirstOk}`
        );
      }
    } catch (e) {
      results.push({ id: c.id, pass: false, error: e.message });
      console.log('ERROR', e.message);
    }
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} cases passed`);
  console.log(JSON.stringify({ base, skipLive, results }, null, 2));
  process.exit(passed === results.length ? 0 : 1);
}

main();
