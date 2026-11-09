/**
 * Shared shape for research pages. A study module builds a Report from data;
 * the HTML page, the Markdown mirror, llms.txt and the hub all read the same object,
 * so every number comes from one calculation.
 */

export type ReportFinding = { id: string; text: string };
export type ReportFaq = { id: string; question: string; answer: string };
export type ReportTable = {
  id: string;
  caption: string;
  headers: string[];
  rows: string[][];
};

export type Report = {
  slug: string;
  path: string;
  title: string;
  h1: string;
  description: string;
  /** One-line summary for the hub and llms.txt */
  summary: string;
  intro: string;
  /** ISO date (YYYY-MM-DD) the underlying data was generated. Never "now". */
  updated: string;
  datasetName: string;
  variables: string[];
  technique: string;
  findings: ReportFinding[];
  tables: ReportTable[];
  methodology: string[];
  faq: ReportFaq[];
  /** Internal pages that list or use the same data */
  related: { href: string; label: string }[];
};

/** Findings with fewer rows behind them than this are not published. */
export const MIN_SAMPLE = 20;

export function formatInt(n: number): string {
  return n.toLocaleString('en-US');
}

/** Whole-percent share, rounded half up. Callers must say which denominator they use. */
export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const m = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(m * 100) / 100;
}

/** "Month YYYY" for a YYYY-MM-DD date, in UTC. */
export function monthYear(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function suggestedCitation(report: Report, baseUrl: string): string {
  return `DomainDiscovery (${new Date(`${report.updated}T00:00:00Z`).getUTCFullYear()}). ${report.h1}. ${baseUrl}${report.path}. Data as of ${monthYear(report.updated)}.`;
}

export function reportToMarkdown(report: Report, baseUrl: string): string {
  const url = `${baseUrl}${report.path}`;
  const lines: string[] = [
    `# ${report.h1}`,
    ``,
    `> ${report.description}`,
    ``,
    `Canonical: ${url}`,
    `Data as of: ${report.updated}`,
    ``,
    report.intro,
    ``,
    `## Key findings`,
    ``,
  ];
  report.findings.forEach((f, i) => lines.push(`${i + 1}. ${f.text} (${url}#${f.id})`));
  lines.push(``);
  for (const table of report.tables) {
    lines.push(`## ${table.caption}`, ``);
    lines.push(`| ${table.headers.join(' | ')} |`);
    lines.push(`| ${table.headers.map(() => ':---').join(' | ')} |`);
    for (const row of table.rows) lines.push(`| ${row.join(' | ')} |`);
    lines.push(``);
  }
  lines.push(`## Methodology`, ``);
  report.methodology.forEach((m) => lines.push(`- ${m}`));
  lines.push(``, `## Frequently asked questions`, ``);
  for (const q of report.faq) lines.push(`### ${q.question}`, ``, `${q.answer} (${url}#${q.id})`, ``);
  lines.push(`## Suggested citation`, ``, suggestedCitation(report, baseUrl), ``);
  return lines.join('\n');
}

export const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
} as const;

/** Markdown mirror: noindex, with the HTML page as canonical. */
export function reportMarkdownResponse(report: Report, baseUrl: string): Response {
  return new Response(reportToMarkdown(report, baseUrl), {
    headers: {
      ...MARKDOWN_HEADERS,
      'X-Robots-Tag': 'noindex',
      Link: `<${baseUrl}${report.path}>; rel="canonical"`,
    },
  });
}
