# -*- coding: utf-8 -*-
"""
One-time (idempotent) extraction:
  - openings.json  : category opening sections, with {T} / {D} placeholders, taken from stored translations
  - blocks.json    : adds 'boiler' (summary boilerplate) and 'extra5' (tool-specific sentences) per language
Run from this folder:  python3 extract_openings.py
"""
import json
import os

from lm import ROOT, EN
from catlib import OPENING_BASE, EXTRA5_EN, HERE
import tpl

LANGS = ['zh', 'de', 'es', 'ja', 'fr', 'pt', 'hi', 'ar', 'ru', 'bn', 'ur']

# Boilerplate sentence that ends most Learn descriptions (English: "Learn practical steps, risks, and
# DomainDiscovery workflows for domain name search and registration research.")
BOILER = {
    'de': "Lernen Sie praktische Schritte, Risiken und DomainDiscovery-Abläufe für Domainnamen-Suche und Registrierungsrecherche kennen.",
    'es': "Aprende pasos prácticos, riesgos y flujos de trabajo de DomainDiscovery para la búsqueda de nombres de dominio y la investigación del registro.",
    'fr': "Découvrez des étapes pratiques, les risques et les processus DomainDiscovery pour la recherche de nom de domaine et la préparation de l'enregistrement.",
    'pt': "Conheça passos práticos, riscos e fluxos de trabalho do DomainDiscovery para a pesquisa de nome de domínio e a preparação do registro.",
    'ru': "Узнайте о практических шагах, рисках и процессах DomainDiscovery для поиска доменных имён и подготовки регистрации.",
    'zh': "了解实用步骤、风险，以及 DomainDiscovery 在域名查询和注册调研方面的工作流程。",
    'ja': "ドメイン名検索と登録調査のための、実践的な手順、リスク、DomainDiscoveryの使い方を学びましょう。",
    'ar': "تعرّف على خطوات عملية ومخاطر وسير عمل DomainDiscovery للبحث عن أسماء النطاقات والبحث قبل التسجيل.",
    'hi': "डोमेन नाम खोज और रजिस्ट्रेशन शोध के लिए व्यावहारिक कदम, जोखिम और DomainDiscovery के कार्यप्रवाह जानें।",
    'bn': "ডোমেইন নাম অনুসন্ধান ও নিবন্ধন গবেষণার জন্য ব্যবহারিক ধাপ, ঝুঁকি এবং DomainDiscovery-র কর্মপ্রবাহ জানুন।",
    'ur': "ڈومین نام کی تلاش اور رجسٹریشن کی تحقیق کے لیے عملی اقدامات، خطرات اور DomainDiscovery کے ورک فلو جانیں۔",
}

# New translation: "Browse 1,600+ extensions in the domain extensions catalog at /domain-extensions
# and the TLD encyclopedia at /blog/tlds."
BROWSE = {
    'de': "Stöbern Sie unter /domain-extensions im Katalog der Domain-Endungen und unter /blog/tlds in der TLD-Enzyklopädie unter mehr als 1.600 Endungen.",
    'es': "Explora más de 1600 extensiones en el catálogo de extensiones de dominio en /domain-extensions y en la enciclopedia de TLD en /blog/tlds.",
    'fr': "Parcourez plus de 1 600 extensions dans le catalogue des extensions de domaine sur /domain-extensions et dans l'encyclopédie des TLD sur /blog/tlds.",
    'pt': "Explore mais de 1.600 extensões no catálogo de extensões de domínio em /domain-extensions e na enciclopédia de TLDs em /blog/tlds.",
    'ru': "Просматривайте более 1 600 расширений в каталоге доменных расширений на /domain-extensions и в энциклопедии зон на /blog/tlds.",
    'zh': "在 /domain-extensions 的域名后缀目录和 /blog/tlds 的 TLD 百科中浏览 1,600 多个后缀。",
    'ja': "/domain-extensions のドメイン拡張子カタログと、/blog/tlds のTLD百科で、1,600以上の拡張子を閲覧できます。",
    'ar': "تصفّح أكثر من 1,600 امتداد في فهرس امتدادات النطاقات على /domain-extensions وفي موسوعة الامتدادات على /blog/tlds.",
    'hi': "/domain-extensions पर डोमेन एक्सटेंशन कैटलॉग और /blog/tlds पर TLD विश्वकोश में 1,600 से अधिक एक्सटेंशन देखें।",
    'bn': "/domain-extensions-এর ডোমেইন এক্সটেনশন ক্যাটালগ এবং /blog/tlds-এর TLD বিশ্বকোষে ১,৬০০-র বেশি এক্সটেনশন ঘুরে দেখুন।",
    'ur': "/domain-extensions پر ڈومین ایکسٹینشن کیٹلاگ اور /blog/tlds پر TLD انسائیکلوپیڈیا میں 1,600 سے زیادہ ایکسٹینشنز دیکھیں۔",
}

EXTRA5_SOURCE = {
    'paste': 'bulk-domain-search-guide',
    'brainstorm': 'ai-domain-name-generator-guide',
    'geo': 'geo-domains-local-seo',
}


def stored(lang, slug):
    with open(f'{ROOT}/src/data/learn-locales/{lang}.json', encoding='utf-8') as f:
        return json.load(f)['articles'][slug]


def sec5p1(article):
    for sec in article['sections']:
        pass
    # "How DomainDiscovery helps" is always section index 5 in templated guides (opening 4 + deep dive + helps)
    return article['sections'][5]['body'][1]


def main():
    openings = {}
    blocks = tpl._blocks()
    for cat, base_slug in OPENING_BASE.items():
        openings[cat] = {}
        for lang in LANGS:
            art = stored(lang, base_slug)
            T = art['title']
            D = art['sections'][0]['body'][0]
            heads, paras = [], []
            for i, sec in enumerate(art['sections'][:4]):
                heads.append(sec['heading'].replace(T, '{T}'))
                row = []
                for j, p in enumerate(sec['body']):
                    q = '{D}' if (i == 0 and j == 0) else p.replace(T, '{T}').replace(D, '{D}')
                    row.append(q)
                paras.append(row)
            # round trip: re-applying the placeholders must give back the stored text
            for i, sec in enumerate(art['sections'][:4]):
                assert heads[i].replace('{T}', T) == sec['heading'], (cat, lang, i)
                for j, p in enumerate(sec['body']):
                    assert paras[i][j].replace('{D}', D).replace('{T}', T) == p, (cat, lang, i, j)
            openings[cat][lang] = {'headings': heads, 'paras': paras}

    base3_cache = {lang: stored(lang, tpl.BASE) for lang in LANGS}
    for lang in LANGS:
        b3 = base3_cache[lang]
        b3_p1 = sec5p1(b3)
        extra5 = {}
        for key, src in EXTRA5_SOURCE.items():
            art = stored(lang, src)
            Dbody = EN_BODY_DESC(src, art)
            prefix = b3_p1.replace(b3['description'], Dbody).replace(b3['title'], art['title'])
            p1 = sec5p1(art)
            assert p1.startswith(prefix), (lang, key)
            extra5[key] = p1[len(prefix):].strip()
        extra5['browse'] = BROWSE[lang]
        blocks[lang]['boiler'] = BOILER[lang]
        blocks[lang]['extra5'] = extra5

    with open(f'{HERE}/openings.json', 'w', encoding='utf-8') as f:
        json.dump(openings, f, ensure_ascii=False, indent=2)
    with open(f'{HERE}/blocks.json', 'w', encoding='utf-8') as f:
        json.dump(blocks, f, ensure_ascii=False, indent=2)
    print('openings for', sorted(openings), 'x', len(LANGS), 'languages; blocks updated')


def EN_BODY_DESC(slug, art):
    """The description wording used inside the body of the stored article (first paragraph of section 0)."""
    return art['sections'][0]['body'][0]


if __name__ == '__main__':
    main()
