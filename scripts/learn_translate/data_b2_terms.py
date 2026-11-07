# -*- coding: utf-8 -*-
"""Category names and topic terms for the TLDs and Security categories."""
from add_data import add_category_names, add_glossary

add_category_names('TLDs', {
 'de': 'TLDs', 'es': 'TLD', 'fr': 'TLD', 'pt': 'TLDs', 'ru': 'Доменные зоны', 'zh': '顶级域',
 'ja': 'TLD', 'ar': 'الامتدادات', 'hi': 'TLD', 'bn': 'TLD', 'ur': 'TLD'})
add_category_names('Security', {
 'de': 'Sicherheit', 'es': 'Seguridad', 'fr': 'Sécurité', 'pt': 'Segurança', 'ru': 'Безопасность', 'zh': '安全',
 'ja': 'セキュリティ', 'ar': 'الأمان', 'hi': 'सुरक्षा', 'bn': 'নিরাপত্তা', 'ur': 'سیکیورٹی'})

TERMS = ["TLD", "Extensions", "gTLD", "TLDs", "Pricing", "Startups", "Nonprofit", "Registries", "Compliance",
         "WHOIS privacy", "RDAP", "Registration", "Risk", "Brands", "Abuse", "Trademarks", "Privacy"]
T = {
 'de': ["TLD", "Endungen", "gTLD", "TLDs", "Preise", "Startups", "Gemeinnützige", "Registries", "Compliance", "WHOIS-Datenschutz", "RDAP", "Registrierung", "Risiko", "Marken", "Missbrauch", "Markenrechte", "Datenschutz"],
 'es': ["TLD", "Extensiones", "gTLD", "TLD", "Precios", "Startups", "Sin ánimo de lucro", "Registros", "Cumplimiento", "Privacidad WHOIS", "RDAP", "Registro", "Riesgo", "Marcas", "Abuso", "Marcas registradas", "Privacidad"],
 'fr': ["TLD", "Extensions", "gTLD", "TLD", "Prix", "Start-up", "Associations", "Registres", "Conformité", "Confidentialité WHOIS", "RDAP", "Enregistrement", "Risque", "Marques", "Abus", "Marques déposées", "Confidentialité"],
 'pt': ["TLD", "Extensões", "gTLD", "TLDs", "Preços", "Startups", "Sem fins lucrativos", "Registros", "Conformidade", "Privacidade do WHOIS", "RDAP", "Registro", "Risco", "Marcas", "Abuso", "Marcas registradas", "Privacidade"],
 'ru': ["TLD", "Расширения", "gTLD", "Доменные зоны", "Цены", "Стартапы", "Некоммерческие организации", "Реестры", "Соответствие требованиям", "Приватность WHOIS", "RDAP", "Регистрация", "Риск", "Бренды", "Злоупотребления", "Товарные знаки", "Приватность"],
 'zh': ["TLD", "后缀", "gTLD", "顶级域", "价格", "初创公司", "非营利组织", "注册局", "合规", "WHOIS 隐私", "RDAP", "注册", "风险", "品牌", "滥用", "商标", "隐私"],
 'ja': ["TLD", "拡張子", "gTLD", "TLD", "価格", "スタートアップ", "非営利団体", "レジストリ", "コンプライアンス", "WHOISプライバシー", "RDAP", "登録", "リスク", "ブランド", "不正利用", "商標", "プライバシー"],
 'ar': ["TLD", "الامتدادات", "gTLD", "الامتدادات العليا", "الأسعار", "الشركات الناشئة", "المنظمات غير الربحية", "السجلات", "الامتثال", "خصوصية WHOIS", "RDAP", "التسجيل", "المخاطر", "العلامات", "إساءة الاستخدام", "العلامات التجارية", "الخصوصية"],
 'hi': ["TLD", "एक्सटेंशन", "gTLD", "TLD", "कीमतें", "स्टार्टअप", "गैर-लाभकारी संस्थाएँ", "रजिस्ट्री", "अनुपालन", "WHOIS प्राइवेसी", "RDAP", "रजिस्ट्रेशन", "जोखिम", "ब्रांड", "दुरुपयोग", "ट्रेडमार्क", "प्राइवेसी"],
 'bn': ["TLD", "এক্সটেনশন", "gTLD", "TLD", "দাম", "স্টার্টআপ", "অলাভজনক সংস্থা", "রেজিস্ট্রি", "সম্মতি", "WHOIS গোপনীয়তা", "RDAP", "নিবন্ধন", "ঝুঁকি", "ব্র্যান্ড", "অপব্যবহার", "ট্রেডমার্ক", "গোপনীয়তা"],
 'ur': ["TLD", "ایکسٹینشنز", "gTLD", "TLD", "قیمتیں", "اسٹارٹ اپس", "غیر منافع بخش ادارے", "رجسٹریاں", "تعمیل", "WHOIS پرائیویسی", "RDAP", "رجسٹریشن", "خطرہ", "برانڈز", "غلط استعمال", "ٹریڈ مارک", "پرائیویسی"],
}
for lang, vals in T.items():
    assert len(vals) == len(TERMS), (lang, len(vals))
add_glossary({lang: dict(zip(TERMS, vals)) for lang, vals in T.items()})
print('terms added')
