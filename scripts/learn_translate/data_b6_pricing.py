# -*- coding: utf-8 -*-
"""Pricing category opening (4 sections: 3/1/1/1 paragraphs) for all languages."""
from add_data import add_openings

P = {}
P['de'] = {'headings': ["Preisthema: {T}", "Premium oder Standard", "Fair vergleichen", "Tipps fürs Budget"], 'paras': [
 ["{D}", "Domainpreise haben mehrere Ebenen: Großhandelspreis der Registry, Einzelhandelspreis des Registrars, Premium-Stufen der Registry, Aftermarket-Preisvorstellungen und Rabatte im ersten Jahr. Für die laufenden Kosten zählt der Verlängerungspreis.", "Vergleichen Sie reguläre Preise verschiedener Registrare und lesen Sie das Kleingedruckte zu Wiederherstellung und Transfer."],
 ["Standardnamen folgen normalen Preislisten. Premium-Namen können höhere Registrierungs- und/oder Verlängerungspreise haben, die Registries oder Aftermarket-Inhaber festlegen. Prüfen Sie beide Jahre, bevor Sie ein „Schnäppchen“ feiern."],
 ["Rechnen Sie Währungen um, berücksichtigen Sie ICANN-Gebühren, sofern ausgewiesen, und trennen Sie optionale Datenschutz- oder Hosting-Pakete heraus. Nutzen Sie /tools/compare auf DomainDiscovery als Recherchehilfe und prüfen Sie dann im Live-Warenkorb."],
 ["Zahlen Sie für den Hauptnamen, unter dem Ihre Marke läuft; seien Sie bei spekulativen Extras zurückhaltend. Stellen Sie Kalendererinnerungen 30 Tage vor jeder Verlängerung ein."]]}
P['es'] = {'headings': ["Tema de precios: {T}", "Premium frente a estándar", "Cómo comparar con justicia", "Consejos de presupuesto"], 'paras': [
 ["{D}", "Los precios de los dominios tienen capas: precio mayorista del registro, precio minorista del registrador, niveles premium del registro, precios pedidos en el mercado secundario y descuentos del primer año. El precio de renovación es la cifra que importa para el coste de mantenerlo.", "Compara los precios habituales entre registradores y lee la letra pequeña sobre redenciones y transferencias."],
 ["Los nombres estándar siguen las tarifas normales. Los premium pueden tener precios de alta o de renovación más altos fijados por el registro o por propietarios del mercado secundario. Confirma ambos años antes de celebrar una «ganga»."],
 ["Unifica la moneda, incluye las tasas de ICANN cuando aparezcan y separa los paquetes opcionales de privacidad o alojamiento. Usa /tools/compare en DomainDiscovery como ayuda para investigar y luego verifica en carritos reales."],
 ["Paga por el nombre principal que vas a usar como marca y sé prudente con los extras especulativos. Pon recordatorios en el calendario 30 días antes de cada renovación."]]}
P['fr'] = {'headings': ["Sujet tarifaire : {T}", "Premium ou standard", "Comparer équitablement", "Conseils budgétaires"], 'paras': [
 ["{D}", "Le prix d'un domaine se compose de plusieurs couches : tarif de gros du registre, prix de détail du registraire, paliers premium du registre, prix demandés sur le marché secondaire et remises de première année. Le prix de renouvellement est celui qui compte pour le coût de détention.", "Comparez les tarifs habituels entre registraires et lisez les petits caractères sur la restauration et les transferts."],
 ["Les noms standard suivent les grilles normales. Les noms premium peuvent coûter plus cher à la création et/ou au renouvellement, selon les registres ou les propriétaires du marché secondaire. Vérifiez les deux années avant de crier à la « bonne affaire »."],
 ["Ramenez tout à la même devise, incluez les frais ICANN lorsqu'ils sont affichés et séparez les options de confidentialité ou d'hébergement. Utilisez /tools/compare sur DomainDiscovery comme aide à la recherche, puis vérifiez dans de vrais paniers."],
 ["Payez pour le nom principal qui portera votre marque et restez prudent sur les extras spéculatifs. Programmez des rappels 30 jours avant chaque renouvellement."]]}
P['pt'] = {'headings': ["Tema de preços: {T}", "Premium ou padrão", "Como comparar de forma justa", "Dicas de orçamento"], 'paras': [
 ["{D}", "O preço de um domínio tem camadas: atacado do registro, varejo do registrador, faixas premium do registro, valores pedidos no mercado secundário e descontos do primeiro ano. O preço de renovação é o número que importa para o custo de manter o domínio.", "Compare os preços regulares entre registradores e leia as letras miúdas sobre resgate e transferências."],
 ["Nomes padrão seguem a tabela normal. Nomes premium podem ter preços de registro e/ou renovação mais altos, definidos por registros ou donos no mercado secundário. Confirme os dois anos antes de comemorar uma «pechincha»."],
 ["Converta para a mesma moeda, inclua as taxas da ICANN quando aparecerem e separe pacotes opcionais de privacidade ou hospedagem. Use /tools/compare no DomainDiscovery como apoio à pesquisa e depois confirme em carrinhos reais."],
 ["Pague pelo nome principal que levará sua marca e seja cauteloso com extras especulativos. Crie lembretes na agenda 30 dias antes de cada renovação."]]}
P['ru'] = {'headings': ["Тема цен: {T}", "Премиум или стандарт", "Как сравнивать честно", "Советы по бюджету"], 'paras': [
 ["{D}", "Цена домена складывается из слоёв: оптовая цена реестра, розничная цена регистратора, премиальные уровни реестра, запросы продавцов на вторичном рынке и скидки на первый год. Для расходов на владение важна цена продления.", "Сравнивайте обычные цены разных регистраторов и читайте мелкий шрифт о восстановлении и переносе."],
 ["Стандартные имена продаются по обычному тарифу. У премиум-имён цена регистрации и/или продления может быть выше — её устанавливают реестры или владельцы на вторичном рынке. Проверьте оба года, прежде чем радоваться «выгодной сделке»."],
 ["Приведите цены к одной валюте, учтите сборы ICANN, если они указаны, и отделите необязательные пакеты приватности или хостинга. Используйте /tools/compare на DomainDiscovery как подспорье в исследовании, а затем проверяйте в реальной корзине."],
 ["Платите за основное имя, под которым будет работать бренд, и осторожнее относитесь к спекулятивным дополнениям. Ставьте напоминания в календаре за 30 дней до продления."]]}
P['zh'] = {'headings': ["价格专题：{T}", "高端与标准", "如何公平比较", "预算建议"], 'paras': [
 ["{D}", "域名价格分为多个层次：注册局批发价、注册商零售价、注册局高端价格档、二级市场报价以及首年促销折扣。对持有成本而言，最重要的是续费价格。", "比较各注册商的常规价格，并留意关于赎回和转移的细则。"],
 ["标准域名按常规价目表收费。高端域名的注册和/或续费价格可能更高，由注册局或二级市场持有人设定。庆祝“捡到便宜”之前，先确认两年的价格。"],
 ["统一币种，显示时计入 ICANN 费用，并把可选的隐私或主机套餐单独列出。把 DomainDiscovery 的 /tools/compare 当作调研辅助，再到实际购物车中核实。"],
 ["把钱花在你要用作品牌的主域名上，对投机性的额外域名保持克制。在每次续费前 30 天设置日历提醒。"]]}
P['ja'] = {'headings': ["価格のテーマ：{T}", "プレミアムと標準の違い", "公平に比較するには", "予算のコツ"], 'paras': [
 ["{D}", "ドメインの価格には層があります。レジストリの卸売価格、レジストラの小売価格、レジストリのプレミアム価格帯、アフターマーケットの希望価格、初年度の割引です。保有コストを左右するのは更新料です。", "レジストラごとの通常価格を比べ、償還や移管に関する細かな条件も読みましょう。"],
 ["標準の名前は通常の料金表に従います。プレミアムの名前は、レジストリやアフターマーケットの所有者が決めた高い登録料や更新料がかかることがあります。「お買い得」と喜ぶ前に、2 年分を確認しましょう。"],
 ["通貨をそろえ、表示があれば ICANN 手数料を含め、オプションのプライバシー保護やホスティングのセットは分けて考えます。DomainDiscovery の /tools/compare を調査の補助として使い、実際のカートで確認しましょう。"],
 ["ブランドとして使うメインの名前にはお金をかけ、投機的な追加分には慎重になりましょう。更新の 30 日前にカレンダーのリマインダーを設定します。"]]}
P['ar'] = {'headings': ["موضوع الأسعار: {T}", "المميز مقابل العادي", "كيف تقارن بإنصاف", "نصائح للميزانية"], 'paras': [
 ["{D}", "لأسعار النطاقات طبقات: سعر الجملة لدى السجل، وسعر التجزئة لدى المسجّل، والفئات المميزة لدى السجل، والأسعار المطلوبة في السوق الثانوية، وخصومات السنة الأولى. وسعر التجديد هو الرقم المهم لتكلفة الاحتفاظ.", "قارن الأسعار المعتادة بين المسجّلين واقرأ التفاصيل الدقيقة الخاصة بالاسترداد والنقل."],
 ["تخضع الأسماء العادية للجداول المعتادة. أما الأسماء المميزة فقد تحمل أسعار تسجيل و/أو تجديد أعلى يحددها السجل أو مالكو السوق الثانوية. تحقق من السنتين قبل أن تحتفل بـ«صفقة»."],
 ["وحّد العملة، وأدرج رسوم ICANN عند ظهورها، وافصل باقات الخصوصية أو الاستضافة الاختيارية. استخدم ‎/tools/compare على DomainDiscovery كأداة مساعدة للبحث، ثم تحقق في سلال الشراء الفعلية."],
 ["ادفع مقابل الاسم الرئيسي الذي ستبني عليه علامتك، وكن متحفظًا في الإضافات التخمينية. اضبط تذكيرات في التقويم قبل 30 يومًا من كل تجديد."]]}
P['hi'] = {'headings': ["कीमत का विषय: {T}", "प्रीमियम बनाम स्टैंडर्ड", "निष्पक्ष तुलना कैसे करें", "बजट के सुझाव"], 'paras': [
 ["{D}", "डोमेन की कीमत में कई परतें होती हैं: रजिस्ट्री की थोक कीमत, रजिस्ट्रार की खुदरा कीमत, रजिस्ट्री के प्रीमियम स्तर, आफ्टरमार्केट में माँगी गई कीमत और पहले साल की छूट। डोमेन रखने की लागत के लिए रिन्यूअल कीमत ही असली संख्या है।", "अलग-अलग रजिस्ट्रारों की सामान्य कीमतों की तुलना करें और रिडेम्प्शन व ट्रांसफ़र की बारीक शर्तें पढ़ें।"],
 ["स्टैंडर्ड नाम सामान्य कीमत सूची पर चलते हैं। प्रीमियम नामों की रजिस्ट्रेशन और/या रिन्यूअल कीमत ज़्यादा हो सकती है, जो रजिस्ट्री या आफ्टरमार्केट मालिक तय करते हैं। “सस्ता सौदा” मानने से पहले दोनों साल की कीमत पक्की करें।"],
 ["मुद्रा को एक जैसा करें, दिखने पर ICANN शुल्क जोड़ें और वैकल्पिक गोपनीयता या होस्टिंग पैकेज अलग रखें। DomainDiscovery पर /tools/compare को शोध की मदद के रूप में इस्तेमाल करें, फिर असली कार्ट में पुष्टि करें।"],
 ["उस मुख्य नाम पर पैसा लगाएँ जिसे आप ब्रांड बनाएँगे; अटकल वाले अतिरिक्त नामों पर संयम रखें। हर रिन्यूअल से 30 दिन पहले कैलेंडर रिमाइंडर लगाएँ।"]]}
P['bn'] = {'headings': ["দামের বিষয়: {T}", "প্রিমিয়াম বনাম স্ট্যান্ডার্ড", "ন্যায্যভাবে তুলনা করার উপায়", "বাজেটের পরামর্শ"], 'paras': [
 ["{D}", "ডোমেনের দামে কয়েকটি স্তর থাকে: রেজিস্ট্রির পাইকারি দাম, রেজিস্ট্রারের খুচরা দাম, রেজিস্ট্রির প্রিমিয়াম স্তর, আফটারমার্কেটে চাওয়া দাম এবং প্রথম বছরের ছাড়। ডোমেন রাখার খরচের জন্য নবায়নের দামই আসল সংখ্যা।", "বিভিন্ন রেজিস্ট্রারের সাধারণ দাম তুলনা করুন এবং রিডেম্পশন ও ট্রান্সফারের শর্তগুলো খুঁটিয়ে পড়ুন।"],
 ["স্ট্যান্ডার্ড নাম সাধারণ মূল্যতালিকা মেনে চলে। প্রিমিয়াম নামের নিবন্ধন এবং/অথবা নবায়নের দাম বেশি হতে পারে, যা রেজিস্ট্রি বা আফটারমার্কেটের মালিক ঠিক করেন। “সস্তা চুক্তি” ভেবে খুশি হওয়ার আগে দুই বছরের দামই নিশ্চিত করুন।"],
 ["মুদ্রা একই করুন, দেখানো হলে ICANN ফি যোগ করুন এবং ঐচ্ছিক গোপনীয়তা বা হোস্টিং প্যাকেজ আলাদা রাখুন। DomainDiscovery-র /tools/compare গবেষণার সহায়ক হিসেবে ব্যবহার করুন, তারপর আসল কার্টে যাচাই করুন।"],
 ["যে মূল নামে ব্র্যান্ড গড়বেন তার জন্য খরচ করুন; অনুমাননির্ভর বাড়তি নামে সংযমী হোন। প্রতিটি নবায়নের ৩০ দিন আগে ক্যালেন্ডারে রিমাইন্ডার দিন।"]]}
P['ur'] = {'headings': ["قیمت کا موضوع: {T}", "پریمیم بمقابلہ عام", "منصفانہ موازنہ کیسے کریں", "بجٹ کے مشورے"], 'paras': [
 ["{D}", "ڈومین کی قیمت کی کئی تہیں ہیں: رجسٹری کی تھوک قیمت، رجسٹرار کی خوردہ قیمت، رجسٹری کے پریمیم درجے، آفٹر مارکیٹ میں مانگی گئی قیمت اور پہلے سال کی رعایت۔ ڈومین رکھنے کی لاگت کے لیے تجدید کی قیمت ہی اصل عدد ہے۔", "مختلف رجسٹرارز کی عام قیمتوں کا موازنہ کریں اور ریڈمپشن اور ٹرانسفر کی باریک شرائط پڑھیں۔"],
 ["عام نام معمول کی قیمتوں پر چلتے ہیں۔ پریمیم ناموں کی رجسٹریشن اور/یا تجدید کی قیمت زیادہ ہو سکتی ہے جو رجسٹری یا آفٹر مارکیٹ کے مالکان طے کرتے ہیں۔ “سستا سودا” سمجھنے سے پہلے دونوں سال کی قیمت کی تصدیق کریں۔"],
 ["کرنسی یکساں کریں، نظر آئے تو ICANN فیس شامل کریں اور اختیاری رازداری یا ہوسٹنگ پیکجز الگ رکھیں۔ DomainDiscovery پر ‎/tools/compare کو تحقیق میں مدد کے طور پر استعمال کریں، پھر اصل کارٹ میں تصدیق کریں۔"],
 ["اس بنیادی نام پر خرچ کریں جس پر آپ برانڈ بنائیں گے؛ قیاسی اضافی ناموں میں محتاط رہیں۔ ہر تجدید سے 30 دن پہلے کیلنڈر میں یاد دہانی لگائیں۔"]]}

add_openings('Pricing', P)
