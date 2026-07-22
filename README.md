# DomainDiscovery

Free **domain name search** and domain toolkit (also searched as Domain Discovery / Domains Discovery).

Live availability across 1,600+ TLDs, AI name generator, bulk checks, geo domain lists, WHOIS/RDAP, extension browser, price comparison, and Learn guides. Research is free; registration checkout is at a third-party registrar.

## Develop

```bash
npm install
npm run dev
```

App defaults to [http://localhost:5001](http://localhost:5001).

### Production env (important)

```bash
NEXT_PUBLIC_BASE_URL=https://www.domainsdiscovery.com
# Optional GSC HTML-tag token:
# NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
```

See `.env.example` for the full list.

## SEO / ops

| Resource | Path |
|----------|------|
| Ops runbook (Phase F) | [docs/seo/PHASE-F-OPS.md](docs/seo/PHASE-F-OPS.md) |
| Query tracking seeds | [docs/seo/query-tracking.json](docs/seo/query-tracking.json) |
| Content calendar | [docs/seo/content-calendar.md](docs/seo/content-calendar.md) |
| Index health check | `npm run seo:index-health` |
| Prod health check | `npm run seo:index-health:prod` |

Machine-readable indexes (not a Google ranking lever): `/llms.txt`, `/llms-full.txt`.

## Scripts

```bash
npm run build
npm run typecheck
npm run seo:index-health
npm run learn:expand
```

## License

Private / project-specific unless otherwise noted.
