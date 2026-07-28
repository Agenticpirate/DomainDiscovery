import type { Metadata } from 'next';
import { AdaDocsHub } from '@/components/ada/AdaDocsHub';
import { ADA_BRAND } from '@/lib/adaConfig';

export const metadata: Metadata = {
  title: 'Agent docs & MCP',
  description: `${ADA_BRAND.name} agent docs: Agent Card discovery, MCP tools, REST auto mode, budget contract, security, and copy-paste integration examples.`,
  alternates: { canonical: '/docs' },
  openGraph: {
    title: `Agent docs & MCP | ${ADA_BRAND.name}`,
    description: 'MCP, REST, budget contract, and Agent Card integration for AI Domain Assistant.',
    url: '/docs',
  },
};

export default function AdaDocsPage() {
  return <AdaDocsHub />;
}
