'use client';

import { TOOL_GUIDE_PACKS, type ToolGuideKey } from '@/components/seo/toolGuidePacks';
import { SeoGuidePack } from '@/components/seo/SeoGuidePack';
import { useLocale } from './LocaleProvider';

export function LocalizedGuidePack({ pack }: { pack: ToolGuideKey }) {
  const { messages, href } = useLocale();
  const base = TOOL_GUIDE_PACKS[pack];
  const copy = messages.guides[pack];
  const related = base.related ?? [];

  return (
    <SeoGuidePack
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
      items={base.items.map((item, index) => ({
        question: copy.items[index]?.question ?? item.question,
        answer: copy.items[index]?.answer ?? item.answer,
        detail: copy.items[index]?.detail,
      }))}
      learnMore={
        base.learnMore
          ? { href: href(base.learnMore.href), label: copy.learnMore || base.learnMore.label }
          : undefined
      }
      related={related.map((item, index) => ({
        href: href(item.href),
        label: copy.related[index] || item.label,
      }))}
    />
  );
}
