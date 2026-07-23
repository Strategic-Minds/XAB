# Xtreme AI Systems (XAI) Vercel Workflow Spec

## 1. Single Cron Dispatcher Architecture
To maintain absolute simplicity, prevent runaway background loops, and minimize edge function costs, XAI enforces a single-cron system architecture.

*   **Canonical Endpoint:** `/api/cron/xab-heartbeat`
*   **Frequency:** Exactly once every 5 minutes.
*   **Target Project Name:** `xab-system`
*   **Vercel ID:** `prj_1jmQQXTLAMNCsJzTSzTsDnsg0hWX`

## 2. Inviolable Environment Separation
To guarantee absolute safety, the production and sandbox workloads are deployed to completely separate Vercel projects:
*   **Production Project:** `xab-system` (Processes live jobs and revenue).
*   **Sandbox Project:** `xab-system-sandbox` (Handles synthetic tests and optimization).

### Deployment Rules:
1.  **No Force Pushes:** Direct forced deployments to production are disabled. All production changes must merge through branch protection PRs.
2.  **No Direct Production Changes:** Production environment variables and routing rules are managed strictly in the Control Plane dashboard under double-operator approval.

## 3. Required Environment Variables
Every deployment project must contain these exact environment variables. Missing variables fail the build:
*   `CRON_SECRET`: Cryptographic token validating that heartbeat requests originate from the Vercel cron coordinator.
*   `SUPABASE_URL`: Target database API endpoint.
*   `SUPABASE_SERVICE_ROLE_KEY`: Secret service key for bypassing RLS on system jobs.
*   `BROWSER_WORKER_URL`: Endpoint of the verification engine (`https://browserworker.vercel.app`).
*   `BROWSER_WORKER_SECRET`: Token protecting the BrowserWorker API.
*   `OPENAI_API_KEY`: API credential for the AI gateway.
*   `RESEND_API_KEY`: Credential for notification email deliveries.
