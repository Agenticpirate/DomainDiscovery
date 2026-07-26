import { buildDomainDiscoveryAgentCard } from '@/lib/agentCard';

export const dynamic = 'force-dynamic';

export function GET() {
  const card = buildDomainDiscoveryAgentCard();
  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
