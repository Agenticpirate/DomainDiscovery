import type { Metadata } from 'next';
import { ToolPageJsonLd } from '@/components/seo/JsonLd';
import { buildToolMetadata } from '@/lib/seoSiteFacts';

const title = 'Domain Price Comparison — Registrar Pricing by TLD';
const description =
  'Compare regular domain registration prices across registrars by TLD. Research .com and other extensions before you buy.';
const path = '/tools/compare';

export const metadata: Metadata = buildToolMetadata({
  title,
  description,
  path,
  keywords: [
    'domain price comparison',
    'domain registrar prices',
    'cheap domain registration',
    'TLD pricing',
  ],
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolPageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/search' },
          { name: 'Price comparison', path },
        ]}
      />
      {children}
    </>
  );
}
