/**
 * Schedule the 100 content/seo-articles batch for drip publishing.
 *
 * Default: 2 articles/day starting today (UTC), ~50 days to finish all 100.
 * Pillars (non-SEO batch) keep their existing publishedAt and stay live.
 *
 * Usage:
 *   node scripts/schedule-seo-articles.mjs
 *   node scripts/schedule-seo-articles.mjs --start 2026-07-27 --per-day 2
 *   node scripts/schedule-seo-articles.mjs --dry-run
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'content/seo-articles');
const DATA_FILE = path.join(ROOT, 'src/data/learn-articles.json');
const CALENDAR_OUT = path.join(ROOT, 'docs/seo/seo-100-drip-calendar.md');

function parseArgs(argv) {
  const out = { start: null, perDay: 2, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--start') out.start = argv[++i];
    else if (a === '--per-day') out.perDay = Math.max(1, Number(argv[++i]) || 2);
  }
  return out;
}

function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body: m[2] };
}

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const start = args.start || new Date().toISOString().slice(0, 10);
  const perDay = args.perDay;

  if (!fs.existsSync(DATA_FILE)) {
    console.error('Missing', DATA_FILE);
    process.exit(1);
  }
  if (!fs.existsSync(SRC_DIR)) {
    console.error('Missing', SRC_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => /^article-\d+\.md$/.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

  const ordered = files.map((file) => {
    const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
    const { meta } = parseFrontmatter(raw);
    const title = meta.title || file;
    const n = Number(file.match(/\d+/)[0]);
    return {
      file,
      n,
      title,
      baseSlug: slugify(title) || slugify(meta.primary_keyword || file),
    };
  });

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const bySlug = new Map(data.articles.map((a) => [a.slug, a]));
  const byTitle = new Map(data.articles.map((a) => [a.title, a]));

  const scheduled = [];
  const missing = [];

  for (const item of ordered) {
    let article =
      byTitle.get(item.title) ||
      bySlug.get(item.baseSlug) ||
      data.articles.find(
        (a) =>
          a.slug === item.baseSlug ||
          a.slug.startsWith(`${item.baseSlug}-`) ||
          a.title === item.title
      );

    if (!article) {
      missing.push(item);
      continue;
    }

    const dayIndex = Math.floor((item.n - 1) / perDay);
    const publishedAt = addDays(start, dayIndex);
    const slot = ((item.n - 1) % perDay) + 1;

    article.publishedAt = publishedAt;
    article.batch = 'seo-100';
    article.scheduleSlot = `${publishedAt}#${slot}`;
    scheduled.push({
      n: item.n,
      file: item.file,
      slug: article.slug,
      title: article.title,
      publishedAt,
      slot,
    });
  }

  const days = Math.ceil(ordered.length / perDay);
  const endDate = addDays(start, Math.max(0, days - 1));

  // Calendar markdown
  const byDate = new Map();
  for (const row of scheduled) {
    if (!byDate.has(row.publishedAt)) byDate.set(row.publishedAt, []);
    byDate.get(row.publishedAt).push(row);
  }

  const lines = [
    '# SEO 100 — drip publish calendar',
    '',
    `**Cadence:** ${perDay} articles/day`,
    `**Start:** ${start} (UTC date gate)`,
    `**End:** ${endDate}`,
    `**Total days:** ${days}`,
    `**Articles scheduled:** ${scheduled.length} / ${ordered.length}`,
    '',
    'Live rules:',
    '- Learn index, sitemap, and `/learn/[slug]` only expose articles with `publishedAt <= today (UTC)`.',
    '- Original Learn pillars keep their earlier dates and stay live.',
    '- Source markdown remains in `content/seo-articles/article-NN.md`.',
    '',
    '## Daily plan',
    '',
  ];

  for (const [date, rows] of [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`### ${date}`);
    for (const r of rows.sort((a, b) => a.n - b.n)) {
      lines.push(
        `- **#${String(r.n).padStart(2, '0')}** [${r.title}](/learn/${r.slug}) — \`${r.slug}\` (\`${r.file}\`)`
      );
    }
    lines.push('');
  }

  if (missing.length) {
    lines.push('## Missing from learn-articles.json (re-run import)');
    lines.push('');
    for (const m of missing) {
      lines.push(`- ${m.file}: ${m.title}`);
    }
    lines.push('');
  }

  lines.push('## Commands');
  lines.push('');
  lines.push('```bash');
  lines.push('npm run learn:import-seo          # re-import markdown → JSON (if sources change)');
  lines.push('npm run learn:schedule-seo        # re-apply 2/day dates from today');
  lines.push('npm run learn:schedule-seo:status # print what is live vs upcoming today');
  lines.push('```');
  lines.push('');

  if (!args.dryRun) {
    data.generatedAt = new Date().toISOString().slice(0, 10);
    data.sourceNotes = [
      ...(data.sourceNotes || []).filter((n) => !/drip schedule|seo-100 drip/i.test(n)),
      `SEO-100 drip schedule: ${perDay}/day from ${start} through ${endDate} (${scheduled.length} articles). Date-gated via publishedAt in learnArticles.ts.`,
    ];
    data.count = data.articles.length;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
    fs.writeFileSync(CALENDAR_OUT, lines.join('\n'));
  }

  console.log(`Scheduled ${scheduled.length} SEO articles`);
  console.log(`Cadence: ${perDay}/day · ${start} → ${endDate} (${days} days)`);
  console.log(`Missing matches: ${missing.length}`);
  if (args.dryRun) {
    console.log('(dry-run — no files written)');
    console.log('First 4:', scheduled.slice(0, 4));
    console.log('Last 4:', scheduled.slice(-4));
  } else {
    console.log(`Updated ${DATA_FILE}`);
    console.log(`Wrote ${CALENDAR_OUT}`);
  }

  // Today preview
  const today = new Date().toISOString().slice(0, 10);
  const liveToday = scheduled.filter((r) => r.publishedAt <= today);
  const dueToday = scheduled.filter((r) => r.publishedAt === today);
  const upcoming = scheduled.filter((r) => r.publishedAt > today);
  console.log(`As of ${today} UTC: live from batch ${liveToday.length}, due today ${dueToday.length}, upcoming ${upcoming.length}`);
}

main();
