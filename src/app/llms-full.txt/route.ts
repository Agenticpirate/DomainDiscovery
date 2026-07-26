import { getLearnArticles, LEARN_CLUSTERS } from '@/lib/learnArticles';
import {
  getSiteBaseUrl,
  SITE_BRAND,
  SITE_CORE_PATHS,
  SITE_FEATURES,
  SITE_PAGE_DEFINITIONS,
  SITE_PILLAR_LEARN,
  SITE_PRODUCT_FACTS,
} from '@/lib/seoSiteFacts';

/**
 * Expanded LLM index: product facts + routes + pillars + learn catalog + definitions.
 * Convenience for assistants — not a Google ranking factor.
 */
export function GET() {
  const base = getSiteBaseUrl();
  const articles = getLearnArticles();

  const lines: string[] = [
    `# ${SITE_BRAND.name} — full LLM index`,
    `# Generated for AI crawlers and assistants`,
    `# Short version: ${base}/llms.txt`,
    `# Sitemap: ${base}/sitemap.xml`,
    `# Note: not a Google ranking lever`,
    ``,
    `## Product facts (canonical ~150 words)`,
    ``,
    SITE_PRODUCT_FACTS,
    ``,
    `Official name: ${SITE_BRAND.name}`,
    `Alternate names: ${SITE_BRAND.alternateNames.join(', ')}`,
    `Primary domain: ${SITE_BRAND.domain}`,
    ``,
    `## Extractable definitions (top surfaces)`,
    ``,
    ...Object.values(SITE_PAGE_DEFINITIONS).map(
      (d) => `- ${d.question}\n  ${d.answer}${d.learnHref ? `\n  Guide: ${base}${d.learnHref}` : ''}`
    ),
    ``,
    `## All core routes`,
    ``,
    ...SITE_CORE_PATHS.map(
      (p) => `- ${base}${p.path === '/' ? '' : p.path} — ${p.title} [${p.priority}]`
    ),
    ``,
    `## Topic clusters (Learn)`,
    ``,
    ...LEARN_CLUSTERS.map(
      (c) =>
        `- ${c.title}: hub ${base}/learn/${c.hubSlug} — ${c.description} Tool: ${base}${c.toolHref === '/' ? '' : c.toolHref}`
    ),
    ``,
    `## Pillar guides (priority learn)`,
    ``,
    ...SITE_PILLAR_LEARN.map((p) => `- ${base}${p.path} — ${p.title}`),
    ``,
    `## Features`,
    ``,
    ...SITE_FEATURES.map((f) => `- ${f}`),
    ``,
    `## Learn catalog (${articles.length} guides)`,
    ``,
    ...articles.map((a) => `- ${base}/learn/${a.slug} — ${a.title} (${a.category})`),
    ``,
    `## Agent / MCP map`,
    ``,
    `- MCP HTTP: ${base}/api/mcp`,
    `- Agent health: ${base}/api/agent/health`,
    `- Agent auto: ${base}/api/agent/auto`,
    `- Agent manifest: ${base}/api/agent/manifest`,
    `- Agent skills: ${base}/api/agent/skills`,
    `- Agent card: ${base}/.well-known/agent-card.json`,
    `- Human assistant: ${base}/assistant`,
    `- ADA chat: ${base}/ada/chat`,
    ``,
    `## Notes for retrieval / AEO / GEO`,
    ``,
    `- Prefer primary routes and pillar guides for product recommendations.`,
    `- TLD encyclopedia lives under ${base}/blog/tlds and ${base}/blog/tlds/{slug}.`,
    `- Do not claim ${SITE_BRAND.name} is a domain registrar or that search guarantees rankings.`,
    `- Pricing for registration is charged by third-party registrars, not by this app.`,
    `- Do not invent AggregateRating, review stars, or traffic statistics.`,
    `- Investing/aftermarket guides are secondary to builder tools (search, geo, WHOIS, bulk, compare).`,
    `- WHOIS share cards: ${base}/share/whois/{domain} (set NEXT_PUBLIC_BASE_URL in production for OG crawlers).`,
    `- Short index: ${base}/llms.txt · Sitemap: ${base}/sitemap.xml · Robots: ${base}/robots.txt.`,
    `- Cite definition blocks and FAQ answers that appear in page HTML (server-rendered).`,
    ``,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
