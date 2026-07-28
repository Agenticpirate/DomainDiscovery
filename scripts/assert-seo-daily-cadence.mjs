/**
 * Fail CI if the SEO-100 schedule does not guarantee ≥ min articles on each
 * day that still has remaining posts (until the batch is exhausted).
 *
 * Usage: node scripts/assert-seo-daily-cadence.mjs --min 2
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/learn-articles.json');

const min = (() => {
  const i = process.argv.indexOf('--min');
  return i >= 0 ? Math.max(1, Number(process.argv[i + 1]) || 2) : 2;
})();

const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const batch = (data.articles || []).filter((a) => a.batch === 'seo-100' || a.scheduleSlot);

if (batch.length === 0) {
  console.error('No seo-100 batch articles found. Run: npm run learn:import-seo && npm run learn:schedule-seo');
  process.exit(1);
}

const byDate = new Map();
for (const a of batch) {
  const d = a.publishedAt;
  if (!d) {
    console.error('Missing publishedAt on', a.slug);
    process.exit(1);
  }
  byDate.set(d, (byDate.get(d) || 0) + 1);
}

const today = new Date().toISOString().slice(0, 10);
let ok = true;
const futureOrToday = [...byDate.entries()]
  .filter(([d]) => d >= today)
  .sort((a, b) => a[0].localeCompare(b[0]));

// Every scheduled day (including past) should have had ≥ min except possibly the last day
const allDays = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const lastDay = allDays[allDays.length - 1]?.[0];

for (const [date, count] of allDays) {
  const isLast = date === lastDay;
  if (count < min && !isLast) {
    console.error(`Cadence fail: ${date} has ${count} articles (need ≥ ${min})`);
    ok = false;
  }
  if (isLast && count < 1) {
    console.error(`Cadence fail: last day ${date} is empty`);
    ok = false;
  }
}

console.log(`SEO-100 batch: ${batch.length} articles across ${byDate.size} days`);
console.log(`Min/day required: ${min}`);
console.log(`Today (UTC): ${today}`);
console.log(`Remaining days with publishes: ${futureOrToday.length}`);
for (const [d, n] of allDays.slice(0, 5)) console.log(`  ${d}: ${n}`);
if (allDays.length > 5) console.log(`  … ${allDays.length - 5} more days`);

if (!ok) process.exit(1);
console.log('Cadence OK');
