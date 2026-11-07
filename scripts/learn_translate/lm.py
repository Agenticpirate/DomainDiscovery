# -*- coding: utf-8 -*-
"""
Merge helper for Learn translations.

put() validates a translation against the English article (same number of sections and
paragraphs, same number of topics) and writes it into src/data/learn-locales/<lang>.json.
Run `node scripts/check-learn-locales.mjs` afterwards.
"""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
EN = {x['slug']: x for x in json.load(open(f'{ROOT}/src/data/learn-articles.json', encoding='utf-8'))['articles']}


def put(slug, lang, title, description, category, readTime, topics, sections):
    en = EN[slug]
    assert len(sections) == len(en['sections']), f"{slug}/{lang}: sections {len(sections)} != {len(en['sections'])}"
    out = []
    for i, (h, body) in enumerate(sections):
        assert len(body) == len(en['sections'][i]['body']), (
            f"{slug}/{lang}: section {i} paras {len(body)} != {len(en['sections'][i]['body'])}"
        )
        assert h.strip() and all(b.strip() for b in body), f"{slug}/{lang}: empty text in section {i}"
        out.append({'heading': h, 'body': body})
    assert len(topics) == len(en['topics']), f"{slug}/{lang}: topics {len(topics)} != {len(en['topics'])}"
    path = f'{ROOT}/src/data/learn-locales/{lang}.json'
    data = json.load(open(path, encoding='utf-8'))
    data.setdefault('articles', {})[slug] = {
        'title': title,
        'description': description,
        'category': category,
        'topics': topics,
        'readTime': readTime,
        'sections': out,
    }
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('ok', slug, lang)
