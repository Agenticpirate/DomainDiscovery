# -*- coding: utf-8 -*-
"""Batch b3 data (part 1): Sales + Valuation openings for de, es, fr, pt, ru, zh"""
from add_data import add_openings
SALES = {}
VAL = {}

SALES['de'] = {'headings': ["Domains verkaufen: {T}", "Kanäle und Ablauf", "Verhandlungsgrundlagen", "Hinweise zur Compliance"], 'paras': [
 ["{D}",
  "Domainverkäufe gelingen, wenn ein echter Endnutzer einen zeitlichen Anlass hat (Start, Rebranding, Finanzierung, Kampagne). Preis und Kanal sollten zum Käufertyp passen – Startups unterscheiden sich von lokalen Mittelständlern und Konzernen.",
  "Nutzen Sie klare Verkaufsseiten, ein geprüftes Treuhandkonto (Escrow) für größere Geschäfte und ehrliche Beschreibungen. Übertriebene Aussagen zum „SEO-Wert“ schaden dem Vertrauen."],
 ["Marktplätze, Broker, eingehende Anfragen über Landingpages und sorgfältige Direktansprache konvertieren jeweils anders. Erfassen Sie Anfragen, Angebote und die Zeit bis zum Abschluss. Dokumentieren Sie die Transferschritte, damit Geschäfte nicht im EPP-Limbo (Auth-Code) scheitern.",
  "Provisionen und Zahlungswege sollten vereinbart sein, bevor die Verhandlung hitzig wird."],
 ["Setzen Sie einen Anker mit Vergleichsverkäufen, falls vorhanden, hören Sie aber auf Budget und Dringlichkeit. Seien Sie bereit, abzuspringen. Finanzierung bzw. Lease-to-Own kann Abschlüsse ermöglichen, erhöht aber Ausfall- und Verwaltungsrisiko."],
 ["Direktansprache per E-Mail muss geltende Anti-Spam-Gesetze und Plattformregeln beachten. Geben Sie sich nicht als Markeninhaber aus. Bewahren Sie Nachweise über Einwilligungen und Abmeldungen auf, wo erforderlich."]]}
VAL['de'] = {'headings': ["Bewertungsansatz: {T}", "Entscheidende Signale", "Grenzen der Werkzeuge", "Bewertung in Entscheidungen nutzen"], 'paras': [
 ["{D}",
  "Eine Domainbewertung ist eine Schätzung, keine Garantie. Gutachten und automatische Tools können Markenpassung, Markenrechtsrisiken und Liquidität übersehen. Nutzen Sie mehrere Signale: Vergleichsverkäufe, Länge und Klarheit, Stärke der Endung und einen realistischen Käuferkreis.",
  "Angebotspreise im Einzelhandel sind nicht dasselbe wie Großhandelspreise bei Liquidation."],
 ["Einprägsamkeit, Schreibbarkeit, .com oder alternative TLD, kommerzielle Absicht des Keywords und Belege für Endnutzer-Verkäufe in der Nische. Type-in-Traffic ist bei den meisten Namen selten und sollte gemessen statt vorausgesetzt werden.",
  "Eigene Bewertung: 5 Vergleichsverkäufe auflisten, nach Endung und Länge anpassen und mit der Frage prüfen: „Wer kauft das in 12 Monaten?“"],
 ["Automatische Bewertungen können eine Richtung zeigen und bei Brandables völlig danebenliegen. Verkaufsdatenbanken helfen, wenn es Vergleiche gibt; dünne Kategorien brauchen menschliches Urteil.",
  "Veröffentlichen Sie nie scheingenaue Zahlen. Spannen mit Annahmen schlagen exakte Dollarbeträge, die erfunden wirken."],
 ["Käufer: Legen Sie ein Maximum nach geschäftlichem ROI fest, nicht nach Bewertungseitelkeit. Verkäufer: Bepreisen Sie für den Kanal, den Sie wirklich nutzen. Investoren: Bewerten Sie Bestände für die Planung vorsichtig."]]}

SALES['es'] = {'headings': ["Vender dominios: {T}", "Canales y proceso", "Fundamentos de negociación", "Notas de cumplimiento"], 'paras': [
 ["{D}",
  "Las ventas de dominios funcionan cuando un usuario final real tiene una necesidad de tiempo (lanzamiento, cambio de marca, financiación, campaña). El precio y el canal deben ajustarse al tipo de comprador: las startups no son como las pymes locales ni las grandes empresas.",
  "Usa páginas de venta claras, un depósito en garantía (escrow) verificado para operaciones grandes y descripciones honestas. Exagerar el “valor SEO” daña la confianza."],
 ["Los marketplaces, los corredores, las páginas de venta con consultas entrantes y la prospección cuidadosa convierten de forma distinta. Registra consultas, ofertas y tiempo hasta el cierre. Documenta los pasos de transferencia para que las operaciones no mueran en el limbo del EPP.",
  "Acordad las comisiones y los medios de pago antes de que suba la tensión de la negociación."],
 ["Ancla con ventas comparables cuando las tengas, pero escucha el presupuesto y la urgencia. Prepárate para irte. La financiación o el alquiler con opción a compra (LTO) puede cerrar tratos, pero aumenta el riesgo de impago y la carga administrativa."],
 ["El correo saliente debe respetar las leyes antispam aplicables y las normas de las plataformas. No te hagas pasar por el titular de una marca. Guarda registros de consentimientos y bajas cuando sea obligatorio."]]}
VAL['es'] = {'headings': ["Enfoque de valoración: {T}", "Señales que importan", "Límites de las herramientas", "Usar la valoración al decidir"], 'paras': [
 ["{D}",
  "La valoración de un dominio es una estimación, no una garantía. Las tasaciones y las herramientas automáticas pueden pasar por alto el encaje de marca, el riesgo de marcas registradas y la liquidez. Usa varias señales: ventas comparables, longitud y claridad, fuerza de la extensión y un grupo realista de compradores.",
  "Los precios de venta al público no equivalen a los precios mayoristas de liquidación."],
 ["Memorabilidad, facilidad de escritura, .com frente a otra TLD, intención comercial de la palabra clave y pruebas de ventas a usuarios finales en el nicho. El tráfico directo es poco frecuente en la mayoría de los nombres y debe medirse, no darse por hecho.",
  "Tasación propia: enumera 5 comparables, ajusta por extensión y longitud y ponla a prueba con la pregunta “¿quién compra esto en 12 meses?”"],
 ["Las tasaciones automáticas pueden orientar y también fallar por mucho en los nombres de marca. Las bases de datos de ventas ayudan cuando existen comparables; las categorías con pocos datos requieren criterio humano.",
  "No publiques nunca una precisión falsa. Los rangos con supuestos valen más que cifras exactas inventadas."],
 ["Compradores: fija un máximo según el ROI del negocio, no según la vanidad de la tasación. Vendedores: fija el precio para el canal que de verdad vas a usar. Inversores: valora el inventario con prudencia al planificar."]]}

SALES['fr'] = {'headings': ["Vendre des domaines : {T}", "Canaux et processus", "Bases de la négociation", "Notes de conformité"], 'paras': [
 ["{D}",
  "Les ventes de domaines réussissent quand un utilisateur final réel a un besoin de calendrier (lancement, changement de marque, levée de fonds, campagne). Le prix et le canal doivent correspondre au type d'acheteur : une start-up n'est pas une PME locale ni un grand groupe.",
  "Utilisez des pages de vente claires, un séquestre (escrow) vérifié pour les montants importants et des descriptions honnêtes. Surévaluer la « valeur SEO » nuit à la confiance."],
 ["Les places de marché, les courtiers, les pages de vente avec demandes entrantes et la prospection soignée convertissent chacun différemment. Suivez les demandes, les offres et le délai de conclusion. Documentez les étapes de transfert pour que les ventes ne s'enlisent pas à cause du code EPP.",
  "Convenez des commissions et des moyens de paiement avant que la négociation ne s'échauffe."],
 ["Ancrez le prix avec des ventes comparables si vous en avez, mais écoutez le budget et l'urgence. Soyez prêt à renoncer. Le financement ou la location-vente (LTO) peut conclure des ventes, mais augmente le risque de défaut et la charge administrative."],
 ["L'e-mailing sortant doit respecter les lois anti-spam applicables et les règles des plateformes. Ne vous faites pas passer pour un titulaire de marque. Conservez les preuves de consentement et de désinscription lorsque c'est exigé."]]}
VAL['fr'] = {'headings': ["Approche de valorisation : {T}", "Les signaux qui comptent", "Limites des outils", "Utiliser la valorisation pour décider"], 'paras': [
 ["{D}",
  "La valorisation d'un domaine est une estimation, pas une garantie. Les évaluations et les outils automatiques peuvent ignorer l'adéquation à la marque, le risque de marque déposée et la liquidité. Croisez plusieurs signaux : ventes comparables, longueur et clarté, force de l'extension et bassin d'acheteurs réaliste.",
  "Les prix demandés au détail ne sont pas les prix de gros d'une liquidation."],
 ["Mémorabilité, facilité d'épellation, .com ou autre TLD, intention commerciale du mot-clé et preuves de ventes à des utilisateurs finaux dans la niche. Le trafic de saisie directe est rare pour la plupart des noms et doit être mesuré, pas supposé.",
  "Évaluation maison : listez 5 comparables, ajustez selon l'extension et la longueur, puis testez avec « qui achète ça dans 12 mois ? »"],
 ["Les évaluations automatiques peuvent donner une direction, mais se tromper lourdement sur les noms de marque. Les bases de ventes aident quand il existe des comparables ; les catégories peu documentées demandent un jugement humain.",
  "Ne publiez jamais une fausse précision. Des fourchettes avec hypothèses valent mieux que des montants exacts sans fondement."],
 ["Acheteurs : fixez un plafond selon le retour sur investissement de l'entreprise, pas selon la vanité d'une évaluation. Vendeurs : fixez le prix pour le canal que vous utiliserez réellement. Investisseurs : valorisez prudemment le stock pour planifier."]]}

SALES['pt'] = {'headings': ["Vender domínios: {T}", "Canais e processo", "Noções de negociação", "Notas de conformidade"], 'paras': [
 ["{D}",
  "As vendas de domínios dão certo quando um usuário final real tem uma necessidade de prazo (lançamento, rebranding, captação, campanha). Preço e canal devem combinar com o tipo de comprador: startups são diferentes de pequenas empresas locais e grandes corporações.",
  "Use páginas de venda claras, escrow verificado para negócios maiores e descrições honestas. Exagerar o “valor de SEO” prejudica a confiança."],
 ["Marketplaces, corretores, páginas de venda com contatos recebidos e prospecção cuidadosa convertem de formas diferentes. Acompanhe consultas, ofertas e tempo até o fechamento. Documente as etapas de transferência para que os negócios não morram no limbo do código EPP.",
  "Combine comissões e meios de pagamento antes de a negociação esquentar."],
 ["Ancore com vendas comparáveis quando tiver, mas ouça orçamento e urgência. Esteja pronto para desistir. Financiamento ou lease-to-own (LTO) pode fechar negócios, mas aumenta o risco de inadimplência e a carga administrativa."],
 ["E-mails de prospecção devem respeitar as leis antispam aplicáveis e as regras das plataformas. Não se passe pelo titular de uma marca. Guarde registros de consentimento e de descadastro quando exigido."]]}
VAL['pt'] = {'headings': ["Abordagem de avaliação: {T}", "Sinais que importam", "Limites das ferramentas", "Usar a avaliação nas decisões"], 'paras': [
 ["{D}",
  "A avaliação de um domínio é uma estimativa, não uma garantia. Avaliações e ferramentas automáticas podem ignorar o encaixe com a marca, o risco de marcas registradas e a liquidez. Use vários sinais: vendas comparáveis, tamanho e clareza, força da extensão e um grupo realista de compradores.",
  "Preços pedidos no varejo não são o mesmo que preços de liquidação no atacado."],
 ["Memorização, facilidade de escrita, .com ou outra TLD, intenção comercial da palavra-chave e evidências de vendas a usuários finais no nicho. O tráfego direto é raro na maioria dos nomes e deve ser medido, não presumido.",
  "Avaliação própria: liste 5 comparáveis, ajuste por extensão e tamanho e teste com a pergunta “quem compra isso em 12 meses?”"],
 ["Avaliações automáticas podem indicar a direção e também errar feio em nomes de marca. Bases de vendas ajudam quando há comparáveis; categorias com poucos dados exigem julgamento humano.",
  "Nunca publique precisão falsa. Faixas com premissas valem mais do que valores exatos inventados."],
 ["Compradores: defina um teto pelo retorno do negócio, não pela vaidade da avaliação. Vendedores: precifique para o canal que realmente vai usar. Investidores: avalie o estoque com cautela ao planejar."]]}

SALES['ru'] = {'headings': ["Продажа доменов: {T}", "Каналы и процесс", "Основы переговоров", "Заметки о соблюдении правил"], 'paras': [
 ["{D}",
  "Продажи доменов удаются, когда у конечного пользователя есть срочная причина (запуск, ребрендинг, раунд финансирования, кампания). Цена и канал должны соответствовать типу покупателя: стартапы отличаются от местного малого бизнеса и крупных компаний.",
  "Используйте понятные страницы продажи, проверенное эскроу для крупных сделок и честные описания. Преувеличение «SEO-ценности» подрывает доверие."],
 ["Маркетплейсы, брокеры, входящие заявки с посадочных страниц и аккуратная исходящая рассылка конвертируют по-разному. Отслеживайте обращения, предложения и срок до закрытия сделки. Задокументируйте шаги передачи, чтобы сделки не застревали из-за кода EPP.",
  "Договоритесь о комиссиях и способах оплаты до того, как переговоры накалятся."],
 ["Опирайтесь на сопоставимые продажи, если они есть, но слушайте про бюджет и срочность. Будьте готовы отказаться. Рассрочка или lease-to-own (LTO) помогает закрыть сделку, но повышает риск неплатежа и административную нагрузку."],
 ["Исходящие письма должны соответствовать действующим законам о спаме и правилам площадок. Не выдавайте себя за владельца товарного знака. Храните подтверждения согласия и отказов от рассылки там, где это требуется."]]}
VAL['ru'] = {'headings': ["Подход к оценке: {T}", "Какие сигналы важны", "Ограничения инструментов", "Как использовать оценку при решениях"], 'paras': [
 ["{D}",
  "Оценка домена — это прикидка, а не гарантия. Автоматические оценщики и отчёты могут упускать соответствие бренду, риск товарных знаков и ликвидность. Опирайтесь на несколько сигналов: сопоставимые продажи, длину и ясность, силу зоны и реалистичный круг покупателей.",
  "Розничная цена в объявлении — не то же самое, что оптовая цена при ликвидации."],
 ["Запоминаемость, лёгкость написания, .com или другая зона, коммерческий смысл ключевого слова и подтверждённые продажи конечным пользователям в нише. Прямой трафик у большинства имён редок, его нужно измерять, а не предполагать.",
  "Самостоятельная оценка: выпишите 5 сопоставимых продаж, поправьте на зону и длину и проверьте вопросом «кто купит это через 12 месяцев?»"],
 ["Автоматические оценки могут давать ориентир, но сильно ошибаться на брендовых именах. Базы продаж полезны, когда есть аналоги; в редких категориях нужна экспертная оценка.",
  "Никогда не публикуйте ложную точность. Диапазоны с оговорёнными допущениями лучше выдуманных точных сумм."],
 ["Покупатели: задавайте потолок по окупаемости для бизнеса, а не по тщеславию оценки. Продавцы: устанавливайте цену под канал, которым действительно пользуетесь. Инвесторы: оценивайте запасы осторожно при планировании."]]}

SALES['zh'] = {'headings': ["出售域名：{T}", "渠道与流程", "谈判基础", "合规提示"], 'paras': [
 ["{D}",
  "当真正的终端用户有时间上的需求（上线、品牌重塑、融资、营销活动）时，域名销售才会成功。价格和渠道应与买家类型匹配——初创公司不同于本地中小企业和大型企业。",
  "使用清晰的落地页，大额交易使用经过验证的托管（escrow），并如实描述。夸大“SEO 价值”会损害信任。"],
 ["交易平台、经纪人、带入站询盘的落地页以及谨慎的主动联系，转化方式各不相同。请记录询盘、报价和成交周期。把转移步骤整理成文档，避免交易卡在 EPP 授权码环节。",
  "在谈判升温之前，先谈妥佣金和付款渠道。"],
 ["有可比成交时用它来定锚，同时留意对方的预算和紧迫程度。随时准备放弃。分期付款或先租后买（LTO）可以促成交易，但会增加违约和管理风险。"],
 ["主动发送的邮件必须遵守适用的反垃圾邮件法律和平台规则。不要冒充商标权利人。需要时保留同意与退订记录。"]]}
VAL['zh'] = {'headings': ["估值思路：{T}", "关键信号", "工具的局限", "在决策中使用估值"], 'paras': [
 ["{D}",
  "域名估值只是估计，而不是保证。评估报告和自动化工具可能忽略品牌契合度、商标风险和流动性。请综合多种信号：可比成交、长度与清晰度、后缀强度以及现实的买家群体。",
  "零售标价并不等同于批发清盘价。"],
 ["好记程度、易拼写程度、.com 还是其他后缀、关键词的商业意图，以及该细分领域有终端用户成交的证据。直接输入流量对多数域名都很罕见，应当实测而不是想当然。",
  "自行估值：列出 5 个可比案例，按后缀和长度调整，再用“12 个月内谁会买它？”来检验。"],
 ["自动估值可以提供大致方向，但对品牌类域名可能严重偏离。有可比案例时，成交数据库很有帮助；样本稀少的类别需要人工判断。",
  "不要发布虚假的精确数字。带有假设的区间，胜过凭空捏造的精确金额。"],
 ["买家：按业务投资回报设定上限，而不是迷信估值。卖家：按你真正会使用的渠道定价。投资者：做规划时对库存保守估值。"]]}

add_openings('Sales', SALES)
add_openings('Valuation', VAL)
