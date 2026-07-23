# Xtreme AI Systems (XAI) Backend Standards

## 1. Architectural Integrity
The backend layer serves as the logical execution engine for XAI. It must be highly resilient, strictly bounded, and completely stateless.

*   **Queue-Driven Execution:** No user request may perform heavy synchronous execution. All processing, scraping, and code compilation must route through the 25 designated queues.
*   **Idempotency:** Every backend handler must assert an idempotency key before writing database changes. Re-running a completed job must return the original successful payload.
*   **Atomic Job Claiming:** Database transactions must lock a job record atomically (`SELECT FOR UPDATE SKIP LOCKED` or Supabase RPC equivalent) to prevent multiple workers from executing the same job.
*   **Circuit Breakers:** All downstream external APIs (OpenAI, Resend, Vercel APIs) must be protected by circuit breakers. On 5 consecutive timeouts, the breaker trips to prevent credit exhaustion.
*   **Retry Backoff:** Exponential backoff with jitter must be implemented on all external worker network operations.
*   **Dead-Letter Routing:** Broken or unrecoverable jobs must write failure telemetry and self-migrate to the Dead-Letter Queue (DLQ).
*   **Strict Cost Controls:** The backend checks the dollar limit database ledger before spawning any task. If the budget limit is reached, all job creation is locked out.
*   **Structured Logging:** Every log line must compile to JSON format, including: `timestamp`, `log_level`, `trace_id`, `request_id`, `job_id`, `agent_id`, and `message`.
*   **Traceability:** Trace and request IDs must pass through all API gateways, edge functions, database calls, and job queues.
*   **Health Endpoints:** Specialized health check endpoints must query backend dependencies and return direct status grades.
