import { notFound } from 'next/navigation';
import { SimpleContentPage } from '@/components/layout/SimpleContentPage';

const guideContent: Record<
  string,
  {
    title: string;
    description: string;
    sections: Array<{ heading: string; body: string[] }>;
  }
> = {
  'choosing-domain': {
    title: 'How to Choose the Perfect Domain Name',
    description: 'A step-by-step guide to selecting a domain that is memorable, brandable, and optimized for search engines.',
    sections: [
      {
        heading: 'Why your domain name matters',
        body: [
          'Your domain name is the foundation of your online identity. It shapes first impressions, influences click-through rates in search results, and determines how easily people can find and remember your website. A strong domain builds trust before visitors even see your content.',
          'Search engines use domain signals as one of many ranking factors. While a domain alone will not guarantee top rankings, a clear, relevant name supports your broader SEO strategy by improving brand recall, direct traffic, and user trust signals.',
        ],
      },
      {
        heading: 'Keep it short and memorable',
        body: [
          'The most effective domain names are between 6 and 14 characters. Shorter names are easier to type, less prone to typos, and more likely to be shared through word of mouth. Think of successful brands: Google, Stripe, Slack, Notion — all short, punchy, and instantly recognizable.',
          'Test your domain with the "radio test": if someone hears the name spoken aloud, can they spell it correctly on the first try? If not, consider simplifying. Avoid double letters, unusual spellings, and words that sound like other words.',
        ],
      },
      {
        heading: 'Make it brandable, not generic',
        body: [
          'Generic keyword domains like "bestcheapshoes.com" may seem SEO-friendly, but they lack brand identity and are harder to differentiate. Modern SEO rewards brand authority over exact-match keywords in domain names.',
          'Instead, aim for a name that is unique, evocative, and ownable. Coined words (like Spotify or Zillow), compound words (like Airbnb or Facebook), or modified real words (like Flickr or Tumblr) all create strong brand associations while remaining memorable.',
        ],
      },
      {
        heading: 'Avoid hyphens, numbers, and special characters',
        body: [
          'Hyphens create confusion when sharing your domain verbally — you will constantly need to say "dash" or "hyphen." Numbers cause similar problems: visitors will not know whether to type "5" or "five." Both reduce trust and professionalism.',
          'Stick to pure alphabetic characters. If your preferred name is taken without hyphens, that is a signal to find a different name rather than adding punctuation as a workaround.',
        ],
      },
      {
        heading: 'Check trademark availability',
        body: [
          'Before committing to a domain, search trademark databases like the USPTO (United States), EUIPO (Europe), or WIPO (international) to ensure your chosen name does not infringe on existing trademarks. Trademark disputes can force you to give up a domain and rebrand entirely.',
          'Also search social media platforms to confirm the name (or close variations) is available as handles on Twitter/X, Instagram, LinkedIn, and other platforms relevant to your audience.',
        ],
      },
      {
        heading: 'Think long-term',
        body: [
          'Choose a name that can grow with your business. Avoid names that are too narrow (like "tokyosushidelivery.com" if you plan to expand beyond Tokyo or beyond sushi). A broader, brandable name gives you room to evolve without needing to rebrand.',
          'Consider how the name looks in a URL bar, on a business card, and in an email address. The best domains work well across all contexts.',
        ],
      },
    ],
  },
  'domain-extensions': {
    title: 'Understanding Domain Extensions and TLDs',
    description: 'A comprehensive guide to choosing between .com, .io, .ai, and 1,600+ other top-level domains for your website.',
    sections: [
      {
        heading: 'What is a domain extension?',
        body: [
          'A domain extension (also called a top-level domain or TLD) is the part of a domain name that comes after the last dot — like .com, .org, or .io. There are now over 1,600 TLDs available, ranging from classic options like .com and .net to industry-specific extensions like .tech, .shop, and .ai.',
          'The extension you choose affects how people perceive your website, can influence local search rankings, and plays a role in brand positioning. While .com remains the most recognized, newer TLDs offer creative branding opportunities.',
        ],
      },
      {
        heading: 'The case for .com',
        body: [
          '.com is the most widely recognized and trusted domain extension globally. It accounts for roughly 37% of all registered domains. When people think of a website, they instinctively add .com — which means owning the .com version of your brand reduces the risk of losing traffic to competitors or typo squatters.',
          'For businesses targeting a broad, international audience, .com is generally the safest choice. It carries inherent trust, works across all markets, and is universally understood.',
        ],
      },
      {
        heading: 'Country-code TLDs (ccTLDs)',
        body: [
          'Country-code TLDs like .uk, .de, .in, .ca, and .au signal geographic targeting. Google and other search engines use ccTLDs as a geo-targeting signal, which can improve local search visibility in the corresponding country.',
          'If your business primarily serves a specific country, a ccTLD can boost local credibility. Many businesses use both a ccTLD for local markets and a .com for international presence. For example, a UK business might use example.co.uk for domestic customers and example.com globally.',
        ],
      },
      {
        heading: 'Industry and niche TLDs',
        body: [
          'Modern TLDs like .ai (artificial intelligence), .io (tech startups), .app (applications), .dev (developers), .shop (e-commerce), and .design (creative agencies) can reinforce your brand positioning when they align with your industry.',
          '.ai has become particularly popular for AI and machine learning companies. .io is widely adopted by SaaS startups and developer tools. .app and .dev (managed by Google) enforce HTTPS by default, adding a security benefit.',
          'The key is alignment: a .tech domain works well for a technology company but would feel odd for a bakery. Choose an extension that reinforces rather than contradicts your brand message.',
        ],
      },
      {
        heading: 'SEO impact of domain extensions',
        body: [
          'Google has stated that new gTLDs (generic top-level domains) do not receive preferential treatment in search rankings. A .xyz domain has the same ranking potential as a .com, all else being equal. What matters more is the quality of your content, backlink profile, and overall site authority.',
          'However, user behavior matters. People are more likely to click on a .com result than an unfamiliar extension, which can indirectly affect your click-through rate and, by extension, your rankings. Trust and recognition still favor established extensions.',
        ],
      },
      {
        heading: 'Pricing considerations',
        body: [
          'Domain pricing varies significantly by extension. Standard .com domains typically cost $10-15 per year for registration. Newer TLDs can range from $2 (for extensions like .xyz) to $50+ (for premium extensions like .ai or .io).',
          'Watch out for introductory pricing that jumps significantly at renewal. Some registrars offer first-year discounts that triple or quadruple in subsequent years. Always check the renewal price before registering.',
        ],
      },
    ],
  },
  'domain-valuation': {
    title: 'Domain Valuation: How Domain Names Are Priced',
    description: 'Learn the key factors that determine domain value, from length and keywords to brandability and market demand.',
    sections: [
      {
        heading: 'What makes a domain valuable?',
        body: [
          'Domain valuation is part science, part market dynamics. A domain name\'s value is determined by a combination of factors including length, keyword relevance, extension quality, brandability, search volume, and historical sales data for comparable names.',
          'Premium domains can sell for anywhere from a few hundred dollars to tens of millions. The most expensive domain sale on record is cars.com at $872 million (including the business), while pure domain sales like voice.com ($30 million) and insurance.com ($35.6 million) demonstrate the value of short, high-intent keyword domains.',
        ],
      },
      {
        heading: 'Length and simplicity',
        body: [
          'Shorter domains are almost always more valuable. Single-word .com domains are the most sought-after, followed by two-word combinations. Every additional character generally reduces value because it increases the chance of typos and reduces memorability.',
          'Two-letter and three-letter .com domains are extremely rare and valuable — most were registered in the 1990s and trade for five to seven figures. Four-letter .com domains (like "LLLL.com" patterns) have an active secondary market.',
        ],
      },
      {
        heading: 'Keyword relevance and search volume',
        body: [
          'Domains containing high-volume search keywords carry inherent value because they attract type-in traffic (people typing the domain directly) and have natural SEO advantages. Terms like "insurance," "loans," "hotels," and "software" command premium prices.',
          'Use tools like Google Keyword Planner, Ahrefs, or SEMrush to research monthly search volume for keywords in your domain. Higher search volume generally correlates with higher domain value, especially for .com extensions.',
        ],
      },
      {
        heading: 'Brandability score',
        body: [
          'A brandable domain is one that sounds like a company name rather than a generic phrase. Names like "Zapier," "Canva," or "Figma" are highly brandable — they are unique, easy to pronounce, and create strong mental associations.',
          'Brandability factors include: pronounceability (can you say it easily?), spellability (can you type it after hearing it once?), uniqueness (does it stand out?), and emotional resonance (does it evoke the right feeling?).',
        ],
      },
      {
        heading: 'Extension premium',
        body: [
          'The same name on different extensions can have vastly different values. A keyword on .com might be worth 10-100x more than the same keyword on .net or .org. Newer extensions like .ai and .io have developed their own premium markets, particularly for tech-related terms.',
          'When valuing a domain, always compare against recent sales of similar domains on the same extension. Platforms like NameBio, DNJournal, and GoDaddy Auctions provide historical sales data.',
        ],
      },
      {
        heading: 'How to get a domain appraised',
        body: [
          'Free appraisal tools like GoDaddy Domain Appraisal, EstiBot, and Namecheap\'s valuation tool provide algorithmic estimates based on comparable sales, keyword data, and domain characteristics. These give a reasonable starting point but should not be treated as definitive.',
          'For high-value domains, consider professional appraisal services or consulting with experienced domain brokers who understand current market conditions and buyer demand in specific niches.',
        ],
      },
    ],
  },
  'brand-protection': {
    title: 'Protecting Your Brand Online: Domain Security Guide',
    description: 'Essential strategies for securing your brand across domain extensions, preventing cybersquatting, and maintaining domain security.',
    sections: [
      {
        heading: 'Why brand protection matters',
        body: [
          'Your domain name is one of your most valuable digital assets. Without proper protection, competitors, cybersquatters, or malicious actors can register similar domains to divert your traffic, damage your reputation, or phish your customers.',
          'Brand protection is not just about defense — it is about maintaining the trust you have built with your audience. A single phishing site on a lookalike domain can erode years of brand equity.',
        ],
      },
      {
        heading: 'Register key domain variations',
        body: [
          'At minimum, secure your brand name on .com, .net, and .org. If you operate internationally, register relevant country-code TLDs (.co.uk, .de, .in, etc.) for your primary markets.',
          'Also consider registering common misspellings, plural/singular variations, and hyphenated versions of your domain. Redirect all variations to your primary domain to capture traffic that would otherwise be lost.',
        ],
      },
      {
        heading: 'Enable domain privacy (WHOIS protection)',
        body: [
          'WHOIS records are publicly accessible and contain the domain registrant\'s name, email, phone number, and address. Without privacy protection, this information is exposed to spammers, scammers, and competitors.',
          'Most registrars offer WHOIS privacy (sometimes called "domain privacy" or "ID protection") that replaces your personal information with proxy details. Some registrars include this for free; others charge $5-15 per year. It is worth enabling on every domain you own.',
        ],
      },
      {
        heading: 'Lock your domains',
        body: [
          'Domain locking (also called "registrar lock" or "transfer lock") prevents unauthorized transfers of your domain to another registrar. This is your first line of defense against domain hijacking.',
          'For high-value domains, consider registry lock (also called "server lock"), which requires manual verification by the registry before any changes can be made. This adds an extra layer of protection beyond standard registrar lock.',
        ],
      },
      {
        heading: 'Use DNSSEC',
        body: [
          'DNSSEC (Domain Name System Security Extensions) adds a layer of authentication to DNS responses, preventing attackers from redirecting your visitors to malicious sites through DNS spoofing or cache poisoning attacks.',
          'Not all registrars and DNS providers support DNSSEC, but if yours does, enabling it is a straightforward way to improve your domain security posture.',
        ],
      },
      {
        heading: 'Monitor for infringement',
        body: [
          'Set up alerts for new domain registrations that are similar to your brand name. Services like DomainTools, MarkMonitor, and Google Alerts can notify you when potentially infringing domains are registered.',
          'If you discover a domain that infringes on your trademark, you can file a UDRP (Uniform Domain-Name Dispute-Resolution Policy) complaint through ICANN-accredited providers like WIPO. This process typically costs $1,500-5,000 and takes 2-3 months.',
        ],
      },
    ],
  },
  'domain-investing': {
    title: 'Domain Investing: Strategies for Building a Profitable Portfolio',
    description: 'Learn how to identify undervalued domains, build a portfolio, price your inventory, and sell domains for profit.',
    sections: [
      {
        heading: 'What is domain investing?',
        body: [
          'Domain investing involves registering or acquiring domain names with the intent to sell them at a profit. Like real estate investing, it requires market knowledge, patience, and disciplined capital allocation. The domain aftermarket generates hundreds of millions of dollars in annual sales.',
          'Successful domain investors understand market trends, keyword demand, and buyer psychology. They build diversified portfolios, maintain realistic pricing, and use multiple sales channels to reach potential buyers.',
        ],
      },
      {
        heading: 'Finding undervalued domains',
        body: [
          'The best domain investments are names that are currently undervalued relative to their potential. Look for domains with strong keywords, short length, and clear commercial intent that are available at registration price ($10-15) or in expired domain auctions.',
          'Monitor trending industries, emerging technologies, and cultural shifts. Domains related to AI, blockchain, remote work, and sustainability have seen significant value increases in recent years. Tools like Google Trends, industry reports, and startup funding data can help identify rising sectors.',
        ],
      },
      {
        heading: 'Portfolio management',
        body: [
          'Treat your domain portfolio like a business inventory. Track acquisition costs, renewal dates, and estimated values in a spreadsheet or portfolio management tool. Regularly audit your holdings and drop domains that are not generating interest or appreciating in value.',
          'Renewal costs add up quickly. A portfolio of 100 domains at $12/year costs $1,200 annually just to maintain. Be ruthless about dropping underperformers — holding a mediocre domain for five years at $60 total cost rarely makes sense if it will only sell for $50.',
        ],
      },
      {
        heading: 'Pricing strategies',
        body: [
          'Research comparable sales on platforms like NameBio, DNJournal, and GoDaddy Auctions before setting prices. Overpricing is the most common mistake new investors make — a domain priced at $50,000 that should be $5,000 will simply never sell.',
          'Consider offering "Buy It Now" prices alongside "Make Offer" options. Many buyers prefer the certainty of a fixed price. For premium domains, working with a broker who has relationships with end-user buyers can significantly increase your chances of a sale.',
        ],
      },
      {
        heading: 'Sales channels',
        body: [
          'List your domains on multiple marketplaces to maximize exposure. Major platforms include GoDaddy Auctions, Sedo, Afternic, Dan.com, and Squadhelp. Each platform has different fee structures, buyer audiences, and listing requirements.',
          'Direct outreach to potential end-users can be highly effective for premium domains. Identify companies or individuals who would benefit from your domain and send a brief, professional inquiry. Keep outreach respectful and avoid aggressive sales tactics.',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        body: [
          'Avoid registering trademarked terms — this is cybersquatting and can result in UDRP complaints and loss of the domain. Do not register domains with the sole intent of selling them to the trademark holder.',
          'Do not over-invest early. Start with a small portfolio of 10-20 carefully selected domains and learn the market before scaling. Many beginners register hundreds of domains based on gut feeling and end up losing money on renewals.',
          'Be patient. Domain sales can take months or years. The average hold time for a profitable domain sale is 2-5 years. If you need quick returns, domain investing may not be the right strategy.',
        ],
      },
    ],
  },
  'dns-guide': {
    title: 'DNS Explained: A Complete Technical Guide',
    description: 'Understand how DNS works, learn about record types, nameservers, propagation, and common configuration tasks.',
    sections: [
      {
        heading: 'What is DNS?',
        body: [
          'DNS (Domain Name System) is the internet\'s phone book. It translates human-readable domain names like "example.com" into IP addresses like "93.184.216.34" that computers use to communicate. Without DNS, you would need to memorize IP addresses for every website you visit.',
          'When you type a domain name into your browser, a series of DNS lookups happen in milliseconds: your device checks its local cache, then queries a recursive resolver (usually your ISP), which queries root nameservers, TLD nameservers, and finally the authoritative nameserver for the domain.',
        ],
      },
      {
        heading: 'Essential DNS record types',
        body: [
          'A Record: Maps a domain name to an IPv4 address (e.g., example.com → 93.184.216.34). This is the most fundamental DNS record and is required for any website.',
          'AAAA Record: Maps a domain to an IPv6 address. As IPv4 addresses become scarce, IPv6 adoption is growing. Supporting both A and AAAA records ensures your site is accessible on modern networks.',
          'CNAME Record: Creates an alias from one domain to another (e.g., www.example.com → example.com). Useful for subdomains and CDN configurations. Cannot be used at the zone apex (root domain).',
          'MX Record: Specifies mail servers for your domain. Priority values determine the order in which mail servers are tried. Lower numbers indicate higher priority. Essential for receiving email at your domain.',
          'TXT Record: Stores arbitrary text data. Commonly used for email authentication (SPF, DKIM, DMARC), domain verification (Google Search Console, SSL certificates), and other service integrations.',
          'NS Record: Specifies the authoritative nameservers for your domain. These are set at your registrar and tell the internet which DNS servers hold the records for your domain.',
        ],
      },
      {
        heading: 'Nameservers and DNS hosting',
        body: [
          'Nameservers are the servers that store and serve your DNS records. When you register a domain, your registrar provides default nameservers, but you can point to third-party DNS providers like Cloudflare, AWS Route 53, or Google Cloud DNS for better performance and features.',
          'Premium DNS providers offer benefits like faster global resolution times, DDoS protection, advanced routing (geo-based, latency-based, weighted), and better uptime guarantees. For business-critical domains, using a dedicated DNS provider is recommended.',
        ],
      },
      {
        heading: 'DNS propagation',
        body: [
          'When you change DNS records, the updates do not take effect instantly worldwide. DNS propagation is the time it takes for changes to spread across all DNS servers globally. This typically takes 15 minutes to 48 hours, depending on TTL (Time to Live) values and caching behavior.',
          'TTL values (measured in seconds) control how long DNS resolvers cache a record before checking for updates. Lower TTL values (300 seconds = 5 minutes) mean faster propagation but more DNS queries. Higher values (86400 seconds = 24 hours) reduce query load but slow down changes.',
          'Before making critical DNS changes (like migrating hosting providers), lower your TTL values 24-48 hours in advance. After the migration is complete and verified, you can raise TTL values back to normal.',
        ],
      },
      {
        heading: 'Common DNS configurations',
        body: [
          'Connecting to web hosting: Create an A record pointing your domain to your hosting provider\'s IP address. Add a CNAME record for "www" pointing to your root domain. Most hosting providers provide specific instructions for their setup.',
          'Setting up email: Add MX records pointing to your email provider (Gmail, Outlook, Fastmail, etc.). Add SPF, DKIM, and DMARC TXT records to authenticate your email and prevent spoofing. These records are critical for email deliverability.',
          'Using a CDN: If using Cloudflare, change your nameservers to Cloudflare\'s. For other CDNs like AWS CloudFront or Fastly, add CNAME records pointing your domain to the CDN endpoint.',
          'SSL certificate verification: Many SSL providers require you to add a CNAME or TXT record to verify domain ownership before issuing a certificate. Let\'s Encrypt uses HTTP or DNS challenges for automated verification.',
        ],
      },
      {
        heading: 'Troubleshooting DNS issues',
        body: [
          'Use command-line tools like "dig" (Linux/Mac) or "nslookup" (Windows) to query DNS records directly. Online tools like DNS Checker, MXToolbox, and WhatsMyDNS show how your records resolve from different locations worldwide.',
          'Common issues include: records not propagated yet (wait and check TTL), incorrect record values (double-check IP addresses and hostnames), conflicting records (remove duplicate or contradictory entries), and nameserver misconfiguration (verify NS records at your registrar match your DNS provider).',
        ],
      },
    ],
  },
};

export default function LearnGuidePage({ params }: { params: { slug: string } }) {
  const guide = guideContent[params.slug];

  if (!guide) {
    notFound();
  }

  return (
    <SimpleContentPage
      activeTool="learn"
      title={guide.title}
      description={guide.description}
      sections={guide.sections}
      cta={{ href: '/learn', label: 'Back to Learn' }}
    />
  );
}
