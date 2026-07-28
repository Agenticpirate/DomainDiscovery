'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/PageBackground';
import { SectionAmbient } from '@/components/ui/SectionAmbient';
import { PageBreadcrumb, PAGE_MAIN_CLASS } from '@/components/ui/Breadcrumb';
import { PremiumFaqGrid } from '@/components/sections/PremiumFaqGrid';
import { Icons } from '@/components/ui/Icons';
import { SITE_PAGE_DEFINITIONS, SITE_PRODUCT_FACTS } from '@/lib/seoSiteFacts';

const FAQ_ITEMS = [
  {
    icon: <Icons.Globe />,
    question: SITE_PAGE_DEFINITIONS.faq.question,
    answer: `${SITE_PAGE_DEFINITIONS.faq.answer} ${SITE_PRODUCT_FACTS}`,
  },
  {
    icon: <Icons.Check />,
    question: 'How do I check if a domain name is available?',
    answer:
      'Use domain name search on the homepage or Search page. Type the name and review free, registered, or premium-style results across 1,600+ extensions. Availability is a snapshot — re-check at registrar checkout and register promptly if the name matters.',
  },
  {
    icon: <Icons.Dollar />,
    question: 'How do I register a domain name?',
    answer:
      'Confirm availability, choose a registrar (price comparison helps), complete registrant details and payment, then set DNS for your website and email. Enable two-factor authentication and auto-renew on the registrar account.',
  },
  {
    icon: <Icons.Layers />,
    question: 'What is bulk domain search?',
    answer:
      'Bulk domain search checks many names in one job — up to 1,000 on DomainDiscovery — so portfolios and agencies can screen lists without retyping. Generate candidates first (AI or geo tools), then bulk-validate.',
  },
  {
    icon: <Icons.Magic />,
    question: 'How does an AI domain name generator help?',
    answer:
      'It turns a seed keyword into brandable candidates and pairs ideas with live availability. You still apply human filters (spelling, trademark, radio test).',
  },
  {
    icon: <Icons.Globe />,
    question: 'What is a TLD or domain extension?',
    answer:
      'A TLD is the part after the final dot (.com, .ai, .uk). gTLDs are generic; ccTLDs are country codes. Choose for brand trust and market fit, then verify availability.',
  },
  {
    icon: <Icons.Star />,
    question: 'What is the difference between free, registered, and premium?',
    answer:
      'Available/free usually means standard new registration is possible. Registered means someone else holds it. Premium may mean higher registry pricing or aftermarket listings — always confirm the final price on the registrar’s checkout page.',
  },
  {
    icon: <Icons.Search />,
    question: 'What are geo domains and who should use them?',
    answer:
      'Geo domains pair a place (city, region, country) with a service or brand keyword for local SEO and multi-market campaigns. Build lists in the Geo Domain Generator.',
  },
  {
    icon: <Icons.Shield />,
    question: 'Is DomainDiscovery free? Do you store my searches?',
    answer:
      'Core search and tools are free. You pay a registrar only when you register a domain. Saved shortlists stay in your browser unless a feature explicitly says otherwise.',
  },
  {
    icon: <Icons.Layers />,
    question: 'How do I compare domain registration prices?',
    answer:
      'Open Price Comparison to review regular retail pricing signals by TLD across registrars. Promos and renewals vary — verify the final amount at checkout.',
  },
];

export function SiteFaqPage() {
  return (
    <div className="min-h-screen">
      <PageBackground variant="hero" />
      <Navigation />
      <main className={`${PAGE_MAIN_CLASS} pb-10`}>
        <PageBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
        <SectionAmbient intensity="hero" className="w-full" contentClassName="relative z-[1]">
          <PremiumFaqGrid
            id="site-faq-page"
            title="Domain search FAQs"
            subtitle="Availability, registration, bulk checks, geo domains, WHOIS, pricing, and privacy."
            items={FAQ_ITEMS}
            className="!mb-8"
            headingAs="h1"
          />
          <div className="max-w-4xl mx-auto text-center page-gutter pb-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl bg-white text-black px-5 py-2.5 text-sm font-bold hover:bg-white/90 transition"
            >
              Start domain name search
            </Link>
          </div>
        </SectionAmbient>
      </main>
      <Footer />
    </div>
  );
}
