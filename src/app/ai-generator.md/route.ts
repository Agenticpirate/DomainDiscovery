import { buildPageMarkdown, markdownResponse } from '@/lib/llmsMarkdown';

/** Alias matching common GEO playbook URL */
export function GET() {
  return markdownResponse(buildPageMarkdown('generator'));
}
