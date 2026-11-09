import { buildLlmsFullTxt, markdownResponse } from '@/lib/llmsMarkdown';

/**
 * llms-full.txt — expanded Markdown dataset for AI ingestion (GEO).
 * Main pages rendered through the Markdown registry (src/lib/md), under 500k characters.
 * Not a Google Search ranking lever.
 */
export async function GET() {
  return markdownResponse(await buildLlmsFullTxt());
}
