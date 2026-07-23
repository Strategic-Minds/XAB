# Xtreme AI Systems (XAI) Observability Spec

## 1. Unified Logging and Tracing
XAI leverages a structured observability framework to monitor system operations and ensure rapid debugging of autonomous actions.

*   **Correlation Tracking:** Every transaction must assign a unique `trace_id` at inception. This trace ID passes through all queues, API calls, backend workers, database rows, and UI analytics, enabling end-to-end tracing.
*   **JSON Logging Standard:** All logs must compile as JSON with standard metadata attributes:
    ```json
    {
      "timestamp": "2026-07-23T17:38:00.000Z",
      "log_level": "INFO | WARN | ERROR | FATAL",
      "trace_id": "UUID",
      "job_id": "UUID",
      "agent_id": "QA_Sentinel",
      "message": "Step 3 of operational test completed successfully."
    }
    ```

## 2. System Telemetry and Metrics
*   **Queue Metrics:** Real-time tracking of active, pending, failed, and dead-letter counts.
*   **BrowserWorker Metrics:** Execution speeds, screenshot failures, and API status history.
*   **Build and Deployment Metrics:** Compile time, asset size, and deployment failure percentages.
*   **Financial Metrics:** Accurate USD ledgers tracking cost per scrape and cost per code compilation.

## 3. Automated Health Checks
Every 5 minutes, the system triggers the health endpoints to monitor the following subsystems:
*   **Database Status:** Verifies write speeds and active transaction pools.
*   **Queue Status:** Reports queue latency and backlog volume.
*   **BrowserWorker Status:** Pings the browser engine to ensure availability.
*   **Storage Status:** Verifies S3/Supabase storage bucket accessibility.
*   **AI Provider Status:** Pings the Vercel AI Gateway.

## 4. Observability Rules
*   **No Secret Leakage:** Health check responses must NEVER reveal raw database credentials, API tokens, or internal URLs.
*   **Durable Observability:** Telemetry must be stored in database tables or third-party observability streams. In-memory metrics alone do not qualify as production-grade observability.
