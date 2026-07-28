# SEO-100 daily publish automation

## Goal

**At least 2 long-form SEO articles go live every day** until all 100 are public  
(**2026-07-27 → 2026-09-14**, 50 days × 2).

You do **not** manually publish, and you do **not** need a new git commit each day.

## How publishing works (best option)

```
content/seo-articles/*.md
        ↓ import once
src/data/learn-articles.json  (each has publishedAt: YYYY-MM-DD)
        ↓ deployed once on main
Live site date-gate: show if publishedAt ≤ today (UTC)
        ↓
GitHub Action daily @ 05:15 UTC revalidates + verifies URLs
```

1. **Date gate** — `src/lib/learnArticles.ts` only exposes articles with `publishedAt <= today`.
2. **Force-dynamic Learn pages** — `/learn` and `/learn/[slug]` always use the current clock (no stale ISR).
3. **GitHub Action** — `.github/workflows/seo-daily-publish.yml` runs every day to:
   - assert ≥2 articles per scheduled day
   - call `/api/cron/seo-publish` (cache bust)
   - HTTP-check today’s article URLs on production

## What is already in git

| Item | Location |
|------|----------|
| 100 source articles | `content/seo-articles/` |
| Scheduled catalog | `src/data/learn-articles.json` |
| Day-by-day plan | `docs/seo/seo-100-drip-calendar.md` |
| Daily workflow | `.github/workflows/seo-daily-publish.yml` |
| Cron API | `src/app/api/cron/seo-publish` |

## Optional secrets (recommended for monitoring)

In **GitHub → repo Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `SEO_CRON_SECRET` | Same value as Vercel env `SEO_CRON_SECRET` — unlocks revalidate API |
| `PRODUCTION_BASE_URL` | Default `https://www.domainsdiscovery.com` |
| `VERCEL_DEPLOY_HOOK` | Optional forced redeploy if you ever want one |

In **Vercel → Project → Settings → Environment Variables**:

| Variable | Purpose |
|----------|---------|
| `SEO_CRON_SECRET` | Protects `/api/cron/seo-publish` in production |

Without secrets, **articles still unlock by date**. Secrets only improve cache bust + CI verification.

## Manual commands

```bash
npm run learn:schedule-seo:status    # what’s live / due today
npm run learn:schedule-seo:assert    # CI check ≥2/day
npm run learn:schedule-seo:verify    # HTTP check production
npm run learn:schedule-seo           # re-apply 2/day from 2026-07-27
```

## Manual workflow run

GitHub → **Actions** → **SEO daily publish** → **Run workflow**.

## After the 100 are live

The workflow still runs but treats the batch as **exhausted** (all live). You can disable the schedule later if you want.
