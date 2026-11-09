/** Response builders for the Markdown endpoint: one place for every header. */
import { DESCRIBEDBY_LINK } from './head';
import { MD_CACHE_CONTROL } from './routes';

const CACHE_DEFAULT = MD_CACHE_CONTROL.default;
const CACHE_LONG = MD_CACHE_CONTROL.long;
const CACHE_NOT_FOUND = 'public, s-maxage=300, stale-while-revalidate=3600';

export type MarkdownResponseOptions = {
  /** Absolute HTML URL this Markdown stands for */
  canonicalUrl: string;
  /** True when chosen by the Accept header, so caches must vary on it */
  negotiated?: boolean;
  lastModified?: string | Date | null;
  /** Static pages change rarely: cache them longer */
  longCache?: boolean;
  method?: string;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
} as const;

/** One token is about four characters. */
export function estimateTokens(body: string): number {
  return Math.ceil(body.length / 4);
}

function baseHeaders(body: string): Headers {
  const h = new Headers(CORS);
  h.set('Content-Type', 'text/markdown; charset=utf-8');
  h.set('X-Markdown-Tokens', String(estimateTokens(body)));
  h.set('X-Robots-Tag', 'noindex, follow');
  return h;
}

export function markdownResponse(body: string, opts: MarkdownResponseOptions): Response {
  const h = baseHeaders(body);
  h.set('Content-Location', opts.canonicalUrl);
  // One Link value: the canonical plus the global describedby links (a config header would replace it).
  h.append('Link', `<${opts.canonicalUrl}>; rel="canonical", ${DESCRIBEDBY_LINK}`);
  h.set('Cache-Control', opts.longCache ? CACHE_LONG : CACHE_DEFAULT);
  if (opts.negotiated) h.set('Vary', 'Accept');
  if (opts.lastModified) {
    const d = opts.lastModified instanceof Date ? opts.lastModified : new Date(opts.lastModified);
    if (!Number.isNaN(d.getTime())) h.set('Last-Modified', d.toUTCString());
  }
  const isHead = (opts.method ?? 'GET').toUpperCase() === 'HEAD';
  return new Response(isHead ? null : body, { status: 200, headers: h });
}

/** Markdown 404. Never HTML, so an agent can read why nothing was found. */
export function markdown404(path: string, method = 'GET', negotiated = false): Response {
  const body = [
    '# Not found',
    '',
    `> No Markdown version exists for \`${path.replace(/`/g, '')}\`.`,
    '',
    'Every Markdown page is listed in the catalog at /api/md/_catalog.',
    '',
  ].join('\n');
  const h = baseHeaders(body);
  h.set('Cache-Control', CACHE_NOT_FOUND);
  if (negotiated) h.set('Vary', 'Accept');
  return new Response(method.toUpperCase() === 'HEAD' ? null : body, { status: 404, headers: h });
}

/** CORS preflight. */
export function optionsResponse(): Response {
  const h = new Headers(CORS);
  h.set('Access-Control-Allow-Headers', 'Accept, Content-Type');
  h.set('Access-Control-Max-Age', '86400');
  h.set('Allow', 'GET, HEAD, OPTIONS');
  return new Response(null, { status: 204, headers: h });
}
