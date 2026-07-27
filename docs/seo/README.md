# SEO / AEO / GEO docs — DomainDiscovery

| Doc | Purpose |
|-----|---------|
| [PHASE-F-OPS.md](./PHASE-F-OPS.md) | Measurement & ops runbook (GSC, CWV, quarterly audit) |
| [query-tracking.json](./query-tracking.json) | Brand + tool query segments to track in GSC |
| [content-calendar.md](./content-calendar.md) | Cadence + pillar polish schedule |
| [seo-100-drip-calendar.md](./seo-100-drip-calendar.md) | **2/day publish plan for the 100 SEO articles** |

## Quick commands

```bash
# Local (dev server on :5001)
npm run seo:index-health

# Production
npm run seo:index-health:prod

# Re-expand Learn depth (Phase D script)
npm run learn:expand

# SEO-100 batch: re-import markdown, then drip-schedule 2/day
npm run learn:import-seo
npm run learn:schedule-seo
npm run learn:schedule-seo:status
```

## Code sources of truth

- `src/lib/seoSiteFacts.ts` — brand, product facts, features, page definitions, JSON-LD helpers  
- `src/lib/learnArticles.ts` — Learn catalog + topic clusters + related scoring  
- `src/app/robots.ts` / `src/app/sitemap.ts`  
- `src/app/llms.txt` / `src/app/llms-full.txt`  

Phases A–E implemented product foundations; Phase F is ongoing measurement.
