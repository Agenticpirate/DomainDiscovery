# -*- coding: utf-8 -*-
"""domain-investing: de, es, fr, pt, ru, zh"""
from tpl import build
S = 'domain-investing'
EX = ('impl', 'examples')

def run(lang, T, short, rest, rt, topics, topics_text, h0, secs):
    full = f"{short} {rest}"
    head = [[h0.replace('{T}', T), [short] + secs[0]], [secs[1][0], secs[1][1:]], [secs[2][0], secs[2][1:]], [secs[3][0], secs[3][1:]]]
    build(S, lang, T, full, rt, topics, topics_text, head, '', short, EX)

run('de', "Strategien für Domain-Investitionen",
 "Bauen Sie ein Domain-Portfolio auf: Erwerb, Verlängerungen, Preisgestaltung und Verkaufskanäle.",
 "Lernen Sie praktische Schritte, Risiken und DomainDiscovery-Abläufe für Domainnamen-Suche und Registrierungsrecherche kennen.",
 "6 Min. Lesezeit", ["Investieren", "Portfolio", "Verkauf"], "Investieren, Portfolio und Verkauf",
 "Sicht des Investors: {T}",
 [["Domain-Investition ist spekulativ. Die Liquidität schwankt stark, und die meisten Namen verkaufen sich nie zu den Wunschpreisen aus dem Einzelhandel. Behandeln Sie es wie ein Lagergeschäft: Anschaffungskosten, Haltekosten (Verlängerungen) und realistische Nachfrage von Endkunden.",
   "DomainDiscovery ist vor allem für Macher und Rechercheure gedacht, die die Verfügbarkeit prüfen – nicht als Kaufsignal für spekulative Portfolios. Recherchieren Sie selbst."],
  ["Disziplin beim Erwerb",
   "Handregistrierungen, Auktionen abgelaufener Domains und Privatkäufe haben jeweils ein anderes Risiko. Begrenzen Sie Gebote mit Großhandelsvergleichen, wenn sie verfügbar sind. Bieten Sie nicht emotional auf Namen, die Sie einer echten Käuferpersona nicht erklären können.",
   "Halten Sie für jeden Namen Verlängerungsdatum und These in einer Tabelle fest. Namen ohne These sind der Grund, warum Portfolios unbemerkt Geld verbrennen."],
  ["Verkauf und Preisrealität",
   "Sofortkauf, Preisangebot, Landingpages, Broker und Direktansprache haben jeweils Kosten und Compliance-Regeln (besonders bei E-Mail-Ansprache). Endkunden kaufen Geschichten und Passung – nicht Ihre Einstandskosten.",
   "Premium-Verlängerungen bei Namen mit Registry-Preisen können dünne Margen auffressen. Rechnen Sie die Kosten des zweiten Jahres durch, bevor Sie einen „günstigen“ Fund feiern."],
  ["Risikokontrollen",
   "Markenfallen, Sanktions- und Compliance-Fragen und Marktplatzgebühren spielen eine Rolle. Lassen Sie im Zweifel die Finger vom Namen. Streuen Sie nur, wenn Sie die Verlängerungen auch durch ein verkaufsarmes Jahr tragen können."]])

run('es', "Estrategias de inversión en dominios",
 "Crea una cartera de dominios: adquisición, renovaciones, precios y canales de salida.",
 "Aprende pasos prácticos, riesgos y flujos de trabajo de DomainDiscovery para la búsqueda de nombres de dominio y la investigación del registro.",
 "6 min de lectura", ["Inversión", "Cartera", "Ventas"], "inversión, cartera y ventas",
 "Planteamiento del inversor: {T}",
 [["Invertir en dominios es especulativo. La liquidez varía mucho y la mayoría de los nombres nunca se venden a las fantasías de precio minorista. Trátalo como un negocio de inventario: coste de adquisición, coste de mantenimiento (renovaciones) y demanda realista de usuarios finales.",
   "DomainDiscovery está pensado sobre todo para quienes construyen e investigan comprobando la disponibilidad, no como señal de compra para carteras especulativas. Haz tu propia investigación."],
  ["Disciplina en las adquisiciones",
   "El registro manual, las subastas de dominios caducados y las compras privadas tienen cada una un riesgo distinto. Limita las pujas con comparables mayoristas cuando existan. Evita pujar de forma emocional por nombres que no sabes explicar a un perfil real de comprador.",
   "Registra en una hoja la fecha de renovación y la tesis de cada nombre. Los nombres huérfanos sin tesis son la forma en que las carteras drenan efectivo en silencio."],
  ["Ventas y la realidad de los precios",
   "La compra inmediata, las ofertas, las páginas de aterrizaje, los corredores y la prospección tienen costes y normas de cumplimiento propios (sobre todo el contacto por correo). Los usuarios finales compran historias y encaje, no tu coste de adquisición.",
   "Las renovaciones premium en nombres con precio del registro pueden borrar márgenes estrechos. Calcula los costes del segundo año antes de celebrar una compra «barata»."],
  ["Controles de riesgo",
   "Las trampas de marcas registradas, los problemas de sanciones y cumplimiento y las comisiones de los marketplaces importan. En caso de duda, descarta el nombre. Diversifica solo si puedes pagar las renovaciones durante un año sin ventas."]])

run('fr', "Stratégies d'investissement dans les domaines",
 "Constituez un portefeuille de domaines : acquisition, renouvellements, tarification et canaux de sortie.",
 "Découvrez des étapes pratiques, les risques et les processus DomainDiscovery pour la recherche de nom de domaine et la préparation de l'enregistrement.",
 "6 min de lecture", ["Investissement", "Portefeuille", "Ventes"], "Investissement, Portefeuille et Ventes",
 "Cadrage de l'investisseur : {T}",
 [["L'investissement en domaines est spéculatif. La liquidité varie énormément et la plupart des noms ne se vendent jamais aux prix rêvés du détail. Traitez-le comme une activité de stock : coût d'acquisition, coût de détention (renouvellements) et demande réaliste d'utilisateurs finaux.",
   "DomainDiscovery est conçu avant tout pour les créateurs et les chercheurs qui vérifient la disponibilité, pas comme un signal d'achat pour des portefeuilles spéculatifs. Faites vos propres recherches."],
  ["Rigueur à l'acquisition",
   "Les enregistrements manuels, les enchères de domaines expirés et les achats privés présentent chacun un risque différent. Plafonnez les enchères avec des comparables de gros quand ils existent. Évitez d'enchérir par émotion sur des noms que vous ne savez pas expliquer à un vrai profil d'acheteur.",
   "Suivez dans un tableur la date de renouvellement et la thèse de chaque nom. Les noms orphelins sans thèse sont la façon dont les portefeuilles vident discrètement la trésorerie."],
  ["La réalité des ventes et des prix",
   "L'achat immédiat, les offres, les pages d'atterrissage, les courtiers et la prospection sortante ont chacun des coûts et des règles de conformité (surtout pour la prospection par e-mail). Les utilisateurs finaux achètent une histoire et une adéquation, pas votre prix de revient.",
   "Les renouvellements premium sur des noms au tarif du registre peuvent effacer de faibles marges. Modélisez les coûts de la deuxième année avant de célébrer une affaire « bon marché »."],
  ["Maîtrise des risques",
   "Les pièges de marques déposées, les questions de sanctions et de conformité et les frais des places de marché comptent. Dans le doute, passez votre tour. Ne diversifiez que si vous pouvez payer les renouvellements pendant une année sans vente."]])

run('pt', "Estratégias de investimento em domínios",
 "Monte um portfólio de domínios: aquisição, renovações, preços e canais de saída.",
 "Conheça passos práticos, riscos e fluxos de trabalho do DomainDiscovery para a pesquisa de nome de domínio e a preparação do registro.",
 "6 min de leitura", ["Investimento", "Portfólio", "Vendas"], "Investimento, Portfólio e Vendas",
 "Visão do investidor: {T}",
 [["Investir em domínios é especulativo. A liquidez varia muito e a maioria dos nomes nunca é vendida pelos preços de varejo imaginados. Trate como um negócio de estoque: custo de aquisição, custo de manutenção (renovações) e demanda realista de usuários finais.",
   "O DomainDiscovery foi criado principalmente para quem constrói e pesquisa verificando a disponibilidade, não como sinal de compra para portfólios especulativos. Faça sua própria pesquisa."],
  ["Disciplina na aquisição",
   "Registros manuais, leilões de domínios expirados e compras privadas têm riscos diferentes. Limite os lances com comparáveis de atacado quando houver. Evite dar lances emocionais em nomes que você não sabe explicar a um perfil real de comprador.",
   "Acompanhe a data de renovação e a tese de cada nome em uma planilha. Nomes órfãos sem tese são a forma como os portfólios drenam caixa em silêncio."],
  ["Realidade de vendas e preços",
   "Compre já, faça uma oferta, páginas de venda, corretores e prospecção ativa têm custos e regras de conformidade próprios (principalmente o contato por e-mail). Usuários finais compram histórias e adequação, não o seu custo de aquisição.",
   "Renovações premium em nomes com preço do registro podem apagar margens apertadas. Calcule os custos do segundo ano antes de comemorar uma compra “barata”."],
  ["Controles de risco",
   "Armadilhas de marca registrada, questões de sanções e conformidade e taxas de marketplace importam. Na dúvida, descarte o nome. Diversifique apenas se puder pagar as renovações durante um ano sem vendas."]])

run('ru', "Стратегии инвестирования в домены",
 "Соберите портфель доменов: приобретение, продление, ценообразование и каналы выхода.",
 "Узнайте о практических шагах, рисках и процессах DomainDiscovery для поиска доменных имён и подготовки регистрации.",
 "6 мин чтения", ["Инвестиции", "Портфель", "Продажи"], "инвестиции, портфель, продажи",
 "Взгляд инвестора: {T}",
 [["Инвестиции в домены спекулятивны. Ликвидность сильно различается, и большинство имён никогда не продаётся по мечтам о розничной цене. Относитесь к этому как к складскому бизнесу: стоимость приобретения, стоимость владения (продления) и реалистичный спрос конечных покупателей.",
   "DomainDiscovery создан прежде всего для тех, кто строит проекты и изучает рынок, проверяя доступность, а не как сигнал к покупке для спекулятивных портфелей. Проводите собственное исследование."],
  ["Дисциплина при приобретении",
   "Ручная регистрация, аукционы истёкших доменов и частные покупки несут разные риски. Ограничивайте ставки оптовыми аналогами, когда они есть. Не торгуйтесь на эмоциях за имена, которые не можете объяснить реальному портрету покупателя.",
   "Фиксируйте дату продления и обоснование каждого имени в таблице. Имена-сироты без обоснования — то, как портфели незаметно сжигают деньги."],
  ["Продажи и реальность цен",
   "«Купить сейчас», приём предложений, посадочные страницы, брокеры и исходящие рассылки имеют свои расходы и правила соответствия (особенно рассылка по почте). Конечные покупатели покупают историю и соответствие, а не вашу себестоимость.",
   "Премиальные продления имён с реестровой ценой могут съесть тонкую маржу. Посчитайте расходы второго года, прежде чем праздновать «дешёвую» находку."],
  ["Контроль рисков",
   "Важны ловушки с товарными знаками, санкционные и комплаенс-вопросы и комиссии площадок. Если сомневаетесь, откажитесь от имени. Диверсифицируйтесь, только если сможете оплачивать продления даже в год без продаж."]])

run('zh', "域名投资策略",
 "建立域名组合：收购、续费、定价和退出渠道。",
 "了解实用步骤、风险，以及 DomainDiscovery 在域名查询和注册调研方面的工作流程。",
 "阅读约 6 分钟", ["投资", "域名组合", "销售"], "投资、域名组合和销售",
 "投资者视角：{T}",
 [["域名投资带有投机性。流动性差异很大，大多数名称永远无法按想象中的零售价卖出。请把它当作库存生意来看待：收购成本、持有成本（续费）和终端用户的真实需求。",
   "DomainDiscovery 主要面向通过检查可用性来建设和调研的人，而不是投机性域名组合的买入信号。请自行做好研究。"],
  ["收购纪律",
   "手动注册、过期域名拍卖和私下购买各有不同的风险。有批发行情可参考时，用它来为出价设上限。不要对你无法向真实买家画像解释清楚的名称情绪化竞价。",
   "在表格里记录每个名称的续费日期和投资逻辑。没有逻辑的“孤儿”名称，正是域名组合悄悄消耗现金的原因。"],
  ["销售与定价的现实",
   "一口价、报价、落地页、经纪人和主动联系各有成本和合规规则（尤其是邮件营销）。终端用户购买的是故事和契合度，而不是你的成本价。",
   "注册局定价名称的溢价续费可能吃掉微薄的利润。在庆祝“便宜”的收获之前，先算好第二年的成本。"],
  ["风险控制",
   "商标雷区、制裁与合规问题以及交易平台费用都很重要。拿不准时，就放弃这个名称。只有在即使一年没有成交也付得起续费时，才做分散配置。"]])
