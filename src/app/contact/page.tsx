import { SimpleContentPage } from '@/components/layout/SimpleContentPage';
import { buildLocalizedToolMetadata } from '@/lib/i18n/metadata';
import { getMessages } from '@/lib/i18n';
import { localeHref } from '@/lib/i18n/locales';
import { getRequestLocale } from '@/lib/i18n/request';
import { DD_CONTACT } from '@/lib/legal/legalMeta';

const title = 'Contact DomainDiscovery — Support & Partnerships';
const description =
  'Contact DomainDiscovery (Domain Discovery) for product feedback, bug reports, privacy requests, legal notices, and partnership inquiries.';

export function generateMetadata() {
  return buildLocalizedToolMetadata({
    title,
    description,
    path: '/contact',
    keywords: ['contact DomainDiscovery', 'domain search support', 'partnership inquiries'],
  });
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const copy = getMessages(locale).contactPage;
  const email = DD_CONTACT.support;
  const fill = (value: string) => value.replaceAll('{email}', email);

  return (
    <SimpleContentPage
      title={copy.title}
      description={copy.description}
      sections={[
        { heading: copy.supportTitle, body: copy.support.map(fill) },
        { heading: copy.policiesTitle, body: [copy.policies] },
        { heading: copy.partnersTitle, body: [fill(copy.partners)] },
      ]}
      cta={{ href: localeHref(locale, '/'), label: copy.cta }}
    />
  );
}
