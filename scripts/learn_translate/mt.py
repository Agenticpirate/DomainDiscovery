# -*- coding: utf-8 -*-
"""
Machine-translation engine for the long-tail Learn guides (local NLLB-200 via CTranslate2; nothing leaves this machine).

    ~/.cache/dd-mt-venv/bin/python mt.py translate <lang> [--limit N] [--slugs a,b]   # fills cache/<lang>.json
    ~/.cache/dd-mt-venv/bin/python mt.py assemble                                      # writes locale files

translate : translates every unique English sentence of the untranslated guides (resumable, cached per language)
assemble  : builds title/description/sections for every guide and writes it via lm.put (all 11 languages)
"""
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
MODEL = os.path.expanduser('~/.cache/nllb13-ct2')
CACHE_DIR = os.path.join(HERE, 'cache')
LANGS = ['de', 'es', 'fr', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi', 'bn', 'ur']
CODES = {'de': 'deu_Latn', 'es': 'spa_Latn', 'fr': 'fra_Latn', 'pt': 'por_Latn', 'ru': 'rus_Cyrl', 'zh': 'zho_Hans',
         'ja': 'jpn_Jpan', 'ar': 'arb_Arab', 'hi': 'hin_Deva', 'bn': 'ben_Beng', 'ur': 'urd_Arab'}

# Terms the model mistranslates. Replaced by a Latin sentinel before translation and by the localized term afterwards.
# (sentinel, english regex, {lang: localized})
TERMS = [
    ('ESCROWX', r'\bescrow(?:s)?\b', {'de': 'Escrow', 'es': 'escrow', 'fr': 'séquestre', 'pt': 'escrow', 'ru': 'эскроу', 'zh': '托管',
                                       'ja': 'エスクロー', 'ar': 'خدمة الضمان', 'hi': 'एस्क्रो', 'bn': 'এসক্রো', 'ur': 'ایسکرو'}),
    ('REGISTRARX', r'\bregistrar\b', {'de': 'Registrar', 'es': 'registrador', 'fr': 'registraire', 'pt': 'registrador', 'ru': 'регистратор',
                                       'zh': '注册商', 'ja': 'レジストラ', 'ar': 'المسجّل', 'hi': 'रजिस्ट्रार', 'bn': 'রেজিস্ট্রার', 'ur': 'رجسٹرار'}),
    ('REGISTRARXS', r'\bregistrars\b', {'de': 'Registrare', 'es': 'registradores', 'fr': 'registraires', 'pt': 'registradores', 'ru': 'регистраторы',
                                         'zh': '注册商', 'ja': 'レジストラ', 'ar': 'المسجّلون', 'hi': 'रजिस्ट्रार', 'bn': 'রেজিস্ট্রাররা', 'ur': 'رجسٹرارز'}),
]
BRAND = 'DomainDiscovery'
BRAND_FIX = {'ja': ['ドメインディスカバリー', 'ドメイン・ディスカバリー'], 'ur': ['ڈومین ڈسکوری'], 'ar': ['دومين ديسكفري', 'دوميندسكفري'],
             'ru': ['ДоменДискавери', 'Домен Дискавери'], 'zh': ['域名发现'], 'hi': ['डोमेन डिस्कवरी'], 'bn': ['ডোমেন ডিসকভারি']}

_SENT_SPLIT = re.compile(r'(?<=[.!?])\s+(?=[A-Z0-9“"(\[/])')


def split_sentences(text):
    return [s for s in _SENT_SPLIT.split(text.strip()) if s]


def protect(text, lang):
    for sent, rx, _ in TERMS:
        text = re.sub(rx, sent + ('' if sent.endswith('XS') else ''), text, flags=re.I)
    return text


def restore(text, lang):
    for sent, _, loc in sorted(TERMS, key=lambda t: -len(t[0])):
        text = re.sub(sent, loc[lang], text, flags=re.I)
    for bad in BRAND_FIX.get(lang, []):
        text = text.replace(bad, BRAND)
    return text


def post(text, lang):
    t = text.strip()
    if lang == 'zh':
        t = re.sub(r'\s*([,;:!?])\s*', lambda m: {',': '，', ';': '；', ':': '：', '!': '！', '?': '？'}[m.group(1)], t)
        t = re.sub(r'\s*\.\s*$', '。', t)
        t = re.sub(r'(?<=[\u4e00-\u9fff])\.\s*', '。', t)
        t = re.sub(r'([\u4e00-\u9fff])([A-Za-z0-9])', r'\1 \2', t)
        t = re.sub(r'([A-Za-z0-9])([\u4e00-\u9fff])', r'\1 \2', t)
        t = re.sub(r'\(', '（', t)
        t = re.sub(r'\)', '）', t)
    elif lang == 'ja':
        t = re.sub(r'\s*,\s*', '、', t)
        t = re.sub(r'\s*\.\s*$', '。', t)
        t = re.sub(r'(?<=[\u3040-\u30ff\u4e00-\u9fff])\s+(?=[\u3040-\u30ff\u4e00-\u9fff])', '', t)
        t = re.sub(r'([\u3040-\u30ff\u4e00-\u9fff])([A-Za-z0-9])', r'\1 \2', t)
        t = re.sub(r'([A-Za-z0-9])([\u3040-\u30ff\u4e00-\u9fff])', r'\1 \2', t)
        if not re.search(r'[。！？)）」]$', t):
            t += '。'
    elif lang == 'ur':
        t = re.sub(r'\s*,\s*', '، ', t)
        t = re.sub(r'\s*\.\s*$', '۔', t)
    elif lang == 'ar':
        t = re.sub(r'\s*,\s*', '، ', t)
    t = re.sub(r'\s{2,}', ' ', t)
    return restore(t, lang)


def english_units():
    """Yield every English string that needs translating for untranslated guides."""
    en = json.load(open(f'{ROOT}/src/data/learn-articles.json', encoding='utf-8'))['articles']
    done = set(json.load(open(f'{ROOT}/src/data/learn-locales/de.json', encoding='utf-8'))['articles'])
    return [a for a in en if a['slug'] not in done]


def sentences_of(article):
    out = [article['title']]
    # description minus trailing boilerplate sentence is translated as "short"
    out.append(short_desc(article))
    for sec in article['sections']:
        out.append(sec['heading'])
        for p in sec['body']:
            out.extend(split_sentences(p))
    return out


BOILER_EN = 'Learn practical steps, risks, and DomainDiscovery workflows for domain name search and registration research.'


def short_desc(article):
    d = article['description']
    return d[: -len(BOILER_EN)].strip() if d.endswith(BOILER_EN) else d


def cache_path(lang):
    os.makedirs(CACHE_DIR, exist_ok=True)
    return os.path.join(CACHE_DIR, f'{lang}.json')


def load_cache(lang):
    p = cache_path(lang)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}


def save_cache(lang, cache):
    tmp = cache_path(lang) + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False)
    os.replace(tmp, cache_path(lang))


def missing_tokens(src, out):
    """Count protected tokens (paths, acronyms, digits) from the source that are absent in the output."""
    miss = 0
    for tok in re.findall(r'/[a-z0-9][a-z0-9\-/\.]*', src):
        if tok.rstrip('.') not in out:
            miss += 1
    for tok in set(re.findall(r'\b[A-Z][A-Z0-9]{1,6}\b', src)):
        if tok in ('Q', 'A', 'FAQ', 'ESCROWX', 'REGISTRARX', 'REGISTRARXS', 'I', 'II', 'III', 'IV', 'OK'):
            continue
        if tok not in out:
            miss += 1
    return miss


def bad_output(src, out):
    if not out.strip():
        return True
    if missing_tokens(src, out):
        return True
    return len(out) / max(len(src), 1) < 0.18  # drastically truncated


def translate_lang(lang, limit=None, slugs=None, batch=32):
    import ctranslate2
    import sentencepiece as spm
    articles = english_units()
    if slugs:
        articles = [a for a in articles if a['slug'] in slugs]
    if limit:
        articles = articles[:limit]
    cache = load_cache(lang)
    todo, seen = [], set()
    for a in articles:
        for s in sentences_of(a):
            if s not in cache and s not in seen:
                seen.add(s)
                todo.append(s)
    print(f'[{lang}] {len(todo)} sentences to translate', flush=True)
    if not todo:
        return
    tr = ctranslate2.Translator(MODEL, device='cpu', compute_type='int8', inter_threads=1, intra_threads=int(os.environ.get('MT_THREADS', '8')))
    sp = spm.SentencePieceProcessor()
    sp.load(MODEL + '/sentencepiece.bpe.model')
    tgt = CODES[lang]
    # sort by length so batches pad little
    todo.sort(key=len)
    t0 = time.time()
    for i in range(0, len(todo), batch):
        chunk = todo[i:i + batch]
        srcs = [['eng_Latn'] + sp.encode(protect(s, lang), out_type=str)[:250] + ['</s>'] for s in chunk]
        res = tr.translate_batch(srcs, target_prefix=[[tgt]] * len(srcs), beam_size=4, max_decoding_length=300,
                                 repetition_penalty=1.1, no_repeat_ngram_size=0)
        for s, r in zip(chunk, res):
            out = sp.decode(r.hypotheses[0][1:])
            if bad_output(s, out):
                best = out
                for kw in ({'beam_size': 8, 'length_penalty': 1.6}, {'beam_size': 6, 'length_penalty': 1.0, 'repetition_penalty': 1.3}):
                    r2 = tr.translate_batch([['eng_Latn'] + sp.encode(protect(s, lang), out_type=str)[:250] + ['</s>']], target_prefix=[[tgt]],
                                            max_decoding_length=300, **kw)
                    cand = sp.decode(r2[0].hypotheses[0][1:])
                    key = lambda x: (missing_tokens(s, x), len(x) / max(len(s), 1) < 0.18, -len(x))
                    if key(cand) < key(best):
                        best = cand
                    if not bad_output(s, best):
                        break
                out = best
            cache[s] = post(out, lang)
        if (i // batch) % 10 == 0:
            save_cache(lang, cache)
            done = i + len(chunk)
            rate = done / (time.time() - t0)
            print(f'[{lang}] {done}/{len(todo)}  {rate:.1f} sent/s  eta {(len(todo) - done) / rate / 60:.0f} min', flush=True)
    save_cache(lang, cache)
    print(f'[{lang}] done in {(time.time() - t0) / 60:.1f} min', flush=True)


def assemble(dry=False):
    sys.path.insert(0, HERE)
    import catlib
    import tpl
    from lm import put
    blocks = json.load(open(f'{HERE}/blocks.json', encoding='utf-8'))
    caches = {l: load_cache(l) for l in LANGS}
    ok_slugs, skipped = [], []
    for a in english_units():
        needed = sentences_of(a)
        if any(s not in caches[l] for l in LANGS for s in needed):
            skipped.append(a['slug'])
            continue
        if a['category'] not in tpl.CAT:
            raise SystemExit(f"missing category name for {a['category']}: add to categories.json")
        missing = [t for t in a['topics'] if any(t not in catlib._json('glossary_topics.json')[l] for l in LANGS)]
        if missing:
            raise SystemExit(f"{a['slug']}: add glossary topics {missing}")
        ok_slugs.append(a['slug'])
        if dry:
            continue
        for l in LANGS:
            c = caches[l]
            joiner = '' if l in ('zh', 'ja') else ' '
            sections = []
            for sec in a['sections']:
                body = [joiner.join(c[x] for x in split_sentences(p)) for p in sec['body']]
                sections.append((c[sec['heading']], body))
            short = c[short_desc(a)]
            desc = short + ' ' + blocks[l]['boiler'] if a['description'].endswith(BOILER_EN) else short
            put(a['slug'], l, c[a['title']], desc, tpl.CAT[a['category']][l], catlib.read_time(a['slug'], l),
                catlib.glossary_topics(a['slug'], l), sections)
    print(f'assembled {len(ok_slugs)} guides; skipped (cache incomplete) {len(skipped)}')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'assemble':
        assemble(dry='--dry' in sys.argv)
    if cmd == 'translate':
        lang = sys.argv[2]
        limit = None
        slugs = None
        if '--limit' in sys.argv:
            limit = int(sys.argv[sys.argv.index('--limit') + 1])
        if '--slugs' in sys.argv:
            slugs = set(sys.argv[sys.argv.index('--slugs') + 1].split(','))
        translate_lang(lang, limit, slugs)
