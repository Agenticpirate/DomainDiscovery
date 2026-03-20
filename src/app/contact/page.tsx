import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

export default function ContactPage() {
  return (
    <SimpleContentPage
      title="Contact"
      description="Get in touch about product feedback, partnerships, bug reports, or feature requests."
      sections={[
        {
          heading: 'Support',
          body: [
            'For general questions or product feedback, contact support@domainsdiscovery.com.',
            'If you are reporting a bug, include the page, device, browser, and the exact steps needed to reproduce it.',
          ],
        },
        {
          heading: 'Partnerships',
          body: [
            'If you are a registrar, aftermarket platform, or data provider and want to discuss integrations, include the integration scope and technical contact details in your outreach.',
          ],
        },
      ]}
      cta={{ href: '/', label: 'Back to Search' }}
    />
  );
}
