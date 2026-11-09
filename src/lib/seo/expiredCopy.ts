/** Expired-domains page copy, shared by the HTML page and its Markdown renderer. */
export const EXPIRED_LIFECYCLE_STAGES = [
  {
    title: 'Active Domain',
    badge: 'Registration period',
    description: 'Domain is registered and active. Renew anytime before expiration.',
    number: '01',
  },
  {
    title: 'Grace Period',
    badge: '0-45 days',
    description: 'Domain expires but can still be renewed by the owner at regular price - no website or email will function.',
    number: '02',
  },
  {
    title: 'Redemption Period',
    badge: '30-90 days',
    description: 'Domain can only be recovered by the original owner at a higher redemption fee. No longer available for new registration.',
    number: '03',
  },
  {
    title: 'Pending Delete',
    badge: '5 days',
    description: 'Domain is queued for deletion. Still not available for re-registration. Cannot be recovered.',
    number: '04',
  },
  {
    title: 'Available',
    badge: 'After ~75-90 days',
    description: 'Domain is released and available for anyone to register on a first-come, first-served basis.',
    number: '05',
  },
];

export const EXPIRED_INFO_CARDS = [
  {
    title: 'What is an expired domain?',
    description: 'An expired domain is a previously registered domain name that the owner didn\'t renew. This can happen due to failed payments, forgotten renewals, or intentional abandonment. After going through grace and redemption periods, these domains become available for registration.',
  },
  {
    title: 'Why consider expired domains?',
    description: 'Expired domains may have existing backlinks, search engine history, or memorable names. Understanding these characteristics helps you evaluate whether a domain fits your needs and goals.',
  },
  {
    title: 'Research before registering',
    description: 'Before registering an expired domain, research its history using archive tools and backlink checkers. Verify it doesn\'t have penalties or trademark issues. Understanding the domain\'s past helps you make informed decisions.',
  },
  {
    title: 'How our search works',
    description: 'Our tool collects millions of expiring and newly available domains. AI-powered filters help you find relevant expired domains based on keywords, extensions, and other criteria you specify.',
  },
];
