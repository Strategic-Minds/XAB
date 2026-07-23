# XAB Titanium Hardening Manifest

**Version:** 2.0.0  
**Hardened:** 2026-07-23  
**Governance:** Level 5 — Enterprise Completion Commander

## Pipeline Gates (ALL MANDATORY)

| Gate | Description | Tolerance |
|------|-------------|----------|
| BROWSERWORKER_3PASS | 3 consecutive successful BrowserWorker runs | Zero — all 3 must pass |
| SITE_REACHABLE | Preview URL returns HTTP 200 | Zero — must be reachable |
| NO_CONSOLE_ERRORS | Zero critical console errors in BW runs | Zero critical errors |
| TYPESCRIPT | Zero TypeScript errors (ignoreBuildErrors: false) | Zero errors |
| ESLINT | Zero ESLint errors (ignoreDuringBuilds: false) | Zero errors |
| SECURITY_AUDIT | Zero high/critical CVEs | Zero high/critical |
| CI_RELEASE_GATE | All GitHub Actions jobs pass on main | All must pass |

## BrowserWorker Validation Requirements

Every website build MUST produce:
- [x] Desktop screenshot (1280x800)
- [x] Tablet screenshot (768x1024)  
- [x] Mobile screenshot (390x844)
- [x] Visible text extraction
- [x] Link extraction
- [x] Console error log
- [x] Network error log
- [x] 3 consecutive PASS results

**PWA Requirements:**
- [x] Branded PWA manifest with correct icons
- [x] Service worker registered
- [x] Mobile home screen button installable
- [x] Desktop PWA install button in bottom-right corner
- [x] `@ducanh2912/next-pwa` (already in package.json) configured

## Security Hardening

- **Middleware:** All `/api/cron/*` routes require Bearer CRON_SECRET
- **Middleware:** All `/api/swarm/*` routes require x-internal-secret header
- **Middleware:** Security headers applied to all API responses
- **next.config:** TypeScript build errors are fatal (ignoreBuildErrors: false)
- **next.config:** ESLint errors are fatal (ignoreDuringBuilds: false)
- **next.config:** Image remotePatterns locked to known domains
- **next.config:** Server actions allowedOrigins locked to known domains
- **GitHub Actions:** CI runs on every push to main and PRs
- **GitHub Actions:** Release gate requires ALL checks to pass

## Canonical Services

| Service | URL | Status |
|---------|-----|--------|
| BrowserWorker | https://browserworker.vercel.app | CANONICAL |
| XAB System | https://xab-system.vercel.app | PRODUCTION |
| Supabase | azajysheebfhyzoyplpf.supabase.co | PRODUCTION |

## Kill Switches

| ID | Trigger | Action |
|----|---------|--------|
| KS-001 | Score < 50 | Pause all autonomous operations |
| KS-002 | BrowserWorker fails 3 consecutive heartbeats | Alert + fallback mode |
| KS-003 | Supabase unreachable | Pause writes, alert |
| KS-004 | Unauthorized production deploy detected | Immediate rollback |

## Promotion Checklist

Before ANY production deployment:
- [ ] All CI gates green
- [ ] BrowserWorker 3-pass validation PASS
- [ ] Score >= 95
- [ ] Zero CVEs (high/critical)
- [ ] Operator explicit approval
- [ ] NEVER auto-merge to main
- [ ] NEVER auto-deploy production
