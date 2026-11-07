# -*- coding: utf-8 -*-
"""Category names and topic terms for Aftermarket, Legal, Expired (batch b4)."""
from add_data import add_category_names, add_glossary
add_category_names('Aftermarket', {
 'de': 'Aftermarket', 'es': 'Mercado secundario', 'fr': 'Marché secondaire', 'pt': 'Mercado secundário', 'ru': 'Вторичный рынок', 'zh': '二级市场',
 'ja': 'アフターマーケット', 'ar': 'السوق الثانوية', 'hi': 'आफ्टरमार्केट', 'bn': 'আফটারমার্কেট', 'ur': 'آفٹر مارکیٹ'})
add_category_names('Legal', {
 'de': 'Recht', 'es': 'Legal', 'fr': 'Juridique', 'pt': 'Jurídico', 'ru': 'Право', 'zh': '法律',
 'ja': '法務', 'ar': 'قانوني', 'hi': 'कानूनी', 'bn': 'আইনি', 'ur': 'قانونی'})
add_category_names('Expired', {
 'de': 'Abgelaufene Domains', 'es': 'Caducados', 'fr': 'Domaines expirés', 'pt': 'Expirados', 'ru': 'Истёкшие домены', 'zh': '过期域名',
 'ja': '期限切れ', 'ar': 'المنتهية', 'hi': 'एक्सपायर्ड', 'bn': 'মেয়াদোত্তীর্ণ', 'ur': 'ایکسپائرڈ'})
TERMS = ["Auctions", "Distribution", "Marketplaces", "Disputes", "Ethics", "TMCH", "Expired", "Lifecycle", "Due Diligence"]
T = {
 'de': ["Auktionen", "Vertrieb", "Marktplätze", "Streitfälle", "Ethik", "TMCH", "Abgelaufen", "Lebenszyklus", "Due Diligence"],
 'es': ["Subastas", "Distribución", "Marketplaces", "Disputas", "Ética", "TMCH", "Caducados", "Ciclo de vida", "Debida diligencia"],
 'fr': ["Enchères", "Distribution", "Places de marché", "Litiges", "Éthique", "TMCH", "Expirés", "Cycle de vie", "Vérification préalable"],
 'pt': ["Leilões", "Distribuição", "Marketplaces", "Disputas", "Ética", "TMCH", "Expirados", "Ciclo de vida", "Due diligence"],
 'ru': ["Аукционы", "Дистрибуция", "Маркетплейсы", "Споры", "Этика", "TMCH", "Истёкшие", "Жизненный цикл", "Проверка благонадёжности"],
 'zh': ["拍卖", "分销", "交易平台", "纠纷", "道德", "TMCH", "过期", "生命周期", "尽职调查"],
 'ja': ["オークション", "流通", "マーケットプレイス", "紛争", "倫理", "TMCH", "期限切れ", "ライフサイクル", "デューデリジェンス"],
 'ar': ["المزادات", "التوزيع", "الأسواق", "النزاعات", "الأخلاقيات", "TMCH", "المنتهية", "دورة الحياة", "العناية الواجبة"],
 'hi': ["नीलामी", "वितरण", "मार्केटप्लेस", "विवाद", "नैतिकता", "TMCH", "एक्सपायर्ड", "जीवनचक्र", "ड्यू डिलिजेंस"],
 'bn': ["নিলাম", "বিতরণ", "মার্কেটপ্লেস", "বিরোধ", "নৈতিকতা", "TMCH", "মেয়াদোত্তীর্ণ", "জীবনচক্র", "ডিউ ডিলিজেন্স"],
 'ur': ["نیلامی", "ڈسٹری بیوشن", "مارکیٹ پلیسز", "تنازعات", "اخلاقیات", "TMCH", "ایکسپائرڈ", "لائف سائیکل", "ڈیو ڈیلیجنس"],
}
add_glossary({lang: dict(zip(TERMS, vals)) for lang, vals in T.items()})
