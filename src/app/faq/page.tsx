import { SimpleContentPage } from '@/components/layout/SimpleContentPage';
import type { Metadata } from 'next';
import { SITE_PAGE_DEFINITIONS, SITE_PRODUCT_FACTS } from '@/lib/seoSiteFacts';

export const metadata: Metadata = {
  title: 'Domain Search FAQ — Availability, Registration & Tools',
  description:
    'FAQ for DomainDiscovery (Domain Discovery): domain name search, availability, registration, geo domains, WHOIS, bulk checks, pricing, and privacy.',
};

export default function FAQPage() {
  return (
    <SimpleContentPage
      title="Domain search & DomainDiscovery FAQ"
      description="Validated answers about domain name search, registration, geo domains, WHOIS, bulk checks, pricing, and what DomainDiscovery (Domain Discovery / Domains Discovery) is."
      sections={[
        {
          heading: SITE_PAGE_DEFINITIONS.faq.question,
          body: [SITE_PAGE_DEFINITIONS.faq.answer, SITE_PRODUCT_FACTS],
        },
        {
          heading: 'How do I check if a domain name is available?',
          body: [
            'Use domain name search on the homepage or Search page. Type the name and review free, registered, or premium-style results across 1,600+ extensions. Availability is a snapshot—re-check at registrar checkout and register promptly if the name matters.',
          ],
        },
        {
          heading: 'How do I register a domain name?',
          body: [
            'Confirm availability, choose a registrar (price comparison helps), complete registrant details and payment, then set DNS for your website and email. Enable two-factor authentication and auto-renew on the registrar account. Full guides: How to register a domain and Domain registration explained.',
          ],
        },
        {
          heading: 'What is bulk domain search?',
          body: [
            'Bulk domain search checks many names in one job—up to 1,000 on DomainDiscovery—so portfolios and agencies can screen lists without retyping. Generate candidates first (AI or geo tools), then bulk-validate. Details: Bulk domain search guide.',
          ],
        },
        {
          heading: 'How does an AI domain name generator help?',
          body: [
            'It turns a seed keyword into brandable candidates and, on DomainDiscovery, pairs ideas with live availability. You still apply human filters (spelling, trademark, radio test). Guide: AI domain name generator.',
          ],
        },
        {
          heading: 'What is a TLD or domain extension?',
          body: [
            'A TLD is the part after the final dot (.com, .ai, .uk). gTLDs are generic; ccTLDs are country codes. Choose for brand trust and market fit, then verify availability. Guide: What is a TLD?',
          ],
        },
        {
          heading: 'What is the difference between free, registered, and premium?',
          body: [
            'Available/free usually means standard new registration is possible. Registered means someone else holds it. Premium may mean higher registry pricing or aftermarket listings—always confirm the final price on the registrar’s checkout page.',
          ],
        },
        {
          heading: 'What are geo domains and who should use them?',
          body: [
            'Geo domains pair a place (city, region, country) with a service or brand keyword for local SEO and multi-market campaigns. They work best with real local content and operations—not thin doorway pages. Build lists in the Geo Domain Generator; populations display in millions using city-proper oriented figures.',
          ],
        },
        {
          heading: 'How does bulk domain search work?',
          body: [
            'Paste or upload up to 1,000 domain names into Bulk Domain Search. DomainDiscovery batches live availability checks so portfolios and agencies can screen lists without retyping each name.',
          ],
        },
        {
          heading: 'How does WHOIS / RDAP lookup work?',
          body: [
            'WHOIS and RDAP return public registration data when available: registrar, dates, status, and sometimes contacts. Privacy services may redact personal details. Use WHOIS for research and due diligence—not as legal advice.',
          ],
        },
        {
          heading: 'How do I compare domain registration prices?',
          body: [
            'Open Price Comparison to review regular retail pricing signals by TLD across registrars. Promos and renewals vary—verify the final amount at checkout. DomainDiscovery does not charge for the comparison view itself.',
          ],
        },
        {
          heading: 'Is DomainDiscovery free? Do you store my searches?',
          body: [
            'Core search and tools are free. You pay a registrar only when you register a domain. Saved shortlists stay in your browser unless a feature explicitly says otherwise. See the Privacy page for policy details.',
          ],
        },
        {
          heading: 'Which TLD should I choose?',
          body: [
            'Start with .com when global recall matters. Consider .ai, .io, .app, or .dev for product fit, and country-code TLDs for local markets you truly serve. Browse Domain Extensions, then confirm availability with domain name search before you buy.',
          ],
        },
      ]}
      cta={{ href: '/', label: 'Start domain name search' }}
    />
  );
}
