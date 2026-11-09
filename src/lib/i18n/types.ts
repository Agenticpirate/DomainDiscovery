export type PageCopy = {
  title: string;
  description: string;
  keywords: string[];
};

export type Qa = { question: string; answer: string };

export type GuideItem = { question: string; answer: string; detail?: string };

export type GuideCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  items: GuideItem[];
  learnMore: string;
  related: string[];
};

export type DefinitionCopy = {
  question: string;
  answer: string;
  learnLabel: string;
};

export type NamedCopy = { title: string; description: string };

export type Messages = {
  pages: {
    home: PageCopy;
    search: PageCopy;
    generator: PageCopy;
    bulk: PageCopy;
    extensions: PageCopy;
    whois: PageCopy;
    compare: PageCopy;
    geo: PageCopy;
    faq: PageCopy;
    contact: PageCopy;
    leads?: PageCopy;
  };
  crumbs: {
    search: string;
    generator: string;
    bulk: string;
    extensions: string;
    whois: string;
    compare: string;
    geo: string;
    faq: string;
    contact: string;
    leads?: string;
  };
  nav: {
    home: string;
    search: string;
    tools: string;
    learn: string;
    saved: string;
    savedAria: string;
    light: string;
    dark: string;
    language: string;
    searchItems: { label: string; mobile: string; description: string }[];
    toolItems: { label: string; mobile: string; description: string }[];
  };
  footer: {
    blurb: string;
    badge: string;
    product: string;
    tools: string;
    learn: string;
    company: string;
    search: string;
    assistant: string;
    generator: string;
    bulk: string;
    extensions: string;
    ada: string;
    whois: string;
    geo: string;
    compare: string;
    keyword: string;
    guides: string;
    faq: string;
    what: string;
    forAi: string;
    blog: string;
    contact: string;
    privacy: string;
    terms: string;
    cookies: string;
    disclaimer: string;
    tagline: string;
    builtBy: string;
    onX: string;
  };
  hero: {
    live: string;
    liveRest: string;
    h1Mobile: string;
    h1Desktop: string;
    sub: string;
    trust: [string, string, string, string];
    placeholder: string;
    placeholderDots: string;
    placeholderAi: string;
    searchDomains: string;
    generateNames: string;
    aiOn: string;
    orAi: string;
    search: string;
    generate: string;
    aria: string;
    bulkHint: string;
    geoHint: string;
    /** Label after the live search counter, e.g. "domains searched". */
    searched: string;
  };
  ui: {
    available: string;
    premium: string;
    taken: string;
    definition: string;
    example: string;
    namesCount: string;
  };
  home: {
    searchKicker: string;
    searchTitle: string;
    searchBody: string;
    searchCta: string;
    salesKicker: string;
    salesTitle: string;
    extKicker: string;
    extTitle: string;
    extBody: string;
    extCta: string;
    tileLabel: string;
    genKicker: string;
    genTitle: string;
    genBody: string;
    genCta: string;
    shortlist: string;
    bulkKicker: string;
    bulkTitle: string;
    bulkBody: string;
    bulkCta: string;
    bulkFile: string;
    chooseKicker: string;
    chooseTitle: string;
    qualities: NamedCopy[];
    toolkitTitle: string;
    toolkitSub: string;
    tools: { title: string; description: string; badge?: string; cta?: string }[];
    benefits: NamedCopy[];
    local: string;
    popularMobile: string;
    popularDesktop: string;
    popularSub: string;
    viewAll: string;
    extLabels: string[];
    privacyTitle: string;
    privacySub: string;
    howTitle: string;
    howLead: string;
    howGeo: string;
    howMid: string;
    howWhois: string;
    howAnd: string;
    howPrices: string;
    howTail: string;
    chips: { label: string; sub: string }[];
    chooseHeading: string;
    tips: NamedCopy[];
    tldTitle: string;
    tldLead: string;
    tldSearch: string;
    tldReg: string;
    tldGeo: string;
    tldExt: string;
    tldAbout: string;
    tldTail: string;
    viewAllArrow: string;
    ctaTitle: string;
    ctaSub: string;
    ctaButton: string;
    faqTitle: string;
    faqSub: string;
    faqs: Qa[];
  };
  ticker: { quote: string; role: string }[];
  stats: [string, string, string, string];
  definitions: {
    home: DefinitionCopy;
    search: DefinitionCopy;
    generator: DefinitionCopy;
    bulk: DefinitionCopy;
    extensions: DefinitionCopy;
    whois: DefinitionCopy;
    compare: DefinitionCopy;
    geo: DefinitionCopy;
  };
  guides: {
    search: GuideCopy;
    geo: GuideCopy;
    whois: GuideCopy;
    bulk: GuideCopy;
    generator: GuideCopy;
    compare: GuideCopy;
    extensions: GuideCopy;
  };
  faqPage: {
    title: string;
    subtitle: string;
    cta: string;
    items: Qa[];
  };
  contactPage: {
    title: string;
    description: string;
    supportTitle: string;
    support: [string, string, string];
    policiesTitle: string;
    policies: string;
    partnersTitle: string;
    partners: string;
    cta: string;
  };
  /**
   * Phrase table for tool-page UI copy, keyed by the exact English text.
   * English leaves it empty (the key itself is shown); other languages fill it in.
   * Placeholders look like {n} and are filled in by the translate helper.
   */
  tx: Record<string, string>;
};
