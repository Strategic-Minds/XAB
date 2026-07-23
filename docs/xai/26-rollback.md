# Xtreme AI Systems (XAI) Rollback Playbook

## 1. Quick Rollback Operations
In the event of a post-release smoke test failure or a critical production error, operators and agents must execute the following rollback steps:

*   **Vercel Rollback:** Promotes the previous stable deployment SHA to active routing using the Vercel API or Dashboard. This takes under 5 seconds and instantly restores service.
*   **GitHub Rollback:** Reverts the breaking commit using a standard git revert commit:
    ```bash
    git revert [BREAKING_SHA] --no-edit
    git push origin main
    ```
*   **Database Rollback:** Executes PostgreSQL down migrations to restore the previous database schema state, ensuring that row-level security policies are re-asserted.
*   **Queue Rollback:** Drains active queues, resets all active leases, and routes incomplete tasks to the Failed Job Queue for verification.
*   **BrowserWorker Verification:** Re-runs complete BrowserWorker audits against the restored application state to confirm system safety.

## 2. Secrets Rotation Procedure
If secrets are exposed in logs or source files:
1.  **Revoke:** Immediately invalidate the compromised credential at the provider.
2.  **Rotate:** Generate a fresh, cryptographically strong secret token.
3.  **Deploy:** Update the environment variable in Vercel Key Store and Supabase Vault.
4.  **Redeploy:** Trigger a fresh production rebuild to apply the updated environment variables.
