'use client';

import { CiteableDefinition } from '@/components/seo/CiteableDefinition';
import { SITE_PAGE_DEFINITIONS } from '@/lib/seoSiteFacts';
import type { Messages } from '@/lib/i18n/types';
import { useLocale } from './LocaleProvider';

export function LocalizedDefinition({
  id,
  compact,
}: {
  id: keyof Messages['definitions'];
  compact?: boolean;
}) {
  const { locale, messages } = useLocale();
  const base = SITE_PAGE_DEFINITIONS[id];
  const copy = messages.definitions[id];
  const definition =
    locale === 'en'
      ? base
      : { ...base, question: copy.question, answer: copy.answer, learnLabel: copy.learnLabel };

  return <CiteableDefinition eyebrow={messages.ui.definition} definition={definition} compact={compact} />;
}
