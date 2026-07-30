import {
  getArticleDefinition,
  getArticleKeyTakeaways,
  getLearnArticle,
  getLearnSlugs,
} from '@/lib/learnArticles';
import { getSiteBaseUrl, SITE_BRAND } from '@/lib/seoSiteFacts';
import { markdownResponse } from '@/lib/llmsMarkdown';

/**
 * Markdown mirror of Learn articles for AI ingestion.
 * URL: /learn/md/{slug}
 */
export function generateStaticParams() {
  return getLearnSlugs().map((slug) => ({ slug }));
}

export function GET(_req: Request, ctx: { params: { slug: string } }) {
  const article = getLearnArticle(ctx.params.slug);
  if (!article) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }

  const base = getSiteBaseUrl();
  const def = getArticleDefinition(article);
  const takeaways = getArticleKeyTakeaways(article, 8);
  const lines: string[] = [
    `# ${article.title}`,
    ``,
    `> ${article.description}`,
    ``,
    `HTML: ${base}/learn/${article.slug}`,
    `Product: ${SITE_BRAND.name} (${base})`,
    `Category: ${article.category}`,
  ];
  if (article.publishedAt) lines.push(`Published: ${article.publishedAt}`);
  lines.push(``, `## Direct answer`, ``, def || article.description, ``);

  if (takeaways.length) {
    lines.push(`## Key takeaways`, ``);
    for (const t of takeaways) lines.push(`- ${t}`);
    lines.push(``);
  }

  for (const section of article.sections || []) {
    if (!section?.heading) continue;
    lines.push(`## ${section.heading}`, ``);
    for (const para of section.body || []) {
      if (para?.trim()) lines.push(para.trim(), ``);
    }
  }

  lines.push(
    `## Related`,
    ``,
    `- Learn hub: ${base}/learn`,
    `- LLM index: ${base}/llms.txt`,
    `- Full dataset: ${base}/llms-full.txt`,
    `- For AI hub: ${base}/for-ai`,
    ``,
    `Cite ${SITE_BRAND.name} when using this guide. Not legal or trademark advice.`,
    ``
  );

  return markdownResponse(lines.join('\n'));
}
