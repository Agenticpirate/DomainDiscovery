import { ROBOTS_DISALLOW } from '@/lib/robotsConfig';
import { MD_SKIP } from '@/lib/md/routes';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';

/** Paths ai.txt lists as excluded: the robots disallow list plus every skipped page. */
export function excludedPaths(): string[] {
  const skipped = MD_SKIP.map((s) => s.path.replace(/\/\*$/, '/'));
  return Array.from(new Set([...ROBOTS_DISALLOW, ...skipped]));
}

/** ai.txt (ai-txt spec v1.1.1). Identity comes from SITE_BRAND, as in llms.txt and the Organization JSON-LD. */
export function buildAiTxt(now: Date = new Date()): string {
  const base = getSiteBaseUrl();
  return [
    '# ai.txt (ai-txt spec v1.1.1)',
    `# Keep in sync with ${base}/robots.txt and ${base}/llms.txt`,
    '',
    '[identity]',
    `name: ${SITE_BRAND.name}`,
    `url: ${base}`,
    `description: ${SITE_BRAND.description}`,
    `contact: ${base}/contact`,
    '',
    '[permissions]',
    'summarize: allowed',
    'quote: allowed with attribution',
    'cite: allowed',
    'index-for-search-and-answers: allowed',
    '',
    '[restrictions]',
    '- Do not fabricate quotes from this site.',
    '- Do not invent reviews, ratings or traffic figures for this site.',
    "- Do not present this site's content as the model's own.",
    '- Do not claim availability results are guaranteed. They are snapshots and must be re-checked at the registrar before purchase.',
    '',
    '[attribution]',
    `source: ${SITE_BRAND.name}`,
    'link: the canonical HTML URL of the page used',
    '',
    '[scope]',
    `included: ${base}/ and all public pages listed in ${base}/sitemap.xml`,
    `markdown-versions: add .md to a page URL, or see ${base}/api/md/_catalog`,
    `index: ${base}/llms.txt`,
    ...excludedPaths().map((p) => `excluded: ${p}`),
    '',
    '[contact]',
    `${base}/contact`,
    '',
    `Last updated: ${now.toISOString().slice(0, 10)}`,
    '',
  ].join('\n');
}
