import type { Metadata } from 'next';
import { VALUE_PAGE_COPY } from '@/lib/seo/toolPageCopy';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { ValueEstimatorWidget } from '@/components/tools/ValueEstimatorWidget';

export const dynamic = 'force-dynamic';

const copy = VALUE_PAGE_COPY;

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title: copy.metaTitle,
    description: copy.description,
    path: copy.path,
    keywords: ['domain value estimator', 'domain appraisal', 'how much is my domain worth', 'domain worth'],
  });
}

export default function DomainValuePage() {
  return <ToolPageShell {...copy} widget={<ValueEstimatorWidget />} />;
}
