# Xtreme AI Systems (XAI) Security Spec

## 1. Secrets Management and Redaction
*   **Secure Storage:** All environmental tokens and API keys are stored in the Vercel Key Store or Supabase Vault. No secret is ever committed to source code or written to git tracking.
*   **Log Redaction:** All logging engines run a streaming regex filter to sanitize credentials. Any string matching common key patterns (e.g., GitHub tokens, Resend keys, Supabase role keys) is automatically replaced with `[REDACTED]`.

## 2. Access Control and Branch Protection
*   **Least-Privilege Principle:** Agents are granted narrow database roles and restricted API tokens scoped only to the specific resources they manage.
*   **Branch Protection:** Direct commits to the `main` branch are blocked. All code updates must flow through Pull Requests.
*   **Mandatory Review:** Every PR requires code review and passing test checks.
*   **CODEOWNERS Enforcement:** Critical architecture directories (e.g., `docs/xai/`, `api/cron/`) require direct approval from designated tech lead operators.

## 3. Supply Chain and Code Scanning
*   **CodeQL:** Automated static analysis (SAST) executes on every commit to flag memory leaks, injection vulnerabilities, and bad patterns.
*   **Dependency Scanning:** Weekly scans search for vulnerable npm or pip packages.
*   **Block Vulnerabilities:** Deployments are blocked if dependencies contain unresolved CVSS scores $> 7.0$.
*   **Lockfile Verification:** Checksums of `package-lock.json` are verified before every compilation.

## 4. Network and Input Security
*   **Rate Limiting:** Public endpoints enforce strict IP-based rate limits.
*   **Input Validation:** Strict type checks and sanitizer masks are applied to all API payloads.
*   **XSS & CSRF Protections:** Secure HTTP cookies, anti-CSRF headers, and strict React component rendering.
*   **SQL Injection Prevention:** 100% of database interactions must utilize parameterized PostgreSQL queries or the Supabase JS client. Raw string concatenation is strictly forbidden.
*   **Content Security Policy (CSP):** Headers restrict resource loading only to trusted endpoints (e.g., Vercel, Supabase, BrowserWorker).

## 5. Row-Level Security (RLS) & Backup Verification
*   **RLS Policies:** Explicit select, insert, update, and delete policies are defined per role.
*   **Backup Schedule:** Automated database backups run every 24 hours. Backups are verified weekly by spinning up temporary sandbox databases to confirm data integrity.

## 6. Security Release Gate Rule
Security passes **ONLY** when scans run and pass, blocking rules are fully enforced, failure tests prove controls work, and secrets are confirmed absent from the commit history.
