# -*- coding: utf-8 -*-
"""Openings for the TLDs and Security categories: de, es, fr, pt, ru, zh"""
from add_data import add_openings

TLDS = {}
SEC = {}

# ------------------------------------------------------------------ German
TLDS['de'] = {'headings': ["Endungen verstehen: {T}", "gTLD oder ccTLD: die Entscheidung", "SEO-Mythen und Wirklichkeit", "Erst stöbern, dann im Block kaufen"], 'paras': [
 ["{D}",
  "Eine TLD (Top-Level-Domain) ist die Bezeichnung nach dem letzten Punkt – .com, .org, .ai oder ein Ländercode wie .de. Registries legen Regeln und Großhandelspreise fest, Registrare verkaufen die Namen an die Öffentlichkeit.",
  "Wählen Sie Endungen nach Passung zur Zielgruppe, Berechtigung, Preisstabilität und Aussprache der Marke – nicht, weil eine Zeichenfolge diese Woche gerade im Trend liegt."],
 ["Generische TLDs sind meist global. Länder-TLDs können lokale Präsenz signalisieren und länderspezifisches SEO unterstützen, wenn das Unternehmen wirklich lokal ist – manche ccTLDs werden aber als generisch vermarktet (die Regeln unterscheiden sich). Wo lokale Präsenz verlangt wird, gibt es Treuhand-Dienste; lesen Sie die Regeln, bevor Sie kaufen.",
  "Neue gTLDs erweitern die Auswahl und auch die Schwankung der Verlängerungspreise. Prüfen Sie immer den Preis im zweiten Jahr."],
 ["Ein Stichwort in der TLD garantiert keine Rankings. Hilfreiche Inhalte, technische Gesundheit und Reputation zählen mehr. ccTLDs können ein geografisches Signal für das jeweilige Land sein; nutzen Sie hreflang und saubere Lokalisierung, wenn Sie Websites für mehrere Länder betreiben.",
  "Registrieren Sie nicht Dutzende fast identischer TLD-Varianten als Brückenseiten. Schützen Sie die Marke mit einer sinnvollen Schutzauswahl und investieren Sie dann in ein Hauptangebot."],
 ["{BROWSE}",
  "Wählen Sie 1 bis 3 Endungen in die engere Auswahl, die Sie wirklich auf Anzeigen und in E-Mails drucken. Konsequenz schlägt das Sammeln jeder Zeichenfolge, die an einem Dienstag frei war."]]}
SEC['de'] = {'headings': ["Schwerpunkt Sicherheit: {T}", "Sperren, DNSSEC und Datenschutz", "Markenschutz und Verwechslungsdomains", "Checkliste für den Ernstfall"], 'paras': [
 ["{D}",
  "Domainsicherheit ist Kontosicherheit plus Registry-Status plus DNS-Integrität. Angreifer zielen auf Transfers, DNS-Entführungen und ähnlich aussehende Domains für Phishing.",
  "Minimale Grundausstattung: einzigartiges Registrar-Passwort, 2FA, Domainsperre, überwachte Wiederherstellungs-E-Mail und minimale Rechte für Auftragnehmer."],
 ["Die Registrar-Sperre verringert unbefugte Transfers. DNSSEC ergänzt eine kryptografische Prüfung der DNS-Antworten, wenn es durchgängig unterstützt wird. WHOIS-Datenschutz verbirgt persönliche Kontakte vor öffentlichen Scrapern, verhindert aber keine Kontoübernahme.",
  "Erwägen Sie bei wertvollen Marken Registry-Lock-Dienste und ein formelles Änderungsmanagement für DNS-Änderungen."],
 ["Schutzregistrierungen für naheliegende Tippfehler und wichtige TLDs können Missbrauch verringern, aber es gibt unendlich viele Varianten. Priorisieren Sie stark besuchte Schreibweisen und die TLDs, die Ihre Kunden tatsächlich eintippen.",
  "Beobachten Sie Phishing-Meldungen und Certificate Transparency, wo es sinnvoll ist. Schulen Sie Mitarbeitende, unerwartete E-Mails zu Transfers oder DNS-Änderungen nicht zu genehmigen."],
 ["Bei einer Kompromittierung: Registrar-Passwörter ändern, die Sperre wieder aktivieren, Nameserver sowie A- und MX-Einträge prüfen, E-Mail-Zugangsdaten erneuern, Beteiligte informieren und den Ablauf dokumentieren. Bewahren Sie Offline-Kopien von Auth-Codes und Kontonummern auf."]]}

# ------------------------------------------------------------------ Spanish
TLDS['es'] = {'headings': ["Entender las extensiones: {T}", "Decisiones entre gTLD y ccTLD", "Mitos del SEO frente a la realidad", "Explora antes de comprar en bloque"], 'paras': [
 ["{D}",
  "Una TLD (dominio de nivel superior) es la etiqueta que va tras el último punto: .com, .org, .ai o un código de país como .de. Los registros fijan las políticas y los precios mayoristas; los registradores venden los nombres al público.",
  "Elige las extensiones por encaje con el público, elegibilidad, estabilidad del precio y pronunciación de la marca, no porque una cadena parezca de moda esta semana."],
 ["Las TLD genéricas suelen ser globales. Las TLD de código de país pueden indicar presencia local y ayudar al SEO orientado a un país cuando el negocio es realmente local, pero algunas ccTLD se comercializan como genéricas (las políticas varían). Existen servicios de representante donde se exige presencia local; lee las normas antes de comprar.",
  "Las nuevas gTLD amplían las opciones y también la variación de los precios de renovación. Comprueba siempre el precio del segundo año."],
 ["Una palabra clave dentro de la TLD no garantiza posiciones. Importan más el contenido útil, la salud técnica y la reputación. Las ccTLD pueden ser una señal geográfica para ese país; usa hreflang y una localización adecuada si operas sitios en varios países.",
  "Evita registrar decenas de variantes casi idénticas de TLD como páginas puerta. Protege la marca con un conjunto defensivo razonable y después invierte en una experiencia principal."],
 ["{BROWSE}",
  "Preselecciona de 1 a 3 extensiones que de verdad vayas a imprimir en anuncios y correos. La coherencia vale más que coleccionar cada cadena que estaba libre un martes."]]}
SEC['es'] = {'headings': ["Enfoque de seguridad: {T}", "Bloqueos, DNSSEC y privacidad", "Protección de marca y dominios parecidos", "Lista de comprobación ante incidentes"], 'paras': [
 ["{D}",
  "La seguridad de un dominio es la seguridad de la cuenta más el estado en el registro más la integridad del DNS. Los atacantes apuntan a las transferencias, al secuestro del DNS y a dominios parecidos para hacer phishing.",
  "Base mínima: contraseña única en el registrador, 2FA, bloqueo del dominio, correo de recuperación vigilado y acceso con los mínimos privilegios para los colaboradores externos."],
 ["El bloqueo del registrador reduce las transferencias no autorizadas. DNSSEC añade validación criptográfica de las respuestas DNS cuando está soportado de extremo a extremo. La privacidad WHOIS oculta los contactos personales a los rastreadores públicos, pero no impide el robo de la cuenta.",
  "Para marcas de alto valor, valora los servicios de bloqueo en el registro y un control formal de cambios para las ediciones del DNS."],
 ["Los registros defensivos de errores tipográficos evidentes y de las TLD clave pueden reducir los abusos, pero existen infinitas variantes. Prioriza las grafías con más tráfico y las TLD que tus clientes escriben de verdad.",
  "Vigila los informes de phishing y la transparencia de certificados cuando proceda. Enseña al personal a no aprobar correos inesperados de transferencia o de cambios de DNS."],
 ["Si te han comprometido: cambia las contraseñas del registrador, vuelve a activar el bloqueo, revisa los servidores de nombres y los registros A y MX, renueva las credenciales de correo, avisa a las partes interesadas y documenta la cronología. Guarda copias sin conexión de los códigos de autorización y de los números de cuenta."]]}

# ------------------------------------------------------------------ French
TLDS['fr'] = {'headings': ["Comprendre les extensions : {T}", "Décider entre gTLD et ccTLD", "Mythes SEO et réalité", "Parcourir avant d'acheter en masse"], 'paras': [
 ["{D}",
  "Une TLD (domaine de premier niveau) est l'étiquette située après le dernier point : .com, .org, .ai ou un code de pays comme .de. Les registres fixent les règles et les prix de gros ; les bureaux d'enregistrement vendent les noms au public.",
  "Choisissez les extensions selon l'adéquation avec le public, l'éligibilité, la stabilité des prix et la prononciation de la marque, et non parce qu'une chaîne semble à la mode cette semaine."],
 ["Les TLD génériques sont généralement mondiales. Les TLD de code pays peuvent signaler une présence locale et aider le SEO ciblé sur un pays quand l'activité est vraiment locale, mais certaines ccTLD sont commercialisées comme génériques (les règles varient). Des services de mandataire existent quand une présence locale est exigée ; lisez les règles avant d'acheter.",
  "Les nouvelles gTLD élargissent le choix et aussi la variation des prix de renouvellement. Vérifiez toujours le prix de la deuxième année."],
 ["Un mot-clé dans la TLD ne garantit pas le classement. Le contenu utile, la santé technique et la réputation comptent davantage. Les ccTLD peuvent être un signal géographique pour le pays concerné ; utilisez hreflang et une localisation correcte si vous exploitez des sites multipays.",
  "Évitez d'enregistrer des dizaines de variantes quasi identiques de TLD comme pages satellites. Protégez la marque avec un jeu défensif raisonnable, puis investissez dans une expérience principale."],
 ["{BROWSE}",
  "Présélectionnez 1 à 3 extensions que vous imprimerez réellement dans vos annonces et vos e-mails. La cohérence vaut mieux que de collectionner chaque chaîne qui était libre un mardi."]]}
SEC['fr'] = {'headings': ["Focus sécurité : {T}", "Verrous, DNSSEC et confidentialité", "Protection de la marque et domaines sosies", "Liste de contrôle en cas d'incident"], 'paras': [
 ["{D}",
  "La sécurité d'un domaine, c'est la sécurité du compte, plus le statut au registre, plus l'intégrité du DNS. Les attaquants visent les transferts, les détournements de DNS et les domaines sosies pour l'hameçonnage.",
  "Base minimale : mot de passe unique chez le bureau d'enregistrement, 2FA, verrouillage du domaine, e-mail de récupération surveillé et accès au strict minimum pour les prestataires."],
 ["Le verrou du bureau d'enregistrement réduit les transferts non autorisés. DNSSEC ajoute une validation cryptographique des réponses DNS lorsqu'il est pris en charge de bout en bout. La confidentialité WHOIS masque les contacts personnels aux robots d'aspiration publics, mais n'empêche pas la prise de contrôle d'un compte.",
  "Pour les marques de grande valeur, envisagez des services de verrouillage au niveau du registre et un contrôle formel des changements pour les modifications du DNS."],
 ["Les enregistrements défensifs sur les fautes de frappe évidentes et les TLD clés peuvent réduire les abus, mais les variantes sont infinies. Donnez la priorité aux orthographes très fréquentées et aux TLD que vos clients tapent réellement.",
  "Surveillez les signalements d'hameçonnage et la transparence des certificats lorsque c'est pertinent. Apprenez au personnel à ne pas approuver d'e-mails inattendus de transfert ou de modification du DNS."],
 ["En cas de compromission : changez les mots de passe du bureau d'enregistrement, réactivez le verrou, auditez les serveurs de noms et les enregistrements A et MX, renouvelez les identifiants de messagerie, prévenez les parties prenantes et documentez la chronologie. Conservez des copies hors ligne des codes d'autorisation et des numéros de compte."]]}

# ------------------------------------------------------------------ Portuguese
TLDS['pt'] = {'headings': ["Entendendo as extensões: {T}", "Decisões entre gTLD e ccTLD", "Mitos de SEO e a realidade", "Explore antes de comprar em massa"], 'paras': [
 ["{D}",
  "Uma TLD (domínio de nível superior) é o rótulo depois do último ponto: .com, .org, .ai ou um código de país como .de. Os registros definem as políticas e os preços de atacado; os registradores vendem os nomes ao público.",
  "Escolha as extensões por adequação ao público, elegibilidade, estabilidade de preço e pronúncia da marca, e não porque uma sequência parece estar na moda esta semana."],
 ["As TLDs genéricas costumam ser globais. As TLDs de código de país podem sinalizar presença local e ajudar o SEO voltado a um país quando o negócio é realmente local, mas algumas ccTLDs são vendidas como genéricas (as políticas variam). Existem serviços de representante onde se exige presença local; leia as regras antes de comprar.",
  "As novas gTLDs ampliam as opções e também a variação dos preços de renovação. Confira sempre o preço do segundo ano."],
 ["Uma palavra-chave dentro da TLD não garante posições. Conteúdo útil, saúde técnica e reputação importam mais. As ccTLDs podem ser um sinal geográfico para aquele país; use hreflang e localização adequada se você opera sites em vários países.",
  "Evite registrar dezenas de variantes quase idênticas de TLD como páginas-ponte. Proteja a marca com um conjunto defensivo sensato e depois invista em uma experiência principal."],
 ["{BROWSE}",
  "Selecione de 1 a 3 extensões que você realmente vá imprimir em anúncios e e-mails. Consistência vale mais do que colecionar cada sequência que estava livre numa terça-feira."]]}
SEC['pt'] = {'headings': ["Foco em segurança: {T}", "Bloqueios, DNSSEC e privacidade", "Proteção de marca e domínios parecidos", "Checklist para incidentes"], 'paras': [
 ["{D}",
  "A segurança de um domínio é a segurança da conta mais o status no registro mais a integridade do DNS. Os atacantes miram transferências, sequestros de DNS e domínios parecidos para phishing.",
  "Base mínima: senha exclusiva no registrador, 2FA, bloqueio do domínio, e-mail de recuperação monitorado e acesso com o mínimo de privilégios para terceiros."],
 ["O bloqueio do registrador reduz transferências não autorizadas. O DNSSEC adiciona validação criptográfica das respostas de DNS quando há suporte de ponta a ponta. A privacidade do WHOIS oculta contatos pessoais de coletores públicos, mas não impede o sequestro da conta.",
  "Para marcas de alto valor, considere serviços de bloqueio no registro e um controle formal de mudanças para as edições de DNS."],
 ["Registros defensivos de erros de digitação óbvios e das TLDs principais podem reduzir abusos, mas existem infinitas variantes. Priorize as grafias com mais tráfego e as TLDs que seus clientes realmente digitam.",
  "Monitore denúncias de phishing e a transparência de certificados quando for relevante. Oriente a equipe a não aprovar e-mails inesperados de transferência ou de mudança de DNS."],
 ["Se houver comprometimento: troque as senhas do registrador, reative o bloqueio, audite os servidores de nomes e os registros A e MX, renove as credenciais de e-mail, avise as partes interessadas e documente a linha do tempo. Guarde cópias offline dos códigos de autorização e dos números de conta."]]}

# ------------------------------------------------------------------ Russian
TLDS['ru'] = {'headings': ["Понимаем расширения: {T}", "gTLD или ccTLD: как выбрать", "SEO-мифы и реальность", "Сначала изучите, потом покупайте пакетом"], 'paras': [
 ["{D}",
  "TLD (домен верхнего уровня) — это метка после последней точки: .com, .org, .ai или код страны, например .de. Реестры задают правила и оптовые цены; регистраторы продают имена публике.",
  "Выбирайте расширения по соответствию аудитории, допустимости регистрации, стабильности цены и произношению бренда, а не потому, что сочетание букв выглядит модным на этой неделе."],
 ["Универсальные зоны обычно глобальны. Национальные зоны могут сигнализировать о местном присутствии и помогать SEO для конкретной страны, если бизнес действительно локальный, но некоторые ccTLD продаются как универсальные (правила различаются). Там, где нужно местное присутствие, есть услуги доверенных лиц; прочитайте правила до покупки.",
  "Новые gTLD расширяют выбор и увеличивают разброс цен на продление. Всегда проверяйте цену второго года."],
 ["Ключевое слово в зоне не гарантирует позиций. Важнее полезный контент, техническое здоровье сайта и репутация. ccTLD могут быть географическим сигналом для этой страны; используйте hreflang и корректную локализацию, если ведёте сайты для нескольких стран.",
  "Не регистрируйте десятки почти одинаковых вариантов в разных зонах как дорвеи. Защитите бренд разумным защитным набором, а затем вкладывайтесь в один основной сайт."],
 ["{BROWSE}",
  "Выберите 1–3 расширения, которые вы действительно будете указывать в рекламе и почте. Последовательность лучше, чем коллекция каждой строки, которая оказалась свободной во вторник."]]}
SEC['ru'] = {'headings': ["Фокус на безопасности: {T}", "Блокировки, DNSSEC и приватность", "Защита бренда и похожие домены", "Чек-лист на случай инцидента"], 'paras': [
 ["{D}",
  "Безопасность домена — это безопасность аккаунта плюс статус в реестре плюс целостность DNS. Злоумышленники нацеливаются на переносы, перехват DNS и похожие домены для фишинга.",
  "Минимальная база: уникальный пароль у регистратора, 2FA, блокировка домена, контролируемая почта для восстановления и минимально необходимый доступ для подрядчиков."],
 ["Блокировка у регистратора снижает число несанкционированных переносов. DNSSEC добавляет криптографическую проверку ответов DNS, если она поддерживается на всём пути. Приватность WHOIS скрывает личные контакты от публичных парсеров, но не защищает от захвата аккаунта.",
  "Для ценных брендов рассмотрите услуги блокировки на уровне реестра и формальный контроль изменений для правок DNS."],
 ["Защитные регистрации очевидных опечаток и ключевых зон могут снизить число злоупотреблений, но вариантов бесконечно много. Отдавайте приоритет самым посещаемым написаниям и тем зонам, которые ваши клиенты действительно набирают.",
  "Следите за сообщениями о фишинге и прозрачностью сертификатов там, где это уместно. Учите сотрудников не подтверждать неожиданные письма о переносе или изменении DNS."],
 ["Если произошла компрометация: смените пароли у регистратора, снова включите блокировку, проверьте серверы имён и A- и MX-записи, обновите учётные данные почты, уведомите заинтересованных лиц и задокументируйте хронологию. Храните офлайн-копии кодов авторизации и номеров аккаунтов."]]}

# ------------------------------------------------------------------ Chinese
TLDS['zh'] = {'headings': ["认识域名后缀：{T}", "gTLD 与 ccTLD 的取舍", "SEO 误区与现实", "先浏览，再批量购买"], 'paras': [
 ["{D}",
  "TLD（顶级域）是最后一个点之后的标识，例如 .com、.org、.ai，或像 .de 这样的国家和地区代码。注册局制定政策和批发价格，注册商向公众零售名称。",
  "选择后缀时，应考虑受众契合度、注册资格、价格稳定性以及品牌的发音，而不是因为某个字符串这周看起来很流行。"],
 ["通用 TLD 通常面向全球。国家和地区代码 TLD 可以体现本地存在，在业务确实面向本地时可能有利于面向该国的 SEO；但有些 ccTLD 被当作通用域名推广（政策各不相同）。在要求本地存在的地方有受托代理服务，购买前请先阅读规则。",
  "新 gTLD 拓宽了选择，也扩大了续费价格的差异。务必核查第二年的价格。"],
 ["TLD 里带关键词并不能保证排名。有用的内容、技术健康度和声誉更重要。ccTLD 可以成为面向该国的地理信号；如果你运营多国站点，请使用 hreflang 和恰当的本地化。",
  "不要把几十个近乎重复的 TLD 变体当作门页注册。用一组合理的防御性注册保护品牌，然后把精力投入一个主要体验上。"],
 ["{BROWSE}",
  "筛选出 1 到 3 个你真的会印在广告和邮件上的后缀。始终如一，胜过收集每一个在某个周二恰好可注册的字符串。"]]}
SEC['zh'] = {'headings': ["安全聚焦：{T}", "锁定、DNSSEC 与隐私", "品牌保护与相似域名", "事件应对清单"], 'paras': [
 ["{D}",
  "域名安全等于账号安全，加上注册局状态，再加上 DNS 完整性。攻击者会盯上域名转移、DNS 劫持，以及用于钓鱼的相似域名。",
  "最低基线：注册商使用唯一密码、双重验证、域名锁定、有人监控的找回邮箱，以及对外部承包人只授予最小权限。"],
 ["注册商锁定可减少未经授权的转移。当端到端都支持时，DNSSEC 会对 DNS 响应增加加密验证。WHOIS 隐私保护能让公开爬虫看不到个人联系方式，但无法阻止账号被接管。",
  "对于高价值品牌，可以考虑注册局锁定服务，并对 DNS 修改建立正式的变更管控。"],
 ["对明显的拼写错误和关键 TLD 做防御性注册可以减少滥用，但变体是无穷无尽的。优先考虑访问量高的拼写，以及你的客户实际会输入的 TLD。",
  "在相关场景下，关注钓鱼举报和证书透明度。培训员工不要批准意外收到的转移或 DNS 变更邮件。"],
 ["如果账号被攻破：更换注册商密码、重新启用锁定、核查名称服务器以及 A 记录和 MX 记录、更换邮箱凭据、通知相关方，并记录时间线。离线保存授权码和账号编号的副本。"]]}

add_openings('TLDs', TLDS)
add_openings('Security', SEC)
print('openings added (a):', sorted(TLDS), sorted(SEC))
