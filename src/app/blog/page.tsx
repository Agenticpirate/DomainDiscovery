import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

export default function BlogPage() {
  return (
    <SimpleContentPage
      title="Blog"
      description="Product updates, domain strategy notes, naming tips, and practical guidance for founders, marketers, and builders."
      sections={[
        {
          heading: 'What you will find here',
          body: [
            'The blog will cover domain naming strategy, premium-domain research, extension trends, registrar pricing changes, and workflow improvements for domain discovery.',
            'This section is set up so the route is live and production-safe while editorial content is being expanded.',
          ],
        },
      ]}
      cta={{ href: '/learn', label: 'Read Guides' }}
    />
  );
}
