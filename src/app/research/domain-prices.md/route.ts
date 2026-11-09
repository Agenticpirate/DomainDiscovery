import { getReport } from '@/lib/research';
import { reportMarkdownResponse } from '@/lib/research/report';
import { getSiteBaseUrl } from '@/lib/seoSiteFacts';

export function GET() {
  const report = getReport('domain-prices');
  if (!report) return new Response('Not found', { status: 404 });
  return reportMarkdownResponse(report, getSiteBaseUrl());
}
