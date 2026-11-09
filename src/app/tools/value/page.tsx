import type { Metadata } from 'next';
import { buildSeoPageMetadata } from '@/lib/seo/pageMeta';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { ValueEstimatorWidget } from '@/components/tools/ValueEstimatorWidget';

export const dynamic = 'force-dynamic';

const path = '/tools/value';
const metaTitle = 'Domain Value Estimator: What Is My Domain Worth?';
const description =
  'Free domain value estimator. Get an estimated price range from length, extension and keywords. A rough estimate, not a professional appraisal.';

export function generateMetadata(): Metadata {
  return buildSeoPageMetadata({
    title: metaTitle,
    description,
    path,
    keywords: ['domain value estimator', 'domain appraisal', 'how much is my domain worth', 'domain worth'],
  });
}

export default function DomainValuePage() {
  return (
    <ToolPageShell
      path={path}
      crumb="Domain value"
      metaTitle={metaTitle}
      description={description}
      h1="How much is my domain worth?"
      intro="Enter a domain to see an estimated price range based on name length, extension, keywords and, when available, how long it has been registered."
      notice="This is an estimate, not a professional appraisal. Actual sale prices depend on buyers and negotiation."
      widget={<ValueEstimatorWidget />}
      explainer={{
        heading: 'How the estimate works',
        paragraphs: [
          'The estimator scores public signals: the extension (.com, .ai and .io tend to resell best), the length of the name, whether it is a common word, and whether it has hyphens or digits. Older registrations add a small bonus when the registry publishes a creation date.',
          'It does not see traffic, revenue, backlinks, trademarks or recent comparable sales, all of which can move a price a lot. Use the range as a starting point for research, not as a quote.',
        ],
      }}
      faqs={[
        {
          question: 'How accurate is this domain value estimate?',
          answer:
            'It is a rough range from a fixed formula, not an appraisal. Two similar names can sell for very different prices depending on the buyer and the use case.',
        },
        {
          question: 'What makes a domain more valuable?',
          answer:
            'Short names, dictionary words, a high-demand extension such as .com, and no hyphens or numbers usually help. Existing traffic and brand fit matter too, but this tool cannot measure them.',
        },
        {
          question: 'Should I sell my domain at the estimated price?',
          answer:
            'Treat the range as a rough guide. Compare recent sales of similar names and consider a professional appraisal before setting a price.',
        },
      ]}
      related={[
        { href: '/tools/domain-age', label: 'Domain age checker', description: 'See when a domain was registered and when it expires.' },
        { href: '/tools/whois', label: 'WHOIS lookup', description: 'Registrar, dates and name servers.' },
        { href: '/search', label: 'Domain name search', description: 'Check availability across 1,600+ extensions.' },
        { href: '/tools/compare', label: 'Compare registrar prices', description: 'Registration and renewal prices by extension.' },
      ]}
    />
  );
}
