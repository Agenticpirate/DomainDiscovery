# AI Domain Assistant — Chat bot + how agents interact

## Product surfaces

| Surface | Who | Path |
|---------|-----|------|
| Chat UI | Humans | `/ada/chat` (host: `aidomainassistant.com/chat`) |
| Chat API | Humans + agents | `POST /api/ada/chat` |
| Structured app | Humans | `/ada/app` |
| REST auto | Agents | `POST /api/agent/auto` |
| MCP | Agents | `/api/mcp` (+ stdio `npm run mcp:server`) |
| Agent Card | Discovery | `/.well-known/agent-card.json` |

## Honest “training” model

We do **not** claim a secret multi-billion-parameter fine-tune on private aftermarket sales in v1.

Quality comes from a **hybrid stack**:

1. **Vertical brand knowledge** (`src/lib/agent/brandNamingKnowledge.ts`)  
   Lexicons + compound patterns for fitness, saas, food, health, etc. (inspired by real brand structures and marketplace *patterns*, not raw scraped sales dumps).
2. **Deterministic ranker** (`src/lib/agent/ranker.ts`)  
   Industry fit, length, TLD, keyword fit, **available-first**, premium demotion.
3. **Live availability** (research snapshot).
4. **SpaceXAI (Grok)** when `XAI_API_KEY` is set  
   Understands natural language and calls tools (`find_brand_domains`). Without the key, chat still works via the rules engine + same ranking pipeline.

This is more reliable for domain shortlists than free-form LLM name invention alone.

## Guided intake (humans + agents)

Multi-turn discovery before ranking:

1. **Business** description  
2. **Preferred extensions** (TLDs)  
3. **Keywords to include**  
4. **Keywords to avoid**  
5. **Naming strategies** (multi-select):
   - `available_first` — open registration over aftermarket  
   - `radio_test` — easy to say/spell over the phone  
   - `brandable` / `keyword_exact` / `short` / `easy_spell`  
   - `no_hyphen` / `no_numbers`  
   - `geo_local` / `com_priority` / `premium_ok`  
6. **Budget** → rank  

Client persists `intake` object from each response and sends it back on the next turn. Reply **rank** when step is `ready`.

Agents with a full brief may set `"skipIntake": true` and pass fields on `find_brand_domains` / `brief`.

## Chat API contract

### JSON (default)

```http
POST /api/ada/chat
Content-Type: application/json
Authorization: Bearer <AGENT_API_KEY>   # optional unless client=agent and key is configured

{
  "messages": [
    { "role": "user", "content": "Premium domain for a gym under $20" }
  ],
  "maxBudgetUsd": 20,
  "client": "web" | "agent" | "mcp",
  "sessionId": "ada_…",
  "intake": null,
  "skipIntake": false,
  "skipAvailability": false,
  "stream": false
}
```

### Streaming (SSE) — recommended for UI

```http
POST /api/ada/chat?stream=1
Accept: text/event-stream
Content-Type: application/json

{ "messages": [...], "stream": true, "sessionId": "ada_…" }
```

Events:

| Event | Payload |
|-------|---------|
| `status` | `{ phase, detail }` — received / thinking / intake / ranked |
| `token` | `{ text }` — progressive assistant text |
| `result` | full `ChatResponse` |
| `error` | `{ message }` |
| `done` | `{ ok: true }` |

### Session

- Server: in-memory map (`sessionStore`) — 24h TTL, max 500 sessions  
- Client: `localStorage` key `ada_chat_session_v1`  
- `GET /api/ada/chat?sessionId=…` — session meta (no full transcript dump)

Response includes:

- `message` — assistant text  
- `sessionId` — persist and send on next turn  
- `engine` — `spacexai` | `rules` | `hybrid`  
- `intake` — updated discovery state  
- `awaitingIntake` — true while collecting prefs  
- `domains.shortlist` — ranked domains with scores/reasons  
- `actions` — tools invoked  

### Quality eval (verify ranking)

```bash
npm run ada:eval           # live availability
npm run ada:eval:offline   # rank-only, no live checks
```

Cases: gym, yoga, saas — industry hit-rate + ban random tech glue + available-first.

## How other AI agents should connect

### Preferred: MCP tool

1. Discover card: `GET /.well-known/agent-card.json`
2. Connect MCP HTTP: `/api/mcp`
3. Call `find_brand_domains` with `text` + `maxBudgetUsd`
4. Present shortlist; human confirms any purchase

### REST one-shot

```bash
curl -s -X POST "$BASE/api/agent/auto" \
  -H "Content-Type: application/json" \
  -d '{"text":"fitness gym for busy professionals","maxBudgetUsd":20}'
```

### Conversational agent

```bash
curl -s -X POST "$BASE/api/ada/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -d '{"client":"agent","messages":[{"role":"user","content":"Name ideas for a yoga studio under 25 dollars"}],"maxBudgetUsd":25}'
```

## Constraints (always)

- Research only — **not a registrar**  
- No auto-DNS / auto-purchase in v1  
- Re-check availability at checkout  
- Not trademark legal advice  

## Env — no paid keys required

```bash
# Availability: Instant Domain Search MCP (same as main site) — default ON
# ADA_USE_INSTANT_DOMAIN_MCP=true

# Optional: force RDAP-only if Instant Domain MCP is down
# ADA_USE_INSTANT_DOMAIN_MCP=false

# Optional paid Grok (not required):
# ADA_ALLOW_PAID_LLM=true
# XAI_API_KEY=...

# Optional agent auth:
# AGENT_API_KEY=...
```

**Stack cost**

| Piece | Source |
|-------|--------|
| Chat intake + strategies | Local rules engine |
| Name generation | Vertical lexicons (+ optional Instant Domain variations) |
| Ranking | Deterministic ranker |
| Availability | **Instant Domain Search MCP** (same free path as DomainDiscovery search/bulk) |
| Fallback if MCP empty | Free public RDAP |
| Your agent MCP/REST | Self-hosted |

No OpenAI/xAI/Domainr keys required. User pays a registrar only when they purchase a domain.
