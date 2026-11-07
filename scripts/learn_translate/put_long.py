# -*- coding: utf-8 -*-
"""
Load hand-written translations of long guides, one file per guide and language:
    batches/long/<slug>/<lang>.json  ->  {"title": "...", "description": "...", "sections": [["heading", ["para", ...]], ...]}
Category name, read time and topic tags are filled in from the shared tables.

    python3 put_long.py            # load every file present (idempotent)
    python3 put_long.py <slug>     # load one guide
"""
import json
import os
import re
import sys

import catlib
import tpl
from lm import put

HERE = os.path.dirname(os.path.abspath(__file__))
LONG = os.path.join(HERE, 'batches', 'long')


def load(slug):
    folder = os.path.join(LONG, slug)
    en = catlib.EN[slug]
    for name in sorted(os.listdir(folder)):
        if not name.endswith('.json'):
            continue
        lang = name[:-5]
        d = json.load(open(os.path.join(folder, name), encoding='utf-8'))
        sections = [list(s) for s in d['sections']]
        # Trailing shared blocks ("Implementation notes for …", "Examples and scenarios", "Extra considerations (N)")
        # are filled from blocks.json, so the file only needs the guide's own sections.
        for sec in en['sections'][len(sections):]:
            sections.append(shared_block(sec['heading'], lang, d['title']))
        put(slug, lang, d['title'], d['description'], tpl.CAT[en['category']][lang], catlib.read_time(slug, lang),
            catlib.glossary_topics(slug, lang), sections)


def shared_block(heading, lang, title):
    blocks = json.load(open(os.path.join(HERE, 'blocks.json'), encoding='utf-8'))[lang]
    m = re.match(r'Extra considerations \((\d+)\)$', heading)
    if heading.startswith('Implementation notes for'):
        blk, n = blocks['impl'], None
    elif heading == 'Examples and scenarios':
        blk, n = blocks['examples'], None
    elif m:
        blk, n = blocks['extra'], m.group(1)
    else:
        raise SystemExit(f'no shared block for section "{heading}" ({lang}); translate it in the file')
    h = blk['heading'].replace('{T}', title).replace('{N}', n or '')
    return [h, [p.replace('{T}', title) for p in blk['body']]]


def load_multi(folder_name):
    """Folders starting with '_' hold several guides per language file: {"<slug>": {title, description, sections}}."""
    folder = os.path.join(LONG, folder_name)
    for name in sorted(os.listdir(folder)):
        if not name.endswith('.json'):
            continue
        lang = name[:-5]
        for slug, d in json.load(open(os.path.join(folder, name), encoding='utf-8')).items():
            load_one(slug, lang, d)


def load_one(slug, lang, d):
    en = catlib.EN[slug]
    sections = [list(s) for s in d['sections']]
    for sec in en['sections'][len(sections):]:
        sections.append(shared_block(sec['heading'], lang, d['title']))
    # "short" = the guide's own summary; the standard closing sentence is appended like the English source.
    desc = d.get('description')
    if desc is None:
        boiler = json.load(open(os.path.join(HERE, 'blocks.json'), encoding='utf-8'))[lang]['boiler']
        desc = f"{d['short']} {boiler}" if en['description'].endswith(BOILER_EN) else d['short']
    put(slug, lang, d['title'], desc, tpl.CAT[en['category']][lang], catlib.read_time(slug, lang),
        catlib.glossary_topics(slug, lang), sections)


BOILER_EN = 'Learn practical steps, risks, and DomainDiscovery workflows for domain name search and registration research.'


if __name__ == '__main__':
    names = sys.argv[1:] or sorted(os.listdir(LONG))
    for s in names:
        if s.startswith('_'):
            load_multi(s)
        else:
            load(s)
