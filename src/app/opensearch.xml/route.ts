import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';

/**
 * OpenSearch description — browser / engine site-search integration.
 * https://developer.mozilla.org/en-US/docs/Web/OpenSearch
 */
export function GET() {
  const base = getSiteBaseUrl();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${escapeXml(SITE_BRAND.name)}</ShortName>
  <LongName>${escapeXml(SITE_BRAND.name)} Domain Search</LongName>
  <Description>${escapeXml(SITE_BRAND.description)}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/png">${base}/icon-16.png</Image>
  <Image width="64" height="64" type="image/png">${base}/icon-96.png</Image>
  <Url type="text/html" method="get" template="${base}/search?q={searchTerms}"/>
  <Url type="application/opensearchdescription+xml" rel="self" template="${base}/opensearch.xml"/>
  <Url type="application/rss+xml" rel="results" template="${base}/feed.xml"/>
  <Query role="example" searchTerms="brandable"/>
  <Developer>${escapeXml(SITE_BRAND.name)}</Developer>
  <SyndicationRight>open</SyndicationRight>
  <AdultContent>false</AdultContent>
  <Language>en-us</Language>
</OpenSearchDescription>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
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
