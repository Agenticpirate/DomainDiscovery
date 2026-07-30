import { buildLlmsTxt, markdownResponse } from '@/lib/llmsMarkdown';

/**
 * llms.txt — lean Markdown map for AI crawlers / assistants (GEO).
 * Playbook format: single H1, blockquote summary, H2 link groups.
 * Not a Google Search ranking lever.
 */
export function GET() {
  return markdownResponse(buildLlmsTxt());
}
