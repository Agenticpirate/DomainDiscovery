import { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

/**
 * robots.txt for search + AI crawlers.
 * LLM product index: /llms.txt and /llms-full.txt (linked from those files; not a ranking lever).
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/share/', // ephemeral OG share cards
        ],
      },
      // Explicit allow for common AI crawlers (same rules as *)
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/share/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/share/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/share/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/share/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/share/'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/api/', '/share/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
