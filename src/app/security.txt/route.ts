import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

/** RFC 9116-style security.txt at /security.txt */
export function GET() {
  const base = getSiteBaseUrl();
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const body = `Contact: ${base}/contact
Preferred-Languages: en
Canonical: ${base}/.well-known/security.txt
Policy: ${base}/privacy
Expires: ${expires.toISOString()}
Acknowledgments: ${base}/
Hiring:
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
