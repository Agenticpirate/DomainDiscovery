import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResearchReportView } from '@/components/seo/ResearchReportView';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { getReport } from '@/lib/research';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const report = getReport('tld-types');
  if (!report) return {};
  return buildSeoPageMetadata({
    title: report.title,
    description: report.description,
    path: report.path,
    keywords: ['how many TLDs', 'gTLD vs ccTLD', 'domain extension types'],
  });
}

export default function TldTypesResearchPage() {
  const report = getReport('tld-types');
  if (!report) notFound();
  return <ResearchReportView report={report} />;
}
