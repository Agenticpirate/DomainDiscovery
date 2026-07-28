# SEO / AEO / GEO docs — DomainDiscovery

| Doc | Purpose |
|-----|---------|
| [AUTOMATION.md](./AUTOMATION.md) | **Daily SEO-100 publish — how it works (no manual steps)** |
| [seo-100-drip-calendar.md](./seo-100-drip-calendar.md) | Day-by-day 2/day plan (100 articles) |
| [PHASE-F-OPS.md](./PHASE-F-OPS.md) | Measurement & ops runbook (GSC, CWV, quarterly audit) |
| [query-tracking.json](./query-tracking.json) | Brand + tool query segments to track in GSC |
| [content-calendar.md](./content-calendar.md) | Cadence + pillar polish schedule |

## Quick commands

```bash
# Local (dev server on :5001)
npm run seo:index-health

# Production
npm run seo:index-health:prod

# SEO-100 drip (2/day until exhausted)
npm run learn:schedule-seo:status
npm run learn:schedule-seo:assert
npm run learn:schedule-seo:verify

# Only if you edit markdown sources
npm run learn:import-seo
npm run learn:schedule-seo
```

## Code sources of truth

- `src/lib/seoSiteFacts.ts` — brand, product facts, features, page definitions, JSON-LD helpers  
- `src/lib/learnArticles.ts` — Learn catalog + **publish date gate**  
- `src/app/api/cron/seo-publish` — daily revalidate + status API  
- `.github/workflows/seo-daily-publish.yml` — GitHub automation  
- `src/app/robots.ts` / `src/app/sitemap.ts`  
- `src/app/llms.txt` / `src/app/llms-full.txt`  

Phases A–E implemented product foundations; Phase F is ongoing measurement.
