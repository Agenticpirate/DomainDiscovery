import type { Metadata } from 'next';
import { DOMAIN_AGE_PAGE_COPY } from '@/lib/seo/toolPageCopy';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { DomainAgeWidget } from '@/components/tools/DomainAgeWidget';

export const dynamic = 'force-dynamic';

const copy = DOMAIN_AGE_PAGE_COPY;

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title: copy.metaTitle,
    description: copy.description,
    path: copy.path,
    keywords: ['domain age checker', 'domain expiration date', 'domain expiry checker', 'when was a domain registered'],
  });
}

export default function DomainAgePage() {
  return <ToolPageShell {...copy} widget={<DomainAgeWidget />} />;
}
