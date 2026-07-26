/**
 * Phase F — Index / ops health check for DomainDiscovery.
 *
 * Usage:
 *   node scripts/seo-index-health.mjs
 *   node scripts/seo-index-health.mjs --base https://domainsdiscovery.com
 *   node scripts/seo-index-health.mjs --base http://127.0.0.1:5001 --json
 *   node scripts/seo-index-health.mjs --sample-learn 20
 *
 * Exit codes: 0 = ok/warnings only, 1 = critical failures
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function parseArgs(argv) {
  const out = {
    base: process.env.SEO_HEALTH_BASE || 'http://127.0.0.1:5001',
    json: false,
    sampleLearn: 12,
    timeoutMs: 15000,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--base' && argv[i + 1]) out.base = argv[++i].replace(/\/$/, '');
    else if (a === '--sample-learn' && argv[i + 1]) out.sampleLearn = Number(argv[++i]) || 12;
    else if (a === '--timeout' && argv[i + 1]) out.timeoutMs = Number(argv[++i]) || 15000;
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: node scripts/seo-index-health.mjs [--base URL] [--json] [--sample-learn N]`);
      process.exit(0);
    }
  }
  return out;
}

const CORE = [
  { path: '/', name: 'home', expect: ['DomainDiscovery', 'domain'] },
  { path: '/search', name: 'search', expect: ['domain', 'search'] },
  { path: '/generator', name: 'generator', expect: ['generator', 'domain'] },
  { path: '/bulk-search', name: 'bulk', expect: ['bulk', 'domain'] },
  { path: '/domain-extensions', name: 'extensions', expect: ['extension', 'tld'] },
  { path: '/tools/geo', name: 'geo', expect: ['geo', 'domain'] },
  { path: '/tools/whois', name: 'whois', expect: ['whois'] },
  { path: '/tools/compare', name: 'compare', expect: ['price', 'compare'] },
  { path: '/tools/keyword', name: 'keyword', expect: ['keyword'] },
  { path: '/learn', name: 'learn', expect: ['learn', 'guide'] },
  { path: '/faq', name: 'faq', expect: ['faq', 'domain'] },
  { path: '/blog', name: 'blog', expect: ['blog'] },
  { path: '/blog/tlds', name: 'tlds-index', expect: ['tld'] },
  { path: '/contact', name: 'contact', expect: ['contact'] },
  { path: '/privacy', name: 'privacy', expect: ['privacy'] },
  { path: '/terms', name: 'terms', expect: ['term'] },
  { path: '/robots.txt', name: 'robots', expect: ['sitemap', 'allow'], text: true },
  { path: '/sitemap.xml', name: 'sitemap', expect: ['urlset', 'loc'], text: true },
  { path: '/llms.txt', name: 'llms', expect: ['DomainDiscovery', 'Product facts'], text: true },
  { path: '/llms-full.txt', name: 'llms-full', expect: ['DomainDiscovery', 'Learn catalog'], text: true },
];

const LEARN_HUBS = [
  'domain-name-search-guide',
  'how-to-register-a-domain',
  'what-is-domaindiscovery',
  'geo-domains-local-seo',
  'whois-lookup-guide',
  'bulk-domain-search-guide',
  'domain-price-comparison-guide',
  'ai-domain-name-generator-guide',
  'what-is-a-tld-domain-extension',
  'domains-for-beginners',
  'dns-guide',
  'choosing-domain',
];

function learnWordCounts() {
  const file = path.join(ROOT, 'src/data/learn-articles.json');
  if (!fs.existsSync(file)) return { error: 'learn-articles.json missing', articles: [] };
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const articles = (data.articles || []).map((a) => {
    const text = (a.sections || [])
      .flatMap((s) => [s.heading, ...(s.body || [])])
      .join(' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return { slug: a.slug, title: a.title, category: a.category, words };
  });
  articles.sort((a, b) => a.words - b.words);
  const thin = articles.filter((a) => a.words < 800);
  const median = articles[Math.floor(articles.length / 2)]?.words ?? 0;
  return {
    count: articles.length,
    thinUnder800: thin.length,
    medianWords: median,
    minWords: articles[0]?.words ?? 0,
    maxWords: articles[articles.length - 1]?.words ?? 0,
    thinnest: thin.slice(0, 10),
    articles,
  };
}

async function fetchOne(base, route, timeoutMs) {
  const url = `${base}${route.path}`;
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'DomainDiscovery-seo-index-health/1.0' },
      redirect: 'follow',
    });
    clearTimeout(t);
    const body = await res.text();
    const ms = Date.now() - started;
    const titleMatch = body.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const lower = body.toLowerCase();
    const soft404 =
      /page not found|does not exist|404 error|no longer available/i.test(body) &&
      res.status === 200 &&
      body.length < 2500;

    const missingExpect = (route.expect || []).filter((frag) => !lower.includes(frag.toLowerCase()));
    const hasDefinition = /data-aeo-definition|cite-def-|definition/i.test(body);
    const hasProductFacts = /data-product-facts|product facts|what is domaindiscovery/i.test(body);
    const hasJsonLd = /application\/ld\+json/i.test(body);

    const issues = [];
    let severity = 'ok';
    if (res.status >= 500) {
      severity = 'critical';
      issues.push(`HTTP ${res.status}`);
    } else if (res.status >= 400) {
      severity = 'critical';
      issues.push(`HTTP ${res.status}`);
    } else if (soft404) {
      severity = 'critical';
      issues.push('possible soft-404');
    } else if (!route.text && !title) {
      severity = 'warn';
      issues.push('missing <title>');
    } else if (missingExpect.length > 0) {
      severity = 'warn';
      issues.push(`missing fragments: ${missingExpect.join(', ')}`);
    }

    return {
      name: route.name,
      path: route.path,
      url,
      status: res.status,
      ms,
      title: title.slice(0, 120),
      bytes: body.length,
      hasDefinition,
      hasProductFacts,
      hasJsonLd,
      severity,
      issues,
    };
  } catch (e) {
    return {
      name: route.name,
      path: route.path,
      url,
      status: 0,
      ms: Date.now() - started,
      title: '',
      bytes: 0,
      severity: 'critical',
      issues: [e.name === 'AbortError' ? 'timeout' : String(e.message || e)],
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const learnStats = learnWordCounts();

  const routes = [
    ...CORE,
    ...LEARN_HUBS.slice(0, args.sampleLearn).map((slug) => ({
      path: `/learn/${slug}`,
      name: `learn:${slug}`,
      expect: ['learn', 'domain'],
    })),
  ];

  const results = [];
  // modest concurrency
  const queue = [...routes];
  const workers = 5;
  async function worker() {
    while (queue.length) {
      const route = queue.shift();
      results.push(await fetchOne(args.base, route, args.timeoutMs));
    }
  }
  await Promise.all(Array.from({ length: workers }, () => worker()));
  results.sort((a, b) => a.path.localeCompare(b.path));

  const critical = results.filter((r) => r.severity === 'critical');
  const warnings = results.filter((r) => r.severity === 'warn');

  const report = {
    checkedAt: new Date().toISOString(),
    base: args.base,
    summary: {
      routes: results.length,
      ok: results.filter((r) => r.severity === 'ok').length,
      warnings: warnings.length,
      critical: critical.length,
    },
    learnCatalog: {
      count: learnStats.count,
      thinUnder800: learnStats.thinUnder800,
      medianWords: learnStats.medianWords,
      minWords: learnStats.minWords,
      maxWords: learnStats.maxWords,
      thinnest: learnStats.thinnest,
    },
    results,
    opsReminders: [
      'Submit sitemap.xml in Google Search Console after production deploy',
      'Set NEXT_PUBLIC_BASE_URL and optional NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in production',
      'Track queries from docs/seo/query-tracking.json monthly',
      'Follow docs/seo/content-calendar.md (2 quality pieces/week)',
      'Quarterly audit checklist in docs/seo/PHASE-F-OPS.md',
    ],
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`SEO index health — ${args.base}`);
    console.log(`Checked: ${report.summary.routes}  ok: ${report.summary.ok}  warn: ${report.summary.warnings}  critical: ${report.summary.critical}`);
    console.log(
      `Learn catalog: ${learnStats.count} articles · median ${learnStats.medianWords} words · <800: ${learnStats.thinUnder800}`
    );
    if (critical.length) {
      console.log('\nCRITICAL:');
      for (const r of critical) console.log(`  ${r.status || 'ERR'} ${r.path} — ${r.issues.join('; ')}`);
    }
    if (warnings.length) {
      console.log('\nWARNINGS:');
      for (const r of warnings) console.log(`  ${r.status} ${r.path} — ${r.issues.join('; ')}`);
    }
    console.log('\nCore sample:');
    for (const r of results.filter((x) => CORE.some((c) => c.path === x.path)).slice(0, 12)) {
      console.log(
        `  ${String(r.status).padStart(3)} ${String(r.ms).padStart(5)}ms  ${r.path.padEnd(22)} ${r.title.slice(0, 50)}`
      );
    }
    console.log('\nOps: docs/seo/PHASE-F-OPS.md');
  }

  process.exit(critical.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
