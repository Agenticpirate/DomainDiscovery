# Industry research: AI agents, domains, and registrar automation

**Product:** AI Domain Assistant (`aidomainassistant.com`)  
**Related:** DomainDiscovery research fabric  
**Status:** Research brief for public docs (`/ada/docs/industry`, `/ada/docs/registrars`)  
**Disclaimer:** Research-only product. Not a registrar. No auto-purchase in v1.

---

## Executive summary

Two related movements:

1. **Layer A — Agent identity (ANS / DNS-AID):** Discoverable, cryptographically verifiable agent names on DNS + PKI (GoDaddy ANS, Infoblox DNS-AID, IETF drafts).
2. **Layer B — Brand domain automation:** Agents check, register, and configure classic domains via registrar APIs (Cloudflare, Porkbun, Namecheap, Dynadot, OpenSRS, GoDaddy Domains API).

Almost no consumer registrar markets “AI agent registration” as a branded SKU. What matters is **full API coverage** (availability + register + DNS + funds) plus emerging **agent-identity standards** that reuse domains as trust anchors.

**ADA position:** Own Layer B research/budget/rank today; add confirmed register+DNS against 1–2 API registrars next; keep ANS-aligned Agent Card and track Layer A enrollment.

Public pages:

- `/ada/docs/industry`
- `/ada/docs/registrars`

Structured content lives in `src/lib/adaIndustryContent.ts`.

---

## Two layers (do not mix)

| | Layer A — Agent identity | Layer B — Brand domain automation |
|--|--------------------------|-----------------------------------|
| Question | Which AI agent is this, and can I trust it? | Can my agent buy and wire mybrand.com? |
| What is registered | ANS name, Agent Card, certs, discovery DNS | ICANN domain for a human/org brand |
| Key players | GoDaddy ANS, Infoblox DNS-AID, IETF | Cloudflare, Porkbun, Namecheap, Dynadot, OpenSRS, GoDaddy Domains API |
| Protocols | DNS TXT/HTTPS/TLSA, PKI, ACME, transparency logs | EPP (behind API), REST, RDAP, Domain Connect |
| ADA | Agent Card now; ANS enrollment later | Research live; confirm+budget register planned |

**GoDaddy ANS is not “auto-buy domains at GoDaddy.”** It is agent identity registration, analogous to domain registration for websites.

---

## Why this matters now

1. **Phone book + passport** — Multi-agent collaboration fails without discovery and verification.
2. **First real-world commit** — Brand launch still starts with a domain under budget + DNS.
3. **MCP** — Tool-calling models need documented registrar/domain tools, not UI scraping.
4. **Fraud pressure** — Automation without budgets/confirm/audit enables abuse.
5. **Standards convergence** — ANS + DNS-AID + Domain Connect signal infrastructure, not hype.

Industry projections of large agent populations by ~2030 make shared trust infrastructure urgent.

---

## Protocol stack

### Layer B

- EPP (registry; usually via registrar API)
- Registrar REST/XML (create, renew, DNS)
- RDAP/WHOIS (research)
- Domain Connect (app-driven DNS)
- ACME DNS-01 / HTTP-01 (certs)

### Layer A

- Structured ANS names (protocol, agent id, capability, provider, version, domain extension)
- ACME DNS-01 domain ownership
- Hybrid certificates (public TLS + private identity)
- DNS discovery records (`_ans` TXT → Agent Card, HTTPS/SVCB, TLSA, RA badge)
- DNSSEC + transparency / Merkle logs
- MCP / A2A after discovery

---

## Registrar matrix (summary)

Strong automation candidates: **Cloudflare, Porkbun, Namecheap, Dynadot, OpenSRS, GoDaddy Domains API**.

Layer A: **GoDaddy ANS / Agent Registrar** (agent identity, not gTLD create).

Domain Connect DNS Providers (public list signal): Cloudflare, GoDaddy, IONOS, NameSilo, WordPress.com, Vercel, Plesk, Domain Chief, Glauca Digital.

Full matrix: see `src/lib/adaIndustryContent.ts` and `/ada/docs/registrars`.

### Adapter checklist (Phase 3.4)

1. Price + availability  
2. Register against prepaid/authorized payment  
3. Set DNS or nameservers  
4. Idempotent retry  
5. List / renew  

Bonus: sandbox, webhooks, Domain Connect, premium flags.

### Priority for ADA adapters

1. Porkbun or Namecheap  
2. Cloudflare  
3. Dynadot  
4. OpenSRS (reseller)  
5. GoDaddy Domains API (separate from ANS)

---

## GoDaddy ANS (Layer A) — short form

- Problem: discovery, identity, immutability for agents  
- ANSName format (enhanced design): `Protocol://AgentID.Capability.Provider.vX.Y.Z.Extension`  
- RA flow: submit → validate (KYC + DNS-01) → hybrid certs → DNS provision → transparency log  
- Complements MCP/A2A (communication after discovery)  
- Complements Infoblox DNS-AID (discovery metadata via DNS)

ADA: ship Agent Card now; enroll when developer preview is usable.

---

## Automation tiers

| Tier | Status | Behavior |
|------|--------|----------|
| 0 Research | Live | Rank + budget; no purchase |
| 1 Guided purchase | Near | Human pays at registrar / Domain Connect |
| 2 API register + DNS | Roadmap | User keys + confirm + hard budget |
| 3 Agent identity (ANS) | Track | Optional ADA ANS registration |

---

## Risks

- API keys = account power → encrypt, scope, revoke  
- Abuse / phishing farms → rate limits, confirm, gates  
- TLD policy docs → manual path  
- Aftermarket ≠ create  
- Price drift → re-quote  
- ANS evolving → no over-claims  

---

## Sources (public)

- GoDaddy ANS Registry / One System posts  
- Infoblox + GoDaddy DNS-AID / ANS press (May 2026)  
- ansinfo.ai  
- Cloudflare Registrar API docs  
- Porkbun API v3  
- Namecheap API docs  
- Domain Connect DNS Providers  
- GoDaddy Domains API developer portal  

Some ANS console URLs may require login; public blogs describe the architecture.

---

## Positioning

> AI Domain Assistant is the domain layer for agentic brands — research, budget, rank, and (soon) confirmed registration/DNS via registrars that expose full automation APIs — while agent identity standards (ANS) reuse domains as the trust root.
