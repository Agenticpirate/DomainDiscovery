# AI Domain Assistant — Auto mode & Agent Hub

## Human demo

Open `/assistant` — describe a business, set **Agent budget $**, run **Find domains**.

## Agents

### REST

`POST /api/agent/auto`

```json
{
  "text": "AI scheduling SaaS for dental clinics",
  "maxBudgetUsd": 20,
  "brief": { "count": 10, "style": "brandable" },
  "skipAvailability": false
}
```

### MCP

- HTTP: `POST /api/mcp` (JSON-RPC `tools/list` / `tools/call`)
- stdio: `npm run mcp:server`
- Primary tool: `find_brand_domains` with `maxBudgetUsd`

See [MCP.md](./MCP.md).

## Budget

Results may include `budgetStatus`: `within` | `over` | `unknown`.
Prices are snapshots when available — never invent fees.

## Product split

- **DomainDiscovery** (`/assistant`) = research toolkit + agent hub
- **Dedicated AI Domain Assistant site** (your domain) = chat, skills, memory, later registrar automation

## Safety

No auto-purchase or DNS changes on DomainDiscovery v1.
