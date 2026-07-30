import { getLearnArticles } from '@/lib/learnArticles';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';

/**
 * RSS 2.0 feed of Learn guides — consumed by Google, Bing, Feedly, and other indexers.
 */
export function GET() {
  const base = getSiteBaseUrl();
  const articles = getLearnArticles()
    .slice()
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 50);

  const items = articles
    .map((a) => {
      const link = `${base}/learn/${a.slug}`;
      const pub = a.publishedAt ? new Date(`${a.publishedAt}T12:00:00.000Z`).toUTCString() : new Date().toUTCString();
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <category>${escapeXml(a.category)}</category>
      <description>${escapeXml(a.description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_BRAND.name)} Learn</title>
    <link>${base}/learn</link>
    <description>Domain name guides from ${escapeXml(SITE_BRAND.name)} — search, registration, geo domains, WHOIS, pricing.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${base}/logo-solid.png</url>
      <title>${escapeXml(SITE_BRAND.name)}</title>
      <link>${base}/learn</link>
    </image>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
