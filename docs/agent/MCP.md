# AI Domain Assistant MCP Server

First-party **Model Context Protocol** server so AI agents can find, check, and rank domains under a budget.

Server name: **`ai-domain-assistant`** · Power pack: `powers/ai-domain-assistant/`

## Quick connect (Cursor / Claude / Cline)

### HTTP (app running on :5001)

```json
{
  "mcpServers": {
    "ai-domain-assistant": {
      "url": "http://localhost:5001/api/mcp"
    }
  }
}
```

Production:

```json
{
  "mcpServers": {
    "ai-domain-assistant": {
      "url": "https://www.domainsdiscovery.com/api/mcp"
    }
  }
}
```

A ready-made Cursor file lives at `.cursor/mcp.json` in this repo.

### stdio (local process)

```bash
cd "/path/to/Domain DIscovery"
npm run mcp:server
```

```json
{
  "mcpServers": {
    "ai-domain-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/scripts/mcp-domaindiscovery.mjs"],
      "cwd": "/absolute/path/to/Domain DIscovery"
    }
  }
}
```

## Auth (optional)

When `AGENT_API_KEY` is set on the server:

```
Authorization: Bearer <AGENT_API_KEY>
```

or `x-agent-api-key: <AGENT_API_KEY>`.

## JSON-RPC (curl / lightweight agents)

```bash
# List tools
curl -s -X POST http://localhost:5001/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .

# Auto find brand domains
curl -s -X POST http://localhost:5001/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"find_brand_domains",
      "arguments":{
        "text":"AI scheduling SaaS for dental clinics",
        "count":5,
        "style":"brandable",
        "maxBudgetUsd":20
      }
    }
  }' | jq .
```

## Smoke test

```bash
npm run mcp:smoke
npm run agent:prod-smoke
# MCP_BASE=https://www.domainsdiscovery.com AGENT_API_KEY=… npm run agent:prod-smoke
```

Health: `GET /api/agent/health` · Production: `docs/agent/PRODUCTION.md`

## Primary tool

**`find_brand_domains`** — one-shot auto pipeline (generate → check → rank → shortlist).

Other tools: `get_product_facts`, `parse_business_brief`, `generate_domain_names`, `check_domain_availability`, `rank_domains`, `whois_lookup`, `generate_geo_domains`, `compare_tld_prices`.

## Safety

- Research only (no purchase)
- Availability is a snapshot
- Not trademark legal advice
- Not a registrar

## Skills + BYOK (optional layers)

See `powers/ai-domain-assistant/BYOK.md` and `GET /api/agent/skills`.

| Layer | Need keys? | Status |
|-------|------------|--------|
| L0 Instant Domain + brand brain | No | Live |
| L1 BYOK LLM invent | User Anthropic/OpenAI key | Optional |
| L2 Guided purchase links | No | Live |
| L3 Register + DNS | User registrar keys + human confirm | Roadmap (fail-closed) |

## Related

- REST auto: `POST /api/agent/auto`
- Chat API: `POST /api/ada/chat` (Anthropic-powered when configured)
- Skills: `GET /api/agent/skills`
- Agent Card: `GET /ada/.well-known/agent-card.json`
- Manifest: `GET /api/agent/manifest`
- Auto mode notes: `docs/agent/AUTO_MODE.md`
- Power pack: `powers/ai-domain-assistant/POWER.md` + `BYOK.md`
