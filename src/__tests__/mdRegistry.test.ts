/** @jest-environment node */
import { getLearnArticles, getLearnTranslatedLocales } from '@/lib/learnArticles';
import { getIndustrySlugs } from '@/lib/industries';
import { getAlternativeSlugs } from '@/lib/alternatives';
import { listMarkdownRoutes, renderMarkdown } from '@/lib/md/registry';
import {
  htmlPathFromMdPath,
  isExcludedPath,
  LEGACY_MD_REDIRECTS,
  matchMarkdownRoute,
  MD_SKIP,
  MD_STATIC_PATHS,
} from '@/lib/md/routes';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

const base = getSiteBaseUrl();
const translated = getLearnArticles().find((a) => getLearnTranslatedLocales(a.slug).length > 0)!;
const locale = getLearnTranslatedLocales(translated.slug)[0];
const untranslatedLocale = (['zh', 'de', 'es', 'ja', 'fr', 'pt', 'hi', 'ar', 'ru', 'bn', 'ur'] as const).find(
  (l) => !getLearnTranslatedLocales(translated.slug).includes(l)
);

describe('route matching', () => {
  it('maps .md paths to HTML paths', () => {
    expect(htmlPathFromMdPath('/index.md')).toBe('/');
    expect(htmlPathFromMdPath('/pricing.md')).toBe('/pricing');
    expect(htmlPathFromMdPath('/blog/tlds/ai.md')).toBe('/blog/tlds/ai');
    expect(htmlPathFromMdPath('/pricing')).toBeNull();
  });

  it('matches allowlisted pages, dynamic families and translated guides only', () => {
    expect(matchMarkdownRoute('/search')?.pattern).toBe('/search');
    expect(matchMarkdownRoute('/learn/some-guide')?.pattern).toBe('/learn/[slug]');
    expect(matchMarkdownRoute('/fr/learn/some-guide')).toMatchObject({ locale: 'fr', params: { slug: 'some-guide' } });
    expect(matchMarkdownRoute('/fr/search')).toBeNull();
    expect(matchMarkdownRoute('/en/learn/some-guide')).toBeNull();
    expect(matchMarkdownRoute('/not-a-page')).toBeNull();
  });

  it('never matches skipped, private or machine files', () => {
    for (const path of ['/premium', '/saved-domains', '/assistant', '/share/whois/a.com', '/ada', '/leads', '/api/md/search']) {
      expect(matchMarkdownRoute(path)).toBeNull();
    }
    for (const path of ['/llms.txt', '/llms-full.txt', '/ai.txt', '/robots.txt', '/sitemap.xml', '/feed.xml', '/.well-known/x', '/_next/a', '/logo.png']) {
      expect(isExcludedPath(path)).toBe(true);
    }
  });

  it('keeps legacy redirects pointing at addressable pages', () => {
    for (const target of Object.values(LEGACY_MD_REDIRECTS)) {
      const html = htmlPathFromMdPath(target)!;
      expect(matchMarkdownRoute(html)).not.toBeNull();
    }
    expect(getLearnArticles().some((a) => a.slug === 'what-is-domaindiscovery')).toBe(true);
  });
});

describe('renderMarkdown', () => {
  it('renders every allowlisted static page in the spec layout', async () => {
    for (const path of MD_STATIC_PATHS) {
      const out = await renderMarkdown(path);
      expect(out).not.toBeNull();
      const md = out!.doc.markdown;
      expect(md).toMatch(/^# .+\n\n> .+\n\nCanonical: https?:\/\//);
      expect(md).toContain(`Canonical: ${path === '/' ? `${base}/` : `${base}${path}`}\n`);
    }
  });

  it('renders the home page, a guide, a translated guide, a TLD, an alternative and an industry page', async () => {
    const home = await renderMarkdown('/');
    expect(home!.doc.markdown).toContain('## Features');

    const guide = await renderMarkdown(`/learn/${translated.slug}`);
    expect(guide!.doc.markdown).toContain('## Direct answer');
    expect(guide!.doc.lastModified ?? null).toBe(translated.publishedAt ?? null);

    const localized = await renderMarkdown(`/${locale}/learn/${translated.slug}`);
    expect(localized!.doc.markdown).toContain(`Canonical: ${base}/${locale}/learn/${translated.slug}`);
    expect(localized!.doc.markdown).not.toBe(guide!.doc.markdown);

    const tld = await renderMarkdown('/blog/tlds/com');
    expect(tld!.doc.markdown).toContain('## FAQ');
    expect(tld!.doc.markdown).toContain('### ');

    const alt = await renderMarkdown(`/alternatives/${getAlternativeSlugs()[0]}`);
    expect(alt!.doc.markdown).toContain('side by side');

    const industry = await renderMarkdown(`/domain-name-ideas/${getIndustrySlugs()[0]}`);
    expect(industry!.doc.markdown).toContain('## Sample names');
  });

  it('returns null for unknown slugs, untranslated locales and skipped pages', async () => {
    expect(await renderMarkdown('/learn/does-not-exist')).toBeNull();
    expect(await renderMarkdown('/blog/tlds/zzzzzz-not-a-tld')).toBeNull();
    expect(await renderMarkdown('/alternatives/nope')).toBeNull();
    if (untranslatedLocale) expect(await renderMarkdown(`/${untranslatedLocale}/learn/${translated.slug}`)).toBeNull();
    expect(await renderMarkdown('/premium')).toBeNull();
  });

  it('keeps internal links absolute and pointing at HTML', async () => {
    const paths = ['/', '/search', '/tools/compare', '/learn', `/learn/${translated.slug}`, '/blog/tlds/ai', '/privacy'];
    for (const path of paths) {
      const md = (await renderMarkdown(path))!.doc.markdown;
      expect(md).not.toMatch(/\]\(\//);
      expect(md).not.toMatch(/\]\([^)]*\.md[)#?]/);
    }
  });
});

describe('listMarkdownRoutes', () => {
  const routes = listMarkdownRoutes();

  it('has no duplicates and no skip-listed path', () => {
    const paths = routes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    const skipped = MD_SKIP.filter((s) => !s.path.endsWith('/*')).map((s) => s.path);
    for (const path of paths) expect(skipped).not.toContain(path);
    for (const path of paths) expect(path.startsWith('/ada') || path.startsWith('/api') || path.startsWith('/share')).toBe(false);
  });

  it('lists the home page as /index.md and translated guides', () => {
    expect(routes.find((r) => r.path === '/')?.mdPath).toBe('/index.md');
    expect(routes.some((r) => r.path === `/${locale}/learn/${translated.slug}`)).toBe(true);
    expect(routes.every((r) => matchMarkdownRoute(r.path) !== null)).toBe(true);
  });
});
