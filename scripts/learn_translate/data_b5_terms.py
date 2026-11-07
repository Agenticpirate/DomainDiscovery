# -*- coding: utf-8 -*-
"""Category names and topic terms (batch b5)."""
from add_data import add_category_names, add_glossary
L = ['de', 'es', 'fr', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi', 'bn', 'ur']
def cats(name, vals):
    add_category_names(name, dict(zip(L, vals)))
cats('Registrars', ['Registrare', 'Registradores', 'Registraires', 'Registradores', 'Регистраторы', '注册商', 'レジストラ', 'المسجّلون', 'रजिस्ट्रार', 'রেজিস্ট্রার', 'رجسٹرارز'])
cats('Community', ['Community', 'Comunidad', 'Communauté', 'Comunidade', 'Сообщество', '社区', 'コミュニティ', 'المجتمع', 'समुदाय', 'কমিউনিটি', 'کمیونٹی'])
cats('Trends', ['Trends', 'Tendencias', 'Tendances', 'Tendências', 'Тренды', '趋势', 'トレンド', 'الاتجاهات', 'रुझान', 'প্রবণতা', 'رجحانات'])
cats('Strategy', ['Strategie', 'Estrategia', 'Stratégie', 'Estratégia', 'Стратегия', '策略', '戦略', 'الاستراتيجية', 'रणनीति', 'কৌশল', 'حکمت عملی'])
cats('Monetization', ['Monetarisierung', 'Monetización', 'Monétisation', 'Monetização', 'Монетизация', '变现', '収益化', 'تحقيق الدخل', 'मुद्रीकरण', 'মুদ্রায়ন', 'منیٹائزیشن'])
cats('SEO', ['SEO'] * 11)
cats('Development', ['Entwicklung', 'Desarrollo', 'Développement', 'Desenvolvimento', 'Разработка', '开发', '開発', 'التطوير', 'डेवलपमेंट', 'ডেভেলপমেন্ট', 'ڈویلپمنٹ'])
TERMS = ["Cloudflare", "How-to", "Community", "Learning", "Interviews", "News", "Strategy", "Content", "Parking", "Revenue", "Traffic"]
T = {
 'de': ["Cloudflare", "Anleitung", "Community", "Lernen", "Interviews", "Nachrichten", "Strategie", "Inhalte", "Parking", "Einnahmen", "Traffic"],
 'es': ["Cloudflare", "Cómo hacerlo", "Comunidad", "Aprendizaje", "Entrevistas", "Noticias", "Estrategia", "Contenido", "Parking", "Ingresos", "Tráfico"],
 'fr': ["Cloudflare", "Mode d'emploi", "Communauté", "Apprentissage", "Entretiens", "Actualités", "Stratégie", "Contenu", "Parking", "Revenus", "Trafic"],
 'pt': ["Cloudflare", "Passo a passo", "Comunidade", "Aprendizado", "Entrevistas", "Notícias", "Estratégia", "Conteúdo", "Parking", "Receita", "Tráfego"],
 'ru': ["Cloudflare", "Инструкция", "Сообщество", "Обучение", "Интервью", "Новости", "Стратегия", "Контент", "Парковка", "Доход", "Трафик"],
 'zh': ["Cloudflare", "操作指南", "社区", "学习", "访谈", "资讯", "策略", "内容", "域名停放", "收入", "流量"],
 'ja': ["Cloudflare", "ハウツー", "コミュニティ", "学習", "インタビュー", "ニュース", "戦略", "コンテンツ", "パーキング", "収益", "トラフィック"],
 'ar': ["Cloudflare", "دليل خطوة بخطوة", "المجتمع", "التعلم", "المقابلات", "الأخبار", "الاستراتيجية", "المحتوى", "ركن النطاق", "الإيرادات", "الزيارات"],
 'hi': ["Cloudflare", "कैसे करें", "समुदाय", "सीखना", "इंटरव्यू", "समाचार", "रणनीति", "कंटेंट", "पार्किंग", "राजस्व", "ट्रैफ़िक"],
 'bn': ["Cloudflare", "কীভাবে করবেন", "কমিউনিটি", "শেখা", "সাক্ষাৎকার", "সংবাদ", "কৌশল", "কনটেন্ট", "পার্কিং", "রাজস্ব", "ট্রাফিক"],
 'ur': ["Cloudflare", "کیسے کریں", "کمیونٹی", "سیکھنا", "انٹرویوز", "خبریں", "حکمت عملی", "مواد", "پارکنگ", "آمدنی", "ٹریفک"],
}
add_glossary({lang: dict(zip(TERMS, vals)) for lang, vals in T.items()})
