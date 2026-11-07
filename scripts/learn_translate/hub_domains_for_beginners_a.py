# -*- coding: utf-8 -*-
"""domains-for-beginners: de, es, fr, pt, ru, zh"""
import tpl
from lm import put

S = 'domains-for-beginners'

def run(lang, T, short, rest, rt, topics, secs, extra_heading_n=10):
    """secs = seven opening sections as [heading, [paragraphs]]; generic blocks are appended from blocks.json."""
    full = f"{short} {rest}"
    blocks = tpl._blocks()[lang]
    sections = [list(s) for s in secs]
    for key in ('impl', 'examples', 'extra'):
        blk = blocks[key]
        heading = blk['heading'].replace('{T}', T).replace('{N}', str(extra_heading_n))
        sections.append([heading, [p.replace('{T}', T) for p in blk['body']]])
    put(S, lang, T, full, tpl.CAT['Beginner'][lang], rt, topics, sections)

run('de', "Domainnamen für absolute Einsteiger",
 "Was Domains sind, wie die Registrierung funktioniert und Ihre ersten 24 Stunden nach dem Kauf.",
 "Lernen Sie praktische Schritte, Risiken und DomainDiscovery-Abläufe für Domainnamen-Suche und Registrierungsrecherche kennen.",
 "6 Min. Lesezeit", ["Einsteiger", "Grundlagen"], [
 ["Was ist ein Domainname?", [
  "Ein Domainname ist die Adresse, die Menschen eintippen, um Ihre Website oder Ihre E-Mail zu erreichen – zum Beispiel deinemarke.com. Er lässt sich leichter merken als rohe Serveradressen. Wenn Sie eine Domain „besitzen“, kontrollieren Sie über einen Registrar für einen bestimmten Zeitraum eine Registrierung, vorbehaltlich der Regeln der Registry und der Verlängerung.",
  "Einsteiger verwechseln Domains oft mit Websites und Hosting. Die Domain ist der Name, das Hosting ist der Ort, an dem die Dateien liegen, und DNS verbindet den Namen mit dem Host. Sie können eine Domain registrieren, bevor Sie eine Website starten."]],
 ["Die Checkliste für die erste Woche", [
  "Tag 1: Namensideen sammeln und schwierige Schreibweisen aussortieren. Tag 2: Die Domainnamen-Suche bei DomainDiscovery starten und frei von vergeben unterscheiden. Tag 3: Schnelle Markenrecherche in Ihrem Land. Tag 4: Registrierungs- und Verlängerungspreise vergleichen. Tag 5: Mit 2FA und Sperre registrieren. Tag 6: DNS oder eine vorübergehende Landingpage einrichten. Tag 7: E-Mail oder Weiterleitung einrichten und die Kontoinhaberschaft dokumentieren.",
  "Sie brauchen kein riesiges Portfolio. Eine Hauptdomain, die überall verwendet wird, schlägt fünf vernachlässigte Experimente."]],
 ["So wählen Sie Ihre erste Domain", [
  "Bevorzugen Sie eine klare Aussprache, eine einfache Schreibweise und eine TLD, der Ihr Publikum vertraut (.com führt für viele globale Verbrauchermarken noch immer). Vermeiden Sie Bindestriche und Zahlen, es sei denn, sie sind wirklich Teil der Marke.",
  "Ist die perfekte .com vergeben, erwägen Sie einen starken Markennamen, eine passende andere TLD, die Sie wirklich bewerben werden, oder einen seriösen Kauf – keine verwechselbare Nachahmung einer berühmten Marke."]],
 ["Registrierung ohne Panik", [
  "Nutzen Sie einen seriösen Registrar, lesen Sie die Verlängerungspreise und deaktivieren Sie unnötige Pakete, wenn Sie sie nicht brauchen. Aktivieren Sie die automatische Verlängerung nur, wenn Ihr Zahlungsmittel gültig bleibt, und setzen Sie trotzdem eine Kalendererinnerung.",
  "Was Domains sind, wie die Registrierung funktioniert und Ihre ersten 24 Stunden nach dem Kauf."]],
 ["Nach dem Kauf", [
  "Sperren Sie die Domain, bestätigen Sie die E-Mail-Adresse des Kontos und richten Sie DNS ein, sobald Sie bereit sind. Fügen Sie SPF/DKIM vor größeren E-Mail-Kampagnen hinzu. Bewahren Sie Screenshots von Belegen und Authentifizierungs-Einstellungen auf.",
  "Mehr dazu in unseren Leitfäden zur Domain-Registrierung, zur Erklärung der Domain-Registrierung und zur Checkliste für den sicheren Kauf – und üben Sie dann mit der kostenlosen Suche bei DomainDiscovery."]],
 ["So hilft DomainDiscovery Einsteigern", [
  "Suchen Sie die Live-Verfügbarkeit, stöbern Sie bei den Endungen, erzeugen Sie Alternativen, prüfen Sie WHOIS und vergleichen Sie reguläre Preise – ohne für die Recherche ein Konto anzulegen. Sind Sie bereit, schließen Sie den Kauf bei Ihrem gewählten Registrar ab.",
  "Als Nächstes: Lesen Sie den Leitfaden zur Domainnamen-Suche und den Leitfaden zur Registrierung im Einsteiger-Bereich."]],
 ["FAQ für absolute Einsteiger", [
  "Q: Kann ich meine Domain später umziehen? A: In der Regel ja, per Transfer, vorbehaltlich Sperren und Richtlinien. Q: Brauche ich sofort Hosting? A: Nein. Q: Ist Datenschutz Pflicht? A: In vielen Fällen optional – die Kontosicherheit bleibt trotzdem nötig. Q: Sind kostenlose Domains sicher? A: „Kostenlos“ bedeutet oft eingeschränkte Nutzung oder gebündelte Bedingungen – lesen Sie die Bedingungen."]],
])

run('es', "Nombres de dominio para principiantes absolutos",
 "Qué son los dominios, cómo funciona el registro y tus primeras 24 horas después de comprar.",
 "Aprende pasos prácticos, riesgos y flujos de trabajo de DomainDiscovery para la búsqueda de nombres de dominio y la investigación del registro.",
 "6 min de lectura", ["Principiante", "Fundamentos"], [
 ["¿Qué es un nombre de dominio?", [
  "Un nombre de dominio es la dirección que la gente escribe para llegar a tu sitio web o a tu correo, por ejemplo tumarca.com. Es más fácil de recordar que las direcciones crudas de los servidores. Cuando «eres dueño» de un dominio, controlas un registro durante un periodo a través de un registrador, sujeto a las políticas del registro y a la renovación.",
  "Los principiantes suelen confundir dominios con sitios web y alojamiento. El dominio es el nombre; el alojamiento es donde viven los archivos; el DNS conecta el nombre con el servidor. Puedes registrar un dominio antes de lanzar un sitio."]],
 ["La lista de tareas de la primera semana", [
  "Día 1: anota ideas de nombres y descarta las grafías difíciles. Día 2: haz la búsqueda de nombres de dominio en DomainDiscovery y anota qué está libre y qué está ocupado. Día 3: búsqueda rápida de marcas en tu país. Día 4: compara los precios de registro y de renovación. Día 5: registra con 2FA y bloqueo. Día 6: configura el DNS o una página provisional. Día 7: crea el correo o el reenvío y documenta la titularidad de la cuenta.",
  "No necesitas una cartera enorme. Un dominio principal usado en todas partes vale más que cinco experimentos abandonados."]],
 ["Cómo elegir tu primer dominio", [
  "Prefiere una pronunciación clara, una escritura sencilla y una TLD en la que confíe tu público (el .com sigue liderando en muchas marcas de consumo globales). Evita guiones y números salvo que formen realmente parte de la marca.",
  "Si el .com perfecto está ocupado, considera un buen nombre de marca, otra TLD relevante que de verdad vayas a promocionar o una compra legítima; no una imitación confusa de una marca famosa."]],
 ["Registrar sin pánico", [
  "Usa un registrador de confianza, lee los precios de renovación y desactiva los paquetes innecesarios si no los necesitas. Activa la renovación automática solo si tu método de pago seguirá siendo válido; aun así, mantén un recordatorio en el calendario.",
  "Qué son los dominios, cómo funciona el registro y tus primeras 24 horas después de comprar."]],
 ["Después de comprar", [
  "Bloquea el dominio, verifica el correo de la cuenta y configura el DNS cuando estés listo. Añade SPF/DKIM antes de campañas de correo importantes. Conserva capturas de los recibos y de los ajustes relacionados con la autenticación.",
  "Aprende más con nuestras guías sobre cómo registrar un dominio, el registro de dominios explicado y las listas de comprobación para una compra segura; y practica después con la búsqueda gratuita de DomainDiscovery."]],
 ["Cómo ayuda DomainDiscovery a los principiantes", [
  "Busca la disponibilidad en vivo, explora las extensiones, genera alternativas, consulta el WHOIS y compara los precios regulares, sin crear una cuenta para investigar. Cuando estés listo, completa la compra en el registrador que elijas.",
  "Siguiente paso: lee la guía de búsqueda de nombres de dominio y la guía de cómo registrar del grupo para principiantes."]],
 ["FAQ para principiantes absolutos", [
  "Q: ¿Puedo mover mi dominio más tarde? A: Normalmente sí, mediante una transferencia, sujeta a bloqueos y políticas. Q: ¿Necesito alojamiento de inmediato? A: No. Q: ¿Es obligatoria la protección de privacidad? A: En muchos casos es opcional; la seguridad de la cuenta sigue siendo imprescindible. Q: ¿Son seguros los dominios gratuitos? A: «Gratis» suele significar uso limitado o condiciones agrupadas; lee los términos."]],
])

run('fr', "Les noms de domaine pour les vrais débutants",
 "Ce que sont les domaines, comment fonctionne l'enregistrement et vos 24 premières heures après l'achat.",
 "Découvrez des étapes pratiques, les risques et les processus DomainDiscovery pour la recherche de nom de domaine et la préparation de l'enregistrement.",
 "6 min de lecture", ["Débutant", "Notions de base"], [
 ["Qu'est-ce qu'un nom de domaine ?", [
  "Un nom de domaine est l'adresse que les gens tapent pour atteindre votre site web ou votre messagerie, par exemple votremarque.com. Il est plus facile à retenir que les adresses brutes des serveurs. Quand vous « possédez » un domaine, vous contrôlez un enregistrement pour une période donnée via un bureau d'enregistrement, sous réserve des règles du registre et du renouvellement.",
  "Les débutants confondent souvent domaines, sites web et hébergement. Le domaine est le nom ; l'hébergement est l'endroit où vivent les fichiers ; le DNS relie le nom à l'hébergeur. Vous pouvez enregistrer un domaine avant de lancer un site."]],
 ["La liste de contrôle de la première semaine", [
  "Jour 1 : listez des idées de noms et éliminez les orthographes difficiles. Jour 2 : lancez la recherche de nom de domaine sur DomainDiscovery et notez ce qui est libre ou pris. Jour 3 : recherche rapide de marques dans votre pays. Jour 4 : comparez les prix d'enregistrement et de renouvellement. Jour 5 : enregistrez avec 2FA et verrouillage. Jour 6 : configurez le DNS ou une page d'attente. Jour 7 : créez l'e-mail ou la redirection et consignez qui possède le compte.",
  "Vous n'avez pas besoin d'un énorme portefeuille. Un domaine principal utilisé partout vaut mieux que cinq expériences négligées."]],
 ["Comment choisir votre premier domaine", [
  "Privilégiez une prononciation claire, une orthographe simple et une TLD en laquelle votre public a confiance (le .com domine encore pour beaucoup de marques grand public mondiales). Évitez les tirets et les chiffres, sauf s'ils font vraiment partie de la marque.",
  "Si le .com idéal est pris, envisagez une marque forte, une autre TLD pertinente que vous promouvrez réellement, ou un achat légitime, pas un sosie prêtant à confusion avec une marque célèbre."]],
 ["S'enregistrer sans panique", [
  "Choisissez un bureau d'enregistrement réputé, lisez les prix de renouvellement et désactivez les offres groupées inutiles. Activez le renouvellement automatique seulement si votre moyen de paiement reste valable ; gardez tout de même un rappel dans votre calendrier.",
  "Ce que sont les domaines, comment fonctionne l'enregistrement et vos 24 premières heures après l'achat."]],
 ["Après l'achat", [
  "Verrouillez le domaine, vérifiez l'e-mail du compte et configurez le DNS quand vous êtes prêt. Ajoutez SPF/DKIM avant les grandes campagnes d'e-mail. Conservez des captures d'écran des reçus et des réglages d'authentification.",
  "Approfondissez avec nos guides sur la façon d'enregistrer un domaine, l'enregistrement de domaine expliqué et les listes de contrôle pour un achat sûr, puis exercez-vous avec la recherche gratuite de DomainDiscovery."]],
 ["Comment DomainDiscovery aide les débutants", [
  "Recherchez la disponibilité en direct, parcourez les extensions, générez des alternatives, consultez WHOIS et comparez les prix habituels, sans créer de compte pour vos recherches. Quand vous êtes prêt, finalisez l'achat chez le bureau d'enregistrement de votre choix.",
  "Ensuite : lisez le guide de la recherche de nom de domaine et le guide pour s'enregistrer, dans le groupe Débutant."]],
 ["FAQ pour les débutants complets", [
  "Q: Puis-je déplacer mon domaine plus tard ? A: En général oui, par transfert, sous réserve des verrous et des politiques. Q: Ai-je besoin d'un hébergement tout de suite ? A: Non. Q: La protection de la vie privée est-elle obligatoire ? A: Souvent facultative ; la sécurité du compte reste indispensable. Q: Les domaines gratuits sont-ils sûrs ? A: « Gratuit » signifie souvent usage limité ou conditions groupées ; lisez les conditions."]],
])

run('pt', "Nomes de domínio para iniciantes completos",
 "O que são domínios, como funciona o registro e as suas primeiras 24 horas depois da compra.",
 "Conheça passos práticos, riscos e fluxos de trabalho do DomainDiscovery para a pesquisa de nome de domínio e a preparação do registro.",
 "6 min de leitura", ["Iniciante", "Fundamentos"], [
 ["O que é um nome de domínio?", [
  "Um nome de domínio é o endereço que as pessoas digitam para chegar ao seu site ou e-mail, por exemplo suamarca.com. É mais fácil de lembrar do que endereços brutos de servidor. Quando você “é dono” de um domínio, controla um registro por um período por meio de um registrador, sujeito às políticas do registro e à renovação.",
  "Iniciantes costumam confundir domínios com sites e hospedagem. O domínio é o nome; a hospedagem é onde ficam os arquivos; o DNS liga o nome à hospedagem. Você pode registrar um domínio antes de lançar um site."]],
 ["A lista da primeira semana", [
  "Dia 1: liste ideias de nomes e elimine grafias difíceis. Dia 2: faça a pesquisa de nome de domínio no DomainDiscovery e anote o que está livre e o que está ocupado. Dia 3: busca rápida de marcas no seu país. Dia 4: compare os preços de registro e de renovação. Dia 5: registre com 2FA e bloqueio. Dia 6: configure o DNS ou uma página provisória. Dia 7: crie o e-mail ou o redirecionamento e documente a titularidade da conta.",
  "Você não precisa de um portfólio enorme. Um domínio principal usado em todos os lugares vale mais do que cinco experimentos abandonados."]],
 ["Como escolher o seu primeiro domínio", [
  "Prefira pronúncia clara, grafia simples e uma TLD em que o seu público confie (o .com ainda lidera em muitas marcas de consumo globais). Evite hifens e números, a menos que realmente façam parte da marca.",
  "Se o .com perfeito estiver ocupado, considere uma marca forte, outra TLD relevante que você realmente vá divulgar ou uma compra legítima; nunca uma imitação confusa de uma marca famosa."]],
 ["Registro sem pânico", [
  "Use um registrador confiável, leia os preços de renovação e desative pacotes desnecessários se não precisar deles. Ative a renovação automática apenas se a sua forma de pagamento continuar válida; mesmo assim, mantenha um lembrete no calendário.",
  "O que são domínios, como funciona o registro e as suas primeiras 24 horas depois da compra."]],
 ["Depois de comprar", [
  "Bloqueie o domínio, verifique o e-mail da conta e configure o DNS quando estiver pronto. Adicione SPF/DKIM antes de grandes campanhas de e-mail. Guarde capturas de tela dos recibos e das configurações de autenticação.",
  "Saiba mais com nossos guias sobre como registrar um domínio, registro de domínio explicado e checklists de compra segura; depois pratique com a pesquisa gratuita do DomainDiscovery."]],
 ["Como o DomainDiscovery ajuda iniciantes", [
  "Pesquise a disponibilidade ao vivo, explore as extensões, gere alternativas, consulte o WHOIS e compare os preços regulares, sem criar conta para pesquisar. Quando estiver pronto, conclua a compra no registrador escolhido.",
  "Próximo passo: leia o guia de pesquisa de nome de domínio e o guia de como registrar, do grupo Iniciante."]],
 ["FAQ para iniciantes absolutos", [
  "Q: Posso mover meu domínio depois? A: Normalmente sim, por transferência, sujeita a bloqueios e políticas. Q: Preciso de hospedagem imediatamente? A: Não. Q: A proteção de privacidade é obrigatória? A: Em muitos casos é opcional; a segurança da conta continua sendo necessária. Q: Domínios gratuitos são seguros? A: “Grátis” costuma significar uso limitado ou condições combinadas; leia os termos."]],
])

run('ru', "Доменные имена для полных новичков",
 "Что такое домены, как работает регистрация и ваши первые 24 часа после покупки.",
 "Узнайте о практических шагах, рисках и процессах DomainDiscovery для поиска доменных имён и подготовки регистрации.",
 "6 мин чтения", ["Для начинающих", "Основы"], [
 ["Что такое доменное имя?", [
  "Доменное имя — это адрес, который люди вводят, чтобы попасть на ваш сайт или почту, например yourbrand.com. Его проще запомнить, чем сырые адреса серверов. Когда вы «владеете» доменом, вы на определённый срок контролируете регистрацию через регистратора на условиях правил реестра и продления.",
  "Новички часто путают домены с сайтами и хостингом. Домен — это имя; хостинг — место, где лежат файлы; DNS связывает имя с хостингом. Домен можно зарегистрировать до запуска сайта."]],
 ["Чек-лист первой недели", [
  "День 1: составьте список идей и отсейте сложные написания. День 2: запустите поиск доменных имён на DomainDiscovery и отметьте свободные и занятые. День 3: быстрая проверка товарных знаков в вашей стране. День 4: сравните цены регистрации и продления. День 5: зарегистрируйте домен с 2FA и блокировкой. День 6: настройте DNS или временную страницу. День 7: настройте почту или пересылку и зафиксируйте, кто владеет аккаунтом.",
  "Вам не нужен огромный портфель. Один основной домен, который используется везде, лучше пяти заброшенных экспериментов."]],
 ["Как выбрать первый домен", [
  "Предпочитайте понятное произношение, простое написание и зону, которой доверяет ваша аудитория (.com по-прежнему лидирует у многих глобальных потребительских брендов). Избегайте дефисов и цифр, если они действительно не часть бренда.",
  "Если идеальный .com занят, рассмотрите сильное брендовое имя, подходящую другую зону, которую вы действительно будете продвигать, или законную покупку — но не запутывающую копию известного бренда."]],
 ["Регистрация без паники", [
  "Выбирайте надёжного регистратора, читайте цены продления и отключайте ненужные пакеты услуг. Включайте автопродление только если способ оплаты останется действующим; всё равно поставьте напоминание в календаре.",
  "Что такое домены, как работает регистрация и ваши первые 24 часа после покупки."]],
 ["После покупки", [
  "Заблокируйте домен, проверьте почту аккаунта и настройте DNS, когда будете готовы. Добавьте SPF/DKIM до крупных почтовых рассылок. Сохраняйте скриншоты квитанций и настроек аутентификации.",
  "Узнайте больше из наших руководств о том, как зарегистрировать домен, о регистрации домена простыми словами и о чек-листах безопасной покупки, а затем потренируйтесь в бесплатном поиске DomainDiscovery."]],
 ["Чем DomainDiscovery помогает новичкам", [
  "Проверяйте актуальную доступность, изучайте расширения, генерируйте альтернативы, смотрите WHOIS и сравнивайте обычные цены — без создания аккаунта для исследований. Когда будете готовы, завершите покупку у выбранного регистратора.",
  "Дальше: прочитайте руководство по поиску доменных имён и руководство по регистрации из раздела для начинающих."]],
 ["FAQ для абсолютных новичков", [
  "Q: Можно ли потом перенести домен? A: Обычно да, через трансфер, с учётом блокировок и правил. Q: Нужен ли хостинг сразу? A: Нет. Q: Обязательна ли защита приватности? A: Во многих случаях необязательна; безопасность аккаунта нужна всё равно. Q: Безопасны ли бесплатные домены? A: «Бесплатно» часто означает ограниченное использование или связанные условия — читайте условия."]],
])

run('zh', "写给完全新手的域名指南",
 "什么是域名、注册如何运作，以及购买后的头 24 小时。",
 "了解实用步骤、风险，以及 DomainDiscovery 在域名查询和注册调研方面的工作流程。",
 "阅读约 6 分钟", ["入门", "基础知识"], [
 ["什么是域名？", [
  "域名是人们输入以访问你的网站或邮箱的地址，例如 yourbrand.com。它比原始的服务器地址更容易记住。当你“拥有”一个域名时，实际上是通过注册商在一段时间内控制一项注册，并受注册局政策和续费规则约束。",
  "新手常常把域名与网站和主机搞混。域名是名称；主机是文件存放的地方；DNS 把名称连接到主机。你可以在建站之前先注册域名。"]],
 ["第一周清单", [
  "第 1 天：列出名称创意，淘汰难拼写的。第 2 天：在 DomainDiscovery 进行域名查询，记下哪些可注册、哪些已被占用。第 3 天：在你所在的国家快速查一下商标。第 4 天：比较注册价和续费价。第 5 天：开启双重验证和锁定后注册。第 6 天：设置 DNS 或临时落地页。第 7 天：创建邮箱或转发，并记录账号归属。",
  "你不需要庞大的域名组合。一个到处使用的主域名，胜过五个被忽视的试验。"]],
 ["如何选择你的第一个域名", [
  "优先选择发音清晰、拼写简单、且受你的受众信任的 TLD（对许多全球消费品牌来说，.com 仍然领先）。避免连字符和数字，除非它们确实是品牌的一部分。",
  "如果理想的 .com 已被占用，可以考虑有力的品牌名、一个你真的会推广的相关备选 TLD，或正当的购买途径，而不是容易与知名品牌混淆的相似名称。"]],
 ["从容完成注册", [
  "选择信誉良好的注册商，阅读续费价格，不需要的捆绑服务就关闭。只有在你的付款方式持续有效时才启用自动续费，同时仍要在日历里设置提醒。",
  "什么是域名、注册如何运作，以及购买后的头 24 小时。"]],
 ["购买之后", [
  "锁定域名，验证账号邮箱，准备好后配置 DNS。在大规模邮件营销之前添加 SPF/DKIM。保留收据以及与身份验证相关设置的截图。",
  "通过我们关于如何注册域名、域名注册详解和安全购买清单的指南了解更多，然后用 DomainDiscovery 的免费查询练习。"]],
 ["DomainDiscovery 如何帮助新手", [
  "实时查询可用性、浏览后缀、生成备选名称、查看 WHOIS，并对比常规价格，做调研无需创建账号。准备好之后，到你选定的注册商完成购买。",
  "下一步：阅读入门类别中的域名查询指南和注册指南。"]],
 ["FAQ：写给完全新手", [
  "Q: 我以后可以转移域名吗？ A: 通常可以，通过转移办理，需遵守锁定和相关政策。 Q: 我需要立刻买主机吗？ A: 不需要。 Q: 必须开启隐私保护吗？ A: 在许多情况下是可选的；但账号安全仍然是必须的。 Q: 免费域名安全吗？ A: “免费”往往意味着有限使用或捆绑条件，请仔细阅读条款。"]],
])
