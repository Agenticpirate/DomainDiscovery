import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

export default function FAQPage() {
  return (
    <SimpleContentPage
      title="Frequently Asked Questions"
      description="Answers to the most common questions about domain search, availability checks, pricing, and our domain tools."
      sections={[
        {
          heading: 'How fast are the search results?',
          body: [
            'The search experience is designed for immediate feedback as you type. Availability checks and related suggestions appear as quickly as the backing registrar and API responses allow.',
            'Some premium, aftermarket, or bulk checks can take longer because they depend on external provider responses.',
          ],
        },
        {
          heading: 'Are the availability results accurate?',
          body: [
            'Results reflect the latest data available at the moment of the lookup. Domain availability can change quickly, so you should register a domain as soon as you decide to buy it.',
          ],
        },
        {
          heading: 'Do you store my saved domains?',
          body: [
            'Saved domains are stored locally in your browser unless a feature explicitly states otherwise. That keeps your shortlist private on your device.',
          ],
        },
      ]}
      cta={{ href: '/', label: 'Search Domains' }}
    />
  );
}
