import { buildLlmsTxt, markdownResponse } from '@/lib/llmsMarkdown';

/** Some crawlers probe /.well-known/llms.txt — same content as /llms.txt */
export function GET() {
  return markdownResponse(buildLlmsTxt());
}
