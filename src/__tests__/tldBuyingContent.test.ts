import { buildTldBuyingContent } from '@/lib/tldBuyingContent';
import { getTldAboutDetail, type TldAboutDetail } from '@/lib/tldAboutData';
import { getTldPriceDetail } from '@/lib/tldPriceData';

const synthetic: TldAboutDetail = {
  tld: '.zzexample',
  slug: 'zzexample',
  title: '.zzexample',
  type: 'generic',
  about: 'A synthetic extension used for tests.',
  whoCanRegister: 'Anyone',
  registrationRestrictions: {},
  features: {},
  source: 'test',
  sourceUrl: 'https://example.com',
};

describe('buildTldBuyingContent', () => {
  it.each(['ai', 'com'])('builds valid content for .%s with price data', async (slug) => {
    const detail = await getTldAboutDetail(slug);
    expect(detail).not.toBeNull();
    const price = getTldPriceDetail(detail!.tld);
    const c = buildTldBuyingContent(detail!, price);
    expect(c.title.length).toBeLessThanOrEqual(60);
    expect(c.description.length).toBeGreaterThanOrEqual(25);
    expect(c.description.length).toBeLessThanOrEqual(160);
    expect(c.faqs.length).toBeGreaterThanOrEqual(5);
    expect(c.h1).toContain(`.${slug}`);
  });

  it('omits price text when no price entry', () => {
    const c = buildTldBuyingContent(synthetic, null);
    expect(c.hasPrice).toBe(false);
    expect(c.title.length).toBeLessThanOrEqual(60);
    expect(c.description.length).toBeGreaterThanOrEqual(25);
    expect(c.description.length).toBeLessThanOrEqual(160);
    expect(c.faqs.length).toBeGreaterThanOrEqual(5);
    const text = [c.description, ...c.faqs.map((f) => f.question + f.answer)].join(' ');
    expect(text).not.toMatch(/\$|tld-list/);
  });
});
