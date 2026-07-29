'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/contexts/ThemeContext';

export type PremiumFaqItem = {
  question: string;
  answer: string;
  /** Optional React icon node; cycles defaults if omitted */
  icon?: React.ReactNode;
  /** Optional second paragraph (SEO packs) */
  detail?: string;
};

export type PremiumFaqGridProps = {
  items: PremiumFaqItem[];
  title?: string;
  subtitle?: string;
  /** Section id for anchors */
  id?: string;
  className?: string;
  /** max-width of shell */
  maxWidthClass?: string;
  /** Show heading block */
  showHeader?: boolean;
  headingId?: string;
  /** Use h1 only on dedicated FAQ pages (default h2 to avoid multiple H1s) */
  headingAs?: 'h1' | 'h2';
};

const DEFAULT_ICONS: React.ReactNode[] = [
  <Icons.Globe key="g" />,
  <Icons.Check key="c" />,
  <Icons.Sparkles key="s" />,
  <Icons.Search key="se" />,
  <Icons.Layers key="l" />,
  <Icons.Dollar key="d" />,
  <Icons.Shield key="sh" />,
  <Icons.Star key="st" />,
  <Icons.Magic key="m" />,
  <Icons.Info key="i" />,
];

/**
 * Homepage FAQ design system — reusable site-wide.
 *
 * Mobile (<640px): inline accordion — answer expands under the tapped question.
 * Desktop: fixed question grid + stable answer stage (no reflow thrash).
 * Click-only open; Escape / outside click closes.
 */
export function PremiumFaqGrid({
  items,
  title = 'FAQs',
  subtitle,
  id = 'faqs',
  className = '',
  maxWidthClass = 'max-w-4xl',
  showHeader = true,
  headingId = 'faqs-heading',
  headingAs = 'h2',
}: PremiumFaqGridProps) {
  const HeadingTag = headingAs;
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);
  const isLight = mounted ? theme === 'light' : false;

  React.useEffect(() => {
    if (openFaq === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenFaq(null);
    };
    const onPointer = (e: MouseEvent) => {
      const root = sectionRef.current;
      if (root && !root.contains(e.target as Node)) setOpenFaq(null);
    };
    window.addEventListener('keydown', onKey);
    // mousedown only — touchstart + click races on iOS and can swallow open
    document.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [openFaq]);

  if (!items.length) return null;

  const iconFor = (item: PremiumFaqItem, index: number) =>
    item.icon ?? DEFAULT_ICONS[index % DEFAULT_ICONS.length];

  // Fully opaque plates — ambient dots must never show through FAQ cards/titles
  const plateFill = isLight ? '#ffffff' : '#0a0a0c';
  const solidClosed = isLight
    ? 'border border-slate-200 hover:border-slate-300 hover:shadow-sm'
    : 'border border-white/10 hover:border-white/18';

  const solidOpen = isLight
    ? 'border border-slate-300 shadow-md sm:scale-[1.01]'
    : 'border border-white/22 shadow-[0_8px_28px_rgba(0,0,0,0.28)] sm:scale-[1.01]';

  const toggle = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`section-shell ${maxWidthClass} ${className}`}
      aria-labelledby={showHeader ? headingId : undefined}
    >
      {showHeader && (
        <div
          className="relative isolate mx-auto mb-1.5 sm:mb-4 max-w-3xl overflow-hidden rounded-2xl px-3 py-3 sm:px-5 sm:py-4 text-center"
          style={{ backgroundColor: plateFill }}
        >
          {/* Fully opaque plate — ambient dots never bleed through titles/subtitles */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ backgroundColor: plateFill }}
          />
          <div className="relative z-[1]">
            <HeadingTag id={headingId} className="section-title">
              {title}
            </HeadingTag>
            {subtitle ? (
              <p className="hidden sm:block section-sub">{subtitle}</p>
            ) : null}
          </div>
        </div>
      )}

      {/* —— Mobile: compact inline accordion (answer opens under question) —— */}
      <div className="flex flex-col gap-1.5 sm:hidden w-full min-w-0">
        {items.map((faq, index) => {
          const open = openFaq === index;
          const answerId = `${id}-m-answer-${index}`;
          return (
            <div
              key={faq.question}
              className={`shine-border relative isolate rounded-xl border overflow-hidden min-w-0 w-full box-border ${
                open ? solidOpen : solidClosed
              }`}
              style={{ backgroundColor: plateFill }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{ backgroundColor: plateFill }}
              />
              <div className="relative z-[1]">
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={open}
                aria-controls={answerId}
                className="flex w-full min-w-0 items-center gap-2 px-2.5 py-2 text-left"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border [&>svg]:w-3.5 [&>svg]:h-3.5 ${
                    open
                      ? isLight
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-black border-white'
                      : isLight
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-white/[0.08] text-white/70 border-white/10'
                  }`}
                >
                  {iconFor(faq, index)}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="text-[12px] font-bold leading-snug break-words">
                    {faq.question}
                  </h3>
                </div>
                <span
                  className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition-transform duration-200 ${
                    open
                      ? isLight
                        ? 'bg-slate-900 text-white rotate-45'
                        : 'bg-white text-black rotate-45'
                      : isLight
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-white/[0.1] text-white/55'
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>

              {open ? (
                <div
                  id={answerId}
                  className={`px-2.5 pb-2.5 pt-0 border-t ${
                    isLight ? 'border-slate-100' : 'border-white/[0.08]'
                  }`}
                >
                  <p
                    className="pt-2 text-[11.5px] leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {faq.answer}
                  </p>
                  {faq.detail ? (
                    <p
                      className="mt-1.5 text-[11px] leading-relaxed"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {faq.detail}
                    </p>
                  ) : null}
                </div>
              ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* —— Desktop: fixed question grid + stable answer stage —— */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {items.map((faq, index) => {
          const open = openFaq === index;
          return (
            <button
              key={faq.question}
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={open}
              aria-controls={`${id}-answer-stage`}
              className={`shine-border tool-card-enter group relative isolate overflow-hidden flex items-center gap-2.5 w-full min-w-0 min-h-[3.35rem] px-3.5 py-3 text-left rounded-xl transition-[border-color,box-shadow,background-color,transform] duration-300 ease-out ${
                open ? solidOpen : solidClosed
              }`}
              style={{ animationDelay: `${index * 0.035}s`, backgroundColor: plateFill }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{ backgroundColor: plateFill }}
              />
              <div className="relative z-[1] flex w-full min-w-0 items-center gap-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ease-out [&>svg]:w-4 [&>svg]:h-4 ${
                  open
                    ? isLight
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-black border-white'
                    : isLight
                      ? 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200'
                      : 'bg-white/[0.06] text-white/70 border-white/10 group-hover:bg-white/10'
                }`}
              >
                {iconFor(faq, index)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold leading-snug pr-1">
                  {faq.question}
                </h3>
              </div>
              <span
                className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition-transform duration-300 ease-out ${
                  open
                    ? isLight
                      ? 'bg-slate-900 text-white rotate-45'
                      : 'bg-white text-black rotate-45'
                    : isLight
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-white/[0.06] text-white/45'
                }`}
                aria-hidden
              >
                +
              </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop answer stage only */}
      <div
        id={`${id}-answer-stage`}
        className={`faq-answer-stage hidden sm:block mt-3 transition-[min-height] duration-300 ease-out ${
          openFaq !== null ? 'min-h-[6.5rem]' : 'min-h-0'
        }`}
        aria-live="polite"
      >
        {openFaq !== null && items[openFaq] && (
          <div
            key={openFaq}
            className={`faq-answer-panel shine-border relative isolate overflow-hidden rounded-xl border px-4 py-3.5 ${
              isLight
                ? 'border-slate-200 shadow-sm shadow-slate-900/[0.04]'
                : 'border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.28)]'
            }`}
            style={{ backgroundColor: plateFill }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ backgroundColor: plateFill }}
            />
            <div className="relative z-[1]">
            <div className="flex items-start gap-2.5">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border [&>svg]:w-3.5 [&>svg]:h-3.5 ${
                  isLight
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-black border-white'
                }`}
              >
                {iconFor(items[openFaq], openFaq)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold mb-1 leading-snug">
                  {items[openFaq].question}
                </p>
                <p
                  className="text-[12.5px] leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {items[openFaq].answer}
                </p>
                {items[openFaq].detail ? (
                  <p
                    className="mt-1.5 text-[12.5px] leading-relaxed"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {items[openFaq].detail}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setOpenFaq(null)}
                className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isLight
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-white/[0.08] text-white/60 hover:bg-white/[0.14] hover:text-white'
                }`}
                aria-label="Close answer"
              >
                ×
              </button>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Crawlable answers for AEO/SEO (visually hidden, still in DOM) */}
      <div className="sr-only" aria-hidden="false">
        {items.map((faq) => (
          <article key={`seo-${faq.question}`}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
            {faq.detail ? <p>{faq.detail}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
