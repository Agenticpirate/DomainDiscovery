import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResearchReportView } from '@/components/seo/ResearchReportView';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { getReport } from '@/lib/research';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const report = getReport('domain-prices');
  if (!report) return {};
  return buildSeoPageMetadata({
    title: report.title,
    description: report.description,
    path: report.path,
    keywords: ['domain extension prices', 'cheapest domain extensions', 'domain renewal price statistics'],
  });
}

export default function DomainPricesResearchPage() {
  const report = getReport('domain-prices');
  if (!report) notFound();
  return <ResearchReportView report={report} />;
}
