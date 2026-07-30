import { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

/**
 * robots.txt for search + AI crawlers.
 * LLM product index: /llms.txt and /llms-full.txt (linked from those files; not a ranking lever).
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  const disallow = ['/api/', '/share/']; // ephemeral OG share cards

  // Explicit allow for common AI + search crawlers (same rules as *)
  const aiAgents = [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'Google-Extended',
    'GoogleOther',
    'Googlebot',
    'Googlebot-Image',
    'Bingbot',
    'DuckDuckBot',
    'PerplexityBot',
    'ClaudeBot',
    'anthropic-ai',
    'Applebot',
    'Applebot-Extended',
    'Bytespider',
    'cohere-ai',
    'meta-externalagent',
    'FacebookBot',
    'Amazonbot',
    'YouBot',
    'Diffbot',
    'CCBot',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      ...aiAgents.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
