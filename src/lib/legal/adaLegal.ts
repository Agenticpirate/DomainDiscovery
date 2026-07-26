import type { LegalSection } from '@/components/layout/LegalDocumentPage';
import { ADA_CONTACT, LEGAL_EFFECTIVE, LEGAL_LAST_UPDATED } from './legalMeta';

export { LEGAL_LAST_UPDATED, LEGAL_EFFECTIVE, ADA_CONTACT };

export const adaPrivacySections: LegalSection[] = [
  {
    id: 'who-we-are',
    heading: 'Who we are',
    body: [
      `${ADA_CONTACT.brand} (“ADA,” “we,” “us,” or “our”) operates ${ADA_CONTACT.site} and related interfaces under the /ada path when hosted with DomainDiscovery infrastructure. ADA provides domain research for humans and AI agents: conversational shortlists, structured briefs, MCP/REST tools, Agent Card discovery, and budget-aware ranking.`,
      'ADA is not a domain registrar. We do not process domain registration payments on this site and do not automatically register domains or change DNS in v1.',
    ],
  },
  {
    id: 'relationship-dd',
    heading: 'Relationship to DomainDiscovery',
    body: [
      `Research APIs, availability checks, and ranking infrastructure may be powered by ${ADA_CONTACT.poweredBy} (${ADA_CONTACT.poweredByUrl}). When those systems process your requests, both this Policy and the DomainDiscovery Privacy Policy may apply to the shared infrastructure.`,
    ],
  },
  {
    id: 'scope',
    heading: 'Scope',
    body: [
      'This Privacy Policy explains how we handle information when you use ADA’s website, chat, app, Agent Card, MCP/HTTP tools, and related features. It is written for a United States audience and addresses CCPA/CPRA-style rights where applicable.',
    ],
  },
  {
    id: 'information-collected',
    heading: 'Information we collect',
    body: ['Depending on use, we may process:'],
    bullets: [
      'Business briefs and chat messages you submit (product description, budget, TLD preferences, include/avoid keywords, strategies).',
      'Agent/API requests: tool names, parameters (including maxBudgetUsd), technical headers, and authentication tokens if you configure AGENT_API_KEY.',
      'Session identifiers for chat continuity (server memory may be short-lived; browser may store session ids).',
      'Usage and technical data: IP address, browser/device info, timestamps, error logs, and rate-limit metadata.',
      'Local storage: shortlists or preferences saved in your browser on your device.',
      'Communications if you email support or privacy contacts.',
    ],
  },
  {
    id: 'how-we-use',
    heading: 'How we use information',
    body: ['We use information to:'],
    bullets: [
      'Generate, check, rank, and return domain shortlists under your budget constraints.',
      'Power MCP tools, REST endpoints, and conversational intake for humans and agents.',
      'Secure the Service, enforce rate limits, prevent abuse, and debug failures.',
      'Improve naming strategies and product quality using aggregate insights where appropriate.',
      'Respond to support and privacy requests and comply with law.',
    ],
  },
  {
    id: 'ai-processing',
    heading: 'AI, rules engines, and free-mode processing',
    body: [
      'By default, ADA is designed to operate without paid LLM keys: ranking and many naming strategies use local rules, vertical brand knowledge, and Instant Domain Search–compatible availability checks (the same free-oriented stack used by DomainDiscovery).',
      'If a paid model path is explicitly enabled by the operator (environment configuration), brief text may be sent to that model provider solely to generate or refine suggestions. We do not sell your briefs as training data to third parties. Avoid submitting secrets, passwords, or sensitive personal data in prompts.',
    ],
  },
  {
    id: 'agents-api',
    heading: 'AI agents, MCP, and API access',
    body: [
      'If you connect an automated agent, the agent acts under your control. You are responsible for what the agent submits and how it uses outputs. Optional AGENT_API_KEY authentication, when configured, should be kept secret and rotated if exposed.',
      'Do not embed production secrets in public agent configurations or browser-exposed code.',
    ],
  },
  {
    id: 'local-storage',
    heading: 'Local storage and session data',
    body: [
      'Saved domains and UI preferences may live only in your browser. Clearing cache or site data deletes them permanently from that device. Server-side chat sessions, if used, may expire automatically and are not guaranteed as permanent archives.',
    ],
  },
  {
    id: 'third-parties',
    heading: 'Third parties',
    body: [
      'Availability and related signals may come from third-party domain data sources and public RDAP. Registrar links send you to third-party sites governed by their policies. Hosting and security providers may process technical data as service providers.',
    ],
  },
  {
    id: 'us-rights',
    heading: 'U.S. privacy rights (including California)',
    body: [
      'We do not sell personal information for money and do not knowingly share it for cross-context behavioral advertising. California residents may request access, deletion, correction, and information about certain processing, subject to verification and legal exceptions.',
      `To exercise rights, email ${ADA_CONTACT.support} with “Privacy Request” in the subject. Include enough detail to verify and fulfill the request. You may also clear local browser data to remove on-device shortlists.`,
    ],
  },
  {
    id: 'children',
    heading: 'Children (COPPA)',
    body: [
      'ADA is not directed to children under 13. We do not knowingly collect personal information from children under 13. Contact us to request deletion if you believe such data was submitted.',
    ],
  },
  {
    id: 'security-retention',
    heading: 'Security and retention',
    body: [
      'We use reasonable safeguards (HTTPS in production, access controls, rate limits). No system is perfectly secure. Logs and operational data are retained only as needed for security, debugging, and legal compliance.',
    ],
  },
  {
    id: 'international',
    heading: 'International users',
    body: [
      'The Service is oriented to U.S. users and may process data in the United States. Access from other countries is at your own initiative and risk regarding cross-border transfer rules.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes',
    body: [
      'We may update this Policy by posting a new version with a revised “Last updated” date. Continued use after the effective date constitutes acceptance where permitted by law.',
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: [
      `All inquiries (product, privacy, and legal): ${ADA_CONTACT.support}`,
      `Site: ${ADA_CONTACT.site}`,
    ],
  },
];

export const adaTermsSections: LegalSection[] = [
  {
    id: 'agreement',
    heading: 'Agreement to these Terms',
    body: [
      `These Terms of Use (“Terms”) govern access to ${ADA_CONTACT.brand} at ${ADA_CONTACT.site} (and /ada routes on shared hosting) including chat, structured app, docs, Agent Card, MCP/HTTP tools, and related features (the “Service”). By using the Service you agree to these Terms and the Privacy Policy.`,
    ],
  },
  {
    id: 'service',
    heading: 'What the Service is (and is not)',
    body: [
      'ADA helps humans and AI agents research brandable domains under a budget: generate candidates, check availability (including Instant Domain–compatible checks), rank shortlists, and expose machine-readable tools.',
      'ADA is not a registrar, does not complete domain purchases, does not guarantee registration success, and does not provide trademark clearance or legal advice. Automated registration/DNS—if ever offered—will require explicit human confirmation and hard budget stops.',
    ],
  },
  {
    id: 'eligibility',
    heading: 'Eligibility',
    body: [
      'You must be at least 13 (or older if required where you live). If using the Service for an organization or as an automated agent operator, you represent you are authorized to accept these Terms.',
    ],
  },
  {
    id: 'agent-use',
    heading: 'Use by AI agents and developers',
    body: [
      'You may connect agents via MCP, REST, or chat APIs subject to rate limits, optional API keys, and fair use. You are responsible for agent behavior, secrets management, and ensuring outputs are reviewed by a human before any purchase or public brand launch.',
      'You must not use the Service to spam registries, evade security controls, or automate registrations without a human-in-the-loop confirmation when registration features exist.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    body: ['You agree not to:'],
    bullets: [
      'Violate law, including fraud, IP infringement, or sanctions violations.',
      'Abuse APIs (excessive load, credential stuffing, scraping beyond documented interfaces).',
      'Submit unlawful, harmful, or abusive content in briefs or chat.',
      'Misrepresent ADA outputs as guaranteed available inventory or legal clearance.',
      'Attempt unauthorized access to systems or other users’ data.',
      'Use the Service for bad-faith cybersquatting or trademark abuse.',
    ],
  },
  {
    id: 'budgets',
    heading: 'Budget flags and prices',
    body: [
      'maxBudgetUsd and budgetStatus (within / over / unknown) are research aids. Prices may be unknown or change. Agents and humans must not invent fees. Final price is always determined at registrar checkout.',
    ],
  },
  {
    id: 'accuracy',
    heading: 'No warranty of data accuracy',
    body: [
      'Availability, premium status, WHOIS/RDAP, rankings, and generated names may be wrong or stale. Always re-verify before paying a registrar. SEO or brand outcomes are not guaranteed.',
    ],
  },
  {
    id: 'ip',
    heading: 'Intellectual property',
    body: [
      'ADA branding, UI, and software are owned by us or licensors. You receive a limited license to use the Service for lawful research. You retain rights in your briefs; you grant us a license to process them to provide the features you use.',
    ],
  },
  {
    id: 'disclaimers',
    heading: 'Disclaimers',
    body: [
      'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.',
    ],
  },
  {
    id: 'limitation',
    heading: 'Limitation of liability',
    body: [
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY ARISING OUT OF THE SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF FEES YOU PAID US IN THE PRIOR 12 MONTHS (IF ANY) OR US $100.',
    ],
  },
  {
    id: 'indemnity',
    heading: 'Indemnification',
    body: [
      'You will indemnify and hold us harmless from claims arising out of your use of the Service, your agents’ use, domain registration decisions, trademark disputes, or violation of these Terms or law.',
    ],
  },
  {
    id: 'governing-law',
    heading: 'Governing law and disputes',
    body: [
      `These Terms are governed by U.S. and Delaware law, excluding conflict rules, except where mandatory consumer protections apply. Informal resolution first via ${ADA_CONTACT.support} (subject “Dispute”) for 30 days, then courts in Delaware unless prohibited. Class actions are waived to the extent allowed by law.`,
    ],
  },
  {
    id: 'changes-termination',
    heading: 'Changes and termination',
    body: [
      'We may modify the Service or these Terms by posting updates. We may suspend access for abuse or risk. Surviving clauses include IP, disclaimers, liability limits, and indemnity.',
      `Contact: ${ADA_CONTACT.support}`,
    ],
  },
];

export const adaCookieSections: LegalSection[] = [
  {
    id: 'overview',
    heading: 'Cookies and local storage on ADA',
    body: [
      'AI Domain Assistant may use cookies, localStorage, and similar technologies to remember theme preferences, chat session identifiers, and on-device shortlists, and to secure the Service.',
    ],
  },
  {
    id: 'types',
    heading: 'What we store',
    bullets: [
      'Preferences: light/dark theme and similar UI settings.',
      'Session: chat session ids for continuity when enabled.',
      'Shortlists: domains you save may remain only in your browser.',
      'Security: rate-limit and abuse-prevention related data as needed.',
    ],
  },
  {
    id: 'control',
    heading: 'Your controls',
    body: [
      'Use browser settings to block or delete cookies and site data. Clearing storage removes local shortlists. See our Privacy Policy for broader rights requests.',
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: [`${ADA_CONTACT.support}`],
  },
];

export const adaDisclaimerSections: LegalSection[] = [
  {
    id: 'research',
    heading: 'Research-only product',
    body: [
      'ADA outputs (chat replies, rankings, availability flags, budget statuses, Agent Card data) are research aids for naming exploration. They are not legal, trademark, or financial advice and not a commitment that any domain can be registered at any price.',
    ],
  },
  {
    id: 'human-confirm',
    heading: 'Human confirmation required',
    body: [
      'v1 does not auto-register domains or modify DNS. Any future automation will require explicit human confirmation and budget enforcement. You remain responsible for registrar accounts and compliance.',
    ],
  },
  {
    id: 'agents',
    heading: 'Agent operators',
    body: [
      'If you wire an AI agent, you must ensure a human reviews purchases. Do not rely solely on automated outputs for brand-critical or legal decisions.',
    ],
  },
  {
    id: 'see-terms',
    heading: 'See also',
    body: [
      'Full warranty disclaimers and liability limits are in the Terms of Use. Privacy practices are in the Privacy Policy.',
    ],
  },
];
