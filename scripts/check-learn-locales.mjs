/**
 * New Learn articles must exist in every language folder file.
 * Backlog articles published before 2026-10-25 are exempt until they are edited.
 *
 * Usage: node scripts/check-learn-locales.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['zh', 'de', 'es', 'ja', 'fr', 'pt', 'hi', 'ar', 'ru', 'bn', 'ur'];
const CUTOFF = '2026-10-25';

const english = JSON.parse(readFileSync(join(root, 'src/data/learn-articles.json'), 'utf8'));
const packs = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(readFileSync(join(root, `src/data/learn-locales/${locale}.json`), 'utf8')).articles || {},
  ])
);

const failures = [];

for (const article of english.articles) {
  // New articles need every language. Backlog articles may be translated one language at a
  // time; each language that is present must still match the English structure.
  const required = !article.publishedAt || article.publishedAt >= CUTOFF;
  const present = LOCALES.filter((locale) => packs[locale][article.slug]);
  const toCheck = required ? LOCALES : present;

  for (const locale of toCheck) {
    const copy = packs[locale][article.slug];
    if (!copy?.title || !copy?.description || !Array.isArray(copy.sections) || copy.sections.length !== article.sections.length) {
      failures.push(
        `${article.slug} [${locale}] needs title, description, and ${article.sections.length} sections`
      );
      continue;
    }
    copy.sections.forEach((section, index) => {
      const source = article.sections[index];
      if (!section.heading || !Array.isArray(section.body) || section.body.length !== source.body.length) {
        failures.push(`${article.slug} [${locale}] section ${index + 1} does not match the English section`);
      }
    });
  }
}

if (failures.length) {
  console.error(`Learn locale check failed (${failures.length}):`);
  for (const line of failures.slice(0, 40)) console.error(`- ${line}`);
  if (failures.length > 40) console.error(`…and ${failures.length - 40} more`);
  process.exit(1);
}

console.log(`Learn locale check passed. New articles on or after ${CUTOFF} must exist in ${LOCALES.join(', ')}.`);
