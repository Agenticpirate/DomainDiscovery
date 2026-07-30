import { buildLlmsFullTxt, markdownResponse } from '@/lib/llmsMarkdown';

/**
 * llms-full.txt — expanded Markdown dataset for AI ingestion (GEO).
 * Includes definitions, FAQ, real highlight-TLD pricing tables, TLD notes.
 * Not a Google Search ranking lever.
 */
export function GET() {
  return markdownResponse(buildLlmsFullTxt());
}
