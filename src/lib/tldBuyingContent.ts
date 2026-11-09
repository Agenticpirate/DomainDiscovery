import type { TldAboutDetail } from '@/lib/tldAboutData';
import type { TldPricingDetail } from '@/lib/tldPriceTypes';
import { clampMetaDescription } from '@/lib/seo/metaDescription';
import type { FaqItem } from '@/lib/seo/pageMeta';

export type TldBuyingContent = {
  tld: string;
  title: string;
  description: string;
  h1: string;
  faqs: FaqItem[];
  hasPrice: boolean;
};

function sentence(text: string | undefined | null): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

export function buildTldBuyingContent(
  detail: TldAboutDetail,
  price: TldPricingDetail | null | undefined
): TldBuyingContent {
  const tld = detail.tld.startsWith('.') ? detail.tld : `.${detail.tld}`;
  const reg = price?.cheapestRegistration;
  const ren = price?.cheapestRenewal;
  const tra = price?.cheapestTransfer;
  const hasPrice = Boolean(reg?.price && reg.registrar);

  let title = `${tld} Domain Price & Availability | Buy a ${tld} Domain`;
  if (title.length > 60) title = `${tld} Domain Price & Availability`;
  if (title.length > 60) title = `Buy a ${tld} Domain`.slice(0, 60);

  const description = clampMetaDescription(
    hasPrice
      ? `Buy a ${tld} domain: registration from ${reg!.price} at ${reg!.registrar} (verify at checkout). Check availability, renewal prices and rules.`
      : `Buy a ${tld} domain: check availability, see who can register it, registration rules and how to transfer. Search any ${tld} name free.`
  );

  const faqs: FaqItem[] = [];
  if (hasPrice) {
    faqs.push({
      question: `How much does a ${tld} domain cost?`,
      answer: `Based on our tld-list.com data, the lowest first-year registration price we track for ${tld} is ${reg!.price} at ${reg!.registrar}.${
        ren?.price && ren.registrar ? ` The lowest renewal price is ${ren.price} at ${ren.registrar}.` : ''
      } Prices change often and may include promotions, so verify at the registrar before buying.`,
    });
  }
  faqs.push({
    question: `How do I check if a ${tld} domain is available?`,
    answer: `Type the name you want in the availability box on this page and we check it live against registry data. You can also run a WHOIS lookup on any ${tld} domain.`,
  });
  faqs.push({
    question: `Who can register a ${tld} domain?`,
    answer: sentence(detail.whoCanRegister) || `Check the ${tld} registry rules before registering.`,
  });
  const r = detail.registrationRestrictions || {};
  const restrictionParts = [
    r.minLength || r.maxLength ? `Labels can be ${r.minLength ?? 1} to ${r.maxLength ?? 63} characters long.` : '',
    r.canUse ? `Allowed: ${sentence(r.canUse)}` : '',
    r.cannotUse ? `Not allowed: ${sentence(r.cannotUse)}` : '',
  ].filter(Boolean);
  faqs.push({
    question: `Are there restrictions on ${tld} domain names?`,
    answer: restrictionParts.join(' ') || `Restrictions vary by registry and registrar. Check the ${tld} registry rules on this page.`,
  });
  faqs.push({
    question: `Can I transfer a ${tld} domain to another registrar?`,
    answer: hasPrice && tra?.price && tra.registrar
      ? `Generally yes, once the domain is past any registrar lock period. The lowest transfer price we track is ${tra.price} at ${tra.registrar}. Verify current terms at the registrar.`
      : `Generally yes, once the domain is past any registrar lock period. Ask your current registrar for an authorization code and check the new registrar's transfer terms.`,
  });
  faqs.push({
    question: `What is the ${tld} domain extension?`,
    answer: sentence((detail.about || '').split('\n\n')[0]).slice(0, 400) || `${tld} is a top-level domain.`,
  });

  return {
    tld,
    title,
    description,
    h1: `Buy a ${tld} domain: price and availability`,
    faqs,
    hasPrice,
  };
}
