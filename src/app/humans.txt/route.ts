import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';

export function GET() {
  const base = getSiteBaseUrl();
  const body = `/* TEAM */
Site: ${SITE_BRAND.name}
Also known as: ${SITE_BRAND.alternateNames.join(', ')}
URL: ${base}
Contact: ${base}/contact

/* SITE */
Standards: HTML5, CSS, Next.js App Router
Components: Domain search, AI generator, bulk checker, geo domains, WHOIS, TLD encyclopedia, price compare
Privacy: Saved shortlists stay local in the browser unless a feature states otherwise
Doctype: HTML5
Language: English

/* AI / LLM DISCOVERY */
llms.txt: ${base}/llms.txt
llms-full.txt: ${base}/llms-full.txt
for-ai: ${base}/for-ai
ai.txt: ${base}/ai.txt
well-known-llms: ${base}/.well-known/llms.txt
indexnow-key: ${base}/.well-known/indexnow.txt
markdown-mirrors: ${base}/search.md ${base}/generator.md ${base}/geo.md ${base}/whois.md ${base}/pricing.md
learn-md: ${base}/learn/md/{slug}

/* BRAND */
Official: ${SITE_BRAND.name}
Variants: Domain Discovery, Domains Discovery
Domain: ${SITE_BRAND.domain}

/* THANKS */
Built for founders, local businesses, and domain researchers who need free availability checks
before registering at a third-party registrar.

/* LAST UPDATE */
${new Date().toISOString().slice(0, 10)}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
