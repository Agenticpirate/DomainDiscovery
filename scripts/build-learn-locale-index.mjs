#!/usr/bin/env node
/**
 * Writes src/data/learn-locale-index.json: for each language, the guides that are fully
 * translated (title + sections) and their listing fields (no section bodies).
 *
 * Why: the full translation files are ~24 MB together. Pages that only need "is this guide
 * translated?" or a translated title read this small index; the full file for one language
 * is loaded on demand by the guide page itself (see ensureLearnLocale in src/lib/learnArticles.ts).
 *
 * Run after changing any src/data/learn-locales/<lang>.json:
 *   node scripts/build-learn-locale-index.mjs
 * A jest test fails when the committed index is out of date.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const LEARN_INDEX_LOCALES = ['zh', 'de', 'es', 'ja', 'fr', 'pt', 'hi', 'ar', 'ru', 'bn', 'ur'];

/** Same rule as isLearnTranslated: a translation counts only with a title and sections. */
export function buildLearnLocaleIndex(readLocale) {
  const index = {};
  for (const locale of LEARN_INDEX_LOCALES) {
    const articles = readLocale(locale)?.articles || {};
    const entries = {};
    for (const slug of Object.keys(articles).sort()) {
      const a = articles[slug];
      if (!a?.title || !a.sections?.length) continue;
      entries[slug] = {
        title: a.title,
        description: a.description || '',
        ...(a.category ? { category: a.category } : {}),
        ...(a.topics?.length ? { topics: a.topics } : {}),
        ...(a.readTime ? { readTime: a.readTime } : {}),
      };
    }
    index[locale] = entries;
  }
  return index;
}

export function readLocaleFile(locale) {
  return JSON.parse(readFileSync(join(root, `src/data/learn-locales/${locale}.json`), 'utf8'));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const index = buildLearnLocaleIndex(readLocaleFile);
  writeFileSync(join(root, 'src/data/learn-locale-index.json'), `${JSON.stringify(index)}\n`);
  const counts = Object.entries(index).map(([l, e]) => `${l}:${Object.keys(e).length}`).join(' ');
  console.log(`Wrote src/data/learn-locale-index.json (${counts})`);
}
