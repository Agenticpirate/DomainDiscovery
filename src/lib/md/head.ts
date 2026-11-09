/**
 * Head signals that point agents at the Markdown version of a page. No data imports, so the
 * metadata helpers can use it. Callers pass the base URL to avoid an import cycle.
 */
import { matchMarkdownRoute, mdPathFromHtmlPath } from './routes';

/** Global Link header value pointing agents at the site-level descriptions (root-relative). */
export const DESCRIBEDBY_LINK =
  '</llms.txt>; rel="describedby", </llms-full.txt>; rel="describedby", </ai.txt>; rel="describedby"';

/** `alternates.types` entry for a page that has Markdown; empty for pages that do not. */
export function markdownAlternateTypes(
  baseUrl: string,
  htmlPath: string
): { types?: Record<string, string> } {
  if (!matchMarkdownRoute(htmlPath)) return {};
  const path = htmlPath.length > 1 ? htmlPath.replace(/\/$/, '') : htmlPath;
  return { types: { 'text/markdown': `${baseUrl}${mdPathFromHtmlPath(path)}` } };
}

/** `other` entry that renders `<meta name="ai-summary">`. */
export function aiSummaryOther(summary: string): Record<string, string> {
  return { 'ai-summary': summary.replace(/\s+/g, ' ').trim() };
}
