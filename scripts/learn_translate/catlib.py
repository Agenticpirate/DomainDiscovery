# -*- coding: utf-8 -*-
"""
Category-template translation for Learn guides.

Every templated Learn guide is built from: a title, a one-line summary, topic tags, a category opening
(4 sections, identical for every guide in the category), shared closing sections, and optional generic blocks.
Openings live in openings.json (one per category and language). Closing sections come from the stored
translation of the base guide (see tpl.py). A guide therefore only needs: title, short summary, topics.

    from catlib import run
    run('the-radio-test-brandable-domains', 'de', 'Titel', 'Kurzbeschreibung.', ['Thema 1', 'Thema 2'])
"""
import json
import os
import re

import tpl
from lm import ROOT, EN

HERE = os.path.dirname(os.path.abspath(__file__))

# Guide that holds the reference translation of each category opening.
OPENING_BASE = {
    'Investing': 'domain-investing',
    'Naming': 'choosing-domain',
    'Technical': 'whois-lookup-guide',
    'Tools': 'bulk-domain-search-guide',
    'Business': 'geo-domains-local-seo',
    'Beginner': 'domain-registration-explained',
}

# English sentence appended to "How DomainDiscovery helps" paragraph 2, keyed by variant name.
EXTRA5_EN = {
    'paste': 'Paste up to 100 names into bulk search at /bulk-search to check a shortlist in one pass.',
    'brainstorm': 'Brainstorm brandable alternatives with the AI domain generator at /generator when .com is taken.',
    'geo': 'Build city and country name lists with the geo domain generator at /tools/geo, then export CSV for bulk checks.',
    'browse': 'Browse 1,600+ extensions in the domain extensions catalog at /domain-extensions and the TLD encyclopedia at /blog/tlds.',
}

READ_FMT = {
    'de': '{n} Min. Lesezeit', 'es': '{n} min de lectura', 'fr': '{n} min de lecture', 'pt': '{n} min de leitura',
    'ru': '{n} мин чтения', 'zh': '阅读约 {n} 分钟', 'ja': '読了目安 {n}分', 'ar': 'القراءة: {n} دقائق',
    'hi': 'पढ़ने में {n} मिनट', 'bn': 'পড়তে {n} মিনিট', 'ur': 'پڑھنے میں {n} منٹ',
}
BN_DIGITS = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')


def read_time(slug, lang):
    n = re.match(r'(\d+)', EN[slug]['readTime']).group(1)
    if lang == 'bn':
        n = n.translate(BN_DIGITS)
    return READ_FMT[lang].format(n=n)


def join_topics(lang, items):
    if len(items) == 1:
        return items[0]
    if lang == 'de':
        return ', '.join(items[:-1]) + ' und ' + items[-1]
    if lang == 'es':
        conj = ' e ' if re.match(r'(?i)^(i|hi)', items[-1]) else ' y '
        return ', '.join(items[:-1]) + conj + items[-1]
    if lang == 'fr':
        return ', '.join(items[:-1]) + ' et ' + items[-1]
    if lang == 'pt':
        return ', '.join(items[:-1]) + ' e ' + items[-1]
    if lang in ('ru', 'hi'):
        return ', '.join(items)
    if lang == 'zh':
        joined = '、'.join(items[:-1]) + '和' + items[-1]
        # keep a space between Chinese text and Latin words (SEO, ICANN, ...)
        joined = re.sub(r'([\u4e00-\u9fff])([A-Za-z])', r'\1 \2', joined)
        return re.sub(r'([A-Za-z])([\u4e00-\u9fff])', r'\1 \2', joined)
    if lang == 'ja':
        return '、'.join(items)
    if lang == 'ar':
        return ' و'.join(items)
    if lang == 'bn':
        return ', '.join(items[:-1]) + ' ও ' + items[-1]
    if lang == 'ur':
        return '، '.join(items[:-1]) + ' اور ' + items[-1]
    raise KeyError(lang)


def _json(name):
    with open(f'{HERE}/{name}', encoding='utf-8') as f:
        return json.load(f)


def extra5_variant(slug):
    """Which tool-specific sentence (if any) the English guide appends to 'How DomainDiscovery helps'."""
    for sec in EN[slug]['sections']:
        if sec['heading'] == 'How DomainDiscovery helps':
            tail = sec['body'][1]
            for key, sentence in EXTRA5_EN.items():
                if tail.endswith(sentence):
                    return key
    return None


def extras_for(slug):
    heads = [s['heading'] for s in EN[slug]['sections']]
    out = []
    if any(h.startswith('Implementation notes for') for h in heads):
        out.append('impl')
    if any(h == 'Examples and scenarios' for h in heads):
        out.append('examples')
    return tuple(out)


def glossary_topics(slug, lang):
    gl = _json('glossary_topics.json')[lang]
    missing = [t for t in EN[slug]['topics'] if t not in gl]
    assert not missing, f'{slug}: add to glossary_topics.json for {lang}: {missing}'
    return [gl[t] for t in EN[slug]['topics']]


def run(slug, lang, title, short, topics=None):
    topics = topics or glossary_topics(slug, lang)
    en = EN[slug]
    cat = en['category']
    opening = _json('openings.json')[cat][lang]
    boiler = _json('blocks.json')[lang]['boiler']
    # Most guides end their description with the same boilerplate sentence; a few use the summary alone.
    full = short if en['description'] == en['sections'][0]['body'][0] else f'{short} {boiler}'
    head = []
    for h, paras in zip(opening['headings'], opening['paras']):
        head.append([h.replace('{T}', title), [p.replace('{D}', short).replace('{T}', title) for p in paras]])
    variant = extra5_variant(slug)
    extra5 = _json('blocks.json')[lang]['extra5'][variant] if variant else ''
    tpl.build(
        slug, lang, title, full, read_time(slug, lang), topics, join_topics(lang, topics),
        head, extra5, short, extras_for(slug),
    )
