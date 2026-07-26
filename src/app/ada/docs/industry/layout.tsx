import type { Metadata } from 'next';
import { ADA_BRAND } from '@/lib/adaConfig';

export const metadata: Metadata = {
  // short title — ADA layout template appends brand
  title: 'Why Domains Matter for AI Agents',
  description:
    'How AI agents use domains for brand assets and verifiable identity (ANS). Layer A vs Layer B, protocols (MCP, Domain Connect, DNS), and why agentic domain automation matters now.',
  openGraph: {
    title: `Why Domains Matter for AI Agents | ${ADA_BRAND.name}`,
    description:
      'Industry map: agent identity (ANS), brand domain APIs, and how AI Domain Assistant fits.',
  },
};

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
