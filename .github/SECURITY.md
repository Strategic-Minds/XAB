# Security Policy — XAB System

## Supported Versions
| Version | Supported |
|---------|----------|
| main | ✅ Current |
| All others | ❌ Not supported |

## Reporting a Vulnerability
Do NOT open a public GitHub issue for security vulnerabilities.

Contact: security@strategicmindsai.com

Expected response time: 48 hours.

## Security Standards
- Zero hardcoded secrets (all via process.env)
- All API routes with auth: Bearer token validation
- TypeScript strict mode enabled
- npm audit runs on every push to main
- CodeQL static analysis on every push to main
- Dependency review on all PRs
- RLS enabled on all Supabase tables
- Rate limiting on all public API routes

## Dependency Policy
- Zero tolerance for critical/high CVEs on main branch
- Weekly automated security scan
- Dependency review blocks PRs with new high+ CVEs
