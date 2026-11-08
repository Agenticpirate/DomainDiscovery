import { JsonLd } from '@/components/seo/JsonLd';
import { faqJsonLd, type FaqItem } from '@/lib/seo/pageMeta';

export function FaqSection({ title = 'Frequently asked questions', items }: { title?: string; items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
      <JsonLd data={faqJsonLd(items)} />
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.question}>
            <h3 className="text-[14px] font-semibold text-white/90">{item.question}</h3>
            <p className="mt-1 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
