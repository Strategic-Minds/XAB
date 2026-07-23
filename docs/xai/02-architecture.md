# Xtreme AI Systems (XAI) System Architecture

## 1. Global Environmental Separation
The XAI architecture is split into two completely isolated environments. There is no sharing of state, databases, or API keys between these environments.

```
+------------------------------------------------------------+
|                PRODUCTION CONTROL PLANE                    |
|  - Repo: Strategic-Minds/XAB (main)                        |
|  - Production Vercel Project & Production Supabase Schema  |
|  - Real Client Data, Live Financials, Active CRM Leads    |
+------------------------------------------------------------+
                             ||
                             ||   [Strict Cryptographic Isolation]
                             \/
+------------------------------------------------------------+
|               ISOLATED AUTONOMOUS SANDBOX                  |
|  - Separate Vercel Project, Sandbox Supabase Schema        |
|  - Non-Production API Keys, Isolated Log Streams           |
|  - Isolated Test Queues, Mock Financials, Simulated Leads   |
+------------------------------------------------------------+
```

## 2. Environment Specifications

### A. Production Control Plane
This environment coordinates all real-world commercial activity, system orchestration, and monetization.
*   **Product Intelligence:** Catalogs and ranks active products.
*   **Opportunity Scoring:** Evaluates real-time demand metrics.
*   **Six-Option Generation:** Formulates detailed pricing and launch proposals.
*   **Webpack Creation:** Translates plans into binding design specs.
*   **Build Orchestration:** Deploys code to Vercel production hosting.
*   **BrowserWorker Validation:** Runs visual audits on production pages.
*   **Repair Loops:** Automatically detects and repairs runtime failures.
*   **Release Approvals:** Final sign-off mechanism for releases.
*   **Revenue & ROI Tracking:** Keeps ledger of real-world monetization.
*   **Cost Monitoring:** Enforces daily dollar budget caps on all AI API calls and browser compute.

### B. Isolated Autonomous Sandbox
This environment acts as an independent execution arena for agent experimentation, generation testing, and continuous optimization.
*   **Rule:** A git branch alone does **NOT** qualify as a sandbox.
*   **Isolation Requirements:**
    *   Must be a separate Vercel Project with its own URL.
    *   Must use completely different Supabase schema (separate tables or separate databases).
    *   Must utilize separate test queues, logging streams, and runtime receipts.
    *   Must use sandboxed, dummy payment gateway keys and separate simulated API credentials.
    *   All data generated inside the sandbox is marked `SANDBOX` and cannot leak to production tables.
