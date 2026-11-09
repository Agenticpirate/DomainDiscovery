/** Markdown for the four legal pages, from the same section data the HTML pages render. */
import type { LegalSection } from '@/components/layout/LegalDocumentPage';
import {
  DD_CONTACT,
  LEGAL_EFFECTIVE,
  LEGAL_LAST_UPDATED,
  ddCookieSections,
  ddDisclaimerSections,
  ddPrivacySections,
  ddTermsSections,
} from '@/lib/legal/domainDiscoveryLegal';
import { bullets, fmtDate, heading, page } from '../format';
import type { MdDoc, MdRouteDef } from '../types';

type LegalSpec = { path: string; title: string; description: string; sections: LegalSection[] };

/** Titles and descriptions match the English legal page components. */
const LEGAL: LegalSpec[] = [
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description:
      'How DomainDiscovery collects, uses, and protects information for free domain name search and research tools. Written for U.S. users, including California privacy rights.',
    sections: ddPrivacySections,
  },
  {
    path: '/terms',
    title: 'Terms of Use',
    description:
      'Rules for using DomainDiscovery domain search and research tools. We are not a registrar; availability and prices are research snapshots only.',
    sections: ddTermsSections,
  },
  {
    path: '/cookies',
    title: 'Cookie Policy',
    description: 'Details on cookies and local browser storage used by DomainDiscovery, and how you can control them.',
    sections: ddCookieSections,
  },
  {
    path: '/disclaimer',
    title: 'Disclaimer',
    description: 'Important limits on DomainDiscovery as a free research toolkit—not a registrar and not legal advice.',
    sections: ddDisclaimerSections,
  },
];

const UPDATED = fmtDate(new Date(`${LEGAL_LAST_UPDATED} 00:00:00 UTC`));

function render(spec: LegalSpec): MdDoc {
  const parts: string[] = [`Effective ${LEGAL_EFFECTIVE}. Contact: ${DD_CONTACT.support}`];
  for (const section of spec.sections) {
    parts.push(heading(2, section.heading));
    for (const para of section.body ?? []) parts.push(para);
    if (section.bullets?.length) parts.push(bullets(section.bullets));
  }
  const others = LEGAL.filter((l) => l.path !== spec.path);
  return {
    title: spec.title,
    description: spec.description,
    path: spec.path,
    lastModified: UPDATED,
    markdown: page({
      title: spec.title,
      summary: spec.description,
      path: spec.path,
      updated: UPDATED,
      body: parts.join('\n\n'),
      related: [...others.map((o) => ({ text: o.title, href: o.path })), { text: 'Contact', href: '/contact' }],
    }),
  };
}

export const LEGAL_ROUTES: MdRouteDef[] = LEGAL.map((spec) => ({
  pattern: spec.path,
  group: 'legal' as const,
  render: () => render(spec),
  list: () => [{ path: spec.path, title: spec.title, description: spec.description }],
}));
