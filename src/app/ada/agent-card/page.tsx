import type { Metadata } from 'next';
import { AdaAgentCardView } from '@/components/ada/AdaAgentCardView';
import { ADA_BRAND } from '@/lib/adaConfig';

export const metadata: Metadata = {
  title: 'Agent Card',
  description: `Machine-readable Agent Card for ${ADA_BRAND.name}: endpoints, MCP tools, budget rules, and hard constraints for AI agent discovery.`,
  alternates: { canonical: '/agent-card' },
  openGraph: {
    title: `Agent Card | ${ADA_BRAND.name}`,
    description: 'Public Agent Card for AI Domain Assistant discovery and integration.',
    url: '/agent-card',
  },
};

export default function AdaAgentCardPage() {
  return <AdaAgentCardView />;
}
