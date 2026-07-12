# XAB System Architecture

## Company
Strategic Minds AI LLC — AI Consulting + AI Systems Builder
Domain: xps-intelligence.com

## Stack
- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui, AUTOBUILDER-2.0 layout
- **Backend**: Supabase (azajysheebfhyzoyplpf) — 77 tables, pgvector RAG
- **AI**: Vercel AI Gateway — 100+ models, one key, zero markup
- **Deploy**: Vercel (xab-system project)
- **Repo**: Strategic-Minds/XAB (sole canonical repo)

## MCP Gateway
- 37 tools across 11 namespaces
- Protected tools require operator approval phrase
- Endpoint: /api/mcp

## Agents
- 28 registered agents (6 certified, 22 registered)
- Kill switches: KS-001 to KS-004
- Overnight build loop: every 3 hours, $50/night cap

## RAG Pipeline
- 26 chunks embedded (text-embedding-3-small, 1536d)
- match_chunks() semantic search function live