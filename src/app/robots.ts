import { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

/**
 * robots.txt for major search engines + AI crawlers.
 * Sitemap + host declared for Google, Bing, Yandex, DuckDuckGo, etc.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();
  const disallow = ['/api/', '/share/'];

  // Explicit rules help engines that look for named user-agents
  const searchAndAiAgents = [
    // Search
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-News',
    'Googlebot-Video',
    'GoogleOther',
    'Bingbot',
    'Slurp', // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'YandexImages',
    'Sogou',
    'Exabot',
    'facebot',
    'ia_archiver',
    'Applebot',
    // AI / LLM
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'Google-Extended',
    'PerplexityBot',
    'ClaudeBot',
    'anthropic-ai',
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
      ...searchAndAiAgents.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow,
      })),
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/feed.xml`],
    host: baseUrl,
  };
}
