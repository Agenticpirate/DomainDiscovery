'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import type { LearnArticle } from '@/lib/learnArticles';

const CATEGORY_ORDER = [
  'Trending',
  'Beginner',
  'Naming',
  'TLDs',
  'Valuation',
  'Investing',
  'Aftermarket',
  'Expired',
  'Sales',
  'Registrars',
  'Technical',
  'SEO',
  'Legal',
  'Security',
  'Tools',
  'Community',
  'Trends',
  'Strategy',
  'Business',
  'Development',
  'Monetization',
  'Pricing',
];

export function LearnCatalog({
  articles,
  categories,
}: {
  articles: LearnArticle[];
  categories: string[];
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  const sortedCategories = useMemo(() => {
    const set = new Set(categories);
    const ordered = CATEGORY_ORDER.filter((c) => c === 'Trending' || set.has(c));
    for (const c of categories) {
      if (!ordered.includes(c) && c !== 'Trending') ordered.push(c);
    }
    return ordered;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (category === 'Trending' && !a.trending) return false;
      if (category !== 'All' && category !== 'Trending' && a.category !== category) return false;
      if (!q) return true;
      const hay = [a.title, a.description, a.category, ...a.topics, a.slug].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [articles, category, query]);

  const chip = (active: boolean) =>
    active
      ? isLight
        ? 'bg-slate-900 text-white border-slate-900'
        : 'bg-white text-black border-white'
      : isLight
        ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
        : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20';

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles — auctions, UDRP, .ai, parking…"
          className={`flex-1 h-11 rounded-xl border px-3.5 text-sm outline-none focus:ring-2 ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-slate-300'
              : 'bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus:ring-white/15'
          }`}
        />
        <div
          className={`h-11 inline-flex items-center rounded-xl border px-3 text-xs font-semibold tabular-nums ${
            isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-white/10 bg-white/[0.03] text-white/55'
          }`}
        >
          {filtered.length} articles
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        <button type="button" onClick={() => setCategory('All')} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${chip(category === 'All')}`}>
          All
        </button>
        {sortedCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${chip(category === c)}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {filtered.map((guide) => (
          <Link
            key={guide.slug}
            href={`/learn/${guide.slug}`}
            className={`group relative block p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm'
                : 'bg-[#0c0c0e] border-white/10 hover:border-white/20 hover:bg-[#121214]'
            }`}
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-2xl sm:text-3xl">{guide.icon}</span>
              <div className="flex items-center gap-1.5">
                {guide.trending && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                    }`}
                  >
                    Trending
                  </span>
                )}
                <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                  {guide.readTime}
                </span>
              </div>
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
              {guide.category}
            </div>
            <h3 className={`text-sm sm:text-lg font-bold mb-1.5 leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {guide.title}
            </h3>
            <p className={`text-[11px] sm:text-sm leading-relaxed mb-2.5 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              {guide.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {guide.topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded ${
                    isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/[0.06] text-white/40'
                  }`}
                >
                  {topic}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`rounded-2xl border p-6 text-sm ${isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-white/10 bg-[#0c0c0e] text-white/50'}`}>
          No articles match that filter. Try another category or keyword.
        </div>
      )}
    </div>
  );
}
