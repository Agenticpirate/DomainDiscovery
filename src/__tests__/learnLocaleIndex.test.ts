/** @jest-environment node */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import committed from '@/data/learn-locale-index.json';
import {
  ensureLearnLocale,
  getLearnArticle,
  getLearnTranslatedLocales,
  isLearnTranslated,
  localizeLearnArticle,
} from '@/lib/learnArticles';

const LOCALES = ['zh', 'de', 'es', 'ja', 'fr', 'pt', 'hi', 'ar', 'ru', 'bn', 'ur'] as const;
type Translation = {
  title?: string;
  description?: string;
  category?: string;
  topics?: string[];
  readTime?: string;
  sections?: { heading: string }[];
};
const readLocale = (l: string) =>
  JSON.parse(readFileSync(join(process.cwd(), `src/data/learn-locales/${l}.json`), 'utf8')) as {
    articles: Record<string, Translation>;
  };

describe('learn locale index', () => {
  it('matches the translation files (run node scripts/build-learn-locale-index.mjs if this fails)', () => {
    for (const locale of LOCALES) {
      const articles = readLocale(locale).articles;
      const expected = Object.keys(articles)
        .filter((slug) => articles[slug]?.title && articles[slug].sections?.length)
        .sort();
      const index = (committed as Record<string, Record<string, Translation>>)[locale];
      expect(Object.keys(index).sort()).toEqual(expected);
      for (const slug of expected) {
        expect(index[slug].title).toBe(articles[slug].title);
        expect(index[slug].description).toBe(articles[slug].description || '');
      }
    }
  });

  it('localizes listing fields without loading the full file, and sections after loading it', async () => {
    const slug = Object.keys((committed as Record<string, Record<string, Translation>>).fr)[0];
    const english = getLearnArticle(slug);
    expect(english).toBeTruthy();
    expect(isLearnTranslated(slug, 'fr')).toBe(true);
    expect(getLearnTranslatedLocales(slug)).toContain('fr');

    const full = readLocale('fr').articles[slug];
    const light = localizeLearnArticle(english, 'fr')!;
    expect(light.title).toBe(full.title);

    await ensureLearnLocale('fr');
    const loaded = localizeLearnArticle(english, 'fr')!;
    expect(loaded.title).toBe(full.title);
    expect(loaded.sections.map((s) => s.heading)).toEqual(full.sections!.map((s) => s.heading));
  });
});
