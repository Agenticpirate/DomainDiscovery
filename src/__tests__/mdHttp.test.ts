/** @jest-environment node */
import { estimateTokens, markdown404, markdownResponse, optionsResponse } from '@/lib/md/http';

const opts = { canonicalUrl: 'https://www.example.com/pricing' };

describe('markdownResponse', () => {
  it('sets every required header', async () => {
    const body = 'x'.repeat(41);
    const res = markdownResponse(body, { ...opts, negotiated: true, lastModified: '2026-07-22' });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(res.headers.get('X-Markdown-Tokens')).toBe('11');
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    expect(res.headers.get('Content-Location')).toBe(opts.canonicalUrl);
    expect(res.headers.get('Link')).toContain(`<${opts.canonicalUrl}>; rel="canonical"`);
    expect(res.headers.get('Vary')).toBe('Accept');
    expect(res.headers.get('Cache-Control')).toBe('public, s-maxage=3600, stale-while-revalidate=86400');
    expect(res.headers.get('Last-Modified')).toBe('Wed, 22 Jul 2026 00:00:00 GMT');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, HEAD, OPTIONS');
    expect(await res.text()).toBe(body);
  });

  it('only varies on Accept when negotiated and caches static pages longer', () => {
    const plain = markdownResponse('a', opts);
    expect(plain.headers.get('Vary')).toBeNull();
    expect(plain.headers.get('Last-Modified')).toBeNull();
    const long = markdownResponse('a', { ...opts, longCache: true });
    expect(long.headers.get('Cache-Control')).toContain('s-maxage=86400');
  });

  it('answers HEAD with the same headers and no body', async () => {
    const res = markdownResponse('hello world', { ...opts, method: 'HEAD' });
    expect(res.headers.get('X-Markdown-Tokens')).toBe(String(estimateTokens('hello world')));
    expect(await res.text()).toBe('');
  });
});

describe('markdown404 and optionsResponse', () => {
  it('returns a Markdown body with status 404', async () => {
    const res = markdown404('/nope');
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    expect(await res.text()).toMatch(/^# Not found/);
    expect(await markdown404('/nope', 'HEAD').text()).toBe('');
  });

  it('answers preflight with 204 and CORS headers', () => {
    const res = optionsResponse();
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, HEAD, OPTIONS');
  });
});
