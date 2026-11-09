import type { Metadata } from 'next';
import { DNS_PAGE_COPY } from '@/lib/seo/toolPageCopy';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { DnsLookupWidget } from '@/components/tools/DnsLookupWidget';

export const dynamic = 'force-dynamic';

const copy = DNS_PAGE_COPY;

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title: copy.metaTitle,
    description: copy.description,
    path: copy.path,
    keywords: ['DNS lookup', 'DNS records checker', 'MX record lookup', 'NS lookup', 'TXT record lookup'],
  });
}

export default function DnsLookupPage() {
  return <ToolPageShell {...copy} widget={<DnsLookupWidget />} />;
}
