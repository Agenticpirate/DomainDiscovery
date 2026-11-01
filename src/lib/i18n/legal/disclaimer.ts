import type { LocaleId } from '../locales';
import type { LegalSection } from '@/components/layout/LegalDocumentPage';

export type LegalChrome = {
  legal: string;
  lastUpdated: string;
  effective: string;
  onThisPage: string;
  related: string;
  questions: string;
  email: string;
  date: string;
  noticeTitle: string;
  noticeBody: string;
  terms: string;
  privacy: string;
  cookies: string;
  disclaimer: string;
  contact: string;
  readTerms: string;
};

type DisclaimerCopy = {
  title: string;
  description: string;
  metaDescription: string;
  sections: LegalSection[];
};

const chrome: Record<Exclude<LocaleId, 'en'>, LegalChrome> = {
  zh: {
    legal: '法律',
    lastUpdated: '最后更新',
    effective: '生效日期',
    onThisPage: '本页目录',
    related: '相关法律页面',
    questions: '有问题？',
    email: '请发邮件至',
    date: '2026年7月22日',
    noticeTitle: '重要说明',
    noticeBody: '本文件说明 DomainDiscovery 如何运作，便于您了解，并非法律建议。如需针对您情况的意见，请咨询合格律师。使用本服务即表示您同意使用条款以及适用的隐私政策。',
    terms: '使用条款',
    privacy: '隐私政策',
    cookies: 'Cookie 政策',
    disclaimer: '免责声明',
    contact: '联系',
    readTerms: '阅读完整条款',
  },
  de: {
    legal: 'Rechtliches',
    lastUpdated: 'Zuletzt aktualisiert',
    effective: 'Gültig ab',
    onThisPage: 'Auf dieser Seite',
    related: 'Weitere rechtliche Seiten',
    questions: 'Fragen?',
    email: 'E-Mail an',
    date: '22. Juli 2026',
    noticeTitle: 'Wichtiger Hinweis',
    noticeBody: 'Dieses Dokument erklärt transparent, wie DomainDiscovery arbeitet. Es ist keine Rechtsberatung. Wenn Sie Rat für Ihre Situation brauchen, wenden Sie sich an eine qualifizierte Anwältin oder einen qualifizierten Anwalt. Mit der Nutzung stimmen Sie den Nutzungsbedingungen und dieser Datenschutzerklärung zu, soweit sie gelten.',
    terms: 'Nutzungsbedingungen',
    privacy: 'Datenschutz',
    cookies: 'Cookie-Richtlinie',
    disclaimer: 'Haftungsausschluss',
    contact: 'Kontakt',
    readTerms: 'Vollständige Bedingungen lesen',
  },
  es: {
    legal: 'Legal',
    lastUpdated: 'Última actualización',
    effective: 'Vigente desde',
    onThisPage: 'En esta página',
    related: 'Otras páginas legales',
    questions: '¿Preguntas?',
    email: 'Escribe a',
    date: '22 de julio de 2026',
    noticeTitle: 'Importante',
    noticeBody: 'Este documento explica con transparencia cómo funciona DomainDiscovery. No es asesoría legal. Si necesita consejo para su caso, consulte a un abogado cualificado. Al usar el servicio, acepta los Términos de uso y esta Política de privacidad cuando corresponda.',
    terms: 'Términos de uso',
    privacy: 'Política de privacidad',
    cookies: 'Política de cookies',
    disclaimer: 'Aviso legal',
    contact: 'Contacto',
    readTerms: 'Leer los términos completos',
  },
  ja: {
    legal: '法務',
    lastUpdated: '最終更新',
    effective: '施行日',
    onThisPage: 'このページの内容',
    related: '関連する法務ページ',
    questions: 'ご質問',
    email: 'メール',
    date: '2026年7月22日',
    noticeTitle: '重要',
    noticeBody: 'この文書は DomainDiscovery の運営を明らかにするためのものであり、法律アドバイスではありません。個別の判断が必要な場合は資格のある弁護士にご相談ください。本サービスを利用すると、利用規約および該当するプライバシーポリシーに同意したものとみなされます。',
    terms: '利用規約',
    privacy: 'プライバシーポリシー',
    cookies: 'Cookie ポリシー',
    disclaimer: '免責事項',
    contact: 'お問い合わせ',
    readTerms: '利用規約をすべて読む',
  },
  fr: {
    legal: 'Mentions légales',
    lastUpdated: 'Dernière mise à jour',
    effective: 'Entrée en vigueur',
    onThisPage: 'Sur cette page',
    related: 'Autres pages juridiques',
    questions: 'Des questions ?',
    email: 'Écrire à',
    date: '22 juillet 2026',
    noticeTitle: 'Important',
    noticeBody: 'Ce document explique en toute transparence le fonctionnement de DomainDiscovery. Ce n’est pas un conseil juridique. Pour un avis sur votre situation, consultez un avocat qualifié. En utilisant le service, vous acceptez les Conditions d’utilisation et la Politique de confidentialité lorsqu’elle s’applique.',
    terms: 'Conditions d’utilisation',
    privacy: 'Politique de confidentialité',
    cookies: 'Politique cookies',
    disclaimer: 'Avertissement',
    contact: 'Contact',
    readTerms: 'Lire les conditions complètes',
  },
  pt: {
    legal: 'Jurídico',
    lastUpdated: 'Última atualização',
    effective: 'Vigência',
    onThisPage: 'Nesta página',
    related: 'Outras páginas jurídicas',
    questions: 'Dúvidas?',
    email: 'Envie um e-mail para',
    date: '22 de julho de 2026',
    noticeTitle: 'Importante',
    noticeBody: 'Este documento explica com transparência como o DomainDiscovery funciona. Não é aconselhamento jurídico. Se precisar de orientação para o seu caso, consulte um advogado qualificado. Ao usar o serviço, você concorda com os Termos de uso e com esta Política de privacidade, quando aplicável.',
    terms: 'Termos de uso',
    privacy: 'Política de privacidade',
    cookies: 'Política de cookies',
    disclaimer: 'Aviso legal',
    contact: 'Contato',
    readTerms: 'Ler os termos completos',
  },
  hi: {
    legal: 'कानूनी',
    lastUpdated: 'अंतिम अपडेट',
    effective: 'प्रभावी तिथि',
    onThisPage: 'इस पृष्ठ पर',
    related: 'संबंधित कानूनी पृष्ठ',
    questions: 'सवाल हैं?',
    email: 'ईमेल करें',
    date: '22 जुलाई 2026',
    noticeTitle: 'महत्वपूर्ण',
    noticeBody: 'यह दस्तावेज़ बताता है कि DomainDiscovery कैसे काम करता है। यह कानूनी सलाह नहीं है। अपनी स्थिति के लिए सलाह चाहिए तो योग्य वकील से बात करें। सेवा का उपयोग करने का अर्थ है कि आप उपयोग की शर्तें और लागू गोपनीयता नीति मानते हैं।',
    terms: 'उपयोग की शर्तें',
    privacy: 'गोपनीयता नीति',
    cookies: 'कुकी नीति',
    disclaimer: 'अस्वीकरण',
    contact: 'संपर्क',
    readTerms: 'पूरी शर्तें पढ़ें',
  },
  ar: {
    legal: 'قانوني',
    lastUpdated: 'آخر تحديث',
    effective: 'تاريخ السريان',
    onThisPage: 'في هذه الصفحة',
    related: 'صفحات قانونية ذات صلة',
    questions: 'أسئلة؟',
    email: 'راسل',
    date: '22 يوليو 2026',
    noticeTitle: 'مهم',
    noticeBody: 'يوضّح هذا المستند بشفافية كيف يعمل DomainDiscovery. وهو ليس استشارة قانونية. إذا احتجت رأياً لحالتك، فاستشر محامياً مؤهلاً. باستخدام الخدمة فإنك توافق على شروط الاستخدام وعلى سياسة الخصوصية هذه حيث تنطبق.',
    terms: 'شروط الاستخدام',
    privacy: 'سياسة الخصوصية',
    cookies: 'سياسة ملفات تعريف الارتباط',
    disclaimer: 'إخلاء المسؤولية',
    contact: 'اتصل بنا',
    readTerms: 'اقرأ الشروط كاملة',
  },
  ru: {
    legal: 'Правовая информация',
    lastUpdated: 'Обновлено',
    effective: 'Дата вступления в силу',
    onThisPage: 'На этой странице',
    related: 'Другие правовые страницы',
    questions: 'Есть вопросы?',
    email: 'Напишите на',
    date: '22 июля 2026 г.',
    noticeTitle: 'Важно',
    noticeBody: 'Этот документ прозрачно объясняет, как работает DomainDiscovery. Это не юридическая консультация. Если вам нужен совет по вашей ситуации, обратитесь к квалифицированному юристу. Используя сервис, вы соглашаетесь с Условиями использования и с этой Политикой конфиденциальности, где она применима.',
    terms: 'Условия использования',
    privacy: 'Политика конфиденциальности',
    cookies: 'Политика cookie',
    disclaimer: 'Отказ от ответственности',
    contact: 'Контакты',
    readTerms: 'Читать полные условия',
  },
  bn: {
    legal: 'আইনি',
    lastUpdated: 'সর্বশেষ হালনাগাদ',
    effective: 'কার্যকর তারিখ',
    onThisPage: 'এই পাতায়',
    related: 'সম্পর্কিত আইনি পাতা',
    questions: 'প্রশ্ন আছে?',
    email: 'ইমেল করুন',
    date: '২২ জুলাই ২০২৬',
    noticeTitle: 'গুরুত্বপূর্ণ',
    noticeBody: 'এই নথিটি স্বচ্ছভাবে ব্যাখ্যা করে DomainDiscovery কীভাবে কাজ করে। এটি আইনি পরামর্শ নয়। নিজের পরিস্থিতির জন্য পরামর্শ চাইলে যোগ্য আইনজীবীর সঙ্গে কথা বলুন। পরিষেবা ব্যবহার করলে আপনি ব্যবহারের শর্ত এবং প্রযোজ্য গোপনীয়তা নীতি মেনে নিচ্ছেন।',
    terms: 'ব্যবহারের শর্ত',
    privacy: 'গোপনীয়তা নীতি',
    cookies: 'কুকি নীতি',
    disclaimer: 'দাবিত্যাগ',
    contact: 'যোগাযোগ',
    readTerms: 'সম্পূর্ণ শর্ত পড়ুন',
  },
  ur: {
    legal: 'قانونی',
    lastUpdated: 'آخری تازہ کاری',
    effective: 'موثر تاریخ',
    onThisPage: 'اس صفحے پر',
    related: 'متعلقہ قانونی صفحات',
    questions: 'سوالات؟',
    email: 'ای میل کریں',
    date: '22 جولائی 2026',
    noticeTitle: 'اہم',
    noticeBody: 'یہ دستاویز وضاحت کرتی ہے کہ DomainDiscovery کیسے کام کرتا ہے۔ یہ قانونی مشورہ نہیں۔ اپنی صورتِ حال کے لیے مشورہ درکار ہو تو اہل وکیل سے رجوع کریں۔ سروس استعمال کرنے کا مطلب ہے کہ آپ استعمال کی شرائط اور قابلِ اطلاق رازداری کی پالیسی مانتے ہیں۔',
    terms: 'استعمال کی شرائط',
    privacy: 'رازداری کی پالیسی',
    cookies: 'کوکی پالیسی',
    disclaimer: 'دستبرداری',
    contact: 'رابطہ',
    readTerms: 'مکمل شرائط پڑھیں',
  },
};

const disclaimer: Record<Exclude<LocaleId, 'en'>, DisclaimerCopy> = {
  zh: {
    title: '免责声明',
    description: 'DomainDiscovery 是免费的域名研究工具，不是注册商，也不提供法律建议。可注册状态和价格均不作保证。',
    metaDescription: 'DomainDiscovery 免责声明：并非注册商，不保证域名可注册或价格，也不构成商标或法律建议。',
    sections: [
      { id: 'research-only', heading: '研究工具免责声明', body: ['DomainDiscovery 是免费的域名研究工具。页面显示的信息，包括可注册状态、溢价标记、价格、WHOIS/RDAP 数据、排名以及生成的名称，仅供一般参考，可能不完整、有延迟或不准确。'] },
      { id: 'not-registrar', heading: '并非注册商，不处理付款', body: ['我们不是 ICANN 认证注册商（除非将来另行说明）。本网站不处理域名注册付款。注册、续费、转移和 DNS 托管由第三方注册商根据其与您的协议办理。'] },
      { id: 'no-guarantee', heading: '不保证可注册或结果', body: ['显示为“可注册”的域名，可能在您完成结账之前被他人注册。溢价和二手市场价格可能随时变化，恕不另行通知。我们不保证搜索排名、品牌成功，也不保证不存在商标冲突。'] },
      { id: 'your-responsibility', heading: '您的责任', body: ['您须自行在注册商处核实是否可注册，核对全部费用（包括溢价、续费和 ICANN 费用），完成商标与法律审查，并遵守适用法律及注册商政策。'] },
      { id: 'limitation-disc', heading: '责任限制', body: ['在法律允许的最大范围内，DomainDiscovery 对依据本服务结果所作的决定不承担责任。完整的保证免责和责任限制见使用条款。'] },
    ],
  },
  de: {
    title: 'Haftungsausschluss',
    description: 'DomainDiscovery ist ein kostenloses Recherchewerkzeug, kein Registrar und keine Rechtsberatung. Verfügbarkeit und Preise sind nicht garantiert.',
    metaDescription: 'Haftungsausschluss von DomainDiscovery: kein Registrar, keine Garantie für Verfügbarkeit oder Preise, keine Marken- oder Rechtsberatung.',
    sections: [
      { id: 'research-only', heading: 'Hinweis zum Recherchewerkzeug', body: ['DomainDiscovery ist ein kostenloses Werkzeug zur Domain-Recherche. Angezeigte Angaben — darunter Verfügbarkeit, Premium-Kennzeichnungen, Preise, WHOIS/RDAP-Daten, Ranglisten und erzeugte Namen — dienen nur der allgemeinen Information und können unvollständig, verzögert oder falsch sein.'] },
      { id: 'not-registrar', heading: 'Kein Registrar, keine Zahlungsabwicklung', body: ['Wir sind kein von der ICANN akkreditierter Registrar, sofern das nicht später ausdrücklich anders angegeben wird. Auf dieser Website nehmen wir keine Zahlungen für Domainregistrierungen entgegen. Registrierung, Verlängerung, Transfer und DNS-Hosting erfolgen bei Dritt-Registraren nach deren Verträgen mit Ihnen.'] },
      { id: 'no-guarantee', heading: 'Keine Garantie für Verfügbarkeit oder Ergebnisse', body: ['Eine als „verfügbar“ angezeigte Domain kann registriert sein, bevor Sie den Kauf abschließen. Premium- und Aftermarket-Preise können sich ohne Ankündigung ändern. Wir garantieren weder SEO-Rankings noch Markenerfolg noch Freiheit von Markenkonflikten.'] },
      { id: 'your-responsibility', heading: 'Ihre Verantwortung', body: ['Sie allein prüfen die Verfügbarkeit beim Registrar, die Gesamtkosten (einschließlich Premium, Verlängerung und ICANN-Gebühren), die marken- und rechtsrechtliche Freigabe sowie die Einhaltung geltenden Rechts und der Registrar-Richtlinien.'] },
      { id: 'limitation-disc', heading: 'Haftungsbeschränkung', body: ['Soweit gesetzlich zulässig, lehnt DomainDiscovery die Haftung für Entscheidungen ab, die auf Ausgaben des Dienstes beruhen. Vollständige Gewährleistungsausschlüsse und Haftungsgrenzen stehen in den Nutzungsbedingungen.'] },
    ],
  },
  es: {
    title: 'Aviso legal',
    description: 'DomainDiscovery es una herramienta gratuita de investigación, no un registrador ni asesoría legal. No se garantiza la disponibilidad ni el precio.',
    metaDescription: 'Aviso legal de DomainDiscovery: no es un registrador, no garantiza disponibilidad ni precios y no es asesoría de marcas ni legal.',
    sections: [
      { id: 'research-only', heading: 'Aviso sobre la herramienta de investigación', body: ['DomainDiscovery es un conjunto gratuito de herramientas de investigación de dominios. La información mostrada —disponibilidad, marcas premium, precios, datos WHOIS/RDAP, clasificaciones y nombres generados— es solo informativa y puede estar incompleta, retrasada o ser incorrecta.'] },
      { id: 'not-registrar', heading: 'No somos un registrador ni procesamos pagos', body: ['No somos un registrador acreditado por la ICANN, salvo que se indique lo contrario en el futuro. Este sitio no procesa pagos de registro de dominios. El registro, la renovación, la transferencia y el alojamiento DNS los realizan registradores externos según sus acuerdos con usted.'] },
      { id: 'no-guarantee', heading: 'Sin garantía de disponibilidad ni de resultados', body: ['Un dominio mostrado como “disponible” puede registrarlo otra persona antes de que usted termine el pago. Los precios premium y de reventa pueden cambiar sin aviso. No garantizamos posiciones SEO, éxito de marca ni ausencia de conflicto de marcas.'] },
      { id: 'your-responsibility', heading: 'Su responsabilidad', body: ['Usted es el único responsable de verificar la disponibilidad en el registrador, revisar el coste total (incluidas las tarifas premium, de renovación y de la ICANN), hacer la revisión de marcas y legal, y cumplir las leyes aplicables y las políticas del registrador.'] },
      { id: 'limitation-disc', heading: 'Limitación', body: ['En la máxima medida permitida por la ley, DomainDiscovery no se responsabiliza de las decisiones tomadas a partir de los resultados del servicio. Las exclusiones de garantía y los límites de responsabilidad completos están en los Términos de uso.'] },
    ],
  },
  ja: {
    title: '免責事項',
    description: 'DomainDiscovery は無料の調査ツールであり、レジストラでも法律アドバイスでもありません。取得可否と価格は保証されません。',
    metaDescription: 'DomainDiscovery の免責事項。レジストラではなく、取得可否や価格を保証せず、商標または法律の助言でもありません。',
    sections: [
      { id: 'research-only', heading: '調査ツールに関する免責', body: ['DomainDiscovery は無料のドメイン調査ツールです。表示される情報（取得可否、プレミアム表示、価格、WHOIS/RDAP データ、順位、生成された名称）は一般的な参考情報であり、不完全、遅延、または不正確な場合があります。'] },
      { id: 'not-registrar', heading: 'レジストラではなく、決済も行いません', body: ['将来別途開示する場合を除き、当社は ICANN 認定レジストラではありません。このウェブサイトではドメイン登録の支払いを処理しません。登録、更新、移管、DNS ホスティングは、お客様との契約に基づき第三者のレジストラが行います。'] },
      { id: 'no-guarantee', heading: '取得可否や結果の保証はありません', body: ['「取得可能」と表示されたドメインでも、決済を終える前に他者が登録することがあります。プレミアム価格や中古市場の価格は予告なく変わることがあります。検索順位、ブランドの成功、商標の非抵触は保証しません。'] },
      { id: 'your-responsibility', heading: 'お客様の責任', body: ['レジストラでの取得可否の確認、料金の合計（プレミアム、更新、ICANN 料金を含む）の確認、商標および法的な調査、適用法令とレジストラの方針の遵守は、すべてお客様の責任です。'] },
      { id: 'limitation-disc', heading: '責任の制限', body: ['法律で認められる最大限の範囲で、DomainDiscovery は本サービスの出力に基づく判断について責任を負いません。保証の否認と責任制限の全文は利用規約にあります。'] },
    ],
  },
  fr: {
    title: 'Avertissement',
    description: 'DomainDiscovery est un outil de recherche gratuit, pas un bureau d’enregistrement ni un conseil juridique. La disponibilité et les prix ne sont pas garantis.',
    metaDescription: 'Avertissement DomainDiscovery : pas un bureau d’enregistrement, aucune garantie de disponibilité ou de prix, pas un conseil en marques ou juridique.',
    sections: [
      { id: 'research-only', heading: 'Avertissement sur l’outil de recherche', body: ['DomainDiscovery est une boîte à outils gratuite de recherche de noms de domaine. Les informations affichées — disponibilité, mentions premium, prix, données WHOIS/RDAP, classements et noms générés — sont fournies à titre informatif et peuvent être incomplètes, retardées ou inexactes.'] },
      { id: 'not-registrar', heading: 'Pas un bureau d’enregistrement, pas de paiement', body: ['Nous ne sommes pas un bureau d’enregistrement accrédité par l’ICANN, sauf indication contraire ultérieure. Ce site ne traite pas les paiements d’enregistrement. L’enregistrement, le renouvellement, le transfert et l’hébergement DNS sont assurés par des bureaux tiers selon leurs contrats avec vous.'] },
      { id: 'no-guarantee', heading: 'Aucune garantie de disponibilité ni de résultat', body: ['Un domaine affiché comme « disponible » peut être enregistré par quelqu’un d’autre avant la fin de votre paiement. Les prix premium et d’après-vente peuvent changer sans préavis. Nous ne garantissons ni le référencement, ni le succès d’une marque, ni l’absence de conflit de marque.'] },
      { id: 'your-responsibility', heading: 'Votre responsabilité', body: ['Il vous appartient seul de vérifier la disponibilité auprès du bureau d’enregistrement, de contrôler le coût total (y compris premium, renouvellement et frais ICANN), d’effectuer la vérification des marques et du droit, et de respecter les lois applicables et les politiques du bureau.'] },
      { id: 'limitation-disc', heading: 'Limitation', body: ['Dans toute la mesure permise par la loi, DomainDiscovery décline toute responsabilité pour les décisions prises à partir des résultats du service. Les exclusions de garantie et plafonds de responsabilité figurent dans les Conditions d’utilisation.'] },
    ],
  },
  pt: {
    title: 'Aviso legal',
    description: 'O DomainDiscovery é uma ferramenta gratuita de pesquisa, não uma registradora nem aconselhamento jurídico. Disponibilidade e preços não são garantidos.',
    metaDescription: 'Aviso legal do DomainDiscovery: não é uma registradora, não garante disponibilidade ou preços e não é orientação de marca ou jurídica.',
    sections: [
      { id: 'research-only', heading: 'Aviso sobre a ferramenta de pesquisa', body: ['O DomainDiscovery é um conjunto gratuito de ferramentas de pesquisa de domínios. As informações exibidas — disponibilidade, sinais premium, preços, dados WHOIS/RDAP, classificações e nomes gerados — são apenas informativas e podem estar incompletas, atrasadas ou incorretas.'] },
      { id: 'not-registrar', heading: 'Não somos uma registradora e não processamos pagamentos', body: ['Não somos uma registradora credenciada pela ICANN, salvo divulgação futura em contrário. Este site não processa pagamentos de registro de domínio. Registro, renovação, transferência e hospedagem DNS são feitos por registradoras terceiras, conforme o contrato delas com você.'] },
      { id: 'no-guarantee', heading: 'Sem garantia de disponibilidade ou de resultado', body: ['Um domínio mostrado como “disponível” pode ser registrado por outra pessoa antes de você concluir o pagamento. Preços premium e de revenda podem mudar sem aviso. Não garantimos posições de SEO, sucesso de marca nem ausência de conflito de marca.'] },
      { id: 'your-responsibility', heading: 'Sua responsabilidade', body: ['Você é o único responsável por confirmar a disponibilidade na registradora, revisar o custo total (incluindo premium, renovação e taxas da ICANN), fazer a análise de marca e jurídica e cumprir as leis aplicáveis e as políticas da registradora.'] },
      { id: 'limitation-disc', heading: 'Limitação', body: ['Na máxima extensão permitida por lei, o DomainDiscovery não se responsabiliza por decisões tomadas com base nos resultados do serviço. As exclusões de garantia e os limites de responsabilidade estão nos Termos de uso.'] },
    ],
  },
  hi: {
    title: 'अस्वीकरण',
    description: 'DomainDiscovery एक मुफ़्त शोध उपकरण है, रजिस्ट्रार या कानूनी सलाह नहीं। उपलब्धता और कीमत की गारंटी नहीं है।',
    metaDescription: 'DomainDiscovery अस्वीकरण: यह रजिस्ट्रार नहीं है, उपलब्धता या कीमत की गारंटी नहीं देता, और ट्रेडमार्क या कानूनी सलाह नहीं है।',
    sections: [
      { id: 'research-only', heading: 'शोध उपकरण का अस्वीकरण', body: ['DomainDiscovery एक मुफ़्त डोमेन शोध टूलकिट है। दिखाई गई जानकारी — उपलब्धता, प्रीमियम चिह्न, कीमतें, WHOIS/RDAP डेटा, रैंकिंग और बनाए गए नाम — केवल सामान्य जानकारी के लिए है और अधूरी, देर से या गलत हो सकती है।'] },
      { id: 'not-registrar', heading: 'हम रजिस्ट्रार नहीं हैं और भुगतान नहीं लेते', body: ['जब तक भविष्य में अलग से न कहा जाए, हम ICANN-मान्यता प्राप्त रजिस्ट्रार नहीं हैं। यह वेबसाइट डोमेन पंजीकरण का भुगतान संसाधित नहीं करती। पंजीकरण, नवीनीकरण, स्थानांतरण और DNS होस्टिंग तीसरे पक्ष के रजिस्ट्रार आपके साथ अपने समझौते के तहत करते हैं।'] },
      { id: 'no-guarantee', heading: 'उपलब्धता या परिणाम की कोई गारंटी नहीं', body: ['“उपलब्ध” दिखाया गया डोमेन आपके चेकआउट से पहले कोई और पंजीकृत कर सकता है। प्रीमियम और पुनर्विक्रय कीमतें बिना सूचना बदल सकती हैं। हम SEO रैंकिंग, ब्रांड की सफलता या ट्रेडमार्क टकराव से मुक्ति की गारंटी नहीं देते।'] },
      { id: 'your-responsibility', heading: 'आपकी ज़िम्मेदारी', body: ['रजिस्ट्रार पर उपलब्धता जाँचना, कुल शुल्क (प्रीमियम, नवीनीकरण और ICANN शुल्क सहित) देखना, ट्रेडमार्क और कानूनी जाँच करना, तथा लागू कानून और रजिस्ट्रार नीतियों का पालन करना पूरी तरह आपकी ज़िम्मेदारी है।'] },
      { id: 'limitation-disc', heading: 'सीमा', body: ['कानून द्वारा अनुमत अधिकतम सीमा तक, DomainDiscovery सेवा के परिणामों पर आधारित निर्णयों के लिए दायित्व अस्वीकार करता है। पूरी वारंटी अस्वीकृति और दायित्व सीमा उपयोग की शर्तों में है।'] },
    ],
  },
  ar: {
    title: 'إخلاء المسؤولية',
    description: 'DomainDiscovery أداة بحث مجانية، وليست مسجّلاً معتمداً ولا استشارة قانونية. لا ضمان للتوفر أو السعر.',
    metaDescription: 'إخلاء مسؤولية DomainDiscovery: لسنا مسجّلاً، ولا نضمن التوفر أو الأسعار، وهذا ليس استشارة علامات تجارية أو قانونية.',
    sections: [
      { id: 'research-only', heading: 'إخلاء مسؤولية أداة البحث', body: ['DomainDiscovery مجموعة أدوات مجانية لبحث أسماء النطاقات. المعلومات المعروضة — بما فيها التوفر وعلامات الأسعار المميزة والأسعار وبيانات WHOIS/RDAP والترتيب والأسماء المولّدة — للمعلومات العامة فقط، وقد تكون ناقصة أو متأخرة أو غير صحيحة.'] },
      { id: 'not-registrar', heading: 'لسنا مسجّلاً ولا نعالج المدفوعات', body: ['لسنا مسجّلاً معتمداً من ICANN ما لم يُفصح عن ذلك لاحقاً بشكل منفصل. لا نعالج مدفوعات تسجيل النطاقات على هذا الموقع. التسجيل والتجديد والنقل واستضافة DNS تتم لدى مسجّلين آخرين بموجب اتفاقاتهم معك.'] },
      { id: 'no-guarantee', heading: 'لا ضمان للتوفر أو للنتائج', body: ['قد يسجّل شخص آخر نطاقاً يظهر على أنه «متاح» قبل إتمام الدفع. قد تتغير أسعار النطاقات المميزة وسوق إعادة البيع دون إشعار. لا نضمن ترتيب البحث أو نجاح العلامة أو خلّوها من تعارض العلامات التجارية.'] },
      { id: 'your-responsibility', heading: 'مسؤوليتك', body: ['أنت وحدك المسؤول عن التحقق من التوفر لدى المسجّل، ومراجعة إجمالي الرسوم (بما فيها المميزة والتجديد ورسوم ICANN)، وإجراء الفحص القانوني والعلامات التجارية، والالتزام بالقوانين وسياسات المسجّل.'] },
      { id: 'limitation-disc', heading: 'حدود المسؤولية', body: ['إلى أقصى حد يسمح به القانون، يخلي DomainDiscovery مسؤوليته عن القرارات المتخذة بناءً على مخرجات الخدمة. إخلاء الضمانات وحدود المسؤولية الكاملة في شروط الاستخدام.'] },
    ],
  },
  ru: {
    title: 'Отказ от ответственности',
    description: 'DomainDiscovery — бесплатный инструмент исследования, а не регистратор и не юридическая консультация. Доступность и цены не гарантируются.',
    metaDescription: 'Отказ от ответственности DomainDiscovery: это не регистратор, нет гарантии доступности или цены и это не консультация по товарным знакам или праву.',
    sections: [
      { id: 'research-only', heading: 'Отказ в отношении инструмента исследования', body: ['DomainDiscovery — бесплатный набор инструментов для исследования доменов. Показанные сведения — доступность, признаки премиум, цены, данные WHOIS/RDAP, рейтинги и сгенерированные имена — носят общий информационный характер и могут быть неполными, запоздалыми или неверными.'] },
      { id: 'not-registrar', heading: 'Мы не регистратор и не принимаем оплату', body: ['Мы не являемся аккредитованным ICANN регистратором, если иное не будет отдельно указано в будущем. Этот сайт не принимает платежи за регистрацию доменов. Регистрацию, продление, трансфер и DNS-хостинг выполняют сторонние регистраторы по своим договорам с вами.'] },
      { id: 'no-guarantee', heading: 'Нет гарантии доступности или результата', body: ['Домен, показанный как «доступный», может быть зарегистрирован другим лицом до завершения оплаты. Премиум-цены и цены вторичного рынка могут меняться без уведомления. Мы не гарантируем позиции в поиске, успех бренда или отсутствие конфликта товарных знаков.'] },
      { id: 'your-responsibility', heading: 'Ваша ответственность', body: ['Вы самостоятельно проверяете доступность у регистратора, общую стоимость (включая премиум, продление и сборы ICANN), проводите проверку товарных знаков и права и соблюдаете применимые законы и правила регистратора.'] },
      { id: 'limitation-disc', heading: 'Ограничение', body: ['В максимальной степени, разрешенной законом, DomainDiscovery не несет ответственности за решения, принятые на основе результатов сервиса. Полные отказы от гарантий и пределы ответственности указаны в Условиях использования.'] },
    ],
  },
  bn: {
    title: 'দাবিত্যাগ',
    description: 'DomainDiscovery একটি বিনামূল্যের গবেষণা টুল, রেজিস্ট্রার বা আইনি পরামর্শ নয়। প্রাপ্যতা বা দামের নিশ্চয়তা নেই।',
    metaDescription: 'DomainDiscovery দাবিত্যাগ: এটি রেজিস্ট্রার নয়, প্রাপ্যতা বা দামের নিশ্চয়তা দেয় না, এবং ট্রেডমার্ক বা আইনি পরামর্শ নয়।',
    sections: [
      { id: 'research-only', heading: 'গবেষণা টুলের দাবিত্যাগ', body: ['DomainDiscovery একটি বিনামূল্যের ডোমেইন গবেষণা টুলকিট। দেখানো তথ্য — প্রাপ্যতা, প্রিমিয়াম চিহ্ন, দাম, WHOIS/RDAP ডেটা, র‍্যাঙ্কিং এবং তৈরি নাম — শুধু সাধারণ তথ্য, এবং অসম্পূর্ণ, দেরিতে বা ভুল হতে পারে।'] },
      { id: 'not-registrar', heading: 'আমরা রেজিস্ট্রার নই এবং পেমেন্ট নিই না', body: ['ভবিষ্যতে আলাদাভাবে না বলা পর্যন্ত আমরা ICANN-স্বীকৃত রেজিস্ট্রার নই। এই ওয়েবসাইট ডোমেইন নিবন্ধনের পেমেন্ট প্রক্রিয়া করে না। নিবন্ধন, নবায়ন, স্থানান্তর এবং DNS হোস্টিং তৃতীয় পক্ষের রেজিস্ট্রার তাদের চুক্তি অনুসারে করে।'] },
      { id: 'no-guarantee', heading: 'প্রাপ্যতা বা ফলাফলের নিশ্চয়তা নেই', body: ['“উপলভ্য” দেখানো ডোমেইন চেকআউট শেষ হওয়ার আগে অন্য কেউ নিবন্ধন করতে পারে। প্রিমিয়াম ও পুনর্বিক্রয়ের দাম নোটিশ ছাড়া বদলাতে পারে। আমরা SEO র‍্যাঙ্ক, ব্র্যান্ডের সাফল্য বা ট্রেডমার্ক সংঘাতমুক্তির নিশ্চয়তা দিই না।'] },
      { id: 'your-responsibility', heading: 'আপনার দায়িত্ব', body: ['রেজিস্ট্রারে প্রাপ্যতা যাচাই, মোট ফি (প্রিমিয়াম, নবায়ন ও ICANN ফিসহ) দেখা, ট্রেডমার্ক ও আইনি পরীক্ষা, এবং প্রযোজ্য আইন ও রেজিস্ট্রার নীতি মেনে চলা সম্পূর্ণ আপনার দায়িত্ব।'] },
      { id: 'limitation-disc', heading: 'সীমা', body: ['আইন যতদূর অনুমতি দেয়, DomainDiscovery পরিষেবার ফলাফলের ভিত্তিতে নেওয়া সিদ্ধান্তের দায় অস্বীকার করে। সম্পূর্ণ ওয়ারেন্টি অস্বীকার ও দায়সীমা ব্যবহারের শর্তে আছে।'] },
    ],
  },
  ur: {
    title: 'دستبرداری',
    description: 'DomainDiscovery ایک مفت تحقیقی ٹول ہے، رجسٹرار یا قانونی مشورہ نہیں۔ دستیابی یا قیمت کی ضمانت نہیں۔',
    metaDescription: 'DomainDiscovery کی دستبرداری: یہ رجسٹرار نہیں، دستیابی یا قیمت کی ضمانت نہیں دیتا، اور ٹریڈ مارک یا قانونی مشورہ نہیں ہے۔',
    sections: [
      { id: 'research-only', heading: 'تحقیقی ٹول کی دستبرداری', body: ['DomainDiscovery ڈومین تحقیق کا مفت ٹول کٹ ہے۔ دکھائی گئی معلومات — دستیابی، پریمیم نشانات، قیمتیں، WHOIS/RDAP ڈیٹا، درجہ بندی اور بنائے گئے نام — صرف عمومی معلومات کے لیے ہیں اور نامکمل، دیر سے یا غلط ہو سکتی ہیں۔'] },
      { id: 'not-registrar', heading: 'ہم رجسٹرار نہیں اور ادائیگی نہیں لیتے', body: ['جب تک مستقبل میں الگ سے نہ بتایا جائے، ہم ICANN سے تسلیم شدہ رجسٹرار نہیں۔ یہ ویب سائٹ ڈومین رجسٹریشن کی ادائیگی نہیں کرتی۔ رجسٹریشن، تجدید، منتقلی اور DNS ہوسٹنگ فریق ثالث رجسٹرار آپ کے معاہدے کے تحت کرتے ہیں۔'] },
      { id: 'no-guarantee', heading: 'دستیابی یا نتیجے کی کوئی ضمانت نہیں', body: ['“دستیاب” دکھایا گیا ڈومین آپ کے چیک آؤٹ سے پہلے کوئی اور رجسٹر کر سکتا ہے۔ پریمیم اور دوبارہ فروخت کی قیمتیں بغیر اطلاع بدل سکتی ہیں۔ ہم SEO درجہ، برانڈ کی کامیابی یا ٹریڈ مارک تنازع سے پاک ہونے کی ضمانت نہیں دیتے۔'] },
      { id: 'your-responsibility', heading: 'آپ کی ذمہ داری', body: ['رجسٹرار پر دستیابی چیک کرنا، کل فیس (پریمیم، تجدید اور ICANN فیس سمیت) دیکھنا، ٹریڈ مارک اور قانونی جانچ کرنا، اور قابل اطلاق قانون و رجسٹرار پالیسیوں کی پابندی مکمل طور پر آپ کی ذمہ داری ہے۔'] },
      { id: 'limitation-disc', heading: 'حد', body: ['قانون کی اجازت کی آخری حد تک DomainDiscovery سروس کے نتائج پر مبنی فیصلوں کی ذمہ داری سے دستبردار ہے۔ مکمل وارنٹی دستبرداری اور ذمہ داری کی حد استعمال کی شرائط میں ہے۔'] },
    ],
  },
};

export function legalChrome(locale: LocaleId): LegalChrome | null {
  if (locale === 'en') return null;
  return chrome[locale];
}

export function disclaimerCopy(locale: LocaleId): DisclaimerCopy | null {
  if (locale === 'en') return null;
  return disclaimer[locale];
}
