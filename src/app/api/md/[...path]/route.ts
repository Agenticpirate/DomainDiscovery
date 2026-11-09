import { abs, escapeMd, heading, oneLine, page } from '@/lib/md/format';
import { markdown404, markdownResponse, optionsResponse } from '@/lib/md/http';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';
import { listMarkdownRoutes, renderMarkdown, type MdGroup } from '@/lib/md/registry';

/**
 * The one Markdown handler. Middleware rewrites `/<page>.md` and Accept: text/markdown requests
 * here; `/api/md/<path>` also works directly. `/api/md/_catalog` lists every Markdown route.
 */
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ path: string[] }> };

const GROUP_TITLES: Record<MdGroup, string> = {
  core: 'Core pages',
  tool: 'Tools',
  guide: 'Guides',
  tld: 'TLD pages',
  alternative: 'Alternatives',
  industry: 'Industry ideas',
  lead: 'Domain lead guides',
  legal: 'Legal',
};

function catalog(method: string): Response {
  const base = getSiteBaseUrl();
  const routes = listMarkdownRoutes();
  const parts: string[] = [`${routes.length} pages have a Markdown version. Add .md to the page URL, or request /api/md/<path>.`];
  for (const group of Object.keys(GROUP_TITLES) as MdGroup[]) {
    const items = routes.filter((r) => r.group === group);
    if (!items.length) continue;
    // The catalog points at the .md versions; page bodies point at HTML.
    const lines = items.map((r) => `- [${escapeMd(oneLine(r.title))}](${base}${r.mdPath}) - ${oneLine(r.description)}`);
    parts.push(heading(2, GROUP_TITLES[group]), lines.join('\n'));
  }
  const body = page({
    title: 'DomainDiscovery Markdown catalog',
    summary: 'Every page on the site that has a Markdown version.',
    path: '/api/md/_catalog',
    body: parts.join('\n\n'),
  });
  return markdownResponse(body, { canonicalUrl: abs('/api/md/_catalog'), method });
}

async function handle(request: Request, ctx: RouteContext): Promise<Response> {
  const method = request.method;
  const negotiated = request.headers.get('x-md-negotiated') === '1';
  const segments = (await ctx.params).path ?? [];
  const last = segments[segments.length - 1] ?? '';

  if (segments.length === 1 && last === '_catalog') return catalog(method);

  const trimmed = last.endsWith('.md') ? [...segments.slice(0, -1), last.slice(0, -3)] : segments;
  const htmlPath = trimmed.length === 1 && trimmed[0] === 'index' ? '/' : `/${trimmed.join('/')}`;

  const rendered = await renderMarkdown(htmlPath);
  if (!rendered) return markdown404(htmlPath, method, negotiated);
  return markdownResponse(rendered.doc.markdown, {
    canonicalUrl: rendered.canonicalUrl,
    negotiated,
    lastModified: rendered.doc.lastModified,
    longCache: rendered.longCache,
    method,
  });
}

export async function GET(request: Request, ctx: RouteContext) {
  return handle(request, ctx);
}

export async function HEAD(request: Request, ctx: RouteContext) {
  return handle(request, ctx);
}

export function OPTIONS() {
  return optionsResponse();
}
