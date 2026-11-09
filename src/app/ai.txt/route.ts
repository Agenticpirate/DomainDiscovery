import { buildAiTxt } from '@/lib/aiTxt';

/** ai.txt: AI usage permissions, restrictions and attribution. Replaces the old static file. */
export function GET() {
  return new Response(buildAiTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
