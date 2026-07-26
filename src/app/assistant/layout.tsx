import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Domain Assistant — Agent Hub | DomainDiscovery',
  description:
    'Agent-ready domain tools: MCP server, REST auto shortlist, budget-aware ranking. Connect Claude, Cursor, or custom agents. Research only — not a registrar.',
  openGraph: {
    title: 'AI Domain Assistant — Agent Hub',
    description:
      'How agents use DomainDiscovery: find_brand_domains, MCP, budget caps, ranked shortlists.',
  },
};

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
