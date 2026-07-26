# Scale foundation — multi-agent traffic

This document describes how DomainDiscovery / AI Domain Assistant handles high agent volume.

## What ships in code

| Layer | Behavior |
|-------|----------|
| **Auth identity** | Master `AGENT_API_KEY` and/or named `AGENT_API_KEYS` |
| **Per-agent quotas** | Separate light/heavy RPM buckets per `agentId` |
| **IP floor** | Second limit so one NAT/IP cannot exhaust the fleet |
| **Redis rate limits** | Sliding window via Redis when `REDIS_URL` is set |
| **Memory fallback** | Same logic in-process when Redis is down/unset |
| **Concurrency shed** | Cap simultaneous heavy pipelines (`503` + `Retry-After`) |
| **Durable jobs** | Auto shortlist jobs dual-written to Redis + memory |
| **Health** | `GET /api/agent/health` → `scale` object |

## Rate tiers

| Tier | Examples | Defaults |
|------|----------|----------|
| **light** | health, manifest, skills, `tools/list`, `initialize`, job poll | 120/agent/min, 60/IP/min |
| **heavy** | `find_brand_domains`, auto, chat (agent client), register, WHOIS tool | 20/agent/min, 10/IP/min |

Tune with env:

```bash
RATE_LIMIT_LIGHT_RPM=120
RATE_LIMIT_HEAVY_RPM=20
RATE_LIMIT_IP_LIGHT_RPM=60
RATE_LIMIT_IP_HEAVY_RPM=10
ADA_MAX_HEAVY_CONCURRENT=32          # per Node process
ADA_MAX_HEAVY_CONCURRENT_GLOBAL=128  # Redis global (multi-instance)
ADA_JOB_TTL_SECONDS=3600
REDIS_URL=redis://...
```

## Multi-agent keys

```bash
# Master (optional x-ada-agent-id to split buckets)
AGENT_API_KEY=master_secret

# Named partners: key:agentId:heavyRpm[:lightRpm]
AGENT_API_KEYS=sk_acme:acme:40:200,sk_beta:beta:15

# Or JSON
AGENT_API_KEYS_JSON={"sk_acme":{"id":"acme","heavyRpm":40,"lightRpm":200}}
```

Client headers:

```http
Authorization: Bearer sk_acme
# or
x-agent-api-key: sk_acme
x-ada-agent-id: acme-worker-3   # optional with master key
```

Response headers:

- `X-RateLimit-Limit` / `Remaining` / `Reset`
- `X-ADA-Agent-Id`
- `X-ADA-Scale-Tier` (`light` | `heavy`)
- `Retry-After` on 429 / 503

## Async jobs under load

```http
POST /api/agent/auto
{ "text": "…", "maxBudgetUsd": 20, "sync": false }
```

```http
GET /api/agent/jobs/{jobId}
```

Prefer `sync: false` when many agents call simultaneously. Poll until `status` is `completed` or `failed`.

## Capacity model (honest)

| Mode | Guidance |
|------|----------|
| Discovery (cards, health, list tools) | Very high — light tier + CDN |
| Sparse shortlists (many agents, few/hour) | Scale with Redis + multi-instance |
| Concurrent heavy pipelines | Bounded by `ADA_MAX_HEAVY_CONCURRENT*` + Instant Domain upstream |

**100k agents “connected” (mostly idle, occasional tools)** is achievable with:

1. Multi-instance Node behind a load balancer  
2. `REDIS_URL` for shared limits/jobs  
3. Named keys (not one global key for everyone)  
4. Async jobs for shortlists  
5. CDN for website HTML/assets  

**100k concurrent heavy shortlists** is not a single-app target — need worker fleet + queue beyond this foundation.

## Production checklist

1. Set `AGENT_API_KEY` and/or `AGENT_API_KEYS`  
2. `AGENT_REQUIRE_AUTH=true`  
3. Set `REDIS_URL` on every instance  
4. Set concurrency env for your box size  
5. `npm run agent:prod-smoke` against deploy URL  
6. Watch health `scale.concurrency` and 429/503 rates  

## Failure modes

| Condition | Client sees |
|-----------|-------------|
| Agent over quota | `429` + `Retry-After` |
| IP over floor | `429` |
| Heavy slots full | `503` `SERVICE_BUSY` / tool error `SERVICE_BUSY` |
| Redis down | Automatic memory fallback (per-instance limits only) |
| Auth misconfigured in prod | `503` until key is set |
