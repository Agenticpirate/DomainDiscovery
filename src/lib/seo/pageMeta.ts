import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seoSiteFacts';
import { clampMetaDescription } from '@/lib/seo/metaDescription';

export type FaqItem = { question: string; answer: string };

/** Tool metadata with an absolute title (skips the "| DomainDiscovery" template) and a clamped description. */
export function buildSeoPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const description = clampMetaDescription(opts.description);
  const base = buildToolMetadata({ ...opts, description });
  return { ...base, title: { absolute: opts.title } };
}

export function faqJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
