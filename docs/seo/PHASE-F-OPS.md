# Phase F — Measurement & ops (DomainDiscovery)

Ongoing SEO / AEO ops after Phases A–E foundations. This is a **runbook**, not a ranking guarantee.

**Official site (canonical):** `https://www.domainsdiscovery.com`  
**Apex:** `https://domainsdiscovery.com` (often 307 → www — set env to **www**)  
**Brand:** DomainDiscovery (also Domain Discovery, Domains Discovery)  
**Sitemap:** `https://www.domainsdiscovery.com/sitemap.xml`  
**Robots:** `https://www.domainsdiscovery.com/robots.txt`  
**LLM indexes (not a ranking lever):** `/llms.txt`, `/llms-full.txt`

---

## 1. Google Search Console (week 0)

### Setup

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a **Domain** property for `domainsdiscovery.com` (DNS TXT preferred — covers apex + www) **or** a URL-prefix property for `https://www.domainsdiscovery.com`.
3. **Meta-tag verification (optional):** set env and redeploy:

   ```bash
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_token_from_gsc
   ```

   Root layout injects `verification.google` when this is present (see `.env.example`).

4. Confirm ownership, then **Sitemaps → Add new sitemap** → submit:

   ```
   sitemap.xml
   ```

5. Request indexing (sparingly) for primary URLs only after deploy:

   - `/`
   - `/search`
   - `/tools/geo`
   - `/tools/whois`
   - `/learn`
   - `/learn/domain-name-search-guide`
   - `/learn/what-is-domaindiscovery`

### Cadence

| When | Action |
|------|--------|
| Weekly (first 8 weeks) | Coverage, enhancement, and query reports |
| Monthly (steady state) | Same + compare vs prior month |
| After large content deploys | Re-check sitemap processing + sample Learn URLs |

---

## 2. Query tracking (what to watch)

Seed list: [`query-tracking.json`](./query-tracking.json).

### Brand

- domaindiscovery  
- domain discovery  
- domains discovery  
- domainsdiscovery  

### Product / tools

- domain name search  
- domain availability checker  
- free domain search  
- bulk domain search  
- geo domain generator  
- whois lookup  
- domain price comparison  
- ai domain name generator  
- domain extensions  

### Registration / education

- how to register a domain  
- what is a tld  
- domain registration  

### How to use GSC

1. **Performance → Queries** — filter brand vs non-brand.
2. Export CSV monthly into a sheet with columns: query, clicks, impressions, CTR, position, notes.
3. Flag **impressions↑ + CTR↓** (title/meta rewrite candidates).
4. Flag **position 8–20** (content/internal-link polish candidates).
5. Do **not** chase vanity brand positions only — non-brand tool queries pay the product.

---

## 3. Index coverage (Learn + tools)

### Healthy signals

- URL returns **200**
- Unique `<title>` and meta description
- Substantial body (Learn target ≥ ~800 words — enforced in Phase D inventory)
- In sitemap when intentionally indexable
- No soft-404 (“page not found” copy on 200)

### Watch list

| Risk | Where | Action |
|------|--------|--------|
| Soft-404 Learn | `/learn/*` | Expand or consolidate; avoid thin stubs |
| Orphan pages | tools without internal links | Link from home, footer, clusters |
| Duplicate intent | similar Learn titles | One primary keyword owner (Phase D clusters) |
| Blocked URLs | `/api/*`, `/share/*` | Expected (robots disallow) |
| Wrong host | non-canonical domain | Fix `NEXT_PUBLIC_BASE_URL` |

### Automated check

```bash
# Against local dev (default http://127.0.0.1:5001)
npm run seo:index-health

# Against production (canonical www host)
npm run seo:index-health:prod

# JSON report
npm run seo:index-health -- --base https://www.domainsdiscovery.com --json > /tmp/seo-health.json
```

Script: `scripts/seo-index-health.mjs`  
Checks core routes + sample Learn hubs for status, title, definition/facts markers, and local Learn word counts.

---

## 4. Core Web Vitals / PageSpeed (optional)

Priority URLs:

1. `/` (home search)
2. `/tools/geo` (heavy UI)
3. `/learn` + one pillar (`/learn/domain-name-search-guide`)
4. `/tools/compare` (large data — known heavy)

### How

- [PageSpeed Insights](https://pagespeed.web.dev/) — lab + field when available  
- Chrome UX Report (CrUX) in PSI when the origin has enough traffic  
- GSC → **Core Web Vitals** (field data)

### Targets (guidance, not guarantees)

- **LCP** — aim good on mobile for home/learn  
- **INP** — watch interactive tools (geo, search)  
- **CLS** — avoid layout jump on sticky search chrome  

Log scores monthly in the ops sheet. Fix regressions before new content waves.

---

## 5. Content calendar

See [`content-calendar.md`](./content-calendar.md).

**Steady rate:** ~2 pillar rewrites or new high-intent guides per week (quality over volume).

Priority order:

1. Beginner / registration / domain search  
2. Geo / local / ccTLD  
3. Tools (bulk, WHOIS, compare, generator)  
4. Naming / brandable  
5. Investing (deprioritized)

---

## 6. Quarterly SEO skill audit

Every ~90 days on the **production** URL:

1. Technical: robots, sitemap, canonical host, HTTPS, no fake AggregateRating  
2. Index: GSC coverage + sample Learn depth  
3. Content: top 20 landing pages — definition present, internal links, intent match  
4. AEO: `/llms.txt` still accurate; product facts still true  
5. Competitors: SERP snapshot for 5 head queries (domain name search, whois, bulk domain check, geo domain, register domain)  
6. Run `npm run seo:index-health:prod`

Optional skill path (if installed): `~/.grok/skills/seo/` audit flow against production.

### Quarterly checklist (copy/paste)

```
[ ] GSC property verified; sitemap green
[ ] Brand + non-brand query export saved
[ ] Coverage: no unexpected “Crawled - currently not indexed” spike on hubs
[ ] Index-health script: 0 critical failures on core routes
[ ] Top 10 pages have extractable definition / FAQ
[ ] NEXT_PUBLIC_BASE_URL correct in prod (OG/WHOIS share)
[ ] Product facts still accurate (not a registrar, feature list OK)
[ ] No invented reviews/ratings in schema
[ ] Content calendar: next 4 weeks scheduled
[ ] CWV: note mobile LCP/INP on home + geo
```

---

## 7. Deploy checklist (every production ship)

```
[ ] NEXT_PUBLIC_BASE_URL=https://www.domainsdiscovery.com
[ ] Optional: NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION set
[ ] Build passes; smoke / /search /tools/geo /learn /sitemap.xml /robots.txt /llms.txt
[ ] No temporary noindex on marketing pages
[ ] Changelog note if Learn or schema changed
```

---

## 8. Related in-repo assets

| Asset | Path |
|-------|------|
| Product facts / features / definitions | `src/lib/seoSiteFacts.ts` |
| Learn clusters | `src/lib/learnArticles.ts` |
| Expand Learn depth | `scripts/expand-learn-phase-d.mjs` |
| Index health | `scripts/seo-index-health.mjs` |
| Query seeds | `docs/seo/query-tracking.json` |
| Content calendar | `docs/seo/content-calendar.md` |
| Plan (A–F) | session plan / product SEO plan |

---

## Honesty clause

Measurement improves decisions; it does not guarantee #1 rankings. Prefer **falsifiable** metrics (coverage, CTR, useful clicks into tools) over vanity keyword theater.
