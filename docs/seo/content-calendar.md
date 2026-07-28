# Content calendar — DomainDiscovery Learn

**Cadence (SEO-100 batch):** **2 articles every day** until all 100 long-form guides are live (**50 days**, 2026-07-27 → 2026-09-14).  
**Cadence (pillars):** polish 1–2 product hubs per week as needed.  
**Depth floor:** ~800+ words, answer-first H2s, internal links to tools + cluster hub.  
**Avoid:** scaled thin stubs, doorway geo pages, fake stats.

Hubs: see `LEARN_CLUSTERS` in `src/lib/learnArticles.ts`.  
**Drip plan:** [seo-100-drip-calendar.md](./seo-100-drip-calendar.md) · **Automation:** [AUTOMATION.md](./AUTOMATION.md)

### How SEO-100 publishing works (fully automatic)

1. All 100 articles + dates are already in git (`learn-articles.json`).
2. Site date-gate: `publishedAt <= today (UTC)` → live on `/learn` + sitemap.
3. Learn pages are **force-dynamic** (always use current clock).
4. GitHub Action **SEO daily publish** runs every day (05:15 UTC): revalidate + verify.
5. **You do not commit daily.** One deploy of `main` is enough.

```bash
npm run learn:schedule-seo:status
```

---

## Week 1 — Domain search core

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish pillar | `domain-name-search-guide` | Head-term clarity, screenshots/steps optional |
| Thu | Polish pillar | `how-to-register-a-domain` | Registration funnel + tool CTAs |

## Week 2 — Brand + registration

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish | `what-is-domaindiscovery` | Brand consistency for AEO |
| Thu | Polish | `domain-registration-explained` | Registry vs registrar clarity |

## Week 3 — Geo / local

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish | `geo-domains-local-seo` | City-proper vs metro, tool CTA `/tools/geo` |
| Thu | Polish | `cctld-local-seo` | When ccTLDs help |

## Week 4 — Tools

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish | `whois-lookup-guide` | RDAP, privacy, share cards |
| Thu | Polish | `bulk-domain-search-guide` | Limits, workflow |

## Week 5 — Pricing + generator

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish | `domain-price-comparison-guide` | Promo vs renewal honesty |
| Thu | Polish | `ai-domain-name-generator-guide` | Human filters + live checks |

## Week 6 — TLDs + naming

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish | `what-is-a-tld-domain-extension` | Extensions browser CTA |
| Thu | Polish | `choosing-domain` | Radio test, brandable vs keyword |

## Week 7 — Beginner hygiene

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish | `domains-for-beginners` | Cluster hub quality |
| Thu | Polish | `safe-domain-purchase-checklist` | Practical checklist |

## Week 8 — Technical

| Day | Action | URL / slug | Goal |
|-----|--------|------------|------|
| Mon | Polish | `dns-guide` | Records + troubleshooting |
| Thu | Polish | `domains-and-seo` | Myths vs reality |

---

## Ongoing backlog (after week 8)

Rotate by GSC opportunity (impressions × low CTR or position 8–20):

1. `local-business-domains`
2. `how-to-buy-a-domain`
3. `com-vs-io-vs-ai`
4. `email-authentication-spf-dkim-dmarc`
5. `transferring-domains`
6. `brandable-vs-keyword-domains`
7. Investing cluster only if traffic demand appears — deprioritize vs product queries

---

## Per-article ship checklist

```
[ ] Primary keyword in title, H1, first 100 words, meta description
[ ] Answer-first definition section
[ ] 3–5 internal links (tool + cluster + related learn)
[ ] No invented statistics or review scores
[ ] CTA to real route (/, /tools/geo, /tools/whois, etc.)
[ ] readTime matches approximate length
[ ] In sitemap via learn catalog (automatic)
```

---

## Measurement loop

After each week’s publishes:

1. Note ship date in this file or a sheet.
2. 14–28 days later: check GSC queries for that URL.
3. If zero impressions after 6+ weeks: improve title/H1 or merge into a stronger hub.
