'use client';

import React from 'react';
import { Accordion } from '@/components/ui/Accordion';

const faqItems = [
  {
    title: 'How does domain availability checking work?',
    content: 'Our platform uses real-time DNS checking to verify domain availability. We query authoritative DNS servers to determine if a domain is registered or available for purchase. Results are cached for 5 minutes to ensure fast performance while maintaining accuracy.'
  },
  {
    title: 'What is a premium domain?',
    content: 'Premium domains are high-value domain names that are already registered but available for purchase at a premium price. These typically include short domains, dictionary words, or brandable names. Premium domains are listed on aftermarket platforms and can range from hundreds to millions of dollars.'
  },
  {
    title: 'Can I check multiple domains at once?',
    content: 'Yes! Our Bulk Domain Search tool allows you to check up to 1,000 domains simultaneously. Simply paste your list of domains (separated by commas, spaces, or new lines), or upload a CSV/TXT file. Results are processed in batches and displayed in real-time with filtering and export options.'
  },
  {
    title: 'How accurate are the domain availability results?',
    content: 'Our DNS-based checking provides highly accurate results for domain availability. However, DNS checking cannot detect premium domains or domains in grace periods. For the most accurate premium domain detection, we recommend checking directly with registrars like GoDaddy or Namecheap.'
  },
  {
    title: 'What TLD extensions do you support?',
    content: 'We support over 1,000 TLD extensions including popular ones like .com, .net, .org, .ai, .io, and hundreds of country-code and specialty TLDs. You can browse all available extensions on our Domain Extensions page with real-time availability checking.'
  },
  {
    title: 'How do I register a domain after finding it available?',
    content: 'Once you find an available domain, click the "Register" button to be directed to our partner registrars (GoDaddy, Namecheap, Porkbun, etc.). You can compare prices across multiple registrars and choose the best option for your needs. Registration typically takes just a few minutes.'
  },
  {
    title: 'What is the difference between domain search and domain generation?',
    content: 'Domain Search checks the availability of specific domains you enter. Domain Generation uses AI and algorithms to create new domain name suggestions based on keywords, industry, or style preferences. Generation is perfect when you need creative ideas, while search is ideal when you have specific names in mind.'
  },
  {
    title: 'Can I save domains for later?',
    content: 'Yes! You can save domains to your favorites list by clicking the heart icon. Saved domains are stored locally in your browser and persist across sessions. You can access your saved domains anytime and quickly register them when ready.'
  },
  {
    title: 'What makes a good domain name?',
    content: 'A good domain name is short (ideally under 15 characters), memorable, easy to spell, and relevant to your brand or business. Avoid hyphens and numbers when possible. .com domains are generally preferred for businesses, but newer TLDs like .ai, .io, or .app can work well for tech companies.'
  },
  {
    title: 'Do you offer domain pricing information?',
    content: 'Yes! We display estimated pricing for standard domain registrations. Prices vary by TLD and registrar. For example, .com domains typically cost $10-15/year, while premium TLDs like .ai can cost $80-100/year. Premium domains have custom pricing set by the seller.'
  },
  {
    title: 'How often should I check domain availability?',
    content: 'Domain availability can change quickly as domains are registered constantly. If you find an available domain you like, we recommend registering it as soon as possible. Our caching system updates every 5 minutes, so you can re-check domains if needed.'
  },
  {
    title: 'Can I check expired domains?',
    content: 'While we don\'t currently have a dedicated expired domains tool, you can use our bulk search feature to check lists of potentially expired domains. Expired domains go through a grace period and redemption period before becoming available, which can take 30-75 days after expiration.'
  }
];

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  allowMultiple?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about domain search and registration',
  maxWidth = '2xl',
  allowMultiple = false
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full'
  };

  return (
    <section className="py-20 px-6">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion items={faqItems} allowMultiple={allowMultiple} />

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/50 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:support@domainsdiscovery.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};
