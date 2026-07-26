/**
 * Import long-form SEO markdown articles into Learn (learn-articles.json).
 *
 * Source: content/seo-articles/article-01.md … article-100.md
 * Run: node scripts/import-seo-articles.mjs
 *
 * - Parses YAML frontmatter + H2 sections
 * - Converts FAQ ### Q blocks → Q:/A: pairs (existing FAQ UI + JSON-LD)
 * - Flattens markdown tables into readable comparison lines
 * - Skips existing slugs; never overwrites Phase D JSON pillars
 * - Strips embedded <script> schema (page generates Article/FAQ schema)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'content/seo-articles');
const OUT_FILE = path.join(ROOT, 'src/data/learn-articles.json');

const CATEGORY_ICONS = {
  Aftermarket: '🔨',
  Beginner: '📘',
  Business: '🏢',
  Expired: '⏳',
  Investing: '📈',
  Legal: '⚖️',
  Monetization: '💵',
  Naming: '✨',
  Pricing: '💰',
  Registrars: '🏪',
  SEO: '🔎',
  Security: '🛡️',
  Strategy: '🎯',
  TLDs: '🏷️',
  Technical: '⚙️',
  Tools: '🧰',
  Trends: '🚀',
  Valuation: '📊',
  Sales: '🤝',
  Development: '🛠️',
  Community: '📰',
};

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { meta: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: raw };
  const yaml = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, '');
  const meta = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^([a-z_]+):\s*"([^"]*)"\s*$/i);
    if (m) meta[m[1]] = m[2];
    else {
      const m2 = line.match(/^([a-z_]+):\s*(.+)\s*$/i);
      if (m2) meta[m2[1]] = m2[2].replace(/^["']|["']$/g, '');
    }
  }
  return { meta, body };
}

function stripScripts(md) {
  return md.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '');
}

function stripInlineMd(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/** Convert a GFM table block into comparison lines. */
function tableToLines(tableBlock) {
  const rows = tableBlock
    .trim()
    .split('\n')
    .map((r) => r.trim())
    .filter((r) => r.startsWith('|'));
  if (rows.length < 2) return [tableBlock.trim()];

  const parseRow = (row) =>
    row
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => stripInlineMd(c.trim()));

  const header = parseRow(rows[0]);
  const dataRows = rows.slice(1).filter((r) => !/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(r));

  const lines = [];
  for (const row of dataRows) {
    const cells = parseRow(row);
    if (!cells.length || cells.every((c) => !c)) continue;
    const label = cells[0] || 'Item';
    const parts = [];
    for (let i = 1; i < Math.max(header.length, cells.length); i++) {
      const h = header[i] || `Col ${i}`;
      const v = cells[i] || '—';
      if (!v || v === '—') continue;
      parts.push(`${h}: ${v}`);
    }
    lines.push(parts.length ? `${label} — ${parts.join(' · ')}` : label);
  }
  return lines.length ? lines : [stripInlineMd(tableBlock.replace(/\|/g, ' ').replace(/\s+/g, ' '))];
}

/**
 * Split markdown body into H2 sections; convert tables/lists; drop TOC + H1.
 */
function mdToSections(md, quickAnswerHint) {
  let text = stripScripts(md).trim();

  // Drop leading H1
  text = text.replace(/^#\s+.+\n+/, '');

  // Extract Quick Answer blockquote if present
  let quickAnswer = quickAnswerHint || '';
  const qaMatch = text.match(/>\s*\*\*Quick Answer:\*\*\s*([\s\S]*?)(?=\n\n(?![>\s])|\n## )/);
  if (qaMatch) {
    quickAnswer = stripInlineMd(qaMatch[1].replace(/^>\s?/gm, '').replace(/\n+/g, ' '));
    text = text.replace(qaMatch[0], '');
  } else {
    const qa2 = text.match(/>\s*\*\*Quick Answer:\*\*\s*([^\n]+)/);
    if (qa2) {
      quickAnswer = stripInlineMd(qa2[1]);
      text = text.replace(qa2[0], '');
    }
  }

  // Drop Table of Contents section
  text = text.replace(/##\s*Table of Contents[\s\S]*?(?=\n##\s)/i, '\n');

  // Split on H2
  const parts = text.split(/\n(?=##\s+)/);
  const sections = [];

  // Intro paragraphs before first H2
  const introPart = parts[0] && !parts[0].startsWith('##') ? parts[0] : '';
  const h2Parts = parts[0] && parts[0].startsWith('##') ? parts : parts.slice(1);

  if (quickAnswer || introPart.trim()) {
    const body = [];
    if (quickAnswer) body.push(quickAnswer);
    body.push(...blocksToParas(introPart));
    if (body.length) {
      sections.push({
        heading: 'Overview',
        body: uniqueParas(body),
      });
    }
  }

  for (const part of h2Parts) {
    const m = part.match(/^##\s+(.+?)\s*\n([\s\S]*)$/);
    if (!m) continue;
    const heading = stripInlineMd(m[1]);
    // Skip residual TOC
    if (/^table of contents$/i.test(heading)) continue;

    let content = m[2].trim();
    if (/frequently asked|^\s*faq\b/i.test(heading)) {
      const faqBody = faqSectionToQA(content);
      if (faqBody.length) sections.push({ heading: 'Frequently Asked Questions', body: faqBody });
      continue;
    }

    // Skip pure CTA closing sections that only push external brand line — keep if has substance
    const paras = blocksToParas(content);
    if (!paras.length) continue;
    sections.push({ heading, body: paras });
  }

  return { sections, quickAnswer };
}

function uniqueParas(arr) {
  const seen = new Set();
  const out = [];
  for (const p of arr) {
    const k = p.slice(0, 80);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

function faqSectionToQA(content) {
  // Prefer embedded JSON-LD FAQ if present (before strip) — content may already be stripped
  const pairs = [];
  // ### Question \n Answer paragraphs
  const chunks = content.split(/\n(?=###\s+)/);
  for (const chunk of chunks) {
    const m = chunk.match(/^###\s+(.+?)\s*\n([\s\S]*)$/);
    if (!m) continue;
    const q = stripInlineMd(m[1]);
    const a = stripInlineMd(
      m[2]
        .replace(/\|[^\n]+\|/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
    if (q && a && a.length > 20) pairs.push(`Q: ${q}\nA: ${a}`);
  }
  return pairs;
}

function blocksToParas(md) {
  if (!md || !md.trim()) return [];
  let text = md.trim();

  // Extract and replace tables with placeholders
  const tables = [];
  text = text.replace(/(?:^|\n)((?:\|.+\|\n)+)/g, (match, table) => {
    const idx = tables.length;
    tables.push(table);
    return `\n\n@@TABLE${idx}@@\n\n`;
  });

  const paras = [];
  const blocks = text.split(/\n{2,}/);

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    const tableMatch = block.match(/^@@TABLE(\d+)@@$/);
    if (tableMatch) {
      paras.push(...tableToLines(tables[Number(tableMatch[1])]));
      continue;
    }

    // H3 subsection — keep as bold lead-in paragraph
    if (block.startsWith('### ')) {
      const lines = block.split('\n');
      const h = stripInlineMd(lines[0].replace(/^###\s+/, ''));
      const rest = lines.slice(1).join(' ').trim();
      if (rest) {
        paras.push(`${h}: ${stripInlineMd(rest.replace(/\n+/g, ' '))}`);
      } else {
        paras.push(h);
      }
      continue;
    }

    // Bullet lists
    if (/^[-*]\s+/m.test(block) && block.split('\n').filter((l) => /^[-*]\s+/.test(l)).length >= 2) {
      const items = block
        .split('\n')
        .map((l) => l.replace(/^[-*]\s+/, '').trim())
        .filter(Boolean)
        .map(stripInlineMd);
      // Key facts style: keep as separate short paras
      for (const item of items) {
        if (item.length > 8) paras.push(item);
      }
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s+/m.test(block) && block.split('\n').filter((l) => /^\d+\.\s+/.test(l)).length >= 2) {
      const items = block
        .split('\n')
        .map((l) => l.replace(/^\d+\.\s+/, '').trim())
        .filter(Boolean)
        .map(stripInlineMd);
      items.forEach((item, i) => {
        if (item.length > 8) paras.push(`${i + 1}. ${item}`);
      });
      continue;
    }

    // Blockquote leftovers
    if (block.startsWith('>')) {
      const q = stripInlineMd(block.replace(/^>\s?/gm, '').replace(/\n+/g, ' '));
      if (q.length > 20) paras.push(q);
      continue;
    }

    // Horizontal rules skip
    if (/^---+$/.test(block)) continue;

    // Normal paragraph(s) — may contain single newlines
    const cleaned = stripInlineMd(block.replace(/\n+/g, ' ').replace(/\s+/g, ' '));
    if (cleaned.length > 15) paras.push(cleaned);
  }

  return paras;
}

function classifyCategory(title, keyword, intent) {
  const t = `${title} ${keyword} ${intent}`.toLowerCase();
  if (/cybersquat|udrp|trademark|legal|copyright|dmca/.test(t)) return 'Legal';
  if (/domain hijack|domain lock|dnssec|2fa|phishing protection/.test(t)) return 'Security';
  if (/whois|what is dns|nameserver|spf|dkim|dmarc|rdap|epp code|domain propagation/.test(t))
    return 'Technical';
  if (/drop catch|expired domain|domain auction|aftermarket|escrow|domain flipping|afternic|sedo/.test(t))
    return 'Aftermarket';
  if (/valuat|appraisal|how much is my domain|worth\?/.test(t)) return 'Valuation';
  if (/domain investing|domains to invest|portfolio of domains|domain flip/.test(t)) return 'Investing';
  if (/parking|monetiz|affiliate/.test(t)) return 'Monetization';
  // Registrar reviews / comparisons (before price/TLD so "cheaper Namecheap" stays Registrars)
  if (
    /registrar|namecheap|godaddy|porkbun|cloudflare registrar|dynadot|ionos|google domains|squarespace domains|hover|name\.com|gandi|network solutions|godaddy alternative/.test(
      t
    )
  )
    return 'Registrars';
  if (/generator|brandable|naming|startup name|business name|radio test|portmanteau|made-up words|one-word domain/.test(t))
    return 'Naming';
  if (/\.com vs|\.net vs|\.org|\.io vs|\.ai |cctld|gtld|domain extension|domain hack|new gtld|tld as part/.test(t))
    return 'TLDs';
  if (/local seo|geo domain|subdomain vs|rank |backlink|seo for/.test(t)) return 'SEO';
  if (/cheapest|renewal price|domain price|pricing|how to price your domain/.test(t)) return 'Pricing';
  if (/bulk domain|domain tool|expiry monitoring|domain monitor/.test(t)) return 'Tools';
  if (/beginner|how to register|how to buy a domain|first domain/.test(t)) return 'Beginner';
  if (/business name|startup domain|brand protect/.test(t)) return 'Business';
  if (/trend|future of domains/.test(t)) return 'Trends';
  return 'Strategy';
}

function topicsFrom(title, keyword, category) {
  const topics = new Set();
  if (keyword) {
    // split multi-word keyword into useful chips
    topics.add(keyword.length > 40 ? keyword.split(/\s+/).slice(0, 4).join(' ') : keyword);
  }
  topics.add(category);
  const t = title.toLowerCase();
  if (/namecheap/.test(t)) topics.add('Namecheap');
  if (/godaddy/.test(t)) topics.add('GoDaddy');
  if (/porkbun/.test(t)) topics.add('Porkbun');
  if (/cloudflare/.test(t)) topics.add('Cloudflare');
  if (/dynadot/.test(t)) topics.add('Dynadot');
  if (/registrar/.test(t)) topics.add('Registrars');
  if (/\.com/.test(t)) topics.add('.com');
  if (/renewal|price|cheap/.test(t)) topics.add('Pricing');
  if (/transfer/.test(t)) topics.add('Transfers');
  if (/privacy/.test(t)) topics.add('Privacy');
  if (/seo|local seo/.test(t)) topics.add('SEO');
  if (/generator|brandable|startup name|business name/.test(t)) topics.add('Naming');
  if (/beginner/.test(t)) topics.add('Beginner');
  return [...topics].slice(0, 6);
}

function readTimeFromWords(w) {
  const mins = Math.max(8, Math.min(22, Math.round(w / 160)));
  return `${mins} min read`;
}

function wordCount(sections) {
  return sections
    .flatMap((s) => [s.heading, ...s.body])
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function loadExisting() {
  return JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('Missing', SRC_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => /^article-\d+\.md$/.test(f))
    .sort((a, b) => {
      const na = Number(a.match(/\d+/)[0]);
      const nb = Number(b.match(/\d+/)[0]);
      return na - nb;
    });

  console.log(`Found ${files.length} markdown articles in content/seo-articles`);

  const data = loadExisting();

  // Parse all incoming titles first so re-runs replace the prior SEO batch cleanly
  const parsed = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const title = meta.title || file;
    parsed.push({ file, meta, body, title, baseSlug: slugify(title) || slugify(meta.primary_keyword || file) });
  }
  const incomingTitles = new Set(parsed.map((p) => p.title));
  const incomingBaseSlugs = new Set(parsed.map((p) => p.baseSlug));

  // Drop previous import of the same batch (same title, base slug, or accidental slug-2 variants)
  const kept = data.articles.filter((a) => {
    if (incomingTitles.has(a.title)) return false;
    if (incomingBaseSlugs.has(a.slug)) return false;
    // strip prior botched re-import suffixes: `${base}-2`, `${base}-3`, …
    for (const base of incomingBaseSlugs) {
      if (a.slug === base || new RegExp(`^${base.replace(/-/g, '\\-')}-\\d+$`).test(a.slug)) {
        return false;
      }
    }
    return true;
  });

  const existingSlugs = new Set(kept.map((a) => a.slug));
  const imported = [];
  const skipped = [];

  for (const { file, meta, body, title, baseSlug } of parsed) {
    let slug = baseSlug;

    // Ensure unique slug against remaining pillars only
    if (existingSlugs.has(slug)) {
      let n = 2;
      while (existingSlugs.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }

    const category = classifyCategory(title, meta.primary_keyword || '', meta.target_intent || '');
    const { sections, quickAnswer } = mdToSections(body, '');
    if (!sections.length) {
      skipped.push({ file, reason: 'no sections' });
      continue;
    }

    // Ensure first body leads with description/quick answer for AEO definition block
    if (quickAnswer && sections[0] && !sections[0].body[0]?.includes(quickAnswer.slice(0, 40))) {
      sections[0].body = [quickAnswer, ...sections[0].body];
    }

    const w = wordCount(sections);
    const clean = {
      slug,
      title,
      category,
      icon: CATEGORY_ICONS[category] || '📄',
      readTime: readTimeFromWords(w),
      topics: topicsFrom(title, meta.primary_keyword || '', category),
      description: meta.meta_description || title,
      trending: /2026|best |cheapest |vs /.test(title.toLowerCase()),
      publishedAt: meta.date_updated || meta.date_published || '2026-07-23',
      sections,
    };

    imported.push(clean);
    existingSlugs.add(slug);
    console.log(
      `+ ${file} → /learn/${slug} [${category}] ${w}w ${clean.readTime} (${meta.schema_type || 'Article'})`
    );
  }

  const merged = [...kept, ...imported];

  // Categories union
  const cats = new Set([...(data.categories || []), ...imported.map((a) => a.category)]);
  const categories = [...cats].sort((a, b) => a.localeCompare(b));

  const sourceNotes = [
    ...(data.sourceNotes || []).filter((n) => !/seo-articles batch|fleet-raven seo/i.test(n)),
    `SEO long-form batch: imported ${imported.length} articles from content/seo-articles (article-01…${String(files.length).padStart(2, '0')}.md) via scripts/import-seo-articles.mjs — commercial/informational ranking guides with Quick Answer + FAQ structure.`,
  ];

  const out = {
    generatedAt: new Date().toISOString().slice(0, 10),
    sourceNotes,
    count: merged.length,
    categories,
    articles: merged,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log('\nDone.');
  console.log(`Previous pillars kept: ${kept.length}`);
  console.log(`Imported SEO articles: ${imported.length}`);
  console.log(`Skipped: ${skipped.length}`, skipped);
  console.log(`Total learn articles: ${merged.length}`);
  console.log(`Wrote ${OUT_FILE}`);
}

main();
