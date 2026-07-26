# AI Domain Assistant — external resources evaluation

**Date:** 2026-07-22  
**Goal:** Validate whether to implement third-party stacks before adopting them.  
**Verdict summary:** **Do not replace** our Next.js + SpaceXAI + MCP + ranking core. **Borrow ideas** selectively.

---

## 1. Evaluation matrix (the three repos you shared)

| Repo | What it is | Fit for ADA | Adopt? |
|------|------------|-------------|--------|
| [NirDiamant/GenAI_Agents](https://github.com/NirDiamant/GenAI_Agents) | 50+ **tutorials** (LangChain/LangGraph notebooks): conversational agents, multi-agent, MCP tutorial, memory, tool loops | **High as learning**, not as a dependency | **Yes — study** · **No — vendor-in** |
| [RasaHQ/rasa](https://github.com/RasaHQ/rasa) | Classic **Python** NLU + dialogue (intents, stories). OSS now in **maintenance mode**; future is Hello Rasa / CALM | **Low** for our LLM tool-calling product | **No** |
| [keinsaasforever/better-chatbot](https://github.com/keinsaasforever/better-chatbot) (Navigator) | Full **Next.js** AI workspace: multi-LLM, MCP client, workflows, voice, auth, Postgres | **Medium** — UX patterns & MCP client ideas | **Borrow UI/MCP patterns** · **No full fork** |

---

## 2. Detailed verdicts

### 2.1 GenAI_Agents (Nir Diamant) — **use as curriculum, not as product code**

**Pros**

- Excellent patterns for: tool-using agents, multi-step graphs, memory, MCP intro, multi-agent routing  
- Related repos worth bookmarking:
  - [Agents Towards Production](https://github.com/NirDiamant/agents-towards-production) — production playbook  
  - [RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques) — if we add brand/domain knowledge RAG later  
  - [Agent_Memory_Techniques](https://github.com/NirDiamant/Agent_Memory_Techniques) — session memory beyond in-request intake  

**Cons for ADA**

- Jupyter/LangGraph demos ≠ production Next.js monorepo  
- Would duplicate what we already built: intake, tools, ranker, MCP server, Agent Card  
- LangGraph as a hard dependency adds Python/notebook ops we don’t need  

**What to take from it (without implementing the repo)**

| Tutorial theme | Map to ADA |
|----------------|------------|
| Simple conversational agent | Already: `/ada/chat` + rules/SpaceXAI |
| Customer support / slot filling | Already: intake (TLDs, include, avoid, strategies) |
| Multi-agent collaboration | Future: split “namer” vs “availability checker” vs “policy” agents **inside** our TS pipeline |
| MCP tutorial | Already: `/api/mcp` + docs |
| Memory-enhanced agent | Next: persist chat sessions (DB), not notebook memory |
| Controllable RAG | Future: RAG over vertical naming + registrar docs |

**Decision:** Reference only. Do **not** npm/pip install or merge notebooks into DomainDiscovery.

---

### 2.2 Rasa — **do not implement**

**Pros**

- Mature slot-filling / forms mental model (great for “ask TLD, ask avoid list…”)  
- Channel connectors (Slack, etc.) if we ever need enterprise messaging  

**Cons**

- Open Source Rasa is in **maintenance mode**; new direction is Hello Rasa / CALM  
- Python stack parallel to Next.js = two runtimes, two deploys  
- Intent/NLU training is the **old** paradigm; we use **LLM + structured intake + deterministic ranker**  
- Our domain value is **ranking + availability + strategies**, not classic chatbot intents  

**Decision:** **Do not integrate.** Our intake steps already encode Rasa-like slots without the platform cost. If we ever need CALM-style flow definitions, re-evaluate Hello Rasa as a separate service — not now.

---

### 2.3 better-chatbot / Keinsaas Navigator — **borrow patterns, do not replace ADA**

**Pros**

- Next.js + AI SDK + **MCP client** (we are an MCP **server**; their client UX is a reference)  
- Tool choice modes (auto / manual / none) — good for “rank only when ready”  
- Streaming chat UX, @mentions for tools, multi-provider including **xAI**  
- Auth, session storage, workflows — if ADA becomes a multi-tenant product  

**Cons**

- Full product (Postgres, Better Auth, multi-tool workspace) is a **different app**  
- Forking would bury our domain ranker, registrar research, and AEO site under generic chat  
- License OK (MIT) but merge cost is months, not days  

**Decision:**

| Borrow | Skip |
|--------|------|
| Streaming responses (AI SDK style) | Entire app fork |
| Tool-choice: auto vs confirm before rank | Visual workflow builder (v1) |
| MCP server catalog UX for docs | Voice realtime (later) |
| xAI provider wiring patterns | Multi-tenant agent marketplace |

---

## 3. What we already have (so we don’t rebuild)

| Capability | Status in ADA / DomainDiscovery |
|------------|----------------------------------|
| Chat UI + API | `/ada/chat`, `POST /api/ada/chat` |
| Guided intake (TLD, include, avoid, strategies, budget) | `intakeSession` + ranker |
| Deterministic ranking + vertical knowledge | `ranker`, `brandNamingKnowledge`, `domainStrategies` |
| SpaceXAI (Grok) tool calling | `spacexai.ts` when `XAI_API_KEY` set |
| MCP + REST for external agents | `/api/mcp`, `/api/agent/auto` |
| Agent Card / ANS alignment | `/.well-known/agent-card.json` |
| SEO/AEO product surface | DomainDiscovery toolkit + ADA product host |

**Gap vs “excellent” (priority order)**

1. Streaming chat tokens (UX)  
2. Persisted sessions + memory (Postgres/KV)  
3. Eval harness for shortlist quality (gym briefs → on-category rate)  
4. Optional RAG on naming/registrar docs  
5. Multi-agent internal split (generate vs check vs policy) — only if ranker plateaus  

---

## 4. Curated resource list to make ADA excellent

### 4.1 Agent / chat architecture (study)

| Resource | Why |
|----------|-----|
| [GenAI_Agents](https://github.com/NirDiamant/GenAI_Agents) | Patterns catalog |
| [agents-towards-production](https://github.com/NirDiamant/agents-towards-production) | Production concerns |
| [MCP spec](https://modelcontextprotocol.io) | Agent interoperability (we already serve MCP) |
| [Vercel AI SDK](https://sdk.vercel.ai) | Streaming + tool UI (align with better-chatbot style without forking) |
| [LangGraph docs](https://langchain-ai.github.io/langgraph/) | Optional later if we need complex graphs |
| [PydanticAI](https://ai.pydantic.dev/) | Structured tool schemas inspiration |

### 4.2 Domain / identity industry

| Resource | Why |
|----------|-----|
| GoDaddy ANS blogs + Agent Registrar | Layer A agent identity |
| Infoblox DNS-AID | Discovery companion to ANS |
| [ansinfo.ai](https://ansinfo.ai) | Open ANS narrative |
| Cloudflare Registrar API | Layer B automation candidate |
| Porkbun / Namecheap / Dynadot API docs | Adapter shortlist |
| Domain Connect | DNS setup standard |
| ICANN RDAP | Research correctness |

### 4.3 Naming quality (our moat)

| Resource | Why |
|----------|-----|
| Brand naming corpora (fitness, SaaS examples) | Vertical lexicons (already started) |
| Marketplace *structure* (Atom, Afternic listings) | Pattern inspiration — not scrape-to-train illegally |
| Radio test / brandability rules | `domainStrategies.radio_test` |

### 4.4 Safety / product

| Resource | Why |
|----------|-----|
| OWASP LLM / GenAI guidance | Prompt injection, tool abuse |
| Budget + human-confirm constraints | Already product policy |
| Rate limits + AGENT_API_KEY | Agent surface security |

---

## 5. Recommended path (do this next)

### Phase A — keep core (now)

Continue shipping on:

- Next.js ADA product  
- Hybrid ranker + intake  
- SpaceXAI optional NLU  
- MCP/REST for agents  

### Phase B — excellence upgrades (IMPLEMENTED 2026-07-22)

1. **Stream** chat replies — native SSE (`?stream=1` / `stream: true`) · `chatStream.ts`  
2. **Persist** intake + chat history — server `sessionStore` + browser `localStorage`  
3. **Eval suite** — `npm run ada:eval` / `ada:eval:offline` · `scripts/ada-eval-shortlist.mjs`  
4. **Docs** — this file + CHAT-AND-AGENTS.md  

Validated: better-chatbot-style streaming without forking; GenAI_Agents patterns as study only; Rasa skipped.

### Phase C — only if needed

- LangGraph-style multi-node pipeline **ported to TypeScript** (not Python notebooks)  
- RAG over `docs/ada` + learn articles for “how to pick a domain” answers  
- Hello Rasa / CALM **only** if enterprise wants pure dialog-policy export  

### Explicit non-goals

- Do not add Rasa as a dependency  
- Do not replace ADA with better-chatbot fork  
- Do not copy GenAI_Agents notebooks into production tree  

---

## 6. Bottom line

| Question | Answer |
|----------|--------|
| Should we implement GenAI_Agents into the app? | **No** — use as study material |
| Should we implement Rasa? | **No** — wrong stack + maintenance mode |
| Should we implement better-chatbot? | **No full product** — steal UX/MCP-client ideas |
| Best way to make ADA excellent? | Deepen **domain ranker + intake + agent APIs + eval**, polish chat UX, optional memory/stream |

Our product moat is **domain research quality + agent-safe automation constraints**, not a generic multi-LLM workspace.
