import { ALTERNATIVES } from '@/lib/alternatives';
import { LEAD_PAGES } from '@/lib/leadPages';

const BANNED = ['scam', 'worst', 'terrible', 'garbage'];

const groups = [
  { name: 'alternatives', pages: ALTERNATIVES },
  { name: 'leadPages', pages: LEAD_PAGES },
];

describe.each(groups)('$name data', ({ pages }) => {
  it('has unique slugs', () => {
    const slugs = pages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique titles of at most 60 characters', () => {
    const titles = pages.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
    titles.forEach((t) => expect(t.length).toBeLessThanOrEqual(60));
  });

  it('has descriptions of 25-160 characters', () => {
    pages.forEach((p) => {
      expect(p.description.length).toBeGreaterThanOrEqual(25);
      expect(p.description.length).toBeLessThanOrEqual(160);
    });
  });

  it('has a non-empty FAQ', () => {
    pages.forEach((p) => expect(p.faqs.length).toBeGreaterThan(0));
  });

  it('avoids disparaging words', () => {
    const text = JSON.stringify(pages).toLowerCase();
    BANNED.forEach((word) => expect(text).not.toContain(word));
  });
});

describe('titles across both groups', () => {
  it('are unique', () => {
    const titles = [...ALTERNATIVES, ...LEAD_PAGES].map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
