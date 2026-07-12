# GOVERNANCE — XAB
## Level 5 Autonomous Orchestrator Rules

### Protected Action Approval Phrases

| Phrase | Action Unlocked |
|---|---|
| `APPROVE XAB SCAFFOLD` | Push initial Next.js app scaffold to XAB main |
| `APPROVE XAB SUPABASE MIGRATION` | Apply DB migration to production Supabase |
| `APPROVE BASE44 PACK UPLOAD` | Upload OpenAPI packs to Base44 integrations |
| `APPROVE VERCEL XAB PROJECT` | Create Vercel project linked to XAB repo |
| `APPROVE XAB ENV CONFIGURATION` | Set secrets/env vars in Vercel |
| `APPROVE FINANCIAL DATA PROVIDER: [name]` | Select + begin data provider contract |
| `APPROVE EMBEDDING PROVIDER: [name]` | Select embedding model |
| `APPROVE XAB PREVIEW DEPLOY` | Deploy to Vercel preview URL |
| `APPROVE MERGE TO MAIN` | Production deploy |

### Default Mode
- `dry_run` — no production mutations without approval
- `branch_only` — all code changes via branch + PR
- `receipt_required` — every completed action logged
- `rollback_required` — every destructive action has a rollback plan

### Never Without Approval
- Production deploy | PR merge to main | Default-branch writes
- Production DB migration | Secret or env var changes
- Domain / DNS changes | Paid resources | Payments
- Customer-facing messages | Destructive deletes

### Release Scoring
- Preview minimum: **95/100**
- Security, auth, tenant isolation, rollback: **must individually score 100**
- No average may conceal a failed category
