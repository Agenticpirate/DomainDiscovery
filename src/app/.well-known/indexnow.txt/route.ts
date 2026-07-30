import { getIndexNowKey } from '@/lib/indexnowConfig';

/**
 * IndexNow key file (custom keyLocation).
 * Body must be the key string only, text/plain.
 */
export function GET() {
  return new Response(getIndexNowKey(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
