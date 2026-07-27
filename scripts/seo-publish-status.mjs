/**
 * Print SEO-100 drip status for today (UTC).
 * Usage: node scripts/seo-publish-status.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'src/data/learn-articles.json');

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const batch = data.articles.filter((a) => a.batch === 'seo-100' || a.scheduleSlot);

const live = batch.filter((a) => !a.publishedAt || a.publishedAt <= today);
const dueToday = batch.filter((a) => a.publishedAt === today);
const upcoming = batch
  .filter((a) => a.publishedAt && a.publishedAt > today)
  .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.title.localeCompare(b.title));

console.log(`Today (UTC): ${today}`);
console.log(`SEO batch total: ${batch.length}`);
console.log(`Live: ${live.length}`);
console.log(`Publishing today: ${dueToday.length}`);
for (const a of dueToday) {
  console.log(`  ✓ /learn/${a.slug}`);
  console.log(`    ${a.title}`);
}
console.log(`Upcoming: ${upcoming.length}`);
const nextDays = [...new Set(upcoming.map((a) => a.publishedAt))].slice(0, 7);
for (const d of nextDays) {
  const rows = upcoming.filter((a) => a.publishedAt === d);
  console.log(`  ${d} (${rows.length})`);
  for (const a of rows) console.log(`    - ${a.slug}`);
}
