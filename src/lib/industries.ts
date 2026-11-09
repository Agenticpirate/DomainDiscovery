import type { FaqItem } from '@/lib/seo/pageMeta';

/** Industry landing pages for domain name ideas. Compact tuple data, expanded by buildIndustry(). */
export type Industry = {
  slug: string;
  /** Display name, e.g. "Law Firm" */
  name: string;
  /** Single-word seed keywords (letters/digits only) */
  keywords: string[];
  /** Recommended TLDs without the dot; each has a page at /blog/tlds/<tld> */
  tlds: string[];
  tips: string[];
  faqs: FaqItem[];
  learnSlug?: string;
  /** <= 60 chars, rendered as-is */
  title: string;
  description: string;
};

type Row = [slug: string, name: string, keywords: string, tlds: string, tips: [string, string, string], learnSlug?: string];

const ROWS: Row[] = [
  ['restaurant', 'Restaurant', 'taste,dine,kitchen,table,bistro', 'com,restaurant,cafe,co', ['Use the cuisine or neighborhood in the name so locals find you by search.', 'Keep it easy to say aloud when guests book by phone.', 'Match the name to your social handles before you order signage.'], '100-best-domain-name-ideas-for-restaurants-in-2026'],
  ['real-estate', 'Real Estate', 'home,realty,estate,property,house', 'com,estate,realestate,co', ['Add the city or region if you serve one market.', 'Avoid hyphens: agents share the address by voice and on yard signs.', 'Choose a name that still works if you add partners or a team later.'], 'best-domain-names-for-real-estate-agents-and-agencies'],
  ['law-firm', 'Law Firm', 'law,legal,counsel,attorney,justice', 'com,law,legal,co', ['Founding-partner surnames read as established but can be hard to spell.', 'Name the practice area if you want to rank for it.', 'Check bar association advertising rules before you pick a tagline-style name.'], 'best-domain-names-for-law-firms-in-2026'],
  ['fitness', 'Fitness', 'fit,gym,strong,move,train', 'com,fitness,co,app', ['Action words such as move, train and lift signal energy.', 'Pick a name that works for classes, coaching and an app.', 'Keep it short so it fits on gear and social bios.'], 'creative-domain-name-ideas-for-fitness-and-gym-businesses'],
  ['saas', 'SaaS', 'cloud,stack,flow,sync,metric', 'com,io,app,dev', ['Short, brandable names age better than literal feature names.', 'Secure the .com if you can; use .io or .app as a fallback.', 'Check the name is not already a well-known product in your category.'], 'domain-name-ideas-for-tech-startups-with-availability-tips-2026'],
  ['dentist', 'Dentist', 'dental,smile,tooth,dentist,care', 'com,dental,dentist,care', ['Include the city and the word dentist for local search.', 'Friendly words like smile build trust with nervous patients.', 'Avoid clinical jargon patients cannot spell.']],
  ['plumber', 'Plumber', 'plumb,pipe,drain,flow,fix', 'com,plumbing,co,online', ['Lead with the service and the town, such as drains or emergency.', 'Pick a name that is easy to say on a noisy job site.', 'Keep a 24/7 or emergency word out of the name if hours may change.']],
  ['photography', 'Photography', 'photo,lens,frame,shutter,focus', 'com,photography,studio,co', ['Your own name works well when clients hire the person.', 'A style word, like wedding or portrait, helps with search.', 'Keep the name free of numbers so it is easy to share.'], 'domain-name-ideas-for-photography-businesses'],
  ['ecommerce', 'Ecommerce', 'shop,store,cart,market,buy', 'com,shop,store,co', ['Choose a name that can grow beyond your first product.', 'Avoid hard-to-spell coined words if customers type the address.', 'Check marketplace and social handles at the same time.']],
  ['consulting', 'Consulting', 'advise,consult,insight,strategy,partner', 'com,consulting,co,agency', ['A personal name signals expertise and is hard to copy.', 'Name the niche you serve, not every service you offer.', 'Keep the address short enough for an email signature.']],
  ['marketing-agency', 'Marketing Agency', 'brand,growth,reach,media,pixel', 'com,agency,marketing,co', ['A brandable name beats a keyword string for an agency.', 'Check the name reads well in client pitches and proposals.', 'Avoid trendy words that will date the agency in a few years.']],
  ['travel', 'Travel', 'trip,roam,voyage,journey,wander', 'com,travel,co,online', ['Evocative words sell the trip before the visitor lands.', 'Add a destination if you specialise in one region.', 'Make sure the name is clear in more than one language if you serve tourists.']],
  ['coffee-shop', 'Coffee Shop', 'brew,bean,roast,cup,espresso', 'com,coffee,cafe,shop', ['Warm, short words suit a neighborhood shop.', 'Add your town if you want local searches to find you.', 'Check the name against local competitors to avoid confusion.']],
  ['bakery', 'Bakery', 'bake,bread,dough,crumb,oven', 'com,co,shop,online', ['Sweet, simple words are easy to remember and spell.', 'Think ahead if you plan to ship or take online orders.', 'Use the same name on your menu, labels and social profiles.']],
  ['salon', 'Salon', 'salon,style,glow,hair,beauty', 'com,beauty,salon,co', ['Pick a name that also fits your booking page and Instagram.', 'Avoid creative spellings clients will mistype.', 'Add the city when you rely on walk-in and local traffic.']],
  ['barber', 'Barber', 'barber,fade,cut,shave,clipper', 'com,co,shop,online', ['Short, punchy names suit the trade and fit on signs.', 'Include the neighborhood if you depend on local clients.', 'Check the name is not already used by a shop in your area.']],
  ['accounting', 'Accounting', 'ledger,tax,books,account,numbers', 'com,accountant,tax,co', ['Trust words like clear and ledger signal accuracy.', 'Name the client type, such as freelancers or small business.', 'Keep the name formal enough for invoices and email.']],
  ['construction', 'Construction', 'build,construct,frame,brick,site', 'com,construction,build,co', ['Use the trade and the region, such as roofing or remodeling.', 'Short names fit on trucks, hard hats and yard signs.', 'Avoid numbers that read differently when spoken.']],
  ['medical-clinic', 'Medical Clinic', 'clinic,health,care,medic,wellness', 'com,health,clinic,care', ['Plain, trustworthy words work better than clever ones.', 'Name the specialty if patients search by it.', 'Check local rules on how clinics may name and advertise themselves.']],
  ['education', 'Education', 'learn,teach,academy,study,school', 'com,edu,academy,school', ['Use learn, teach or academy to make the purpose obvious.', 'Check that .edu eligibility applies before planning around it.', 'Pick a name that suits both students and parents.']],
  ['nonprofit', 'Nonprofit', 'give,impact,cause,hope,together', 'org,com,ngo,foundation', ['The .org extension is widely associated with nonprofits.', 'Say what you do in the mission, not only the name.', 'Reserve the .com too so donors do not land elsewhere.']],
  ['fashion', 'Fashion', 'style,wear,thread,label,couture', 'com,fashion,shop,store', ['A short, brandable name carries across logo, tags and packaging.', 'Avoid unusual spellings customers will mistype.', 'Check handles on the main social platforms before you commit.']],
  ['jewelry', 'Jewelry', 'gem,jewel,gold,sparkle,carat', 'com,jewelry,shop,store', ['Elegant, short names suit a premium product.', 'Skip generic words if you want to build a recognisable brand.', 'Make sure the address is easy to type from a mobile ad.']],
  ['pet-care', 'Pet Care', 'pet,paw,fur,tail,woof', 'com,pet,care,co', ['Friendly animal words build quick recognition.', 'Name the service, such as grooming, boarding or training.', 'Check the name is not tied to another pet brand in your country.']],
  ['auto-repair', 'Auto Repair', 'auto,motor,garage,wrench,wheel', 'com,auto,repair,co', ['Include the city and a service word for local search.', 'Keep it plain enough for customers to type from a card.', 'Avoid brand names of car makers you do not own.']],
  ['landscaping', 'Landscaping', 'lawn,garden,green,yard,grove', 'com,garden,online,co', ['Nature words are memorable and easy to picture.', 'Add the area you serve if you work in a small region.', 'Keep the name open to design and maintenance services.']],
  ['cleaning-services', 'Cleaning Services', 'clean,spark,tidy,fresh,maid', 'com,cleaning,services,co', ['Clean, fresh and spark signal the result customers want.', 'Add the city to appear in local searches.', 'Check the name is clear for both home and office clients.']],
  ['crypto', 'Crypto', 'chain,coin,token,block,defi', 'com,io,xyz,app', ['Check trademark and exchange rules before using a coined word.', 'Avoid names close to known scams or well-known tokens.', 'Choose a name that survives a rebrand of your product.']],
  ['gaming', 'Gaming', 'game,play,pixel,quest,arena', 'com,games,gg,io', ['Short, bold names work well for communities and streams.', 'Check the name on Discord, Twitch and Steam first.', 'Skip numbers and swaps that are hard to say in chat.']],
  ['ai-startup', 'AI Startup', 'ai,neural,model,agent,intelligence', 'ai,com,io,dev', ['The .ai extension is popular with AI products, but check renewal pricing.', 'Pick a brand that outlives a single model or trend.', 'Avoid generic AI words that are hard to protect.']],
];

function toFaqs(name: string, keywords: string[], tlds: string[]): FaqItem[] {
  const lower = name.toLowerCase();
  return [
    {
      question: `What is the best domain extension for a ${lower} business?`,
      answer: `A .${tlds[0]} address is the usual first choice for a ${lower} business, with .${tlds.slice(1, 3).join(' and .')} as alternatives. Check each one for availability and renewal price before you decide.`,
    },
    {
      question: `Should my ${lower} domain name include a keyword?`,
      answer: `A keyword such as ${keywords.slice(0, 3).join(', ')} can tell visitors what you do, but it is not required. A short brandable name is often easier to remember, so test a few of each.`,
    },
    {
      question: `How do I check if a ${lower} domain name is available?`,
      answer: `Select any suggestion on this page to run an availability search. You can also check many names at once with bulk search. Availability changes quickly, so register soon after you decide.`,
    },
  ];
}

function buildIndustry([slug, name, kw, tl, tips, learnSlug]: Row): Industry {
  const keywords = kw.split(',');
  const tlds = tl.split(',');
  const description = `Domain name ideas for a ${name.toLowerCase()} business. Browse sample names, get live suggestions and check availability on .${tlds[0]}, .${tlds[1]} and more.`;
  return {
    slug,
    name,
    keywords,
    tlds,
    tips,
    faqs: toFaqs(name, keywords, tlds),
    ...(learnSlug ? { learnSlug } : {}),
    title: `${name} Domain Name Ideas & Generator`,
    description,
  };
}

export const INDUSTRIES: Industry[] = ROWS.map(buildIndustry);

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export function getIndustrySlugs(): string[] {
  return INDUSTRIES.map((i) => i.slug);
}
