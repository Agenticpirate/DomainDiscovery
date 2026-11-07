# -*- coding: utf-8 -*-
"""Batch b4 data (part 1): Aftermarket, Legal, Expired openings for de, es, fr, pt, ru, zh"""
from add_data import add_openings
AFT = {}
LEG = {}
EXP = {}

AFT['de'] = {'headings': ["Aftermarket-Leitfaden: {T}", "Auktionen und Drops in der Praxis", "Escrow und Transfer", "Wann man aussteigen sollte"], 'paras': [
 ["{D}",
  "Der Aftermarket umfasst Auktionen, abgelaufene Domains (Drops), Festpreisangebote und vermittelte Geschäfte. Gebühren, Fristen und Transferabläufe unterscheiden sich je nach Plattform – lesen Sie die Regeln, bevor Sie bieten.",
  "Prüfen Sie immer erneut das Markenrisiko und die Historie des Namens. Ein günstiger Zuschlag mit toxischen Backlinks oder rechtlichem Ballast ist kein Gewinn."],
 ["Auktionen für abgelaufene Domains und Drop-Catching sind hart umkämpft. Planen Sie Gebühren und Verlängerungen ein. Halten Sie Zahlungsmittel bereit; eine gescheiterte Zahlung kann den Namen und Strafgebühren kosten.",
  "Fast-Transfer-Netzwerke können die Lieferung beschleunigen, wenn beide Seiten angeschlossen sind – klären Sie die Berechtigung frühzeitig."],
 ["Nutzen Sie bei größeren Summen einen seriösen Escrow-Dienst. Prüfen Sie den Entsperrstatus, die Auth-Codes und die 60-Tage-Transfersperre nach kürzlichen Änderungen. Machen Sie Screenshots der Vereinbarungen.",
  "Schlagen Sie Inhaber und Daten per WHOIS/RDAP unter /tools/whois nach, wenn Sie eine Due-Diligence-Prüfung brauchen."],
 ["Steigen Sie aus, wenn der Verkäufer Escrow verweigert, der Druck extrem ist, die Historie nach Spam aussieht oder der Name nur als Markenfalle funktioniert. Es kommt immer wieder neues Inventar; rechtliche Probleme bleiben."]]}
LEG['de'] = {'headings': ["Rechtsgrundlagen: {T}", "Hygiene beim Markenrisiko", "Datenschutz und Daten", "Der praktische, sichere Weg"], 'paras': [
 ["{D}",
  "Dieser Leitfaden dient der Information und ist keine Rechtsberatung. Domainstreitigkeiten betreffen häufig Marken, Vorwürfe bösgläubiger Registrierung und Regeln, die je nach Rechtsordnung abweichen. Wenn es um nennenswerte Summen oder Markenrisiken geht, ziehen Sie eine qualifizierte Anwältin oder einen qualifizierten Anwalt hinzu.",
  "UDRP und verwandte Verfahren gibt es für eindeutig missbräuchliche Registrierungen; sie sind keine kostenlose Wiederholung für jede gescheiterte Verhandlung."],
 ["Recherchieren Sie Marken in Ihren Zielmärkten, bevor Sie registrieren oder bieten. Meiden Sie bekannte Marken und verwechslungsfähig ähnliche Zeichenfolgen bei verwandten Waren und Dienstleistungen. „Ich habe einen Bindestrich ergänzt“ ist keine Strategie.",
  "Defensive Registrierungen der eigenen Marke sind etwas anderes, als die Marke eines Dritten ins Visier zu nehmen."],
 ["WHOIS-Datenschutz, die Schwärzung seit der DSGVO und die Datenverarbeitung durch Registrare bestimmen, was die Öffentlichkeit sehen kann. Pflichten zu korrekten Kontodaten bei Ihrem Registrar bestehen weiterhin."],
 ["Wählen Sie nach Möglichkeit originelle Brandables, dokumentieren Sie die legitime Nutzung, bewahren Sie Nachweise zu Registrierungsdaten auf und vermeiden Sie Muster, die wie massenhaftes Anvisieren von Marken aussehen."]]}
EXP['de'] = {'headings': ["Abgelaufene Domains: {T}", "Recherche-Ablauf", "Warnsignale", "Nach dem Erwerb"], 'paras': [
 ["{D}",
  "Abgelaufene und gelöschte Namen können wertvoll oder toxisch sein. Prüfen Sie Archivhistorie, Qualität des Backlink-Profils, Markenkonflikte und ob die frühere Nutzung zu Ihren Plänen passt.",
  "SEO-Abkürzungen über „alte Domains“ enttäuschen oft, wenn die Historie spammig oder irrelevant ist."],
 ["Kandidaten auflisten → historische Snapshots prüfen → Links untersuchen → WHOIS/RDAP-Historie, soweit verfügbar → Markenprüfung → Höchstgebot inklusive Gebühren → Plan fürs Abfangen oder Ersteigern → DNS nach dem Erwerb bereinigen."],
 ["Pharma-Spam, Malware-Bezüge, gehackte Link-Netzwerke oder frühere Markenimitation sind typische Warnsignale. Im Zweifel überspringen – es gibt reichlich Inventar."],
 ["Ändern Sie Passwörter und Sperren, richten Sie sauberes DNS ein, nutzen Sie Disavow nur mit Bedacht und wenn Sie den Ablauf verstehen, und bauen Sie mit eigenen Inhalten neu auf. Täuschen Sie Nutzer nicht mit Cloaking oder Bait-and-Switch gegenüber früheren Erwartungen."]]}

AFT['es'] = {'headings': ["Guía del mercado secundario: {T}", "Realidades de las subastas y los drops", "Escrow y transferencia", "Cuándo retirarse"], 'paras': [
 ["{D}",
  "El mercado secundario incluye subastas, dominios caducados (drops), anuncios a precio fijo y operaciones con intermediario. Las comisiones, los plazos y la mecánica de transferencia cambian según la plataforma: lee las reglas de cada una antes de pujar.",
  "Vuelve a comprobar siempre el riesgo de marca y el historial del nombre. Una ganga con backlinks tóxicos o problemas legales no es una ganga."],
 ["Las subastas de caducados y el drop-catching son muy competitivos. Presupuesta comisiones y renovaciones. Ten listos los medios de pago; un pago fallido puede costarte el nombre y penalizaciones.",
  "Las redes de transferencia rápida pueden acelerar la entrega si ambas partes están inscritas: confirma la elegibilidad cuanto antes."],
 ["Usa un escrow de confianza para sumas importantes. Confirma el estado de desbloqueo, los códigos de autorización y los bloqueos de transferencia de 60 días tras cambios recientes. Haz capturas de los acuerdos.",
  "Consulta titularidad y fechas con WHOIS/RDAP en /tools/whois cuando necesites hacer la debida diligencia."],
 ["Retírate si el vendedor rechaza el escrow, la presión es extrema, el historial parece spam o el nombre solo funciona como trampa de marca. Siempre aparecerá otro dominio; los problemas legales perduran."]]}
LEG['es'] = {'headings': ["Nociones legales: {T}", "Higiene del riesgo de marcas", "Privacidad y datos", "Camino práctico y seguro"], 'paras': [
 ["{D}",
  "Esta guía es educativa y no constituye asesoramiento jurídico. Las disputas de dominios suelen implicar marcas, acusaciones de registro de mala fe y normas que dependen de la jurisdicción. Si hay dinero o riesgo de marca de por medio, consulta a un abogado cualificado.",
  "La UDRP y los procesos afines existen para registros claramente abusivos; no son una segunda oportunidad gratuita para cada negociación fallida."],
 ["Busca marcas en tus mercados objetivo antes de registrar o pujar. Evita marcas famosas y cadenas confusamente similares en productos o servicios relacionados. “Le añadí un guion” no es una estrategia.",
  "Los registros defensivos de tu propia marca son distintos de apuntar a la marca de otro."],
 ["La privacidad WHOIS, la ocultación de datos de la era del RGPD y el tratamiento de datos del registrador condicionan lo que ve el público. Siguen vigentes las obligaciones de mantener datos de cuenta exactos con tu registrador."],
 ["Elige nombres de marca originales siempre que puedas, documenta el uso legítimo, guarda registros de las fechas de registro y evita patrones que parezcan una caza masiva de marcas."]]}
EXP['es'] = {'headings': ["Dominios caducados: {T}", "Flujo de investigación", "Señales de alerta", "Después de adquirirlo"], 'paras': [
 ["{D}",
  "Los nombres caducados o en eliminación pueden ser valiosos o tóxicos. Revisa el historial de archivo, la calidad del perfil de backlinks, los conflictos de marca y si el uso anterior encaja con tus planes.",
  "Los atajos SEO de “dominio antiguo” suelen decepcionar cuando el historial es spam o irrelevante."],
 ["Lista de candidatos → revisar capturas históricas → inspeccionar enlaces → historial WHOIS/RDAP si está disponible → búsqueda de marcas → puja máxima incluyendo comisiones → plan de captura o subasta → limpieza de DNS tras la adquisición."],
 ["Spam farmacéutico, asociaciones con malware, redes de enlaces hackeadas o suplantación previa de una marca son señales de alerta comunes. Si dudas, descártalo: hay inventario de sobra."],
 ["Cambia contraseñas y bloqueos, configura un DNS limpio, desautoriza enlaces solo con cuidado y si entiendes el proceso, y reconstruye con contenido original. No uses cloaking ni el engaño de cebo y cambio frente a las expectativas previas de los usuarios."]]}

AFT['fr'] = {'headings': ["Guide du marché secondaire : {T}", "Enchères et drops : la réalité", "Séquestre et transfert", "Quand renoncer"], 'paras': [
 ["{D}",
  "Le marché secondaire couvre les enchères, les noms expirés (drops), les annonces à prix fixe et les ventes par courtier. Les frais, les délais et la mécanique de transfert varient selon la plateforme : lisez les règles de chacune avant d'enchérir.",
  "Revérifiez toujours le risque de marque et l'historique du nom. Une bonne affaire avec des backlinks toxiques ou un passif juridique n'en est pas une."],
 ["Les enchères de noms expirés et le drop-catching sont très disputés. Prévoyez les frais et les renouvellements. Ayez vos moyens de paiement prêts : un paiement refusé peut coûter le nom et des pénalités.",
  "Les réseaux de transfert rapide peuvent accélérer la livraison quand les deux parties y sont inscrites : vérifiez l'éligibilité tôt."],
 ["Utilisez un séquestre réputé pour les sommes importantes. Vérifiez l'état de déverrouillage, les codes d'autorisation et le verrou de transfert de 60 jours après un changement récent. Faites des captures d'écran des accords.",
  "Consultez le titulaire et les dates via WHOIS/RDAP sur /tools/whois quand vous avez besoin d'une vérification préalable."],
 ["Renoncez si le vendeur refuse le séquestre, si la pression est extrême, si l'historique ressemble à du spam ou si le nom ne sert qu'à piéger une marque. Un autre nom se présentera ; les ennuis juridiques, eux, durent."]]}
LEG['fr'] = {'headings': ["Notions juridiques : {T}", "Hygiène du risque de marque", "Vie privée et données", "Le chemin sûr et pratique"], 'paras': [
 ["{D}",
  "Ce guide est pédagogique et ne constitue pas un conseil juridique. Les litiges de domaines concernent souvent des marques, des accusations d'enregistrement de mauvaise foi et des règles propres à chaque juridiction. Dès que l'argent ou le risque pour la marque est important, consultez un avocat qualifié.",
  "L'UDRP et les procédures voisines existent pour les enregistrements manifestement abusifs ; ce ne sont pas une seconde chance gratuite après chaque négociation ratée."],
 ["Recherchez les marques sur vos marchés cibles avant d'enregistrer ou d'enchérir. Évitez les marques célèbres et les chaînes prêtant à confusion pour des produits ou services voisins. « J'ai ajouté un tiret » n'est pas une stratégie.",
  "Les enregistrements défensifs de votre propre marque diffèrent du fait de viser la marque d'autrui."],
 ["La confidentialité WHOIS, le masquage depuis le RGPD et le traitement des données par les registraires déterminent ce que le public voit. Les obligations de données de compte exactes auprès de votre registraire demeurent."],
 ["Choisissez des noms de marque originaux quand c'est possible, documentez l'usage légitime, conservez les dates d'enregistrement et évitez les schémas qui ressemblent à un ciblage massif de marques."]]}
EXP['fr'] = {'headings': ["Domaines expirés : {T}", "Processus de recherche", "Signaux d'alerte", "Après l'acquisition"], 'paras': [
 ["{D}",
  "Les noms expirés ou en cours de suppression peuvent être précieux ou toxiques. Examinez l'historique d'archive, la qualité du profil de backlinks, les conflits de marque et la cohérence de l'usage antérieur avec vos projets.",
  "Les raccourcis SEO du « domaine ancien » déçoivent souvent quand l'historique est du spam ou hors sujet."],
 ["Lister les candidats → examiner les captures historiques → inspecter les liens → historique WHOIS/RDAP si disponible → recherche de marques → enchère maximale frais compris → plan de capture ou d'enchère → nettoyage du DNS après l'acquisition."],
 ["Spam pharmaceutique, liens avec des malwares, réseaux de liens piratés ou usurpation de marque passée sont des signaux d'alerte courants. En cas de doute, passez votre tour : le stock ne manque pas."],
 ["Changez les mots de passe et les verrous, configurez un DNS propre, ne désavouez des liens qu'avec prudence et en comprenant le processus, puis reconstruisez avec du contenu original. Ne pratiquez ni cloaking ni leurre trompeur face aux attentes des anciens visiteurs."]]}

AFT['pt'] = {'headings': ["Guia do mercado secundário: {T}", "Realidade dos leilões e drops", "Escrow e transferência", "Quando desistir"], 'paras': [
 ["{D}",
  "O mercado secundário abrange leilões, domínios expirados (drops), anúncios de preço fixo e negócios intermediados. Taxas, prazos e a mecânica de transferência variam conforme a plataforma: leia as regras de cada uma antes de dar um lance.",
  "Reveja sempre o risco de marca e o histórico do nome. Uma pechincha com backlinks tóxicos ou pendências jurídicas não é pechincha."],
 ["Leilões de expirados e drop-catching são muito disputados. Reserve orçamento para taxas e renovações. Deixe os meios de pagamento prontos; um pagamento que falha pode custar o nome e multas.",
  "Redes de transferência rápida podem acelerar a entrega quando ambos os lados participam: confirme a elegibilidade cedo."],
 ["Use um escrow confiável para valores relevantes. Confirme o status de desbloqueio, os códigos de autorização e os bloqueios de transferência de 60 dias após mudanças recentes. Tire capturas de tela dos acordos.",
  "Consulte titularidade e datas por WHOIS/RDAP em /tools/whois quando precisar de due diligence."],
 ["Desista se o vendedor recusar escrow, a pressão for extrema, o histórico parecer spam ou o nome só funcionar como armadilha de marca. Sempre surge outro item; problemas jurídicos permanecem."]]}
LEG['pt'] = {'headings': ["Noções jurídicas: {T}", "Higiene do risco de marcas", "Privacidade e dados", "Caminho prático e seguro"], 'paras': [
 ["{D}",
  "Este guia é educativo e não é aconselhamento jurídico. Disputas de domínios costumam envolver marcas, alegações de registro de má-fé e regras que variam conforme a jurisdição. Quando houver dinheiro ou risco de marca relevante, consulte um advogado qualificado.",
  "A UDRP e processos semelhantes existem para registros claramente abusivos; não são uma segunda chance gratuita para toda negociação que deu errado."],
 ["Pesquise marcas nos mercados-alvo antes de registrar ou dar lances. Evite marcas famosas e sequências confusamente parecidas em produtos ou serviços relacionados. “Coloquei um hífen” não é estratégia.",
  "Registros defensivos da sua própria marca são diferentes de mirar a marca de outra pessoa."],
 ["Privacidade WHOIS, a ocultação de dados da era GDPR e o tratamento de dados pelo registrador afetam o que o público vê. As obrigações de manter dados de conta corretos junto ao registrador continuam valendo."],
 ["Escolha nomes de marca originais sempre que possível, documente o uso legítimo, guarde registros das datas de registro e evite padrões que pareçam alvo em massa de marcas."]]}
EXP['pt'] = {'headings': ["Domínios expirados: {T}", "Fluxo de pesquisa", "Sinais de alerta", "Depois de adquirir"], 'paras': [
 ["{D}",
  "Nomes expirados e em exclusão podem ser valiosos ou tóxicos. Verifique o histórico de arquivo, a qualidade do perfil de backlinks, conflitos de marca e se o uso anterior combina com seus planos.",
  "Atalhos de SEO com “domínio antigo” costumam decepcionar quando o histórico é spam ou irrelevante."],
 ["Listar candidatos → revisar capturas históricas → inspecionar links → histórico WHOIS/RDAP quando disponível → busca de marcas → lance máximo incluindo taxas → plano de captura ou leilão → limpeza do DNS após a aquisição."],
 ["Spam farmacêutico, associação a malware, redes de links invadidas ou personificação anterior de marca são alertas comuns. Na dúvida, pule: há estoque de sobra."],
 ["Troque senhas e bloqueios, configure um DNS limpo, use disavow apenas com cuidado e se entender o processo, e reconstrua com conteúdo original. Não use cloaking nem isca e troca para enganar usuários com base nas expectativas anteriores."]]}

AFT['ru'] = {'headings': ["Руководство по вторичному рынку: {T}", "Реальность аукционов и дропов", "Эскроу и передача", "Когда стоит отказаться"], 'paras': [
 ["{D}",
  "Вторичный рынок включает аукционы, истекающие домены (дропы), объявления с фиксированной ценой и сделки через брокеров. Комиссии, сроки и механика передачи различаются на разных площадках, поэтому перед ставкой прочитайте правила каждой.",
  "Всегда заново проверяйте риски товарных знаков и историю имени. Дешёвая победа с токсичными обратными ссылками или юридическим багажом — не победа."],
 ["Аукционы истёкших доменов и перехват дропов — зона высокой конкуренции. Закладывайте в бюджет комиссии и продления. Держите способы оплаты наготове: неудачная оплата может стоить имени и штрафов.",
  "Сети быстрой передачи ускоряют доставку, если обе стороны подключены, поэтому заранее уточните доступность."],
 ["Для крупных сумм используйте надёжное эскроу. Проверьте статус разблокировки, коды авторизации и 60-дневные блокировки передачи после недавних изменений. Делайте скриншоты соглашений.",
  "Для проверки благонадёжности смотрите владельца и даты через WHOIS/RDAP на /tools/whois."],
 ["Откажитесь, если продавец не принимает эскроу, давление чрезмерно, история похожа на спам или имя годится только как ловушка для товарного знака. Появятся другие варианты, а юридические проблемы останутся."]]}
LEG['ru'] = {'headings': ["Юридические основы: {T}", "Гигиена рисков товарных знаков", "Конфиденциальность и данные", "Практичный безопасный путь"], 'paras': [
 ["{D}",
  "Это руководство носит образовательный характер и не является юридической консультацией. Доменные споры часто связаны с товарными знаками, обвинениями в недобросовестной регистрации и правилами конкретной юрисдикции. Если на кону существенные деньги или риск для бренда, обратитесь к квалифицированному юристу.",
  "UDRP и похожие процедуры предназначены для явно недобросовестных регистраций; это не бесплатная вторая попытка после каждых неудачных переговоров."],
 ["Проверяйте товарные знаки на целевых рынках до регистрации или ставки. Избегайте известных знаков и сходных до смешения строк в смежных товарах и услугах. «Я добавил дефис» — это не стратегия.",
  "Защитная регистрация собственного бренда отличается от прицельного захвата чужого знака."],
 ["Приватность WHOIS, скрытие данных после GDPR и обработка данных регистраторами определяют, что видно публике. Обязанность предоставлять регистратору точные данные аккаунта сохраняется."],
 ["По возможности выбирайте оригинальные брендовые имена, документируйте законное использование, храните записи о датах регистрации и избегайте схем, похожих на массовую охоту за товарными знаками."]]}
EXP['ru'] = {'headings': ["Истёкшие домены: {T}", "Порядок исследования", "Тревожные признаки", "После приобретения"], 'paras': [
 ["{D}",
  "Истёкшие и удаляемые имена могут быть как ценными, так и токсичными. Проверьте историю в архиве, качество ссылочного профиля, конфликты с товарными знаками и соответствие прошлого использования вашим планам.",
  "SEO-«быстрые пути» через «возрастные домены» часто разочаровывают, если история спамная или нерелевантная."],
 ["Составьте список кандидатов → просмотрите исторические снимки → проверьте ссылки → история WHOIS/RDAP, если доступна → проверка товарных знаков → максимальная ставка с учётом комиссий → план перехвата или аукциона → очистка DNS после приобретения."],
 ["Фармацевтический спам, связь с вредоносным ПО, взломанные ссылочные сети или прошлая имитация бренда — типичные тревожные признаки. Если сомневаетесь, пропустите: вариантов достаточно."],
 ["Смените пароли и блокировки, настройте чистый DNS, используйте disavow только осторожно и понимая процесс, и стройте сайт заново на оригинальном контенте. Не применяйте клоакинг и не подменяйте контент, обманывая пользователей, пришедших по старым ожиданиям."]]}

AFT['zh'] = {'headings': ["二级市场指南：{T}", "拍卖与掉落的现实", "托管与转移", "何时该放弃"], 'paras': [
 ["{D}",
  "二级市场包括拍卖、过期掉落、一口价挂牌和经纪撮合的交易。各平台的费用、时间线和转移机制不同——出价前请先阅读每个平台的规则。",
  "务必再次核查商标风险和域名历史。以低价拿下却带有有毒外链或法律隐患的域名，算不上赢。"],
 ["过期拍卖和抢注（drop-catching）竞争激烈。请为费用和续费预留预算，备好支付方式；支付失败可能让你失去域名并被处罚。",
  "当双方都加入快速转移网络时，交付可以更快——请尽早确认资格。"],
 ["大额交易请使用信誉良好的托管服务。确认解锁状态、授权码，以及近期变更后的 60 天转移锁。对协议截图留存。",
  "需要尽职调查时，可在 /tools/whois 通过 WHOIS/RDAP 查询所有者和日期。"],
 ["如果卖家拒绝托管、施压过度、历史看起来像垃圾站，或者该域名只能当作商标陷阱，就放弃。总会有新的库存出现，而法律问题会长期缠身。"]]}
LEG['zh'] = {'headings': ["法律基础：{T}", "商标风险管理", "隐私与数据", "务实稳妥的做法"], 'paras': [
 ["{D}",
  "本指南仅供科普，不构成法律意见。域名纠纷常涉及商标、恶意注册指控以及因司法辖区而异的规则。当涉及重大金钱或品牌风险时，请咨询合格的律师。",
  "UDRP 及相关程序针对的是明显的滥用注册；它们并不是每次谈判失败后可以免费重来的机会。"],
 ["在注册或出价前，先在目标市场检索商标。避免知名商标，以及在相关商品或服务上容易混淆的相似字符串。“我加了个连字符”并不是策略。",
  "为自有品牌做防御性注册，与针对他人商标是两回事。"],
 ["WHOIS 隐私、GDPR 时代的信息遮蔽以及注册商的数据处理，决定了公众能看到什么。你仍须向注册商提供准确的账户数据。"],
 ["尽量选择原创的品牌名，记录正当使用情况，保留注册日期的记录，并避免出现看似批量针对商标的模式。"]]}
EXP['zh'] = {'headings': ["过期域名：{T}", "调研流程", "风险信号", "收购之后"], 'paras': [
 ["{D}",
  "过期和即将删除的域名既可能很有价值，也可能有毒。请检查存档历史、外链质量、商标冲突，以及先前用途是否符合你的计划。",
  "当历史是垃圾内容或不相关时，靠“老域名”走 SEO 捷径往往令人失望。"],
 ["列出候选 → 查看历史快照 → 检查外链 → 如有则查看 WHOIS/RDAP 历史 → 商标检索 → 含费用的最高出价 → 抢注或拍卖方案 → 收购后清理 DNS。"],
 ["医药垃圾内容、与恶意软件的关联、被黑的链接网络或曾冒充品牌，都是常见的红旗。拿不准就放弃——库存很多。"],
 ["更换密码和锁定设置，配置干净的 DNS；只有在理解流程时才谨慎使用拒绝外链（disavow），并用原创内容重新建站。不要用伪装（cloaking）或偷换内容，以欺骗方式对待带着旧预期来的用户。"]]}

add_openings('Aftermarket', AFT)
add_openings('Legal', LEG)
add_openings('Expired', EXP)
