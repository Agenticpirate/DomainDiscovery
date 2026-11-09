/** Markdown for the Learn hub and for guides, including translated guides at /{lang}/learn/{slug}. */
import { learnHubCopy, learnCategoryLabel } from '@/lib/i18n/learnHub';
import { learnArticleUrl } from '@/lib/i18n/metadata';
import {
  extractFaqPairs,
  getArticleDefinition,
  getArticleKeyTakeaways,
  getLearnArticle,
  getLearnArticles,
  getLearnCategories,
  getLearnTranslatedLocales,
  getRelatedArticles,
  isFaqSection,
  isLearnTranslated,
  localizeLearnArticle,
} from '@/lib/learnArticles';
import type { LocaleId } from '@/lib/i18n/locales';
import { bullets, faqBlock, heading, listItem, oneLine, page } from '../format';
import type { MdContext, MdDoc, MdListItem, MdRouteDef } from '../types';

function renderHub(): MdDoc {
  const copy = learnHubCopy('en');
  const articles = getLearnArticles();
  const lines: string[] = [heading(2, copy.definitionQuestion), '', copy.definitionAnswer, ''];
  for (const category of getLearnCategories()) {
    const inCategory = articles.filter((a) => a.category === category);
    if (!inCategory.length) continue;
    lines.push(heading(2, learnCategoryLabel('en', category)), '');
    for (const a of inCategory) lines.push(listItem(a.title, `/learn/${a.slug}`, a.description));
    lines.push('');
  }
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: '/learn',
    markdown: page({
      title: copy.metaTitle,
      summary: copy.metaDescription,
      path: '/learn',
      body: lines.join('\n'),
      related: [
        { text: 'Domain search', href: '/search' },
        { text: 'Domain extensions', href: '/domain-extensions' },
      ],
    }),
  };
}

function renderGuide(ctx: MdContext): MdDoc | null {
  const { slug } = ctx.params;
  const locale: LocaleId = ctx.locale;
  const english = getLearnArticle(slug);
  if (!english || !isLearnTranslated(slug, locale)) return null;
  const article = localizeLearnArticle(english, locale);
  if (!article) return null;

  const parts: string[] = [];
  parts.push(
    bullets([
      `Category: ${article.category}`,
      ...(article.readTime ? [`Read time: ${article.readTime}`] : []),
    ])
  );
  parts.push(heading(2, 'Direct answer'), getArticleDefinition(article));
  const takeaways = getArticleKeyTakeaways(article, 5);
  if (takeaways.length) parts.push(heading(2, 'Key takeaways'), bullets(takeaways));
  for (const section of article.sections) {
    if (!section?.heading) continue;
    parts.push(heading(2, section.heading));
    const pairs = isFaqSection(section) ? extractFaqPairs(section) : [];
    if (pairs.length) {
      parts.push(faqBlock(pairs));
      continue;
    }
    for (const para of section.body || []) {
      if (para?.trim()) parts.push(para.trim());
    }
  }

  const related = getRelatedArticles(english, 4).map((item) => {
    const shown = localizeLearnArticle(item, locale) ?? item;
    const target = isLearnTranslated(item.slug, locale) ? locale : 'en';
    return { text: shown.title, href: learnArticleUrl(target, item.slug) };
  });

  return {
    title: article.title,
    description: oneLine(article.description),
    path: ctx.path,
    lastModified: article.publishedAt ?? null,
    markdown: page({
      title: article.title,
      summary: article.description,
      path: ctx.path,
      updated: article.publishedAt,
      body: parts.join('\n\n'),
      related: [...related, { text: 'All guides', href: '/learn' }],
    }),
  };
}

function listGuides(): MdListItem[] {
  const items: MdListItem[] = [];
  for (const english of getLearnArticles()) {
    items.push({ path: `/learn/${english.slug}`, title: english.title, description: oneLine(english.description) });
    for (const locale of getLearnTranslatedLocales(english.slug)) {
      const shown = localizeLearnArticle(english, locale) ?? english;
      items.push({ path: `/${locale}/learn/${english.slug}`, title: shown.title, description: oneLine(shown.description) });
    }
  }
  return items;
}

export const LEARN_ROUTES: MdRouteDef[] = [
  {
    pattern: '/learn',
    group: 'core',
    render: renderHub,
    list: () => [{ path: '/learn', title: learnHubCopy('en').metaTitle, description: learnHubCopy('en').metaDescription }],
  },
  { pattern: '/learn/[slug]', group: 'guide', render: renderGuide, list: listGuides },
];
