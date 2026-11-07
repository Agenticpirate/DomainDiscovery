# -*- coding: utf-8 -*-
"""Merge new data into openings.json, categories.json and glossary_topics.json (idempotent)."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def _merge(name, update):
    path = f'{HERE}/{name}'
    data = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    update(data)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def add_openings(cat, per_lang):
    """per_lang = {lang: {'headings': [...4], 'paras': [[...], ...]}}; '{BROWSE}' expands to the shared browse sentence."""
    blocks = json.load(open(f'{HERE}/blocks.json', encoding='utf-8'))
    for lang, v in per_lang.items():
        assert len(v['headings']) == 4 and len(v['paras']) == 4, (cat, lang)
        v['paras'] = [[p.replace('{BROWSE}', blocks[lang]['extra5']['browse']) for p in row] for row in v['paras']]
    _merge('openings.json', lambda d: d.setdefault(cat, {}).update(per_lang))


def add_category_names(cat, names):
    _merge('categories.json', lambda d: d.setdefault(cat, {}).update(names))


def add_glossary(lang_terms):
    """lang_terms = {lang: {english_term: translation}}"""
    def upd(d):
        for lang, terms in lang_terms.items():
            d.setdefault(lang, {}).update(terms)
    _merge('glossary_topics.json', upd)
