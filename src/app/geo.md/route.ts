import { buildPageMarkdown, markdownResponse } from '@/lib/llmsMarkdown';

export function GET() {
  return markdownResponse(buildPageMarkdown('geo'));
}
