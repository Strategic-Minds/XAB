# 28. Release Checklist — XAI Titanium Standard

**Version:** 1.0.0  
**Date:** 2026-07-23  
**Authority:** docs/xai/01-authority-map.md

---

## Pre-Release Requirements

No production release may occur until ALL of the following pass:

### Code Quality
- [ ] TypeScript compiles with zero errors (`npx tsc --noEmit`)
- [ ] ESLint passes with zero warnings (`npx next lint --max-warnings 0`)
- [ ] Zero `@ts-expect-error` directives in source (`grep -r @ts-expect-error src/`)
- [ ] No hardcoded secrets in repository history

### Build
- [ ] `npm run build` exits 0
- [ ] Build artifact uploaded and verified
- [ ] All required environment variables confirmed set in Vercel
- [ ] `next.config.mjs` has `ignoreBuildErrors: false` and `ignoreDuringBuilds: false`

### Security
- [ ] `npm audit --audit-level=high` returns zero high/critical CVEs
- [ ] CodeQL analysis passed
- [ ] Dependency review passed
- [ ] CODEOWNERS review obtained
- [ ] No secrets in Git history (`git log -S 'sk-' --all`)

### Design / Visual
- [ ] Approved webpack on file with checksum
- [ ] Desktop screenshot captured
- [ ] Tablet screenshot captured
- [ ] Mobile screenshot captured
- [ ] Side-by-side parity comparison completed
- [ ] Overall parity score >= 99%
- [ ] PWA branded install button present and functional
- [ ] Home-screen icon correct

### BrowserWorker Validation
- [ ] BrowserWorker health: `GET /api/health` → `ok: true`
- [ ] Pass 1: desktop viewport — 100% success
- [ ] Pass 2: tablet viewport — 100% success
- [ ] Pass 3: mobile viewport — 100% success
- [ ] Zero console errors across all 3 passes
- [ ] Zero network errors across all 3 passes
- [ ] All 3 receipts stored with unique job IDs
- [ ] Screenshots attached to release packet

### Three-Pass Operational Testing
- [ ] Operational Test 1: 100% — all routes, forms, CTAs, APIs
- [ ] Operational Test 2: 100% — fresh session, fresh job ID
- [ ] Operational Test 3: 100% — fresh session, fresh job ID
- [ ] PWA install flow tested on all 3 passes
- [ ] Offline fallback verified

### Data / Queue
- [ ] Supabase RLS verified on all affected tables
- [ ] Queue tables functional (`xai_job_queue`, `xai_receipt_log`)
- [ ] Stale job recovery confirmed working
- [ ] Dead-letter routing confirmed working
- [ ] All receipts logged to `xai_receipt_log`

### Approvals
- [ ] Release-manager sign-off
- [ ] Explicit operator approval (Jeremy Bensen)
- [ ] Cost review completed
- [ ] ROI review completed
- [ ] Rollback procedure documented

---

## Post-Release Smoke Test

After deploying to production, run immediately:

1. `GET /api/health` → status must be `healthy` or `degraded` (not `unhealthy`)
2. `GET /api/cron/xab-heartbeat` (with Bearer CRON_SECRET) → `success: true`
3. `GET /api/queues` → returns queue summary
4. Navigate all primary routes — zero 500 errors
5. Submit at least one test form — confirm Supabase record created
6. Confirm BrowserWorker can reach the production URL

**If smoke test fails:**
1. Trigger automatic rollback via Vercel dashboard
2. Preserve all evidence (logs, screenshots, receipts)
3. Create incident record in `xai_incident_log`
4. Block further releases until incident is resolved
5. Return job to repair queue

---

## Rollback Procedure

1. Vercel: Instant rollback to previous deployment via dashboard or `vercel rollback`
2. GitHub: `git revert <SHA>` — do NOT force push
3. Supabase: Run down migration if schema changed
4. Verify: Run full smoke test on rolled-back deployment
5. Receipt: Log rollback to `xai_receipt_log` with incident reference
