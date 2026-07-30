import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

// Do not include "| DomainDiscovery" — root title template appends it
const title = 'AI Domain Assistant — Agent Hub';
const description =
  'Agent-ready domain tools: MCP server, REST auto shortlist, budget-aware ranking. Connect Claude, Cursor, or custom agents. Research only — not a registrar.';
const path = '/assistant';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: [
    'AI domain assistant',
    'domain MCP server',
    'agent domain tools',
    'find brand domains',
  ],
});

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'AI Domain Assistant', path },
        ]}
      />
      {children}
    </>
  );
}
