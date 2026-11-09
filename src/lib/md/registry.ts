/**
 * Route pattern → Markdown renderer. Adding a page takes one step: add a route definition
 * (or call registerMarkdown). llms.txt, llms-full.txt and the catalog read from this list.
 */
import { abs } from './format';
import { isLongCachePattern, matchMarkdownRoute, mdPathFromHtmlPath } from './routes';
import { CORE_ROUTES } from './renderers/core';
import { LEARN_ROUTES } from './renderers/learn';
import { LEGAL_ROUTES } from './renderers/legal';
import { RESEARCH_ROUTES } from './renderers/research';
import { SEO_ROUTES } from './renderers/seoPages';
import { TLD_ROUTES } from './renderers/tlds';
import type { MdContext, MdDoc, MdGroup, MdRenderer, MdRouteDef, MdRouteInfo } from './types';

export type { MdContext, MdDoc, MdGroup, MdRenderer, MdRouteDef, MdRouteInfo } from './types';

const ROUTES: MdRouteDef[] = [...CORE_ROUTES, ...LEARN_ROUTES, ...TLD_ROUTES, ...SEO_ROUTES, ...RESEARCH_ROUTES, ...LEGAL_ROUTES];

/** Register a renderer for a route pattern. The pattern must also be allowed in routes.ts. */
export function registerMarkdown(
  pattern: string,
  render: MdRenderer,
  meta: { group: MdGroup; list: MdRouteDef['list'] }
): void {
  ROUTES.push({ pattern, render, ...meta });
}

export function getRegisteredPatterns(): string[] {
  return ROUTES.map((r) => r.pattern);
}

export type MdRendered = { doc: MdDoc; canonicalUrl: string; longCache: boolean };

/** Render the Markdown for an HTML path. Null for unknown routes, missing entities and skipped pages. */
export async function renderMarkdown(htmlPath: string): Promise<MdRendered | null> {
  const match = matchMarkdownRoute(htmlPath);
  if (!match) return null;
  const route = ROUTES.find((r) => r.pattern === match.pattern);
  if (!route) return null;
  const ctx: MdContext = { path: match.path, params: match.params, locale: match.locale };
  const doc = await route.render(ctx);
  if (!doc) return null;
  return { doc, canonicalUrl: abs(match.path), longCache: isLongCachePattern(match.pattern) };
}

/** Every addressable Markdown route, once each. */
export function listMarkdownRoutes(): MdRouteInfo[] {
  const seen = new Set<string>();
  const out: MdRouteInfo[] = [];
  for (const route of ROUTES) {
    for (const item of route.list()) {
      if (seen.has(item.path)) continue;
      seen.add(item.path);
      out.push({ ...item, mdPath: mdPathFromHtmlPath(item.path), group: route.group });
    }
  }
  return out;
}
