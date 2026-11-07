# -*- coding: utf-8 -*-
"""
Run a batch of category-template translations.

    python3 run_batch.py <batch-name> [lang ...]

Reads batches/<batch-name>/<lang>.txt, one guide per line:  slug||title||short summary
Topic tags come from glossary_topics.json. Run `node scripts/check-learn-locales.mjs` afterwards.
"""
import os
import sys

import catlib

HERE = os.path.dirname(os.path.abspath(__file__))
ALL = ['de', 'es', 'fr', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi', 'bn', 'ur']


def main():
    batch = sys.argv[1]
    langs = sys.argv[2:] or ALL
    for lang in langs:
        path = f'{HERE}/batches/{batch}/{lang}.txt'
        if not os.path.exists(path):
            print('skip (no file):', path)
            continue
        with open(path, encoding='utf-8') as f:
            rows = [l.strip() for l in f if l.strip() and not l.startswith('#')]
        for row in rows:
            parts = row.split('||')
            assert len(parts) == 3, f'{lang}: bad row: {row[:60]}'
            slug, title, short = (x.strip() for x in parts)
            catlib.run(slug, lang, title, short)


if __name__ == '__main__':
    main()
