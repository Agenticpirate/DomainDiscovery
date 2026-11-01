import type { LocaleId } from '../locales';
import type { LegalSection } from '@/components/layout/LegalDocumentPage';
import { DD_CONTACT } from '@/lib/legal/legalMeta';

export type CookieCopy = {
  title: string;
  description: string;
  metaDescription: string;
  cta: string;
  sections: LegalSection[];
};

const support = DD_CONTACT.support;

export const cookieCopy: Record<Exclude<LocaleId, 'en'>, CookieCopy> = {
  zh: {
    title: 'Cookie 政策',
    description: '说明 DomainDiscovery 如何使用 Cookie 和浏览器本地存储，以及您如何管理它们。',
    metaDescription: 'DomainDiscovery 的 Cookie、localStorage 与类似技术：偏好、名单、安全和可选分析。',
    cta: '阅读隐私政策',
    sections: [
      { id: 'what-are-cookies', heading: '什么是 Cookie 和类似技术？', body: ['Cookie 是保存在您设备上的小文本文件。我们也可能使用 localStorage、sessionStorage、像素和类似技术（统称“Cookie”）来运行和改进 DomainDiscovery。'] },
      { id: 'how-we-use-cookies', heading: '我们如何使用 Cookie', body: ['我们使用 Cookie 和类似技术来：'], bullets: ['记住您设置的偏好，例如浅色或深色主题、常用注册商。', '在您的设备上用 localStorage 保存域名名单和研究状态。', '维持安全、频率限制和基本会话完整性。', '在启用分析时，了解总体使用情况以改进性能和功能。'] },
      { id: 'types', heading: 'Cookie 类型', bullets: ['严格必要：网站核心功能、安全和您要求保存的偏好所必需。', '功能类：改善体验，例如记住界面偏好。', '分析类（若启用）：帮助我们从总体上了解流量和功能使用。'] },
      { id: 'third-party-cookies', heading: '第三方 Cookie', body: ['当您使用第三方注册商或外部接口时，对方可能按其政策设置自己的 Cookie。我们不控制注册商结账页面上的第三方 Cookie。'] },
      { id: 'manage', heading: '管理 Cookie', body: ['您可以在浏览器设置中阻止、删除 Cookie 或在设置时收到提醒。清除网站数据会删除保存在设备上的名单和偏好。阻止全部 Cookie 可能使部分功能无法使用。', '关于隐私权利，请参阅隐私政策。'] },
      { id: 'contact-cookies', heading: '联系', body: [`如有问题：${support}`] },
    ],
  },
  de: {
    title: 'Cookie-Richtlinie',
    description: 'Wie DomainDiscovery Cookies und lokalen Browserspeicher nutzt und wie Sie sie steuern.',
    metaDescription: 'Cookies, localStorage und ähnliche Techniken bei DomainDiscovery für Einstellungen, Merkliste, Sicherheit und optionale Analysen.',
    cta: 'Datenschutz lesen',
    sections: [
      { id: 'what-are-cookies', heading: 'Was sind Cookies und ähnliche Techniken?', body: ['Cookies sind kleine Textdateien auf Ihrem Gerät. Wir können auch localStorage, sessionStorage, Pixel und ähnliche Techniken (zusammen „Cookies“) nutzen, um DomainDiscovery zu betreiben und zu verbessern.'] },
      { id: 'how-we-use-cookies', heading: 'Wie wir Cookies nutzen', body: ['Wir nutzen Cookies und ähnliche Techniken, um:'], bullets: ['Einstellungen zu merken, etwa Design (hell/dunkel) oder bevorzugten Registrar.', 'Gespeicherte Domain-Merklisten und den Recherchestand in localStorage auf Ihrem Gerät zu halten.', 'Sicherheit, Ratenbegrenzung und die grundlegende Sitzung zu gewährleisten.', 'Die Nutzung insgesamt zu verstehen, wenn Analysen aktiv sind.'] },
      { id: 'types', heading: 'Arten von Cookies', bullets: ['Unbedingt erforderlich: für Kernfunktion, Sicherheit und von Ihnen gewünschte Einstellungen.', 'Funktional: verbessern die Nutzung, zum Beispiel gemerkte Oberfläche.', 'Analyse (falls aktiv): helfen uns, Traffic und Funktionen insgesamt zu verstehen.'] },
      { id: 'third-party-cookies', heading: 'Cookies Dritter', body: ['Wenn Sie externe Registrare oder APIs nutzen, können diese eigene Cookies nach ihren Richtlinien setzen. Cookies auf den Bezahlseiten der Registrare kontrollieren wir nicht.'] },
      { id: 'manage', heading: 'Cookies verwalten', body: ['Sie können Cookies im Browser blockieren, löschen oder sich warnen lassen. Wenn Sie Websitedaten löschen, verschwinden lokale Merklisten und Einstellungen. Alle Cookies zu blockieren kann Funktionen stören.', 'Zu Datenschutzrechten siehe die Datenschutzerklärung.'] },
      { id: 'contact-cookies', heading: 'Kontakt', body: [`Fragen: ${support}`] },
    ],
  },
  es: {
    title: 'Política de cookies',
    description: 'Cómo DomainDiscovery usa cookies y el almacenamiento local del navegador, y cómo puede controlarlos.',
    metaDescription: 'Cookies, localStorage y tecnologías similares de DomainDiscovery para preferencias, listas, seguridad y analítica opcional.',
    cta: 'Leer la política de privacidad',
    sections: [
      { id: 'what-are-cookies', heading: '¿Qué son las cookies y tecnologías similares?', body: ['Las cookies son pequeños archivos de texto en su dispositivo. También podemos usar localStorage, sessionStorage, píxeles y tecnologías similares (en conjunto, “cookies”) para operar y mejorar DomainDiscovery.'] },
      { id: 'how-we-use-cookies', heading: 'Cómo usamos las cookies', body: ['Usamos cookies y tecnologías similares para:'], bullets: ['Recordar preferencias como el tema (claro/oscuro) o el registrador preferido.', 'Guardar listas de dominios y el estado de la investigación en localStorage de su dispositivo.', 'Mantener la seguridad, los límites de uso y la integridad básica de la sesión.', 'Entender el uso agregado para mejorar el rendimiento, si la analítica está activa.'] },
      { id: 'types', heading: 'Tipos de cookies', bullets: ['Estrictamente necesarias: imprescindibles para la función principal, la seguridad y las preferencias que usted pide guardar.', 'Funcionales: mejoran la experiencia, por ejemplo al recordar la interfaz.', 'Analítica (si está activa): nos ayuda a entender el tráfico y el uso de funciones en conjunto.'] },
      { id: 'third-party-cookies', heading: 'Cookies de terceros', body: ['Al usar registradores externos o API, esos terceros pueden instalar sus propias cookies según sus políticas. No controlamos las cookies de las páginas de pago del registrador.'] },
      { id: 'manage', heading: 'Gestionar las cookies', body: ['Puede bloquear, borrar o recibir avisos de cookies en la configuración del navegador. Borrar los datos del sitio elimina las listas y preferencias locales. Bloquear todas las cookies puede impedir algunas funciones.', 'Sobre los derechos de privacidad, consulte la Política de privacidad.'] },
      { id: 'contact-cookies', heading: 'Contacto', body: [`Preguntas: ${support}`] },
    ],
  },
  ja: {
    title: 'Cookie ポリシー',
    description: 'DomainDiscovery が Cookie とブラウザのローカル保存をどう使い、どう管理できるかを説明します。',
    metaDescription: 'DomainDiscovery の Cookie、localStorage、類似技術。設定、候補リスト、安全、任意の分析に使います。',
    cta: 'プライバシーポリシーを読む',
    sections: [
      { id: 'what-are-cookies', heading: 'Cookie と類似技術とは？', body: ['Cookie は端末に保存される小さなテキストファイルです。localStorage、sessionStorage、ピクセルなどの類似技術（あわせて「Cookie」）を、DomainDiscovery の運営と改善に使うことがあります。'] },
      { id: 'how-we-use-cookies', heading: 'Cookie の使い方', body: ['Cookie と類似技術は次のために使います。'], bullets: ['テーマ（ライト／ダーク）や優先レジストラなど、設定した好みを覚える。', '保存したドメインの候補と調査状態を、お使いの端末の localStorage に置く。', '安全、レート制限、基本的なセッションの整合性を保つ。', '分析を有効にしている場合、利用状況を全体として把握し性能と機能を改善する。'] },
      { id: 'types', heading: 'Cookie の種類', bullets: ['厳密に必要なもの：中核機能、安全、ご自身が保存を求めた設定に必要です。', '機能：画面の好みを覚えるなど、体験を良くします。', '分析（有効な場合）：トラフィックと機能の利用を全体として理解するのに役立ちます。'] },
      { id: 'third-party-cookies', heading: '第三者の Cookie', body: ['外部のレジストラや API を使うと、相手が自らの方針に従って Cookie を設定することがあります。レジストラの決済ページ上の第三者 Cookie は当社では管理しません。'] },
      { id: 'manage', heading: 'Cookie の管理', body: ['ブラウザ設定で Cookie をブロック、削除、または通知できます。サイトデータを消すと、端末上の候補リストと設定も消えます。すべての Cookie を止めると、一部の機能が使えなくなることがあります。', 'プライバシー上の権利はプライバシーポリシーをご覧ください。'] },
      { id: 'contact-cookies', heading: '連絡先', body: [`ご質問：${support}`] },
    ],
  },
  fr: {
    title: 'Politique cookies',
    description: 'Comment DomainDiscovery utilise les cookies et le stockage local du navigateur, et comment les contrôler.',
    metaDescription: 'Cookies, localStorage et techniques similaires de DomainDiscovery pour les préférences, listes, sécurité et analyses facultatives.',
    cta: 'Lire la politique de confidentialité',
    sections: [
      { id: 'what-are-cookies', heading: 'Que sont les cookies et techniques similaires ?', body: ['Les cookies sont de petits fichiers texte sur votre appareil. Nous pouvons aussi utiliser localStorage, sessionStorage, pixels et techniques similaires (ensemble, les « cookies ») pour faire fonctionner et améliorer DomainDiscovery.'] },
      { id: 'how-we-use-cookies', heading: 'Comment nous utilisons les cookies', body: ['Nous utilisons les cookies et techniques similaires pour :'], bullets: ['Mémoriser des préférences comme le thème (clair/sombre) ou le bureau d’enregistrement choisi.', 'Conserver les listes de domaines et l’état de recherche dans le localStorage de votre appareil.', 'Assurer la sécurité, les limites d’usage et l’intégrité de base de la session.', 'Comprendre l’usage global pour améliorer le service, si l’analyse est activée.'] },
      { id: 'types', heading: 'Types de cookies', bullets: ['Strictement nécessaires : requis pour la fonction principale, la sécurité et les préférences que vous demandez.', 'Fonctionnels : améliorent l’expérience, par exemple en mémorisant l’interface.', 'Analyse (si activée) : nous aident à comprendre le trafic et l’usage des fonctions dans l’ensemble.'] },
      { id: 'third-party-cookies', heading: 'Cookies tiers', body: ['Lorsque vous utilisez des bureaux d’enregistrement ou des API externes, ces tiers peuvent déposer leurs propres cookies selon leurs politiques. Nous ne contrôlons pas les cookies des pages de paiement.'] },
      { id: 'manage', heading: 'Gérer les cookies', body: ['Vous pouvez bloquer, supprimer ou être alerté des cookies dans les réglages du navigateur. Effacer les données du site supprime les listes et préférences locales. Tout bloquer peut empêcher certaines fonctions.', 'Pour les droits liés à la vie privée, voir la Politique de confidentialité.'] },
      { id: 'contact-cookies', heading: 'Contact', body: [`Questions : ${support}`] },
    ],
  },
  pt: {
    title: 'Política de cookies',
    description: 'Como o DomainDiscovery usa cookies e o armazenamento local do navegador, e como você pode controlá-los.',
    metaDescription: 'Cookies, localStorage e tecnologias semelhantes do DomainDiscovery para preferências, listas, segurança e análise opcional.',
    cta: 'Ler a política de privacidade',
    sections: [
      { id: 'what-are-cookies', heading: 'O que são cookies e tecnologias semelhantes?', body: ['Cookies são pequenos arquivos de texto no seu dispositivo. Também podemos usar localStorage, sessionStorage, pixels e tecnologias semelhantes (em conjunto, “cookies”) para operar e melhorar o DomainDiscovery.'] },
      { id: 'how-we-use-cookies', heading: 'Como usamos cookies', body: ['Usamos cookies e tecnologias semelhantes para:'], bullets: ['Lembrar preferências como o tema (claro/escuro) ou a registradora preferida.', 'Guardar listas de domínios e o estado da pesquisa no localStorage do seu dispositivo.', 'Manter segurança, limite de uso e a integridade básica da sessão.', 'Entender o uso agregado para melhorar o serviço, se a análise estiver ativa.'] },
      { id: 'types', heading: 'Tipos de cookies', bullets: ['Estritamente necessários: exigidos para a função principal, segurança e preferências que você pede para salvar.', 'Funcionais: melhoram a experiência, por exemplo ao lembrar a interface.', 'Análise (se ativa): ajuda a entender o tráfego e o uso das funções no conjunto.'] },
      { id: 'third-party-cookies', heading: 'Cookies de terceiros', body: ['Ao usar registradoras ou APIs externas, esses terceiros podem definir os próprios cookies conforme as políticas deles. Não controlamos cookies nas páginas de pagamento da registradora.'] },
      { id: 'manage', heading: 'Gerenciar cookies', body: ['Você pode bloquear, apagar ou ser avisado sobre cookies nas configurações do navegador. Limpar os dados do site remove listas e preferências locais. Bloquear todos os cookies pode quebrar alguns recursos.', 'Sobre direitos de privacidade, veja a Política de privacidade.'] },
      { id: 'contact-cookies', heading: 'Contato', body: [`Dúvidas: ${support}`] },
    ],
  },
  hi: {
    title: 'कुकी नीति',
    description: 'DomainDiscovery कुकी और ब्राउज़र के स्थानीय संग्रहण का उपयोग कैसे करता है, और आप उन्हें कैसे नियंत्रित कर सकते हैं।',
    metaDescription: 'DomainDiscovery की कुकी, localStorage और समान तकनीकें: प्राथमिकताएँ, सूची, सुरक्षा और वैकल्पिक विश्लेषण।',
    cta: 'गोपनीयता नीति पढ़ें',
    sections: [
      { id: 'what-are-cookies', heading: 'कुकी और समान तकनीकें क्या हैं?', body: ['कुकी आपके डिवाइस पर छोटी टेक्स्ट फ़ाइलें हैं। हम localStorage, sessionStorage, पिक्सेल और समान तकनीकों (मिलकर “कुकी”) का उपयोग DomainDiscovery चलाने और सुधारने के लिए कर सकते हैं।'] },
      { id: 'how-we-use-cookies', heading: 'हम कुकी का उपयोग कैसे करते हैं', body: ['हम कुकी और समान तकनीकों का उपयोग इनके लिए करते हैं:'], bullets: ['थीम (हल्का/गहरा) या पसंदीदा रजिस्ट्रार जैसी प्राथमिकताएँ याद रखना।', 'सहेजे डोमेन और शोध स्थिति को आपके डिवाइस के localStorage में रखना।', 'सुरक्षा, दर सीमा और बुनियादी सत्र की अखंडता बनाए रखना।', 'विश्लेषण चालू हो तो समग्र उपयोग समझकर प्रदर्शन और सुविधाएँ सुधारना।'] },
      { id: 'types', heading: 'कुकी के प्रकार', bullets: ['कड़ाई से आवश्यक: मुख्य कार्य, सुरक्षा और आपके माँगे गए संग्रहण के लिए।', 'कार्यात्मक: अनुभव बेहतर बनाती हैं, जैसे इंटरफ़ेस याद रखना।', 'विश्लेषण (यदि चालू): ट्रैफ़िक और सुविधाओं के समग्र उपयोग को समझने में मदद।'] },
      { id: 'third-party-cookies', heading: 'तृतीय-पक्ष कुकी', body: ['जब आप बाहरी रजिस्ट्रार या API का उपयोग करते हैं, वे अपनी नीति के अनुसार अपनी कुकी सेट कर सकते हैं। रजिस्ट्रार के भुगतान पृष्ठ की कुकी हम नियंत्रित नहीं करते।'] },
      { id: 'manage', heading: 'कुकी प्रबंधित करें', body: ['आप ब्राउज़र सेटिंग में कुकी रोक, हटा या चेतावनी ले सकते हैं। साइट डेटा साफ़ करने से स्थानीय सूची और प्राथमिकताएँ मिट जाती हैं। सभी कुकी रोकने से कुछ सुविधाएँ टूट सकती हैं।', 'गोपनीयता अधिकारों के लिए गोपनीयता नीति देखें।'] },
      { id: 'contact-cookies', heading: 'संपर्क', body: [`प्रश्न: ${support}`] },
    ],
  },
  ar: {
    title: 'سياسة ملفات تعريف الارتباط',
    description: 'كيف يستخدم DomainDiscovery ملفات تعريف الارتباط والتخزين المحلي في المتصفح، وكيف تتحكم بها.',
    metaDescription: 'ملفات تعريف الارتباط وlocalStorage والتقنيات المشابهة في DomainDiscovery للتفضيلات والقوائم والأمان والتحليلات الاختيارية.',
    cta: 'اقرأ سياسة الخصوصية',
    sections: [
      { id: 'what-are-cookies', heading: 'ما هي ملفات تعريف الارتباط والتقنيات المشابهة؟', body: ['ملفات تعريف الارتباط ملفات نصية صغيرة على جهازك. قد نستخدم أيضاً localStorage وsessionStorage والبكسل وتقنيات مشابهة (معاً «ملفات تعريف الارتباط») لتشغيل DomainDiscovery وتحسينه.'] },
      { id: 'how-we-use-cookies', heading: 'كيف نستخدمها', body: ['نستخدم ملفات تعريف الارتباط والتقنيات المشابهة من أجل:'], bullets: ['تذكّر التفضيلات مثل المظهر (فاتح/داكن) أو المسجّل المفضّل.', 'حفظ قوائم النطاقات وحالة البحث في localStorage على جهازك.', 'الحفاظ على الأمان وحدود الاستخدام وسلامة الجلسة الأساسية.', 'فهم الاستخدام الإجمالي لتحسين الأداء إذا كانت التحليلات مفعّلة.'] },
      { id: 'types', heading: 'الأنواع', bullets: ['ضرورية تماماً: لازمة للوظيفة الأساسية والأمان والتفضيلات التي تطلب حفظها.', 'وظيفية: تحسّن التجربة، مثل تذكّر واجهة الاستخدام.', 'تحليلات (إن فُعّلت): تساعدنا على فهم الزيارات واستخدام الميزات إجمالاً.'] },
      { id: 'third-party-cookies', heading: 'ملفات الطرف الثالث', body: ['عند استخدام مسجّلين أو واجهات خارجية، قد يضع هؤلاء ملفاتهم وفق سياساتهم. لا نتحكم في الملفات على صفحات الدفع لدى المسجّل.'] },
      { id: 'manage', heading: 'إدارة الملفات', body: ['يمكنك حظر الملفات أو حذفها أو التنبيه بها من إعدادات المتصفح. مسح بيانات الموقع يحذف القوائم والتفضيلات المحلية. حظر كل الملفات قد يعطّل بعض الميزات.', 'لحقوق الخصوصية، راجع سياسة الخصوصية.'] },
      { id: 'contact-cookies', heading: 'التواصل', body: [`أسئلة: ${support}`] },
    ],
  },
  ru: {
    title: 'Политика cookie',
    description: 'Как DomainDiscovery использует cookie и локальное хранилище браузера и как этим управлять.',
    metaDescription: 'Cookie, localStorage и похожие технологии DomainDiscovery для настроек, списков, безопасности и необязательной аналитики.',
    cta: 'Читать политику конфиденциальности',
    sections: [
      { id: 'what-are-cookies', heading: 'Что такое cookie и похожие технологии?', body: ['Cookie — небольшие текстовые файлы на вашем устройстве. Мы также можем использовать localStorage, sessionStorage, пиксели и похожие технологии (вместе — «cookie»), чтобы работать и улучшать DomainDiscovery.'] },
      { id: 'how-we-use-cookies', heading: 'Как мы используем cookie', body: ['Мы используем cookie и похожие технологии, чтобы:'], bullets: ['Запоминать настройки, например тему (светлая/темная) или предпочтительного регистратора.', 'Хранить списки доменов и состояние исследования в localStorage на вашем устройстве.', 'Поддерживать безопасность, ограничение частоты и базовую целостность сессии.', 'Понимать совокупное использование, если аналитика включена.'] },
      { id: 'types', heading: 'Виды cookie', bullets: ['Строго необходимые: для основной работы, безопасности и настроек, которые вы просите сохранить.', 'Функциональные: улучшают опыт, например запоминают интерфейс.', 'Аналитика (если включена): помогает понять трафик и использование функций в целом.'] },
      { id: 'third-party-cookies', heading: 'Сторонние cookie', body: ['Когда вы пользуетесь внешними регистраторами или API, они могут ставить свои cookie по своим правилам. Cookie на страницах оплаты регистратора мы не контролируем.'] },
      { id: 'manage', heading: 'Управление cookie', body: ['Вы можете блокировать, удалять cookie или получать предупреждения в настройках браузера. Очистка данных сайта удаляет локальные списки и настройки. Блокировка всех cookie может нарушить часть функций.', 'О правах на конфиденциальность см. Политику конфиденциальности.'] },
      { id: 'contact-cookies', heading: 'Контакт', body: [`Вопросы: ${support}`] },
    ],
  },
  bn: {
    title: 'কুকি নীতি',
    description: 'DomainDiscovery কুকি ও ব্রাউজারের স্থানীয় সংরক্ষণ কীভাবে ব্যবহার করে এবং আপনি কীভাবে নিয়ন্ত্রণ করবেন।',
    metaDescription: 'DomainDiscovery-এর কুকি, localStorage ও অনুরূপ প্রযুক্তি: পছন্দ, তালিকা, নিরাপত্তা ও ঐচ্ছিক বিশ্লেষণ।',
    cta: 'গোপনীয়তা নীতি পড়ুন',
    sections: [
      { id: 'what-are-cookies', heading: 'কুকি ও অনুরূপ প্রযুক্তি কী?', body: ['কুকি আপনার ডিভাইসে ছোট টেক্সট ফাইল। আমরা localStorage, sessionStorage, পিক্সেল ও অনুরূপ প্রযুক্তি (একসঙ্গে “কুকি”) DomainDiscovery চালাতে ও উন্নত করতে ব্যবহার করতে পারি।'] },
      { id: 'how-we-use-cookies', heading: 'আমরা কুকি কীভাবে ব্যবহার করি', body: ['আমরা কুকি ও অনুরূপ প্রযুক্তি ব্যবহার করি:'], bullets: ['থিম (হালকা/গাঢ়) বা পছন্দের রেজিস্ট্রারের মতো পছন্দ মনে রাখতে।', 'সংরক্ষিত ডোমেইন তালিকা ও গবেষণার অবস্থা আপনার ডিভাইসের localStorage-এ রাখতে।', 'নিরাপত্তা, হারসীমা ও মৌলিক সেশনের অখণ্ডতা বজায় রাখতে।', 'বিশ্লেষণ চালু থাকলে সামগ্রিক ব্যবহার বুঝে কর্মক্ষমতা ও সুবিধা উন্নত করতে।'] },
      { id: 'types', heading: 'কুকির ধরন', bullets: ['কঠোরভাবে প্রয়োজনীয়: মূল কাজ, নিরাপত্তা এবং আপনি যে সংরক্ষণ চান তার জন্য।', 'কার্যকর: অভিজ্ঞতা বাড়ায়, যেমন ইন্টারফেস মনে রাখা।', 'বিশ্লেষণ (চালু থাকলে): ট্রাফিক ও সুবিধার সামগ্রিক ব্যবহার বুঝতে সাহায্য করে।'] },
      { id: 'third-party-cookies', heading: 'তৃতীয় পক্ষের কুকি', body: ['বাহ্যিক রেজিস্ট্রার বা API ব্যবহার করলে তারা নিজের নীতি অনুসারে কুকি বসাতে পারে। রেজিস্ট্রারের পেমেন্ট পাতার কুকি আমরা নিয়ন্ত্রণ করি না।'] },
      { id: 'manage', heading: 'কুকি পরিচালনা', body: ['ব্রাউজার সেটিংসে কুকি আটকানো, মোছা বা সতর্কতা নেওয়া যায়। সাইট ডেটা মুছলে স্থানীয় তালিকা ও পছন্দ মুছে যায়। সব কুকি আটকালে কিছু সুবিধা ভাঙতে পারে।', 'গোপনীয়তার অধিকারের জন্য গোপনীয়তা নীতি দেখুন।'] },
      { id: 'contact-cookies', heading: 'যোগাযোগ', body: [`প্রশ্ন: ${support}`] },
    ],
  },
  ur: {
    title: 'کوکی پالیسی',
    description: 'DomainDiscovery کوکیز اور براؤزر کے مقامی ذخیرے کو کیسے استعمال کرتا ہے، اور آپ انہیں کیسے کنٹرول کر سکتے ہیں۔',
    metaDescription: 'DomainDiscovery کی کوکیز، localStorage اور ملتی جلتی تکنیکیں: ترجیحات، فہرستیں، حفاظت اور اختیاری تجزیہ۔',
    cta: 'رازداری کی پالیسی پڑھیں',
    sections: [
      { id: 'what-are-cookies', heading: 'کوکیز اور ملتی جلتی تکنیکیں کیا ہیں؟', body: ['کوکیز آپ کے آلے پر چھوٹی ٹیکسٹ فائلیں ہیں۔ ہم localStorage، sessionStorage، پکسلز اور ملتی جلتی تکنیکیں (مجموعی طور پر «کوکیز») DomainDiscovery چلانے اور بہتر بنانے کے لیے استعمال کر سکتے ہیں۔'] },
      { id: 'how-we-use-cookies', heading: 'ہم کوکیز کیسے استعمال کرتے ہیں', body: ['ہم کوکیز اور ملتی جلتی تکنیکیں ان کاموں کے لیے استعمال کرتے ہیں:'], bullets: ['تھیم (ہلکا/گہرا) یا پسندیدہ رجسٹرار جیسی ترجیحات یاد رکھنا۔', 'محفوظ ڈومین فہرستیں اور تحقیق کی حالت آپ کے آلے کے localStorage میں رکھنا۔', 'حفاظت، شرح کی حد اور بنیادی سیشن کی سالمیت برقرار رکھنا۔', 'تجزیہ فعال ہو تو مجموعی استعمال سمجھ کر کارکردگی اور خصوصیات بہتر بنانا۔'] },
      { id: 'types', heading: 'کوکیز کی اقسام', bullets: ['سختی سے ضروری: بنیادی کام، حفاظت اور آپ کی مانگی ہوئی محفوظ ترجیحات کے لیے۔', 'فعالی: تجربہ بہتر بناتی ہیں، مثلاً انٹرفیس یاد رکھنا۔', 'تجزیہ (اگر فعال ہو): ٹریفک اور خصوصیات کے مجموعی استعمال کو سمجھنے میں مدد۔'] },
      { id: 'third-party-cookies', heading: 'فریقِ ثالث کی کوکیز', body: ['جب آپ بیرونی رجسٹرار یا API استعمال کریں، وہ اپنی پالیسی کے تحت اپنی کوکیز لگا سکتے ہیں۔ رجسٹرار کے ادائیگی کے صفحے کی کوکیز ہم کنٹرول نہیں کرتے۔'] },
      { id: 'manage', heading: 'کوکیز کا انتظام', body: ['آپ براؤزر کی ترتیبات میں کوکیز روک، مٹا یا انتباہ لے سکتے ہیں۔ سائٹ کا ڈیٹا صاف کرنے سے مقامی فہرستیں اور ترجیحات مٹ جاتی ہیں۔ تمام کوکیز روکنے سے کچھ خصوصیات ٹوٹ سکتی ہیں۔', 'رازداری کے حقوق کے لیے رازداری کی پالیسی دیکھیں۔'] },
      { id: 'contact-cookies', heading: 'رابطہ', body: [`سوالات: ${support}`] },
    ],
  },
};

export function getCookieCopy(locale: LocaleId): CookieCopy | null {
  if (locale === 'en') return null;
  return cookieCopy[locale];
}
