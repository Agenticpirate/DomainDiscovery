import { notFound } from 'next/navigation';
import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

const guideContent: Record<
  string,
  {
    title: string;
    description: string;
    sections: Array<{ heading: string; body: string[] }>;
  }
> = {
  'choosing-domain': {
    title: 'How to Choose the Perfect Domain Name',
    description: 'A practical guide to selecting a domain that is memorable, brandable, and easy to use.',
    sections: [
      {
        heading: 'Focus on clarity first',
        body: [
          'The strongest domains are easy to say, spell, and remember. If people hear the name once and can type it correctly, the name is doing its job.',
        ],
      },
      {
        heading: 'Avoid unnecessary friction',
        body: [
          'Hyphens, unusual spellings, and confusing word combinations usually reduce trust and recall. Shorter names generally perform better.',
        ],
      },
    ],
  },
  'domain-extensions': {
    title: 'Understanding Domain Extensions',
    description: 'How to choose between .com and modern TLDs based on audience, product, and brand goals.',
    sections: [
      {
        heading: 'Start with .com when possible',
        body: [
          'For many businesses, .com remains the most widely recognized and trusted extension.',
        ],
      },
      {
        heading: 'Use niche TLDs deliberately',
        body: [
          'Extensions like .ai, .io, and .app can work well when they align with the product category and audience expectations.',
        ],
      },
    ],
  },
  'domain-valuation': {
    title: 'Domain Valuation Guide',
    description: 'Key factors that influence how a domain is priced in the market.',
    sections: [
      {
        heading: 'What drives value',
        body: [
          'Length, clarity, commercial intent, extension quality, brandability, and historical demand all affect domain pricing.',
        ],
      },
    ],
  },
  'brand-protection': {
    title: 'Protecting Your Brand Online',
    description: 'How to reduce brand confusion and secure the important variations around your main domain.',
    sections: [
      {
        heading: 'Own your core variants',
        body: [
          'Secure the main extension, important country variants, and the most likely typo or brand-adjacent versions where appropriate.',
        ],
      },
    ],
  },
  'domain-investing': {
    title: 'Domain Investment Strategies',
    description: 'A high-level view of portfolio building, pricing discipline, and market timing.',
    sections: [
      {
        heading: 'Treat domains like inventory',
        body: [
          'Strong domain investing depends on disciplined selection, realistic holding periods, and careful pricing rather than pure speculation.',
        ],
      },
    ],
  },
  'dns-guide': {
    title: 'Technical DNS Guide',
    description: 'A concise introduction to DNS records, nameservers, and common domain configuration tasks.',
    sections: [
      {
        heading: 'Know the essentials',
        body: [
          'A, AAAA, CNAME, MX, TXT, and NS records cover the majority of practical domain configuration needs for websites, email, and verification.',
        ],
      },
    ],
  },
};

export default function LearnGuidePage({ params }: { params: { slug: string } }) {
  const guide = guideContent[params.slug];

  if (!guide) {
    notFound();
  }

  return (
    <SimpleContentPage
      activeTool="learn"
      title={guide.title}
      description={guide.description}
      sections={guide.sections}
      cta={{ href: '/learn', label: 'Back to Learn' }}
    />
  );
}
