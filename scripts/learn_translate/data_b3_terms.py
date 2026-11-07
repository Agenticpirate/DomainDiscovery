# -*- coding: utf-8 -*-
"""Category names and topic terms for Sales and Valuation (batch b3)."""
from add_data import add_category_names, add_glossary
add_category_names('Sales', {
 'de': 'Verkauf', 'es': 'Ventas', 'fr': 'Vente', 'pt': 'Vendas', 'ru': 'Продажи', 'zh': '销售',
 'ja': '販売', 'ar': 'المبيعات', 'hi': 'बिक्री', 'bn': 'বিক্রয়', 'ur': 'فروخت'})
add_category_names('Valuation', {
 'de': 'Bewertung', 'es': 'Valoración', 'fr': 'Valorisation', 'pt': 'Avaliação', 'ru': 'Оценка', 'zh': '估值',
 'ja': '評価', 'ar': 'التقييم', 'hi': 'मूल्यांकन', 'bn': 'মূল্যায়ন', 'ur': 'تشخیص'})
TERMS = ["Outbound", "Conversion", "Trust", "Economics", "Financing", "Legal", "Valuation", "Market", "Comps"]
T = {
 'de': ["Direktansprache", "Konversion", "Vertrauen", "Wirtschaftlichkeit", "Finanzierung", "Recht", "Bewertung", "Markt", "Vergleichsverkäufe"],
 'es': ["Prospección", "Conversión", "Confianza", "Economía", "Financiación", "Legal", "Valoración", "Mercado", "Comparables"],
 'fr': ["Prospection", "Conversion", "Confiance", "Économie", "Financement", "Juridique", "Valorisation", "Marché", "Comparables"],
 'pt': ["Prospecção", "Conversão", "Confiança", "Economia", "Financiamento", "Jurídico", "Avaliação", "Mercado", "Comparáveis"],
 'ru': ["Исходящие продажи", "Конверсия", "Доверие", "Экономика", "Финансирование", "Право", "Оценка", "Рынок", "Сопоставимые продажи"],
 'zh': ["主动外联", "转化", "信任", "经济性", "融资", "法律", "估值", "市场", "可比成交"],
 'ja': ["アウトバウンド", "コンバージョン", "信頼", "収益性", "ファイナンス", "法務", "評価", "市場", "比較事例"],
 'ar': ["التواصل الصادر", "التحويل", "الثقة", "الاقتصاديات", "التمويل", "القانون", "التقييم", "السوق", "المبيعات المماثلة"],
 'hi': ["आउटबाउंड", "कन्वर्ज़न", "भरोसा", "अर्थशास्त्र", "फ़ाइनेंसिंग", "कानूनी", "मूल्यांकन", "बाज़ार", "तुलनीय बिक्री"],
 'bn': ["আউটবাউন্ড", "কনভার্সন", "আস্থা", "অর্থনীতি", "ফাইন্যান্সিং", "আইনি", "মূল্যায়ন", "বাজার", "তুলনীয় বিক্রি"],
 'ur': ["آؤٹ باؤنڈ", "کنورژن", "اعتماد", "معاشیات", "فنانسنگ", "قانونی", "تشخیص", "مارکیٹ", "مماثل فروخت"],
}
add_glossary({lang: dict(zip(TERMS, vals)) for lang, vals in T.items()})
