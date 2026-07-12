# ARCHITECTURE — REALITY OS XAB
> Status: PLANNING PHASE. No code exists yet.

## System Vision
REALITY OS is an intent-to-system compiler. A user describes a business outcome; the system
coordinates software, agents, workflows, data, validation, and governance as one operating environment.

## Tech Stack (planned)
| Layer | Technology | Source |
|---|---|---|
| Framework | Next.js 15 (App Router) | Proven in V1/V2 |
| UI | Radix UI + Tailwind + Design Tokens | Donor: AUTOBUILDER-V2 |
| State | React Query / SWR + Zustand | Standard |
| AI | @ai-sdk/openai | Donor: AUTOBUILDER-V2 |
| Database | Supabase (pgvector + RLS) | Designated project TBD |
| Auth | Supabase Auth with MFA | Standard |
| MCP | Custom OAuth 2.1 remote gateway | New build |
| Deployment | Vercel | Standard |
| Testing | Playwright + Vitest + axe-core | Standard |
| Observability | OpenTelemetry (OTLP) | New build |

## Directory Structure (planned)
```
app/
  (marketing)/
  (dashboard)/
    command-center/
    projects/
    agents/
    build-queue/
    financial/
    intelligence/
    receipts/
    governance/
    system-health/
    settings/
  api/
    v1/
    cron/
    webhooks/
    mcp/
components/
  ui/
  charts/
  adaptive/
  layouts/
lib/
  tokens/
  validation/
  auth/
  memory/
supabase/
  migrations/
  seeds/
scripts/
  validate-*.mjs
docs/
  architecture/
  receipts/
  audit/
.github/
  workflows/
    ci.yml
```

## Donor Repository Map
| Component | Donor | Notes |
|---|---|---|
| Frontend pages (30+) | AUTOBUILDER-V2 | Evaluate each individually, not blind copy |
| MCP server patterns | AUTO_BUILDER-V1 | Selective, validate OAuth 2.1 compliance |
| Governance/approval matrix | AUTO_BUILDER-V1 | Adapt to XAB |
| Validation scripts | AUTO_BUILDER-V1 | Port and expand |
| Engine services (8) | AUTO_BUILDER-V1 | Port to XAB structure |
| AI SDK integration | AUTOBUILDER-V2 | Direct use |

## See Also
- `GOVERNANCE.md` — protected actions and approval matrix
- `docs/REALITY_OS_XAB_PLANNING_HANDOFF.md` — full phase plan, risk register, ceiling matrix
- Drive: `01_Architecture/` — architecture decision records
