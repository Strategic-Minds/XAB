# XAB 95% AI Ceiling Program

## Authority (locked 2026-07-12)

- **Sole canonical repo:** Strategic-Minds/XAB (GitHub ID: 1297990651)
- **Base44 implementer app:** XAB SYSTEM (new app — TBD)
- **Forbidden targets:** 6a4ae522852a5e08bfa42450, 6a459b058362a6c185417592 (legacy)
- **AUTO_BUILDER repos:** Legacy. Zero authority. Completely excluded.
- **Company:** Strategic Minds AI LLC
- **Domains:** xps-intelligence.com | strategicmindsai.com | autobuilderos.com
- **Vercel project:** xab-system (prj_1jmQQXTLAMNCsJzTSzTsDnsg0hWX)
- **Supabase:** azajysheebfhyzoyplpf

## 95% Release Gate

- Overall weighted score >= 95
- Every category >= 85 (20 categories, CAT-01 to CAT-20)
- Zero unresolved critical findings
- Zero unresolved high findings
- All evidence fresh
- Rollback independently verified
- XAB Sentinel validation token issued
- Jeremy explicitly approves the exact production release

## Protected Actions (require explicit approval phrase)

- `APPROVE MERGE TO MAIN` — merge any branch to main
- `APPROVE PRODUCTION DEPLOY` — promote to production
- `APPROVE SUPABASE MIGRATION` — apply DB migration
- `APPROVE CRON INSTALL` — wire 5-min heartbeat to Vercel
- `APPROVE SENTINEL CREDS` — create Sentinel DB role
- `APPROVE ENV CHANGE` — mutate any environment variable

## 20 Categories

| ID | Category | Weight |
|---|---|---|
| CAT-01 | Governance & approvals | 6% |
| CAT-02 | Source truth & identity | 5% |
| CAT-03 | Architecture & modularity | 5% |
| CAT-04 | Functional correctness | 7% |
| CAT-05 | Reliability & availability | 6% |
| CAT-06 | Recovery & rollback | 5% |
| CAT-07 | Security & threat resistance | 7% |
| CAT-08 | Privacy & data handling | 4% |
| CAT-09 | Data integrity & persistence | 5% |
| CAT-10 | Authentication & authorization | 4% |
| CAT-11 | Observability & auditability | 5% |
| CAT-12 | Performance & latency | 5% |
| CAT-13 | Scalability & concurrency | 4% |
| CAT-14 | Cost efficiency & budgets | 3% |
| CAT-15 | AI quality & evaluation | 6% |
| CAT-16 | Agent orchestration & autonomy | 5% |
| CAT-17 | Memory/RAG & freshness | 4% |
| CAT-18 | Connector & tool safety | 4% |
| CAT-19 | UX, accessibility & visual quality | 5% |
| CAT-20 | Testing, release & maintainability | 5% |

## Install Status

| Step | Action | Status |
|---|---|---|
| 1 | Authority decision | ✅ COMPLETE |
| 2 | Workbook import | ✅ COMPLETE |
| 3 | Source-truth registry | ✅ COMPLETE |
| 4 | Receipt schema | ✅ COMPLETE |
| 5 | Append-only ledger | ✅ COMPLETE |
| 6 | Sentinel agent registry | ✅ COMPLETE |
| 7 | Test catalog | ✅ COMPLETE |
| 8 | Five-minute workflow | ⏳ PENDING APPROVAL |
| 9 | Baseline observation | ✅ RUNNING |
| 10 | Repair loop | ✅ ACTIVE |
| 11 | Morning report | ✅ ACTIVE |
| 12 | Release token service | ⏳ PENDING SENTINEL CREDS |
| 13 | Production gate | 🔒 OPERATOR APPROVAL REQUIRED |
