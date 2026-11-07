# -*- coding: utf-8 -*-
"""
Reuse already-translated template text for Learn guides.

Most Learn guides end with the same closing sections ("Deep dive", "How DomainDiscovery helps",
"Common mistakes", "Practical checklist", "Next steps", "FAQ") and many also carry generic
"Implementation notes", "Examples and scenarios" and "Extra considerations" blocks. Those were
translated once (the closing sections live in the stored translation of the base guide,
the generic blocks in blocks.json). A new guide then only needs its own opening sections.
"""
import json
import os

from lm import ROOT, EN, put

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = 'domain-registration-explained'

# Topic list as written in the base translation, and the cluster phrase used in its "Next steps".
BASE3 = {
    'de': ("Registrierung, Registrar, Registry und ICANN", "im Einsteiger-Bereich"),
    'es': ("Registro, Registrador, Registry e ICANN", "del grupo para principiantes"),
    'fr': ("Enregistrement, Bureau d'enregistrement, Registre et ICANN", "du groupe Débutant"),
    'pt': ("Registro, Registrador, Registry e ICANN", "do grupo Iniciante"),
    'ru': ("регистрация, регистратор, реестр, ICANN", "из раздела для начинающих"),
    'zh': ("注册、注册商、注册局和 ICANN", "入门类别"),
    'ja': ("登録、レジストラ、レジストリ、ICANN", "初級クラスター"),
    'ar': ("التسجيل وجهة التسجيل والسجل وICANN", "مجموعة المبتدئين"),
    'hi': ("रजिस्ट्रेशन, रजिस्ट्रार, रजिस्ट्री, ICANN", "शुरुआती समूह"),
    'bn': ("নিবন্ধন, রেজিস্ট্রার, রেজিস্ট্রি ও ICANN", "নতুনদের গুচ্ছ"),
    'ur': ("رجسٹریشن، رجسٹرار، رجسٹری اور ICANN", "مبتدیوں کے گروپ"),
}

# Category / cluster names. Add a row when a guide uses a category not listed here.
CAT = {
    'Business': {'de': 'Business', 'es': 'Negocios', 'fr': 'Entreprise', 'pt': 'Negócios', 'ru': 'Бизнес', 'zh': '商业', 'ja': 'ビジネス', 'ar': 'الأعمال', 'hi': 'बिज़नेस', 'bn': 'ব্যবসা', 'ur': 'کاروبار'},
    'Technical': {'de': 'Technik', 'es': 'Técnico', 'fr': 'Technique', 'pt': 'Técnico', 'ru': 'Технические темы', 'zh': '技术', 'ja': '技術', 'ar': 'التقنية', 'hi': 'तकनीकी', 'bn': 'প্রযুক্তি', 'ur': 'تکنیکی'},
    'Tools': {'de': 'Werkzeuge', 'es': 'Herramientas', 'fr': 'Outils', 'pt': 'Ferramentas', 'ru': 'Инструменты', 'zh': '工具', 'ja': 'ツール', 'ar': 'الأدوات', 'hi': 'उपकरण', 'bn': 'টুল', 'ur': 'ٹولز'},
    'Beginner': {'de': 'Einsteiger', 'es': 'Principiante', 'fr': 'Débutant', 'pt': 'Iniciante', 'ru': 'Для начинающих', 'zh': '入门', 'ja': '初級', 'ar': 'للمبتدئين', 'hi': 'शुरुआती', 'bn': 'নতুনদের জন্য', 'ur': 'مبتدیوں کے لیے'},
    'Naming': {'de': 'Namensfindung', 'es': 'Nombres', 'fr': 'Nommage', 'pt': 'Nomes', 'ru': 'Нейминг', 'zh': '命名', 'ja': 'ネーミング', 'ar': 'التسمية', 'hi': 'नामकरण', 'bn': 'নামকরণ', 'ur': 'نام رکھنا'},
    'Investing': {'de': 'Investieren', 'es': 'Inversión', 'fr': 'Investissement', 'pt': 'Investimento', 'ru': 'Инвестиции', 'zh': '投资', 'ja': '投資', 'ar': 'الاستثمار', 'hi': 'निवेश', 'bn': 'বিনিয়োগ', 'ur': 'سرمایہ کاری'},
}

# More category names are kept in categories.json (added as new categories are translated).
_extra = os.path.join(HERE, 'categories.json')
if os.path.exists(_extra):
    with open(_extra, encoding='utf-8') as _f:
        CAT.update(json.load(_f))

PHRASE = {
    'de': lambda c: f"im Bereich {c}",
    'es': lambda c: f"del grupo {c}",
    'fr': lambda c: f"du groupe {c}",
    'pt': lambda c: f"do grupo {c}",
    'ru': lambda c: f"из раздела «{c}»",
    'zh': lambda c: f"{c}类别",
    'ja': lambda c: f"{c}クラスター",
    'ar': lambda c: f"مجموعة {c}",
    'hi': lambda c: f"{c} समूह",
    'bn': lambda c: f"{c} গুচ্ছ",
    'ur': lambda c: f"{c} گروپ",
}


def _stored(lang, slug):
    return json.load(open(f'{ROOT}/src/data/learn-locales/{lang}.json', encoding='utf-8'))['articles'][slug]


def _blocks():
    return json.load(open(f'{HERE}/blocks.json', encoding='utf-8'))


def build(slug, lang, T, D, readTime, topics, topics_text, head, extra5='', D_body=None, extras=()):
    """
    head      = the guide's own opening sections as [heading, [paragraphs]]
    extra5    = sentence appended to "How DomainDiscovery helps" paragraph 2 (tool-specific)
    D_body    = description wording used inside the body when it differs from the meta description
    extras    = generic blocks appended after the closing sections, in order:
                'impl', 'examples', or ('extra', N) for "Extra considerations (N)"
    """
    en = EN[slug]
    body_desc = D_body or D
    base = _stored(lang, BASE)
    T3, D3 = base['title'], base['description']
    topics3, clus3 = BASE3[lang]
    cluster = CAT[en['category']][lang]
    new_phrase = PHRASE[lang](cluster)
    tail = []
    for i, sec in enumerate(base['sections'][4:]):
        heading = sec['heading'].replace(T3, T)
        body = []
        for j, p in enumerate(sec['body']):
            q = p.replace(D3, body_desc).replace(T3, T).replace(topics3, topics_text)
            if i == 1 and j == 1 and extra5:
                q = q + ' ' + extra5
            if i == 4 and j == 0:
                assert clus3 in q, (lang, 'cluster phrase missing', q[:80])
                q = q.replace(clus3, new_phrase)
            body.append(q)
        tail.append([heading, body])
    blocks = _blocks()[lang]
    added = []
    for item in extras:
        key, n = (item if isinstance(item, tuple) else (item, None))
        blk = blocks[key]
        heading = blk['heading'].replace('{T}', T).replace('{N}', str(n) if n is not None else '')
        added.append([heading, [p.replace('{T}', T) for p in blk['body']]])
    sections = [list(h) for h in head] + tail + added
    put(slug, lang, T, D, cluster, readTime, topics, sections)


def build_like(slug, lang, T, D, readTime, topics, topics_text, base_slug, extra5='', D_body=None, extras=()):
    """Same as build(), reusing the opening sections of an already-translated sibling guide."""
    base = _stored(lang, base_slug)
    Tb, Db = base['title'], base['description']
    head = []
    for sec in base['sections'][:4]:
        head.append([sec['heading'].replace(Tb, T), [p.replace(Db, D).replace(Tb, T) for p in sec['body']]])
    build(slug, lang, T, D, readTime, topics, topics_text, head, extra5, D_body, extras)
