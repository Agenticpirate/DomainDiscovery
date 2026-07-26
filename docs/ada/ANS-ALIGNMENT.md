# Alignment with GoDaddy Agent Name Service (ANS)

Industry direction (public GoDaddy posts): agents need **discovery**, **identity**, and **trust** at internet scale — built on DNS + certificates + Agent Cards, with MCP/A2A as communication after discovery.

**Related research**

- Full brief: [INDUSTRY-RESEARCH.md](./INDUSTRY-RESEARCH.md)
- Public pages: `/ada/docs/industry`, `/ada/docs/registrars`
- Shared matrix data: `src/lib/adaIndustryContent.ts`

## What we implement now

| ANS concept | Our implementation |
|-------------|-------------------|
| Agent Card metadata | `/.well-known/agent-card.json` (DD + ADA) |
| Capability listing | `capabilities` + `tools[]` in card; MCP `tools/list` |
| MCP protocol | `/api/mcp` + stdio server |
| Budget / safe economy | `maxBudgetUsd`, no auto-purchase |
| Thin integration API | REST `/api/agent/auto` + manifest |
| Human trust | `humanConfirmForPurchase: true` |

## What we defer

- Global ANS name registration with RA transparency logs  
- Automatic DNS record publication (`_ans` TXT, TLSA, etc.)  
- Hybrid identity certificates  
- Domain Connect DNS automation for customers (planned with confirm + budget)

## Contact for GoDaddy ANS preview

GoDaddy has referenced developer preview interest via their ANS blog (`GDANS@godaddy.com`). We do not claim membership until enrolled.
