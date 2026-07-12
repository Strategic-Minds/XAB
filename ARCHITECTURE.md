# ARCHITECTURE — XAB
> Status: DISCOVERY PHASE. No implementation yet.

## System Purpose
XAB (Xtreme Auto Builder) is a governed universal system factory.
It translates operator intent into coordinated software, agents, workflows, data, and governance.

## Tech Stack (planned)
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Radix UI + Tailwind + Design Tokens |
| Database | Supabase (pgvector + RLS) |
| MCP | Remote gateway — OAuth 2.1, Streamable HTTP |
| Deployment | Vercel |
| Testing | Playwright + Vitest + axe-core |

## MCP Architecture
- Remote MCP gateway hosted on Vercel
- Separate authenticated clients: Base44 + GPT
- OAuth 2.1 with PKCE + protected-resource metadata
- 3 OpenAPI packs: CORE_ORCHESTRATOR, FINANCE_INTELLIGENCE, SCRAPER_INTELLIGENCE (30 ops each)
- 36 MCP tools with scopes, budgets, receipts
- Donor: Strategic-Minds/AUTO_BUILDER-V1 (selective MCP components)

## Source Authority
1. Jeremy's explicit instruction
2. This repository (XAB)
3. Drive workbooks: https://drive.google.com/drive/folders/1M6WQImzn7khdlpwSYIqoe_ngrf2iui5J
4. Base44 app 6a4ae522852a5e08bfa42450
5. Supabase (project TBD)
6. Vercel (project TBD)

## Donor Map
| Component | Donor | Rule |
|---|---|---|
| MCP server implementations | AUTO_BUILDER-V1 | Selective — evaluate each file individually |
| Frontend pages | AUTOBUILDER-V2 | Selective — not blind copy |
| Engine services | AUTO_BUILDER-V1 | Selective |
| Governance patterns | AUTO_BUILDER-V1 | Adapt to XAB |
