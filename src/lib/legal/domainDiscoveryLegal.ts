import type { LegalSection } from '@/components/layout/LegalDocumentPage';
import { DD_CONTACT, LEGAL_EFFECTIVE, LEGAL_LAST_UPDATED } from './legalMeta';

export { LEGAL_LAST_UPDATED, LEGAL_EFFECTIVE, DD_CONTACT };

export const ddPrivacySections: LegalSection[] = [
  {
    id: 'who-we-are',
    heading: 'Who we are',
    body: [
      `${DD_CONTACT.brand} (“we,” “us,” or “our”) operates the website at ${DD_CONTACT.site} and related free domain research tools (the “Service”). We provide domain name search, availability research, generators, bulk checks, WHOIS/RDAP lookups, extension browsing, and related utilities.`,
      'We are not a domain name registrar. We do not sell domain registrations on this site, do not process domain registration payments, and do not manage DNS for your domains unless a future feature expressly says otherwise and you opt in.',
    ],
  },
  {
    id: 'scope',
    heading: 'Scope of this Privacy Policy',
    body: [
      'This Privacy Policy describes how we collect, use, disclose, and safeguard information when you use the Service. It is intended for a United States audience and addresses common U.S. privacy expectations, including California Consumer Privacy Act (CCPA/CPRA) rights where applicable.',
      'If you use a related product branded AI Domain Assistant (aidomainassistant.com), that product has its own Privacy Policy; shared research infrastructure may process data as described in both policies.',
    ],
  },
  {
    id: 'information-we-collect',
    heading: 'Information we collect',
    body: [
      'We design the core Service so you can search without creating an account. Depending on how you use the Service, we may process the following categories of information:',
    ],
    bullets: [
      'Usage data: pages viewed, features used, approximate timestamps, referral URLs, and technical logs needed to operate and secure the Service.',
      'Device and technical data: browser type, operating system, device type, language, IP address (or partial IP), and similar diagnostics.',
      'Search and research inputs: domain queries, keywords, generator prompts, bulk lists, filter preferences, and related research text you submit.',
      'Local shortlists: domains you save or shortlist may be stored in your browser (localStorage or similar) on your device by default.',
      'Communications: if you email us (e.g., support or privacy requests), we receive your email address and message content.',
      'Cookies and similar technologies: see our Cookie Policy for details.',
    ],
  },
  {
    id: 'information-we-do-not-sell',
    heading: 'What we do not intentionally collect',
    body: [
      'We do not require you to create an account for core search tools. We do not ask for payment card numbers on DomainDiscovery for domain registration, because checkout happens at third-party registrars.',
      'We do not knowingly collect sensitive personal information (such as government IDs, precise geolocation for tracking, or financial account numbers) as part of the free research tools. Do not submit such data in free-text fields.',
    ],
  },
  {
    id: 'how-we-use',
    heading: 'How we use information',
    body: ['We use information to:'],
    bullets: [
      'Provide, maintain, and improve domain search, generation, ranking, WHOIS/RDAP, bulk, geo, and related tools.',
      'Check domain availability and related research signals via third-party data sources and APIs (including free Instant Domain Search–style infrastructure where configured).',
      'Secure the Service, prevent abuse, enforce rate limits, debug errors, and monitor reliability.',
      'Respond to support, privacy, and legal requests.',
      'Comply with law and enforce our Terms of Use.',
      'Analyze aggregate, de-identified trends to improve product quality (for example, which tools are used most).',
    ],
  },
  {
    id: 'legal-bases-us',
    heading: 'U.S. privacy framework (including California)',
    body: [
      'We process information to provide the Service you request, to secure and improve the Service, and as required by law. Under the CCPA/CPRA (if you are a California resident), the categories above may include identifiers, internet/network activity, and inferences used only to operate research features—not to build advertising profiles for sale.',
      'We do not “sell” personal information for money. We do not knowingly “share” personal information for cross-context behavioral advertising as those terms are commonly defined under California law. If that ever changes, we will update this Policy and provide required opt-out mechanisms.',
    ],
  },
  {
    id: 'local-storage',
    heading: 'Local browser storage and saved domains',
    body: [
      'Saved domains, preferences (such as theme or preferred registrar), and similar shortlists may be stored only in your browser. Clearing site data, cookies, or cache can permanently delete that information. We generally cannot recover local shortlists from our servers because we do not store them as a hosted account feature by default.',
      'We recommend exporting or downloading shortlists when the product offers that option if you need a backup.',
    ],
  },
  {
    id: 'third-parties',
    heading: 'Third-party services and registrars',
    body: [
      'To show availability, pricing signals, WHOIS/RDAP data, or to let you register a name, we may query or link to third parties (for example, domain data providers, Instant Domain Search–compatible services, RDAP registries, and registrars such as GoDaddy, Namecheap, Porkbun, Cloudflare, and others).',
      'When you leave our site to complete registration or use a registrar’s checkout, that registrar’s privacy policy and terms govern their processing. We do not control registrar payment flows.',
      'Hosting, security, analytics, or error-monitoring providers may process technical data as our processors/service providers under contracts that limit use to providing services to us.',
    ],
  },
  {
    id: 'ai-features',
    heading: 'AI and automated domain suggestions',
    body: [
      'Some features generate brandable name ideas or ranked shortlists using rules-based engines and/or optional AI/model services. Prompts and brief text you submit may be processed to produce suggestions.',
      'Unless we clearly state otherwise for a specific feature, we do not use your domain research prompts to train public foundation models. Availability and ranking outputs are research aids only—not legal, trademark, or investment advice.',
    ],
  },
  {
    id: 'retention',
    heading: 'Retention',
    body: [
      'Local browser data remains until you clear it or the browser deletes it. Server logs and security records are retained only as long as reasonably needed for operations, security, debugging, and legal compliance (often days to months for routine logs, longer if required for investigations or law).',
      'Email correspondence is retained as needed to resolve your request and meet recordkeeping obligations.',
    ],
  },
  {
    id: 'security',
    heading: 'Security',
    body: [
      'We use reasonable administrative, technical, and organizational measures designed to protect information (for example, HTTPS in production, access controls, and rate limiting). No method of transmission or storage is 100% secure. You use the Service at your own risk regarding residual security risk.',
    ],
  },
  {
    id: 'children',
    heading: 'Children (COPPA)',
    body: [
      'The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided personal information, contact us and we will take appropriate steps to delete it.',
    ],
  },
  {
    id: 'your-rights',
    heading: 'Your privacy rights (U.S., including California)',
    body: [
      'Depending on your state of residence, you may have rights to request access, correction, deletion, or a copy of certain personal information, and to appeal a denial. California residents may also have rights to know, delete, correct, and opt out of sale/share (as applicable), and to non-discrimination for exercising rights.',
      `To exercise rights, email ${DD_CONTACT.support} with “Privacy Request” in the subject line and enough detail for us to verify and fulfill the request. We may need to verify your identity and will respond within the timeframes required by applicable law.`,
      'Because much shortlist data lives only on your device, deleting localStorage/site data in your browser is often the fastest way to remove saved domains.',
    ],
  },
  {
    id: 'do-not-track',
    heading: 'Do Not Track and Global Privacy Control',
    body: [
      'Browsers may send “Do Not Track” signals; there is no uniform standard for responding. We do not track users across third-party websites for advertising. If we implement Global Privacy Control (GPC) recognition for any future sale/share of personal information, we will describe it here.',
    ],
  },
  {
    id: 'international',
    heading: 'International users',
    body: [
      'The Service is operated for a primarily U.S. audience and may be hosted on infrastructure in the United States. If you access the Service from outside the U.S., you understand that information may be processed in the U.S., where laws may differ from those in your country.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to this Policy',
    body: [
      'We may update this Privacy Policy from time to time. We will post the updated version with a new “Last updated” date. Material changes may also be highlighted on the site. Continued use after the effective date constitutes acceptance of the updated Policy where permitted by law.',
    ],
  },
  {
    id: 'contact',
    heading: 'Contact us',
    body: [
      `All inquiries (product, privacy, and legal): ${DD_CONTACT.support}`,
      `Website: ${DD_CONTACT.site}`,
    ],
  },
];

export const ddTermsSections: LegalSection[] = [
  {
    id: 'agreement',
    heading: 'Agreement to these Terms',
    body: [
      `These Terms of Use (“Terms”) govern access to and use of ${DD_CONTACT.brand} at ${DD_CONTACT.site} and related free domain research tools (the “Service”). By accessing or using the Service, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Service.`,
      'If you use the Service on behalf of an organization, you represent that you have authority to bind that organization.',
    ],
  },
  {
    id: 'service-description',
    heading: 'Description of the Service',
    body: [
      'DomainDiscovery provides free tools for domain research, including (without limitation) domain availability search, AI/rules-based name generation, bulk checks, geo domain lists, WHOIS/RDAP lookup, extension browsing, and registrar price research signals.',
      'We are not a domain registrar. We do not sell domain names, do not complete registration checkout on this site, and do not guarantee that any domain will remain available or registerable at any price.',
    ],
  },
  {
    id: 'eligibility',
    heading: 'Eligibility',
    body: [
      'You must be at least 13 years old (or the minimum age of digital consent in your jurisdiction, if higher) to use the Service. If you are under 18, you may use the Service only with the involvement of a parent or guardian where required by law.',
      'You may not use the Service if you are barred from doing so under U.S. law or other applicable law.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    body: ['You agree not to:'],
    bullets: [
      'Use the Service for any unlawful purpose, including fraud, harassment, or infringement of others’ rights.',
      'Attempt to bypass rate limits, security controls, or access restrictions.',
      'Scrape, bulk harvest, or overload the Service in a way that degrades service for others, except via documented APIs/MCP endpoints within fair-use limits.',
      'Reverse engineer the Service except where such restriction is prohibited by law.',
      'Submit malware, spam, or content that violates law.',
      'Misrepresent availability, prices, or affiliation with registrars or trademark owners.',
      'Use the Service to infringe trademarks, cybersquat in bad faith, or violate the Anticybersquatting Consumer Protection Act or similar laws.',
      'Interfere with or disrupt the Service or third-party networks.',
    ],
  },
  {
    id: 'no-professional-advice',
    heading: 'No legal, trademark, tax, or investment advice',
    body: [
      'Outputs (including generated names, rankings, availability flags, WHOIS data, and price signals) are informational research aids only. They are not legal advice, trademark clearance, brand strategy advice, tax advice, or investment advice.',
      'You are solely responsible for trademark searches, corporate name clearance, compliance with ICANN and registrar policies, and any business decisions you make based on the Service.',
    ],
  },
  {
    id: 'accuracy',
    heading: 'Availability, pricing, and data accuracy',
    body: [
      'Domain availability, premium status, and pricing can change at any time. Third-party data sources, registries, and registrars may return incomplete, delayed, or incorrect information. Always re-check availability and total cost at the registrar checkout before you pay.',
      'WHOIS/RDAP data may be redacted, delayed, or incomplete due to privacy laws and registry practices. We do not warrant completeness of registration records.',
    ],
  },
  {
    id: 'third-party',
    heading: 'Third-party links and registrars',
    body: [
      'The Service may link to third-party websites, registrars, and APIs. We do not control and are not responsible for third-party content, policies, pricing, downtime, or registration outcomes. Your dealings with third parties are solely between you and them.',
    ],
  },
  {
    id: 'ip',
    heading: 'Intellectual property',
    body: [
      'The Service, including its design, software, branding, and original content (excluding your inputs and third-party data), is owned by us or our licensors and is protected by intellectual property laws. You receive a limited, revocable, non-exclusive, non-transferable license to use the Service for lawful personal or internal business research.',
      'You retain rights in text you submit. You grant us a worldwide, non-exclusive license to process that text solely to operate and improve the Service features you use.',
    ],
  },
  {
    id: 'dmca',
    heading: 'Copyright complaints (DMCA)',
    body: [
      `If you believe content on the Service infringes your copyright, send a notice to ${DD_CONTACT.support} with “DMCA Notice” in the subject line and include: (a) your contact information; (b) description of the work; (c) URL of the allegedly infringing material; (d) a statement of good-faith belief; (e) a statement under penalty of perjury that the information is accurate and you are authorized; and (f) your physical or electronic signature. We may remove content and terminate repeat infringers where appropriate under the Digital Millennium Copyright Act.`,
    ],
  },
  {
    id: 'disclaimers',
    heading: 'Disclaimers',
    body: [
      'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
      'We do not warrant that the Service will be uninterrupted, error-free, secure, or that results will meet your requirements or produce any SEO, branding, or commercial outcome.',
    ],
  },
  {
    id: 'limitation',
    heading: 'Limitation of liability',
    body: [
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES, OFFICERS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATED TO THE SERVICE OR THESE TERMS, WHETHER BASED IN CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY.',
      'OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) AMOUNTS YOU PAID US FOR THE SERVICE IN THE 12 MONTHS BEFORE THE CLAIM (IF ANY) OR (B) ONE HUNDRED U.S. DOLLARS (US $100). Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the fullest extent permitted.',
    ],
  },
  {
    id: 'indemnity',
    heading: 'Indemnification',
    body: [
      'You will defend, indemnify, and hold harmless DomainDiscovery and its affiliates, officers, and employees from and against claims, damages, losses, and expenses (including reasonable attorneys’ fees) arising out of your use of the Service, your domain registration choices, trademark or IP disputes, or your violation of these Terms or applicable law.',
    ],
  },
  {
    id: 'export',
    heading: 'Export and sanctions',
    body: [
      'You may not use the Service if you are located in a country subject to comprehensive U.S. sanctions or if you are on a U.S. government restricted party list. You agree to comply with U.S. export control and sanctions laws.',
    ],
  },
  {
    id: 'governing-law',
    heading: 'Governing law and disputes',
    body: [
      'These Terms are governed by the laws of the United States and the State of Delaware, excluding conflict-of-law rules, unless mandatory consumer protections in your state of residence require otherwise.',
      'Except where prohibited, you agree to resolve disputes individually (not as a class action) in state or federal courts located in Delaware, and you consent to personal jurisdiction there. Either party may seek injunctive relief for IP or unauthorized access in any court of competent jurisdiction.',
      `Before filing a claim, you agree to try to resolve the dispute informally by emailing ${DD_CONTACT.support} with “Dispute” in the subject line. If unresolved after 30 days, either party may proceed with formal dispute resolution.`,
    ],
  },
  {
    id: 'changes-terms',
    heading: 'Changes to the Service and Terms',
    body: [
      'We may modify or discontinue features at any time. We may update these Terms by posting a revised version with a new date. Continued use after changes become effective constitutes acceptance where permitted by law.',
    ],
  },
  {
    id: 'termination',
    heading: 'Suspension and termination',
    body: [
      'We may suspend or terminate access to the Service at any time for any reason, including violation of these Terms or risk to the Service or other users. Provisions that by nature should survive (including IP, disclaimers, limitations, and indemnity) will survive termination.',
    ],
  },
  {
    id: 'misc',
    heading: 'Miscellaneous',
    body: [
      'These Terms are the entire agreement between you and us regarding the Service and supersede prior agreements on the subject. If any provision is unenforceable, the remainder remains in effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets.',
      `Contact: ${DD_CONTACT.support} · ${DD_CONTACT.site}`,
    ],
  },
];

export const ddCookieSections: LegalSection[] = [
  {
    id: 'what-are-cookies',
    heading: 'What are cookies and similar technologies?',
    body: [
      'Cookies are small text files stored on your device. We may also use localStorage, sessionStorage, pixels, and similar technologies (together, “cookies”) to operate and improve DomainDiscovery.',
    ],
  },
  {
    id: 'how-we-use-cookies',
    heading: 'How we use cookies',
    body: ['We use cookies and similar technologies to:'],
    bullets: [
      'Remember preferences such as theme (light/dark) or preferred registrar where you set them.',
      'Store saved domain shortlists and related research state in localStorage on your device.',
      'Maintain security, rate limiting, and basic session integrity.',
      'Understand aggregate usage to improve performance and features (if analytics are enabled).',
    ],
  },
  {
    id: 'types',
    heading: 'Types of cookies',
    body: [],
    bullets: [
      'Strictly necessary: required for core site function, security, and preference storage you request.',
      'Functional: enhance experience (e.g., remembering UI preferences).',
      'Analytics (if enabled): help us understand traffic and feature usage in aggregate.',
    ],
  },
  {
    id: 'third-party-cookies',
    heading: 'Third-party cookies',
    body: [
      'When you interact with third-party registrars or external APIs, those parties may set their own cookies under their policies. We do not control third-party cookies on registrar checkout pages.',
    ],
  },
  {
    id: 'manage',
    heading: 'Managing cookies',
    body: [
      'You can control cookies through your browser settings (block, delete, or alert). Clearing site data will remove local shortlists and preferences stored on your device. Blocking all cookies may break some features.',
      'For more about privacy rights, see our Privacy Policy.',
    ],
  },
  {
    id: 'contact-cookies',
    heading: 'Contact',
    body: [`Questions: ${DD_CONTACT.support}`],
  },
];

export const ddDisclaimerSections: LegalSection[] = [
  {
    id: 'research-only',
    heading: 'Research tool disclaimer',
    body: [
      'DomainDiscovery is a free domain research toolkit. Information displayed—including availability, premium flags, prices, WHOIS/RDAP data, rankings, and generated names—is provided for general informational purposes only and may be incomplete, delayed, or incorrect.',
    ],
  },
  {
    id: 'not-registrar',
    heading: 'Not a registrar; no purchase processing',
    body: [
      'We are not an ICANN-accredited registrar (unless separately disclosed in the future). We do not process domain registration payments on this website. Registration, renewal, transfer, and DNS hosting are handled by third-party registrars under their agreements with you.',
    ],
  },
  {
    id: 'no-guarantee',
    heading: 'No guarantee of availability or results',
    body: [
      'A domain shown as “available” may be registered by someone else before you complete checkout. Premium and aftermarket pricing can change without notice. We do not guarantee SEO rankings, brand success, or freedom from trademark conflict.',
    ],
  },
  {
    id: 'your-responsibility',
    heading: 'Your responsibility',
    body: [
      'You are solely responsible for verifying availability at the registrar, reviewing total fees (including premium, renewal, and ICANN fees), conducting trademark and legal clearance, and complying with applicable laws and registrar policies.',
    ],
  },
  {
    id: 'limitation-disc',
    heading: 'Limitation',
    body: [
      'To the maximum extent permitted by law, DomainDiscovery disclaims liability for decisions made based on Service outputs. See our Terms of Use for full warranty disclaimers and liability limits.',
    ],
  },
];
