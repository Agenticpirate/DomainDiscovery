'use client';

import React from 'react';
import { PremiumFaqGrid } from '@/components/sections/PremiumFaqGrid';
import { Icons } from '@/components/ui/Icons';

const faqItems = [
  {
    icon: <Icons.Search />,
    question: 'How does domain availability checking work?',
    answer:
      'Our platform uses real-time DNS checking to verify domain availability. We query authoritative DNS servers to determine if a domain is registered or available for purchase. Results are cached briefly to ensure fast performance while maintaining accuracy.',
  },
  {
    icon: <Icons.Star />,
    question: 'What is a premium domain?',
    answer:
      'Premium domains are high-value names that are already registered but available for purchase at a premium price. These typically include short domains, dictionary words, or brandable names listed on aftermarket platforms.',
  },
  {
    icon: <Icons.Layers />,
    question: 'Can I check multiple domains at once?',
    answer:
      'Yes. Bulk Domain Search checks up to 1,000 domains per pass. Paste a list (commas, spaces, or new lines) or upload a CSV/TXT file. Results stream in batches with filter and export options.',
  },
  {
    icon: <Icons.Check />,
    question: 'How accurate are the domain availability results?',
    answer:
      'DNS-based checking is highly accurate for availability snapshots. Premium or grace-period edge cases can still differ at registrar checkout — re-check before you pay.',
  },
  {
    icon: <Icons.Globe />,
    question: 'What TLD extensions do you support?',
    answer:
      'We support 1,000+ TLD extensions including .com, .net, .org, .ai, .io, and hundreds of country-code and specialty TLDs. Browse them on Domain Extensions with live availability.',
  },
  {
    icon: <Icons.Dollar />,
    question: 'How do I register a domain after finding it available?',
    answer:
      'Click Register to open a partner registrar (GoDaddy, Namecheap, Porkbun, and others). Compare prices, then complete checkout on the registrar you choose. DomainDiscovery is free research — not a registrar.',
  },
  {
    icon: <Icons.Magic />,
    question: 'What is the difference between domain search and domain generation?',
    answer:
      'Search checks names you enter. Generation creates brandable ideas from keywords, then checks availability. Use generation for creative options; search when you already have a name.',
  },
  {
    icon: <Icons.Shield />,
    question: 'Can I save domains for later?',
    answer:
      'Yes. Save domains to your local favorites list (browser storage). They persist across sessions so you can register when ready.',
  },
];

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  allowMultiple?: boolean;
}

/** Site FAQ block — homepage PremiumFaqGrid design. */
export const FAQSection: React.FC<FAQSectionProps> = ({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about domain search and registration',
  maxWidth = '2xl',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6">
      <PremiumFaqGrid
        id="site-faqs"
        title={title}
        subtitle={subtitle}
        items={faqItems}
        maxWidthClass={maxWidthClasses[maxWidth]}
      />
      <div className="mt-8 text-center">
        <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Still have questions?
        </p>
        <a
          href="mailto:support@domainsdiscovery.com"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold transition hover:border-white/20"
        >
          Contact Support
        </a>
      </div>
    </section>
  );
};
