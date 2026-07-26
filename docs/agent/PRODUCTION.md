# Production checklist — AI Domain Assistant for agents

## Required env (production)

```bash
# Public URLs
NEXT_PUBLIC_BASE_URL=https://www.domainsdiscovery.com
NEXT_PUBLIC_ADA_HOST=www.aidomainassistant.com
NEXT_PUBLIC_ADA_URL=https://www.aidomainassistant.com

# Agent API protection (recommended)
AGENT_API_KEY=<long-random-secret>
AGENT_REQUIRE_AUTH=true

# Feature flags
# domainAgent is on via FEATURE_FLAGS in code; keep MCP available

# Availability (default ON)
# ADA_USE_INSTANT_DOMAIN_MCP=true

# Optional server-side LLM (or use BYOK headers per request)
# ADA_ALLOW_PAID_LLM=true
# ANTHROPIC_API_KEY=sk-ant-...
# ANTHROPIC_MODEL=claude-sonnet-4-5

# L3 registrar mutations — leave OFF until operators are ready
ADA_ENABLE_REGISTRAR_MUTATIONS=false

# Optional CORS allowlist (comma-separated). Empty = reflect origin / *
# CORS_ALLOWED_ORIGINS=https://www.aidomainassistant.com,https://www.domainsdiscovery.com

# Redis for multi-instance rate limits, jobs, concurrency (strongly recommended)
REDIS_URL=redis://...

# Scale knobs (optional — defaults are safe)
# RATE_LIMIT_HEAVY_RPM=20
# ADA_MAX_HEAVY_CONCURRENT=32
# AGENT_API_KEYS=sk_partner:partner:30
```

Full scale guide: [SCALE.md](./SCALE.md)

## Smoke after deploy

```bash
MCP_BASE=https://www.domainsdiscovery.com AGENT_API_KEY=… npm run agent:prod-smoke
```

Expect all PASS. Health: `GET /api/agent/health` → `"ok": true`.

## Agent connect (production)

```json
{
  "mcpServers": {
    "ai-domain-assistant": {
      "url": "https://www.domainsdiscovery.com/api/mcp",
      "headers": {
        "Authorization": "Bearer <AGENT_API_KEY>"
      }
    }
  }
}
```

Optional L1 inventives (user key):

```json
"headers": {
  "Authorization": "Bearer <AGENT_API_KEY>",
  "x-ada-llm-provider": "anthropic",
  "x-ada-llm-api-key": "sk-ant-…"
}
```

## Discovery endpoints

| Path | Purpose |
|------|---------|
| `/.well-known/agent-card.json` | DomainDiscovery card |
| `/ada/.well-known/agent-card.json` | ADA card |
| `/api/agent/health` | Readiness probe |
| `/api/agent/manifest` | Tools + install |
| `/api/agent/skills` | L0–L3 + BYOK |
| `/api/mcp` | MCP HTTP |
| `/llms.txt` | LLM-oriented index |

## Layers in production

| Layer | Prod default |
|-------|----------------|
| L0 research + Instant Domain | **ON** |
| L1 BYOK LLM | Optional per request |
| L2 buy links | **ON** |
| L3 register/DNS | **OFF** until `ADA_ENABLE_REGISTRAR_MUTATIONS=true` + operator runbook |

## Do not ship without

1. `AGENT_API_KEY` (and/or `AGENT_API_KEYS`) set and rotated  
2. `agent:prod-smoke` green against the deploy URL  
3. Rate limits + concurrency understood (`docs/agent/SCALE.md`)  
4. `REDIS_URL` on multi-instance deploys  
5. Registrar mutations still **false** unless spend controls exist at the registrar  

## Rollback

- Disable agent surface: set feature flag / block `/api/mcp` at CDN  
- Open demos only: `AGENT_REQUIRE_AUTH=false` (not recommended for public prod)  
