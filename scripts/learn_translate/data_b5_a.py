# -*- coding: utf-8 -*-
"""Batch b5 data (part 1): Registrars, Community, Trends, Strategy, Monetization, SEO, Development openings for de, es, fr, pt"""
from add_data import add_openings
REG, COM, TRD, STR, MON, SEO, DEV = {}, {}, {}, {}, {}, {}, {}

# ------------------------------------------------------------------ German
REG['de'] = {'headings': ["Registrar-Leitfaden: {T}", "Was gute Registrar-Bedienung ausmacht", "Transfers und Pushes", "Auswahl für Teams"], 'paras': [
 ["{D}",
  "Registrare verkaufen Domainregistrierungen an Endkunden und bieten oft DNS-, E-Mail- und Hosting-Zusatzleistungen an. Vergleichen Sie Verlängerungspreise, Transferregeln, Sicherheitsfunktionen (2FA, Sperre) und Supportqualität – nicht nur das beworbene Lockangebot fürs erste Jahr.",
  "Das Preisvergleichs-Tool von DomainDiscovery konzentriert sich auf die Recherche regulärer Preise; prüfen Sie die Endsumme im Warenkorb immer live nach."],
 ["Eine übersichtliche DNS-Oberfläche, zuverlässige Einstellungen für WHOIS-Datenschutz, unkomplizierte Auth-Codes, transparente Gebühren und Kontosicherheit. Billige Registrare, bei denen Transfers mühsam sind, kosten oft mehr Zeit, als sie sparen."],
 ["Ein Transfer verschiebt eine Domain zwischen Registraren; ein Push verschiebt sie zwischen Konten beim selben Registrar. Wissen Sie, welcher Weg für Ihren Käufer oder Kunden nötig ist. Beachten Sie die 60-Tage-Sperren nach Registrierung oder vorherigem Transfer."],
 ["Unternehmen legen vielleicht Wert auf Sicherheit und Support-SLAs, Startups eher auf Preis und API-Zugang. Dokumentieren Sie die Entscheidung, damit Verlängerungen die Buchhaltung nicht überraschen."]]}
COM['de'] = {'headings': ["Von der Community lernen: {T}", "Branchenmedien nutzen", "Urteilsvermögen aufbauen", "Praxisnah bleiben"], 'paras': [
 ["{D}",
  "Domain-Foren, Podcasts und Verkaufsberichte vermitteln Muster – und verstärken zugleich den Survivorship Bias. Betrachten Sie Anekdoten als Anstoß zur Recherche, nicht als Garantie.",
  "Prüfen Sie „Vergleichsverkäufe“ gegen und hüten Sie sich vor Leistungstheater."],
 ["Verkaufscharts helfen, Erwartungen zwischen Großhandel und Einzelhandel zu kalibrieren. Interviews zeigen Verhandlungstaktiken. Rechnen Sie trotzdem selbst nach – bei Verlängerungen und Opportunitätskosten."],
 ["Führen Sie ein persönliches Deal-Journal: was Sie gekauft haben, warum und mit welchem Ergebnis. Nach einem Jahr schlagen Ihre Notizen allgemeine Tipps. Verbinden Sie das Lernen in der Community mit Live-Verfügbarkeitsprüfungen und sauberer Portfoliopflege."],
 ["Nutzen Sie die kostenlose Domainsuche von DomainDiscovery (/), um die Live-Verfügbarkeit zu prüfen, bevor Sie einem Registrar Geld zahlen.",
  "Nutzen Sie Weiterbildung, um weniger, aber bessere Registrierungen vorzunehmen – nicht mehr impulsive."]]}
TRD['de'] = {'headings': ["Trendkontext: {T}", "Budgetierung im aktuellen Markt", "Signal von Rauschen trennen", "Trends mit Bedacht anwenden"], 'paras': [
 ["{D}",
  "Domainmärkte bewegen sich mit Startup-Finanzierungen, TLD-Moden, KI-Produktwellen und Liquiditätszyklen. Trends schaffen zugleich Chancen und Überfüllung.",
  "Setzen Sie lieber auf dauerhafte Marke und Nutzen als auf reine Hype-Zeichenfolgen, die Sie einem Käufer nicht erklären können."],
 ["Startups sollten für eine Hauptdomain und eine kleine defensive Auswahl budgetieren – nicht für endlose Varianten. Investoren sollten ihre Verlängerungsverpflichtungen für den Fall schwächerer Verkäufe durchrechnen."],
 ["Schlagzeilen-Verkäufe sind Ausreißer. Die typischen Ergebnisse sind unauffälliger. Bauen Sie einen Prozess auf: recherchieren, gezielt erwerben, mit Geduld entwickeln oder verkaufen."],
 ["Trifft ein Trend Ihre Nische (zum Beispiel Namensgebung für KI-Produkte), wenden Sie trotzdem Radiotest, Markenhygiene und Verlängerungsrechnung an. Die Tools von DomainDiscovery helfen Ihnen, die Verfügbarkeit schnell zu prüfen, während Sie entscheiden."]]}
STR['de'] = {'headings': ["Strategie: {T}", "Architektur mit mehreren Domains", "Öffentliches Entwickeln und Erzählung", "Checkliste zur Umsetzung"], 'paras': [
 ["{D}",
  "Domainstrategie bringt Namen mit der Produktarchitektur in Einklang: Hauptmarke, Produkte, Regionen und Kampagnen. Zu viele Domains verwässern Analysen und Markengedächtnis; zu wenige können Starts blockieren oder Verwirrung stiften.",
  "Zeichnen Sie eine einseitige Karte: welcher Hostname welche Zielgruppe bedient."],
 ["Nutzen Sie getrennte Domains, wenn Rechtseinheiten, Sprachen oder Produkte wirklich getrennt sein müssen. Andernfalls sind Pfade und Unterordner einer starken Domain besser für die SEO-Geschlossenheit.",
  "Ein Rebranding braucht Weiterleitungspläne, E-Mail-Umstellungen und einen Stopp für Prestigekäufe während des Übergangs."],
 ["Wer öffentlich entwickelt („Building in Public“), reduziert Reibung mit einer klaren Domain und einheitlichen Handles. Dokumentieren Sie die Geschichte auf der Website, damit eingehendes Interesse an einer dauerhaften Stelle landet."],
 ["Domains → Verantwortliche → DNS → Analytics → Verlängerungsbudget abbilden. Zweimal im Jahr prüfen. Suchen Sie früh nach der Verfügbarkeit kommender Produktnamen, damit das Marketing in der Startwoche nicht blockiert ist."]]}
MON['de'] = {'headings': ["Monetarisierung: {T}", "Parking oder Entwicklung", "Ethik und Compliance", "Messung"], 'paras': [
 ["{D}",
  "Parking- und Type-in-Strategien hängen von Restverkehr ab. Die meisten modernen Namen verdienen ohne Entwicklung oder Verkauf wenig. Messen Sie den Traffic, bevor Sie Parking-Einnahmen annehmen.",
  "Richtlinienänderungen bei Parking-Anbietern und Browsern können Monetarisierungsmodelle schnell zunichtemachen."],
 ["Parking ist passiv und bringt meist wenig. Entwicklung kostet Zeit, kann aber echte Leads oder Content-Assets schaffen. Entscheiden Sie nach Fähigkeiten und Kapital, nicht nach Forenhype."],
 ["Meiden Sie irreführende Anzeigen, markenverletzende Landingpages und Netzwerke in der Nähe von Malware. Kurzfristige Klicks sind keinen langfristigen Marken- oder Rechtsschaden wert."],
 ["Erfassen Sie Besuche, Einnahmen und Kaufanfragen getrennt. Trennen Sie sich von Namen, die nur Verlängerungskosten verursachen und keine These haben."]]}
SEO['de'] = {'headings': ["SEO-Perspektive: {T}", "Auf der Domain und auf der Seite", "Risiken bei SEO mit mehreren Domains", "Praktischer Ablauf"], 'paras': [
 ["{D}",
  "Domains beeinflussen Marke und Klickrate; Rankings hängen weiterhin von inhaltlicher Relevanz, Nutzererlebnis, Links und technischer Qualität ab. HTTPS ist Grundvoraussetzung. Internationale Setups brauchen eine klare Ausrichtung auf Land und Sprache – keine duplizierten Doorway-Hosts.",
  "Wählen Sie einen kanonischen Haupt-Host (www oder Apex) und bleiben Sie mit Weiterleitungen dabei."],
 ["Auf der Domain: sinnvoller Name, richtige TLD-Strategie, sauberes DNS, schnelles Hosting, HTTPS, logische URL-Struktur. Auf der Seite: die Suchanfrage beantworten, klare Überschriften, interne Links und eigene Belege nutzen.",
  "Erwarten Sie nicht, dass eine neue Domain etablierte Konkurrenz über Nacht überholt. Messen Sie nach dem Start Impressionen und Suchanfragen in der Search Console."],
 ["Dünne Inhalte auf viele Domains zu verteilen schneidet meist schlechter ab als eine starke Domain mit gut strukturierten lokalen oder Produktseiten. Wenn Sie mehrere Domains nutzen, geben Sie jeder einen eigenen Zweck und eine eigene Zielgruppe.",
  "Alte Domains mit Spam-Historie können mehr schaden als nützen – prüfen Sie die Historie, bevor Sie wegen „SEO-Saft“ kaufen."],
 ["Verfügbarkeit suchen → bei gebrauchten Namen Historie/WHOIS prüfen → zuerst die Inhaltsgliederung erstellen → mit Analytics und Search Console starten → iterieren. Die Tools von DomainDiscovery unterstützen die Recherchehälfte dieses Kreislaufs."]]}
DEV['de'] = {'headings': ["Entwicklungsperspektive: {T}", "Grundlagen von Content-Seiten", "Ethik bei der Lead-Generierung", "Technik und Messung"], 'paras': [
 ["{D}",
  "Domains zu Content- oder Lead-Gen-Seiten auszubauen erfordert echten Nutzen für die Besucher. Dünne Doorway-Seiten schneiden schlecht ab und können gegen Qualitätserwartungen der Suchmaschinen verstoßen.",
  "Gehen Sie von den Problemen der Zielgruppe aus, nicht allein vom Keyword."],
 ["Wählen Sie eine Nische, die Sie mit eigener Erfahrung abdecken können. Technisches SEO, interne Links und ehrliche Aussagen zählen. Monetarisieren Sie erst, wenn es einen Grund für den Besuch gibt."],
 ["Wenn Sie Leads erzeugen, seien Sie transparent über das Unternehmen, halten Sie Datenschutz- und Werberegeln ein und sammeln Sie Daten nicht auf täuschende Weise. Der Seiteninhalt muss halten, was die Anzeigen versprechen."],
 ["Nutzen Sie zuverlässiges Hosting, HTTPS, Analytics und Conversion-Events. Stellen Sie Projekte ein, die Verlängerungen und Zeitaufwand nicht rechtfertigen."]]}

# ------------------------------------------------------------------ Spanish
REG['es'] = {'headings': ["Guía de registradores: {T}", "Qué incluye una buena experiencia de registrador", "Transferencias y pushes", "Elegir para equipos"], 'paras': [
 ["{D}",
  "Los registradores venden registros de dominios al público y a menudo ofrecen DNS, correo y alojamiento como extras. Compara precios de renovación, políticas de transferencia, funciones de seguridad (2FA, bloqueo) y calidad del soporte, no solo la oferta de gancho del primer año.",
  "La herramienta de comparación de precios de DomainDiscovery se centra en la investigación de precios habituales; confirma siempre el total real en el carrito."],
 ["Una interfaz de DNS clara, controles fiables de privacidad WHOIS, códigos de autorización sencillos, tarifas transparentes y seguridad de la cuenta. Los registradores baratos que complican las transferencias pueden costar más tiempo del que ahorran."],
 ["Las transferencias mueven un dominio entre registradores; los pushes lo mueven entre cuentas del mismo registrador. Sabe qué vía necesita tu comprador o cliente. Vigila los bloqueos de 60 días tras el registro o una transferencia previa."],
 ["Las empresas pueden dar prioridad a la seguridad y a los SLA de soporte; las startups, al precio y al acceso por API. Documenta la elección para que las renovaciones no sorprendan a finanzas."]]}
COM['es'] = {'headings': ["Aprender de la comunidad: {T}", "Cómo usar los medios del sector", "Desarrollar criterio", "Mantente práctico"], 'paras': [
 ["{D}",
  "Los foros, los pódcast y los informes de ventas de dominios enseñan patrones, pero también amplifican el sesgo del superviviente. Trata las anécdotas como pistas para investigar, no como garantías.",
  "Contrasta las “ventas comparables” y desconfía del teatro del rendimiento."],
 ["Los gráficos de ventas ayudan a calibrar las expectativas mayoristas frente a las minoristas. Las entrevistas revelan tácticas de negociación. Aun así, haz tus propios cálculos de renovaciones y coste de oportunidad."],
 ["Lleva un diario personal de operaciones: qué compraste, por qué y con qué resultado. Al cabo de un año, tus notas superan a los consejos genéricos. Combina el aprendizaje de la comunidad con comprobaciones de disponibilidad en vivo y una buena higiene de cartera."],
 ["Usa la búsqueda gratuita de dominios de DomainDiscovery (/) para comprobar la disponibilidad en tiempo real antes de pagar a un registrador.",
  "Usa la formación para hacer menos registros y mejores, no más impulsivos."]]}
TRD['es'] = {'headings': ["Contexto de tendencias: {T}", "Presupuesto en el mercado actual", "Separar la señal del ruido", "Aplicar las tendencias con cuidado"], 'paras': [
 ["{D}",
  "Los mercados de dominios se mueven con la financiación de startups, las modas de nuevas TLD, las oleadas de productos de IA y los ciclos de liquidez. Las tendencias crean oportunidad y saturación a la vez.",
  "Prefiere una marca duradera y útil antes que cadenas puramente de moda que no puedas explicar a un comprador."],
 ["Las startups deben presupuestar un dominio principal y un pequeño conjunto defensivo, no variantes infinitas. Los inversores deben poner a prueba sus obligaciones de renovación por si las ventas se frenan."],
 ["Las ventas de titular son atípicas. Los resultados medianos son más discretos. Construye un proceso: investigar, adquirir con selectividad, desarrollar o vender con paciencia."],
 ["Si una tendencia llega a tu nicho (por ejemplo, nombres para productos de IA), aplica igualmente la prueba de la radio, la higiene de marcas y las cuentas de renovación. Las herramientas de DomainDiscovery te ayudan a comprobar la disponibilidad rápido mientras decides."]]}
STR['es'] = {'headings': ["Estrategia: {T}", "Arquitectura multidominio", "Construir en público y la narrativa", "Lista de comprobación de ejecución"], 'paras': [
 ["{D}",
  "La estrategia de dominios alinea los nombres con la arquitectura del producto: marca principal, productos, regiones y campañas. Demasiados dominios diluyen la analítica y la memoria de marca; muy pocos pueden bloquear lanzamientos o generar confusión.",
  "Escribe un mapa de una página: qué nombre de host atiende a qué público."],
 ["Usa dominios separados cuando las entidades legales, los idiomas o los productos realmente necesiten separación. Si no, prefiere rutas y subcarpetas en un dominio fuerte para lograr cohesión SEO.",
  "Los cambios de marca necesitan planes de redirección, migraciones de correo y una pausa en las compras de vanidad durante la transición."],
 ["Si construyes en público, un dominio claro y un conjunto coherente de perfiles reducen la fricción. Documenta la historia en el sitio para que el interés entrante llegue a un lugar duradero."],
 ["Mapea dominios → responsables → DNS → analítica → presupuesto de renovación. Revísalo dos veces al año. Busca pronto la disponibilidad de los nombres de futuros productos para que marketing no se bloquee en la semana de lanzamiento."]]}
MON['es'] = {'headings': ["Monetización: {T}", "Parking frente a desarrollo", "Ética y cumplimiento", "Medición"], 'paras': [
 ["{D}",
  "Las estrategias de parking y de tráfico directo dependen del tráfico residual. La mayoría de los nombres actuales ganan poco sin desarrollo o venta. Mide el tráfico antes de dar por hecho los ingresos del parking.",
  "Los cambios de política de los proveedores de parking y de los navegadores pueden borrar de golpe los modelos de monetización."],
 ["El parking es pasivo y suele rendir poco. Desarrollar cuesta tiempo, pero puede crear contactos reales o activos de contenido. Elige según tus habilidades y tu capital, no según el entusiasmo de los foros."],
 ["Evita los anuncios engañosos, las páginas que infringen marcas y las redes cercanas al malware. Los clics a corto plazo no compensan el daño legal o de marca a largo plazo."],
 ["Registra por separado las visitas, los ingresos y las consultas de compra. Descarta los nombres que solo cuestan renovaciones sin una tesis."]]}
SEO['es'] = {'headings': ["Ángulo SEO: {T}", "Qué hacer en el dominio y en la página", "Riesgos del SEO con varios dominios", "Flujo de trabajo práctico"], 'paras': [
 ["{D}",
  "Los dominios influyen en la marca y en el porcentaje de clics; el posicionamiento sigue dependiendo de la relevancia del contenido, la experiencia, los enlaces y la calidad técnica. HTTPS es la base. Las configuraciones internacionales necesitan una orientación clara por país e idioma, no hosts puerta duplicados.",
  "Elige un host canónico principal (www o apex) y mantenlo con redirecciones."],
 ["En el dominio: nombre sensato, estrategia de TLD correcta, DNS limpio, alojamiento rápido, HTTPS y estructura de URL lógica. En la página: responde a la consulta, usa encabezados claros, enlaces internos y pruebas originales.",
  "No esperes que un dominio nuevo supere de la noche a la mañana a competidores consolidados. Mide impresiones y consultas en Search Console tras el lanzamiento."],
 ["Repartir contenido escaso entre muchos dominios suele rendir menos que un dominio fuerte con páginas locales o de producto bien estructuradas. Si usas varios dominios, dale a cada uno un propósito y un público distintos.",
  "Los dominios antiguos con historial de spam pueden perjudicar más que ayudar: comprueba el historial antes de comprar por el “jugo SEO”."],
 ["Buscar disponibilidad → verificar historial/WHOIS en nombres usados → preparar primero el esquema de contenido → lanzar con analítica y Search Console → iterar. Las herramientas de DomainDiscovery apoyan la mitad de investigación de ese ciclo."]]}
DEV['es'] = {'headings': ["Enfoque de desarrollo: {T}", "Fundamentos de los sitios de contenido", "Ética en la generación de contactos", "Tecnología y medición"], 'paras': [
 ["{D}",
  "Convertir dominios en sitios de contenido o de captación de contactos exige un valor real para el usuario. Las páginas puerta de poco contenido rinden mal y pueden incumplir las expectativas de calidad de los buscadores.",
  "Parte de los problemas de la audiencia, no solo de la palabra clave."],
 ["Elige un nicho que puedas cubrir con experiencia propia. Importan el SEO técnico, los enlaces internos y las afirmaciones honestas. Monetiza solo cuando haya un motivo para visitar el sitio."],
 ["Si generas contactos, sé transparente sobre el negocio, cumple las normas de privacidad y publicidad y no recojas datos de forma engañosa. El contenido de la página debe coincidir con lo que prometen los anuncios."],
 ["Usa alojamiento fiable, HTTPS, analítica y eventos de conversión. Cierra los proyectos que no justifiquen las renovaciones ni el tiempo."]]}

# ------------------------------------------------------------------ French
REG['fr'] = {'headings': ["Guide des registraires : {T}", "Ce que comprend une bonne expérience registraire", "Transferts et pushs", "Choisir pour une équipe"], 'paras': [
 ["{D}",
  "Les registraires vendent des enregistrements de domaines au détail et proposent souvent des options DNS, e-mail et hébergement. Comparez les prix de renouvellement, les politiques de transfert, les fonctions de sécurité (2FA, verrou) et la qualité du support, pas seulement l'offre d'appel de la première année.",
  "L'outil de comparaison de prix de DomainDiscovery se concentre sur la recherche de tarifs réguliers ; confirmez toujours le total réel du panier."],
 ["Une interface DNS claire, des contrôles fiables de confidentialité WHOIS, des codes d'autorisation simples, des frais transparents et la sécurité du compte. Les registraires bon marché qui compliquent les transferts peuvent coûter plus de temps qu'ils n'en font gagner."],
 ["Un transfert déplace un domaine d'un registraire à un autre ; un push le déplace entre comptes chez le même registraire. Sachez quelle voie convient à votre acheteur ou client. Surveillez les verrous de 60 jours après un enregistrement ou un transfert récent."],
 ["Les grandes entreprises peuvent privilégier la sécurité et les SLA de support ; les start-up, le prix et l'accès à l'API. Documentez le choix pour que les renouvellements ne surprennent pas la finance."]]}
COM['fr'] = {'headings': ["Apprendre de la communauté : {T}", "Comment utiliser les médias du secteur", "Forger son jugement", "Rester pragmatique"], 'paras': [
 ["{D}",
  "Les forums, podcasts et rapports de ventes de domaines enseignent des tendances, mais amplifient aussi le biais du survivant. Considérez les anecdotes comme des pistes de recherche, pas comme des garanties.",
  "Recoupez les « ventes comparables » et méfiez-vous du théâtre de la performance."],
 ["Les graphiques de ventes aident à calibrer les attentes de gros et de détail. Les entretiens révèlent des tactiques de négociation. Faites tout de même vos propres calculs de renouvellements et de coût d'opportunité."],
 ["Tenez un journal personnel de vos opérations : ce que vous avez acheté, pourquoi, avec quel résultat. Au bout d'un an, vos notes valent mieux que les conseils génériques. Associez l'apprentissage communautaire à des vérifications de disponibilité en direct et à une bonne hygiène de portefeuille."],
 ["Utilisez la recherche gratuite de noms de domaine de DomainDiscovery (/) pour vérifier la disponibilité en direct avant de payer un registraire.",
  "Servez-vous de la formation pour faire moins d'enregistrements, mais meilleurs, et non davantage d'enregistrements impulsifs."]]}
TRD['fr'] = {'headings': ["Contexte des tendances : {T}", "Budgétiser dans le marché actuel", "Séparer le signal du bruit", "Appliquer les tendances avec prudence"], 'paras': [
 ["{D}",
  "Les marchés de domaines évoluent au rythme du financement des start-up, des modes de nouveaux TLD, des vagues de produits d'IA et des cycles de liquidité. Les tendances créent à la fois des opportunités et de la surpopulation.",
  "Préférez une marque durable et utile à de pures chaînes à la mode que vous ne sauriez pas expliquer à un acheteur."],
 ["Les start-up devraient budgéter un domaine principal et un petit ensemble défensif, pas des variantes à l'infini. Les investisseurs devraient tester la résistance de leurs obligations de renouvellement si les ventes ralentissent."],
 ["Les ventes qui font la une sont des exceptions. Les résultats médians sont plus discrets. Bâtissez un processus : rechercher, acquérir avec sélectivité, développer ou vendre avec patience."],
 ["Si une tendance touche votre niche (par exemple le nommage de produits d'IA), appliquez quand même le test de la radio, l'hygiène des marques et le calcul des renouvellements. Les outils de DomainDiscovery vous aident à vérifier rapidement la disponibilité pendant que vous décidez."]]}
STR['fr'] = {'headings': ["Stratégie : {T}", "Architecture multi-domaines", "Construire en public et récit", "Liste de contrôle d'exécution"], 'paras': [
 ["{D}",
  "La stratégie de domaines aligne les noms sur l'architecture du produit : marque principale, produits, régions et campagnes. Trop de domaines diluent les statistiques et la mémoire de marque ; trop peu peuvent bloquer des lancements ou créer de la confusion.",
  "Rédigez une carte d'une page : quel nom d'hôte sert quelle audience."],
 ["Utilisez des domaines séparés quand les entités juridiques, les langues ou les produits l'exigent vraiment. Sinon, préférez des chemins et sous-dossiers sur un seul domaine fort pour la cohérence SEO.",
  "Un changement de marque demande des plans de redirection, des bascules d'e-mail et un gel des achats de prestige pendant la transition."],
 ["Si vous construisez en public, un domaine clair et des identifiants cohérents réduisent les frictions. Racontez l'histoire sur le site pour que l'intérêt entrant atterrisse quelque part de durable."],
 ["Cartographiez domaines → responsables → DNS → statistiques → budget de renouvellement. Révisez deux fois par an. Recherchez tôt la disponibilité des futurs noms de produits pour que le marketing ne soit pas bloqué la semaine du lancement."]]}
MON['fr'] = {'headings': ["Monétisation : {T}", "Parking ou développement", "Éthique et conformité", "Mesure"], 'paras': [
 ["{D}",
  "Les stratégies de parking et de saisie directe dépendent du trafic résiduel. La plupart des noms actuels rapportent peu sans développement ni vente. Mesurez le trafic avant de supposer des revenus de parking.",
  "Les changements de politique des fournisseurs de parking et des navigateurs peuvent faire disparaître rapidement les modèles de monétisation."],
 ["Le parking est passif et rapporte généralement peu. Le développement coûte du temps, mais peut créer de vrais contacts ou des actifs de contenu. Choisissez selon vos compétences et votre capital, pas selon l'engouement des forums."],
 ["Évitez les publicités trompeuses, les pages de vente portant atteinte aux marques et les réseaux proches des malwares. Des clics à court terme ne valent pas un dommage durable pour la marque ou sur le plan juridique."],
 ["Suivez séparément les visites, les revenus et les demandes d'achat. Abandonnez les noms qui ne coûtent que des renouvellements sans thèse."]]}
SEO['fr'] = {'headings': ["Angle SEO : {T}", "Sur le domaine et sur la page", "Risques du SEO multi-domaines", "Processus pratique"], 'paras': [
 ["{D}",
  "Les domaines influencent la marque et le taux de clics ; le classement dépend toujours de la pertinence du contenu, de l'expérience, des liens et de la qualité technique. HTTPS est la base. Les configurations internationales exigent un ciblage clair par pays et par langue, pas des hôtes satellites dupliqués.",
  "Choisissez un hôte canonique principal (www ou apex) et tenez-vous-y grâce aux redirections."],
 ["Sur le domaine : nom pertinent, bonne stratégie de TLD, DNS propre, hébergement rapide, HTTPS, structure d'URL logique. Sur la page : répondre à la requête, utiliser des titres clairs, des liens internes et des preuves originales.",
  "Ne comptez pas sur un nouveau domaine pour dépasser des concurrents établis du jour au lendemain. Mesurez les impressions et les requêtes dans la Search Console après le lancement."],
 ["Disperser un contenu mince sur de nombreux domaines donne généralement de moins bons résultats qu'un seul domaine fort avec des pages locales ou produit bien structurées. Si vous utilisez plusieurs domaines, donnez à chacun un objectif et une audience distincts.",
  "Les domaines anciens à l'historique de spam peuvent nuire plus qu'aider : vérifiez l'historique avant d'acheter pour le « jus SEO »."],
 ["Rechercher la disponibilité → vérifier l'historique/WHOIS des noms déjà utilisés → établir d'abord le plan de contenu → lancer avec les statistiques et la Search Console → itérer. Les outils de DomainDiscovery soutiennent la moitié recherche de cette boucle."]]}
DEV['fr'] = {'headings': ["Angle développement : {T}", "Bases des sites de contenu", "Éthique de la génération de leads", "Pile technique et mesure"], 'paras': [
 ["{D}",
  "Transformer des domaines en sites de contenu ou de génération de leads exige une vraie valeur pour l'utilisateur. Les pages satellites minces performent mal et peuvent enfreindre les exigences de qualité des moteurs de recherche.",
  "Partez des problèmes de l'audience, pas seulement du mot-clé."],
 ["Choisissez une niche que vous pouvez couvrir avec une expérience originale. Le SEO technique, le maillage interne et les affirmations honnêtes comptent. Ne monétisez qu'une fois qu'il existe une raison de visiter le site."],
 ["Si vous générez des leads, soyez transparent sur l'activité, respectez les règles de confidentialité et de publicité et ne collectez pas de données de façon trompeuse. Le contenu de la page doit correspondre à ce que promettent les annonces."],
 ["Utilisez un hébergement fiable, HTTPS, des statistiques et des événements de conversion. Arrêtez les projets qui ne justifient pas les renouvellements et le temps."]]}

# ------------------------------------------------------------------ Portuguese
REG['pt'] = {'headings': ["Guia de registradores: {T}", "O que inclui uma boa experiência de registrador", "Transferências e pushes", "Escolhendo para equipes"], 'paras': [
 ["{D}",
  "Registradores vendem registros de domínios no varejo e costumam oferecer DNS, e-mail e hospedagem como complementos. Compare preços de renovação, políticas de transferência, recursos de segurança (2FA, bloqueio) e qualidade do suporte, não apenas a oferta de gancho do primeiro ano.",
  "A ferramenta de comparação de preços do DomainDiscovery foca na pesquisa de preços regulares; confirme sempre o total real no carrinho."],
 ["Interface de DNS clara, controles confiáveis de privacidade WHOIS, códigos de autorização simples, taxas transparentes e segurança da conta. Registradores baratos que dificultam transferências podem custar mais tempo do que economizam."],
 ["Transferências movem um domínio entre registradores; pushes movem entre contas no mesmo registrador. Saiba qual caminho seu comprador ou cliente precisa. Fique atento aos bloqueios de 60 dias após o registro ou uma transferência anterior."],
 ["Empresas podem priorizar segurança e SLAs de suporte; startups, preço e acesso à API. Documente a escolha para que as renovações não surpreendam o financeiro."]]}
COM['pt'] = {'headings': ["Aprendendo com a comunidade: {T}", "Como usar a mídia do setor", "Construindo discernimento", "Mantenha o pé no chão"], 'paras': [
 ["{D}",
  "Fóruns, podcasts e relatórios de vendas de domínios ensinam padrões, mas também amplificam o viés de sobrevivência. Trate anedotas como pistas para pesquisar, não como garantias.",
  "Confira as “vendas comparáveis” e cuidado com o teatro de desempenho."],
 ["Gráficos de vendas ajudam a calibrar expectativas de atacado e varejo. Entrevistas revelam táticas de negociação. Ainda assim, faça seus próprios cálculos de renovações e custo de oportunidade."],
 ["Mantenha um diário pessoal de negócios: o que comprou, por quê e o resultado. Em um ano, suas anotações superam dicas genéricas. Combine o aprendizado da comunidade com verificações de disponibilidade ao vivo e boa higiene de portfólio."],
 ["Use a busca gratuita de domínios do DomainDiscovery (/) para verificar a disponibilidade ao vivo antes de pagar a um registrador.",
  "Use o estudo para fazer menos registros e melhores, não mais registros por impulso."]]}
TRD['pt'] = {'headings': ["Contexto de tendências: {T}", "Orçamento no mercado atual", "Separando sinal de ruído", "Aplique as tendências com cuidado"], 'paras': [
 ["{D}",
  "Os mercados de domínios se movem com o financiamento de startups, modismos de novas TLDs, ondas de produtos de IA e ciclos de liquidez. Tendências criam oportunidade e superlotação ao mesmo tempo.",
  "Prefira marca duradoura e utilidade a sequências puramente da moda que você não saberia explicar a um comprador."],
 ["Startups devem orçar um domínio principal e um pequeno conjunto defensivo, não variações infinitas. Investidores devem testar suas obrigações de renovação caso as vendas desacelerem."],
 ["Vendas de manchete são exceções. Os resultados medianos são mais discretos. Construa um processo: pesquisar, adquirir com seletividade, desenvolver ou vender com paciência."],
 ["Se uma tendência atinge seu nicho (por exemplo, nomes de produtos de IA), aplique mesmo assim o teste do rádio, a higiene de marcas e a conta das renovações. As ferramentas do DomainDiscovery ajudam a verificar a disponibilidade rapidamente enquanto você decide."]]}
STR['pt'] = {'headings': ["Estratégia: {T}", "Arquitetura de vários domínios", "Construir em público e a narrativa", "Checklist de execução"], 'paras': [
 ["{D}",
  "A estratégia de domínios alinha nomes à arquitetura do produto: marca principal, produtos, regiões e campanhas. Domínios demais diluem as métricas e a memória da marca; de menos, podem bloquear lançamentos ou gerar confusão.",
  "Escreva um mapa de uma página: qual hostname atende qual público."],
 ["Use domínios separados quando entidades jurídicas, idiomas ou produtos realmente precisarem de separação. Caso contrário, prefira caminhos e subpastas em um domínio forte para coesão de SEO.",
  "Rebrandings exigem planos de redirecionamento, migração de e-mail e uma pausa nas compras de vaidade durante a transição."],
 ["Se você constrói em público, um domínio claro e um conjunto consistente de perfis reduzem o atrito. Documente a história no site para que o interesse recebido chegue a um lugar duradouro."],
 ["Mapeie domínios → responsáveis → DNS → analytics → orçamento de renovação. Revise duas vezes por ano. Pesquise cedo a disponibilidade dos nomes de produtos futuros para que o marketing não trave na semana do lançamento."]]}
MON['pt'] = {'headings': ["Monetização: {T}", "Parking versus desenvolvimento", "Ética e conformidade", "Medição"], 'paras': [
 ["{D}",
  "Estratégias de parking e de acesso direto dependem de tráfego residual. A maioria dos nomes atuais rende pouco sem desenvolvimento ou venda. Meça o tráfego antes de presumir receita de parking.",
  "Mudanças de política de provedores de parking e de navegadores podem apagar modelos de monetização rapidamente."],
 ["O parking é passivo e geralmente rende pouco. Desenvolver custa tempo, mas pode gerar leads reais ou ativos de conteúdo. Escolha conforme suas habilidades e seu capital, não conforme o entusiasmo dos fóruns."],
 ["Evite anúncios enganosos, páginas que violam marcas e redes próximas a malware. Cliques de curto prazo não compensam danos jurídicos ou à marca no longo prazo."],
 ["Acompanhe separadamente visitas, receita e consultas de compra. Descarte nomes que só geram custo de renovação sem uma tese."]]}
SEO['pt'] = {'headings': ["Ângulo de SEO: {T}", "O que fazer no domínio e na página", "Riscos de SEO com vários domínios", "Fluxo de trabalho prático"], 'paras': [
 ["{D}",
  "Domínios influenciam a marca e a taxa de cliques; o ranqueamento ainda depende da relevância do conteúdo, da experiência, dos links e da qualidade técnica. HTTPS é o mínimo. Configurações internacionais precisam de direcionamento claro por país e idioma, não de hosts-portal duplicados.",
  "Escolha um host canônico principal (www ou apex) e mantenha-o com redirecionamentos."],
 ["No domínio: nome sensato, estratégia de TLD correta, DNS limpo, hospedagem rápida, HTTPS, estrutura de URL lógica. Na página: responda à consulta, use títulos claros, links internos e evidências originais.",
  "Não espere que um domínio novo supere concorrentes estabelecidos da noite para o dia. Meça impressões e consultas no Search Console após o lançamento."],
 ["Espalhar conteúdo fraco por muitos domínios costuma render menos do que um domínio forte com páginas locais ou de produto bem estruturadas. Se usar vários domínios, dê a cada um um propósito e um público distintos.",
  "Domínios antigos com histórico de spam podem prejudicar mais do que ajudar: verifique o histórico antes de comprar pelo “suco de SEO”."],
 ["Pesquisar disponibilidade → verificar histórico/WHOIS de nomes usados → montar primeiro o esboço de conteúdo → lançar com analytics e Search Console → iterar. As ferramentas do DomainDiscovery apoiam a metade de pesquisa desse ciclo."]]}
DEV['pt'] = {'headings': ["Ângulo de desenvolvimento: {T}", "Noções básicas de sites de conteúdo", "Ética na geração de leads", "Stack e medição"], 'paras': [
 ["{D}",
  "Transformar domínios em sites de conteúdo ou de geração de leads exige valor real para o usuário. Páginas-portal fracas rendem mal e podem violar as expectativas de qualidade dos buscadores.",
  "Comece pelos problemas do público, não apenas pela palavra-chave."],
 ["Escolha um nicho que você possa cobrir com experiência própria. SEO técnico, links internos e afirmações honestas importam. Monetize só depois que houver um motivo para visitar."],
 ["Se você gera leads, seja transparente sobre o negócio, cumpra as regras de privacidade e publicidade e não colete dados de forma enganosa. O conteúdo da página deve corresponder ao que os anúncios prometem."],
 ["Use hospedagem confiável, HTTPS, analytics e eventos de conversão. Encerre projetos que não justifiquem renovações e tempo."]]}

for cat, d in (('Registrars', REG), ('Community', COM), ('Trends', TRD), ('Strategy', STR), ('Monetization', MON), ('SEO', SEO), ('Development', DEV)):
    add_openings(cat, d)
