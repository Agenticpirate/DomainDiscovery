import type { LocaleId } from './locales';

export type LibraryChrome = {
  by: string;
  educational: string;
  researchNotCheckout: string;
  contents: string;
  quickAnswer: string;
  covers: string;
  takeaways: string;
  tryTools: string;
  tryToolsBody: string;
  searchDomains: string;
  allGuides: string;
  faq: string;
  topicCluster: string;
  clusterHub: string;
  allClusters: string;
  continueLearning: string;
  trending: string;
  readTime: string;
  home: string;
  blog: string;
  encyclopedia: string;
  aboutTld: string;
  whoCanRegister: string;
  restrictions: string;
  length: string;
  charactersBefore: string;
  canUse: string;
  cannotUse: string;
  features: string;
  registry: string;
  sponsor: string;
  registrationServices: string;
  whoisServer: string;
  rdapServer: string;
  rootZone: string;
  recordUpdated: string;
  nameServers: string;
  whoisLookup: string;
  comparePrices: string;
  backToEncyclopedia: string;
};

const chrome: Record<Exclude<LocaleId, 'en'>, LibraryChrome> = {
  zh: {
    by: '作者', educational: '教育指南 · 免费工具', researchNotCheckout: '用于研究，不是注册结账', contents: '目录', quickAnswer: '简要回答', covers: '本指南涵盖', takeaways: '要点', tryTools: '试用 DomainDiscovery 工具', tryToolsBody: 'DomainDiscovery 提供免费域名查询、地理列表、WHOIS、批量检查和比价，无需账号。', searchDomains: '查询域名', allGuides: '全部指南', faq: '常见问题', topicCluster: '主题组', clusterHub: '主题中心', allClusters: '全部主题', continueLearning: '继续阅读', trending: '热门', readTime: '分钟阅读', home: '首页', blog: '博客', encyclopedia: '后缀百科', aboutTld: '关于 {tld} 域名', whoCanRegister: '谁可以注册 {tld} 域名？', restrictions: '注册限制', length: '长度', charactersBefore: '个字符（{tld} 前面的名称）', canUse: '可以使用', cannotUse: '不能使用', features: '功能', registry: '注册局信息', sponsor: '主办方 / 管理者', registrationServices: '注册服务', whoisServer: 'WHOIS 服务器', rdapServer: 'RDAP 服务器', rootZone: '根区注册', recordUpdated: '记录更新', nameServers: '域名服务器', whoisLookup: 'WHOIS 查询', comparePrices: '比较价格', backToEncyclopedia: '返回百科',
  },
  de: {
    by: 'Von', educational: 'Ratgeber · kostenlose Tools', researchNotCheckout: 'Recherche, kein Registrar-Checkout', contents: 'Inhalt', quickAnswer: 'Kurze Antwort', covers: 'Das behandelt dieser Ratgeber', takeaways: 'Das Wichtigste', tryTools: 'DomainDiscovery-Tools testen', tryToolsBody: 'DomainDiscovery ist kostenlose Domainsuche plus Geo-Listen, WHOIS, Massenprüfung und Preisvergleich — ohne Konto.', searchDomains: 'Domains suchen', allGuides: 'Alle Ratgeber', faq: 'FAQ', topicCluster: 'Themengruppe', clusterHub: 'Themenzentrale', allClusters: 'Alle Gruppen', continueLearning: 'Weiterlesen', trending: 'Gefragt', readTime: 'Min. Lesezeit', home: 'Start', blog: 'Blog', encyclopedia: 'TLD-Lexikon', aboutTld: 'Über {tld}-Domains', whoCanRegister: 'Wer kann {tld}-Domains registrieren?', restrictions: 'Registrierungsregeln', length: 'Länge', charactersBefore: 'Zeichen (Name vor {tld})', canUse: 'Erlaubt', cannotUse: 'Nicht erlaubt', features: 'Funktionen', registry: 'Registry-Angaben', sponsor: 'Sponsor / Verwalter', registrationServices: 'Registrierungsdienste', whoisServer: 'WHOIS-Server', rdapServer: 'RDAP-Server', rootZone: 'Root-Zone-Eintrag', recordUpdated: 'Datensatz aktualisiert', nameServers: 'Nameserver', whoisLookup: 'WHOIS-Abfrage', comparePrices: 'Preise vergleichen', backToEncyclopedia: 'Zum Lexikon',
  },
  es: {
    by: 'Por', educational: 'Guía educativa · herramientas gratis', researchNotCheckout: 'Investigación, no es el pago del registrador', contents: 'Contenido', quickAnswer: 'Respuesta breve', covers: 'Qué cubre esta guía', takeaways: 'Puntos clave', tryTools: 'Pruebe las herramientas de DomainDiscovery', tryToolsBody: 'DomainDiscovery es búsqueda gratuita de dominios, listas geográficas, WHOIS, comprobación masiva y comparación de precios, sin cuenta.', searchDomains: 'Buscar dominios', allGuides: 'Todas las guías', faq: 'Preguntas', topicCluster: 'Grupo temático', clusterHub: 'Centro del grupo', allClusters: 'Todos los grupos', continueLearning: 'Seguir leyendo', trending: 'Tendencia', readTime: 'min de lectura', home: 'Inicio', blog: 'Blog', encyclopedia: 'Enciclopedia de TLD', aboutTld: 'Sobre los dominios {tld}', whoCanRegister: '¿Quién puede registrar dominios {tld}?', restrictions: 'Restricciones de registro', length: 'Longitud', charactersBefore: 'caracteres (nombre antes de {tld})', canUse: 'Se puede usar', cannotUse: 'No se puede usar', features: 'Funciones', registry: 'Información del registro', sponsor: 'Patrocinador / gestor', registrationServices: 'Servicios de registro', whoisServer: 'Servidor WHOIS', rdapServer: 'Servidor RDAP', rootZone: 'Registro en la zona raíz', recordUpdated: 'Registro actualizado', nameServers: 'Servidores de nombres', whoisLookup: 'Consulta WHOIS', comparePrices: 'Comparar precios', backToEncyclopedia: 'Volver a la enciclopedia',
  },
  ja: {
    by: '著者', educational: '学習ガイド · 無料ツール', researchNotCheckout: '調査用。レジストラの決済ではありません', contents: '目次', quickAnswer: '短い答え', covers: 'このガイドの内容', takeaways: '要点', tryTools: 'DomainDiscovery のツールを試す', tryToolsBody: 'DomainDiscovery は無料のドメイン検索、地理リスト、WHOIS、一括確認、価格比較です。アカウントは不要です。', searchDomains: 'ドメインを検索', allGuides: 'すべてのガイド', faq: 'よくある質問', topicCluster: 'トピック', clusterHub: 'トピックの中心', allClusters: 'すべてのトピック', continueLearning: '続けて読む', trending: '注目', readTime: '分で読めます', home: 'ホーム', blog: 'ブログ', encyclopedia: 'TLD 百科', aboutTld: '{tld} ドメインについて', whoCanRegister: '{tld} ドメインを登録できる人', restrictions: '登録の制限', length: '長さ', charactersBefore: '文字（{tld} の前の名前）', canUse: '使えるもの', cannotUse: '使えないもの', features: '機能', registry: 'レジストリ情報', sponsor: 'スポンサー / 管理者', registrationServices: '登録サービス', whoisServer: 'WHOIS サーバー', rdapServer: 'RDAP サーバー', rootZone: 'ルートゾーン登録', recordUpdated: '記録の更新', nameServers: 'ネームサーバー', whoisLookup: 'WHOIS 検索', comparePrices: '価格を比較', backToEncyclopedia: '百科に戻る',
  },
  fr: {
    by: 'Par', educational: 'Guide · outils gratuits', researchNotCheckout: 'Recherche, pas le paiement du bureau', contents: 'Sommaire', quickAnswer: 'Réponse courte', covers: 'Ce que couvre ce guide', takeaways: 'À retenir', tryTools: 'Essayer les outils DomainDiscovery', tryToolsBody: 'DomainDiscovery, c’est la recherche gratuite de domaines, les listes géo, le WHOIS, le contrôle en lot et la comparaison de prix, sans compte.', searchDomains: 'Chercher des domaines', allGuides: 'Tous les guides', faq: 'FAQ', topicCluster: 'Groupe de sujets', clusterHub: 'Centre du groupe', allClusters: 'Tous les groupes', continueLearning: 'Continuer', trending: 'Tendance', readTime: 'min de lecture', home: 'Accueil', blog: 'Blog', encyclopedia: 'Encyclopédie des TLD', aboutTld: 'À propos des domaines {tld}', whoCanRegister: 'Qui peut enregistrer des domaines {tld} ?', restrictions: 'Restrictions d’enregistrement', length: 'Longueur', charactersBefore: 'caractères (nom avant {tld})', canUse: 'Autorisé', cannotUse: 'Interdit', features: 'Fonctions', registry: 'Informations du registre', sponsor: 'Sponsor / gestionnaire', registrationServices: 'Services d’enregistrement', whoisServer: 'Serveur WHOIS', rdapServer: 'Serveur RDAP', rootZone: 'Inscription dans la zone racine', recordUpdated: 'Enregistrement mis à jour', nameServers: 'Serveurs de noms', whoisLookup: 'Recherche WHOIS', comparePrices: 'Comparer les prix', backToEncyclopedia: 'Retour à l’encyclopédie',
  },
  pt: {
    by: 'Por', educational: 'Guia educativo · ferramentas grátis', researchNotCheckout: 'Pesquisa, não é o pagamento da registradora', contents: 'Conteúdo', quickAnswer: 'Resposta curta', covers: 'O que este guia cobre', takeaways: 'Pontos principais', tryTools: 'Experimente as ferramentas do DomainDiscovery', tryToolsBody: 'O DomainDiscovery é busca grátis de domínios, listas geográficas, WHOIS, verificação em lote e comparação de preços, sem conta.', searchDomains: 'Buscar domínios', allGuides: 'Todos os guias', faq: 'Perguntas', topicCluster: 'Grupo de temas', clusterHub: 'Centro do grupo', allClusters: 'Todos os grupos', continueLearning: 'Continuar lendo', trending: 'Em alta', readTime: 'min de leitura', home: 'Início', blog: 'Blog', encyclopedia: 'Enciclopédia de TLD', aboutTld: 'Sobre os domínios {tld}', whoCanRegister: 'Quem pode registrar domínios {tld}?', restrictions: 'Restrições de registro', length: 'Comprimento', charactersBefore: 'caracteres (nome antes de {tld})', canUse: 'Pode usar', cannotUse: 'Não pode usar', features: 'Recursos', registry: 'Informações do registro', sponsor: 'Patrocinador / gestor', registrationServices: 'Serviços de registro', whoisServer: 'Servidor WHOIS', rdapServer: 'Servidor RDAP', rootZone: 'Registro na zona raiz', recordUpdated: 'Registro atualizado', nameServers: 'Servidores de nome', whoisLookup: 'Consulta WHOIS', comparePrices: 'Comparar preços', backToEncyclopedia: 'Voltar à enciclopédia',
  },
  hi: {
    by: 'लेखक', educational: 'शैक्षिक गाइड · मुफ़्त उपकरण', researchNotCheckout: 'शोध, रजिस्ट्रार चेकआउट नहीं', contents: 'विषय सूची', quickAnswer: 'संक्षिप्त उत्तर', covers: 'यह गाइड क्या कवर करती है', takeaways: 'मुख्य बातें', tryTools: 'DomainDiscovery उपकरण आज़माएँ', tryToolsBody: 'DomainDiscovery मुफ़्त डोमेन खोज, भू सूचियाँ, WHOIS, थोक जाँच और कीमत तुलना है। खाता नहीं चाहिए।', searchDomains: 'डोमेन खोजें', allGuides: 'सभी गाइड', faq: 'प्रश्न', topicCluster: 'विषय समूह', clusterHub: 'समूह केंद्र', allClusters: 'सभी समूह', continueLearning: 'पढ़ना जारी रखें', trending: 'चर्चित', readTime: 'मिनट पढ़ें', home: 'होम', blog: 'ब्लॉग', encyclopedia: 'TLD विश्वकोश', aboutTld: '{tld} डोमेन के बारे में', whoCanRegister: '{tld} डोमेन कौन पंजीकृत कर सकता है?', restrictions: 'पंजीकरण प्रतिबंध', length: 'लंबाई', charactersBefore: 'अक्षर ({tld} से पहले का नाम)', canUse: 'उपयोग कर सकते हैं', cannotUse: 'उपयोग नहीं कर सकते', features: 'सुविधाएँ', registry: 'रजिस्ट्री जानकारी', sponsor: 'प्रायोजक / प्रबंधक', registrationServices: 'पंजीकरण सेवाएँ', whoisServer: 'WHOIS सर्वर', rdapServer: 'RDAP सर्वर', rootZone: 'रूट ज़ोन पंजीकरण', recordUpdated: 'रिकॉर्ड अपडेट', nameServers: 'नेम सर्वर', whoisLookup: 'WHOIS जाँच', comparePrices: 'कीमत तुलना', backToEncyclopedia: 'विश्वकोश पर वापस',
  },
  ar: {
    by: 'بقلم', educational: 'دليل تعليمي · أدوات مجانية', researchNotCheckout: 'بحث، وليس دفع المسجّل', contents: 'المحتويات', quickAnswer: 'إجابة مختصرة', covers: 'ما يغطيه هذا الدليل', takeaways: 'نقاط أساسية', tryTools: 'جرّب أدوات DomainDiscovery', tryToolsBody: 'DomainDiscovery بحث مجاني عن النطاقات مع قوائم جغرافية وWHOIS وفحص جماعي ومقارنة أسعار، دون حساب.', searchDomains: 'ابحث عن نطاقات', allGuides: 'كل الأدلة', faq: 'الأسئلة', topicCluster: 'مجموعة الموضوع', clusterHub: 'مركز المجموعة', allClusters: 'كل المجموعات', continueLearning: 'تابع القراءة', trending: 'رائج', readTime: 'دقائق قراءة', home: 'الرئيسية', blog: 'المدونة', encyclopedia: 'موسوعة الامتدادات', aboutTld: 'حول نطاقات {tld}', whoCanRegister: 'من يمكنه تسجيل نطاقات {tld}؟', restrictions: 'قيود التسجيل', length: 'الطول', charactersBefore: 'أحرف (الاسم قبل {tld})', canUse: 'يمكن استخدامه', cannotUse: 'لا يمكن استخدامه', features: 'الميزات', registry: 'معلومات السجل', sponsor: 'الراعي / المدير', registrationServices: 'خدمات التسجيل', whoisServer: 'خادم WHOIS', rdapServer: 'خادم RDAP', rootZone: 'تسجيل منطقة الجذر', recordUpdated: 'تحديث السجل', nameServers: 'خوادم الأسماء', whoisLookup: 'بحث WHOIS', comparePrices: 'قارن الأسعار', backToEncyclopedia: 'العودة إلى الموسوعة',
  },
  ru: {
    by: 'Автор', educational: 'Учебное руководство · бесплатные инструменты', researchNotCheckout: 'Исследование, не оплата у регистратора', contents: 'Содержание', quickAnswer: 'Короткий ответ', covers: 'О чем это руководство', takeaways: 'Главное', tryTools: 'Попробовать инструменты DomainDiscovery', tryToolsBody: 'DomainDiscovery — бесплатный поиск доменов, геосписки, WHOIS, массовая проверка и сравнение цен. Учетная запись не нужна.', searchDomains: 'Искать домены', allGuides: 'Все руководства', faq: 'Вопросы', topicCluster: 'Группа тем', clusterHub: 'Центр группы', allClusters: 'Все группы', continueLearning: 'Читать дальше', trending: 'В тренде', readTime: 'мин чтения', home: 'Главная', blog: 'Блог', encyclopedia: 'Энциклопедия TLD', aboutTld: 'О доменах {tld}', whoCanRegister: 'Кто может регистрировать домены {tld}?', restrictions: 'Ограничения регистрации', length: 'Длина', charactersBefore: 'символов (имя перед {tld})', canUse: 'Можно использовать', cannotUse: 'Нельзя использовать', features: 'Возможности', registry: 'Сведения реестра', sponsor: 'Спонсор / управляющий', registrationServices: 'Услуги регистрации', whoisServer: 'Сервер WHOIS', rdapServer: 'Сервер RDAP', rootZone: 'Запись в корневой зоне', recordUpdated: 'Запись обновлена', nameServers: 'Серверы имен', whoisLookup: 'Проверка WHOIS', comparePrices: 'Сравнить цены', backToEncyclopedia: 'К энциклопедии',
  },
  bn: {
    by: 'লেখক', educational: 'শিক্ষামূলক গাইড · বিনামূল্যের টুল', researchNotCheckout: 'গবেষণা, রেজিস্ট্রারের পেমেন্ট নয়', contents: 'সূচি', quickAnswer: 'সংক্ষিপ্ত উত্তর', covers: 'এই গাইড যা কভার করে', takeaways: 'মূল কথা', tryTools: 'DomainDiscovery টুল ব্যবহার করুন', tryToolsBody: 'DomainDiscovery বিনামূল্যের ডোমেইন অনুসন্ধান, ভৌগোলিক তালিকা, WHOIS, বাল্ক পরীক্ষা ও দাম তুলনা। অ্যাকাউন্ট লাগে না।', searchDomains: 'ডোমেইন খুঁজুন', allGuides: 'সব গাইড', faq: 'প্রশ্ন', topicCluster: 'বিষয়দল', clusterHub: 'দলের কেন্দ্র', allClusters: 'সব দল', continueLearning: 'পড়তে থাকুন', trending: 'আলোচিত', readTime: 'মিনিট পড়া', home: 'হোম', blog: 'ব্লগ', encyclopedia: 'TLD বিশ্বকোষ', aboutTld: '{tld} ডোমেইন সম্পর্কে', whoCanRegister: '{tld} ডোমেইন কে নিবন্ধন করতে পারে?', restrictions: 'নিবন্ধন সীমা', length: 'দৈর্ঘ্য', charactersBefore: 'অক্ষর ({tld}-এর আগের নাম)', canUse: 'ব্যবহার করা যায়', cannotUse: 'ব্যবহার করা যায় না', features: 'সুবিধা', registry: 'রেজিস্ট্রি তথ্য', sponsor: 'পৃষ্ঠপোষক / ব্যবস্থাপক', registrationServices: 'নিবন্ধন সেবা', whoisServer: 'WHOIS সার্ভার', rdapServer: 'RDAP সার্ভার', rootZone: 'রুট জোন নিবন্ধন', recordUpdated: 'রেকর্ড হালনাগাদ', nameServers: 'নেম সার্ভার', whoisLookup: 'WHOIS খোঁজ', comparePrices: 'দাম তুলনা', backToEncyclopedia: 'বিশ্বকোষে ফিরুন',
  },
  ur: {
    by: 'مصنف', educational: 'تعلیمی گائیڈ · مفت اوزار', researchNotCheckout: 'تحقیق، رجسٹرار کی ادائیگی نہیں', contents: 'فہرست', quickAnswer: 'مختصر جواب', covers: 'یہ گائیڈ کیا بتاتی ہے', takeaways: 'اہم نکات', tryTools: 'DomainDiscovery کے اوزار آزمائیں', tryToolsBody: 'DomainDiscovery مفت ڈومین تلاش، جغرافیائی فہرستیں، WHOIS، اجتماعی جانچ اور قیمت کا موازنہ ہے۔ اکاؤنٹ نہیں چاہیے۔', searchDomains: 'ڈومین تلاش کریں', allGuides: 'تمام گائیڈ', faq: 'سوالات', topicCluster: 'موضوعی گروہ', clusterHub: 'گروہ کا مرکز', allClusters: 'تمام گروہ', continueLearning: 'پڑھتے رہیں', trending: 'مقبول', readTime: 'منٹ مطالعہ', home: 'ہوم', blog: 'بلاگ', encyclopedia: 'TLD انسائیکلوپیڈیا', aboutTld: '{tld} ڈومینز کے بارے میں', whoCanRegister: '{tld} ڈومین کون رجسٹر کر سکتا ہے؟', restrictions: 'رجسٹریشن کی پابندیاں', length: 'لمبائی', charactersBefore: 'حروف ({tld} سے پہلے کا نام)', canUse: 'استعمال ہو سکتا ہے', cannotUse: 'استعمال نہیں ہو سکتا', features: 'خصوصیات', registry: 'رجسٹری کی معلومات', sponsor: 'اسپانسر / منتظم', registrationServices: 'رجسٹریشن خدمات', whoisServer: 'WHOIS سرور', rdapServer: 'RDAP سرور', rootZone: 'روٹ زون رجسٹریشن', recordUpdated: 'ریکارڈ کی تازہ کاری', nameServers: 'نیم سرور', whoisLookup: 'WHOIS تلاش', comparePrices: 'قیمتوں کا موازنہ', backToEncyclopedia: 'انسائیکلوپیڈیا پر واپس',
  },
};

export function libraryChrome(locale: LocaleId): LibraryChrome | null {
  if (locale === 'en') return null;
  return chrome[locale];
}

export function fillTld(template: string, tld: string): string {
  return template.replaceAll('{tld}', tld);
}
