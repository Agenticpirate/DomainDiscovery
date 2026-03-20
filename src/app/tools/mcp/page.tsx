import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

export default function MCPPage() {
  return (
    <SimpleContentPage
      activeTool="tools"
      title="MCP Server"
      description="Domain tooling and automation endpoints for integrations and developer workflows."
      sections={[
        {
          heading: 'What this route is for',
          body: [
            'This page is reserved for Model Context Protocol integration details, tool access patterns, and future developer documentation for automated domain workflows.',
          ],
        },
        {
          heading: 'Current status',
          body: [
            'The route is live so navigation remains functional in production. Expanded MCP documentation can be added here without changing the core site structure.',
          ],
        },
      ]}
      cta={{ href: '/', label: 'Open Main Search' }}
    />
  );
}
