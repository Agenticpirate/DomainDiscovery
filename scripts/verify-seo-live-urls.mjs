/**
 * HTTP-check that today's (UTC) SEO drip articles return 200 on production.
 * Usage: node scripts/verify-seo-live-urls.mjs --base https://www.domainsdiscovery.com
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/learn-articles.json');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const base = (arg('base', 'https://www.domainsdiscovery.com') || '').replace(/\/$/, '');
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const batch = (data.articles || []).filter((a) => a.batch === 'seo-100' || a.scheduleSlot);
const dueToday = batch.filter((a) => a.publishedAt === today);
const live = batch.filter((a) => a.publishedAt && a.publishedAt <= today);

console.log(`Base: ${base}`);
console.log(`Today UTC: ${today}`);
console.log(`Due today: ${dueToday.length}`);
console.log(`Live cumulative: ${live.length}/${batch.length}`);

if (dueToday.length === 0 && live.length < batch.length) {
  // Weekend/gap shouldn't happen; if batch exhausted, dueToday can be 0 with live===100
  if (live.length >= batch.length) {
    console.log('Batch exhausted — all SEO articles already live. OK.');
    process.exit(0);
  }
  console.warn('No articles due today; checking learn index only.');
}

const paths = [
  '/learn',
  '/sitemap.xml',
  ...dueToday.map((a) => `/learn/${a.slug}`),
];

let failed = 0;
for (const p of paths) {
  const url = `${base}${p}`;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'DomainDiscovery-SEO-Daily/1.0' },
    });
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? '✓' : '✗'} ${res.status} ${url}`);
    if (!ok) failed++;
  } catch (e) {
    console.error(`✗ ERR ${url}`, e.message || e);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} URL check(s) failed.`);
  console.error('If deploy is still rolling out, re-run this workflow in a few minutes.');
  process.exit(1);
}

console.log('\nAll checks passed.');
