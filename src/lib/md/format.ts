/** Small Markdown helpers shared by every renderer. Links are always absolute and point at HTML. */
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

/** Absolute URL for a site path. Absolute inputs pass through; `.md` suffixes are removed. */
export function abs(path: string): string {
  const base = getSiteBaseUrl();
  const raw = /^https?:\/\//i.test(path) ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  // Only the path loses its .md suffix; a query string or fragment is left alone.
  const cut = raw.search(/[?#]/);
  const pathPart = cut === -1 ? raw : raw.slice(0, cut);
  const rest = cut === -1 ? '' : raw.slice(cut);
  const clean = pathPart.replace(/\/index\.md$/, '/').replace(/\.md$/, '');
  return `${clean === base ? `${base}/` : clean}${rest}`;
}

/** Escape characters that would break link text or a table cell. */
export function escapeMd(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\|/g, '\\|');
}

/** One line of plain text with whitespace collapsed. */
export function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function heading(level: 1 | 2 | 3 | 4, text: string): string {
  return `${'#'.repeat(level)} ${oneLine(text)}`;
}

export function link(text: string, target: string): string {
  return `[${escapeMd(oneLine(text))}](${abs(target)})`;
}

export function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

/** `- [Title](url) - one-line description`, the listing format for hub pages. */
export function listItem(title: string, target: string, description?: string): string {
  const desc = description ? oneLine(description) : '';
  return `- ${link(title, target)}${desc ? ` - ${desc}` : ''}`;
}

export function table(headers: string[], rows: string[][]): string {
  const cell = (v: string) => oneLine(v).replace(/\|/g, '\\|');
  const head = `| ${headers.map(cell).join(' | ')} |`;
  const rule = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map(cell).join(' | ')} |`);
  return [head, rule, ...body].join('\n');
}

export function codeBlock(code: string, lang = ''): string {
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

/** YYYY-MM-DD for ISO strings and Dates; null when the input is not a real date. */
export function fmtDate(input: string | Date | null | undefined): string | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** FAQ as `### Question` followed by the answer. */
export function faqBlock(items: Array<{ question: string; answer: string }>): string {
  return items.map((i) => `${heading(3, i.question)}\n\n${i.answer.trim()}`).join('\n\n');
}

export type RelatedLink = { text: string; href: string };

export type PageInput = {
  title: string;
  summary: string;
  /** HTML path, locale prefix included */
  path: string;
  /** Real last-updated date only; omitted when unknown */
  updated?: string | null;
  /** Main content, already Markdown */
  body: string;
  related?: RelatedLink[];
};

/** The page layout from the spec: title, summary, canonical, date, body, related links. */
export function page(input: PageInput): string {
  const lines = [heading(1, input.title), '', `> ${oneLine(input.summary)}`, '', `Canonical: ${abs(input.path)}`];
  const updated = fmtDate(input.updated);
  if (updated) lines.push(`Last updated: ${updated}`);
  lines.push('', input.body.trim());
  const related = input.related ?? [];
  if (related.length) {
    lines.push('', heading(2, 'Related'), '', ...related.map((r) => `- ${link(r.text, r.href)}`));
  }
  return `${lines.join('\n')}\n`;
}
