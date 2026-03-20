import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

export default function PrivacyPage() {
  return (
    <SimpleContentPage
      title="Privacy Policy"
      description="A concise overview of how site data, browser storage, and third-party registrar interactions are handled."
      sections={[
        {
          heading: 'Local browser storage',
          body: [
            'Some features, such as saved domains and recent searches, may use browser storage so the experience remains fast and personalized on your device.',
          ],
        },
        {
          heading: 'Third-party requests',
          body: [
            'When you search domains or follow registrar links, some data may be sent to APIs or registrars needed to complete those actions. Their policies govern how they handle that data.',
          ],
        },
      ]}
      cta={{ href: '/', label: 'Continue to Search' }}
    />
  );
}
