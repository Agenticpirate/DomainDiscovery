import { buildRobotsTxt } from '@/lib/robotsConfig';

/** robots.txt: search and AI bots allowed, private paths disallowed. See src/lib/robotsConfig.ts. */
export function GET() {
  return new Response(buildRobotsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
