# Xtreme AI Systems (XAI) Cost Governance Spec

## 1. Budgeting Hierarchy and Hard Limits
To prevent runaway background processes and protect operational budgets, XAI enforces strict budgetary caps across all levels of execution.

| Control Level | Hard Budget Boundary | Remediative System Action |
| :--- | :--- | :--- |
| **Daily Global Budget** | $50.00 USD | Halts all active queues, blocks job spawns, sends alerts. |
| **Monthly Global Budget** | $1,000.00 USD | Places system in lock-down; requires operator override. |
| **Per-Job Budget** | $1.00 USD | Aborts active job, rolls back changes, moves job to DLQ. |
| **Per-Agent Budget** | $5.00 USD per day | Revokes agent execution token, locks queue polling. |
| **Per-Provider Budget** | $500.00 USD monthly | Prevents routing to expensive providers (e.g., GPT-4o). |

## 2. Resource Processing Caps
*   **Token Limits:** Outlined per-job limits are strictly enforced at the AI Gateway.
*   **Browser Sessions:** Maximum execution time of any BrowserWorker session is capped at **2 minutes**.
*   **Retry Allocations:** Jobs are limited to a maximum of 3 retries before being sent to the DLQ.
*   **Concurrency Caps:** Max 5 parallel build compilations and 10 parallel browser sessions.

## 3. Financial Job Ledger Record
Every cost-producing job must log an immutable cost audit record containing:
*   `job_id` and `trace_id`.
*   `estimated_cost` and `actual_cost` (USD).
*   `provider_name` (e.g., OpenAI, Vercel, Scraping API).
*   `tokens_consumed` (Input and Output).
*   `browser_compute_minutes`.
*   `build_compilation_seconds`.
*   `database_storage_usage` (MB).
*   `revenue_attribution` (Projected financial returns).
