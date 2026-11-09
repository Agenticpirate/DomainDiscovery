import fs from 'fs';
import path from 'path';
import { INDUSTRIES } from '@/lib/industries';
import { getStaticIdeas } from '@/lib/industryIdeas';

const raw: { articles: Array<{ slug: string }> } = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/data/learn-articles.json'), 'utf8'),
);
const articleSlugs = new Set(raw.articles.map((a) => a.slug));

describe('industries data', () => {
  it('has about 30 industries with unique slugs', () => {
    const slugs = INDUSTRIES.map((i) => i.slug);
    expect(slugs.length).toBeGreaterThanOrEqual(30);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique titles of at most 60 characters', () => {
    const titles = INDUSTRIES.map((i) => i.title);
    expect(new Set(titles).size).toBe(titles.length);
    titles.forEach((t) => expect(t.length).toBeLessThanOrEqual(60));
  });

  it('has descriptions of 25-160 characters', () => {
    INDUSTRIES.forEach((i) => {
      expect(i.description.length).toBeGreaterThanOrEqual(25);
      expect(i.description.length).toBeLessThanOrEqual(160);
    });
  });

  it('has 4-6 keywords, 3-4 TLDs, 3 tips and 3 FAQs; TLD pages exist', () => {
    INDUSTRIES.forEach((i) => {
      expect(i.keywords.length).toBeGreaterThanOrEqual(4);
      expect(i.keywords.length).toBeLessThanOrEqual(6);
      expect(i.tlds.length).toBeGreaterThanOrEqual(3);
      expect(i.tlds.length).toBeLessThanOrEqual(4);
      expect(i.tips).toHaveLength(3);
      expect(i.faqs).toHaveLength(3);
      i.tlds.forEach((t) => expect(fs.existsSync(path.join(process.cwd(), 'src/data/tld-about', `${t}.json`))).toBe(true));
    });
  });

  it('references only existing learn articles', () => {
    INDUSTRIES.forEach((i) => {
      if (i.learnSlug) expect(articleSlugs.has(i.learnSlug)).toBe(true);
    });
  });

  it('produces non-empty, valid, unique suggestions', () => {
    INDUSTRIES.forEach((i) => {
      const ideas = getStaticIdeas(i);
      expect(ideas.length).toBeGreaterThan(0);
      expect(new Set(ideas).size).toBe(ideas.length);
      ideas.forEach((d) => expect(d).toMatch(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}$/));
    });
  });
});
